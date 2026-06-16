import { fetchPublicStoreTopBar } from '@/lib/store-top-bar-queries';

import StoreTopBar from './StoreTopBar';

export default async function StoreTopBarServer() {
  const { section, items } = await fetchPublicStoreTopBar();

  if (!section.is_active || items.length === 0) {
    return null;
  }

  return <StoreTopBar items={items} />;
}
