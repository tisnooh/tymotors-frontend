import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = (process.env.REACT_APP_SITE_URL || 'https://tymotors.vercel.app').replace(/\/$/, '');
const IS_PRODUCTION = process.env.REACT_APP_SITE_MODE === 'production';

const ROUTES = {
  '/': ['TYMotors — Performance. Style. Technologie.', 'Pièces de tuning premium et technologie automobile pour BMW, Mercedes-Benz, Audi, Porsche, Volkswagen et Toyota.'],
  '/shop': ['Boutique de pièces automobiles | TYMotors', 'Découvrez les pièces de personnalisation, performance, intérieur et technologie sélectionnées par TYMotors.'],
  '/brands': ['Pièces automobiles par marque | TYMotors', 'Trouvez des pièces compatibles avec votre BMW, Mercedes-Benz, Audi, Porsche, Volkswagen ou Toyota.'],
  '/customize': ['Guide de compatibilité automobile | TYMotors', 'Sélectionnez votre véhicule pour découvrir les pièces TYMotors compatibles.'],
  '/support/contact': ['Contacter TYMotors', 'Contactez le support TYMotors pour une question produit, de compatibilité ou de commande.'],
  '/support/shipping': ['Livraison | TYMotors', 'Informations sur les modes, frais et délais de livraison TYMotors.'],
  '/support/returns': ['Retours et remboursements | TYMotors', 'Consultez les conditions de retour et de remboursement TYMotors.'],
  '/support/faq': ['Questions fréquentes | TYMotors', 'Réponses aux questions fréquentes sur les produits, la compatibilité, les commandes et la livraison.'],
  '/legal/privacy': ['Politique de confidentialité | TYMotors', 'Découvrez comment TYMotors traite et protège vos données personnelles.'],
  '/legal/terms': ['Conditions générales de vente | TYMotors', 'Consultez les conditions générales de vente et d’utilisation de TYMotors.'],
  '/legal/cookies': ['Gestion des cookies | TYMotors', 'Consultez et gérez vos préférences de cookies sur TYMotors.'],
};

function setMeta(selector, attributes, content) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  element.setAttribute('content', content);
}

export function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith('/product/')) return;
    const isPrivatePage = ['/cart', '/wishlist', '/order-success', '/admin', '/account', '/auth'].some((path) => pathname.startsWith(path));
    let seo = ROUTES[pathname];
    if (!seo && pathname.startsWith('/category/')) seo = ['Pièces automobiles par catégorie | TYMotors', 'Explorez les pièces automobiles TYMotors classées par usage et catégorie.'];
    if (!seo && pathname.startsWith('/brands/')) seo = ['Pièces compatibles par marque | TYMotors', 'Découvrez les pièces TYMotors sélectionnées pour votre marque automobile.'];
    if (!seo) seo = ['Page introuvable | TYMotors', 'La page demandée est introuvable.'];

    const [title, description] = seo;
    const canonicalUrl = `${SITE_URL}${pathname === '/' ? '' : pathname}`;
    document.title = title;
    setMeta('meta[name="description"]', { name: 'description' }, description);
    setMeta(
      'meta[name="robots"]',
      { name: 'robots' },
      !IS_PRODUCTION || isPrivatePage || title.startsWith('Page introuvable')
        ? 'noindex,nofollow'
        : 'index,follow,max-image-preview:large',
    );
    setMeta('meta[property="og:title"]', { property: 'og:title' }, title);
    setMeta('meta[property="og:description"]', { property: 'og:description' }, description);
    setMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl);
    setMeta('meta[property="og:type"]', { property: 'og:type' }, 'website');
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [pathname]);

  return null;
}
