import type { PropsWithChildren } from "react";
import styles from "./AlarmCritical.module.css";

export function AlarmCritical({ children }: PropsWithChildren) {
  return (
    <div className={styles.alarmCritical} role="alert">
      <span aria-hidden="true" className={styles.icon}>
        !
      </span>
      <span className={styles.label}>{children}</span>
    </div>
  );
}
</content>
</invoke>