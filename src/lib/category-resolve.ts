export type CategoryRef = {
  id: string;
  slug: string;
  name: string;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Términos de búsqueda por ítem del menú (solo estos, sin mezclar con otros) */
export const CATEGORY_NAV_KEYS = {
  cargadores: ['cargadores-cables', 'cargadores-y-cables', 'cargadores', 'cargador'],
  fundas: ['fundas-y-protectores', 'fundas-protectores', 'fundas', 'protector'],
  auriculares: ['auriculares', 'auricular', 'audio'],
  componentes: ['componentes-pc', 'componentes', 'componente'],
  ofertas: ['ofertas', 'promociones', 'promo', 'descuento'],
} as const;

export type CategoryNavKey = keyof typeof CATEGORY_NAV_KEYS;

export function isCategoryUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function scoreCategoryMatch(cat: CategoryRef, terms: string[]): number {
  const slug = cat.slug.toLowerCase();
  const name = cat.name.toLowerCase();
  let score = 0;

  for (const term of terms) {
    const t = term.toLowerCase();
    const nameTerm = t.replace(/-/g, ' ');

    if (slug === t) score = Math.max(score, 100);
    else if (slug.startsWith(t) || slug.includes(`-${t}`) || slug.includes(`${t}-`)) {
      score = Math.max(score, 70);
    } else if (name.includes(nameTerm)) score = Math.max(score, 50);
  }

  return score;
}

function findBestCategory(
  terms: string[],
  categories: CategoryRef[],
  minScore = 40
): CategoryRef | null {
  let best: CategoryRef | null = null;
  let bestScore = 0;

  for (const cat of categories) {
    const s = scoreCategoryMatch(cat, terms);
    if (s > bestScore) {
      bestScore = s;
      best = cat;
    }
  }

  return bestScore >= minScore ? best : null;
}

/** Encuentra la categoría de Supabase para un ítem del menú */
export function findCategoryForNavKey(
  navKey: CategoryNavKey,
  categories: CategoryRef[]
): CategoryRef | null {
  return findBestCategory([...CATEGORY_NAV_KEYS[navKey]], categories);
}

export function getCategoryHref(
  navKey: CategoryNavKey,
  categories: CategoryRef[]
): string {
  if (navKey === 'ofertas') {
    const ofertas = findCategoryForNavKey('ofertas', categories);
    return ofertas
      ? `/productos?category=${encodeURIComponent(ofertas.slug)}`
      : '/productos';
  }

  const match = findCategoryForNavKey(navKey, categories);
  if (match) {
    return `/productos?category=${encodeURIComponent(match.slug)}`;
  }

  return `/productos?category=${encodeURIComponent(CATEGORY_NAV_KEYS[navKey][0])}`;
}

/**
 * Resuelve ?category= de la URL al slug real en Supabase.
 * Solo usa alias del nav si el parámetro coincide con una clave conocida.
 */
export function resolveCategorySlug(
  param: string,
  categories: CategoryRef[]
): string {
  const trimmed = param.trim();
  if (!trimmed) return trimmed;

  if (isCategoryUuid(trimmed)) {
    const byId = categories.find((c) => c.id === trimmed);
    return byId?.slug ?? trimmed;
  }

  const lower = trimmed.toLowerCase();

  const exact = categories.find((c) => c.slug.toLowerCase() === lower);
  if (exact) return exact.slug;

  const navKey = lower as CategoryNavKey;
  if (navKey in CATEGORY_NAV_KEYS) {
    const fromNav = findCategoryForNavKey(navKey, categories);
    if (fromNav) return fromNav.slug;
  }

  const terms = [lower, lower.replace(/_/g, '-')];
  const fromParam = findBestCategory(terms, categories, 50);
  if (fromParam) return fromParam.slug;

  return trimmed;
}

/** Misma categoría aunque el slug en la URL sea un alias distinto */
export function isSameCategory(
  urlParam: string,
  categorySlug: string,
  categories: CategoryRef[]
): boolean {
  if (!urlParam || !categorySlug) return false;
  if (urlParam === categorySlug) return true;

  const resolvedUrl = resolveCategorySlug(urlParam, categories);
  return resolvedUrl === categorySlug;
}
