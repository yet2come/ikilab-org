interface MarkdownModule {
  frontmatter: {
    title: string;
    description: string;
    category: string;
    en: string;
    lead: string;
    keyFacts: { label: string; value: string }[];
    summaryTitle: string;
    summaryPoints: string[];
    timelineTitle: string;
    timeline: { date: string; body: string }[];
    ctaTitle: string;
    ctaBody: string;
  };
  Content: unknown;
}

const modules = import.meta.glob('../content/cases/*.md', { eager: true }) as Record<string, MarkdownModule>;

export const cases = Object.entries(modules).map(([path, mod]) => {
  const slug = path.split('/').pop()?.replace(/\.md$/, '');

  if (!slug) {
    throw new Error(`Invalid case content path: ${path}`);
  }

  return {
    slug,
    ...mod.frontmatter,
    Content: mod.Content,
  };
});
