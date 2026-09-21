import { DOMAINS, MODIFIERS, LEVELS, newAssessment, calculate, resultText } from './scoring.js';
const colors = ['#0e1b33','#2f5067','#60809e','#a8c0d4'];
const inks = ['#fff','#fff','#fff','#0e1b33'];
let state = newAssessment();
const $ = id => document.getElementById(id);
const theme = i => `--domain:${colors[i]};--head-ink:${inks[i]}`;
$('domains').innerHTML = DOMAINS.map((d,i) => `<section class="domain" id="domain-${i}" style="${theme(i)}" aria-labelledby="domain-title-${i}"><header class="domain-head"><span class="domain-number" aria-hidden="true">0${i+1}</span><div class="eyebrow">DOMAIN ${i+1}</div><h2 id="domain-title-${i}">${d.name}</h2><p>${d.description}</p></header><div>${d.signs.map((sign,j) => `<div class="sign"><div class="sign-name" id="sign-${i}-${j}"><span class="sign-index" aria-hidden="true">${String(j+1).padStart(2,'0')}</span>${sign}</div><div class="score-options" role="radiogroup" aria-labelledby="sign-${i}-${j}">${LEVELS.map((label,k) => `<button class="score" role="radio" aria-checked="false" aria-label="${k} — ${label}" title="${label}" tabindex="${k === 0 ? 0 : -1}" data-domain="${i}" data-sign="${j}" data-value="${k}">${k}</button>`).join('')}</div></div>`).join('')}</div><div class="domain-bottom"><div>Domain average<small id="domain-progress-${i}">0 / ${d.signs.length} scored</small></div><div><strong id="average-${i}">—</strong><span class="out-of"> / 4</span></div></div></section>`).join('');
document.querySelector('.domain-nav').innerHTML = DOMAINS.map((d,i) => `<a href="#domain-${i}" style="${theme(i)}"><span class="nav-dot"></span><span class="nav-label">${d.name}</span><span class="nav-score" id="nav-score-${i}">—</span></a>`).join('');
$('profile').innerHTML = DOMAINS.map((d,i) => `<div class="profile-item" style="${theme(i)}"><div class="profile-label"><span>${d.name}</span><strong id="profile-score-${i}">—</strong></div><div class="bar" aria-hidden="true"><span id="bar-${i}" style="width:0%"></span></div></div>`).join('');
$('modifiers').innerHTML = MODIFIERS.map((name,i) => `<div class="modifier"><span class="modifier-label" id="modifier-${i}">${name}</span><div class="binary" role="radiogroup" aria-labelledby="modifier-${i}"><button role="radio" aria-checked="false" tabindex="0" data-modifier="${i}" data-value="yes">Yes</button><button role="radio" aria-checked="false" tabindex="-1" data-modifier="${i}" data-value="no">No</button></div></div>`).join('');
function update() {
  const r = calculate(state);
  r.domains.forEach((d,i) => {
    const value = d.average === null ? '—' : d.average.toFixed(1);
    $(`average-${i}`).textContent = value;
    $(`nav-score-${i}`).textContent = value;
    $(`profile-score-${i}`).textContent = value + (d.answered && !d.complete ? '*' : '');
    $(`domain-progress-${i}`).textContent = `${d.answered} / ${d.total} scored${d.answered && !d.complete ? ' · provisional' : ''}`;
    $(`bar-${i}`).style.width = `${(d.average ?? 0)*25}%`;
  });
  $('completion').textContent = `${r.answered} of 27 signs scored${r.complete ? ' · Complete' : ''}`;
  $('progress').value = r.answered;
  $('overall').textContent = r.overall === null ? '—' : r.overall.toFixed(1);
  $('primary').textContent = r.primary;
  $('secondary').textContent = r.secondary;
  $('pattern-note').textContent = r.complete ? (r.mixed ? 'Mixed Pattern · Leading domains are within 0.5 points of the highest score.' : 'Drivers use completed domain averages. Functional modifiers do not affect these scores.') : 'Complete all 27 signs to identify drivers. * Provisional average of answered signs.';
  $('copy').disabled = !r.complete;
  $('copy-help').textContent = r.complete ? 'Copy your scores and functional modifiers to the EMR.' : 'Complete scoring to copy an EMR-ready summary.';
  $('status').textContent = '';
}
function select(button) {
  const group = button.parentElement;
  for (const b of group.querySelectorAll('button')) { b.setAttribute('aria-checked',String(b === button)); b.tabIndex = b === button ? 0 : -1; }
  if (button.dataset.domain !== undefined) state.scores[Number(button.dataset.domain)][Number(button.dataset.sign)] = Number(button.dataset.value);
  else state.functional[Number(button.dataset.modifier)] = button.dataset.value === 'yes';
  update();
}
document.addEventListener('click', e => { const b = e.target.closest('button[role=radio]'); if (b) select(b); });
document.addEventListener('keydown', e => {
  if (!e.target.matches('button[role=radio]')) return;
  const group = [...e.target.parentElement.querySelectorAll('button')];
  let next;
  if (['ArrowRight','ArrowDown'].includes(e.key)) next = (group.indexOf(e.target)+1)%group.length;
  if (['ArrowLeft','ArrowUp'].includes(e.key)) next = (group.indexOf(e.target)+group.length-1)%group.length;
  if (e.key === 'Home') next = 0;
  if (e.key === 'End') next = group.length-1;
  if (next !== undefined) { e.preventDefault(); group[next].focus(); select(group[next]); }
});
$('reset').addEventListener('click', () => { $('reset-dialog').showModal(); $('cancel-reset').focus(); });
$('cancel-reset').addEventListener('click', () => $('reset-dialog').close());
$('confirm-reset').addEventListener('click', () => {
  state = newAssessment();
  document.querySelectorAll('[role=radiogroup]').forEach(group => group.querySelectorAll('button').forEach((b,i) => { b.setAttribute('aria-checked','false'); b.tabIndex = i === 0 ? 0 : -1; }));
  update(); $('reset-dialog').close(); $('status').textContent = 'Assessment cleared.';
});
$('copy').addEventListener('click', async () => {
  const text = resultText(state);
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    $('status').textContent = 'Results copied. Ready to paste into your EMR.';
  } catch {
    $('copy-text').value = text; $('copy-dialog').showModal(); $('copy-text').focus(); $('copy-text').select();
  }
});
$('close-copy').addEventListener('click', () => $('copy-dialog').close());
update();
if ('serviceWorker' in navigator) window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => { /* Scoring remains usable if offline setup is unavailable. */ }); });
