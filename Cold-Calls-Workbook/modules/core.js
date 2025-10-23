// ================================================
// CORE UTILITIES & CONSTANTS
// ================================================

// DOM shortcuts
const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));
const esc = (str) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Storage keys
const KEY = 'wsre_cold_call_v7';
const DEV_KEY = 'wsre_cold_call_dev_v7';

// Global state
let developerMode = false;
let devLogs = [];
let undoStack = [];
let redoStack = [];

// Developer logging
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
    const content = qs('#dev-log-content');
    if (content) content.textContent = logText;
  }
}

// Toast notifications
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #1e293b;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 100000;
    opacity: 0;
    transition: opacity 0.3s ease;
    font-size: 14px;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.style.opacity = '1', 10);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3000);
}

// Date/time helpers
function nowStamp() {
  return new Date().toLocaleString();
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

console.log('✅ Core module loaded');
