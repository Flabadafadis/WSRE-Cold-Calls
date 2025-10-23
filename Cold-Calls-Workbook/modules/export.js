// ================================================
// EXPORT - Markdown export functionality
// ================================================

function getVal(key) {
  const group = qs(`.chips[data-key="${key}"]`);
  if (!group) return '';
  const active = group.querySelector('button.active');
  return active ? active.getAttribute('data-val') : '';
}

function getInput(key) {
  const el = qs(`[data-key="${key}"]`);
  return ((el && el.value) || '').trim();
}

function bullet(label, value) {
  if (!value) return '';
  return `- **${label}:** ${value}\n`;
}

function addSection(title, body) {
  if (body && body.trim()) {
    return `## ${title}\n${body}\n`;
  }
  return '';
}

function buildMD() {
  let md = '';
  md += '# WSRE Cold Call Summary\n';
  md += '> Generated: **' + nowStamp() + '**\n\n';
  
  // Contact Info
  let contact = '';
  contact += bullet('Prospect', esc(getInput('prospect_name')));
  contact += bullet('Your Name', esc(getInput('your_name')));
  contact += bullet('Property Address', esc(getInput('street_name')));
  contact += bullet('Phone', esc(getInput('contact_phone')));
  contact += bullet('Email', esc(getInput('contact_email')));
  md += addSection('Contact Information', contact);
  
  // Opening & Verification
  let intro = '';
  intro += bullet('Initial Response', getVal('q1_answer'));
  if (getInput('q1_notes')) intro += bullet('Notes', esc(getInput('q1_notes')));
  intro += bullet('Owner Status', getVal('q2_owner'));
  if (getInput('q2_notes')) intro += bullet('Notes', esc(getInput('q2_notes')));
  intro += bullet('Time Availability', getVal('q3_time'));
  if (getInput('q3_notes')) intro += bullet('Notes', esc(getInput('q3_notes')));
  md += addSection('1. Opening & Verification', intro);
  
  // Motivation
  let motivation = '';
  motivation += bullet('Reason for Selling', getVal('q4_reason'));
  if (getInput('q4_notes')) motivation += `  - Details: ${esc(getInput('q4_notes'))}\n`;
  motivation += bullet('Realtor Status', getVal('q5_realtor'));
  if (getInput('q5_notes')) motivation += `  - Details: ${esc(getInput('q5_notes'))}\n`;
  motivation += bullet('Previous Listing', getVal('q6_previous'));
  if (getInput('q6_notes')) motivation += `  - Details: ${esc(getInput('q6_notes'))}\n`;
  md += addSection('2. Motivation & Current Situation', motivation);
  
  // Timeline
  let timeline = '';
  timeline += bullet('Timeline', getVal('q7_timeline'));
  if (getInput('timeline_specific')) timeline += `  - Specific Date: ${esc(getInput('timeline_specific'))}\n`;
  if (getInput('q7_notes')) timeline += `  - Notes: ${esc(getInput('q7_notes'))}\n`;
  timeline += bullet('Ideal Timing', getVal('q8_ideal'));
  if (getInput('q8_notes')) timeline += `  - Notes: ${esc(getInput('q8_notes'))}\n`;
  md += addSection('3. Timeline & Urgency', timeline);
  
  // Property
  let property = '';
  property += bullet('Occupancy', getVal('q9_occupancy'));
  if (getInput('q9_notes')) property += `  - Notes: ${esc(getInput('q9_notes'))}\n`;
  property += bullet('Condition', getVal('q10_condition'));
  if (getInput('q10_notes')) property += `  - Notes: ${esc(getInput('q10_notes'))}\n`;
  property += bullet('Repairs Needed', getVal('q11_repairs'));
  if (getInput('q11_notes')) property += `  - Notes: ${esc(getInput('q11_notes'))}\n`;
  md += addSection('4. Property Details & Condition', property);
  
  // Financial
  let financial = '';
  financial += bullet('Mortgage Status', getVal('q12_mortgage'));
  if (getInput('q12_notes')) financial += `  - Details: ${esc(getInput('q12_notes'))}\n`;
  financial += bullet('Taxes & Liens', getVal('q13_taxes'));
  if (getInput('q13_notes')) financial += `  - Details: ${esc(getInput('q13_notes'))}\n`;
  financial += bullet('Estimated Value', getVal('q14_value'));
  if (getInput('value_specific')) financial += `  - Specific Amount: $${esc(getInput('value_specific'))}\n`;
  if (getInput('q14_notes')) financial += `  - Notes: ${esc(getInput('q14_notes'))}\n`;
  md += addSection('5. Financial Situation', financial);
  
  // Goals
  let goals = '';
  goals += bullet('Primary Goal', getVal('q15_goal'));
  if (getInput('q15_notes')) goals += `  - Details: ${esc(getInput('q15_notes'))}\n`;
  goals += bullet('Walk-Away Amount', getVal('q16_walkaway'));
  if (getInput('walkaway_amount')) goals += `  - Amount: $${esc(getInput('walkaway_amount'))}\n`;
  if (getInput('q16_notes')) goals += `  - Notes: ${esc(getInput('q16_notes'))}\n`;
  md += addSection('6. Goals & Motivations', goals);
  
  // Decision Makers
  let decision = '';
  decision += bullet('Decision Structure', getVal('q17_decisionmaker'));
  if (getInput('q17_notes')) decision += `  - Details: ${esc(getInput('q17_notes'))}\n`;
  decision += bullet('Availability', getVal('q18_availability'));
  if (getInput('q18_notes')) decision += `  - Notes: ${esc(getInput('q18_notes'))}\n`;
  md += addSection('7. Decision Makers', decision);
  
  // Appointment
  let appt = '';
  appt += bullet('Appointment Interest', getVal('q19_appointment'));
  if (getInput('q19_notes')) appt += `  - Notes: ${esc(getInput('q19_notes'))}\n`;
  appt += bullet('Preferred Time', getVal('q20_when'));
  if (getInput('appt_day') || getInput('appt_time')) {
    appt += `  - Scheduled: ${esc(getInput('appt_day'))} at ${esc(getInput('appt_time'))}\n`;
  }
  if (getInput('q20_notes')) appt += `  - Notes: ${esc(getInput('q20_notes'))}\n`;
  appt += bullet('Confirmation Method', getVal('q21_confirm'));
  if (getInput('q21_notes')) appt += `  - Notes: ${esc(getInput('q21_notes'))}\n`;
  md += addSection('8. Setting the Appointment', appt);
  
  // Close
  let close = '';
  close += bullet('Additional Info', getVal('q22_additional'));
  if (getInput('q22_notes')) close += `  - Details: ${esc(getInput('q22_notes'))}\n`;
  close += bullet('Call Ending', getVal('q23_goodbye'));
  if (getInput('q23_notes')) close += `  - Notes: ${esc(getInput('q23_notes'))}\n`;
  md += addSection('9. Closing the Call', close);
  
  // Overall Notes
  if (getInput('overall_notes')) {
    md += addSection('Overall Call Notes', esc(getInput('overall_notes')));
  }
  
  return md;
}

function exportMarkdown() {
  const md = buildMD();
  const filename = `wsre_call_${getInput('prospect_name') || 'summary'}_${Date.now()}.md`;
  downloadFile(filename, md);
  showToast('Exported to ' + filename);
}

function copyToClipboard() {
  const md = buildMD();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(md).then(() => {
      showToast('Copied to clipboard!');
    }, () => {
      showToast('Unable to copy');
    });
  } else {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = md;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Copied to clipboard!');
    } catch(e) {
      showToast('Unable to copy');
    }
    document.body.removeChild(ta);
  }
}

console.log('✅ Export module loaded');
