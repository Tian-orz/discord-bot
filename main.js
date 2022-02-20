const { app, BrowserWindow, Menu, globalShortcut } = require("electron");
const path = require("path");
const Store = require('electron-store');
const store = new Store();
require("./src/main/ipc")

try {
    require('electron-reloader')(module,{});
  } catch (_) {}

// 创建窗口
const createWindow = () => {
  const window = new BrowserWindow({
    width: 800,
    height: 500,
    minWidth: 790,
    minHeight: 490,
    // maxWidth: 800,
    // maxHeight: 600,
    webPreferences: {
    // 开启渲染进程使用node
    nodeIntegration: true,
    contextIsolation: false,
    },
  });
  window.loadFile(path.join(__dirname, "./src/renderer/index.html"));
  const template = [];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  return window;
};
app.whenReady().then(() => {
  const mainWindow = createWindow();
  global.mainWindow = mainWindow
  // 在开发环境和生产环境均可通过快捷键打开devTools
  globalShortcut.register('CommandOrControl+Shift+i', function () {
	  mainWindow.webContents.openDevTools()
  })
  // mainWindow.webContents.openDevTools();
  global.mainWindow = mainWindow;
  start()
});
app.on("window-all-closed", () => {
  app.quit();
});