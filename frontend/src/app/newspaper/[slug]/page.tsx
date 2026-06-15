import { notFound } from 'next/navigation';
import SharedNewspaperView from '@/components/SharedNewspaperView';
import type { SharedNewspaper } from '@/lib/prototypeNewspapers';
import { getSharedNewspaperBySlug } from '@/lib/prototypeNewspapers';

interface NewspaperPageProps {
  params: Promise<{ slug: string }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchSharedNewspaper(slug: string): Promise<SharedNewspaper | null> {
  try {
    const res = await fetch(`${API_BASE}/newspapers/shared/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    
    const widgets = data.newspaper.widgets.map((w: any) => ({
      id: w.id,
      title: w.title,
      layoutType: w.layoutType,
      kind: w.kind,
      publisherId: w.publisherId || undefined,
      editorialBody: w.editorialBody || undefined,
      categoryFilter: w.categoryFilter || undefined,
    }));

    const layout = data.newspaper.widgets.map((w: any) => ({
      i: w.id,
      x: w.layoutX,
      y: w.layoutY,
      w: w.layoutW,
      h: w.layoutH,
      minW: w.layoutMinW,
      minH: w.layoutMinH,
    }));

    return {
      slug: data.newspaper.slug,
      name: data.newspaper.name,
      curator: data.newspaper.curator?.name || 'Anonymous',
      description: data.newspaper.description || '',
      widgets,
      layout,
      readingMode: data.newspaper.readingMode,
    };
  } catch {
    return null;
  }
}

export default async function NewspaperPage({ params }: NewspaperPageProps) {
  const { slug } = await params;

  // Try API first, fall back to local prototype data
  const newspaper = await fetchSharedNewspaper(slug) ?? getSharedNewspaperBySlug(slug) ?? null;

  if (!newspaper) {
    notFound();
  }

  return <SharedNewspaperView newspaper={newspaper} />;
}
