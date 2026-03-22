import type { ReactNode } from 'react';

interface ButtonProps {
  children?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function Button({ children }: ButtonProps) {
  return <button className="btn category-btn">{children}</button>;
}
