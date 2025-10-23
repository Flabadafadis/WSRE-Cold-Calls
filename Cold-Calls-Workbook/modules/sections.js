// Section management - add, delete, reorder sections

function addSection(afterSectionId) {
  devLog(`🚨🚨🚨 addSection() FUNCTION STARTED with afterSectionId: ${afterSectionId}`);
  alert('🚨 addSection() function STARTED! afterSectionId: ' + afterSectionId);
  
  try {
    devLog('🔍 Attempting to find section: ' + afterSectionId);
    const afterSection = qs(`#${afterSectionId}`);
    
    if (!afterSection) {
      devLog(`❌ CRITICAL: Could not find section with id: ${afterSectionId}`);
      alert('❌ ERROR: Could not find section ' + afterSectionId);
      return;
    }
    
    devLog('✅ Found after section: ' + afterSectionId);
    alert('✅ Found section, proceeding to create new section...');
    
    const sections = qsa('.section');
    devLog(`📊 Current section count: ${sections.length}`);
    
    const currentNum = parseInt(afterSectionId.replace('section', ''));
    devLog(`🔢 Current section number: ${currentNum}`);
    
    const newNum = sections.length + 1;
    devLog(`🔢 New section number will be: ${newNum}`);
    alert('Creating section #' + newNum);
    
    const newSection = document.createElement('div');
    newSection.className = 'section';
    newSection.id = `section${newNum}`;
    devLog(`🏗️ Created new section div with id: section${newNum}`);
    
    newSection.innerHTML = `
      <div class="question-panel">
        <div class="question-text" contenteditable="true">New Question ${newNum}</div>
        <div class="response-chips">
          <span class="chip">Yes</span>
          <span class="chip">No</span>
          <span class="chip">Maybe</span>
        </div>
      </div>
    `;
    devLog('📝 Set innerHTML for new section');
    
    afterSection.insertAdjacentElement('afterend', newSection);
    devLog(`✅ Inserted new section after ${afterSectionId}`);
    alert('✅ Section created successfully!');
    
    if (developerMode) {
      devLog('🔧 Developer mode active, adding prompt controls');
      addPromptControls(newSection);
    }
    
    updateSidebarNavigation();
    devLog('📋 Updated sidebar navigation');
    
    saveDeveloperData();
    devLog('💾 Saved developer data');
    
    showToast(`Section ${newNum} added!`);
    devLog(`✅✅✅ addSection() COMPLETED SUCCESSFULLY for section${newNum}`);
    alert('🎉 addSection() completed!');
    
  } catch (err) {
    devLog(`❌❌❌ CRITICAL ERROR in addSection(): ${err.message}`);
    devLog(`Stack trace: ${err.stack}`);
    alert('❌ CRITICAL ERROR: ' + err.message);
    console.error('addSection error:', err);
  }
}

function deleteSection(sectionId) {
  devLog(`🗑️ deleteSection() called for ${sectionId}`);
  
  try {
    const section = qs(`#${sectionId}`);
    if (!section) {
      devLog(`❌ Section ${sectionId} not found`);
      return;
    }
    
    const sections = qsa('.section');
    if (sections.length <= 1) {
      devLog('⚠️ Cannot delete last section');
      showToast('Cannot delete the last section');
      return;
    }
    
    section.remove();
    devLog(`✅ Deleted section ${sectionId}`);
    
    updateSidebarNavigation();
    saveDeveloperData();
    showToast(`Section deleted`);
    
  } catch (err) {
    devLog(`❌ Error deleting section: ${err.message}`);
    console.error('Delete section error:', err);
  }
}

function updateSidebarNavigation() {
  devLog('📋 updateSidebarNavigation() called');
  
  try {
    const nav = qs('#question-nav');
    if (!nav) {
      devLog('⚠️ Navigation element not found');
      return;
    }
    
    const sections = qsa('.section');
    devLog(`📋 Found ${sections.length} sections to add to navigation`);
    
    nav.innerHTML = '<h3>Questions</h3>';
    
    sections.forEach((sec, idx) => {
      const panel = sec.querySelector('.question-panel');
      const questionText = panel?.querySelector('.question-text')?.textContent || `Question ${idx + 1}`;
      
      const navItem = document.createElement('div');
      navItem.className = 'nav-item';
      navItem.textContent = `${idx + 1}. ${questionText.substring(0, 30)}...`;
      navItem.dataset.section = sec.id;
      
      navItem.addEventListener('click', () => {
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      
      nav.appendChild(navItem);
    });
    
    devLog(`✅ Navigation updated with ${sections.length} items`);
    
  } catch (err) {
    devLog(`❌ Error updating navigation: ${err.message}`);
    console.error('Navigation error:', err);
  }
}

function addGreenSectionButtons() {
  devLog('🟢 addGreenSectionButtons() called');
  
  try {
    const existingButtons = qsa('.green-add-section-btn');
    devLog(`🟢 Found ${existingButtons.length} existing green buttons - removing them`);
    existingButtons.forEach(btn => btn.remove());
    
    const sections = qsa('.section');
    devLog(`🟢 Found ${sections.length} sections`);
    
    sections.forEach((sec, idx) => {
      devLog(`🟢 Processing section ${idx + 1} (${sec.id})`);
      
      let btnContainer = sec.querySelector('.green-section-btn-container');
      if (!btnContainer) {
        btnContainer = document.createElement('div');
        btnContainer.className = 'green-section-btn-container';
        btnContainer.style.cssText = 'text-align: center; margin: 15px 0; padding: 10px; background: #e8f5e9; border-radius: 8px;';
        sec.appendChild(btnContainer);
        devLog(`🟢 Created new button container for ${sec.id}`);
      } else {
        btnContainer.innerHTML = '';
        devLog(`🟢 Cleared existing button container for ${sec.id}`);
      }
      
      const btn = document.createElement('button');
      btn.className = 'green-add-section-btn';
      btn.textContent = '➕ Add Question Here';
      btn.style.cssText = 'background: #4CAF50; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;';
      btn.dataset.afterSection = sec.id;
      
      devLog(`🟢 Created button #${idx + 1} for section ${sec.id}`);
      
      btn.addEventListener('click', function(e) {
        devLog(`🚨 GREEN ADD SECTION BUTTON #${idx + 1} CLICKED!`);
        devLog(`🚨 Button dataset.afterSection: ${this.dataset.afterSection}`);
        devLog(`🚨 About to call addSection() with: ${this.dataset.afterSection}`);
        alert('🚨 GREEN BUTTON CLICKED! Calling addSection()...');
        
        try {
          devLog(`🚨 EXECUTING: addSection("${this.dataset.afterSection}")`);
          addSection(this.dataset.afterSection);
          devLog(`🚨 addSection() call completed`);
        } catch (btnErr) {
          devLog(`❌ ERROR calling addSection from button: ${btnErr.message}`);
          alert('❌ Button error: ' + btnErr.message);
          console.error('Button click error:', btnErr);
        }
      });
      
      btnContainer.appendChild(btn);
      devLog(`✅ Added green button #${idx + 1} to ${sec.id}`);
    });
    
    devLog(`✅ All green section buttons added (${sections.length} total)`);
    
  } catch (err) {
    devLog(`❌ Error in addGreenSectionButtons(): ${err.message}`);
    console.error('Green buttons error:', err);
  }
}

console.log('✅ Sections module loaded');
