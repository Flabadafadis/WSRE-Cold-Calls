// ================================================
// MAIN - Application initialization
// ================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 WSRE Cold Call Script v7.0 initializing...');
  
  try {
    // 0. Check for custom default preset first
    const customDefault = localStorage.getItem('wsre_default_preset');
    if (customDefault) {
      try {
        const sections = JSON.parse(customDefault);
        scriptSections.length = 0;
        scriptSections.push(...sections);
        console.log('✅ Custom default preset loaded');
      } catch (err) {
        console.warn('Failed to load custom default preset:', err);
      }
    }
    
    // 1. Render all sections from script content
    renderSections();
    console.log('✅ Sections rendered');
    
    // 2. Setup event handlers
    setupEventHandlers();
    console.log('✅ Event handlers active');
    
    // 3. Load saved data
    load();
    loadDeveloperData();
    console.log('✅ Data loaded');
    
    // 4. Update notes summary
    updateNotesSummary();
    
    // 5. Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+D = Toggle Developer Mode
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleDeveloperMode();
      }
      
      // Ctrl+S = Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        save();
        showToast('Saved!');
      }
      
      // Ctrl+E = Export
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportMarkdown();
      }
    });
    
    console.log('✅ Application ready!');
    console.log('💡 Press Ctrl+Shift+D for Developer Mode');
    console.log('💡 Press Ctrl+S to save');
    console.log('💡 Press Ctrl+E to export');
    
    // Welcome message
    setTimeout(() => {
      showToast('Ready to start! Fill in prospect details above.');
    }, 500);
    
  } catch (err) {
    console.error('❌ Initialization error:', err);
    alert('Error loading application. Check console for details.');
  }
});

console.log('✅ Main module loaded');
