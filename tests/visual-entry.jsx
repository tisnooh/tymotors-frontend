// Visual-only fixture: no customer session, hosted database write or payment.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import '../src/lib/i18n';
import '../src/App.css';
import '../src/index.css';
import { Navbar } from '../src/components/layout/Navbar';
import { MobileMenu } from '../src/components/layout/MobileMenu';
import { SearchOverlay } from '../src/components/layout/SearchOverlay';
import { VisualAppProvider } from './visual-context';
import { SmoothScrollProvider } from '../src/components/layout/SmoothScrollProvider';
import Home from '../src/pages/Home';
import BrandDetail from '../src/pages/BrandDetail';
import CategoryPage from '../src/pages/CategoryPage';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Explicit QA-only emulation: the browser viewport capability has no touch/UA
// option. This exercises the existing phone branches, not a real Safari device.
const fixtureParams = new URLSearchParams(window.location.search);
const phoneFixture = fixtureParams.has('phone');
const reducedMotionFixture = phoneFixture && fixtureParams.has('reduce');
// QA-only enlarged text, without changing any browser/user preference.
const largeTextFixture = phoneFixture && fixtureParams.get('text') === 'large';
if (largeTextFixture) document.documentElement.style.fontSize = '24px';
if (phoneFixture) {
  const nativeMatchMedia = window.matchMedia.bind(window);
  window.matchMedia = query => nativeMatchMedia(query
    .replaceAll('(prefers-reduced-motion: no-preference)', reducedMotionFixture ? '(max-width: 0px)' : '(min-width: 0px)')
    .replaceAll('(prefers-reduced-motion: reduce)', reducedMotionFixture ? '(min-width: 0px)' : '(max-width: 0px)'));
  Object.defineProperty(navigator, 'userAgent', { configurable: true, value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile Safari/604.1' });
  Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 1 });
  gsap.registerPlugin(ScrollTrigger);
  Object.defineProperty(ScrollTrigger, 'isTouch', { configurable: true, get: () => 1, set: () => {} });
}
const ScrollWrapper = phoneFixture ? React.Fragment : SmoothScrollProvider;
createRoot(document.getElementById('root')).render(<BrowserRouter><VisualAppProvider><ScrollWrapper><div className="App"><Navbar /><MobileMenu /><SearchOverlay />
  <output className="sr-only" data-testid="visual-profile" data-phone={phoneFixture} data-reduced-motion={window.matchMedia('(prefers-reduced-motion: reduce)').matches} data-motion={window.matchMedia('(max-width: 767px) and (prefers-reduced-motion: no-preference)').matches} data-observer={'IntersectionObserver' in window} data-touch={ScrollTrigger.isTouch}>Fixture visuelle isolée, aucune API réelle.</output>
  <Routes><Route path="/" element={<Home />} /><Route path="/brands/:slug" element={<BrandDetail />} /><Route path="/category/:slug" element={<CategoryPage />} />
    <Route path="*" element={<main className="ty-container pt-28"><h1>Destination du lien — fixture visuelle</h1><Link to="/">Accueil</Link></main>} />
  </Routes></div></ScrollWrapper></VisualAppProvider></BrowserRouter>);
