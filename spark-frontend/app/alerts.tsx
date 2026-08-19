import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingTabBar } from '@/components/domain/FloatingTabBar';
import { BackButton } from '@/components/ui/BackButton';
import { goBack } from '@/lib/navigation';
import { ScreenError, ScreenLoading } from '@/components/ui/ScreenState';
import { useAckNudges, useNudgeInbox } from '@/hooks/queries';
import { colors, fontFamily } from '@/theme/tokens';

/**
 * 알림함 — 받은 재촉 이력.
 * 화면을 열면 미확인 알림이 전부 확인 처리되어 종의 빨간 점이 꺼진다.
 */
export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { data, error, isPending, refetch } = useNudgeInbox();
  const ack = useAckNudges();

  // 목록을 받아온 뒤 확인 처리한다 — 이번 화면에서는 "새 알림" 강조가 보이고, 다음부터는 읽음
  useEffect(() => {
    if (data?.some((n) => !n.seen)) {
      ack.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (error) return <ScreenError error={error} onRetry={() => void refetch()} />;
  if (isPending || !data) return <ScreenLoading />;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerBack}>
          <BackButton onPress={() => goBack('/home')} />
        </View>
        <Text style={styles.headerTitle}>알림</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {data.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyText}>아직 받은 알림이 없어요.</Text>
            <Text style={styles.emptySub}>친구가 재촉하면 여기에 쌓여요!</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {data.map((item) => (
              <View key={item.id} style={[styles.item, !item.seen && styles.itemUnread]}>
                <Text style={styles.itemEmoji}>🔥</Text>
                <View style={styles.itemTexts}>
                  <Text style={styles.itemMessage}>{item.message}</Text>
                  <Text style={styles.itemWhen}>{item.whenLabel}</Text>
                </View>
                {!item.seen ? <View style={styles.unreadDot} /> : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <FloatingTabBar active="home" />
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
    zIndex: 1,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 19,
    color: colors.textMain,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 19,
    paddingTop: 16,
    gap: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  itemUnread: {
    borderColor: colors.main,
    backgroundColor: '#FFF4EE',
  },
  itemEmoji: {
    fontSize: 20,
    lineHeight: 26,
  },
  itemTexts: {
    flex: 1,
    marginLeft: 10,
  },
  itemMessage: {
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMain,
  },
  itemWhen: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textSub,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.main,
    marginLeft: 8,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 90,
  },
  emptyEmoji: {
    fontSize: 40,
    lineHeight: 48,
  },
  emptyText: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
    color: colors.textMain,
    marginTop: 12,
  },
  emptySub: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSub,
    marginTop: 4,
  },
});
