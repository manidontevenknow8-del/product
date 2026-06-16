/**
 * Pet Match quiz imagery - dedicated assets under /public/images/pet-match/.
 * Each file is chosen to match the option label and hint copy.
 */
export const PET_MATCH_QUIZ_IMG = {
  heroes: {
    /** Person and dog in a calm home setting */
    livingSpace: '/images/pet-match/hero-living-space.jpg',
    /** Bonding between guardian and dog */
    experience: '/images/pet-match/hero-experience.jpg',
    /** Dogs running outdoors */
    activity: '/images/pet-match/hero-activity.jpg',
    /** Well-cared-for dog (monthly care investment) */
    budget: '/images/pet-match/hero-budget.jpg',
  },
  options: {
    /** Modern apartment interior */
    apartment: '/images/pet-match/option-apartment.jpg',
    /** Suburban house with yard */
    house_yard: '/images/pet-match/option-house-yard.jpg',
    /** Golden retriever puppy - first-time parent */
    first_time: '/images/pet-match/option-first-time.jpg',
    /** Experienced handler with a trained dog */
    experienced: '/images/pet-match/option-experienced.jpg',
    /** Relaxed cat - low activity companion */
    couch: '/images/pet-match/option-couch.jpg',
    /** Hiking with a dog - high activity */
    marathon: '/images/pet-match/option-marathon.jpg',
    /** Simple, low-fuss dog portrait */
    lean: '/images/pet-match/option-lean.jpg',
    /** Dogs playing together - everyday household rhythm */
    balanced: '/images/pet-match/option-balanced.jpg',
    /** Close bond at a vet-style wellness visit */
    generous: '/images/pet-match/option-generous.jpg',
  },
} as const;
