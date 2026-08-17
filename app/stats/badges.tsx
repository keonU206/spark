import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { ScreenError, ScreenLoading } from '@/components/ui/ScreenState';
import { useBadges } from '@/hooks/queries';
import { colors, fontFamily } from '@/theme/tokens';
import type { Badge } from '@/types/api';

/**
 * 배지 목록 — Figma `69:1533`
 * 시안: 획득한 배지 / 도전 중인 배지 / 잠긴 배지, 3열 그리드.
 */
export default function BadgesScreen() {
  const insets = useSafeAreaInsets();
  const { data, error, isPending, refetch } = useBadges();

  if (error) return <ScreenError error={error} onRetry={() => void refetch()} />;
  if (isPending || !data) return <ScreenLoading />;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerBack}>
          <BackButton onPress={() => router.back()} />
        </View>
        <Text style={styles.headerTitle}>배지 목록</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>내 배지</Text>

        <BadgeGroup title="획득한 배지" badges={data.earned} />
        <BadgeGroup title="도전 중인 배지" badges={data.inProgress} />
        <BadgeGroup title="잠긴 배지" badges={data.locked} />
      </ScrollView>
    </View>
  );
}

function BadgeGroup({ title, badges }: { title: string; badges: Badge[] }) {
  if (badges.length === 0) return null;

  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.grid}>
        {badges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </View>
    </View>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  const locked = badge.state === 'locked';

  return (
    <View style={[styles.card, locked && styles.cardLocked]}>
      <View
        style={[
          styles.icon,
          badge.state === 'earned' && styles.iconEarned,
          badge.state === 'inProgress' && styles.iconInProgress,
        ]}
      />
      <Text style={[styles.name, locked && styles.textMuted]} numberOfLines={1}>
        {badge.name}
      </Text>
      <Text
        style={[
          styles.status,
          badge.state === 'earned' && styles.statusEarned,
          locked && styles.textMuted,
        ]}
        numberOfLines={1}
      >
        {badge.statusLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.white,
    paddingBottom: 18,
    justifyContent: 'center',
  },
  headerBack: {
    position: 'absolute',
    left: 0,
    bottom: 14,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 19,
    color: colors.textMain,
    textAlign: 'center',
  },
  pageTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 20,
    lineHeight: 28,
    color: colors.textMain,
    paddingHorizontal: 20,
    marginTop: 24,
  },
  group: {
    paddingHorizontal: 20,
    marginTop: 22,
  },
  groupTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMain,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '31.5%',
    minWidth: 96,
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  cardLocked: {
    backgroundColor: colors.bg,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.cardBorder,
  },
  iconEarned: {
    backgroundColor: colors.main,
  },
  iconInProgress: {
    backgroundColor: colors.splashAccent,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMain,
    marginTop: 10,
  },
  status: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textSub,
    marginTop: 3,
  },
  statusEarned: {
    color: colors.main,
    fontWeight: '700',
  },
  textMuted: {
    color: colors.gray6,
  },
});
