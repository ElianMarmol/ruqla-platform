import { supabaseService } from '@/lib/supabase-service';
import type { MainBanner, PartnerBrand, PromoBanner } from '@/types';

export async function fetchMainBanners(): Promise<MainBanner[]> {
  const { data, error } = await supabaseService
    .from('main_banners')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) throw error;
  return (data ?? []) as MainBanner[];
}

export async function fetchPromoBanners(): Promise<PromoBanner[]> {
  const { data, error } = await supabaseService
    .from('promo_banners')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) throw error;
  return (data ?? []) as PromoBanner[];
}

export async function fetchPartnerBrands(): Promise<PartnerBrand[]> {
  const { data, error } = await supabaseService
    .from('partner_brands')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as PartnerBrand[];
}
