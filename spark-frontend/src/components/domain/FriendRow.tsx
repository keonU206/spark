import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily } from '@/theme/tokens';
import type { FriendActivity } from '@/types/api';

/**
 * 친구 운동 현황 한 줄 — Figma `64:592`
 * 시안: 아바타 40×40(x=34) / 닉네임(x=81) / 상태 문구 / 재촉 버튼 72×32(x=285, radius 6).
 * 본인 행에는 닉네임 옆에 "나" 배지(⌀16)가 붙고 재촉 버튼이 없다.
 *
 * 버튼 라벨 주의 — 같은 기능이 시안 화면마다 "재촉하기 / 깨우기 / 잡도리"로 다르게 적혀 있다.
 * 홈(`64:592`) 기준인 "재촉하기"를 썼고, API는 `nudge`로 통일한다.
 */
export function FriendRow({ friend, onNudge }: { friend: FriendActivity; onNudge: () => void }) {
  return (
    <View style={styles.row}>
      {friend.avatarUrl ? (
        <Image source={{ uri: friend.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]} />
      )}

      <View style={styles.texts}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {friend.nickname}
          </Text>
          {friend.isMe ? (
            <View style={styles.meBadge}>
              <Text style={styles.meBadgeLabel}>나</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.status} numberOfLines={1}>
          {friend.statusLabel}
        </Text>
      </View>

      {friend.canNudge ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${friend.nickname} 재촉하기`}
          onPress={onNudge}
          style={({ pressed }) => [styles.nudge, pressed && styles.pressed]}
        >
          <Text style={styles.nudgeLabel}>재촉하기 🔥</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: colors.cardBorder,
  },
  texts: {
    flex: 1,
    marginLeft: 13,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 17,
    color: colors.textMain,
  },
  meBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  meBadgeLabel: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 9,
    lineHeight: 11,
    color: colors.white,
  },
  status: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textSub,
    marginTop: 3,
  },
  nudge: {
    width: 72,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  nudgeLabel: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 15,
    color: colors.white,
  },
});
