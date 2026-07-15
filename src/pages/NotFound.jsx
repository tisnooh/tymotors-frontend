import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="pt-32 pb-24 ty-container text-center min-h-[70vh]">
      <p className="font-mono text-[#F2C94C] text-xs tracking-[0.3em]">ERREUR 404</p>
      <h1 className="ty-display text-white text-5xl md:text-7xl mt-4">Route introuvable.</h1>
      <p className="text-ty-textMid mt-4">Cette page n’existe pas ou a été déplacée.</p>
      <Link to="/" className="ty-btn-primary inline-flex mt-8">Retour à l’accueil</Link>
    </main>
  );
}
