import type { ReactNode } from 'react';

interface Props {
  message?: string;
  variant?: 'error' | 'success';
  children?: ReactNode;
}

export default function ErrorBanner({ message, variant = 'error', children }: Props) {
  if (!message && !children) {
    return null;
  }

  return (
    <div className={variant === 'success' ? 'success-banner' : 'error-banner'}>
      {message ? <div>{message}</div> : children}
    </div>
  );
}
