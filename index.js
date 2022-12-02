const { app, BrowserWindow, ipcMain } = require("electron");
var { exec } = require("child_process");
const ws = require("windows-shortcuts");
// const { setTimeout } = require("timers/promises");
const path = require("path");
const fs = require("fs");
const { Console } = require("console");

const root = process.env.APPDATA + "/aimware-loader";
const lnk = process.env.APPDATA + "/Microsoft/Windows/Start Menu/Programs/Aimware.lnk";
const isDev = process.env.NODE_ENV !== "production";
var first_run = false;
var win;

const createWindow = () => {
	win = new BrowserWindow({
		width: isDev ? 800 : 300,
		height: 350,
		transparent: true,
		resizable: isDev,
		hasShadow: false,
		frame: false,
		icon: "assets/logo.png",
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	if (isDev) win.webContents.openDevTools();

	// win.setIgnoreMouseEvents(true)
	if (first_run) win.loadFile("render/setup.html");
	else win.loadFile("render/index.html");
};

ipcMain.on("setup:start", (e, options) => {
	// console.log(options)

	if (!fs.existsSync(options.path))
		return console.log("Error: File dosent exist any more!");

	fs.mkdirSync(root, { recursive: true });

	fs.rename(options.path, root + "/aimware", function (err) {
		if (err)
			return console.log(
				"Error: Could not make a copy of the loader. Check if your AV."
			);
		// console.log('Copied ' + options.path + ' to ' + root + '/aimware')
	});

	ws.create(lnk, process.argv[0]);

	// win.loadFile('render/index.html')
	win.webContents.send("setup:done");
	win.loadFile("render/index.html");
	// console.log('Success: Setup finished!');
});

ipcMain.on("load:start", (e) => {
	win.webContents.send("load:running");
	console.log("load:running");

	if (!fs.existsSync(root))
		return console.log(
			"Error: Could not find the main folder. Open the program again."
		);

	if (!fs.existsSync(root + "/aimware"))
		return console.log(
			"Error: Could not find aimware loader. Please reinstall the program."
		);

	if (fs.existsSync(root + "/temp.exe")) fs.rmSync(root + "/temp.exe");

	fs.copyFile(root + "/aimware", root + "/temp.exe", (err) => {
		if (err)
			return console.log(
				"Error: Could not make a copy of the loader. Check if your AV and reinstall the program."
			);
	});

	setTimeout(function () {
		win.webContents.send("load:complete");
		if (fs.existsSync(root + "/temp.exe"))
			exec(`start ${root}/temp.exe`, function (err, data) {
				if (err)
					return console.log("Error: Could not run the loader: " + err.message);
			});
		setTimeout(function () {
			app.quit();
		}, 1000);
	}, 2000);
});

app.whenReady().then(() => {
	console.log(process.argv)
	if (process.argv.length > 1) {
		for (i = 1; i < process.argv.length; i++) {
			let argv = process.argv[i].toLowerCase();
			if (argv == "-u" || argv == "--uninstall") {
				if (fs.existsSync(root)) fs.rmSync(root, { recursive: true });
				if (fs.existsSync(lnk)) fs.rmSync(lnk);

				console.log("App successfully removed!");
				return app.quit();
			}
		}
	}

	if (!fs.existsSync(root) || !fs.existsSync(root + "/aimware")) {
		first_run = true;
	}

	createWindow();
});
