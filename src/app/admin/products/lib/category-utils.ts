export function nameToSlug(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}
