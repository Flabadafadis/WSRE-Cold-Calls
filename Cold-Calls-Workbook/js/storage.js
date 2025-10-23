// Data persistence functions
function saveDeveloperData() {
  devLog('💾 Saving developer data...');
  const sections = [];
  qsa('.content section').forEach(function(sec){
    const sectionData = {
      id: sec.id || 'section-' + Date.now(),
      title: sec.querySelector('h2') ? sec.querySelector('h2').textContent : 'Untitled',
      questions: []
    };
    
    sec.querySelectorAll('.q').forEach(function(qDiv){
      const prompt = qDiv.querySelector('.prompt');
      const chips = qDiv.querySelector('.chips');
      const questionData = {
        prompt: prompt ? prompt.getAttribute('data-tpl') : '',
        chipsKey: chips ? chips.getAttribute('data-key') : '',
        responses: []
      };
      
      if (chips) {
        chips.querySelectorAll('button[data-val]').forEach(function(btn){
          questionData.responses.push(btn.getAttribute('data-val'));
        });
      }
      
      sectionData.questions.push(questionData);
    });
    
    sections.push(sectionData);
  });
  
  const devData = { sections: sections };
  localStorage.setItem(DEV_KEY, JSON.stringify(devData));
  devLog('✅ Saved ' + sections.length + ' sections');
}

function loadDeveloperData() {
  devLog('📂 Loading developer data...');
  const dataStr = localStorage.getItem(DEV_KEY);
  if (!dataStr) {
    devLog('No developer data found');
    return;
  }
  
  try {
    const data = JSON.parse(dataStr);
    if (!data.sections || data.sections.length === 0) {
      devLog('No sections data or empty, using old load');
      loadOldChipsData();
      return;
    }
    
    devLog('📊 Found ' + data.sections.length + ' saved sections');
    // Data loaded, sections will be rendered from HTML
    
  } catch(e) {
    devLog('❌ Error parsing developer data: ' + e.message);
  }
}

function loadOldChipsData() {
  const chipsElements = qsa('.chips');
  devLog('Found ' + chipsElements.length + ' chips elements');
  
  chipsElements.forEach(function(chips, idx){
    const key = chips.getAttribute('data-key');
    devLog('Chips ' + idx + ' key: ' + key + ', has ' + chips.querySelectorAll('button').length + ' buttons');
    const dataStr = localStorage.getItem(DEV_KEY);
    if (dataStr) {
      try {
        const data = JSON.parse(dataStr);
        if (data[key]) {
          devLog('Loading data for ' + key);
          chips.innerHTML = '';
          data[key].forEach(function(val){
            const btn = document.createElement('button');
            btn.setAttribute('data-val', val);
            btn.textContent = val;
            chips.appendChild(btn);
          });
        } else {
          devLog('No data for ' + key + ', leaving as is');
        }
      } catch(e) {
        devLog('Error parsing data: ' + e.message);
      }
    }
  });
  devLog('Developer data loaded');
}
