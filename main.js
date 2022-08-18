// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
var http = require('http');
var fs = require('fs');
const util = require('util')




// Build the OAuth consent page URL
const createAuthWindow = () => {
var authWindow = new BrowserWindow({
  width: 800,
  height: 600,
  show: false,
	resizable: false,
	webPreferences: {
		nodeIntegration: true,
		contextIsolation: false
	}
});
return authWindow;
};


const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true,
			contextIsolation: false,
    }
  })

  // et charger l'index.html de l'application.
  mainWindow.loadFile('index.html')

  // Ouvrir les outils de développement.
  // mainWindow.webContents.openDevTools()
}

// Cette méthode sera appelée quand Electron aura fini
// de s'initialiser et sera prêt à créer des fenêtres de navigation.
// Certaines APIs peuvent être utilisées uniquement quant cet événement est émit.
app.whenReady().then(() => {
	let Keycloak;

	
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });

	ipcMain.on('keycloak-token', (event, token) => {
		console.log(token);
		authWindow.close();
		Keycloak.close();
	});

	ipcMain.on('keycloak-login', () => {
		Keycloak = http.createServer((request, response) => {
			response.writeHeader(200, {"Content-Type": "text/html"});  
			var readSream = fs.createReadStream('__static' + '/index.html','utf8')
			readSream.pipe(response);
		});
		Keycloak.listen(3000);
		authWindow = createAuthWindow();

		authWindow.loadURL('http://localhost:3000');
		authWindow.show();
		let cookies = authWindow.webContents.session.cookies;
			cookies.on('changed', function(event, cookie, cause, removed) {
				if (cookie.session && !removed) {
					let url = util.format('%s://%s%s', (!cookie.httpOnly && cookie.secure) ? 'https' : 'http', cookie.domain, cookie.path);
					console.log('url', url);
					cookies.set({
						url: url,
						name: cookie.name,
						value: cookie.value,
						domain: cookie.domain,
						path: cookie.path,
						// secure: cookie.secure,
						httpOnly: cookie.httpOnly,
						expirationDate: new Date().setDate(new Date().getDate() + 14)
					}, function(err) {
						if (err) {
							log.error('Error trying to persist cookie', err, cookie);
						}
					});
				}
			});

			// Reset the authWindow on close
		authWindow.on(
			'close',
			function() {
				authWindow = null;
			},
			false
		);
	});
})

// Quitter quand toutes les fenêtres sont fermées, sauf sur macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	console.log('all closed');
  if (process.platform !== 'darwin') app.quit()
})



// In this file you can include the rest of your app's specific main process
// code. Vous pouvez également le mettre dans des fichiers séparés et les inclure ici.