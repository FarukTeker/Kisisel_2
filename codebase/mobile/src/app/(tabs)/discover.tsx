import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KText } from '@/components/ui/KText';
import { useAppStore } from '@/features/store/appStore';
import { colors, radius, spacing } from '@/theme/tokens';
import type { DiscoverItem } from '@/lib/types';

const CARD_W = 282;
const COL_GAP = 26;
const ROW_GAP = 26;
const CARD_EST_H = 290;
const COLS = 2;
const ROTATIONS = [-0.8, 0.7, -0.5, 0.9, -0.4, 0.6];
const TAP_SLOP = 6;

/** A draggable scattered "front page" card on the canvas. */
function CanvasCard({
  item,
  origin,
  rotate,
  onOpen,
}: {
  item: DiscoverItem;
  origin: { x: number; y: number };
  rotate: number;
  onOpen: () => void;
}) {
  const isFollowing = useAppStore((s) => s.isFollowing(item.slug));
  const [pos] = useState(() => new Animated.ValueXY(origin));
  const [grabbed, setGrabbed] = useState(false);

  const [responder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2,
      onPanResponderGrant: () => {
        pos.extractOffset();
        setGrabbed(true);
      },
      onPanResponderMove: Animated.event([null, { dx: pos.x, dy: pos.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_e: GestureResponderEvent, g: PanResponderGestureState) => {
        pos.flattenOffset();
        setGrabbed(false);
        if (Math.abs(g.dx) < TAP_SLOP && Math.abs(g.dy) < TAP_SLOP) onOpen();
      },
      onPanResponderTerminate: () => {
        pos.flattenOffset();
        setGrabbed(false);
      },
    }),
  );

  const tags = tagsFor(item);

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[
        styles.card,
        {
          transform: [
            { translateX: pos.x },
            { translateY: pos.y },
            { rotate: grabbed ? '0deg' : `${rotate}deg` },
            { scale: grabbed ? 1.03 : 1 },
          ],
          shadowOpacity: grabbed ? 0.28 : 0.16,
          zIndex: grabbed ? 10 : 1,
        },
      ]}>
      {/* Masthead */}
      <View style={styles.masthead}>
        <KText variant="pill" color="rgba(255,255,255,0.7)" style={{ letterSpacing: 1.2 }}>
          KİŞİSEL
        </KText>
        <View style={styles.countPill}>
          <KText variant="pill" color="#fff">
            {item.widgetCount} WIDGETS
          </KText>
        </View>
      </View>

      <View style={styles.cardBody}>
        <KText variant="h2">{item.name}</KText>
        {item.curator ? (
          <View style={styles.curatorRow}>
            <View style={styles.avatar}>
              <KText variant="pill" color="#fff">
                {initials(item.curator)}
              </KText>
            </View>
            <KText variant="caption" color={colors.textMuted}>
              by {item.curator}
            </KText>
          </View>
        ) : null}

        {/* Layout preview */}
        <View style={styles.preview}>
          {PREVIEW_SLOTS.map((slot, idx) => (
            <View
              key={idx}
              style={[
                styles.slot,
                slot,
                { backgroundColor: slotColor(item.widgets[idx]?.kind ?? 'news') },
              ]}
            />
          ))}
        </View>

        <View style={styles.tagRow}>
          {tags.map((t) => (
            <View key={t} style={styles.tag}>
              <KText variant="pill" color={colors.textSoft}>
                {t.toUpperCase()}
              </KText>
            </View>
          ))}
          {isFollowing ? (
            <View style={[styles.tag, { backgroundColor: colors.accentSoft, borderColor: 'transparent' }]}>
              <KText variant="pill" color={colors.accent}>
                FOLLOWING
              </KText>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.openBar}>
        <KText variant="label" color={colors.ink}>
          Open
        </KText>
        <Ionicons name="arrow-forward" size={14} color={colors.ink} />
      </View>
    </Animated.View>
  );
}

export default function DiscoverScreen() {
  const router = useRouter();
  const discover = useAppStore((s) => s.discover);
  const followedSlugs = useAppStore((s) => s.followedSlugs);
  const [followingOnly, setFollowingOnly] = useState(false);

  const filtered = useMemo(
    () => discover.filter((n) => (followingOnly ? followedSlugs.includes(n.slug) : true)),
    [discover, followingOnly, followedSlugs],
  );

  // Pan the whole canvas by dragging the empty background.
  const [pan] = useState(() => new Animated.ValueXY({ x: 0, y: 0 }));
  const [panning, setPanning] = useState(false);
  const [bgResponder] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3,
      onPanResponderGrant: () => {
        pan.extractOffset();
        setPanning(true);
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        setPanning(false);
      },
      onPanResponderTerminate: () => {
        pan.flattenOffset();
        setPanning(false);
      },
    }),
  );

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      {/* Pannable canvas */}
      <View style={styles.canvasViewport} {...bgResponder.panHandlers}>
        <Animated.View
          style={[styles.canvas, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
          pointerEvents="box-none">
          {filtered.map((item, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const origin = {
              x: 14 + col * (CARD_W + COL_GAP) + (row % 2) * 22,
              y: 96 + row * (CARD_EST_H + ROW_GAP),
            };
            return (
              <CanvasCard
                key={item.slug}
                item={item}
                origin={origin}
                rotate={ROTATIONS[i % ROTATIONS.length]}
                onOpen={() =>
                  router.push({ pathname: '/newspaper/[slug]', params: { slug: item.slug } })
                }
              />
            );
          })}
        </Animated.View>

        {filtered.length === 0 ? (
          <View style={styles.empty} pointerEvents="none">
            <Ionicons name="newspaper-outline" size={30} color={colors.textSoft} />
            <KText variant="h3">{followingOnly ? "You're not following anyone yet" : 'No newspapers yet'}</KText>
            <KText variant="caption" color={colors.textMuted} style={{ textAlign: 'center' }}>
              {followingOnly
                ? 'Open a newspaper and tap Follow to add it here.'
                : 'Check back soon — curators are still composing.'}
            </KText>
          </View>
        ) : null}
      </View>

      {/* Floating chrome */}
      <View style={styles.topChrome} pointerEvents="box-none">
        <View style={styles.headerChip}>
          <KText variant="pill" color={colors.accent}>
            DISCOVER
          </KText>
          <View style={styles.dot} />
          <KText variant="caption" color={colors.textMuted}>
            {discover.length} newspapers
          </KText>
        </View>
        <View style={styles.filters}>
          <FilterPill label="All" active={!followingOnly} onPress={() => setFollowingOnly(false)} />
          <FilterPill
            label={`Following (${followedSlugs.length})`}
            active={followingOnly}
            onPress={() => setFollowingOnly(true)}
          />
        </View>
      </View>

      {!panning && filtered.length > 0 ? (
        <View style={styles.hint} pointerEvents="none">
          <Ionicons name="move-outline" size={13} color="#fff" />
          <KText variant="caption" color="#fff">
            Drag to explore · Grab a card to move it
          </KText>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterPill,
        {
          backgroundColor: active ? colors.ink : colors.surface,
          borderColor: active ? 'transparent' : colors.inkBorderStrong,
        },
      ]}>
      <KText variant="label" color={active ? colors.surface : colors.ink}>
        {label}
      </KText>
    </Pressable>
  );
}

const PREVIEW_SLOTS = [
  { left: '0%', top: '0%', width: '40%', height: '46%' },
  { left: '42%', top: '0%', width: '58%', height: '21%' },
  { left: '42%', top: '25%', width: '27%', height: '21%' },
  { left: '71%', top: '25%', width: '29%', height: '21%' },
  { left: '0%', top: '50%', width: '40%', height: '50%' },
  { left: '42%', top: '50%', width: '58%', height: '50%' },
] as const;

function slotColor(kind: string): string {
  if (kind === 'editorial') return '#dbeafe';
  if (kind === 'popular' || kind === 'random') return '#ede9fe';
  return '#dcfce7';
}

function tagsFor(item: DiscoverItem): string[] {
  const tags = new Set<string>();
  item.widgets.forEach((w) => {
    if (w.kind === 'editorial') tags.add('Editorial');
    else if (w.kind === 'popular') tags.add('Popular');
    else if (w.kind === 'random') tags.add('Serendipity');
    else tags.add('News');
  });
  return [...tags].slice(0, 3);
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  canvasViewport: { flex: 1, overflow: 'hidden' },
  canvas: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  card: {
    position: 'absolute',
    width: CARD_W,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.ink,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 4, height: 5 },
    shadowRadius: 0,
    elevation: 4,
  },
  masthead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#111827',
  },
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  cardBody: { padding: spacing.four, gap: spacing.two },
  curatorRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  avatar: {
    height: 22,
    width: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    height: 104,
    marginTop: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.paper,
    padding: 6,
    position: 'relative',
  },
  slot: { position: 'absolute', borderRadius: 4, borderWidth: 1, borderColor: colors.hairline },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  openBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderTopWidth: 1.5,
    borderTopColor: colors.ink,
  },
  empty: {
    position: 'absolute',
    top: '38%',
    left: spacing.six,
    right: spacing.six,
    alignItems: 'center',
    gap: spacing.two,
  },
  topChrome: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', gap: spacing.two, paddingTop: spacing.two },
  headerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.two,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.ink,
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 0,
    shadowOpacity: 1,
    elevation: 3,
  },
  dot: { height: 3, width: 3, borderRadius: 2, backgroundColor: colors.hairline },
  filters: { flexDirection: 'row', gap: spacing.two },
  filterPill: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1.2 },
  hint: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(17,24,39,0.82)',
  },
});
