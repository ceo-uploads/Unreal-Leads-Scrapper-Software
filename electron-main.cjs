const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');
const net = require('net');

let mainWindow;
let serverProcess;

function logToFile(msg) {
  console.log(`[ELECTRON-MAIN] ${new Date().toISOString()} - ${msg}`);
}

/**
 * Checks if the server port is open
 */
function checkPort(port, host, callback) {
  const socket = new net.Socket();
  socket.setTimeout(500);
  socket.on('connect', () => {
    socket.destroy();
    callback(true);
  });
  socket.on('timeout', () => {
    socket.destroy();
    callback(false);
  });
  socket.on('error', () => {
    socket.destroy();
    callback(false);
  });
  socket.connect(port, host);
}

function waitForServer(port, callback) {
  logToFile(`Waiting for server on port ${port}...`);
  const interval = setInterval(() => {
    checkPort(port, '127.0.0.1', (isOpen) => {
      if (isOpen) {
        clearInterval(interval);
        logToFile(`Server is UP on port ${port}`);
        callback();
      }
    });
  }, 500);
}

function startServer() {
  const isProduction = !isDev;
  
  // Find server path
  let serverPath;
  if (isProduction) {
    // In production (bundled), it's inside the asar or next to it
    // Try multiple common locations
    const paths = [
      path.join(app.getAppPath(), 'dist', 'server.js'),
      path.join(process.resourcesPath, 'app', 'dist', 'server.js'),
      path.join(__dirname, 'dist', 'server.js')
    ];
    
    const fs = require('fs');
    serverPath = paths.find(p => fs.existsSync(p));
    
    if (!serverPath) {
      logToFile(`CRITICAL: server.js not found in expected paths: ${paths.join(', ')}`);
      // Fallback to one
      serverPath = paths[0];
    }
  } else {
    serverPath = path.join(__dirname, 'server.ts');
  }

  logToFile(`Starting server at: ${serverPath}`);

  const cmd = isProduction ? 'node' : 'npx';
  const args = isProduction ? [serverPath] : ['tsx', serverPath];

  serverProcess = spawn(cmd, args, {
    env: { 
      ...process.env, 
      NODE_ENV: isProduction ? 'production' : 'development',
      PORT: '3000'
    },
    shell: true
  });

  serverProcess.stdout.on('data', (data) => console.log(`Server: ${data}`));
  serverProcess.stderr.on('data', (data) => console.error(`Server Error: ${data}`));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: "LuminaLeads Pro OS",
    icon: path.join(__dirname, 'public', 'favicon.ico'),
    webPreferences: {
      nodeIntegration: true, // Reverting to user setup
      contextIsolation: false, // Reverting to user setup
      webSecurity: false // Often needed for local servers in Electron
    },
    backgroundColor: '#000000',
    show: false
  });

  // Always load from localhost to ensure Express handles all routes/APIs correctly
  const startURL = 'http://localhost:3000';

  // Timeout fail-safe
  const timeout = setTimeout(() => {
    logToFile('Server wait timeout! Attempting load anyway...');
    mainWindow.loadURL(startURL);
    mainWindow.show();
  }, 10000);

  waitForServer(3000, () => {
    clearTimeout(timeout);
    mainWindow.loadURL(startURL);
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      // Only open dev tools in dev mode
      if (isDev) mainWindow.webContents.openDevTools();
    });
  });

  mainWindow.on('closed', () => (mainWindow = null));
}

app.on('ready', () => {
  startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  if (serverProcess) serverProcess.kill();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
