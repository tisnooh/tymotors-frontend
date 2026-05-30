import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { useMagnetic } from '@/lib/hooks/useMagnetic';

/**
 * Magnetic wrapper: any child becomes cursor-attracted with a subtle damping.
 * Use the inline component to wrap CTA buttons or links.
 */
export function Magnetic({ children, strength = 14, className = '' }) {
  const ref = useMagnetic({ strength });
  return (
    <span ref={ref} className={`inline-block will-change-transform ${className}`}>
      {children}
    </span>
  );
}

/**
 * MagneticLink: <Link> variant that has the magnetic interaction baked in.
 */
export const MagneticLink = forwardRef(function MagneticLink({ children, strength = 14, className = '', ...props }, _outerRef) {
  const ref = useMagnetic({ strength });
  return (
    <Link ref={ref} className={`will-change-transform ${className}`} {...props}>
      {children}
    </Link>
  );
});

/**
 * MagneticButton: <button> variant with magnetic interaction.
 */
export const MagneticButton = forwardRef(function MagneticButton(
  { children, strength = 12, className = '', type = 'button', ...props },
  _outerRef
) {
  const ref = useMagnetic({ strength });
  return (
    <button ref={ref} type={type} className={`will-change-transform ${className}`} {...props}>
      {children}
    </button>
  );
});
