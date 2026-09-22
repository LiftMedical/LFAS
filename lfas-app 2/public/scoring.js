export const LEVELS = ['Absent', 'Mild', 'Moderate', 'Severe', 'Very Severe'];
export const DOMAINS = [
  { name: 'Structural Support', description: 'Loss of skeletal support and deep structural foundation.', signs: ['Medial Cheek Flattening (Malar)', 'Pyriform Fossa Hollowing', 'Temporal Hollowing', 'Superior Sulcus Hollowing', 'Pre-auricular Hollowing', 'Prejowl Structural Deficiency', 'Chin Structural Deficiency', 'Gonial Angle Weakness'] },
  { name: 'Mobility / Soft Tissue Displacement', description: 'Positional change of soft tissues resulting from tissue displacement.', signs: ['Infra-orbital Hollowing', 'Midface Segmentation', 'Nasolabial Fold Depth', 'Marionette Groove Depth', 'Jowl Formation (Descent)', 'Mandibular Border Blurring', 'Buccal Descent'] },
  { name: 'Tissue Burden', description: 'True tissue excess independent of displacement.', signs: ['Pre-auricular Fullness', 'Malar Mound (Prominence)', 'Buccal Fullness', 'Jowl Bulk (Tissue)', 'Submental Fullness', 'Neck Fullness'] },
  { name: 'Envelope', description: 'Skin quality and laxity.', signs: ['Fine Rhytids', 'Skin Texture', 'Dyschromia', 'Enlarged Pores', 'Facial Skin Laxity', 'Neck Skin Laxity'] }
];
export const MODIFIERS = ['Glabellar Complex', 'Orbicularis Oculi', 'Orbicularis Oris', 'DAO (Depressor Anguli Oris)', 'Mentalis', 'Platysma'];
export const NA = 'NA';
export const MIN_ASSESSABLE = 4;
export const round1 = value => Math.round((value + Number.EPSILON) * 10) / 10;
export const newAssessment = () => ({ scores: DOMAINS.map(d => d.signs.map(() => null)), functional: MODIFIERS.map(() => null) });

export function calculate(state) {
  if (state.scores.length !== 4 || state.scores.some((s, i) => s.length !== DOMAINS[i].signs.length || s.some(v => v !== null && v !== NA && (!Number.isInteger(v) || v < 0 || v > 4)))) throw new Error('Invalid LFAS scores');
  const domains = state.scores.map(scores => {
    const values = scores.filter(v => Number.isInteger(v));
    const na = scores.filter(v => v === NA).length;
    const remaining = scores.filter(v => v === null).length;
    const insufficient = scores.length - na < MIN_ASSESSABLE;
    const complete = remaining === 0 && values.length >= MIN_ASSESSABLE;
    return { answered: values.length, na, remaining, resolved: values.length + na, total: scores.length, insufficient, complete,
      average: complete ? round1(values.reduce((a,b) => a+b,0) / values.length) : null };
  });
  const complete = domains.every(d => d.complete);
  const answered = domains.reduce((a,d) => a+d.answered,0);
  const remaining = domains.reduce((a,d) => a+d.remaining,0);
  const na = domains.reduce((a,d) => a+d.na,0);
  // The sheet rounds each domain to one decimal. Overall equally weights those four displayed averages.
  const overall = complete ? round1(domains.reduce((a,d) => a+d.average,0) / 4) : null;
  let primary = 'Pending complete scoring';
  let secondary = 'Pending complete scoring';
  let mixed = false;
  let mixedDomains = [];
  if (complete) {
    const ranked = domains.map((d,i) => ({index:i, score:Math.round(d.average*10)})).sort((a,b) => b.score-a.score);
    if (ranked[0].score === 0) {
      primary = 'None (all domains absent)'; secondary = 'None';
    } else {
      const leaders = ranked.filter(d => ranked[0].score-d.score <= 5);
      mixed = leaders.length > 1;
      mixedDomains = mixed ? leaders.map(d => DOMAINS[d.index].name) : [];
      primary = mixed ? `Mixed Pattern: ${mixedDomains.join(' + ')}` : DOMAINS[ranked[0].index].name;
      // No artificial primary/secondary order within the leading mixed group.
      if (mixed) secondary = 'No separate secondary driver (mixed leading domains)';
      else if (ranked[1].score === 0) secondary = 'None (remaining domains absent)';
      else {
        const seconds = ranked.slice(1).filter(d => d.score === ranked[1].score);
        secondary = `${seconds.length > 1 ? 'Tied: ' : ''}${seconds.map(d => DOMAINS[d.index].name).join(' + ')}`;
      }
    }
  }
  return { domains, answered, remaining, na, resolved: answered + na, complete, overall, primary, secondary, mixed, mixedDomains };
}
export function resultText(state) {
  const r = calculate(state);
  if (!r.complete) throw new Error('Complete every sign with 0–4 or N/A, with at least four numeric scores per domain, before copying results.');
  const positives = MODIFIERS.filter((_,i) => state.functional[i] === true);
  const unassessed = MODIFIERS.filter((_,i) => state.functional[i] === null);
  const exclusions = DOMAINS.flatMap((d,i) => state.scores[i].map((v,j) => v === NA ? `${d.name}: ${d.signs[j]}` : null).filter(Boolean));
  return `LFAS: ${DOMAINS.map((d,i) => `${d.name} ${r.domains[i].average.toFixed(1)}/4${r.domains[i].na ? ` (${r.domains[i].answered}/${r.domains[i].total} assessable; ${r.domains[i].na} N/A)` : ''}`).join('; ')}. Overall LFAS ${r.overall.toFixed(1)}/4. Primary driver: ${r.primary}. Secondary driver: ${r.secondary}. Positive functional modifiers (unscored): ${positives.join(', ') || (unassessed.length ? 'none recorded' : 'none')}.${exclusions.length ? ` N/A exclusions: ${exclusions.join('; ')}.` : ''}${unassessed.length ? ` Functional assessment incomplete; not assessed: ${unassessed.join(', ')}.` : ''}`;
}
