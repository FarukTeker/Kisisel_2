import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { KAiStatusPill } from '@/components/ui/KAiStatusPill';
import { KCard } from '@/components/ui/KCard';
import { KCategoryPill } from '@/components/ui/KCategoryPill';
import { KEyebrow } from '@/components/ui/KEyebrow';
import { KText } from '@/components/ui/KText';
import { Segmented } from '@/components/ui/Segmented';
import { useAppStore } from '@/features/store/appStore';
import { WIDGET_SIZES, type FeedWidget, type WidgetSize } from '@/features/store/types';
import { colors, radius, spacing } from '@/theme/tokens';
import type { Article } from '@/lib/types';

const MIN_HEIGHT: Record<WidgetSize, number> = { compact: 140, regular: 220, large: 320 };

export function WidgetCard({ widget, isEditable = false }: { widget: FeedWidget; isEditable?: boolean }) {
  const router = useRouter();
  const readingMode = useAppStore((s) => s.myNewspaper.readingMode);
  const editMode = useAppStore((s) => s.editMode);
  const selectedId = useAppStore((s) => s.selectedWidgetId);
  const articlesForWidget = useAppStore((s) => s.articlesForWidget);
  const baseSources = useAppStore((s) => s.sources);
  const customSources = useAppStore((s) => s.customSources);
  const sources = useMemo(() => [...baseSources, ...customSources], [baseSources, customSources]);
  const setSelectedWidget = useAppStore((s) => s.setSelectedWidget);
  const moveWidget = useAppStore((s) => s.moveWidget);
  const resizeWidget = useAppStore((s) => s.resizeWidget);
  const removeWidget = useAppStore((s) => s.removeWidget);
  const setEditorialBody = useAppStore((s) => s.setEditorialBody);

  const editing = isEditable && editMode;
  const selected = selectedId === widget.id;
  const isCustom = widget.sourceId?.startsWith('custom-') ?? false;
  const articles = articlesForWidget(widget);

  const [start, setStart] = useState(0);
  const visibleCount = countFor(widget, readingMode);
  const visible = paged(articles, start, visibleCount);
  const canPage = !editing && articles.length > visibleCount;

  const body = (
    <View style={[styles.inner, { minHeight: MIN_HEIGHT[widget.size] }]}>
      {/* header */}
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 4 }}>
          <KEyebrow text={eyebrowText(widget, sources)} color={eyebrowColor(widget)} />
          <KText variant="h2" numberOfLines={2}>
            {widget.title}
          </KText>
        </View>
        <View style={styles.kindBadge}>
          <KText variant="pill" color={colors.ink}>
            {badgeLabel(widget)}
          </KText>
        </View>
      </View>

      {/* content (dimmed + non-interactive while editing, except editorial) */}
      <View
        pointerEvents={editing && widget.kind !== 'editorial' ? 'none' : 'auto'}
        style={{ opacity: editing && widget.kind !== 'editorial' ? 0.55 : 1, gap: spacing.three }}>
        {widget.kind === 'editorial' ? (
          <Editorial widget={widget} editing={editing} readingMode={readingMode} onChange={(t) => setEditorialBody(widget.id, t)} />
        ) : isCustom ? (
          <Info text="Live content for custom sources is coming soon — your widget and layout are saved." />
        ) : articles.length === 0 ? (
          <Loading />
        ) : (
          <ArticleList widget={widget} readingMode={readingMode} items={visible} />
        )}

        {canPage ? (
          <View style={styles.pager}>
            <Pressable onPress={() => setStart((i) => wrap(i - 1, articles.length))} hitSlop={8}>
              <Ionicons name="chevron-back" size={18} color={colors.textMuted} />
            </Pressable>
            <KText variant="caption" color={colors.textSoft}>
              {articles.length} stories
            </KText>
            <Pressable onPress={() => setStart((i) => wrap(i + 1, articles.length))} hitSlop={8}>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          </View>
        ) : null}
      </View>

      {/* edit controls */}
      {editing ? (
        <View style={styles.editRow}>
          <View style={styles.moveBtns}>
            <MoveBtn icon="arrow-up" onPress={() => moveWidget(widget.id, -1)} />
            <MoveBtn icon="arrow-down" onPress={() => moveWidget(widget.id, 1)} />
          </View>
          <View style={{ flex: 1 }} />
          <View style={{ width: 200 }}>
            <Segmented
              variant="group"
              value={widget.size}
              onChange={(size) => resizeWidget(widget.id, size)}
              options={WIDGET_SIZES.map((s) => ({ value: s.value, label: s.label }))}
            />
          </View>
        </View>
      ) : null}
    </View>
  );

  return (
    <View>
      <Pressable disabled={!editing} onPress={() => setSelectedWidget(widget.id)}>
        <KCard selected={selected} editing={editing}>
          {body}
        </KCard>
      </Pressable>

      {editing ? (
        <>
          <Badge
            icon="options-outline"
            color={colors.ink}
            style={styles.badgeLeft}
            onPress={() => router.push({ pathname: '/widget-settings', params: { id: widget.id } })}
          />
          <Badge icon="close" color={colors.danger} style={styles.badgeRight} onPress={() => removeWidget(widget.id)} />
        </>
      ) : null}
    </View>
  );
}

// ---- sub-views ---------------------------------------------------------------

function ArticleList({
  widget,
  readingMode,
  items,
}: {
  widget: FeedWidget;
  readingMode: string;
  items: Article[];
}) {
  const discovery = widget.kind === 'popular' || widget.kind === 'random';
  const momentum = widget.kind === 'popular' ? '↑ Cross-source momentum' : '⟳ Unexpected angle';

  if (widget.kind === 'news' && readingMode === 'F') {
    const a = items[0];
    if (!a) return null;
    return (
      <View style={styles.fullArticle}>
        <KText variant="h1">{a.title}</KText>
        <View style={styles.metaRow}>
          <KText variant="label">{a.publisher}</KText>
          <KText variant="caption" color={colors.textSoft}>
            · {a.author} · {a.date}
          </KText>
          <KCategoryPill category={a.category} />
        </View>
        <KText variant="body" color={colors.ink} style={{ lineHeight: 22 }}>
          {summaryOf(a)}
        </KText>
        <View style={styles.footerRow}>
          <AiPill article={a} />
          <OpenSource article={a} prominent />
        </View>
      </View>
    );
  }

  if (widget.kind === 'news' && readingMode === 'S') {
    return (
      <View style={{ gap: spacing.two }}>
        {items.map((a) => (
          <View key={a.id} style={styles.scanRow}>
            <View style={{ flex: 1, gap: 3 }}>
              <KText variant="h3" numberOfLines={2}>
                {a.title}
              </KText>
              <View style={styles.inlineMeta}>
                <KText variant="caption" color={colors.textSoft}>
                  {a.date}
                </KText>
                <KCategoryPill category={a.category} />
              </View>
            </View>
            <OpenSource article={a} />
          </View>
        ))}
      </View>
    );
  }

  // skim (news) + discovery (popular/random)
  return (
    <View style={{ gap: spacing.three }}>
      {items.map((a) => (
        <View key={a.id} style={styles.skimCard}>
          <View style={styles.skimHead}>
            <KText variant="h3" numberOfLines={2} style={{ flex: 1 }}>
              {a.title}
            </KText>
            <KCategoryPill category={a.category} />
          </View>
          <KText variant="caption" color={colors.textSoft}>
            {discovery ? `${momentum} · ${a.publisher} · ${a.date}` : `${a.publisher} · ${a.author} · ${a.date}`}
          </KText>
          {readingMode !== 'S' ? (
            <KText variant="body" color={colors.textMuted} numberOfLines={3}>
              {summaryOf(a)}
            </KText>
          ) : null}
          <View style={styles.footerRow}>
            <AiPill article={a} />
            <OpenSource article={a} />
          </View>
        </View>
      ))}
    </View>
  );
}

function Editorial({
  widget,
  editing,
  readingMode,
  onChange,
}: {
  widget: FeedWidget;
  editing: boolean;
  readingMode: string;
  onChange: (text: string) => void;
}) {
  return (
    <View style={{ gap: spacing.three }}>
      <View style={styles.hr} />
      {editing ? (
        <TextInput
          value={widget.editorialBody ?? ''}
          onChangeText={onChange}
          multiline
          placeholder="Write your editorial note…"
          placeholderTextColor={colors.textSoft}
          style={styles.editorial}
        />
      ) : (
        <KText variant="body" numberOfLines={readingMode === 'S' ? 3 : undefined}>
          {widget.editorialBody?.trim()
            ? widget.editorialBody
            : 'Add your editorial note to frame why this story matters, what readers should question, or how related stories connect.'}
        </KText>
      )}
      <View style={styles.editorialFooter}>
        <KText variant="caption" color={colors.textMuted}>
          Visible in shared newspapers
        </KText>
        <KText variant="caption" color={colors.ink} style={{ fontWeight: '700' }}>
          Author&apos;s note
        </KText>
      </View>
    </View>
  );
}

function AiPill({ article }: { article: Article }) {
  if (article.aiSummary) return <KAiStatusPill status={{ kind: 'live' }} />;
  return <KAiStatusPill status={{ kind: 'preview', label: 'AI preview' }} />;
}

function OpenSource({ article, prominent = false }: { article: Article; prominent?: boolean }) {
  return (
    <Pressable
      onPress={() => Linking.openURL(article.sourceUrl)}
      style={[
        styles.source,
        prominent
          ? { backgroundColor: colors.ink }
          : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.inkBorderStrong },
      ]}>
      <KText variant="caption" color={prominent ? colors.surface : colors.ink} style={{ fontWeight: '700' }}>
        {prominent ? 'Read original source' : 'Source'}
      </KText>
      <Ionicons name="open-outline" size={12} color={prominent ? colors.surface : colors.ink} />
    </Pressable>
  );
}

function Info({ text }: { text: string }) {
  return (
    <View style={styles.info}>
      <Ionicons name="information-circle-outline" size={20} color={colors.textSoft} />
      <KText variant="caption" color={colors.textMuted} style={{ flex: 1 }}>
        {text}
      </KText>
    </View>
  );
}

function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.accent} />
      <KText variant="caption" color={colors.textMuted}>
        Loading live articles…
      </KText>
    </View>
  );
}

function MoveBtn({ icon, onPress }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.moveBtn}>
      <Ionicons name={icon} size={14} color={colors.ink} />
    </Pressable>
  );
}

function Badge({
  icon,
  color,
  onPress,
  style,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  style: object;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.badge, { borderColor: color }, style]}>
      <Ionicons name={icon} size={13} color={color} />
    </Pressable>
  );
}

// ---- helpers -----------------------------------------------------------------

function summaryOf(a: Article): string {
  return a.aiSummary ?? a.summary;
}

function wrap(i: number, total: number): number {
  if (total <= 0) return 0;
  return ((i % total) + total) % total;
}

function paged(items: Article[], start: number, count: number): Article[] {
  if (!items.length) return [];
  const n = Math.min(count, items.length);
  const s = wrap(start, items.length);
  return Array.from({ length: n }, (_, k) => items[(s + k) % items.length]);
}

function countFor(widget: FeedWidget, mode: string): number {
  const discovery = widget.kind === 'popular' || widget.kind === 'random';
  if (widget.kind === 'news' && mode === 'F') return 1;
  if (discovery) {
    if (mode === 'F') return widget.size === 'compact' ? 1 : 2;
    return widget.size === 'compact' ? 1 : widget.size === 'regular' ? 2 : 3;
  }
  // news scan/skim
  if (mode === 'S') return widget.size === 'compact' ? 1 : widget.size === 'regular' ? 2 : 4;
  return widget.size === 'compact' ? 1 : widget.size === 'regular' ? 2 : 3;
}

function eyebrowText(widget: FeedWidget, sources: { id: string; category?: string }[]): string {
  switch (widget.kind) {
    case 'news':
      return sources.find((s) => s.id === widget.sourceId)?.category ?? 'Source feed';
    case 'editorial':
      return 'Curator note';
    case 'popular':
      return 'Beyond your feed';
    case 'random':
      return 'Designed serendipity';
  }
}

function eyebrowColor(widget: FeedWidget): string {
  if (widget.kind === 'popular') return colors.popular;
  if (widget.kind === 'random') return colors.random;
  return colors.accent;
}

function badgeLabel(widget: FeedWidget): string {
  switch (widget.kind) {
    case 'news':
      return 'LIVE';
    case 'editorial':
      return 'PUBLIC';
    case 'popular':
      return 'POPULAR';
    case 'random':
      return 'RANDOM';
  }
}

const styles = StyleSheet.create({
  inner: { padding: spacing.four, gap: spacing.three },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.three },
  kindBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.pill,
    borderWidth: 1.2,
    borderColor: colors.inkBorder,
  },
  hr: { height: 1, backgroundColor: 'rgba(23,23,23,0.15)' },
  editorial: {
    minHeight: 90,
    padding: spacing.two,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1.2,
    borderColor: 'rgba(23,23,23,0.3)',
    borderStyle: 'dashed',
    fontSize: 14,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  editorialFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.three,
    paddingVertical: spacing.two,
    paddingHorizontal: spacing.three,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inlineMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  skimCard: {
    gap: 6,
    padding: spacing.three,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skimHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.two },
  fullArticle: { gap: spacing.three },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  source: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  info: {
    flexDirection: 'row',
    gap: spacing.two,
    alignItems: 'center',
    padding: spacing.three,
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.md,
  },
  loading: { alignItems: 'center', gap: 6, paddingVertical: spacing.five },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.three, paddingTop: 2 },
  moveBtns: { flexDirection: 'row', gap: spacing.two },
  moveBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: colors.inkBorderStrong,
  },
  badge: {
    position: 'absolute',
    top: -10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  badgeLeft: { left: -6 },
  badgeRight: { right: -6 },
});
