import React from 'react';
import { Link } from 'react-router-dom';

export function Logo({ size = 'md', accent = true }) {
  const sizes = {
    sm: 'text-base tracking-[0.22em]',
    md: 'text-lg tracking-[0.22em]',
    lg: 'text-2xl tracking-[0.22em]',
    xl: 'text-4xl tracking-[0.22em]',
  };
  return (
    <Link
      to="/"
      data-testid="logo-link"
      className={`group inline-flex items-center gap-2 font-display font-bold uppercase text-white ${sizes[size]}`}
    >
      <span className="relative">
        TY
        <span className="absolute -right-1 top-0 h-1.5 w-1.5 rounded-full bg-[#E10600] shadow-[0_0_12px_#E10600] group-hover:shadow-[0_0_18px_#FF1A12]" />
      </span>
      <span className="text-[#C7CDD6]">MOTORS</span>
      {accent && (
        <span className="hidden sm:inline-block ml-1 h-px w-6 bg-[#F2C94C] opacity-70 align-middle" />
      )}
    </Link>
  );
}
