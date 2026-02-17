'use client';

import * as React from 'react';

type TabsContextType = {
  value: string | undefined;
  setValue: (v: string) => void;
};

const TabsContext = React.createContext<TabsContextType | null>(null);

/* ================= TABS ROOT ================= */
export function Tabs({
  children,
  defaultValue,
  className,
}: {
  children: React.ReactNode;
  defaultValue?: string;
  className?: string;
}) {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

/* ================= TABS LIST ================= */
export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex gap-2 mb-4 ${className || ''}`}>
      {children}
    </div>
  );
}

/* ================= TABS TRIGGER ================= */
export function TabsTrigger({
  children,
  value,
  className,
}: {
  children: React.ReactNode;
  value: string;
  className?: string;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) return null;

  const active = ctx.value === value;

  return (
    <button
      onClick={() => ctx.setValue(value)}
      className={`px-3 py-1 border rounded transition ${
        active
          ? 'bg-indigo-600 text-white'
          : 'bg-white hover:bg-gray-100'
      } ${className || ''}`}
    >
      {children}
    </button>
  );
}

/* ================= TABS CONTENT ================= */
export function TabsContent({
  children,
  value,
  className,
}: {
  children: React.ReactNode;
  value: string;
  className?: string;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx || ctx.value !== value) return null;

  return <div className={className}>{children}</div>;
}