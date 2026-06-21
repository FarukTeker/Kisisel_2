import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KButton } from '@/components/ui/KButton';
import { KText } from '@/components/ui/KText';
import { useAppStore } from '@/features/store/appStore';
import { colors, radius, spacing } from '@/theme/tokens';

function shareUrl(slug: string): string {
  return `https://kisisel.app/newspaper/${slug}`;
}

export default function ShareModal() {
  const router = useRouter();
  const publish = useAppStore((s) => s.publish);
  const existing = useAppStore((s) => s.publishedSlug);

  const [slug, setSlug] = useState<string | null>(existing);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setBusy(true);
    setError(null);
    try {
      setSlug(await publish());
    } catch {
      setError('Could not publish. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!slug) return;
    await Clipboard.setStringAsync(shareUrl(slug));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <KText variant="button" color={colors.textMuted}>
            Close
          </KText>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.hero}>
          <Ionicons name="globe-outline" size={34} color={colors.accent} />
          <KText variant="h1" style={{ textAlign: 'center' }}>
            Publish your newspaper
          </KText>
          <KText variant="body" color={colors.textMuted} style={{ textAlign: 'center' }}>
            Generate a public link so guests can read your layout, follow you, or fork it as their
            own starting point.
          </KText>
        </View>

        {slug ? (
          <View style={{ gap: spacing.three }}>
            <View style={styles.urlBox}>
              <KText variant="label">{shareUrl(slug)}</KText>
            </View>
            <View style={styles.actions}>
              <View style={{ flex: 1 }}>
                <KButton
                  title={copied ? 'Copied!' : 'Copy link'}
                  icon={copied ? 'checkmark' : 'copy-outline'}
                  kind="secondary"
                  onPress={copy}
                />
              </View>
              <View style={{ flex: 1 }}>
                <KButton title="Share" icon="share-outline" onPress={() => void Share.share({ message: shareUrl(slug) })} />
              </View>
            </View>
          </View>
        ) : (
          <KButton title="Generate public link" icon="link-outline" onPress={generate} loading={busy} />
        )}

        {error ? (
          <KText variant="label" color={colors.danger}>
            {error}
          </KText>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  bar: { paddingHorizontal: spacing.four, paddingVertical: spacing.three },
  content: { padding: spacing.four, gap: spacing.five },
  hero: { alignItems: 'center', gap: spacing.two },
  urlBox: {
    padding: spacing.three,
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  actions: { flexDirection: 'row', gap: spacing.three },
});
