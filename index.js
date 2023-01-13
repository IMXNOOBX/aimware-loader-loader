const { app, BrowserWindow, ipcMain } = require("electron");
const notifier = require('node-notifier');
var { exec } = require("child_process");
const ws = require("windows-shortcuts");
var fse = require('fs-extra');
const path = require("path");
const fs = require("fs");

const root = process.env.APPDATA + "/aimware-loader";
const lnk = process.env.APPDATA + "/Microsoft/Windows/Start Menu/Programs/Aimware.lnk";
const lnk_u = process.env.APPDATA + "/Microsoft/Windows/Start Menu/Programs/Aimware-uninstall.lnk";
const developer = false; // set it manually
var should_setup = false;
var win;

const createWindow = () => {
	win = new BrowserWindow({
		width: developer ? 800 : 300,
		height: 350,
		transparent: true,
		resizable: developer,
		hasShadow: false,
		frame: false,
		icon: "assets/logo.png",
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	if (developer) win.webContents.openDevTools();

	// win.setIgnoreMouseEvents(true)
	if (should_setup) win.loadFile("render/setup.html");
	else win.loadFile("render/index.html");
};

function windowsNotify(title, message) {
	notifier.notify({ 
		title, 
		message, 
		icon: path.join(root, 'assets/logo.png'), 
		sound: false, 
		timeout: 3,
		appID: 'Aimware-loader-loader',
	});
}

ipcMain.on("setup:start", (e, options) => {

	if (!fs.existsSync(options.path))
		return windowsNotify('Error', 'File dosent exist any more!')

	fs.mkdirSync(root, { recursive: true });

	exec(`xcopy /e /k /h /i . "${root}"`, function (err, data) {
		if (err)
			return windowsNotify('Error', `Could not copy the loader: ${err.message}`) 
	});

	fs.rename(options.path, root + "/aimware", function (err) {
		if (err)
			return windowsNotify('Error', `Could not make a copy of the loader. Check if your AV.`) 
	});

	ws.create(lnk, root + '/Aimware-loader-loader.exe');
	ws.create(lnk_u, { target: root + '/Aimware-loader-loader.exe', args: '--uninstall' });

	windowsNotify('Success!', `Set up done! Enjoy the loader!`)
	win.loadFile("render/index.html");
});

ipcMain.on("load:start", (e) => {
	win.webContents.send("load:running");

	if (!fs.existsSync(root))
		return windowsNotify('Error', `Could not find the main folder. Open the program again.`) 

	if (!fs.existsSync(root + "/aimware"))
		return windowsNotify('Error', `Could not find aimware loader. Please reinstall the program.`) 

	if (fs.existsSync(root + "/temp.exe")) fs.rmSync(root + "/temp.exe");

	fs.copyFile(root + "/aimware", root + "/temp.exe", (err) => {
		if (err)
			return windowsNotify('Error', `Could not make a copy of the loader. Check if your AV and reinstall the program.`) 
	});

	setTimeout(function () {
		win.webContents.send("load:complete");
		if (fs.existsSync(root + "/temp.exe"))
			exec(`"${root}/temp.exe"`, function (err, data) {
				if (err)
					return windowsNotify('Error', `Could not run the loader: ${err.message}`) 
			});
			windowsNotify('Success!', `Loading Succesfull!`)
		setTimeout(function () {
			// app.quit();
			win.hide()
			setTimeout(function () { app.quit() }, 5000);
		}, 1000);
	}, 2000);
});

app.whenReady().then(() => {
	// console.log(process.argv)
	if (process.argv.length > 1) {
		for (i = 1; i < process.argv.length; i++) {
			let argv = process.argv[i].toLowerCase();
			if (argv == "-u" || argv == "--uninstall") {
				if (fs.existsSync(root)) fs.rmSync(root, { recursive: true });
				if (fs.existsSync(lnk)) fs.rmSync(lnk);
				if (fs.existsSync(lnk_u)) fs.rmSync(lnk_u);

				windowsNotify('Success!', `App successfully removed!`) 
				return app.quit();
			}
		}
	}

	if (!fs.existsSync(root) || !fs.existsSync(root + "/aimware")) {
		should_setup = true;
	}

	createWindow();
});
