'use client';

import * as React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

/* ================= CARD ================= */
export function Card({ children, className }: CardProps) {
  return (
    <div className={`rounded-lg border bg-white ${className ?? ''}`}>
      {children}
    </div>
  );
}

/* ================= CARD HEADER ================= */
export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-b p-4">{children}</div>;
}

/* ================= CARD TITLE ================= */
export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}

/* ================= CARD CONTENT ================= */
export function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>;
}