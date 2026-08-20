/** Map breed health-issue phrases to existing symptoms.json slugs. */

export function symptomSlugForIssue(issue, species) {
  const dog = species === 'dog';
  const rules = [
    [/hip dysplasia|elbow dysplasia|cruciate|patellar|legg-calve|orthopedic|arthritis|joint|ivdd|intervertebral|spinal|myelopathy|wobbler/i, dog ? 'limping-dog' : 'limping-cat'],
    [/boas|brachycephalic|airway|tracheal collapse|heat intolerance|open.?mouth/i, dog ? 'difficulty-breathing-dog' : 'difficulty-breathing-cat'],
    [/bloat|gdv|gastric|pancreatitis|vomiting|enteropathy|ibd/i, dog ? 'vomiting-dog' : 'vomiting-cat'],
    [/dental/i, dog ? 'dental-pain-dog' : 'dental-pain-cat'],
    [/obesity|weight gain/i, dog ? 'weight-gain-dog' : 'weight-gain-cat'],
    [/weight loss/i, dog ? 'weight-loss-dog' : 'weight-loss-cat'],
    [/ear infection/i, dog ? 'ear-scratching-dog' : 'ear-scratching-cat'],
    [/skin|allerg|demodex|hot spot|dermatitis|alopecia|itch/i, dog ? 'itching-dog' : 'itching-cat'],
    [/kidney|renal|fanconi|amyloid|diabetes|thirst/i, dog ? 'excessive-thirst-dog' : 'excessive-thirst-cat'],
    [/hyperthyroid/i, 'weight-loss-cat'],
    [/hcm|cardiomyopathy|heart|mitral|cardiac/i, dog ? 'difficulty-breathing-dog' : 'difficulty-breathing-cat'],
    [/urinary|flutd|stones|cystitis/i, dog ? 'straining-to-urinate-dog' : 'straining-to-urinate-cat'],
    [/eye|glaucoma|cataract|pra|retinal|cherry eye|entropion/i, dog ? 'red-eyes-dog' : 'red-eyes-cat'],
    [/seizure|epilepsy/i, dog ? 'seizures-dog' : 'seizures-cat'],
    [/cancer|osteo|lymphoma|lump/i, dog ? 'lumps-bumps-dog' : 'lumps-bumps-cat'],
  ];
  for (const [re, slug] of rules) {
    if (re.test(issue)) return slug;
  }
  return dog ? 'lethargy-dog' : 'lethargy-cat';
}

export function symptomPathForIssue(issue, species) {
  return `/symptoms/${symptomSlugForIssue(issue, species)}`;
}
