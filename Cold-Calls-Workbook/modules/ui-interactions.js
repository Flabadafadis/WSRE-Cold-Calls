// ================================================
// UI INTERACTIONS - Rendering and event handling
// ================================================

// Helper to create short label from question prompt
function createShortLabel(prompt) {
  if (!prompt) return 'Notes';
  
  // Remove "Hey, is this [prospect]?" type questions - just get the core
  let label = prompt
    .replace(/^(Hey,?|Hi,?|Cool!|Great!|Awesome!|Perfect!|Alright,?)\s*/i, '')
    .replace(/\[prospect\]|\[name\]|\[street name\]|\[day\/time\]/g, '')
    .replace(/[?!.]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // If too long, take first meaningful part
  if (label.length > 40) {
    const parts = label.split(/[,;—]/);
    label = parts[0].trim();
  }
  
  // Still too long? Cut it
  if (label.length > 40) {
    label = label.substring(0, 37) + '...';
  }
  
  return label || 'Notes';
}

// Replace tokens in prompts with actual values
function updateTokens() {
  const prospectName = qs('[data-key="prospect_name"]')?.value || '[prospect]';
  const yourName = qs('[data-key="your_name"]')?.value || '[name]';
  const streetName = qs('[data-key="street_name"]')?.value || '[street name]';
  const dayTime = qs('[data-key="appointment_datetime"]')?.value || '[day/time]';
  
  // Update all prompts that have tokens
  qsa('.prompt[data-tpl]').forEach(prompt => {
    const template = prompt.getAttribute('data-tpl');
    const updated = template
      .replace(/\[prospect\]/g, prospectName)
      .replace(/\[name\]/g, yourName)
      .replace(/\[street name\]/g, streetName)
      .replace(/\[day\/time\]/g, dayTime);
    
    prompt.textContent = updated;
  });
}

function renderSections() {
  const main = qs('.content');
  if (!main) {
    console.error('Main content area not found!');
    return;
  }
  
  main.innerHTML = '';
  
  scriptSections.forEach(section => {
    const sectionEl = document.createElement('section');
    sectionEl.id = section.id;
    sectionEl.className = 'card';
    
    const title = document.createElement('h2');
    title.textContent = section.title;
    sectionEl.appendChild(title);
    
    section.questions.forEach(q => {
      const qDiv = document.createElement('div');
      qDiv.className = 'q';
      
      // Handle different question types
      if (q.type === 'fields') {
        // Input fields group
        const grid = document.createElement('div');
        grid.className = 'grid grid-' + q.fields.length;
        q.fields.forEach(field => {
          const label = document.createElement('label');
          label.innerHTML = `${field.label} <input data-key="${field.key}" placeholder="${field.placeholder || ''}" />`;
          grid.appendChild(label);
        });
        qDiv.appendChild(grid);
      } else if (q.type === 'notes_only') {
        // Notes-only question
        const prompt = document.createElement('div');
        prompt.className = 'prompt';
        prompt.textContent = q.prompt;
        qDiv.appendChild(prompt);
        
        const notes = document.createElement('div');
        notes.className = 'notes';
        const notesLabel = document.createElement('div');
        notesLabel.style.cssText = 'font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;';
        notesLabel.textContent = createShortLabel(q.prompt);
        notes.appendChild(notesLabel);
        
        const textarea = document.createElement('textarea');
        textarea.setAttribute('data-key', q.key);
        textarea.placeholder = q.placeholder || '';
        textarea.style.minHeight = '100px';
        notes.appendChild(textarea);
        qDiv.appendChild(notes);
      } else {
        // Standard question with prompt and responses
        if (q.prompt) {
          const prompt = document.createElement('div');
          prompt.className = 'prompt';
          prompt.setAttribute('data-tpl', q.prompt);
          prompt.textContent = q.prompt;
          qDiv.appendChild(prompt);
        }
        
        // Response chips
        if (q.responses && q.responses.length > 0) {
          const chips = document.createElement('div');
          chips.className = 'chips';
          chips.setAttribute('data-key', q.key);
          
          q.responses.forEach(response => {
            const btn = document.createElement('button');
            btn.setAttribute('data-val', response);
            btn.textContent = response;
            chips.appendChild(btn);
          });
          
          qDiv.appendChild(chips);
        }
        
        // Single field
        if (q.field) {
          const input = document.createElement('input');
          input.setAttribute('data-key', q.field.key);
          input.placeholder = q.field.placeholder || '';
          if (q.field.type) input.type = q.field.type;
          qDiv.appendChild(input);
        }
        
        // Multiple fields
        if (q.fields) {
          const grid = document.createElement('div');
          grid.className = 'grid grid-' + q.fields.length;
          grid.style.marginTop = '10px';
          q.fields.forEach(field => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.setAttribute('data-key', field.key);
            input.placeholder = field.placeholder || '';
            if (field.type) input.type = field.type;
            label.innerHTML = field.label + ' ';
            label.appendChild(input);
            grid.appendChild(label);
          });
          qDiv.appendChild(grid);
        }
        
        // Add notes section with label
        if (q.type !== 'notes_only') {
          const notesTrigger = document.createElement('button');
          notesTrigger.type = 'button';
          notesTrigger.className = 'notes-trigger';
          notesTrigger.textContent = '＋ Add details';
          qDiv.appendChild(notesTrigger);
          
          const notes = document.createElement('div');
          notes.className = 'notes collapsed';
          
          // Add label for the notes
          const notesLabel = document.createElement('div');
          notesLabel.style.cssText = 'font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;';
          notesLabel.textContent = createShortLabel(q.prompt);
          notes.appendChild(notesLabel);
          
          const textarea = document.createElement('textarea');
          textarea.setAttribute('data-key', q.key + '_notes');
          textarea.placeholder = 'Additional context or notes';
          notes.appendChild(textarea);
          qDiv.appendChild(notes);
        }
      }
      
      sectionEl.appendChild(qDiv);
    });
    
    main.appendChild(sectionEl);
  });
  
  console.log('✅ Rendered', scriptSections.length, 'sections');
  
  // Initial token update
  updateTokens();
}

function updateNotesSummary() {
  const summary = qs('#notes-summary');
  if (!summary) return;
  
  let html = '<div style="font-size: 12px; line-height: 1.6;">';
  
  // Collect all active responses
  qsa('.chips').forEach(group => {
    const key = group.getAttribute('data-key');
    const active = group.querySelector('button.active');
    if (active) {
      const val = active.getAttribute('data-val');
      const question = group.closest('.q')?.querySelector('.prompt')?.textContent;
      if (question) {
        html += `<div style="margin-bottom: 8px; padding: 6px; background: #f8fafc; border-radius: 4px;">`;
        html += `<strong style="color: #475569; font-size: 11px;">${esc(createShortLabel(question))}</strong><br>`;
        html += `<span style="color: #667eea; font-weight: 600;">${esc(val)}</span>`;
        html += `</div>`;
      }
    }
  });
  
  // Collect notes
  qsa('textarea[data-key]').forEach(textarea => {
    if (textarea.value.trim()) {
      const key = textarea.getAttribute('data-key');
      // Get the label from the notes section
      const notesDiv = textarea.closest('.notes');
      const label = notesDiv?.querySelector('div')?.textContent || 'Notes';
      
      html += `<div style="margin-bottom: 8px; padding: 6px; background: #fef3c7; border-radius: 4px;">`;
      html += `<strong style="color: #92400e; font-size: 11px;">📝 ${esc(label)}</strong><br>`;
      html += `<span style="color: #78350f; font-size: 12px;">${esc(textarea.value.substring(0, 100))}${textarea.value.length > 100 ? '...' : ''}</span>`;
      html += `</div>`;
    }
  });
  
  html += '</div>';
  summary.innerHTML = html || '<p style="color: #94a3b8; font-size: 13px;">Your responses will appear here...</p>';
}

// Event handlers
function setupEventHandlers() {
  // Chip selection
  document.addEventListener('click', (e) => {
    if (e.target.matches('.chips button')) {
      const button = e.target;
      const group = button.closest('.chips');
      
      // Toggle active state
      const wasActive = button.classList.contains('active');
      group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      if (!wasActive) {
        button.classList.add('active');
      }
      
      save();
      updateNotesSummary();
    }
  });
  
  // Notes triggers
  document.addEventListener('click', (e) => {
    if (e.target.matches('.notes-trigger')) {
      const notes = e.target.nextElementSibling;
      if (notes && notes.classList.contains('notes')) {
        notes.classList.toggle('collapsed');
        e.target.textContent = notes.classList.contains('collapsed') ? '＋ Add details' : '− Hide details';
      }
    }
  });
  
  // Input changes
  document.addEventListener('input', (e) => {
    if (e.target.matches('[data-key]')) {
      // Update tokens if this is a token field
      const key = e.target.getAttribute('data-key');
      if (key === 'prospect_name' || key === 'your_name' || key === 'street_name' || key === 'appointment_datetime') {
        updateTokens();
      }
      
      save();
      updateNotesSummary();
    }
  });
  
  // Sidebar buttons
  qs('#export-md')?.addEventListener('click', exportMarkdown);
  qs('#copy-md')?.addEventListener('click', copyToClipboard);
  qs('#save')?.addEventListener('click', () => {
    save();
    showToast('Saved!');
  });
  qs('#clear')?.addEventListener('click', () => {
    if (confirm('Clear all data? This cannot be undone.')) {
      localStorage.removeItem(KEY);
      localStorage.removeItem(DEV_KEY);
      location.reload();
    }
  });
  qs('#developer')?.addEventListener('click', toggleDeveloperMode);
  
  console.log('✅ Event handlers setup');
}

console.log('✅ UI interactions module loaded');
