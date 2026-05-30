import React from 'react';

export function SelectCard({ label, children }) {
  return (
    <div className="rounded-xl border border-[#232B3A] bg-[#0F1115] px-4 py-2">
      <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C]/80">{label}</p>
      {children}
    </div>
  );
}
