// Core utilities and constants
const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));
const esc = (str) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const KEY = 'seller_call_workbook_v615';
const DEV_KEY = 'seller_call_developer_v615';

let developerMode = false;
let devLogs = [];
let undoStack = [];
let redoStack = [];

function devLog(message) {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;
  devLogs.push(logEntry);
  console.log(logEntry);
  updateDevLogDisplay();
}

function updateDevLogDisplay() {
  const panel = qs('#dev-log-panel');
  if (panel) {
    const logText = devLogs.join('\n');
    qs('#dev-log-content').textContent = logText;
  }
}

function showToast(message) {
  devLog('Toast: ' + message);
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.right = '20px';
  toast.style.background = '#333';
  toast.style.color = '#fff';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '5px';
  toast.style.zIndex = '10000';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s';
  document.body.appendChild(toast);
  setTimeout(() => toast.style.opacity = '1', 10);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
}
