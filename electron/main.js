const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let pyProc = null;

const createPyProc = () => {
  let script = path.join(__dirname, '..', 'dist-python', 'api_server', 'api_server.exe');
  
  // For development (if the exe is not built yet, you could fallback to python, but we will assume it's built or we're running the built app)
  if (process.env.NODE_ENV === 'development') {
    script = path.join(__dirname, '..', 'venv', 'Scripts', 'python.exe');
    pyProc = spawn(script, [path.join(__dirname, '..', 'run_backend.py')]);
  } else {
    // Check if the onefile exe exists (pyinstaller usually puts it in dist/api_server.exe)
    script = path.join(__dirname, '..', 'dist', 'api_server.exe');
    pyProc = spawn(script, []);
  }

  if (pyProc != null) {
    console.log('Backend spawned successfully');
    pyProc.stdout.on('data', (data) => console.log(`Backend: ${data}`));
    pyProc.stderr.on('data', (data) => console.error(`Backend Error: ${data}`));
  }
};

const exitPyProc = () => {
  if (pyProc) {
    pyProc.kill();
    pyProc = null;
  }
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    show: false // Don't show until ready
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const pollBackend = (retries = 20, delay = 500) => {
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get('http://127.0.0.1:8000/', (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          retry();
        }
      }).on('error', retry);
    };

    const retry = () => {
      if (retries === 0) reject(new Error('Backend timeout'));
      retries--;
      setTimeout(check, delay);
    };

    check();
  });
};

app.whenReady().then(async () => {
  createPyProc();
  
  try {
    await pollBackend();
    createWindow();
  } catch (error) {
    console.error('Failed to connect to backend', error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', exitPyProc);
