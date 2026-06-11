import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button, Badge } from '@/components/ui';
import { PAGE_IMG } from '@/data/pageImages';
import { ROUTES } from '@/routes/paths';
import styles from './AboutPage.module.css';

export function AboutPage() {
  return (
    <div className={styles.page}>
      <Header variant="landing" />

      {/* 1. Fullscreen emotional hero */}
      <section className={styles.hero} aria-labelledby="about-hero-title">
        <img className={styles.heroImg} src={PAGE_IMG.app.about} alt="" aria-hidden />
        <div className={styles.heroScrim} aria-hidden />
        <div className={`container ${styles.heroInner}`}>
          <Badge variant="accent" className={styles.heroBadge}>
            About PetClues
          </Badge>
          <h1 id="about-hero-title" className={styles.heroTitle}>
            Every pet has a story. Most of it gets forgotten.
          </h1>
          <p className={styles.heroSubtitle}>
            PetClues preserves the moments, the milestones, and the care details that make a life
            together feel real.
          </p>
        </div>
      </section>

      {/* 2. Memory cards grid */}
      <section className={styles.section} aria-label="Memories PetClues helps you keep">
        <div className={`container ${styles.sectionInner}`}>
          <p className={styles.sectionEyebrow}>The moments</p>
          <h2 className={styles.sectionTitle}>The details you never want to lose</h2>
          <p className={styles.sectionLead}>
            The important stuff is rarely filed perfectly. It is scattered across drawers, emails,
            chats, camera rolls, and half-remembered notes.
          </p>

          <div className={styles.cardsGrid}>
            {[
              { title: "A puppy's first day home", body: 'The beginning of a story you will replay for years.' },
              { title: 'The vaccination card', body: 'Tucked away until the day you need proof in a hurry.' },
              { title: 'The medication reminder', body: 'You meant to set it. Life got busy.' },
              { title: 'A difficult vet visit photo', body: 'Because you wanted to remember it turned out okay.' },
              { title: 'The weight milestone', body: 'Tiny progress that matters more than it seems.' },
              { title: 'The recovery', body: 'The hard part. The hopeful part. The relief.' },
              { title: 'The adventures', body: 'The days that become the stories you tell.' },
              { title: 'The ordinary days', body: 'Quiet routines that become the memories you treasure most.' },
            ].map((card) => (
              <article key={card.title} className={styles.card}>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardBody}>{card.body}</p>
              </article>
            ))}
          </div>

          <div className={styles.quote}>
            <p className={styles.quoteText}>That's where PetClues began.</p>
          </div>
        </div>
      </section>

      {/* 3. Pet life timeline visualization */}
      <section className={styles.sectionAlt} aria-label="A pet life timeline">
        <div className={`container ${styles.sectionInner}`}>
          <p className={styles.sectionEyebrow}>The timeline</p>
          <h2 className={styles.sectionTitle}>A life, organized into chapters</h2>
          <p className={styles.sectionLead}>
            Pet care is not a checklist. It is a journey. PetClues turns scattered records into a
            story you can scroll, search, and share.
          </p>

          <div className={styles.timeline}>
            {[
              { label: 'Day 1', title: 'Welcome home', body: 'Photos, first meals, first routines.' },
              { label: 'Week 8', title: 'Vaccination series', body: 'Cards, due dates, and reminders that stick.' },
              { label: 'Month 6', title: 'A new habit', body: 'Medication, prevention, daily check-ins.' },
              { label: 'Year 2', title: 'A tough visit', body: 'Bills, notes, and the context you will be asked for.' },
              { label: 'Anytime', title: 'Emergency-ready', body: 'A passport you can share in seconds.' },
            ].map((item) => (
              <div key={item.title} className={styles.timelineRow}>
                <div className={styles.timelineMarker} aria-hidden />
                <div className={styles.timelineMeta}>
                  <p className={styles.timelineLabel}>{item.label}</p>
                </div>
                <div className={styles.timelineCard}>
                  <h3 className={styles.timelineTitle}>{item.title}</h3>
                  <p className={styles.timelineBody}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why PetClues exists */}
      <section className={styles.section} aria-label="Why PetClues exists">
        <div className={`container ${styles.sectionInner}`}>
          <p className={styles.sectionEyebrow}>Why</p>
          <h2 className={styles.sectionTitle}>Why we built PetClues</h2>
          <div className={styles.twoCol}>
            <div className={styles.col}>
              <p className={styles.prose}>
                We did not set out to build another pet app. We set out to solve a simple problem:
              </p>
              <div className={styles.quoteCompact}>
                <p className={styles.quoteText}>
                  Why is it so difficult to keep a pet's life organized?
                </p>
              </div>
              <p className={styles.prose}>Every vet visit creates records.</p>
              <p className={styles.prose}>Every vaccination creates paperwork.</p>
              <p className={styles.prose}>Every medication creates schedules.</p>
              <p className={styles.prose}>Every stage of life creates memories worth keeping.</p>
            </div>
            <div className={styles.col}>
              <p className={styles.prose}>
                Yet most pet owners are left managing all of it across different apps, folders,
                calendars, notes, and messages.
              </p>
              <p className={styles.prose}>
                We believed there should be one place where everything comes together. A place
                where you can instantly find what matters. A place where your pet's entire story
                lives.
              </p>
              <p className={styles.prose}>
                A place built not around tasks, but around the relationship you have with the
                animal who trusts you every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. What lives inside PetClues */}
      <section className={styles.sectionAlt} aria-label="What lives inside PetClues">
        <div className={`container ${styles.sectionInner}`}>
          <p className={styles.sectionEyebrow}>Inside PetClues</p>
          <h2 className={styles.sectionTitle}>More than records</h2>
          <p className={styles.sectionLead}>
            PetClues organizes the practical side of pet ownership, but every item is really part
            of a story.
          </p>
          <div className={styles.featureGrid} role="list">
            {[
              { title: 'Health records', body: 'Appointments, diagnoses, medications, wellness details.' },
              { title: 'Vaccination history', body: 'Proof, due dates, and reminders kept together.' },
              { title: 'Reminders', body: 'Schedules that stay calm and reliable.' },
              { title: 'Documents', body: 'Bills, lab reports, prescriptions in a searchable vault.' },
              { title: 'Monthly reports', body: 'A shareable story of consistency and milestones.' },
              { title: 'Care timelines', body: 'Chapters that connect memories and medical details.' },
              { title: 'Emergency passport', body: 'Sitter and clinic ready summaries in seconds.' },
              { title: 'Family sharing', body: 'Shared care without losing context.' },
            ].map((f) => (
              <div key={f.title} className={styles.featureCard} role="listitem">
                <p className={styles.featureTitle}>{f.title}</p>
                <p className={styles.featureBody}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Founder philosophy */}
      <section className={styles.section} aria-label="Philosophy">
        <div className={`container ${styles.sectionInner}`}>
          <p className={styles.sectionEyebrow}>Philosophy</p>
          <h2 className={styles.sectionTitle}>Designed to feel calm</h2>
          <div className={styles.philosophy}>
            <div className={styles.philosophyCard}>
              <h3 className={styles.philosophyTitle}>Reduce stress</h3>
              <p className={styles.prose}>Technology should reduce stress, not create more of it.</p>
            </div>
            <div className={styles.philosophyCard}>
              <h3 className={styles.philosophyTitle}>Clarity over clutter</h3>
              <p className={styles.prose}>No clutter. No overwhelming dashboards. No unnecessary complexity.</p>
            </div>
            <div className={styles.philosophyCard}>
              <h3 className={styles.philosophyTitle}>The right moment</h3>
              <p className={styles.prose}>Just the information you need, when you need it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Trust section */}
      <section className={styles.sectionAlt} aria-label="Trust">
        <div className={`container ${styles.sectionInner}`}>
          <p className={styles.sectionEyebrow}>Trust</p>
          <h2 className={styles.sectionTitle}>A note about veterinary care</h2>
          <div className={styles.trustCard}>
            <p className={styles.prose}>
              PetClues helps organize information and support pet care planning. It is not a
              substitute for professional veterinary advice, diagnosis, or treatment. For medical
              concerns, emergencies, diagnoses, or treatment decisions, always consult a licensed
              veterinarian.
            </p>
            <p className={styles.prose}>
              Your pet's health deserves expert care. PetClues is here to help you stay organized
              along the way.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Premium CTA */}
      <section className={styles.cta} aria-label="Get started">
        <img className={styles.ctaImg} src={PAGE_IMG.app.cta} alt="" aria-hidden />
        <div className={styles.ctaScrim} aria-hidden />
        <div className={`container ${styles.ctaInner}`}>
          <h2 className={styles.ctaTitle}>Keep your pet's story close</h2>
          <p className={styles.ctaLead}>
            Start building a calm home for your pet's memories, milestones, and care details - all
            in one place.
          </p>
          <div className={styles.ctaActions}>
            <Link to={ROUTES.SIGNUP}>
              <Button variant="primary" size="lg">
                Create free account
              </Button>
            </Link>
            <Link to={ROUTES.PRICING}>
              <Button variant="secondary" size="lg" className={styles.pricingCtaBtn}>
                View pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
