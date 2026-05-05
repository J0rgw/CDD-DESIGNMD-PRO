import { type InputHTMLAttributes, forwardRef } from "react";
import styles from "./Input.module.css";

type Props = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, Props>((props, ref) => (
  <input ref={ref} className={styles.inputText} {...props} />
));
Input.displayName = "Input";
</content>
</invoke>