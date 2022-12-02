const btn = document.querySelector('#add-btn');

function doSetUp(e) {
	const file = e.target.files[0]; // {name: '', path: ''}
	const filename = file.name
	const path = file.path

	ipcRenderer.send('setup:start', {
		filename,
		path
	});

	ipcRenderer.on('steup:done', () => // IK This is bozo...
		alert('Setup finished successfully. Starting to load...'), 
		ipcRenderer.send('load:start')
	);
}

function alert(message, success = true) {
	Toastify.toast({
	  text: message,
	  duration: 5000,
	  close: false,
	  style: success ? {
		background: 'green',
		color: 'white',
		textAlign: 'center',
	  } : {
		background: 'red',
		color: 'white',
		textAlign: 'center',
	  },
	});
  }


btn.addEventListener('change', doSetUp);