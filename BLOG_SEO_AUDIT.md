# Blog SEO Audit

Generated: 2026-06-08

## Implementation

Each published blog article uses `BlogPostSEO` which renders:

- `MetaTags` - title, description, canonical, keywords, robots
- `OpenGraph` - og:title, og:description, og:type=article, og:image, Twitter card
- JSON-LD `BlogPosting` schema via `getBlogPostingStructuredData`

## Article Inventory (26 published)

| Slug | Title | Canonical | OG | Schema | Author | Published | Modified | Issues |
|------|-------|-----------|----|--------|--------|-----------|----------|--------|
| best-pet-health-tracker-app-2026 | Best Pet Health Tracker App Features to … | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| bird-care-health-routine | Bird Care Basics: Creating a Low-Stress … | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| cat-health-records-checklist | Cat Health Records: What to Save After E… | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | short excerpt, missing publishedAt, missing updatedAt |
| cat-vaccination-schedule-guide | Cat Vaccination Schedule: Core Shots, Bo… | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| dog-dental-care-schedule-cleanings-reminders | Dog Dental Care Schedule: Cleanings, Hom… | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| dog-feeding-schedule-walk-tracker | Dog Feeding Schedule & Walk Tracker: Bui… | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| dog-vaccination-schedule-guide | How to Build a Vaccination Schedule Your… | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| dog-weight-tracker-log-trends-vet-health | Dog Weight Tracker: Log Trends for Bette… | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| exotic-pet-records-guide | Exotic Pet Records: What Reptile and Sma… | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| flea-tick-prevention-calendar-pets | Flea and Tick Prevention Calendar for Do… | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| heartworm-prevention-schedule-reminder-dogs | Heartworm Prevention Schedule & Reminder… | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| microchip-registration-guide-dogs-cats | Microchip Registration Guide for Dogs & … | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| new-kitten-checklist-vet-vaccines-records | New Kitten Checklist: Vet Visits, Vaccin… | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| new-puppy-checklist-health-records-vaccines | New Puppy Checklist: Health Records, Vac… | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| organize-pet-medical-records-online | How to Organize Pet Medical Records Onli… | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| pet-allergy-tracker-symptoms-triggers-records | Pet Allergy Tracker: Symptoms, Triggers … | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| pet-boarding-preparation-vaccination-records-health-forms | Pet Boarding Preparation: Vaccination Re… | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| pet-emergency-information-card-guide | Pet Emergency Information Card: What Eve… | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| pet-medication-reminder-guide | Pet Medication Reminder: How to Never Mi… | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| pet-records-101-care-timeline | Pet Records 101: Turn Chaos Into a Calm … | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| pet-sitter-instructions-medical-emergency-info | Pet Sitter Instructions: Medical Info & … | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| petclues-guides-life-stage-care-tools | PetClues Guides: Choosing the Right Care… | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| puppy-vaccination-schedule-2026 | Puppy Vaccination Schedule 2026: Month-b… | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| senior-dog-care-health-records-medication-tracker | Senior Dog Care Guide: Health Records & … | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| traveling-with-pets-health-documents-checklist | Traveling with Pets: Health Documents & … | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |
| vet-bill-organizer-pet-medical-bills | Vet Bill Organizer: Store & Understand P… | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | missing publishedAt, missing updatedAt |

## Structured Data Fields (BlogPosting)

- headline, description, image, author, publisher (with logo), datePublished, dateModified, mainEntityOfPage, articleSection, keywords

## Internal Linking

- Blog index lists all posts with links
- Landing page `LandingBlogPreview` links to featured articles
- Category/tag filters on blog index

## Recommendations

1. Add `article:modified_time` OG tag - ✅ implemented in `MetaTags.tsx`
2. Validate each article URL in [Rich Results Test](https://search.google.com/test/rich-results)
3. Ensure featured images exist under `/public/images/blog/` for richer social previews
