import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export function PrimaryButton({ children, ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button className="primary-button" {...props}>
      {children}
    </button>
  );
}
