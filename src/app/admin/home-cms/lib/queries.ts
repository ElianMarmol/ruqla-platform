import {
  DEFAULT_HOME_CATALOG_CARDS,
  DEFAULT_HOME_CATALOG_SECTION,
} from '@/lib/home-catalog-defaults';
import { isMissingSchemaError } from '@/lib/supabase-errors';
import { supabaseService } from '@/lib/supabase-service';
import type {
  Category,
  HomeCatalogCard,
  HomeCatalogSection,
  MainBanner,
  PartnerBrand,
  PromoBanner,
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

/** true cuando las tablas home_catalog_* existen en Supabase */
export async function homeCatalogTablesExist(): Promise<boolean> {
  const { error } = await supabaseService
    .from('home_catalog_section')
    .select('id')
    .limit(1);

  return !error || !isMissingSchemaError(error);
}
