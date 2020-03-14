const {
    app,
    BrowserWindow
} = require('electron');
const path = require('path');
const url = require('url');

let win;

createWindow = () => {
    win = new BrowserWindow({
        transparent: true,
        // fullscreen: true,
        // maximizable: true,

        width: 800,
        height: 600,
        icon: __dirname + '/img/img.png',
        webPreferences: {
            nodeIntegration: true
        },
        // frame: false,
        resizable: true,
        // zoomToPageWidth: true
    })

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    }))

    win.webContents.openDevTools()

    win.on('close', () => {
        win = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })
    // export { app }