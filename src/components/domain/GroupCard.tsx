import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily } from '@/theme/tokens';
import type { GroupSummary } from '@/types/api';

/**
 * 내 모임 카드 — Figma `77:1506`
 * 시안: 커버 66×66 / 제목(멤버 이름 나열) / 소개문 / "멤버 N명" + 최근 활동 배지.
 */
export function GroupCard({ group, onPress }: { group: GroupSummary; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${group.title} 모임`}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, pressed && onPress ? styles.pressed : null]}
    >
      {group.coverUrl ? (
        <Image source={{ uri: group.coverUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]} />
      )}

      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={1}>
          {group.title}
        </Text>
        <Text style={styles.description} numberOfLines={1}>
          {group.description}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>{`멤버 ${group.memberCount}명`}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>{group.lastActivityLabel}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
  },
  pressed: {
    opacity: 0.8,
  },
  cover: {
    width: 66,
    height: 66,
    borderRadius: 8,
  },
  coverPlaceholder: {
    backgroundColor: colors.cardBorder,
  },
  texts: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
    color: colors.textMain,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSub,
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  meta: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textSub,
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 14,
    color: colors.white,
  },
});
