import type { PropsWithChildren } from "react";
import styles from "./Card.module.css";

export function Card({ children }: PropsWithChildren) {
  return <section className={styles.card}>{children}</section>;
}
</content>
</invoke>