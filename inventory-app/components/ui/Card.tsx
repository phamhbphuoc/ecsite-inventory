import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', ...props }: CardProps) {
  return <div className={`rounded-lg border bg-white p-4 shadow-sm ${className}`} {...props} />;
}
