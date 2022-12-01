const { app, BrowserWindow } = require('electron')
// const p_argv = require('electron').remote.process.argv
const fs = require('fs')

const createWindow = () => {

	const win = new BrowserWindow({
		width: 300,
		height: 350,
		transparent: false,
		resizable: false,
		hasShadow: false,
		frame: false,
		webPreferences: {
			devTools: false
		},
	})

	// win.setIgnoreMouseEvents(true)
	win.loadFile('index.html')
}

app.whenReady().then(() => {
	if (process.argv.length > 1) {
		for (i = 1; i < process.argv.length; i++) {
			let argv = process.argv[i]
			if (fs.existsSync(argv) && argv.search(/.*\\.exe/)) {
				console.log('Do something with: ', argv)
			}
		}
	}
	createWindow()
})