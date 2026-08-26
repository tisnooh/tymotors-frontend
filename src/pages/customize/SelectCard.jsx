import React from 'react';

export function SelectCard({ label, children }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#232B3A] bg-gradient-to-br from-[#11151C] to-[#0D0F13] px-4 py-3 transition-colors focus-within:border-[#E10600]/70 focus-within:shadow-[0_0_0_1px_rgba(225,6,0,0.12)]">
      <span className="absolute inset-y-3 left-0 w-px bg-gradient-to-b from-transparent via-[#F2C94C]/70 to-transparent" />
      <p className="font-mono text-[9px] tracking-[0.32em] uppercase text-[#F2C94C]/80">{label}</p>
      {children}
    </div>
  );
}
