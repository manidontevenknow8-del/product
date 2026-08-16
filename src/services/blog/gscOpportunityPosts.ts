import type { BlogPost } from '@/types/blog';
import { attachBlogImages } from './attachBlogImages';

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString();

/**
 * Unique long-form articles for queries that already earn Search Console impressions.
 * These are not matrix templates. Each body is written for one search intent.
 */
const GSC_OPPORTUNITY_POSTS_RAW: BlogPost[] = [
  {
    id: 'gsc-clone-dog-2026',
    title: 'How Much Does It Cost to Clone a Dog in 2026?',
    slug: 'how-much-does-it-cost-to-clone-a-dog-2026',
    excerpt:
      '2026 dog cloning prices, what ViaGen-style packages usually include, extra fees people miss, and why a clone is not the same pet. Practical notes on tissue storage, ethics, and health records.',
    category: 'vet-finance',
    tags: [
      'dog cloning cost',
      'clone a dog 2026',
      'pet health records',
      'genetic testing',
      'pet insurance',
    ],
    author: 'PetClues Team',
    publishedAt: daysAgo(0),
    featuredImage: '',
    status: 'published',
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
    content: `People type **how much does it cost to clone a dog 2026** because a viral headline, a grief decision, or a celebrity clone story landed in their feed. The dollar figure is real. The promise is narrower than the ads.

This page answers the search query with 2026 commercial pricing, the fees that sit around the sticker price, and the biology that marketing skips. It is not a sales page for cloning. PetClues does not clone animals. We keep the medical file you will still need whether you clone, insure, or simply want one honest record of the dog you already have.

## The 2026 sticker price

Commercial dog cloning in the United States is still a boutique lab service, not a vet-clinic add-on. The company most owners actually call is **ViaGen Pets** (Cedar Park, Texas). Public 2025-2026 package language for a dog clone still clusters around **about $50,000 USD** for the cloning procedure itself.

Cat cloning has historically been listed lower, often in the **$35,000** neighborhood. Horse cloning is a different market and a different invoice.

Treat those numbers as the **procedure line**, not the all-in family cost.

## What the $50,000 usually covers, and what it does not

Labs describe a package that typically includes:

- Somatic cell nuclear transfer using a cell line grown from your dog's tissue
- Transfer into a surrogate dam
- Whelping and early neonatal care at the facility
- A live puppy that is a **genetic copy** of the donor

It usually does **not** include everything families assume:

- The **biopsy kit**, veterinary collection, and overnight shipping of living tissue
- Long-term **cell-line storage** if you bank cells years before cloning
- Travel to Texas (or wherever the lab is) to pick up the puppy
- Your own veterinarian's exam, vaccines, and microchip when the puppy comes home
- Failed cycles. Cloning is not a single guaranteed pregnancy. Some clients wait through more than one attempt
- The lifetime cost of feeding, insurance, and medical care for a second dog who can inherit the **same genetic disease risks** as the first

If you are budgeting, add a **20-30% cushion** on top of the published cloning fee for logistics, storage, and veterinary aftercare.

## How dog cloning actually works (plain language)

1. A veterinarian collects a small skin sample (often from the belly) while the donor is alive, or very promptly after death if the lab still accepts the tissue.
2. The lab cultures those cells. This is the bank. No puppy exists yet.
3. Later, a nucleus from one of those cells is placed into an enucleated egg (somatic cell nuclear transfer, the Dolly method).
4. Embryos go into a surrogate. Gestation is a normal canine pregnancy, not a sci-fi tank.
5. The puppy is born with the donor's nuclear DNA. Mitochondrial DNA comes from the egg donor, so the clone is not a 100.000% photocopy at every biological layer.

Coat color, size, and many heritable diseases track closely. **Personality, training, and the original dog's life story do not clone.** A clone is a genetic twin born later, raised in a different house, with a different immune history.

## Why people still search "how much to clone dog"

Grief is the honest reason. The internet reason is a round number that sounds like a luxury product. If you are in that search, ask three questions before you wire money:

1. **Is the tissue already banked correctly?** A freezer at home is not a cell line.
2. **Are you trying to copy a temperament?** Cloning will not do that.
3. **Have you priced the medical future of a dog who may repeat the same orthopedic or cardiac story?** If the original dog had IVDD, dilated cardiomyopathy, or severe allergies, the clone can carry the same dice.

For spinal risk in short-legged herding dogs, read [how common IVDD is in Corgis](/blog/how-common-is-ivdd-in-corgis). For everyday medical tracking that actually changes outcomes, see [how to organize pet medical records online](/blog/organize-pet-medical-records-online).

## Cloning vs. the documents you already need

Whether you clone or not, clinics still want:

- Rabies certificate
- Microchip number that matches the certificate
- Surgical and biopsy reports if tissue was collected
- A medication list if the donor was on chronic drugs

A [digital pet passport](/blog/what-is-a-digital-pet-passport) will not create a clone. It will stop you from losing the only proof that the original dog was vaccinated, microchipped, and prescribed a diet.

## Ethics, welfare, and the part ads skip

Surrogate dams carry the pregnancy. Neonatal clone loss is a documented problem in several species. Commercial labs screen and have improved protocols since the early 2000s, but this is still an intensive, high-failure biological process, not a vending machine.

There is also a welfare argument that the money could fund behavior work, pain control, or a second rescue dog. That is a values question, not a spreadsheet. The spreadsheet still matters: **$50,000 plus aftercare is a second mortgage payment for most households.**

## FAQ

**How much does it cost to clone a dog in 2026?** Plan on about **$50,000 USD** for the commercial cloning package in the United States, plus biopsy, shipping, storage, travel, and normal veterinary care for the puppy.

**How much to clone a dog if I only bank cells?** Cell banking is a smaller invoice (often hundreds to low thousands depending on the lab and years of storage). Cloning is the $50,000 step. Banking is not cloning.

**Will the clone be the same dog?** Genetically close. Behaviorally, no. Train, socialize, and insure the puppy as a new animal.

**Can my regular vet clone my dog?** No. This is a specialized reproductive lab. Your vet can collect tissue if the lab's kit and timing rules are followed.

**Should I clone a sick dog?** Talk to a veterinarian about heritable disease first. A clone can inherit the same mutations.

## Bottom line

The 2026 answer to **cost to clone a dog** is **roughly fifty thousand dollars for the lab package, more in real life.** If you are here because you loved a dog, protect the records of the one who is here now: vaccines, meds, imaging, and the people allowed to pick them up. That file is cheap. The clone is not.`,
  },
  {
    id: 'gsc-ivdd-corgis',
    title: 'How Common Is IVDD in Corgis? Risk, Signs, and What To Do',
    slug: 'how-common-is-ivdd-in-corgis',
    excerpt:
      'How common IVDD is in Pembroke and Cardigan Welsh Corgis, why short-legged chondrodystrophic dogs rupture discs, emergency grades, crate rest, surgery, and the records neurologists actually use.',
    category: 'breed-lifestyle',
    tags: [
      'IVDD in corgis',
      'corgi back problems',
      'intervertebral disc disease',
      'pet health records',
      'dachshund IVDD',
    ],
    author: 'PetClues Team',
    publishedAt: daysAgo(0),
    featuredImage: '',
    status: 'published',
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
    content: `**IVDD in Corgis** is not a rare freak accident. Pembroke and Cardigan Welsh Corgis are **chondrodystrophic** dogs: the same FGF4-related short-leg biology that makes the silhouette cute also ages the discs early. If you searched **how common is IVDD in Corgis**, you want a prevalence answer, not a generic "see your vet."

This article is written for that query. It is not a substitute for a neurologist. It is the briefing owners wish they had before the first yelp on the stairs.

## How common is it, really?

Exact lifetime percentages vary by study, clinic, and whether you count only surgical cases or every sore back. What does **not** vary:

- Corgis belong to the **high-risk chondrodystrophic group** with Dachshunds, Beagles, Bassett Hounds, and other FGF4-retrogene breeds.
- In Dachshunds, published lifetime IVDD estimates often land in a **roughly 15-25%** band depending on the paper and population. Corgis share the disc morphology that drives Hansen **Type I** extrusion (a sudden, toothpaste-like burst of nucleus into the spinal canal).
- Mixed-breed, long-legged dogs have a **much lower** baseline. Comparing a Corgi to a Labrador is the wrong comparison. Compare a Corgi to other short-legged herding and hunting breeds.

So the honest 2026 answer: **IVDD is one of the signature orthopedic-neurologic diseases of the Corgi.** It is common enough that breed clubs talk about ramps the way Golden Retriever clubs talk about hips. It is not "every Corgi will be paralyzed." It is "you should set the house up as if a disc could go, because in this breed it might."

Our clinical brief at [IVDD in Corgis](/guides/corgi/ivdd) is the structured medical page. This post is the prevalence and "what happens this weekend" guide.

## Why Corgi discs fail

Chondrodystrophy changes cartilage. Discs dehydrate and mineralize years earlier than in non-chondrodystrophic dogs. A jump off the sofa, a twist after a squirrel, or no obvious trauma at all can extrude disc material and bruise the spinal cord.

Hansen Type I in Corgis tends to be **acute**. Owners describe:

- A yelp when picked up under the ribs
- A hunched back (kyphosis)
- Shivering, panting, or refusing food because of pain
- Knuckling, dragging nails, or a drunken rear gait
- In the worst hours: inability to stand, and loss of bladder control

Pain-only IVDD and paralysis IVDD are the same disease at different **neurologic grades**. Grade can change in a night. That is why "wait until Monday" is a dangerous plan if the dog cannot walk.

## Grades owners can actually use

Neurologists use slightly different scales. This is the household version:

1. **Pain only**, still walking normally
2. **Wobbly** (ataxia) but can walk
3. **Cannot walk**, still has pain sensation in the toes
4. **Cannot walk**, pain sensation reduced or gone
5. **Paralysis** with loss of deep pain (the emergency surgical clock)

Deep pain is not "does he cry when I touch his back." It is a specific toe pinch assessed by a veterinarian. Do not test this at home in a way that makes the dog panic or thrash.

## What to do in the first two hours

- Stop jumping. Carry the dog like a lasagna tray, spine supported, not hanging from the armpits.
- Call an emergency clinic with **neurology or surgery** capability if walking is gone or pain is explosive.
- Do not give human ibuprofen or acetaminophen.
- Photograph the last time the dog urinated. Bladder care becomes the make-or-break aftercare item.
- Open a note with timestamps: when the yelp happened, whether they walked after, whether the tail wags, whether they can feel the floor.

If you already keep records in one vault, add the video of the gait. Neurologists would rather see a 12-second hallway walk than a vague "he's off."

## Medical vs surgical

**Crate rest** (typically weeks, not days) plus pain control can work for lower grades when the dog is still walking and imaging or exam supports it. Compliance is the treatment. "Crate rest except when he looks sad" is how discs re-explode.

**Decompression surgery** is on the table when the dog cannot walk, when pain is uncontrollable, or when imaging shows a compressive extrusion. Cost varies wildly by city and whether MRI is included, often in the **thousands to low tens of thousands**. Ask for an itemized estimate: MRI, surgery, hospitalization, bladder care, rehab.

Prognosis tracks neurologic grade and **how fast** you moved, not how cute the Instagram ramp was after the fact.

## Home setup that actually reduces risk

- Ramps to sofa and bed. Corgis will jump if the furniture is their identity.
- No stairs unsupervised during a flare.
- Harness, not a neck-only leash, if your vet agrees.
- Weight: extra kilos are extra disc load. Keep a weekly weight in the same [health tracker](/blog/best-pet-health-tracker-app-2026) you use for meds.
- Flooring: rugs on hardwood so rear feet can grip.

Ramps do not make IVDD rare. They make the stupid jump less likely.

## What to keep in the medical file

Neurology is a document sport:

- MRI or CT date and the segment (T11-T12, L2-L3, etc.)
- Surgical report if there was surgery
- Crate-rest start and end dates
- Bladder expression schedule
- NSAID and gabapentin doses with the prescribing clinic
- Recheck neuro exams

That file is how a second clinic, a rehab tech, or a sitter avoids restarting the injury. Use a [share folder for pets](/blog/share-folders-for-pets) so the neurologist and the regular vet see the same PDFs.

## FAQ

**How common is IVDD in Corgis?** Common relative to the average dog. Corgis are a high-risk chondrodystrophic breed. Treat spinal care as a core Corgi topic, not a trivia fact.

**Are Cardigans safer than Pembrokes?** Both are chondrodystrophic. Do not pick a variety to dodge IVDD.

**Is IVDD in Corgis genetic?** The short-leg architecture is genetic. Not every Corgi extrudes a disc. Breeding conversations belong with a veterinarian and the breed club health statement, not a forum poll.

**Can they recover without surgery?** Many walking dogs do, with strict rest. Non-walking dogs need same-day veterinary triage.

**Should I use a back brace I saw online?** Only if your veterinarian or rehab clinician fitted it. Random Amazon braces can change gait in the wrong way.

## Bottom line

**IVDD in Corgis is common enough to plan for.** Ramps, weight, and a dated symptom log are cheaper than MRI. If the rear end goes down, move like it is an emergency, because in this breed it often is.`,
  },
  {
    id: 'gsc-vet-auth-rx-food',
    title: 'Vet Authorization Certificates for Prescription Pet Food',
    slug: 'vet-authorization-certificate-prescription-food',
    excerpt:
      'How veterinary authorization certificates work for Hill\'s, Royal Canin, and Purina therapeutic diets. What clinics sign, what online pharmacies need, and how to keep the form with the medical record.',
    category: 'pet-records',
    tags: [
      'vet authorization',
      'prescription pet food',
      'certificate',
      'therapeutic diet',
      'pet health records',
    ],
    author: 'PetClues Team',
    publishedAt: daysAgo(0),
    featuredImage: '',
    status: 'published',
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
    content: `If Search Console is sending you here from **"vet authorization" "certificate" "prescription food"**, you are probably stuck between a clinic, Chewy or a manufacturer portal, and a dog who only eats the bag with the veterinary stamp.

Therapeutic diets (kidney, urinary, hydrolyzed protein, diabetic, gastrointestinal) are not grocery kibble with better marketing. Manufacturers and many pharmacies treat them like a **restricted veterinary product**. The paper (or PDF) that unlocks the bag is the **veterinary authorization** or **veterinary authorization certificate**.

## Authorization vs prescription vs "the vet said it was fine"

Language is messy on purpose:

- A **prescription** in the legal sense is a drug order. Food is food, until a company or a state board treats the diet like a prescription item.
- A **veterinary authorization** is the clinic attesting that a veterinarian has a valid veterinarian-client-patient relationship (VCPR) and that this animal should receive that diet.
- A **certificate** in manufacturer portals is often just their name for the same authorization, sometimes with an expiration (90 days, 6 months, or 12 months).

If an online seller asks for a certificate, they want the clinic's signed authorization, not a photo of the bag.

## Who asks for it

- **Hill's Veterinary Diets**, **Royal Canin Veterinary**, **Purina Pro Plan Veterinary** portals
- Online pharmacies that cannot ship the diet without a clinic on file
- Some brick-and-mortar stores that keep therapeutic SKUs behind the counter

Your regular vet may already have a standing authorization in their practice management software. The chaos starts when you switch clinics, use a second pharmacy, or the form expires while the dog is still eating the diet.

## What the form usually contains

- Clinic name, veterinarian license, and signature or e-authorization
- Patient name, species, and sometimes date of birth or chart number
- Diet name and calorie or product code
- Duration of authorization
- A statement that the veterinarian will continue to oversee the case

It should **match the pet**. A certificate for the wrong dog, or a nickname that does not match the pharmacy profile, is how shipments bounce.

## How to stop doing this every month

1. Ask the clinic which **portal** they use (Hill's, Royal Canin, Covetrus, etc.).
2. Get a **PDF or portal confirmation** the same day the diet is recommended, not two weeks later when the bag is empty.
3. Store it next to the diagnosis that justified the diet (CKD staging, urinalysis, elimination-diet notes). See [chronic condition record systems](/blog/chronic-condition-pet-record-system) if you keep a longer medical history.
4. Put a reminder on the **expiration**, the same way you would for a [heartworm pill](/blog/heartworm-pill-tracker).
5. Share the PDF with whoever orders food. A [share folder for pets](/blog/share-folders-for-pets) beats forwarding the same email thread.

PetClues is built as that folder: diet authorization, lab work, and the vet's name in one vault so the pharmacy is not your medical records department.

## When authorization gets denied

Common reasons:

- No current VCPR (the clinic has not seen the pet within their policy window)
- Diet does not match the chart (you picked a different SKU online)
- The authorizing DVM left the practice
- The pet's name on the microchip, pharmacy, and form do not match

Call the clinic, not the internet. Bring the last chemistry panel if the diet is renal or hepatic. Nurses cannot invent a diagnosis to unlock a bag.

## Prescription treats and "veterinary exclusive" retail food

Some over-the-counter "veterinary exclusive" foods at clinics are not the same as prescription therapeutic diets. If the bag did not require a signed authorization last year and suddenly does, the manufacturer tightened the channel. Keep the new certificate anyway.

## FAQ

**Is prescription pet food legally a drug?** Usually no. The *authorization* is a manufacturer and pharmacy control, plus VCPR rules. Follow your clinic and your state's veterinary board.

**Can I use a certificate from a previous vet?** Sometimes, until it expires. New clinics often want their own authorization.

**Does a digital photo of the signed form work?** If the pharmacy accepts it, yes. Keep the original PDF. Screenshots crop the license number.

**What if I am traveling?** Pack a copy of the authorization with the [digital pet passport](/blog/what-is-a-digital-pet-passport) packet. Boarding kitchens still ask.

## Bottom line

The search query is awkward because the industry paperwork is awkward. **Get the veterinary authorization certificate once, store it with the medical reason for the diet, and calendar the expiry.** That is the whole game.`,
  },
  {
    id: 'gsc-digital-pet-passport',
    title: 'What Is a Digital Pet Passport? (Not the EU Paper Book)',
    slug: 'what-is-a-digital-pet-passport',
    excerpt:
      'A digital pet passport is a shareable medical snapshot: vaccines, microchip, meds, allergies, and vet contacts. How it differs from the EU pet passport, what to put on it, and when sitters or ER desks actually open it.',
    category: 'pet-travel',
    tags: [
      'digital pet passport',
      'pet emergency passport',
      'vaccination records',
      'microchip',
      'pet health records',
    ],
    author: 'PetClues Team',
    publishedAt: daysAgo(0),
    featuredImage: '',
    status: 'published',
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
    content: `**Digital pet passport** is a phrase two different industries use, which is why the query gets impressions and few clicks. Google cannot tell if you mean:

1. The **EU pet passport** (a bound booklet with rabies entries for travel between many European countries), or
2. A **phone-ready medical snapshot** for sitters, ER desks, airlines, and your own brain at 2 a.m.

This article is about meaning (2), because that is what people in the United States are usually trying to buy when they type the words into Google. If you need the EU booklet, you still need a veterinarian who is authorized to issue it. An app cannot stamp an EU passport.

PetClues product page: [digital pet passport](/digital-pet-passport).

## What belongs on a digital pet passport

Think **handoff sheet**, not entire medical history:

- Legal name and the name the sitter uses
- Species, breed, date of birth or estimated age, weight
- Microchip number and the registry it lives in
- Rabies vaccine date, product, and expiration
- Other core vaccines the boarding desk will ask for (DHPP, FVRCP, Bordetella)
- Current medications and the time they are due
- Severe allergies and the last reaction
- Primary vet name and phone
- Owner phones (two, not one)
- One sentence on temperament ("muzzle for nail trims," "food aggressive," "bolts if the door opens")

Labs, dental radiographs, and six years of invoices belong in the **vault**, not on the passport. The passport is what a stranger can use in five minutes. The vault is what a specialist uses in fifty.

## Digital vs paper vs "it's in my camera roll"

Camera roll fails because the rabies PDF is named IMG_8841 and the sitter has the other phone. Paper fails because it is in the junk drawer. A digital passport fails only if nobody has the link or QR.

Good implementations:

- A **public, tokenized URL** you can revoke
- A **QR** on a crate tag
- Offline-ish: a PDF you can screenshot when the cabin has no signal

Bad implementations:

- A login wall during a seizure
- A page that includes your home address and invoice history for every stranger who scans a collar

## When people actually open it

- Daycare intake
- After-hours ER when you are not the one in the lobby
- House sitters at pill time
- Airline check-in when they want the health certificate **and** the rabies date on one screen
- A finder if the dog is loose (this is why the QR should not dump your full home address by default)

Pair the passport with [lost pet QR ID](/resources/new-york/lost-pet-qr-id) style thinking: enough to help, not enough to dox you.

## How it relates to vaccination records

A passport **summarizes**. The [vaccination record](/pet-vaccination-records) is the certificate image with lot number. Boarding sometimes wants both. Keep the certificate in the vault and the dates on the passport so they cannot drift apart.

## FAQ

**Is a digital pet passport official for international travel?** Not by itself. Borders want the documents your corridor requires (EU passport, USDA/APHIS endorsement, titer, and so on). The digital page is the working copy you show while those papers are in the folder.

**Can I make one in Google Docs?** Yes. You will forget to update it. The value of software is that the passport reads from the same record as the reminder.

**Does every family member need the login?** They need the **link**, not necessarily the admin login. That is household sharing. See [share folders for pets](/blog/share-folders-for-pets).

## Bottom line

A **digital pet passport** is a shareable, revocable medical snapshot. It is not a clone of the EU booklet and it is not your entire chart. Build it once, keep rabies and meds honest, and put the QR where a stranger would look.`,
  },
  {
    id: 'gsc-vet-push-reminders',
    title: 'Veterinary Push Notification Reminders That People Actually Tap',
    slug: 'veterinary-push-notification-reminders',
    excerpt:
      'How veterinary push notification reminders should work for vaccines, heartworm, and refills. Why clinic SMS gets ignored, what to notify on, and how to set alerts without spamming the household.',
    category: 'pet-tech',
    tags: [
      'veterinary push notification reminders',
      'pet vaccination reminder',
      'medication reminder',
      'pet health tracker',
      'heartworm',
    ],
    author: 'PetClues Team',
    publishedAt: daysAgo(0),
    featuredImage: '',
    status: 'published',
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
    content: `**Veterinary push notification reminders** sounds like enterprise software. The search is simpler: people want the phone to buzz **before** the rabies expires, the heartworm chew is skipped, or the thyroid pill runs out.

Clinics already text. Those texts often look like marketing. Owners mute the short code. Push from an app the owner installed for **this dog** is a different permission.

## What is worth a push

Push is for time-critical care, not blog posts.

Worth a notification:

- Vaccine due in 7 days and 1 day
- Monthly parasite prevention on a fixed calendar day
- Prescription refill when remaining doses hit 3
- Lab recheck the veterinarian dated on the invoice
- A shared task: "give tramadol at 8pm" when two people in the household might double-dose

Not worth a push:

- "Your pet misses you"
- Generic wellness tips
- A weekly recap nobody asked for

If everything is urgent, nothing is. See also [pet medication reminder guide](/blog/pet-medication-reminder-guide).

## SMS vs email vs push vs calendar

- **Clinic SMS**: good for appointment reminders the clinic controls. Bad for daily pills. You cannot configure the clinic's vendor.
- **Email**: fine for "your annual is next month." Invisible at pill time.
- **OS calendar**: excellent if you live in Calendar. Terrible if the sitter does not have your iCloud.
- **App push**: best when the due date lives on the **same record** as the vaccine certificate, so the alert cannot drift from reality.

The failure mode is three systems with three dates. Pick a source of truth. PetClues is built so the reminder reads the record, not a sticky note.

## How to set a household without chaos

1. One person owns the **schedule**. Others get **notify**.
2. Critical meds (insulin, anticonvulsants, heart drugs) get a **confirm tap** so the second caregiver sees it was given.
3. Quiet hours exist. Heartworm at 7am should not also fire at 2am unless it is insulin.
4. When a vet changes the dose, change the reminder **in the lobby**, not "later."

This is the same discipline as [share folders for pets](/blog/share-folders-for-pets): access is a medical safety feature.

## Veterinary clinics and "push"

If you are a clinic reading this, owners want:

- Appointment push that includes **which pet**
- Pre-anesthetic fasting times
- "Your prescription is ready" that is not a coupon

They do not want your newsletter in the same channel as "rabies expires Friday."

## FAQ

**Will iOS kill the notifications?** If the user disables them, yes. Ask for permission in context ("turn on alerts for Heartgard Sunday") not on first launch.

**Can push replace the veterinarian?** No. A reminder is not a diagnosis. If the dog is collapsing, you call emergency, you do not wait for a notification.

**What about cats who hide?** The reminder is for the human. Pair it with a weight log if chronic disease is involved.

## Bottom line

**Veterinary push notification reminders** work when they are rare, tied to real due dates, and visible to everyone who might give the pill. Spam is why the clinic text got muted.`,
  },
  {
    id: 'gsc-heartworm-pill-tracker',
    title: 'Heartworm Pill Tracker: Monthly Prevention Without Missed Doses',
    slug: 'heartworm-pill-tracker',
    excerpt:
      'A practical heartworm pill tracker for monthly chewables: calendar tricks, missed-dose rules, antigen testing, and why "I gave it sometime in July" is how dogs end up on expensive treatment.',
    category: 'dog-health',
    tags: [
      'heartworm pill tracker',
      'heartworm prevention',
      'pet medication reminder',
      'dog vaccines',
      'veterinary push notification reminders',
    ],
    author: 'PetClues Team',
    publishedAt: daysAgo(0),
    featuredImage: '',
    status: 'published',
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
    content: `Heartworm disease is slow, ugly, and mostly preventable. The weak link is not the chemistry. It is the **calendar**. A **heartworm pill tracker** is any system that makes the monthly chew as automatic as rent.

If you already use a prevention schedule article, start with [heartworm prevention schedule reminder for dogs](/blog/heartworm-prevention-schedule-reminder-dogs). This page is the tracker itself: how to log doses, what to do when you miss one, and which tests still matter.

## Why "monthly" fails

Heartworm preventives (ivermectin/pyrantel, milbemycin, moxidectin, and several combination products) interrupt larval development. They are not a vaccine that lasts a year. Skip enough windows and larvae become adults in the pulmonary arteries.

Owners fail in predictable ways:

- The chew lives in a pantry they do not open
- Two people both think the other did it
- Vacation, then "we'll catch up"
- A new puppy schedule that never got a first-of-month rule
- Cats skipped because "indoor" (mosquitoes do not honor indoor)

## Build a tracker that survives real life

Pick **one calendar day** (the 1st is fine). Same day every month, not "the weekend we remember."

Log, every time:

- Date and time
- Product name and dose (weight matters; a 20 lb chew is wrong for a 55 lb dog)
- Who gave it
- Whether the dog spit it out (if they spat it, it did not happen)

A shared [push reminder](/blog/veterinary-push-notification-reminders) plus a confirm tap beats a private iPhone alarm.

If you use PetClues, put the prevention on the pet's medication list with a 30-day interval, not in a notes app titled "dog stuff."

## Missed a dose

Do **not** invent a double dose because you feel guilty. Label directions and your veterinarian win.

General pattern many clinics use (confirm yours):

- Give the chew when you remember if you are still inside the product's stated window
- Call the clinic if you are weeks late, especially in high-prevalence mosquito regions
- Do not skip the **annual heartworm antigen test** because "he's been on prevention." Prevention is not 100%, and bought chews are sometimes not given

Year-round prevention is the default recommendation from the American Heartworm Society in the United States, including winters that "feel too cold for mosquitoes."

## Testing still matters

Antigen tests look for adult female worm proteins. They will not catch last week's mosquito bite. They will catch a failure from last year. Keep the test date in the same tracker as the pills so the next wellness visit is not a scavenger hunt.

Positive test: this is a veterinary protocol (staging, doxycycline in many cases, adulticide, exercise restriction). Your tracker becomes an activity log: no more weekend fetch.

## Multi-pet households

Different weights, different products, same calendar day. Label the boxes. A [multi-pet household records](/blog/multi-pet-household-health-records-setup) setup is how the cat's topical does not get given to the Chihuahua.

## FAQ

**Is a spreadsheet a heartworm pill tracker?** Yes, if everyone can edit it. Spreadsheets die when only one person has the file.

**Can I use a 6-month injectable instead?** Some clinics offer moxidectin injectables. That is a different tracker: the **next injection date**, not a monthly chew. Still track it.

**Does heartworm prevention cover ticks?** Some combination products do. Many heartworm-only chews do not. Read the box. Tick control is a separate reminder if the product is not combo.

## Bottom line

A **heartworm pill tracker** is a dated log plus one household reminder, not a vibe. Same day each month, confirm who gave it, test annually, call the vet if you blew the window.`,
  },
  {
    id: 'gsc-share-folders-pets',
    title: 'Share Folders for Pets: Sitters, Vets, and Family Without Email Chaos',
    slug: 'share-folders-for-pets',
    excerpt:
      'How to share pet folders with sitters, co-parents, and clinics. What belongs in a shared drive versus a medical vault, permission levels, and how to stop sending IMG_4421 as a vaccination record.',
    category: 'pet-records',
    tags: [
      'share folders for pets',
      'pet health records',
      'household sharing',
      'pet sitter',
      'digital pet passport',
    ],
    author: 'PetClues Team',
    publishedAt: daysAgo(0),
    featuredImage: '',
    status: 'published',
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
    content: `**Share folders for pets** is a query from people who already tried Google Drive, iCloud, and a group text named "Dog." The intent is access: the sitter needs the rabies PDF, the co-parent needs the pill time, the ER needs allergies, and you do not want to grant the internet your entire life.

## Why a generic shared drive disappoints

Drive folders work until:

- Someone uploads "vaccine.pdf" three times and nobody knows which is current
- The sitter has view access but the file is "anyone with the link" on a different document
- A breakup happens and the ex still has editor rights to the medical history
- The clinic wants a **portal upload**, not a Drive link that expires

A pet folder is a **permissions problem** wearing a file problem.

## Three layers of sharing (use all three)

1. **Passport layer**: the [digital pet passport](/blog/what-is-a-digital-pet-passport). Revocable link. ER and finder. No invoices.
2. **Operations layer**: who gives the heartworm chew, who can book the vet, who has the crate combination. This is household roles, not a PDF.
3. **Archive layer**: surgery reports, titers, [prescription diet authorization](/blog/vet-authorization-certificate-prescription-food), imaging. Few people need this. Your neurologist does. The weekend sitter does not.

Dumping all three into one Drive folder named "Milo" is how sitters get a 2019 fecal and miss tonight's prednisone.

## Permission model that matches real families

- **Owner**: billing, delete, revoke links
- **Editor**: add records, mark meds given
- **Viewer**: sitter, dog walker, school-age kid who should not delete the rabies cert

When a sitter contract ends, revoke. Do not rely on "please delete the folder."

PetClues household sharing is this model on purpose: the medical vault is not a public album.

## What to name files so humans can sort

Bad: \`IMG_8841.HEIC\`
Good: \`2026-03-12_rabies_3yr_cityvet.pdf\`

Include the **date the shot was given**, not the date you scanned it.

Same pattern for:

- Heartworm tests
- Authorization certificates
- Discharge instructions (those expire in meaning even if the PDF lives forever)

## Sitters vs clinics

Sitters need tonight. Clinics need history. Do not send the clinic a passport QR and call it a transfer of care. Do not send the sitter a 40-page export.

For sitter instructions specifically, see [pet sitter medical emergency info](/blog/pet-sitter-instructions-medical-emergency-info).

## FAQ

**Is Google Drive enough?** For a single adult with one dog, maybe. For two homes, a sitter rotation, and a chronic disease, you want roles and a passport link, not a pile.

**Should the vet be an editor?** Usually no. Send them a PDF or use their portal. Editors can delete.

**What about AirDrop at the clinic?** Fine for one visit. It is not a folder.

## Bottom line

**Share folders for pets** means: passport for strangers, household roles for caregivers, archive for specialists. If everything is shared with everyone, nothing is protected and nothing is findable.`,
  },
];

export const GSC_OPPORTUNITY_POSTS: BlogPost[] = attachBlogImages(GSC_OPPORTUNITY_POSTS_RAW);
