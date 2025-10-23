// Developer mode UI and controls

function setupDeveloperUI() {
  devLog('🔧 setupDeveloperUI() called');
  
  try {
    developerMode = true;
    devLog('✅ Developer mode ENABLED');
    
    // Create developer toolbar
    let toolbar = qs('#developer-toolbar');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.id = 'developer-toolbar';
      toolbar.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 20px; z-index: 10000; box-shadow: 0 2px 10px rgba(0,0,0,0.2); display: flex; gap: 10px; align-items: center; flex-wrap: wrap;';
      document.body.appendChild(toolbar);
      devLog('✅ Created developer toolbar');
    }
    
    toolbar.innerHTML = '';
    
    // Title
    const title = document.createElement('span');
    title.textContent = '🛠️ Developer Mode';
    title.style.cssText = 'font-weight: 600; font-size: 16px; margin-right: auto;';
    toolbar.appendChild(title);
    
    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾 Save';
    saveBtn.style.cssText = 'background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;';
    saveBtn.addEventListener('click', () => {
      devLog('💾 Save button clicked');
      saveDeveloperData();
    });
    toolbar.appendChild(saveBtn);
    
    // Load button
    const loadBtn = document.createElement('button');
    loadBtn.textContent = '📂 Load';
    loadBtn.style.cssText = 'background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;';
    loadBtn.addEventListener('click', () => {
      devLog('📂 Load button clicked');
      loadDeveloperData();
    });
    toolbar.appendChild(loadBtn);
    
    // Undo button
    const undoBtn = document.createElement('button');
    undoBtn.textContent = '↶ Undo';
    undoBtn.style.cssText = 'background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;';
    undoBtn.addEventListener('click', () => {
      devLog('↶ Undo button clicked');
      undo();
    });
    toolbar.appendChild(undoBtn);
    
    // Redo button
    const redoBtn = document.createElement('button');
    redoBtn.textContent = '↷ Redo';
    redoBtn.style.cssText = 'background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;';
    redoBtn.addEventListener('click', () => {
      devLog('↷ Redo button clicked');
      redo();
    });
    toolbar.appendChild(redoBtn);
    
    // Download log button
    const downloadLogBtn = document.createElement('button');
    downloadLogBtn.textContent = '📥 Download Log';
    downloadLogBtn.style.cssText = 'background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;';
    downloadLogBtn.addEventListener('click', downloadLog);
    toolbar.appendChild(downloadLogBtn);
    
    // Clear log button
    const clearLogBtn = document.createElement('button');
    clearLogBtn.textContent = '🗑️ Clear Log';
    clearLogBtn.style.cssText = 'background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;';
    clearLogBtn.addEventListener('click', clearLog);
    toolbar.appendChild(clearLogBtn);
    
    // Exit button
    const exitBtn = document.createElement('button');
    exitBtn.textContent = '❌ Exit Dev Mode';
    exitBtn.style.cssText = 'background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;';
    exitBtn.addEventListener('click', () => {
      devLog('❌ Exit Dev Mode clicked');
      removeDeveloperUI();
    });
    toolbar.appendChild(exitBtn);
    
    // Create dev log panel
    let logPanel = qs('#dev-log-panel');
    if (!logPanel) {
      logPanel = document.createElement('div');
      logPanel.id = 'dev-log-panel';
      logPanel.style.cssText = 'position: fixed; bottom: 20px; right: 20px; width: 400px; height: 300px; background: #1e293b; color: #e2e8f0; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 10000; display: flex; flex-direction: column; overflow: hidden;';
      document.body.appendChild(logPanel);
      devLog('✅ Created dev log panel');
    }
    
    logPanel.innerHTML = `
      <div style="background: #334155; padding: 10px; font-weight: 600; cursor: move; display: flex; align-items: center; justify-content: space-between;" id="log-panel-header">
        <span>📋 Developer Log</span>
        <button id="toggle-log-panel" style="background: #475569; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">−</button>
      </div>
      <pre id="dev-log-content" style="flex: 1; overflow-y: auto; padding: 10px; margin: 0; font-size: 11px; font-family: 'Courier New', monospace; background: #0f172a;"></pre>
    `;
    
    // Make draggable
    const header = qs('#log-panel-header');
    let isDragging = false;
    let currentX, currentY, initialX, initialY;
    
    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      initialX = e.clientX - logPanel.offsetLeft;
      initialY = e.clientY - logPanel.offsetTop;
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        logPanel.style.left = currentX + 'px';
        logPanel.style.top = currentY + 'px';
        logPanel.style.bottom = 'auto';
        logPanel.style.right = 'auto';
      }
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    // Toggle log panel
    qs('#toggle-log-panel').addEventListener('click', () => {
      const content = qs('#dev-log-content');
      if (content.style.display === 'none') {
        content.style.display = 'block';
        qs('#toggle-log-panel').textContent = '−';
        logPanel.style.height = '300px';
      } else {
        content.style.display = 'none';
        qs('#toggle-log-panel').textContent = '+';
        logPanel.style.height = 'auto';
      }
    });
    
    updateDevLogDisplay();
    
    // Add green section buttons
    addGreenSectionButtons();
    
    // Add prompt controls to all existing prompts
    const prompts = qsa('.prompt');
    devLog(`🔧 Adding controls to ${prompts.length} existing prompts`);
    prompts.forEach(p => addPromptControls(p));
    
    devLog('✅ Developer UI setup complete');
    showToast('Developer mode enabled!');
    
  } catch (err) {
    devLog(`❌ Error in setupDeveloperUI: ${err.message}`);
    console.error('Developer UI error:', err);
  }
}

function removeDeveloperUI() {
  devLog('🧹 removeDeveloperUI() called');
  
  try {
    developerMode = false;
    devLog('❌ Developer mode DISABLED');
    
    // Remove toolbar
    const toolbar = qs('#developer-toolbar');
    if (toolbar) {
      toolbar.remove();
      devLog('✅ Removed toolbar');
    }
    
    // Remove log panel
    const logPanel = qs('#dev-log-panel');
    if (logPanel) {
      logPanel.remove();
      devLog('✅ Removed log panel');
    }
    
    // Remove all prompt controls
    const controls = qsa('.prompt-controls');
    devLog(`🧹 Removing ${controls.length} prompt controls`);
    controls.forEach(c => c.remove());
    
    // Remove all "Add Question After" buttons
    const afterBtns = qsa('.add-question-after');
    devLog(`🧹 Removing ${afterBtns.length} "Add Question After" buttons`);
    afterBtns.forEach(b => b.remove());
    
    // Remove all green section buttons
    const greenBtns = qsa('.green-add-section-btn');
    devLog(`🧹 Removing ${greenBtns.length} green section buttons`);
    greenBtns.forEach(b => b.remove());
    
    // Remove all green section button containers
    const containers = qsa('.green-section-btn-container');
    devLog(`🧹 Removing ${containers.length} green button containers`);
    containers.forEach(c => c.remove());
    
    devLog('✅ Developer UI removed completely');
    showToast('Developer mode exited');
    
  } catch (err) {
    devLog(`❌ Error in removeDeveloperUI: ${err.message}`);
    console.error('Remove UI error:', err);
  }
}

function addPromptControls(prompt) {
  devLog('🔧 addPromptControls() called');
  
  try {
    const q = prompt.closest('.q');
    if (!q) {
      devLog('❌ No parent .q found');
      return;
    }
    
    // Remove existing controls
    const existing = prompt.previousElementSibling;
    if (existing && existing.classList.contains('prompt-controls')) {
      existing.remove();
      devLog('🧹 Removed existing controls');
    }
    
    const controls = document.createElement('div');
    controls.className = 'prompt-controls';
    controls.style.cssText = 'background: #e0e0e0; border: 1px solid #ccc; padding: 8px; margin: 5px 0; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; border-radius: 8px;';
    
    // Add Question button
    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Question Here';
    addBtn.style.cssText = 'background: #2196F3; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 6px; font-size: 13px;';
    addBtn.addEventListener('click', () => {
      devLog('🔵 Add Question Here clicked');
      addPromptBefore(prompt);
    });
    controls.appendChild(addBtn);
    
    // Delete Question button
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete Question';
    delBtn.style.cssText = 'background: #f44336; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 6px; font-size: 13px;';
    delBtn.addEventListener('click', () => {
      devLog('🔴 Delete Question clicked');
      deletePrompt(prompt);
    });
    controls.appendChild(delBtn);
    
    // Token insertion label
    const tokenLabel = document.createElement('span');
    tokenLabel.textContent = 'Insert Token:';
    tokenLabel.style.cssText = 'margin-left: auto; font-size: 12px; font-weight: 600; color: #64748b;';
    controls.appendChild(tokenLabel);
    
    // Token buttons
    const tokens = [
      { name: 'Prospect', value: '[prospect]' },
      { name: 'Your Name', value: '[name]' },
      { name: 'Street', value: '[street name]' }
    ];
    
    tokens.forEach(token => {
      const tokenBtn = document.createElement('button');
      tokenBtn.textContent = token.name;
      tokenBtn.style.cssText = 'background: #0f766e; color: white; border: none; padding: 4px 10px; cursor: pointer; border-radius: 4px; font-size: 12px;';
      tokenBtn.addEventListener('click', () => {
        devLog(`🎯 Token inserted: ${token.value}`);
        insertTokenAtCursor(prompt, token.value);
      });
      controls.appendChild(tokenBtn);
    });
    
    q.insertBefore(controls, prompt);
    
    // Add "Add Question Here" button if this is the last prompt
    const prompts = q.querySelectorAll('.prompt');
    const index = Array.from(prompts).indexOf(prompt);
    
    if (index === prompts.length - 1) {
      const addAfterBtn = document.createElement('button');
      addAfterBtn.className = 'add-question-after';
      addAfterBtn.textContent = 'Add Question Here';
      addAfterBtn.style.cssText = 'background: #2196F3; color: white; border: none; padding: 6px 12px; cursor: pointer; margin: 5px 0; border-radius: 6px; font-size: 13px;';
      addAfterBtn.addEventListener('click', () => {
        devLog('🔵 Add Question Here (after) clicked');
        addPromptAfter(prompt);
      });
      q.insertBefore(addAfterBtn, prompt.nextSibling);
    }
    
    devLog('✅ Prompt controls added');
    
  } catch (err) {
    devLog(`❌ Error adding prompt controls: ${err.message}`);
    console.error('Add prompt controls error:', err);
  }
}

function insertTokenAtCursor(prompt, tokenValue) {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    if (prompt.contains(range.commonAncestorContainer)) {
      range.deleteContents();
      const textNode = document.createTextNode(tokenValue);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      prompt.textContent = prompt.textContent + ' ' + tokenValue;
    }
  } else {
    prompt.textContent = prompt.textContent + ' ' + tokenValue;
  }
  prompt.setAttribute('data-tpl', prompt.textContent.trim());
  saveDeveloperData();
}

function addPromptBefore(targetPrompt) {
  devLog('➕ addPromptBefore() called');
  
  try {
    const q = targetPrompt.closest('.q');
    if (!q) {
      devLog('❌ No parent .q found');
      return;
    }
    
    const newPrompt = document.createElement('div');
    newPrompt.className = 'prompt';
    newPrompt.setAttribute('contenteditable', 'true');
    newPrompt.setAttribute('data-tpl', 'New question here');
    newPrompt.textContent = 'New question here';
    
    let insertBefore = targetPrompt;
    const prevSibling = targetPrompt.previousElementSibling;
    if (prevSibling && prevSibling.classList.contains('prompt-controls')) {
      insertBefore = prevSibling;
    }
    
    q.insertBefore(newPrompt, insertBefore);
    
    // Rebuild all controls
    q.querySelectorAll('.prompt-controls').forEach(c => c.remove());
    q.querySelectorAll('.add-question-after').forEach(b => b.remove());
    
    const allPrompts = q.querySelectorAll('.prompt');
    allPrompts.forEach(p => addPromptControls(p));
    
    saveDeveloperData();
    devLog('✅ Prompt added before');
    
  } catch (err) {
    devLog(`❌ Error in addPromptBefore: ${err.message}`);
    console.error('Add prompt before error:', err);
  }
}

function addPromptAfter(targetPrompt) {
  devLog('➕ addPromptAfter() called');
  
  try {
    const q = targetPrompt.closest('.q');
    if (!q) {
      devLog('❌ No parent .q found');
      return;
    }
    
    const newPrompt = document.createElement('div');
    newPrompt.className = 'prompt';
    newPrompt.setAttribute('contenteditable', 'true');
    newPrompt.setAttribute('data-tpl', 'New question here');
    newPrompt.textContent = 'New question here';
    
    let insertBefore = targetPrompt.nextElementSibling;
    while (insertBefore && (insertBefore.classList.contains('prompt-controls') || insertBefore.classList.contains('add-question-after'))) {
      insertBefore = insertBefore.nextElementSibling;
    }
    
    if (insertBefore) {
      q.insertBefore(newPrompt, insertBefore);
    } else {
      q.appendChild(newPrompt);
    }
    
    // Rebuild all controls
    q.querySelectorAll('.prompt-controls').forEach(c => c.remove());
    q.querySelectorAll('.add-question-after').forEach(b => b.remove());
    
    const allPrompts = q.querySelectorAll('.prompt');
    allPrompts.forEach(p => addPromptControls(p));
    
    saveDeveloperData();
    devLog('✅ Prompt added after');
    
  } catch (err) {
    devLog(`❌ Error in addPromptAfter: ${err.message}`);
    console.error('Add prompt after error:', err);
  }
}

function deletePrompt(prompt) {
  devLog('🗑️ deletePrompt() called');
  
  try {
    const q = prompt.closest('.q');
    if (!q) {
      devLog('❌ No parent .q found');
      return;
    }
    
    const controls = prompt.previousElementSibling;
    if (controls && controls.classList.contains('prompt-controls')) {
      controls.remove();
    }
    
    prompt.remove();
    
    const remainingPrompts = q.querySelectorAll('.prompt');
    if (remainingPrompts.length === 0) {
      const defaultPrompt = document.createElement('div');
      defaultPrompt.className = 'prompt';
      defaultPrompt.setAttribute('contenteditable', 'true');
      defaultPrompt.setAttribute('data-tpl', 'New question here');
      defaultPrompt.textContent = 'New question here';
      q.appendChild(defaultPrompt);
      addPromptControls(defaultPrompt);
    } else {
      // Rebuild all controls
      q.querySelectorAll('.prompt-controls').forEach(c => c.remove());
      q.querySelectorAll('.add-question-after').forEach(b => b.remove());
      remainingPrompts.forEach(p => addPromptControls(p));
    }
    
    saveDeveloperData();
    devLog('✅ Prompt deleted');
    
  } catch (err) {
    devLog(`❌ Error in deletePrompt: ${err.message}`);
    console.error('Delete prompt error:', err);
  }
}

function undo() {
  if (undoStack.length === 0) {
    showToast('Nothing to undo');
    return;
  }
  const state = undoStack.pop();
  redoStack.push(getCurrentState());
  restoreState(state);
  showToast('Undo successful');
}

function redo() {
  if (redoStack.length === 0) {
    showToast('Nothing to redo');
    return;
  }
  const state = redoStack.pop();
  undoStack.push(getCurrentState());
  restoreState(state);
  showToast('Redo successful');
}

function getCurrentState() {
  return document.body.innerHTML;
}

function restoreState(state) {
  document.body.innerHTML = state;
}

function downloadLog() {
  devLog('📥 Downloading log...');
  const logText = devLogs.join('\n');
  const blob = new Blob([logText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dev-log-${new Date().toISOString().replace(/:/g, '-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Log downloaded!');
}

function clearLog() {
  devLog('🗑️ Clearing log...');
  devLogs = [];
  updateDevLogDisplay();
  showToast('Log cleared!');
}

console.log('✅ Developer UI module loaded');
