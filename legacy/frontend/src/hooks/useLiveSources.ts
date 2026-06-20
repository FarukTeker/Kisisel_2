"use client";

import { useState, useEffect } from 'react';
import { fetchSources, fetchArticlesBySource, type RssSource, type LiveArticle } from '../lib/articlesApi';

export interface LiveSourceWithArticles extends RssSource {
  articles: LiveArticle[];
  loading: boolean;
  error?: string;
}

export function useLiveSources() {
  const [sources, setSources] = useState<RssSource[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);

  useEffect(() => {
    fetchSources().then((data) => {
      setSources(data);
      setSourcesLoading(false);
    });
  }, []);

  return { sources, sourcesLoading };
}

export function useLiveArticles(sourceId: string | undefined, fallback: LiveArticle[]) {
  const [articles, setArticles] = useState<LiveArticle[]>(fallback);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sourceId) return;
    setLoading(true);
    fetchArticlesBySource(sourceId, 10).then((data) => {
      setArticles(data.length > 0 ? data : fallback);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceId]);

  return { articles, loading };
}
