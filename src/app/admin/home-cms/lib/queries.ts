import {
  DEFAULT_HOME_CATALOG_CARDS,
  DEFAULT_HOME_CATALOG_SECTION,
} from '@/lib/home-catalog-defaults';
import { DEFAULT_SHOP_PAGE_HEADER } from '@/lib/shop-page-defaults';
import {
  DEFAULT_STORE_NAV_LINKS,
  DEFAULT_STORE_SETTINGS,
} from '@/lib/store-settings-defaults';
import {
  DEFAULT_STORE_TOP_BAR,
  DEFAULT_STORE_TOP_BAR_ITEMS,
} from '@/lib/store-top-bar-defaults';
import {
  DEFAULT_STORE_TRUST_FEATURES,
  DEFAULT_STORE_TRUST_FEATURES_ITEMS,
} from '@/lib/store-trust-features-defaults';
import {
  DEFAULT_STORE_FOOTER,
  DEFAULT_STORE_FOOTER_LINKS,
} from '@/lib/store-footer-defaults';
import { isMissingSchemaError } from '@/lib/supabase-errors';
import { supabaseService } from '@/lib/supabase-service';
import type {
  Category,
  HomeCatalogCard,
  HomeCatalogSection,
  MainBanner,
  PartnerBrand,
  PromoBanner,
  ShopPageHeader,
  StoreNavLink,
  StoreSettings,
  StoreTopBar,
  StoreTopBarItem,
  StoreTrustFeatures,
  StoreTrustFeaturesItem,
  StoreFooter,
  StoreFooterLink,
} from '@/types';

export async function fetchMainBanners(): Promise<MainBanner[]> {
  const { data, error } = await supabaseService
    .from('main_banners')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as MainBanner[];
}

export async function fetchPromoBanners(): Promise<PromoBanner[]> {
  const { data, error } = await supabaseService
    .from('promo_banners')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as PromoBanner[];
}

export async function fetchPartnerBrands(): Promise<PartnerBrand[]> {
  const { data, error } = await supabaseService
    .from('partner_brands')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as PartnerBrand[];
}

export async function fetchAllCategoriesForCms(): Promise<Category[]> {
  const withOrder = await supabaseService
    .from('categories')
    .select('id, name, slug, order_index')
    .order('order_index', { ascending: true });

  if (!withOrder.error) {
    return (withOrder.data ?? []) as Category[];
  }

  if (!isMissingSchemaError(withOrder.error)) {
    throw new Error(withOrder.error.message);
  }

  const { data, error } = await supabaseService
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Category[];
}

export async function fetchHomeCatalogSection(): Promise<HomeCatalogSection> {
  const { data, error } = await supabaseService
    .from('home_catalog_section')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) {
      return DEFAULT_HOME_CATALOG_SECTION;
    }
    throw new Error(error.message);
  }

  return (data ?? DEFAULT_HOME_CATALOG_SECTION) as HomeCatalogSection;
}

export async function fetchHomeCatalogCards(): Promise<HomeCatalogCard[]> {
  const { data, error } = await supabaseService
    .from('home_catalog_cards')
    .select('*, categories(id, name, slug)')
    .order('order_index', { ascending: true });

  if (error) {
    if (isMissingSchemaError(error)) {
      return DEFAULT_HOME_CATALOG_CARDS;
    }
    throw new Error(error.message);
  }

  return (data ?? []) as HomeCatalogCard[];
}

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const { data, error } = await supabaseService
    .from('store_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) return DEFAULT_STORE_SETTINGS;
    throw new Error(error.message);
  }

  return (data ?? DEFAULT_STORE_SETTINGS) as StoreSettings;
}

export async function fetchStoreNavLinks(): Promise<StoreNavLink[]> {
  const { data, error } = await supabaseService
    .from('store_nav_links')
    .select('*, categories(id, name, slug)')
    .order('order_index', { ascending: true });

  if (error) {
    if (isMissingSchemaError(error)) return DEFAULT_STORE_NAV_LINKS;
    throw new Error(error.message);
  }

  return (data ?? DEFAULT_STORE_NAV_LINKS) as StoreNavLink[];
}

export async function storeSettingsTablesExist(): Promise<boolean> {
  const { error } = await supabaseService
    .from('store_settings')
    .select('id')
    .limit(1);

  return !error || !isMissingSchemaError(error);
}

export async function fetchStoreTopBarSection(): Promise<StoreTopBar> {
  const { data, error } = await supabaseService
    .from('store_top_bar')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) return DEFAULT_STORE_TOP_BAR;
    throw new Error(error.message);
  }

  return (data ?? DEFAULT_STORE_TOP_BAR) as StoreTopBar;
}

export async function fetchStoreTopBarItems(): Promise<StoreTopBarItem[]> {
  const { data, error } = await supabaseService
    .from('store_top_bar_items')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    if (isMissingSchemaError(error)) return DEFAULT_STORE_TOP_BAR_ITEMS;
    throw new Error(error.message);
  }

  return (data ?? DEFAULT_STORE_TOP_BAR_ITEMS) as StoreTopBarItem[];
}

export async function storeTopBarTablesExist(): Promise<boolean> {
  const { error } = await supabaseService
    .from('store_top_bar')
    .select('id')
    .limit(1);

  return !error || !isMissingSchemaError(error);
}

export async function fetchShopPageHeader(): Promise<ShopPageHeader> {
  const { data, error } = await supabaseService
    .from('shop_page_header')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) {
      return DEFAULT_SHOP_PAGE_HEADER;
    }
    throw new Error(error.message);
  }

  return (data ?? DEFAULT_SHOP_PAGE_HEADER) as ShopPageHeader;
}

/** true cuando la tabla shop_page_header existe en Supabase */
export async function shopPageHeaderTableExists(): Promise<boolean> {
  const { error } = await supabaseService
    .from('shop_page_header')
    .select('id')
    .limit(1);

  return !error || !isMissingSchemaError(error);
}

/** true cuando las tablas home_catalog_* existen en Supabase */
export async function homeCatalogTablesExist(): Promise<boolean> {
  const { error } = await supabaseService
    .from('home_catalog_section')
    .select('id')
    .limit(1);

  return !error || !isMissingSchemaError(error);
}

export async function fetchStoreTrustFeaturesSection(): Promise<StoreTrustFeatures> {
  const { data, error } = await supabaseService
    .from('store_trust_features')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) return DEFAULT_STORE_TRUST_FEATURES;
    throw new Error(error.message);
  }

  return (data ?? DEFAULT_STORE_TRUST_FEATURES) as StoreTrustFeatures;
}

export async function fetchStoreTrustFeaturesItems(): Promise<StoreTrustFeaturesItem[]> {
  const { data, error } = await supabaseService
    .from('store_trust_features_items')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    if (isMissingSchemaError(error)) return DEFAULT_STORE_TRUST_FEATURES_ITEMS;
    throw new Error(error.message);
  }

  return (data ?? DEFAULT_STORE_TRUST_FEATURES_ITEMS) as StoreTrustFeaturesItem[];
}

export async function storeTrustFeaturesTablesExist(): Promise<boolean> {
  const { error } = await supabaseService
    .from('store_trust_features')
    .select('id')
    .limit(1);

  return !error || !isMissingSchemaError(error);
}

export async function fetchStoreFooterSection(): Promise<StoreFooter> {
  const { data, error } = await supabaseService
    .from('store_footer')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) return DEFAULT_STORE_FOOTER;
    throw new Error(error.message);
  }

  return (data ?? DEFAULT_STORE_FOOTER) as StoreFooter;
}

export async function fetchStoreFooterLinks(): Promise<StoreFooterLink[]> {
  const { data, error } = await supabaseService
    .from('store_footer_links')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    if (isMissingSchemaError(error)) return DEFAULT_STORE_FOOTER_LINKS;
    throw new Error(error.message);
  }

  return (data ?? DEFAULT_STORE_FOOTER_LINKS) as StoreFooterLink[];
}

export async function storeFooterTablesExist(): Promise<boolean> {
  const { error } = await supabaseService
    .from('store_footer')
    .select('id')
    .limit(1);

  return !error || !isMissingSchemaError(error);
}
