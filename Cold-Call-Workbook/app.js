(function(){
  const qs = (sel) => document.querySelector(sel);
  const qsa = (sel) => Array.from(document.querySelectorAll(sel));
  const KEY = 'seller_call_workbook_v612';

  const TOKEN_TO_KEY = {
    'prospect': 'prospect_name',
    'name': 'your_name',
    'street name': 'street_name',
    'day/time': 'day_time'
  };

  // notes visible toggle
  document.addEventListener('click', function(e){
    if (e.target.classList.contains('notes-trigger')){
      const container = e.target.closest('.q') || e.target.parentElement;
      const notes = container ? container.querySelector('.notes') : null;
      if (!notes) return;
      notes.classList.toggle('collapsed');
      e.target.textContent = notes.classList.contains('collapsed') ? '＋ Add details' : '— Hide details';
    }
  });

  // build prompts with tokens
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
      return '<span class="token" contenteditable="true" data-token="' + token + '" data-tokenraw="' + raw + '">' + esc(inner) + '</span>';
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
    qsa('.prompt .token').forEach(function(span){
      span.addEventListener('input', function(){
        const token = span.getAttribute('data-token');
        const key = TOKEN_TO_KEY[token];
        const input = qs('[data-key="' + key + '"]');
        if (!input) return;
        input.value = span.textContent.trim();
        save();
        renderPrompts();
      });
    });
  }

  // chip toggle with unselect
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

  // sidebar controls
  document.addEventListener('click', function(e){
    if (e.target && e.target.id === 'export-md'){
      download('seller_call_summary.md', buildMD());
    } else if (e.target && e.target.id === 'copy-md'){
      const md = buildMD();
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(md).then(function(){ showToast('Copied to clipboard'); }, function(){ showToast('Unable to copy'); });
      } else {
        const ta = document.createElement('textarea');
        ta.value = md; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); showToast('Copied to clipboard'); } catch(e){ showToast('Unable to copy'); }
        document.body.removeChild(ta);
      }
    } else if (e.target && e.target.id === 'save'){
      save(); showToast('Saved');
    } else if (e.target && e.target.id === 'clear'){
      if (confirm('Clear all inputs?')) { localStorage.removeItem(KEY); location.reload(); }
    }
  });

  function showToast(msg){
    const t = qs('#toast');
    t.textContent = msg;
    t.classList.remove('hidden'); t.classList.add('show');
    setTimeout(function(){ t.classList.remove('show'); t.classList.add('hidden'); }, 1400);
  }

  // appointment rows add/remove
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
        '<label>Date</label>' +
        '<button type="button" class="remove-time" data-index="' + next + '" title="Delete this time">×</button>' +
        '<input type="date" data-key="day_date_' + next + '" />' +
      '</div>' +
      '<div class="timecell">' +
        '<label>Time</label>' +
        '<input type="time" data-key="day_time_' + next + '" />' +
      '</div>';
    wrap.appendChild(row);
  }

  // persistence
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
  }

  // conditional reveal
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

  // export builders
  function nowStamp(){ return new Date().toLocaleString(); }
  function esc(s){
    return (s||'').toString().replace(/[&<>"']/g, function(c){
      if (c==='&') return '&amp;';
      if (c==='<') return '&lt;';
      if (c==='>') return '&gt;';
      if (c==='"') return '&quot;';
      return '&#39;';
    });
  }
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

  function buildMD(){
    var md = '';
    md += '# Seller Call Summary\n\n';
    md += '> Generated: **' + nowStamp() + '**\n\n';
    md += '---\n\n';

    // Metadata
    var meta = '';
    meta += bullet('Prospect', esc(getInput('prospect_name')));
    meta += bullet('Property', esc(getInput('street_name')));
    meta += bullet('Your name', esc(getInput('your_name')));
    if (meta){ md += '## Metadata\n\n' + meta + '\n---\n\n'; }

    // 1 Intro
    var intro = '';
    intro += bullet('Greeting response', joinNote(getVal('q1_speak'), getInput('q1_notes')));
    intro += bullet('Ownership status', joinNote(getVal('q3_owner'), getInput('q3_notes')));
    intro += bullet('Other properties', joinNote(getVal('q4_other_props'), getInput('q4_notes')));
    if (intro){ md += '## 1. Introduction\n\n' + intro + '\n---\n\n'; }

    // 2 Warm
    var warm = '';
    warm += bullet('Availability to talk', joinNote(getVal('q5_time'), getInput('q5_notes')));
    warm += bullet('Primary reason to sell', joinNote(getVal('q7_reason'), getInput('motivation_primary')));
    warm += bullet('Already with a Realtor', joinNote(getVal('realtor_already'), getInput('realtor_notes')));
    warm += bullet('Clarified reason', joinNote(getVal('motivation_clarifier'), getInput('motivation_other')));
    if (warm){ md += '## 2. Warm Motivation\n\n' + warm + '\n---\n\n'; }

    // 3 Timeline
    var timeline = '';
    timeline += bullet('Readiness state', joinNote(getVal('timeline_state'), getInput('timeline_notes')));
    var tlJoin = [getVal('timeline_speed'), getInput('timeline_ideal')].filter(Boolean).join(' / ');
    timeline += bullet('Ideal timing', joinNote(tlJoin, getInput('timeline_ideal_notes')));
    if (timeline){ md += '## 3. Timeline\n\n' + timeline + '\n---\n\n'; }

    // 4 Property
    var prop = '';
    prop += bullet('Occupancy', joinNote(getVal('occupancy'), getInput('occupancy_notes')));
    prop += bullet('Overall condition', joinNote(getVal('condition_level'), getInput('condition_repairs')));
    prop += bullet('Readiness grade', joinNote(getVal('condition_grade'), getInput('condition_grade_notes')));
    if (prop){ md += '## 4. Property\n\n' + prop + '\n---\n\n'; }

    // 5 Financial
    var fin = '';
    fin += bullet('Issues present', joinNote(getVal('financial_issues'), getInput('financial_notes')));
    fin += bullet('Listing history', joinNote(getVal('past_listed'), getInput('past_listed_notes')));
    if (fin){ md += '## 5. Financial\n\n' + fin + '\n---\n\n'; }

    // 6 Emotional
    var emo = '';
    emo += bullet('Seller goal', joinNote(getVal('emotional_theme'), getInput('emotional_why')));
    if (emo){ md += '## 6. Emotional\n\n' + emo + '\n---\n\n'; }

    // 7 Decision
    var dec = '';
    dec += bullet('Decision structure', joinNote(getVal('decision_structure'), getInput('decision_makers')));
    dec += bullet('Decision-maker availability', joinNote(getVal('decision_availability'), getInput('decision_notes')));
    if (dec){ md += '## 7. Decision\n\n' + dec + '\n---\n\n'; }

    // 8 Qualify
    var qual = '';
    qual += bullet('60% ARV acceptance', joinNote(getVal('sixty_accept'), getInput('sixty_notes')));
    qual += bullet('Scheduling preference', joinNote(getVal('schedule_now'), getInput('qualify_notes')));
    if (qual){ md += '## 8. Qualify\n\n' + qual + '\n---\n\n'; }

    // 9 Close + appointments
    var cls = '';
    cls += bullet('Close status', joinNote(getVal('close_confirm'), getInput('close_notes')));
    var primary = combinedPrimaryAppt();
    cls += bullet('Appointment', esc(primary));
    // additional appointments
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
    if (cls){ md += '## 9. Close\n\n' + cls + '\n---\n\n'; }

    return md;
  }

  function download(filename, text, type){
    type = type || 'text/markdown';
    const blob = new Blob([text], {type:type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  // live updates
  document.addEventListener('input', function(e){
    if (e.target.matches('[data-key]')){ save(); renderPrompts(); }
  });

  // init
  renderPrompts();
  load();

  // Active TOC link on scroll
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
})();