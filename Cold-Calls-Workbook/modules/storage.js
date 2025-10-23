// ================================================
// STORAGE - Save/Load functionality
// ================================================

function save() {
  try {
    const data = {};
    
    // Save all input fields
    qsa('[data-key]').forEach(el => {
      const key = el.getAttribute('data-key');
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        data[key] = el.value || '';
      }
    });
    
    // Save all chip selections
    qsa('.chips').forEach(group => {
      const key = group.getAttribute('data-key');
      const active = group.querySelector('button.active');
      if (active) {
        data[key] = active.getAttribute('data-val');
      }
    });
    
    // Save developer mode data if applicable
    if (developerMode) {
      const devData = {
        prompts: {},
        customSections: []
      };
      
      qsa('.prompt[data-tpl]').forEach(p => {
        const key = p.closest('.q')?.querySelector('.chips')?.getAttribute('data-key');
        if (key) {
          devData.prompts[key] = p.getAttribute('data-tpl');
        }
      });
      
      localStorage.setItem(DEV_KEY, JSON.stringify(devData));
    }
    
    localStorage.setItem(KEY, JSON.stringify(data));
    showToast('Saved successfully!');
  } catch (err) {
    console.error('Save error:', err);
    showToast('Error saving data');
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    
    const data = JSON.parse(raw);
    
    // Load all input fields
    Object.keys(data).forEach(key => {
      const el = qs(`[data-key="${key}"]`);
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
        el.value = data[key];
      }
    });
    
    // Load all chip selections
    qsa('.chips').forEach(group => {
      const key = group.getAttribute('data-key');
      const val = data[key];
      if (val) {
        group.querySelectorAll('button').forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-val') === val);
        });
      }
    });
    
    updateNotesSummary();
  } catch (err) {
    console.error('Load error:', err);
  }
}

function loadDeveloperData() {
  try {
    const raw = localStorage.getItem(DEV_KEY);
    if (!raw) return;
    
    const devData = JSON.parse(raw);
    
    // Restore custom prompts
    if (devData.prompts) {
      Object.keys(devData.prompts).forEach(key => {
        const group = qs(`.chips[data-key="${key}"]`);
        if (group) {
          const prompt = group.closest('.q').querySelector('.prompt');
          if (prompt) {
            prompt.setAttribute('data-tpl', devData.prompts[key]);
            prompt.textContent = devData.prompts[key];
          }
        }
      });
    }
  } catch (err) {
    console.error('Load developer data error:', err);
  }
}

console.log('✅ Storage module loaded');
