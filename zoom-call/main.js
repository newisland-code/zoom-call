const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const net = require('net');

let mainWindow;
let serverProcess;
let httpServer;

const gotTheLock = app.requestSingleInstanceLock();

function checkPortInUse(port, callback) {
  const tester = net.createServer()
    .once('error', err => (err.code === 'EADDRINUSE' ? callback(true) : callback(false)))
    .once('listening', () => tester.once('close', () => callback(false)).close())
    .listen(port);
}

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1000,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true
      }
    });

    mainWindow.webContents.openDevTools();

    mainWindow.webContents.on('did-fail-load', (event, code, desc) => {
      console.error('❌ ページ読み込みエラー:', desc);
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:8080/single.html');
      }, 2000);
    });

    mainWindow.loadURL('http://localhost:8080/single.html');

    mainWindow.on('closed', () => {
      if (serverProcess) serverProcess.kill();
      if (httpServer) httpServer.kill();
      mainWindow = null;
    });
  }

  app.whenReady().then(() => {
    // 3000番ポート使用確認 → server.js 起動
    checkPortInUse(3000, (isUsed3000) => {
      if (!isUsed3000) {
        const serverPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'server.js');
        serverProcess = spawn(process.execPath, [serverPath], {
          cwd: process.resourcesPath,
          stdio: 'pipe',
          detached: true
        });

        serverProcess.stdout.on('data', d => {
          console.log('[server.js stdout]', d.toString());
        });
        serverProcess.stderr.on('data', d => {
          console.error('[server.js error]', d.toString());
        });
        serverProcess.on('error', err => {
          console.error('[server.js failed]', err);
        });
        serverProcess.unref();
      } else {
        console.warn('⚠️ ポート3000は使用中のため server.js 起動をスキップ');
      }

      // 8080ポート確認 → http-server 起動
      checkPortInUse(8080, (isUsed8080) => {
        if (!isUsed8080) {
          const staticPath = path.join(process.resourcesPath, 'app.asar.unpacked');
          httpServer = spawn('npx', ['http-server', staticPath, '-p', '8080', '--cors'], {
            shell: true,
            stdio: 'pipe',
            detached: true
          });

          httpServer.stdout.on('data', d => {
            console.log('[http-server]', d.toString());
          });
          httpServer.stderr.on('data', d => {
            console.error('[http-server error]', d.toString());
          });
          httpServer.on('error', err => {
            console.error('[http-server failed]', err);
          });
          httpServer.unref();
        } else {
          console.warn('⚠️ ポート8080は使用中のため http-server 起動をスキップ');
        }

        // 画面表示
        setTimeout(() => {
          createWindow();
        }, 2000);
      });
    });
  });

  app.on('window-all-closed', () => {
    if (serverProcess) serverProcess.kill();
    if (httpServer) httpServer.kill();
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('before-quit', () => {
    if (serverProcess) serverProcess.kill();
    if (httpServer) httpServer.kill();
  });

  app.on('activate', () => {
    if (mainWindow === null) createWindow();
  });
}
