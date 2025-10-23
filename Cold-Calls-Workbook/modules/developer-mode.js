// ================================================
// DEVELOPER MODE - Full editing capabilities
// ================================================

// Preset management functions
function savePreset() {
  const presetName = prompt('Enter a name for this preset:');
  if (!presetName) return;
  
  // Collect all data
  const preset = {
    name: presetName,
    timestamp: new Date().toISOString(),
    data: {
      scriptSections: JSON.parse(JSON.stringify(scriptSections)),
      userInputs: {},
      developerData: localStorage.getItem(DEV_KEY)
    }
  };
  
  // Collect all user inputs
  qsa('[data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      preset.data.userInputs[key] = el.value;
    }
  });
  
  // Collect active chips
  preset.data.activeChips = {};
  qsa('.chips button.active').forEach(btn => {
    const key = btn.closest('.chips').getAttribute('data-key');
    preset.data.activeChips[key] = btn.getAttribute('data-val');
  });
  
  // Download as JSON file
  const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wsre-preset-${presetName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast(`✅ Preset "${presetName}" saved!`);
  devLog(`Preset saved: ${presetName}`);
}

function loadPreset() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const preset = JSON.parse(text);
      
      if (!preset.data || !preset.data.scriptSections) {
        throw new Error('Invalid preset file');
      }
      
      // Confirm before loading
      if (!confirm(`Load preset "${preset.name}"? This will replace your current script configuration.`)) {
        return;
      }
      
      // Update scriptSections
      scriptSections.length = 0;
      scriptSections.push(...preset.data.scriptSections);
      
      // Save to developer storage
      if (preset.data.developerData) {
        localStorage.setItem(DEV_KEY, preset.data.developerData);
      }
      
      // Re-render
      renderSections();
      setupEventHandlers();
      
      // Restore user inputs
      if (preset.data.userInputs) {
        Object.keys(preset.data.userInputs).forEach(key => {
          const el = qs(`[data-key="${key}"]`);
          if (el) el.value = preset.data.userInputs[key];
        });
      }
      
      // Restore active chips
      if (preset.data.activeChips) {
        Object.keys(preset.data.activeChips).forEach(key => {
          const val = preset.data.activeChips[key];
          const btn = qs(`.chips[data-key="${key}"] button[data-val="${val}"]`);
          if (btn) btn.classList.add('active');
        });
      }
      
      updateTokens();
      updateNotesSummary();
      
      showToast(`✅ Preset "${preset.name}" loaded!`);
      devLog(`Preset loaded: ${preset.name}`);
      
    } catch (err) {
      alert('Error loading preset: ' + err.message);
      console.error(err);
    }
  };
  
  input.click();
}

function setDefaultPreset() {
  if (!confirm('Set current configuration as the default? This will replace the default script on page load.')) {
    return;
  }
  
  // Save current scriptSections as the new default
  const newDefault = JSON.stringify(scriptSections, null, 2);
  
  // We'll need to update script-content.js
  // For now, save it to a special localStorage key
  localStorage.setItem('wsre_default_preset', newDefault);
  
  showToast('✅ Default preset updated! (Saved to localStorage)');
  devLog('Default preset set from current configuration');
  
  // Show instructions
  alert('Default preset saved!\n\nTo make this permanent:\n1. Copy the preset from localStorage key "wsre_default_preset"\n2. Replace the scriptSections array in modules/script-content.js\n\nFor now, this will load on page refresh from localStorage.');
}

function loadDefaultPreset() {
  const saved = localStorage.getItem('wsre_default_preset');
  if (!saved) {
    showToast('No custom default preset found');
    return;
  }
  
  try {
    const sections = JSON.parse(saved);
    scriptSections.length = 0;
    scriptSections.push(...sections);
    
    renderSections();
    setupEventHandlers();
    updateTokens();
    updateNotesSummary();
    
    showToast('✅ Default preset loaded!');
    devLog('Default preset loaded from localStorage');
  } catch (err) {
    alert('Error loading default preset: ' + err.message);
  }
}

function toggleDeveloperMode() {
  developerMode = !developerMode;
  
  if (developerMode) {
    setupDeveloperUI();
    showToast('Developer mode enabled');
  } else {
    removeDeveloperUI();
    showToast('Developer mode disabled');
  }
}

function setupDeveloperUI() {
  console.log('🔧 Setting up developer UI...');
  
  // Create toolbar
  createDeveloperToolbar();
  
  // Create log panel
  createLogPanel();
  
  // Make prompts editable
  makePromptsEditable();
  
  // Add question controls
  addQuestionControls();
  
  // Add section controls
  addSectionControls();
  
  // Add response editing
  makeResponsesEditable();
  
  console.log('✅ Developer UI ready');
}

function createDeveloperToolbar() {
  if (qs('#developer-toolbar')) return;
  
  const toolbar = document.createElement('div');
  toolbar.id = 'developer-toolbar';
  toolbar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 20px;
    z-index: 99999;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  `;
  
  toolbar.innerHTML = `
    <span style="font-weight: 600; font-size: 16px; margin-right: auto;">🛠️ Developer Mode</span>
    <button onclick="save(); showToast('Saved!')" style="background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">💾 Save</button>
    <button onclick="load(); showToast('Loaded!')" style="background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">📂 Load</button>
    <button onclick="savePreset()" style="background: #22c55e; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">💾 Save Preset</button>
    <button onclick="loadPreset()" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">📂 Load Preset</button>
    <button onclick="setDefaultPreset()" style="background: #f59e0b; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">⭐ Set as Default</button>
    <button onclick="downloadDeveloperLog()" style="background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">📥 Download Log</button>
    <button onclick="clearDeveloperLog()" style="background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">🗑️ Clear Log</button>
    <button onclick="toggleDeveloperMode()" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">❌ Exit Dev Mode</button>
  `;
  
  document.body.appendChild(toolbar);
  document.body.style.paddingTop = '60px';
}

function createLogPanel() {
  if (qs('#dev-log-panel')) return;
  
  const panel = document.createElement('div');
  panel.id = 'dev-log-panel';
  panel.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 500px;
    max-height: 400px;
    background: #1e293b;
    color: #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    z-index: 99998;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;
  
  panel.innerHTML = `
    <div id="log-panel-header" style="background: #334155; padding: 10px; font-weight: 600; cursor: move; display: flex; align-items: center; justify-content: space-between;">
      <span>📋 Developer Log</span>
      <button onclick="toggleLogPanel()" style="background: #475569; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">−</button>
    </div>
    <pre id="dev-log-content" style="flex: 1; overflow-y: auto; padding: 10px; margin: 0; font-size: 11px; font-family: 'Courier New', monospace; background: #0f172a;"></pre>
  `;
  
  document.body.appendChild(panel);
  
  // Make draggable
  makeDraggable(panel, qs('#log-panel-header'));
  
  updateDevLogDisplay();
}

function makeDraggable(element, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  handle.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + 'px';
    element.style.left = (element.offsetLeft - pos1) + 'px';
    element.style.bottom = 'auto';
    element.style.right = 'auto';
  }
  
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function toggleLogPanel() {
  const content = qs('#dev-log-content');
  const panel = qs('#dev-log-panel');
  const btn = qs('#log-panel-header button');
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    btn.textContent = '−';
    panel.style.maxHeight = '400px';
  } else {
    content.style.display = 'none';
    btn.textContent = '+';
    panel.style.maxHeight = 'auto';
  }
}

function downloadDeveloperLog() {
  const logText = devLogs.join('\n');
  const filename = `dev-log-${Date.now()}.txt`;
  downloadFile(filename, logText);
  showToast('Log downloaded!');
}

function clearDeveloperLog() {
  devLogs = [];
  updateDevLogDisplay();
  showToast('Log cleared!');
}

function makePromptsEditable() {
  qsa('.prompt[data-tpl]').forEach(prompt => {
    prompt.setAttribute('contenteditable', 'true');
    prompt.style.border = '2px dashed #667eea';
    prompt.style.padding = '8px';
    prompt.style.background = '#f0f9ff';
    prompt.style.cursor = 'text';
    
    prompt.addEventListener('blur', () => {
      const newText = prompt.textContent.trim();
      prompt.setAttribute('data-tpl', newText);
      save();
      devLog(`Prompt updated: ${newText.substring(0, 50)}...`);
    });
  });
  
  console.log('✅ Made', qsa('.prompt[data-tpl]').length, 'prompts editable');
}

function addQuestionControls() {
  qsa('.q').forEach(q => {
    if (q.querySelector('.dev-q-controls')) return; // Already added
    
    const controls = document.createElement('div');
    controls.className = 'dev-q-controls';
    controls.style.cssText = `
      background: #e0e7ff;
      border: 1px solid #818cf8;
      padding: 8px;
      margin: 5px 0;
      border-radius: 6px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    `;
    
    // Add Question Above
    const addAboveBtn = createDevButton('➕ Add Question Above', '#3b82f6', () => {
      addQuestionAbove(q);
    });
    controls.appendChild(addAboveBtn);
    
    // Add Question Below
    const addBelowBtn = createDevButton('➕ Add Question Below', '#3b82f6', () => {
      addQuestionBelow(q);
    });
    controls.appendChild(addBelowBtn);
    
    // Delete Question
    const deleteBtn = createDevButton('🗑️ Delete Question', '#ef4444', () => {
      if (confirm('Delete this question?')) {
        q.remove();
        save();
        devLog('Question deleted');
      }
    });
    controls.appendChild(deleteBtn);
    
    // Token insertion buttons
    const tokenLabel = document.createElement('span');
    tokenLabel.textContent = 'Insert Token:';
    tokenLabel.style.cssText = 'margin-left: auto; font-size: 12px; font-weight: 600; color: #4338ca;';
    controls.appendChild(tokenLabel);
    
    const tokens = [
      { name: 'Prospect', value: '[prospect]' },
      { name: 'Your Name', value: '[name]' },
      { name: 'Street', value: '[street name]' },
      { name: 'Day/Time', value: '[day/time]' }
    ];
    
    tokens.forEach(token => {
      const tokenBtn = createDevButton(token.name, '#0f766e', () => {
        const prompt = q.querySelector('.prompt[data-tpl]');
        if (prompt) {
          prompt.textContent += ' ' + token.value;
          prompt.setAttribute('data-tpl', prompt.textContent);
          save();
          devLog(`Token inserted: ${token.value}`);
        }
      });
      tokenBtn.style.fontSize = '11px';
      tokenBtn.style.padding = '4px 8px';
      controls.appendChild(tokenBtn);
    });
    
    q.insertBefore(controls, q.firstChild);
  });
  
  console.log('✅ Added controls to', qsa('.q').length, 'questions');
}

function addSectionControls() {
  qsa('section.card').forEach(section => {
    if (section.querySelector('.dev-section-controls')) return; // Already added
    
    const controls = document.createElement('div');
    controls.className = 'dev-section-controls';
    controls.style.cssText = `
      background: #d1fae5;
      border: 2px solid #10b981;
      padding: 12px;
      margin: 15px 0;
      border-radius: 8px;
      display: flex;
      gap: 10px;
      justify-content: center;
    `;
    
    // Add Section Above
    const addAboveBtn = createDevButton('⬆️ Add Section Above', '#10b981', () => {
      addSectionAbove(section);
    });
    controls.appendChild(addAboveBtn);
    
    // Add Section Below
    const addBelowBtn = createDevButton('⬇️ Add Section Below', '#10b981', () => {
      addSectionBelow(section);
    });
    controls.appendChild(addBelowBtn);
    
    // Delete Section
    const deleteBtn = createDevButton('🗑️ Delete Section', '#ef4444', () => {
      if (confirm('Delete this entire section?')) {
        section.remove();
        save();
        devLog('Section deleted: ' + section.id);
        updateNavigation();
      }
    });
    controls.appendChild(deleteBtn);
    
    section.appendChild(controls);
  });
  
  console.log('✅ Added controls to', qsa('section.card').length, 'sections');
}

function makeResponsesEditable() {
  qsa('.chips').forEach(group => {
    if (group.querySelector('.add-response-btn')) return; // Already added
    
    // Add new response button
    const addBtn = document.createElement('button');
    addBtn.className = 'add-response-btn';
    addBtn.textContent = '➕ Add Response';
    addBtn.style.cssText = `
      background: #a78bfa;
      color: white;
      border: 2px dashed white;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
    `;
    addBtn.addEventListener('click', () => {
      const text = prompt('Enter new response option:');
      if (text && text.trim()) {
        const btn = document.createElement('button');
        btn.setAttribute('data-val', text.trim());
        btn.textContent = text.trim();
        group.insertBefore(btn, addBtn);
        save();
        devLog('Response added: ' + text);
      }
    });
    group.appendChild(addBtn);
    
    // Make existing responses editable
    group.querySelectorAll('button:not(.add-response-btn)').forEach(btn => {
      btn.style.cursor = 'pointer';
      btn.title = 'Right-click to edit or delete';
      
      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const action = confirm('Edit this response? (Cancel to delete)');
        if (action) {
          const newText = prompt('Edit response:', btn.textContent);
          if (newText && newText.trim()) {
            btn.textContent = newText.trim();
            btn.setAttribute('data-val', newText.trim());
            save();
            devLog('Response edited: ' + newText);
          }
        } else {
          if (confirm('Delete this response?')) {
            btn.remove();
            save();
            devLog('Response deleted');
          }
        }
      });
    });
  });
  
  console.log('✅ Made responses editable');
}

function createDevButton(text, color, onClick) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.style.cssText = `
    background: ${color};
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s;
  `;
  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.05)';
    btn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = 'none';
  });
  btn.addEventListener('click', onClick);
  return btn;
}

function addQuestionAbove(q) {
  const newQ = createNewQuestion();
  q.parentNode.insertBefore(newQ, q);
  save();
  devLog('Question added above');
  
  // Re-add controls
  removeDeveloperUI();
  setupDeveloperUI();
}

function addQuestionBelow(q) {
  const newQ = createNewQuestion();
  q.parentNode.insertBefore(newQ, q.nextSibling);
  save();
  devLog('Question added below');
  
  // Re-add controls
  removeDeveloperUI();
  setupDeveloperUI();
}

function createNewQuestion() {
  const q = document.createElement('div');
  q.className = 'q';
  
  const prompt = document.createElement('div');
  prompt.className = 'prompt';
  prompt.setAttribute('data-tpl', 'New question - click to edit');
  prompt.textContent = 'New question - click to edit';
  q.appendChild(prompt);
  
  const chips = document.createElement('div');
  chips.className = 'chips';
  chips.setAttribute('data-key', 'new_q_' + Date.now());
  
  ['Yes', 'No', 'Maybe'].forEach(text => {
    const btn = document.createElement('button');
    btn.setAttribute('data-val', text);
    btn.textContent = text;
    chips.appendChild(btn);
  });
  
  q.appendChild(chips);
  
  const notesTrigger = document.createElement('button');
  notesTrigger.type = 'button';
  notesTrigger.className = 'notes-trigger';
  notesTrigger.textContent = '＋ Add details';
  q.appendChild(notesTrigger);
  
  const notes = document.createElement('div');
  notes.className = 'notes collapsed';
  const textarea = document.createElement('textarea');
  textarea.setAttribute('data-key', 'new_q_' + Date.now() + '_notes');
  textarea.placeholder = 'Notes';
  notes.appendChild(textarea);
  q.appendChild(notes);
  
  return q;
}

function addSectionAbove(section) {
  const newSection = createNewSection();
  section.parentNode.insertBefore(newSection, section);
  save();
  devLog('Section added above');
  updateNavigation();
  
  // Re-add controls
  removeDeveloperUI();
  setupDeveloperUI();
}

function addSectionBelow(section) {
  const newSection = createNewSection();
  section.parentNode.insertBefore(newSection, section.nextSibling);
  save();
  devLog('Section added below');
  updateNavigation();
  
  // Re-add controls
  removeDeveloperUI();
  setupDeveloperUI();
}

function createNewSection() {
  const section = document.createElement('section');
  section.id = 'new_section_' + Date.now();
  section.className = 'card';
  
  const title = document.createElement('h2');
  title.contentEditable = 'true';
  title.textContent = '📝 New Section - Click to Edit';
  title.style.border = '2px dashed #667eea';
  title.style.padding = '8px';
  section.appendChild(title);
  
  title.addEventListener('blur', () => {
    save();
    updateNavigation();
  });
  
  const q = createNewQuestion();
  section.appendChild(q);
  
  return section;
}

function updateNavigation() {
  const nav = qs('#nav-toc');
  if (!nav) return;
  
  nav.innerHTML = '';
  
  qsa('section.card').forEach((section, idx) => {
    const title = section.querySelector('h2')?.textContent || `Section ${idx + 1}`;
    const link = document.createElement('a');
    link.href = '#' + section.id;
    link.textContent = title;
    nav.appendChild(link);
  });
}

function removeDeveloperUI() {
  // Remove toolbar
  const toolbar = qs('#developer-toolbar');
  if (toolbar) {
    toolbar.remove();
    document.body.style.paddingTop = '0';
  }
  
  // Remove log panel
  const panel = qs('#dev-log-panel');
  if (panel) panel.remove();
  
  // Remove all dev controls
  qsa('.dev-q-controls, .dev-section-controls, .add-response-btn').forEach(el => el.remove());
  
  // Restore prompts
  qsa('.prompt[data-tpl]').forEach(prompt => {
    prompt.removeAttribute('contenteditable');
    prompt.style.border = '';
    prompt.style.padding = '';
    prompt.style.background = '';
    prompt.style.cursor = '';
  });
  
  // Restore response buttons
  qsa('.chips button').forEach(btn => {
    btn.removeAttribute('title');
    btn.style.cursor = '';
  });
  
  console.log('✅ Developer UI removed');
}

console.log('✅ Developer mode module loaded');
