// Cold Calls Workbook - Enhanced Version 2025-10-23-v5
// Features: Fixed scope issues, simplified architecture
// REMOVED IIFE WRAPPER - All functions now in global scope for event handlers

const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));
const esc = (str) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const KEY = 'seller_call_workbook_v615';
const DEV_KEY = 'seller_call_developer_v615';

let developerMode = false;

// Logging for developer mode
let devLogs = [];
let undoStack = [];
let redoStack = [];
function devLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    devLogs.push(logEntry);
    console.log(logEntry); // Also log to console
    updateDevLogDisplay();
}

// Toast notification
function showToast(message) {
    devLog('Toast: ' + message);
    // Simple toast implementation
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

// Update developer log display
function updateDevLogDisplay() {
    const panel = qs('#dev-log-panel');
    if (panel) {
      const logText = devLogs.join('\n');
      qs('#dev-log-content').textContent = logText;
    }
}

function undoDeveloperChange(){
    if (undoStack.length > 0) {
      const currentData = JSON.parse(localStorage.getItem(DEV_KEY) || '{}');
      redoStack.push(JSON.stringify(currentData));
      const prevData = JSON.parse(undoStack.pop());
      localStorage.setItem(DEV_KEY, JSON.stringify(prevData));
      loadDeveloperData();
      devLog('Undid last change');
    } else {
      devLog('No changes to undo');
    }
}

function redoDeveloperChange(){
    if (redoStack.length > 0) {
      const currentData = JSON.parse(localStorage.getItem(DEV_KEY) || '{}');
      undoStack.push(JSON.stringify(currentData));
      const nextData = JSON.parse(redoStack.pop());
      localStorage.setItem(DEV_KEY, JSON.stringify(nextData));
      loadDeveloperData();
      devLog('Redid last change');
    } else {
      devLog('No changes to redo');
    }
}

function showEditChipsModal(){
    devLog('Opening edit chips modal');
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'edit-chips-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '10001';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';

    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '20px';
    modal.style.borderRadius = '5px';
    modal.style.maxWidth = '800px';
    modal.style.maxHeight = '80%';
    modal.style.overflow = 'auto';

    let html = '<h3>Edit Response Buttons</h3>';
    qsa('main section').forEach(function(sec, secIdx){
      const secTitle = sec.querySelector('h2') ? sec.querySelector('h2').textContent : 'Section ' + (secIdx + 1);
      html += '<h4>Section: ' + esc(secTitle) + '</h4>';
      qsa('.q', sec).forEach(function(q, qIdx){
        const promptText = q.querySelector('.prompt') ? q.querySelector('.prompt').textContent.trim() : 'Question ' + (qIdx + 1);
        html += '<details style="margin-left: 20px;"><summary><strong>Panel:</strong> ' + esc(promptText) + '</summary>';
        const chips = q.querySelector('.chips');
        if (chips) {
          html += '<div style="margin-left: 20px;"><em>Response Buttons:</em><br>';
          html += '<div id="chips-sec' + secIdx + '-q' + qIdx + '">';
          qsa('button', chips).forEach(function(btn, bidx){
            if (!btn.classList.contains('add-chip') && btn.getAttribute('data-val')){
              devLog('Modal: Adding button ' + btn.getAttribute('data-val') + ' to sec' + secIdx + ' q' + qIdx);
              html += '<input type="text" value="' + esc(btn.getAttribute('data-val')) + '" data-sec="' + secIdx + '" data-q="' + qIdx + '" data-btn="' + bidx + '" /> <button onclick="this.previousElementSibling.remove(); this.remove();">Remove</button><br>';
            }
          });
          html += '</div>';
          html += '<button onclick="const inp = document.createElement(\'input\'); inp.type=\'text\'; inp.placeholder=\'New button\'; inp.setAttribute(\'data-sec\', \'' + secIdx + '\'); inp.setAttribute(\'data-q\', \'' + qIdx + '\'); const btn = document.createElement(\'button\'); btn.textContent=\'Remove\'; btn.onclick=function(){this.previousElementSibling.remove(); this.remove();}; const br = document.createElement(\'br\'); document.getElementById(\'chips-sec' + secIdx + '-q' + qIdx + '\').appendChild(inp); document.getElementById(\'chips-sec' + secIdx + '-q' + qIdx + '\').appendChild(btn); document.getElementById(\'chips-sec' + secIdx + '-q' + qIdx + '\').appendChild(br);">Add Response Button</button>';
          html += '</div></details>';
        }
      });
    });
    html += '<br><button id="save-chips-modal">Save Changes</button> <button id="cancel-chips-modal">Cancel</button>';

    modal.innerHTML = html;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    qs('#save-chips-modal').addEventListener('click', function(){
      // Apply changes
      qsa('main section').forEach(function(sec, secIdx){
        qsa('.q', sec).forEach(function(q, qIdx){
          const chips = q.querySelector('.chips');
          if (chips) {
            // Clear existing
            qsa('button', chips).forEach(function(btn){
              if (!btn.classList.contains('add-chip')) btn.remove();
            });
            // Add new
            qsa('input[data-sec="' + secIdx + '"][data-q="' + qIdx + '"]').forEach(function(inp){
              const val = inp.value.trim();
              if (val){
                const btn = document.createElement('button');
                btn.setAttribute('data-val', val);
                btn.textContent = val;
                chips.insertBefore(btn, chips.lastChild);
              }
            });
          }
        });
      });
      overlay.remove();
      devLog('Chips edited via modal');
      saveDeveloperData();
    });

    qs('#cancel-chips-modal').addEventListener('click', function(){
      overlay.remove();
      devLog('Chips edit cancelled');
    });
}

const TOKEN_TO_KEY = {
    'prospect': 'prospect_name',
    'name': 'your_name',
    'street name': 'street_name',
    'day/time': 'day_time'
};

// Toggle notes
document.addEventListener('click', function(e){
    if (e.target.classList.contains('notes-trigger')){
      const container = e.target.closest('.q') || e.target.parentElement;
      const notes = container ? container.querySelector('.notes') : null;
      if (!notes) return;
      notes.classList.toggle('collapsed');
      e.target.textContent = notes.classList.contains('collapsed') ? '＋ Add details' : '— Hide details';
    }
});

// Build prompts with tokens
function buildPromptHTML(tpl){
    return tpl.replace(/\[([^\]\n]+)\]/g, function(m, raw){
      const token = raw.trim().toLowerCase();
      const key = TOKEN_TO_KEY[token];
      var current = '';
      if (token === 'day/time'){
        current = combinedPrimaryAppt();
      } else {
        const input = qs('[data-key="' + key + '"]');
        current = input ? (input.value || '') : '';
      }
      const inner = (current || raw).replace(/^\[|\]$/g,'');
      return '<span class="token"' + (developerMode ? '' : ' contenteditable="true"') + ' data-token="' + token + '" data-tokenraw="' + raw + '">' + esc(inner) + '</span>';
    });
}
function renderPrompts(){
    qsa('.prompt').forEach(function(node){
      const tpl = node.getAttribute('data-tpl');
      if (!tpl) return;
      node.innerHTML = buildPromptHTML(tpl);
    });
    wireTokenEditing();
}
function wireTokenEditing(){
    if (developerMode) return;
    qsa('.prompt .token').forEach(function(span){
      span.addEventListener('input', function(){
        const token = span.getAttribute('data-token');
        const key = TOKEN_TO_KEY[token];
        const input = qs('[data-key="' + key + '"]');
        if (!input) return;
        input.value = span.textContent.trim();
        save();
        renderPrompts();
        updateNotesSummary();
      });
    });
}

// Chip toggle + unselect
document.addEventListener('click', function(e){
    const btn = e.target.closest('.chips button');
    if (btn){
      const group = btn.closest('.chips');
      const key = group.getAttribute('data-key');
      const isActive = btn.classList.contains('active');
      group.querySelectorAll('button').forEach(function(b){ b.classList.remove('active'); });
      const data = read();
      if (isActive){
        data[key] = '';
      } else {
        btn.classList.add('active');
        data[key] = btn.getAttribute('data-val');
      }
      localStorage.setItem(KEY, JSON.stringify(data));
      renderPrompts();
      evaluateVisibility();
    }
});

// Sidebar buttons
document.addEventListener('click', function(e){
    if (e.target && e.target.id === 'export-md'){
      download('seller_call_summary.md', buildMD());
    } else if (e.target && e.target.id === 'copy-md'){
      const md = buildMD();
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(md).then(function(){ showToast('Copied to clipboard'); }, function(){ showToast('Unable to copy'); });
      } else {
        const ta = document.createElement('textarea'); ta.value = md; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); showToast('Copied to clipboard'); } catch(e){ showToast('Unable to copy'); }
        document.body.removeChild(ta);
      }
    } else if (e.target && e.target.id === 'save'){
      save(); 
      if (developerMode) saveDeveloperData();
      showToast('Saved');
    } else if (e.target && e.target.id === 'clear'){
      if (confirm('Clear all inputs?')) { localStorage.removeItem(KEY); location.reload(); }
    } else if (e.target && e.target.id === 'developer'){
      try {
        toggleDeveloperMode();
      } catch(e) {
        alert('Developer mode error: ' + e.message);
      }
    }
});

function toggleDeveloperMode(){
    devLog('Toggling developer mode. Current: ' + developerMode);
    developerMode = !developerMode;
    if (developerMode){
      try {
        devLog('Enabling developer mode');
        setupDeveloperUI();
        showToast('Developer mode enabled');
      } catch(e) {
        devLog('Setup error: ' + e.message);
        alert('Setup error: ' + e.message);
        developerMode = false;
      }
    } else {
      try {
        devLog('Disabling developer mode');
        removeDeveloperUI();
        saveDeveloperData();
        showToast('Developer mode disabled');
      } catch(e) {
        devLog('Remove error: ' + e.message);
        alert('Remove error: ' + e.message);
      }
    }
}

function updateTplFromPrompt(e){
    const p = e.target;
    const tpl = p.textContent.trim();
    p.setAttribute('data-tpl', tpl);
    devLog('Updated prompt template: ' + tpl.substring(0, 50) + '...');
    saveDeveloperData();
}

function setupDeveloperUI(){
    devLog('Setting up developer UI');
    // Make prompts editable
    qsa('.prompt').forEach(function(p){
      p.setAttribute('contenteditable', 'true');
      p.style.border = '1px dashed #0f766e';
      p.style.backgroundColor = '#f0fdfa';
      p.style.padding = '8px';
      p.addEventListener('blur', updateTplFromPrompt);
    });
    devLog('Prompts made editable');

    // Add developer log panel
    const panel = document.createElement('div');
    panel.id = 'dev-log-panel';
    panel.style.position = 'absolute'; // Change to absolute for dragging
    panel.style.top = '50px';
    panel.style.right = '20px';
    panel.style.width = '400px';
    panel.style.height = '300px';
    panel.style.background = '#fff';
    panel.style.border = '1px solid #ccc';
    panel.style.borderRadius = '5px';
    panel.style.zIndex = '9999';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.innerHTML = `
      <div id="dev-log-header" style="padding: 10px; background: #f0f0f0; border-bottom: 1px solid #ccc; cursor: move; display: flex; justify-content: space-between; align-items: center;">
        <strong>Developer Logs</strong>
        <div style="display: flex; gap: 5px;">
          <button id="download-log-btn" style="background: #10b981; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">⬇️ Download</button>
          <button id="clear-log-btn" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">🗑️ Clear</button>
          <button id="close-dev-panel" style="background: #94a3b8; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">×</button>
        </div>
      </div>
      <pre id="dev-log-content" style="flex: 1; padding: 10px; margin: 0; overflow: auto; font-family: monospace; font-size: 12px; white-space: pre-wrap;"></pre>
    `;
    document.body.appendChild(panel);
    devLog('Log panel added');

    // Make panel draggable
    let isDragging = false;
    let offsetX, offsetY;
    const header = qs('#dev-log-header');
    header.addEventListener('mousedown', function(e) {
      isDragging = true;
      offsetX = e.clientX - panel.offsetLeft;
      offsetY = e.clientY - panel.offsetTop;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
    function onMouseMove(e) {
      if (isDragging) {
        panel.style.left = (e.clientX - offsetX) + 'px';
        panel.style.top = (e.clientY - offsetY) + 'px';
      }
    }
    function onMouseUp() {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    // Event listeners for panel
    qs('#close-dev-panel').addEventListener('click', function() {
      panel.remove();
      devLog('Log panel closed');
    });
    
    qs('#download-log-btn').addEventListener('click', function() {
      devLog('📥 Download Log button clicked');
      const logContent = qs('#dev-log-content').textContent;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = 'cold-calls-dev-log-' + timestamp + '.txt';
      
      const blob = new Blob([logContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      devLog('✅ Log downloaded as: ' + filename);
    });
    
    qs('#clear-log-btn').addEventListener('click', function() {
      devLog('🗑️ Clear Log button clicked');
      const logContent = qs('#dev-log-content');
      devLogs = []; // Clear the logs array first
      logContent.textContent = '';
      console.log('✅ Log cleared'); // Use console.log instead of devLog to avoid re-adding
    });

    // Add developer toolbar at the top
    qsa('#dev-toolbar').forEach(btn => btn.remove());
    const devToolbar = document.createElement('div');
    devToolbar.id = 'dev-toolbar';
    devToolbar.style.cssText = 'position: fixed; top: 0; left: 290px; right: 300px; background: #1e293b; color: white; border-bottom: 2px solid #0f766e; padding: 10px 20px; z-index: 11000; display: flex; gap: 15px; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
    devToolbar.innerHTML = `
      <span style="font-weight: 700; color: #14b8a6; margin-right: auto; font-size: 16px;">🛠️ Developer Mode</span>
      <button id="show-log-btn" style="padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">📋 Show Log</button>
      <button id="dev-undo-btn" style="padding: 6px 12px; background: #334155; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">↶ Undo</button>
      <button id="dev-redo-btn" style="padding: 6px 12px; background: #334155; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">↷ Redo</button>
      <button id="edit-chips-btn" style="padding: 6px 12px; background: #0f766e; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">✏️ Edit Buttons</button>
      <button id="clear-dev-data-btn" style="padding: 6px 12px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">🗑️ Clear Data</button>
    `;
    document.body.appendChild(devToolbar);
    
    // Adjust content padding to account for toolbar
    qs('.content').style.paddingTop = '70px';
    
    devLog('🔗 Setting up toolbar button event listeners...');
    
    qs('#dev-undo-btn').addEventListener('click', function(){
      devLog('🔵 Undo button clicked');
      undoDeveloperChange();
    });
    qs('#dev-redo-btn').addEventListener('click', function(){
      devLog('🔵 Redo button clicked');
      redoDeveloperChange();
    });
    qs('#edit-chips-btn').addEventListener('click', function(){
      devLog('🔵 Edit Buttons clicked');
      showEditChipsModal();
    });
    qs('#clear-dev-data-btn').addEventListener('click', function(){
      devLog('🔵 Clear Data button clicked');
      alert('Clear Data clicked! Will clear localStorage and reload.');
      if (confirm('Clear ALL data (developer + workbook)? This will reset everything and reload the page.')){
        devLog('🗑️ Clearing localStorage...');
        alert('Confirmed! Clearing now...');
        localStorage.clear(); // Clear ALL localStorage
        devLog('✅ localStorage cleared');
        console.log('LOCALSTORAGE CLEARED - RELOADING');
        alert('localStorage cleared! Reloading...');
        setTimeout(function(){
          location.reload(true);
        }, 1000);
      } else {
        alert('Cancelled clear data');
      }
    });
    
    // Show Log button
    qs('#show-log-btn').addEventListener('click', function(){
      devLog('📋 Show Log button clicked');
      const panel = qs('#dev-log-panel');
      if (panel) {
        panel.style.display = 'flex';
        devLog('✅ Log panel shown');
      }
    });
    
    devLog('✅ Toolbar event listeners attached');    // Add controls to chips
    // Removed inline add/delete to avoid freezing; use modal instead
    devLog('Chip controls skipped - using modal only');

    // Add section add buttons
    addGreenSectionButtons();
    // Add controls to sections
    qsa('main section').forEach(function(sec){
      const controls = document.createElement('div');
      controls.className = 'section-controls';
      controls.style.cssText = 'background: #f0f0f0; border: 1px solid #ccc; padding: 5px; margin: 5px 0; display: flex; gap: 10px;';
      const delBtn = document.createElement('button');
      delBtn.className = 'delete-section';
      delBtn.textContent = 'Delete Section';
      delBtn.style.cssText = 'background: #f44336; color: white; border: none; padding: 5px 10px; cursor: pointer;';
      delBtn.addEventListener('click', function(){ deleteSection(sec); });
      controls.appendChild(delBtn);
      sec.insertBefore(controls, sec.firstChild);
      // Add add panel buttons between panels
      const qs = sec.querySelectorAll('.q');
      for (let i = 0; i < qs.length - 1; i++){
        const addBtn = document.createElement('button');
        addBtn.className = 'add-panel';
        addBtn.textContent = 'Add Panel';
        addBtn.style.cssText = 'background: #2196F3; color: white; border: none; padding: 5px 10px; cursor: pointer;';
        addBtn.addEventListener('click', function(){ addQuestionBetween(qs[i], qs[i+1]); });
        sec.insertBefore(addBtn, qs[i+1]);
      }
    });
    devLog('Section controls added');

    // Add controls to questions
    qsa('.q').forEach(function(q){
      const prompts = q.querySelectorAll('.prompt');
      prompts.forEach(function(prompt){
        addPromptControls(prompt);
      });
    });
    devLog('Question controls added');
}

function showEditChipsModal(){
    devLog('Opening edit chips modal');
    // Create modal
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.zIndex = '10001';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.overflow = 'auto';

    const modalContent = document.createElement('div');
    modalContent.style.background = '#fff';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '5px';
    modalContent.style.maxWidth = '90%';
    modalContent.style.maxHeight = '90%';
    modalContent.style.overflow = 'auto';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.marginBottom = '20px';
    closeBtn.addEventListener('click', function(){ modal.remove(); });
    modalContent.appendChild(closeBtn);

    const title = document.createElement('h3');
    title.textContent = 'Edit Response Buttons';
    modalContent.appendChild(title);

    // Loop through sections
    qsa('main section').forEach(function(sec, secIdx){
      const secTitle = sec.querySelector('h2') ? sec.querySelector('h2').textContent : 'Section ' + (secIdx + 1);
      const secDetails = document.createElement('details');
      secDetails.style.marginBottom = '20px';
      const secSummary = document.createElement('summary');
      secSummary.innerHTML = '<strong>Section:</strong> ' + esc(secTitle);
      secDetails.appendChild(secSummary);
      modalContent.appendChild(secDetails);

      // Loop through questions in section
      sec.querySelectorAll('.prompt').forEach(function(prompt, pIdx){
        const q = prompt.closest('.q');
        const chipsDiv = q.querySelector('.chips');
        const promptText = prompt.textContent.trim();
        const pDetails = document.createElement('details');
        pDetails.style.marginLeft = '20px';
        pDetails.style.marginBottom = '10px';
        const pSummary = document.createElement('summary');
        pSummary.innerHTML = '<strong>Question ' + (pIdx + 1) + ':</strong> ' + esc(promptText.substring(0, 50)) + (promptText.length > 50 ? '...' : '');
        pDetails.appendChild(pSummary);
        secDetails.appendChild(pDetails);

        const chipsContainer = document.createElement('div');
        chipsContainer.style.marginLeft = '40px';
        chipsContainer.id = 'chips-sec' + secIdx + '-p' + pIdx;
        pDetails.appendChild(chipsContainer);

        // Add existing buttons
        if (chipsDiv) {
          chipsDiv.querySelectorAll('button').forEach(function(btn){
            if (btn.getAttribute('data-val')){
              const btnDiv = document.createElement('div');
              btnDiv.style.display = 'block';
              btnDiv.style.margin = '5px 0';
              const btnCopy = document.createElement('button');
              btnCopy.textContent = btn.getAttribute('data-val');
              btnCopy.disabled = true;
              btnDiv.appendChild(btnCopy);
              const delBtn = document.createElement('button');
              delBtn.textContent = 'Delete';
              delBtn.style.marginLeft = '5px';
              delBtn.addEventListener('click', function(){
                if (confirm('Delete this button?')) {
                  btn.remove();
                  btnDiv.remove();
                  saveDeveloperData();
                }
              });
              btnDiv.appendChild(delBtn);
              chipsContainer.appendChild(btnDiv);
            }
          });
        }

        // Add button
        const addBtn = document.createElement('button');
        addBtn.textContent = 'Add Response Button';
        addBtn.addEventListener('click', function(){
          const val = prompt('Enter button text:');
          if (val){
            const btn = document.createElement('button');
            btn.setAttribute('data-val', val);
            btn.textContent = val;
            if (chipsDiv) chipsDiv.appendChild(btn);
            // Add to modal
            const btnDiv = document.createElement('div');
            btnDiv.style.display = 'block';
            btnDiv.style.margin = '5px 0';
            const btnCopy = document.createElement('button');
            btnCopy.textContent = val;
            btnCopy.disabled = true;
            btnDiv.appendChild(btnCopy);
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Delete';
            delBtn.style.marginLeft = '5px';
            delBtn.addEventListener('click', function(){
              if (confirm('Delete this button?')) {
                btn.remove();
                btnDiv.remove();
                saveDeveloperData();
              }
            });
            btnDiv.appendChild(delBtn);
            chipsContainer.insertBefore(btnDiv, addBtn);
            saveDeveloperData();
          }
        });
        chipsContainer.appendChild(addBtn);
      });
    });

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    devLog('Edit chips modal opened');
}

function removeDeveloperUI(){
    devLog('Removing developer UI');
    qsa('.prompt').forEach(function(p){
      p.removeAttribute('contenteditable');
      p.style.border = '';
      p.style.backgroundColor = '';
      p.style.padding = '';
    });
    devLog('Prompts made non-editable');

    // Remove log panel
    const panel = qs('#dev-log-panel');
    if (panel) {
      panel.remove();
      devLog('Log panel removed');
    }

    // Remove developer toolbar
    const devToolbar = qs('#dev-toolbar');
    if (devToolbar) devToolbar.remove();
    devLog('Developer toolbar removed');

    // Remove all developer controls
    qsa('.add-panel').forEach(function(btn){ btn.remove(); });
    qsa('.prompt-controls').forEach(function(ctrl){ ctrl.remove(); });
    qsa('.add-question-after').forEach(function(btn){ btn.remove(); });
    qsa('.section-controls').forEach(function(ctrl){ ctrl.remove(); });
    qsa('.delete-section').forEach(function(btn){ btn.remove(); });
    qsa('.add-section-btn').forEach(function(btn){ btn.remove(); });
    qsa('.token-insert-toolbar').forEach(function(toolbar){ toolbar.remove(); });
    devLog('All developer controls removed');
    
    renderPrompts();
}

function addChip(chips){
    const val = prompt('Enter button text:');
    if (val){
      const btn = document.createElement('button');
      btn.setAttribute('data-val', val);
      btn.textContent = val;
      chips.insertBefore(btn, chips.lastChild); // before add button
      devLog('Added chip: ' + val);
      saveDeveloperData();
    }
}

function deleteChip(btn){
    if (confirm('Delete this button?')) {
      const val = btn.getAttribute('data-val');
      btn.remove();
      devLog('Deleted chip: ' + val);
      saveDeveloperData();
    }
}

function deleteSection(sec){
    if (confirm('Delete this section?')) {
      sec.remove();
      devLog('Deleted section');
      saveDeveloperData();
    }
}

function addSection(){
  try {
    alert('addSection() function STARTED!');
    devLog('➕ ADD SECTION: Creating blank section with one question');
    console.log('🚀 ADD SECTION FUNCTION CALLED');
    
    // Generate unique IDs
    const timestamp = Date.now();
    const sectionId = 'new-section-' + timestamp;
    const sectionNum = document.querySelectorAll('.content section').length + 1;
    
    alert('Section number will be: ' + sectionNum);
    devLog('📋 Section ID: ' + sectionId);
    devLog('📊 Section number: ' + sectionNum);
    console.log('Section ID:', sectionId, 'Section num:', sectionNum);
    
    // Create section element
    const section = document.createElement('section');
    section.id = sectionId;
    section.className = 'card';
    
    console.log('✅ Section element created');
    alert('Section element created');
    
    // Add title
    const h2 = document.createElement('h2');
    h2.textContent = sectionNum + '. New Section';
    h2.setAttribute('contenteditable', developerMode ? 'true' : 'false');
    h2.style.cursor = developerMode ? 'text' : 'default';
    section.appendChild(h2);
    
    alert('Title added: ' + h2.textContent);
    devLog('✅ Section title added: ' + h2.textContent);
    console.log('✅ Title added:', h2.textContent);

    // Add one blank question panel
    const qDiv = document.createElement('div');
    qDiv.className = 'q';
    
    // Prompt
    const prompt = document.createElement('div');
    prompt.className = 'prompt';
    prompt.setAttribute('contenteditable', developerMode ? 'true' : 'false');
    prompt.setAttribute('data-tpl', 'Enter your question here');
    prompt.textContent = 'Enter your question here';
    qDiv.appendChild(prompt);
    
    devLog('✅ Prompt created');
    
    // Response buttons (chips)
    const chips = document.createElement('div');
    chips.className = 'chips';
    chips.setAttribute('data-key', sectionId + '_q0');
    
    const yesBtn = document.createElement('button');
    yesBtn.setAttribute('data-val', 'Yes');
    yesBtn.textContent = 'Yes';
    chips.appendChild(yesBtn);
    
    const noBtn = document.createElement('button');
    noBtn.setAttribute('data-val', 'No');
    noBtn.textContent = 'No';
    chips.appendChild(noBtn);
    
    qDiv.appendChild(chips);
    
    devLog('✅ Response buttons added');
    
    // Notes trigger
    const notesTrigger = document.createElement('button');
    notesTrigger.type = 'button';
    notesTrigger.className = 'notes-trigger';
    notesTrigger.textContent = '＋ Add details';
    qDiv.appendChild(notesTrigger);
    
    // Notes area
    const notes = document.createElement('div');
    notes.className = 'notes collapsed';
    const textarea = document.createElement('textarea');
    textarea.setAttribute('data-key', sectionId + '_notes0');
    textarea.placeholder = 'Additional info';
    notes.appendChild(textarea);
    qDiv.appendChild(notes);
    
    devLog('✅ Notes area added');
    
    section.appendChild(qDiv);
    
    devLog('✅ Question panel complete');
    
    // Insert at end of content
    const content = document.querySelector('.content');
    if (!content) {
      devLog('❌ ERROR: Could not find .content element!');
      console.error('Content element not found!');
      return;
    }
    
    content.appendChild(section);
    devLog('✅ Section appended to content');
    
    // Add developer controls if in dev mode
    if (developerMode) {
      devLog('🔧 Adding developer controls to new section');
      addPromptControls(prompt);
      devLog('✅ Developer controls added');
      
      // Refresh green Add Section buttons
      devLog('🔄 Refreshing Add Section buttons');
      qsa('.add-section-btn').forEach(function(btn){ btn.remove(); });
      addGreenSectionButtons();
    }
    
    // Update sidebar navigation
    updateSidebarNavigation();
    
    // Save data
    saveDeveloperData();
    
    // Scroll to new section
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    devLog('🎉 Section creation COMPLETE!');
    showToast('New section created!');
    console.log('SECTION CREATED SUCCESSFULLY:', section);
  } catch(error) {
    devLog('❌❌❌ ERROR IN addSection: ' + error.message);
    console.error('ADD SECTION ERROR:', error);
    alert('Error creating section: ' + error.message);
  }
}

function addGreenSectionButtons(){
    devLog('🟢 Adding green "Add Section" buttons');
    const main = qs('main');
    if (!main) {
      devLog('❌ ERROR: Could not find main element!');
      return;
    }
    
    // Add before first section
    const firstAddBtn = document.createElement('button');
    firstAddBtn.className = 'add-section-btn';
    firstAddBtn.textContent = '➕ Add Section';
    firstAddBtn.style.cssText = 'background: #4CAF50; color: white; border: none; padding: 10px 20px; margin: 10px 0; cursor: pointer; font-size: 16px; z-index: 10001; position: relative; border-radius: 8px; font-weight: 600;';
    firstAddBtn.addEventListener('click', function(e){
      devLog('� GREEN ADD SECTION BUTTON (FIRST) CLICKED!');
      console.log('GREEN BUTTON CLICKED', e);
      addSection();
    });
    
    const firstSection = main.querySelector('section');
    if (firstSection) {
      main.insertBefore(firstAddBtn, firstSection);
      devLog('✅ First button added before first section');
    } else {
      main.appendChild(firstAddBtn);
      devLog('✅ First button added (no sections exist)');
    }
    
    // Add after each section
    const sections = qsa('main section');
    devLog('📊 Found ' + sections.length + ' sections');
    sections.forEach(function(sec, idx){
      const addBtn = document.createElement('button');
      addBtn.className = 'add-section-btn';
      addBtn.textContent = '➕ Add Section';
      addBtn.style.cssText = 'background: #4CAF50; color: white; border: none; padding: 10px 20px; margin: 10px 0; cursor: pointer; font-size: 16px; z-index: 10001; position: relative; border-radius: 8px; font-weight: 600;';
      addBtn.addEventListener('click', function(e){
        devLog('� GREEN ADD SECTION BUTTON #' + (idx + 1) + ' CLICKED!');
        console.log('GREEN BUTTON #' + (idx + 1) + ' CLICKED', e);
        addSection();
      });
      
      if (sec.nextSibling) {
        main.insertBefore(addBtn, sec.nextSibling);
      } else {
        main.appendChild(addBtn);
      }
      devLog('  ✅ Button added after section ' + (idx + 1));
    });
    
    devLog('✅ All green buttons added');
}

function updateSidebarNavigation(){
    devLog('🔄 updateSidebarNavigation START');
    const sidebar = document.querySelector('.sidebar');
    const sections = document.querySelectorAll('.content section');
    devLog('📊 Found ' + sections.length + ' sections');
    
    // Find the existing nav or create one
    let nav = sidebar.querySelector('nav');
    if (!nav) {
      devLog('📝 Creating new nav element');
      nav = document.createElement('nav');
      sidebar.appendChild(nav);
    }
    
    // Clear and rebuild
    nav.innerHTML = '';
    devLog('🧹 Cleared nav, rebuilding...');
    
    sections.forEach(function(section, index){
      const h2 = section.querySelector('h2');
      if (h2) {
        devLog('  ➕ Adding link for: ' + h2.textContent);
        const link = document.createElement('a');
        link.href = '#' + section.id;
        link.textContent = h2.textContent;
        link.style.cssText = 'display: block; padding: 8px 12px; color: #1e293b; text-decoration: none; border-radius: 6px; margin-bottom: 4px; transition: background 0.2s;';
        link.addEventListener('mouseenter', function(){
          this.style.background = '#e2e8f0';
        });
        link.addEventListener('mouseleave', function(){
          this.style.background = 'transparent';
        });
        nav.appendChild(link);
      }
    });
    
    devLog('✅ updateSidebarNavigation COMPLETE');
}

function addQuestion(sec){
    const q = document.createElement('div');
    q.className = 'q';
    q.innerHTML = '<div class="prompt" data-tpl="New question here">New question here</div><div class="chips" data-key="new_q_' + Date.now() + '"><button data-val="Yes">Yes</button><button data-val="No">No</button></div><button type="button" class="notes-trigger">＋ Add details</button><div class="notes collapsed"><textarea data-key="new_notes_' + Date.now() + '" placeholder="Additional info"></textarea></div>';
    sec.appendChild(q);
    devLog('Added question to section');
    saveDeveloperData();
}

function addQuestionBefore(targetQ){
    const sec = targetQ.closest('section');
    const q = document.createElement('div');
    q.className = 'q';
    q.innerHTML = '<div class="prompt" data-tpl="New question here">New question here</div><div class="chips" data-key="new_q_' + Date.now() + '"><button data-val="Yes">Yes</button><button data-val="No">No</button></div><button type="button" class="notes-trigger">＋ Add details</button><div class="notes collapsed"><textarea data-key="new_notes_' + Date.now() + '" placeholder="Additional info"></textarea></div>';
    sec.insertBefore(q, targetQ);
    devLog('Added question before');
    saveDeveloperData();
}

function addQuestionBetween(beforeQ, afterQ){
    const sec = beforeQ.closest('section');
    const q = document.createElement('div');
    q.className = 'q';
    q.innerHTML = '<div class="prompt" data-tpl="New question here">New question here</div><div class="chips" data-key="new_q_' + Date.now() + '"><button data-val="Yes">Yes</button><button data-val="No">No</button></div><button type="button" class="notes-trigger">＋ Add details</button><div class="notes collapsed"><textarea data-key="new_notes_' + Date.now() + '" placeholder="Additional info"></textarea></div>';
    sec.insertBefore(q, afterQ);
    devLog('Added question between');
    saveDeveloperData();
}

function addPromptControls(prompt){
    devLog('🔧 addPromptControls START for prompt');
    
    // CRITICAL FIX: Remove any existing controls for this prompt to prevent duplicates
    const q = prompt.closest('.q');
    if (!q) {
      devLog('❌ ERROR: No parent .q found for prompt!');
      return;
    }
    
    const existingControls = prompt.previousElementSibling;
    if (existingControls && existingControls.classList.contains('prompt-controls')) {
      devLog('⚠️ DUPLICATE PREVENTION: Removing existing controls');
      existingControls.remove();
    }
    
    const controls = document.createElement('div');
    controls.className = 'prompt-controls';
    controls.setAttribute('data-debug-id', 'control-' + Date.now());
    controls.style.cssText = 'background: #e0e0e0; border: 1px solid #ccc; padding: 8px; margin: 5px 0; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; border-radius: 8px;';
    
    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Question Here';
    addBtn.style.cssText = 'background: #2196F3; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 6px; font-size: 13px;';
    addBtn.addEventListener('click', function(){ 
      devLog('🔵 BUTTON CLICK: Add Question Here');
      addPromptBefore(prompt); 
    });
    controls.appendChild(addBtn);
    
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete Question';
    delBtn.style.cssText = 'background: #f44336; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 6px; font-size: 13px;';
    delBtn.addEventListener('click', function(){ 
      devLog('🔴 BUTTON CLICK: Delete Question');
      deletePrompt(prompt); 
    });
    controls.appendChild(delBtn);
    
    // Add token insertion buttons
    const tokenLabel = document.createElement('span');
    tokenLabel.textContent = 'Insert Token:';
    tokenLabel.style.cssText = 'margin-left: auto; font-size: 12px; font-weight: 600; color: #64748b;';
    controls.appendChild(tokenLabel);
    
    const tokens = [
      { name: 'Prospect', value: '[prospect]' },
      { name: 'Your Name', value: '[name]' },
      { name: 'Street', value: '[street name]' }
    ];
    
    tokens.forEach(function(token){
      const tokenBtn = document.createElement('button');
      tokenBtn.textContent = token.name;
      tokenBtn.style.cssText = 'background: #0f766e; color: white; border: none; padding: 4px 10px; cursor: pointer; border-radius: 4px; font-size: 12px;';
      tokenBtn.addEventListener('click', function(){
        devLog('🎯 TOKEN CLICK: ' + token.value);
        insertTokenAtCursor(prompt, token.value);
      });
      controls.appendChild(tokenBtn);
    });
    
    q.insertBefore(controls, prompt);
    devLog('✅ Controls inserted before prompt');
    
    // CRITICAL FIX: Remove ALL existing "Add Question Below" buttons to prevent duplication
    const existingAfterButtons = q.querySelectorAll('.add-question-after');
    if (existingAfterButtons.length > 0) {
      devLog('🧹 CLEANUP: Removing ' + existingAfterButtons.length + ' existing "Add Question Below" buttons');
      existingAfterButtons.forEach(function(btn){ btn.remove(); });
    }
    
    // Add "Add Question Below" button only if this is the last prompt in the .q
    const prompts = q.querySelectorAll('.prompt');
    const index = Array.from(prompts).indexOf(prompt);
    devLog('📍 Prompt position: ' + (index + 1) + ' of ' + prompts.length);
    
    if (index === prompts.length - 1) {
      devLog('✨ Last prompt detected - adding "Add Question Here" button');
      const addAfterBtn = document.createElement('button');
      addAfterBtn.className = 'add-question-after';
      addAfterBtn.setAttribute('data-debug-id', 'add-after-' + Date.now());
      addAfterBtn.textContent = 'Add Question Here';
      addAfterBtn.style.cssText = 'background: #2196F3; color: white; border: none; padding: 6px 12px; cursor: pointer; margin: 5px 0; border-radius: 6px; font-size: 13px;';
      addAfterBtn.addEventListener('click', function(){ 
        devLog('🔵 BUTTON CLICK: Add Question Here (After)');
        addPromptAfter(prompt); 
      });
      q.insertBefore(addAfterBtn, prompt.nextSibling);
      devLog('✅ "Add Question Here" button added');
    } else {
      devLog('ℹ️ Not last prompt - skipping "Add Question Here" button');
    }
    
    devLog('🔧 addPromptControls COMPLETE');
}

function insertTokenAtCursor(prompt, tokenValue){
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      // Check if selection is within the prompt
      if (prompt.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        const textNode = document.createTextNode(tokenValue);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // If no selection in prompt, append to end
        const currentText = prompt.textContent;
        prompt.textContent = currentText + ' ' + tokenValue;
      }
    } else {
      // If no selection, append to end
      const currentText = prompt.textContent;
      prompt.textContent = currentText + ' ' + tokenValue;
    }
    // Update the data-tpl attribute
    const newTpl = prompt.textContent.trim();
    prompt.setAttribute('data-tpl', newTpl);
    devLog('Inserted token ' + tokenValue + ' into prompt');
    saveDeveloperData();
}

function addPromptAfter(targetPrompt){
    devLog('➕ addPromptAfter START');
    const q = targetPrompt.closest('.q');
    if (!q) {
      devLog('❌ ERROR: No parent .q found!');
      return;
    }
    
    devLog('📝 Creating new prompt');
    const newPrompt = document.createElement('div');
    newPrompt.className = 'prompt';
    newPrompt.setAttribute('contenteditable', 'true');
    newPrompt.setAttribute('data-tpl', 'New question here');
    newPrompt.textContent = 'New question here';
    
    // Find the next element after targetPrompt (skip controls if any)
    let insertBefore = targetPrompt.nextElementSibling;
    while (insertBefore && (insertBefore.classList.contains('prompt-controls') || insertBefore.classList.contains('add-question-after'))) {
      insertBefore = insertBefore.nextElementSibling;
    }
    
    if (insertBefore) {
      devLog('📍 Inserting before next element');
      q.insertBefore(newPrompt, insertBefore);
    } else {
      devLog('📍 Appending to end of .q');
      q.appendChild(newPrompt);
    }
    
    devLog('🔄 Rebuilding ALL controls in this .q to prevent duplicates');
    // Remove all controls and rebuild
    q.querySelectorAll('.prompt-controls').forEach(function(ctrl){ ctrl.remove(); });
    q.querySelectorAll('.add-question-after').forEach(function(btn){ btn.remove(); });
    
    // Add controls to all prompts
    const allPrompts = q.querySelectorAll('.prompt');
    devLog('🔧 Adding controls to ' + allPrompts.length + ' prompts');
    allPrompts.forEach(function(p, idx){
      devLog('  - Prompt ' + (idx + 1));
      addPromptControls(p);
    });
    
    devLog('💾 Saving');
    saveDeveloperData();
    devLog('➕ addPromptAfter COMPLETE');
}

function addPromptBefore(targetPrompt){
    devLog('➕ addPromptBefore START');
    const q = targetPrompt.closest('.q');
    if (!q) {
      devLog('❌ ERROR: No parent .q found!');
      return;
    }
    
    devLog('📝 Creating new prompt');
    const newPrompt = document.createElement('div');
    newPrompt.className = 'prompt';
    newPrompt.setAttribute('contenteditable', 'true');
    newPrompt.setAttribute('data-tpl', 'New question here');
    newPrompt.textContent = 'New question here';
    
    // Insert before the targetPrompt's controls (if exists) or the prompt itself
    let insertBefore = targetPrompt;
    const prevSibling = targetPrompt.previousElementSibling;
    if (prevSibling && prevSibling.classList.contains('prompt-controls')) {
      insertBefore = prevSibling;
    }
    
    devLog('📍 Inserting new prompt');
    q.insertBefore(newPrompt, insertBefore);
    
    devLog('🔄 Rebuilding ALL controls in this .q to prevent duplicates');
    // Remove all controls and rebuild
    q.querySelectorAll('.prompt-controls').forEach(function(ctrl){ ctrl.remove(); });
    q.querySelectorAll('.add-question-after').forEach(function(btn){ btn.remove(); });
    
    // Add controls to all prompts
    const allPrompts = q.querySelectorAll('.prompt');
    devLog('🔧 Adding controls to ' + allPrompts.length + ' prompts');
    allPrompts.forEach(function(p, idx){
      devLog('  - Prompt ' + (idx + 1));
      addPromptControls(p);
    });
    
    devLog('💾 Saving');
    saveDeveloperData();
    devLog('➕ addPromptBefore COMPLETE');
}

function deletePrompt(prompt){
    devLog('🗑️ deletePrompt START');
    const q = prompt.closest('.q');
    if (!q) {
      devLog('❌ ERROR: No parent .q found!');
      return;
    }
    
    // Remove controls above the prompt
    const controls = prompt.previousElementSibling;
    if (controls && controls.classList.contains('prompt-controls')) {
      devLog('🧹 Removing controls for deleted prompt');
      controls.remove();
    }
    
    devLog('🗑️ Removing prompt element');
    prompt.remove();
    
    // CRITICAL FIX: Always rebuild all controls after deletion to prevent duplication
    const remainingPrompts = q.querySelectorAll('.prompt');
    devLog('📊 Remaining prompts: ' + remainingPrompts.length);
    
    if (remainingPrompts.length === 0){
      devLog('⚠️ No prompts left - adding default prompt');
      const defaultPrompt = document.createElement('div');
      defaultPrompt.className = 'prompt';
      defaultPrompt.setAttribute('contenteditable', 'true');
      defaultPrompt.setAttribute('data-tpl', 'New question here');
      defaultPrompt.textContent = 'New question here';
      q.insertBefore(defaultPrompt, q.querySelector('.chips'));
      addPromptControls(defaultPrompt);
    } else {
      devLog('🔄 Rebuilding controls for all remaining prompts');
      // Remove ALL prompt controls and "Add Question Below" buttons
      q.querySelectorAll('.prompt-controls').forEach(function(ctrl){ 
        devLog('🧹 Removing old control');
        ctrl.remove(); 
      });
      q.querySelectorAll('.add-question-after').forEach(function(btn){ 
        devLog('🧹 Removing old "Add Question Below" button');
        btn.remove(); 
      });
      
      // Rebuild controls for each remaining prompt
      remainingPrompts.forEach(function(p, idx){
        devLog('🔧 Rebuilding controls for prompt ' + (idx + 1));
        addPromptControls(p);
      });
    }
    
    devLog('💾 Saving developer data');
    saveDeveloperData();
    devLog('🗑️ deletePrompt COMPLETE');
}

function deleteQuestion(q){
    if (confirm('Delete this question?')) {
      q.remove();
      devLog('Deleted question');
      saveDeveloperData();
    }
}

function saveDeveloperData(){
    // Push current data to undo stack
    const currentData = JSON.parse(localStorage.getItem(DEV_KEY) || '{}');
    undoStack.push(JSON.stringify(currentData));
    redoStack = []; // Clear redo on new save
    const data = {};
    // Save sections structure
    data['sections'] = [];
    qsa('main section').forEach(function(sec){
      const secData = {title: (sec.querySelector('h2') ? sec.querySelector('h2').textContent : ''), questions: []};
      sec.querySelectorAll('.q').forEach(function(q){
        const prompts = q.querySelectorAll('.prompt');
        const promptTpls = Array.from(prompts).map(p => p.getAttribute('data-tpl') || '');
        const chips = [];
        const chipsEl = q.querySelector('.chips');
        if (chipsEl) {
          chipsEl.querySelectorAll('button').forEach(function(btn){
            if (!btn.classList.contains('add-chip') && btn.getAttribute('data-val')){
              chips.push(btn.getAttribute('data-val'));
            }
          });
        }
        secData.questions.push({prompts: promptTpls, chips: chips});
      });
      data['sections'].push(secData);
    });
    devLog('Saved ' + data['sections'].length + ' sections');
    // Save old way for compatibility, but sections take precedence
    qsa('.prompt').forEach(function(p, i){
      data['prompt_' + i] = p.getAttribute('data-tpl');
    });
    qsa('.chips').forEach(function(chips){
      const key = chips.getAttribute('data-key');
      const buttons = [];
      chips.querySelectorAll('button').forEach(function(btn){
        if (!btn.classList.contains('add-chip') && btn.getAttribute('data-val')){
          buttons.push(btn.getAttribute('data-val'));
        }
      });
      data['chips_' + key] = buttons;
    });
    localStorage.setItem(DEV_KEY, JSON.stringify(data));
    devLog('Developer data saved');
}

function loadDeveloperData(){
    const data = JSON.parse(localStorage.getItem(DEV_KEY) || '{}');
    if (data['sections'] && data['sections'].length > 0) {
      // Rebuild sections from data
      const main = qs('main');
      // Clear existing sections
      qsa('main section').forEach(function(sec){ sec.remove(); });
      devLog('Cleared existing sections, rebuilding ' + data['sections'].length + ' sections');
      data['sections'].forEach(function(secData, secIdx){
        const sec = document.createElement('section');
        sec.className = 'card';
        sec.innerHTML = '<h2>' + esc(secData.title) + '</h2>';
        devLog('Rebuilding section ' + secIdx + ': ' + secData.title + ' with ' + secData.questions.length + ' questions');
        secData.questions.forEach(function(qData, qIdx){
          const q = document.createElement('div');
          q.className = 'q';
          const prompts = qData.prompts || (qData.prompt ? [qData.prompt] : []);
          prompts.forEach(function(promptTpl){
            const promptDiv = document.createElement('div');
            promptDiv.className = 'prompt';
            promptDiv.setAttribute('data-tpl', promptTpl);
            promptDiv.textContent = promptTpl;
            q.appendChild(promptDiv);
            addPromptControls(promptDiv);
          });
          const chipsDiv = document.createElement('div');
          chipsDiv.className = 'chips';
          chipsDiv.setAttribute('data-key', 'loaded_' + Date.now() + '_' + secIdx + '_' + qIdx);
          devLog('Rebuilding question ' + qIdx + ' with ' + prompts.length + ' prompts and ' + qData.chips.length + ' chips');
          qData.chips.forEach(function(btnVal, bIdx){
            const btn = document.createElement('button');
            btn.setAttribute('data-val', btnVal);
            btn.textContent = btnVal;
            chipsDiv.appendChild(btn);
            devLog('Added button ' + bIdx + ': ' + btnVal);
          });
          q.appendChild(chipsDiv);
          const notesTrigger = document.createElement('button');
          notesTrigger.type = 'button';
          notesTrigger.className = 'notes-trigger';
          notesTrigger.textContent = '＋ Add details';
          q.appendChild(notesTrigger);
          const notes = document.createElement('div');
          notes.className = 'notes collapsed';
          const textarea = document.createElement('textarea');
          textarea.setAttribute('data-key', 'loaded_notes_' + Date.now() + '_' + secIdx + '_' + qIdx);
          textarea.placeholder = 'Additional info';
          notes.appendChild(textarea);
          q.appendChild(notes);
          sec.appendChild(q);
        });
        main.appendChild(sec);
      });
    } else {
      // Fallback to old way
      devLog('No sections data or empty, using old load');
      devLog('Found ' + qsa('.chips').length + ' chips elements');
      qsa('.chips').forEach(function(chips, idx){
        const key = chips.getAttribute('data-key');
        devLog('Chips ' + idx + ' key: ' + key + ', has ' + qsa('button', chips).length + ' buttons');
        if (data['chips_' + key]){
          devLog('Has data for ' + key + ', clearing and adding ' + data['chips_' + key].length + ' buttons');
          // Clear existing buttons except add-chip
          chips.querySelectorAll('button').forEach(function(btn){
            if (!btn.classList.contains('add-chip')) {
              devLog('Removing button: ' + btn.getAttribute('data-val'));
              btn.remove();
            }
          });
          // Add saved buttons
          data['chips_' + key].forEach(function(val){
            const btn = document.createElement('button');
            btn.setAttribute('data-val', val);
            btn.textContent = val;
            chips.insertBefore(btn, chips.lastChild);
            devLog('Added button: ' + val);
          });
        } else {
          devLog('No data for ' + key + ', leaving as is');
        }
      });
      qsa('.prompt').forEach(function(p, i){
        if (data['prompt_' + i]) p.setAttribute('data-tpl', data['prompt_' + i]);
      });
    }
    devLog('Developer data loaded');
}

// Appointment rows add/remove
document.addEventListener('click', function(e){
    if (e.target && e.target.id === 'add-time'){
      addTimeRow();
      return;
    }
    const del = e.target.closest('.remove-time');
    if (del){
      const idx = del.getAttribute('data-index');
      if (idx === '1'){
        const d1 = qs('[data-key="day_date_1"]'); const t1 = qs('[data-key="day_time_1"]');
        if (d1) d1.value = ''; if (t1) t1.value = '';
      } else {
        const row = del.closest('.appt-row'); if (row) row.remove();
      }
      save(); renderPrompts();
    }
});
function addTimeRow(){
    const wrap = qs('#extra-times');
    const next = (wrap.querySelectorAll('.appt-row').length || 0) + 2;
    const row = document.createElement('div');
    row.className = 'appt-row';
    row.setAttribute('data-index', String(next));
    row.innerHTML = '' +
      '<div class="datecell">' +
        '<div class="datehead"><label>Date</label><button type="button" class="remove-time" data-index="' + next + '" title="Delete this time">×</button></div>' +
        '<input type="date" data-key="day_date_' + next + '" />' +
      '</div>' +
      '<div class="timecell">' +
        '<label>Time</label>' +
        '<input type="time" data-key="day_time_' + next + '" />' +
      '</div>';
    wrap.appendChild(row);
}

// Persistence
function read(){ try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch(e){ return {}; } }
function save(){
    const data = read();
    qsa('[data-key]').forEach(function(el){ data[el.getAttribute('data-key')] = el.value || ''; });
    const hidden = qs('[data-key="day_time"]');
    if (hidden) hidden.value = combinedPrimaryAppt();
    localStorage.setItem(KEY, JSON.stringify(data));
}
function load(){
    const data = read();
    qsa('[data-key]').forEach(function(el){
      const k = el.getAttribute('data-key');
      if (k in data) el.value = data[k];
    });
    qsa('.chips').forEach(function(group){
      const key = group.getAttribute('data-key');
      const val = data[key] || '';
      group.querySelectorAll('button').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-val')===val); });
    });
    renderPrompts();
    evaluateVisibility();
    updateNotesSummary();
}

// Conditional reveal
function evaluateVisibility(){
    qsa('[data-show-if]').forEach(function(box){
      const cond = box.getAttribute('data-show-if');
      var show = false;
      if (cond.indexOf('=') !== -1){
        const parts = cond.split('=');
        const key = parts[0].trim();
        const options = parts[1].split('|').map(function(s){ return s.trim(); });
        const active = qs('.chips[data-key="' + key + '"] button.active');
        const v = active ? active.getAttribute('data-val') : ((qs('[data-key="' + key + '"]') || {}).value || '');
        show = options.indexOf(v) !== -1;
      }
      if (show) box.classList.remove('hidden'); else box.classList.add('hidden');
    });
}

// Export builders (compact, no separators)
function nowStamp(){ return new Date().toLocaleString(); }
// esc() already defined at top of file
function getVal(key){
    const b = qs('.chips[data-key="' + key + '"] button.active');
    return b ? b.getAttribute('data-val') : '';
}
function getInput(key){
    const el = qs('[data-key="' + key + '"]');
    return ((el && el.value) || '').trim();
}
function bullet(label, value){
    if (!value) return '';
    return '- **' + label + ':** ' + value + '\n';
}
function joinNote(main, note){
    if (!main && !note) return '';
    return esc([main, note].filter(Boolean).join(' — '));
}
function combinedPrimaryAppt(){
    const d = (qs('[data-key="day_date_1"]') && qs('[data-key="day_date_1"]').value) || '';
    const t = (qs('[data-key="day_time_1"]') && qs('[data-key="day_time_1"]').value) || '';
    if (!d && !t) return '';
    if (d && t) return d + ' ' + t;
    return d || t;
}

function addSection(title, body){
    if (body && body.trim()){
      return '## ' + title + '\n' + body;
    }
    return '';
}

function buildMD(){
    var md = '';
    md += '# Seller Call Summary\n';
    md += '> Generated: **' + nowStamp() + '**\n';

    // sections
    var meta = '';
    meta += bullet('Prospect', esc(getInput('prospect_name')));
    meta += bullet('Property', esc(getInput('street_name')));
    meta += bullet('Your name', esc(getInput('your_name')));
    md += addSection('Metadata', meta);

    var intro = '';
    intro += bullet('Greeting response', joinNote(getVal('q1_speak'), getInput('q1_notes')));
    intro += bullet('Ownership status', joinNote(getVal('q3_owner'), getInput('q3_notes')));
    intro += bullet('Other properties', joinNote(getVal('q4_other_props'), getInput('q4_notes')));
    md += addSection('1. Introduction', intro);

    var warm = '';
    warm += bullet('Availability to talk', joinNote(getVal('q5_time'), getInput('q5_notes')));
    warm += bullet('Primary reason to sell', joinNote(getVal('q7_reason'), getInput('motivation_primary')));
    warm += bullet('Clarified reason', joinNote(getVal('motivation_clarifier'), getInput('motivation_other')));
    warm += bullet('Already with a Realtor', joinNote(getVal('realtor_already'), getInput('realtor_notes')));
    md += addSection('2. Warm Motivation', warm);

    var tl = '';
    tl += bullet('Readiness state', joinNote(getVal('timeline_state'), getInput('timeline_notes')));
    var tlJoin = [getVal('timeline_speed'), getInput('timeline_ideal')].filter(Boolean).join(' / ');
    tl += bullet('Ideal timing', joinNote(tlJoin, getInput('timeline_ideal_notes')));
    md += addSection('3. Timeline', tl);

    var prop = '';
    prop += bullet('Occupancy', joinNote(getVal('occupancy'), getInput('occupancy_notes')));
    prop += bullet('Overall condition', joinNote(getVal('condition_level'), getInput('condition_repairs')));
    prop += bullet('Readiness grade', joinNote(getVal('condition_grade'), getInput('condition_grade_notes')));
    md += addSection('4. Property', prop);

    var fin = '';
    fin += bullet('Issues present', joinNote(getVal('financial_issues'), getInput('financial_notes')));
    fin += bullet('Listing history', joinNote(getVal('past_listed'), getInput('past_listed_notes')));
    md += addSection('5. Financial', fin);

    var emo = '';
    emo += bullet('Seller goal', joinNote(getVal('emotional_theme'), getInput('emotional_why')));
    md += addSection('6. Emotional', emo);

    var dec = '';
    dec += bullet('Decision structure', joinNote(getVal('decision_structure'), getInput('decision_makers')));
    dec += bullet('Decision-maker availability', joinNote(getVal('decision_availability'), getInput('decision_notes')));
    md += addSection('7. Decision', dec);

    var qual = '';
    qual += bullet('60% ARV acceptance', joinNote(getVal('sixty_accept'), getInput('sixty_notes')));
    qual += bullet('Scheduling preference', joinNote(getVal('schedule_now'), getInput('qualify_notes')));
    md += addSection('8. Qualify', qual);

    var cls = '';
    cls += bullet('Close status', joinNote(getVal('close_confirm'), getInput('close_notes')));
    var primary = combinedPrimaryAppt();
    cls += bullet('Appointment', esc(primary));
    qsa('[data-key^="day_date_"]').forEach(function(inp){
      var key = inp.getAttribute('data-key');
      var idx = key.split('_').pop();
      if (idx === '1') return;
      var d = (qs('[data-key="day_date_' + idx + '"]') && qs('[data-key="day_date_' + idx + '"]').value || '').trim();
      var t = (qs('[data-key="day_time_' + idx + '"]') && qs('[data-key="day_time_' + idx + '"]').value || '').trim();
      if (d || t){
        var combo = d && t ? (d + ' ' + t) : (d || t);
        cls += bullet('Appointment', esc(combo));
      }
    });
    md += addSection('9. Close', cls);

    return md;
}

function download(filename, text, type){
    type = type || 'text/markdown';
    const blob = new Blob([text], {type:type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

// Update right panel notes summary
const NOTES_LABELS = {
    'q1_notes': 'Greeting response',
    'q3_notes': 'Ownership status',
    'q4_notes': 'Other properties',
    'q5_notes': 'Availability to talk',
    'motivation_primary': 'Primary reason to sell',
    'motivation_other': 'Clarified reason',
    'realtor_notes': 'Already with a Realtor',
    'timeline_notes': 'Readiness state',
    'timeline_ideal_notes': 'Ideal timing',
    'occupancy_notes': 'Occupancy',
    'condition_repairs': 'Overall condition',
    'condition_grade_notes': 'Readiness grade',
    'financial_notes': 'Issues present',
    'past_listed_notes': 'Listing history',
    'emotional_why': 'Seller goal',
    'decision_makers': 'Decision structure',
    'decision_notes': 'Decision-maker availability',
    'sixty_notes': '60% ARV acceptance',
    'qualify_notes': 'Scheduling preference',
    'close_notes': 'Close status',
    'dm_present_notes': 'Decision maker presence',
    'thanks_notes': 'Final notes'
};
function updateNotesSummary(){
    const summary = qs('#notes-summary');
    let html = '';
    for (const key in NOTES_LABELS){
      const val = getInput(key).trim();
      if (val){
        html += '<div class="note-item"><strong>' + esc(NOTES_LABELS[key]) + ':</strong> ' + esc(val) + '</div>';
      }
    }
    summary.innerHTML = html;
}

// Live updates
document.addEventListener('input', function(e){
    if (e.target.matches('[data-key]')){ save(); renderPrompts(); updateNotesSummary(); }
});

// Init
console.log('🚀 Cold Calls Workbook - Enhanced Version 2025-10-23-v4 Loaded');
console.log('✅ Advanced Section Builder with full question/response configuration');
console.log('✅ Fixed button duplication issues completely');
console.log('✅ Comprehensive logging for all developer operations');
loadDeveloperData();
renderPrompts();
load();

// Active TOC highlight
const sections = qsa('main section');
const links = qsa('.toc a');
function onScroll(){
let current = sections[0].id;
const fromTop = window.scrollY + 120;
sections.forEach(function(sec){ if (sec.offsetTop <= fromTop) current = sec.id; });
links.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
}
document.addEventListener('scroll', onScroll, {passive:true});
onScroll();

console.log('✅ COLD CALLS WORKBOOK LOADED - ALL FUNCTIONS IN GLOBAL SCOPE');