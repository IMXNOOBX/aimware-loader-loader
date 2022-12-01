const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const fs = require('fs')

const root = process.env.APPDATA + "/aimware-ll"
const isDev = process.env.NODE_ENV !== 'production';
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
			preload: path.join(__dirname, 'preload.js'),
		},
	})

	if (isDev) 
		win.webContents.openDevTools();
	
	// win.setIgnoreMouseEvents(true)
	if(first_run)
		win.loadFile('render/setup.html')
	else
		win.loadFile('render/index.html')
}

ipcMain.on('setup:start', (e, options) => {
	console.log(options)
	
	if(!fs.existsSync(options.path))
		return;

	fs.mkdirSync(root, { recursive: true });

	fs.rename(options.path, root + '/aimware', function (err) {
		if (err) throw err
		console.log('Copied ' + options.path + ' to ' + root + '/aimware')
	})

	win.loadFile('render/index.html')
});

app.whenReady().then(() => {
	if (!fs.existsSync(root) || !fs.existsSync(root + '/aimware')) {
		first_run = true
	}
	if (process.argv.length > 1) {
		for (i = 1; i < process.argv.length; i++) {
			let argv = process.argv[i].toLowerCase()
			if (argv == "-u" || argv == "--uninstall") {
				console.log('Uninstall app!')
				if(fs.existsSync(root))
					fs.rmdirSync(root)
			}
		}
	}
	createWindow()

	if (fs.existsSync(root + '/aimware')) {		
		fs.copyFile(root + '/aimware', root + '/temp.exe', (err) => {
			if (err) throw err;
			//console.log('source.txt was copied to destination.txt');
		});
	}

})