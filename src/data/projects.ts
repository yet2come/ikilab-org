interface MarkdownModule {
  frontmatter: {
    title: string;
    description: string;
    status: string;
    en: string;
    lead: string;
    snapshot: { label: string; value: string }[];
    focus: string[];
    phases: { label: string; title: string; body: string }[];
    questions: string[];
    ctaTitle: string;
    ctaBody: string;
    externalLabel?: string;
    externalHref?: string;
  };
  Content: unknown;
}

const modules = import.meta.glob('../content/projects/*.md', { eager: true }) as Record<string, MarkdownModule>;

export const projects = Object.entries(modules).map(([path, mod]) => {
  const slug = path.split('/').pop()?.replace(/\.md$/, '');

  if (!slug) {
    throw new Error(`Invalid project content path: ${path}`);
  }

  return {
    slug,
    ...mod.frontmatter,
    Content: mod.Content,
  };
});
