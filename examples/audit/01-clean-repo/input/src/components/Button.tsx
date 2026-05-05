import { type ButtonHTMLAttributes, forwardRef } from "react";
import styles from "./Button.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={[styles.buttonPrimary, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  ),
);
Button.displayName = "Button";
</content>
</invoke>