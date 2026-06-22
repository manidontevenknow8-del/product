import type { CommercialPageConfig } from '../types';
import { COMMERCIAL_WIKIDATA } from '../schemaTopics';
import { ROUTES } from '@/routes/paths';
import { PAGE_IMG } from '@/data/pageImages';

export const PET_HEALTH_TRACKER_PAGE: CommercialPageConfig = {
  path: '/pet-health-tracker',
  primaryKeyword: 'pet health tracker',
  secondaryKeywords: [
    'pet wellness tracker',
    'dog health monitoring app',
    'pet weight tracker',
    'daily pet check-in',
  ],
  searchIntent:
    'Proactive owners who want to notice changes early—weight, appetite, mobility, behavior—and connect observations to vet conversations with context.',
  title: 'Pet Health Tracker — Notice Changes Before They Become Crises',
  metaDescription:
    'Daily check-ins, weight trends, and wellness signals in one pet health tracker. Spot patterns early and walk into vet visits with data, not guesses.',
  schemaTopic: {
    topicName: 'Pet health tracker',
    topicWikidataUrl: COMMERCIAL_WIKIDATA.electronicHealthRecord,
  },
  additionalSchemaTopics: [
    {
      topicName: 'Vaccination',
      topicWikidataUrl: COMMERCIAL_WIKIDATA.vaccination,
    },
  ],
  heroEyebrow: 'Health tracker',
  heroTitle: 'Small shifts are easy to miss. Patterns are not.',
  heroSubhead:
    'PetClues turns quick daily check-ins and weight logs into trends you can share with your vet—so “something seems off” becomes a conversation with dates behind it.',
  heroImage: PAGE_IMG.profile.health,
  heroImageAlt: 'Pet health tracker showing weight trend and daily check-in on a phone',
  featuresTitle: 'Tracking that respects your time and your vet’s',
  features: [
    {
      title: 'Daily check-ins in under a minute',
      body: 'Appetite, energy, stool quality, mood—tap, done. Consistency beats clinical depth for early signal detection.',
    },
    {
      title: 'Weight with context',
      body: 'Log weight on a schedule that matches your vet’s advice. See trend lines, not isolated numbers on a bathroom scale.',
    },
    {
      title: 'Reminders tied to wellness',
      body: 'Heartworm doses, flea prevention, and recheck labs surface alongside behavior notes—one place for “what we owe care.”',
    },
    {
      title: 'Monthly wellness snapshot',
      body: 'Roll check-ins into a readable period summary before appointments. Patterns pop when compressed thoughtfully.',
    },
    {
      title: 'Multi-pet dashboards',
      body: 'Different species, different baselines. Each pet’s normal stays separate; household view shows who needs attention.',
    },
    {
      title: 'Export for vet visits',
      body: 'Bring a trend printout when you suspect gradual change. Clinicians trust dated owner logs more than same-day memory.',
    },
  ],
  trustTitle: 'Wellness tracking without wellness theater',
  trustPoints: [
    {
      title: 'Not a diagnostic device',
      body: 'PetClues surfaces patterns; it does not tell you what disease your pet has. Escalation stays with professionals.',
    },
    {
      title: 'Sustainable cadence',
      body: 'Daily check-ins are optional, not guilt-driven streaks. Skip days; resume when life allows. Trends tolerate imperfection.',
    },
    {
      title: 'Pairs with full records',
      body: 'Tracking feeds the timeline. A weight drop links to the visit where bloodwork confirmed why.',
    },
    {
      title: 'Free core tracking',
      body: 'Check-ins and basic weight logging are included free—because early noticing should not be paywalled.',
    },
  ],
  proseSections: [
    {
      id: 'subtle-changes',
      title: 'The dangerous changes are the quiet ones',
      paragraphs: [
        'Acute crises announce themselves. Chronic drift does not. A dog who drinks slightly more water for three weeks. A cat who jumps less but still jumps. Weight that creeps down half a pound at a time.',
        'Memory smooths these edges. By the time you book an appointment, you remember “recently” not “since April.” A health tracker exists to defeat that smoothing—to give dates to intuition.',
        'This is not obsessive quantification. It is lightweight evidence collection for beings who cannot narrate their symptoms.',
      ],
    },
    {
      id: 'what-to-track',
      title: 'Track what your household can observe reliably',
      paragraphs: [
        'Appetite and water intake are high signal for many conditions. Stool quality matters for GI and pancreatic issues. Energy and mobility anchor orthopedic and systemic illness conversations.',
        'Avoid tracking thirty variables. Pick five you will actually tap daily. Sparse consistent data beats rich abandoned data.',
        'Photograph only when something is stable and repeatable—a skin lesion weekly, not hourly. Images without dates clutter more than they help.',
      ],
    },
    {
      id: 'weight-discipline',
      title: 'Weight is a vital sign owners can measure',
      paragraphs: [
        'Home scales work if you control conditions: same scale, similar time of day, account for meal timing. Log in PetClues; let the trend line argue for a vet visit.',
        'Small breeds need precision. A half-pound shift on a ten-pound dog is material. Large breeds mask fluid shifts longer—trend watching still helps.',
        'When the vet sets a target weight, mark it. Tracking toward a goal beats tracking into the void.',
      ],
    },
    {
      id: 'vet-conversations',
      title: 'Turning logs into better appointments',
      paragraphs: [
        'Export a month of check-ins before a wellness visit. Circle anomalies yourself; do not make the clinician hunt.',
        'When something acute happens, log the day it started and what changed in the environment—new food, new park, new pet, construction noise. Correlation is not causation, but it seeds good questions.',
        'After treatment begins, keep logging at reduced cadence. Improvement should appear in data; if it does not, that is worth a call before the recheck.',
        'Seasonal allergies, heat sensitivity, and winter stiffness often look like separate complaints but share a rhythm. A year of light check-ins can reveal cycles your memory flattens into “sometimes.”',
      ],
    },
    {
      id: 'household-rhythm',
      title: 'Make tracking a household habit, not a solo chore',
      paragraphs: [
        'Whoever feeds breakfast can tap the check-in. Shared accounts mean the person at home documents what they see—not a game of telephone at dinner.',
        'Pair tracking with reminders: prevention due this week, weight log due Sunday, senior bloodwork recheck in March. One dashboard reduces “I thought you were watching that.”',
        'Annual membership aligns with how wellness actually works—year-over-year continuity—not disposable monthly apps you abandon after week two.',
      ],
    },
    {
      id: 'long-term-value',
      title: 'Tracking earns its keep in the quiet weeks',
      paragraphs: [
        'Most days are uneventful—and those are the days tracking is easiest to skip. The value appears when uneventful strings together into a pattern: softer coat, slower stairs, smaller meals. Trends need baseline; baselines need repetition.',
        'PetClues pairs lightweight check-ins with the heavier artifacts—labs, diagnoses, prescriptions—so a vet sees both what you noticed and what they measured. Neither alone tells the whole story.',
        'You do not need a perfect streak. You need enough dots that someone skilled can connect them. Three months of honest taps beats a single dramatic recollection in the exam room.',
      ],
    },
    {
      id: 'senior-pets',
      title: 'Senior pets benefit most from gentle consistency',
      paragraphs: [
        'Older animals mask illness. Subtle check-ins—appetite, water, mobility, sleep—often surface drift before catastrophic labs. You are not diagnosing; you are timestamping intuition.',
        'Weight loss in seniors is never “just old age” until a vet says so. Log monthly weights even when nothing seems wrong. The trend line is the early warning system.',
        'Pair tracking with reminder discipline for joint supplements, kidney diets, and bloodwork rechecks. Wellness in senior years is maintenance-heavy; a tracker should reduce cognitive load, not add guilt.',
      ],
    },
    {
      id: 'behavior-mood',
      title: 'Behavior and mood are vital signs owners see first',
      paragraphs: [
        'Lethargy, hiding, aggression, or clinginess often precede measurable lab changes—especially in cats. A daily mood tap is not anthropomorphism; it is data your vet will ask about anyway.',
        'Track triggers when behavior shifts: new pet, construction, diet change, visitor week. Correlation is not diagnosis, but it shortlists hypotheses.',
        'If your pet is on behavior medication, log dose times and noticeable effects the same way you would for antibiotics. Titration depends on owner reporting.',
        'Share behavioral trends at wellness visits even when the appointment was booked for something else. Overlap is common; surprise is not helpful.',
      ],
    },
    {
      id: 'integration-records',
      title: 'Tracking should feed the record, not float beside it',
      paragraphs: [
        'Isolated spreadsheets die on your phone. Check-ins belong on the same timeline as vet visits so a clinician sees owner observations adjacent to their own notes.',
        'When bloodwork confirms what you suspected from weight loss, link the check-in period to the lab entry. That pairing validates both data sources.',
        'Monthly summaries are pre-visit tools: scan four weeks in thirty seconds, flag anomalies, leave routine noise behind.',
        'If you stop tracking for a vacation, resume without backfilling fiction. Gaps are honest; fabricated continuity is not.',
      ],
    },
  ],
  faqs: [
    {
      question: 'How long should daily check-ins take?',
      answer:
        'Under a minute for most households. Tap the fields you care about; skip the rest.',
    },
    {
      question: 'Can PetClues replace vet-recommended monitoring?',
      answer:
        'No. If your vet prescribes glucose curves, blood pressure checks, or other clinical monitoring, follow their protocol. PetClues complements owner-observable signals.',
    },
    {
      question: 'Do I need to check in every single day?',
      answer:
        'No. Regular beats perfect. Several entries per week still reveal trends over months.',
    },
    {
      question: 'Does tracking work for cats?',
      answer:
        'Yes. Litter box habits, appetite, and weight are especially useful for cats who hide illness.',
    },
    {
      question: 'Can I see trends across multiple pets?',
      answer:
        'Each pet has an individual trend view. Household dashboards highlight who logged recently and who is due for attention.',
    },
    {
      question: 'Is the health tracker included free?',
      answer:
        'Core check-ins and weight logging are free for one pet. Advanced reports and multi-pet tracking are part of paid membership.',
    },
  ],
  ctaTitle: 'Start with one metric you already notice',
  ctaLead:
    'Log today’s weight or appetite. A month from now, you will be glad you did.',
  relatedLinks: [
    { href: `${ROUTES.BLOG}/pet-medication-reminder-guide`, label: 'Pet medication reminder guide' },
    { href: `${ROUTES.BEST}/best-pet-health-tracker-app-2026`, label: 'Best pet health tracker apps' },
    { href: `${ROUTES.LEARN}/annual-wellness-record-checklist-for-pets`, label: 'Annual wellness checklist' },
    { href: ROUTES.FOUNDING_MEMBERS, label: 'Founding members' },
    { href: ROUTES.PRICING, label: 'Membership pricing' },
  ],
};
