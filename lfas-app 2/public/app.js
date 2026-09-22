import { DOMAINS, MODIFIERS, LEVELS, NA, MIN_ASSESSABLE, newAssessment, calculate, resultText } from './scoring.js';
const colors = ['#0e1b33','#2f5067','#60809e','#a8c0d4'];
const inks = ['#fff','#fff','#fff','#0e1b33'];
let state = newAssessment();
let summaryShown = false;
let autoSummary = true;
const $ = id => document.getElementById(id);
const theme = i => `--domain:${colors[i]};--head-ink:${inks[i]}`;
$('domains').innerHTML = DOMAINS.map((d,i) => `<section class="domain" id="domain-${i}" style="${theme(i)}" aria-labelledby="domain-title-${i}"><header class="domain-head"><span class="domain-number" aria-hidden="true">0${i+1}</span><div class="eyebrow">DOMAIN ${i+1}</div><h2 id="domain-title-${i}">${d.name}</h2><p>${d.description}</p></header><div>${d.signs.map((sign,j) => `<div class="sign unscored-sign" id="row-${i}-${j}"><div class="sign-name" id="sign-${i}-${j}"><span class="sign-index" aria-hidden="true">${String(j+1).padStart(2,'0')}</span>${sign}</div><div class="score-options" role="radiogroup" aria-labelledby="sign-${i}-${j}">${LEVELS.map((label,k) => `<button class="score" role="radio" aria-checked="false" aria-label="${k} — ${label}" title="${label}" tabindex="${k === 0 ? 0 : -1}" data-domain="${i}" data-sign="${j}" data-value="${k}">${k}</button>`).join('')}<button class="score na-score" role="radio" aria-checked="false" aria-label="N/A — Not assessable" title="Not assessable; excluded from average" tabindex="-1" data-domain="${i}" data-sign="${j}" data-value="NA">N/A</button></div><button class="clear-sign" data-clear-domain="${i}" data-clear-sign="${j}" aria-label="Clear ${sign} to blank" disabled>Clear</button><span class="sign-state" id="state-${i}-${j}">Unscored</span></div>`).join('')}</div><div class="domain-bottom"><div><span id="domain-state-${i}">Incomplete</span><small id="domain-progress-${i}"></small></div><div><strong id="average-${i}">—</strong><span class="out-of"> / 4</span></div></div></section>`).join('');
document.querySelector('.domain-nav').innerHTML = DOMAINS.map((d,i) => `<a href="#domain-${i}" style="${theme(i)}"><span class="nav-dot"></span><span class="nav-label">${d.name}</span><span class="nav-score" id="nav-score-${i}">—</span></a>`).join('');
$('profile').innerHTML = DOMAINS.map((d,i) => `<div class="profile-item" style="${theme(i)}"><div class="profile-label"><span>${d.name}</span><strong id="profile-score-${i}">—</strong></div><div class="bar" aria-hidden="true"><span id="bar-${i}" style="width:0%"></span></div><small class="profile-state" id="profile-state-${i}"></small></div>`).join('');
$('modifiers').innerHTML = MODIFIERS.map((name,i) => `<div class="modifier"><span class="modifier-label" id="modifier-${i}">${name}</span><div class="binary" role="radiogroup" aria-labelledby="modifier-${i}"><button role="radio" aria-checked="false" tabindex="0" data-modifier="${i}" data-value="yes">Yes</button><button role="radio" aria-checked="false" tabindex="-1" data-modifier="${i}" data-value="no">No</button></div></div>`).join('');
const functionalSection = document.querySelector('.functional');
function setView(show) {
  if (show && !calculate(state).complete) return;
  summaryShown = show;
  $('assessment-view').hidden = show;
  $('completed-view').hidden = !show;
  (show ? $('functional-summary-home') : $('functional-home')).append(functionalSection);
  $('functional-editor').open = false;
  window.scrollTo({top:0,behavior:'instant'});
  if (show) $('completed-title').focus({preventScroll:true});
  else $('reset').focus({preventScroll:true});
}
function renderCompleted(r) {
  if (!r.complete) {
    $('completed-domains').replaceChildren();
    for (const id of ['completed-overall','completed-primary','completed-secondary','positive-modifiers','functional-coverage','completed-coverage','completed-pattern-note']) $(id).textContent = '';
    return;
  }
  $('completed-coverage').textContent = `${r.answered} signs assessed · ${r.na} N/A · All four domains complete`;
  $('completed-domains').innerHTML = DOMAINS.map((d,i) => `<article class="completed-domain" style="${theme(i)}"><div class="eyebrow">DOMAIN ${i+1}</div><h2>${d.name}</h2><div class="completed-domain-value">${r.domains[i].average.toFixed(1)}<span> / 4</span></div><div class="bar" aria-hidden="true"><span style="width:${r.domains[i].average*25}%"></span></div><p>${r.domains[i].answered} of ${r.domains[i].total} signs assessable${r.domains[i].na ? ` · ${r.domains[i].na} N/A` : ''}</p></article>`).join('');
  $('completed-overall').textContent = r.overall.toFixed(1);
  $('completed-primary').textContent = r.primary;
  $('completed-secondary').textContent = r.secondary;
  $('completed-pattern-note').textContent = r.mixed ? 'Mixed Pattern · Leading domains are within 0.5 points of the highest score.' : 'Drivers reflect completed domain averages. Functional modifiers remain separate.';
  const positive = MODIFIERS.filter((_,i) => state.functional[i] === true);
  const unassessed = MODIFIERS.filter((_,i) => state.functional[i] === null);
  $('positive-modifiers').textContent = `Positive: ${positive.join(', ') || (unassessed.length ? 'none recorded' : 'none')}.`;
  $('functional-coverage').textContent = unassessed.length ? `Not assessed: ${unassessed.join(', ')}.` : 'All six functional modifiers assessed.';
}
function update() {
  const r = calculate(state);
  r.domains.forEach((d,i) => {
    const value = d.average === null ? '—' : d.average.toFixed(1);
    const label = d.insufficient ? 'Insufficient assessable items' : d.complete ? 'Domain average' : 'Incomplete';
    $(`average-${i}`).textContent = value;
    $(`nav-score-${i}`).textContent = value;
    $(`profile-score-${i}`).textContent = value;
    $(`profile-state-${i}`).textContent = d.complete ? `${d.answered}/${d.total} assessable${d.na ? ` · ${d.na} N/A` : ''}` : label;
    $(`domain-state-${i}`).textContent = label;
    $(`domain-progress-${i}`).textContent = `${d.answered}/${d.total} scored · ${d.na} N/A${d.remaining ? ` · ${d.remaining} blank` : ''}${d.insufficient ? ` · Minimum ${MIN_ASSESSABLE} scores required` : ''}`;
    $(`bar-${i}`).style.width = `${(d.average ?? 0)*25}%`;
    state.scores[i].forEach((value,j) => {
      const row = $(`row-${i}-${j}`);
      row.classList.toggle('unscored-sign',value === null);
      row.querySelector('.clear-sign').disabled = value === null;
      $(`state-${i}-${j}`).textContent = value === null ? 'Unscored' : value === NA ? 'Not assessable' : LEVELS[value];
    });
  });
  const invalid = r.domains.filter(d=>d.insufficient).length;
  $('completion').textContent = r.complete ? `${r.answered} scored · ${r.na} N/A · Complete` : `Assessment incomplete — ${r.remaining} ${r.remaining === 1 ? 'sign' : 'signs'} remaining${invalid ? ` · ${invalid} ${invalid === 1 ? 'domain needs' : 'domains need'} more assessable items` : ''}`;
  $('progress').value = r.resolved;
  $('overall').textContent = r.overall === null ? '—' : r.overall.toFixed(1);
  $('primary').textContent = r.primary;
  $('secondary').textContent = r.secondary;
  $('pattern-note').textContent = r.complete ? (r.mixed ? 'Mixed Pattern · Leading domains are within 0.5 points of the highest score.' : 'Drivers use completed domain averages. Functional modifiers do not affect these scores.') : `Complete each sign with 0–4 or N/A. Each domain requires at least ${MIN_ASSESSABLE} numeric scores; N/A is excluded from the average.`;
  $('copy').disabled = !r.complete;
  $('view-summary').disabled = !r.complete;
  $('copy-help').textContent = r.complete ? 'Copy your scores and functional modifiers to the EMR.' : 'Complete all four domains to copy an EMR-ready summary.';
  $('status').textContent = '';
  $('summary-status').textContent = '';
  renderCompleted(r);
  if (!r.complete && summaryShown) setView(false);
  if (r.complete && autoSummary) { autoSummary = false; setView(true); }
}
function select(button) {
  const group = button.closest('[role=radiogroup]');
  for (const b of group.querySelectorAll('[role=radio]')) { b.setAttribute('aria-checked',String(b === button)); b.tabIndex = b === button ? 0 : -1; }
  if (button.dataset.domain !== undefined) state.scores[Number(button.dataset.domain)][Number(button.dataset.sign)] = button.dataset.value === NA ? NA : Number(button.dataset.value);
  else state.functional[Number(button.dataset.modifier)] = button.dataset.value === 'yes';
  update();
}
document.addEventListener('click', e => {
  const b = e.target.closest('button[role=radio]');
  if (b) select(b);
  const clear = e.target.closest('[data-clear-domain]');
  if (clear) {
    const {clearDomain:i,clearSign:j} = clear.dataset;
    state.scores[Number(i)][Number(j)] = null;
    const options = $(`row-${i}-${j}`).querySelectorAll('[role=radio]');
    options.forEach((b,k)=>{b.setAttribute('aria-checked','false');b.tabIndex=k === 0 ? 0 : -1;});
    options[0].focus(); update();
  }
});
document.addEventListener('keydown', e => {
  if (!e.target.matches('button[role=radio]')) return;
  const group = [...e.target.closest('[role=radiogroup]').querySelectorAll('[role=radio]')];
  let next;
  if (['ArrowRight','ArrowDown'].includes(e.key)) next = (group.indexOf(e.target)+1)%group.length;
  if (['ArrowLeft','ArrowUp'].includes(e.key)) next = (group.indexOf(e.target)+group.length-1)%group.length;
  if (e.key === 'Home') next = 0;
  if (e.key === 'End') next = group.length-1;
  if (next !== undefined) { e.preventDefault(); group[next].focus(); select(group[next]); }
});
const requestReset = () => { $('reset-dialog').showModal(); $('cancel-reset').focus(); };
$('reset').addEventListener('click',requestReset);
$('new-assessment').addEventListener('click',requestReset);
$('cancel-reset').addEventListener('click', () => $('reset-dialog').close());
$('confirm-reset').addEventListener('click', () => {
  state = newAssessment(); autoSummary = true;
  document.querySelectorAll('[role=radiogroup]').forEach(group => group.querySelectorAll('[role=radio]').forEach((b,i) => { b.setAttribute('aria-checked','false'); b.tabIndex = i === 0 ? 0 : -1; }));
  $('reset-dialog').close(); update(); setView(false); $('status').textContent = 'Assessment cleared.';
});
$('view-summary').addEventListener('click',()=>setView(true));
$('edit-assessment').addEventListener('click',()=>{autoSummary=false;setView(false);});
async function copyResults() {
  if (!calculate(state).complete) return;
  const text = resultText(state);
  const status = summaryShown ? $('summary-status') : $('status');
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    status.textContent = 'Results copied. Ready to paste into Jane.';
  } catch {
    $('copy-text').value = text; $('copy-dialog').showModal(); $('copy-text').focus(); $('copy-text').select();
  }
}
$('copy').addEventListener('click',copyResults);
$('copy-summary').addEventListener('click',copyResults);
$('close-copy').addEventListener('click', () => $('copy-dialog').close());
update();
if ('serviceWorker' in navigator) window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => { /* Scoring remains usable if offline setup is unavailable. */ }); });
