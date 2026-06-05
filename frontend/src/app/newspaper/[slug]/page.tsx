import { notFound } from 'next/navigation';
import SharedNewspaperView from '@/components/SharedNewspaperView';
import { getSharedNewspaperBySlug } from '@/lib/prototypeNewspapers';

interface NewspaperPageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewspaperPage({ params }: NewspaperPageProps) {
  const { slug } = await params;
  const newspaper = getSharedNewspaperBySlug(slug);

  if (!newspaper) {
    notFound();
  }

  return <SharedNewspaperView newspaper={newspaper} />;
}
