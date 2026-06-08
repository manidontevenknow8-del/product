import styles from './OnboardingIntro.module.css';

export function OnboardingIntro() {
  return (
    <div className={styles.intro}>
      <div className={styles.icon}>
        <div className={styles.iconInner} />
      </div>

      <h1 className={styles.title}>
        Welcome to a calmer way to care
      </h1>

      <p className={styles.lead}>
        PetClues keeps everything about your companion - health records,
        reminders, and emergency details - beautifully organized in one place.
      </p>

      <div className={styles.points}>
        <div className={styles.point}>
          <span className={styles.pointDot} />
          <p className={styles.pointText}>
            <strong>Takes under two minutes</strong>
            A few simple questions - then you&apos;re ready to go.
          </p>
        </div>
        <div className={styles.point}>
          <span className={styles.pointDot} />
          <p className={styles.pointText}>
            <strong>Always within reach</strong>
            Scans, timelines, and emergency info - whenever you need them.
          </p>
        </div>
        <div className={styles.point}>
          <span className={styles.pointDot} />
          <p className={styles.pointText}>
            <strong>Private and secure</strong>
            Your pet&apos;s details stay yours. Always.
          </p>
        </div>
      </div>
    </div>
  );
}
