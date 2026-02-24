export type SlugifyOptions = {
  maxLength?: number;
};

export function slugify(input: string, opts: SlugifyOptions = {}): string {
  const maxLength = opts.maxLength ?? 80;

  const base = input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '') // drop quotes
    .replace(/\s+/g, '-') // spaces -> hyphen
    .replace(/[^a-z0-9-]/g, '') // strip non-url chars
    .replace(/-+/g, '-') // collapse ---
    .replace(/^-|-$/g, ''); // trim hyphens

  return base.length > maxLength
    ? base.slice(0, maxLength).replace(/-$/g, '')
    : base;
}
