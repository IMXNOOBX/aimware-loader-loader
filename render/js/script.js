const btn = document.querySelector('#add-btn');


function doSetUp(e) {
	const file = e.target.files[0]; // {name: '', path: ''}
	const filename = file.name
	const path = file.path

	ipcRenderer.send('setup:start', {
		filename,
		path
	});
}

btn.addEventListener('change', doSetUp);