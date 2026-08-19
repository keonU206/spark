import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily } from '@/theme/tokens';
import type { FeedPost } from '@/types/api';

/**
 * 모임 피드 게시물 — Figma `87:813`
 * 시안: 작성자 + 시각 + `응원보내기` / 사진 / 본문 / 반응 칩 / 댓글.
 */
export function FeedPostCard({
  post,
  onCheer,
  onDelete,
}: {
  post: FeedPost;
  onCheer: () => void;
  /** 내 글일 때만 쓰인다 (canCheer가 false = 내 글) */
  onDelete?: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        {post.author.avatarUrl ? (
          <Image source={{ uri: post.author.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]} />
        )}

        <View style={styles.headerTexts}>
          <Text style={styles.author}>{post.author.nickname}</Text>
          <Text style={styles.time}>{post.createdAtLabel}</Text>
        </View>

        {post.canCheer ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${post.author.nickname}에게 응원보내기`}
            onPress={onCheer}
            style={({ pressed }) => [styles.cheer, pressed && styles.pressed]}
          >
            {/* 이미 응원했으면 수정 모드 — 다시 보내면 내 응원이 바뀐다 */}
            <Text style={styles.cheerLabel}>
              {post.comments.some((c) => c.isMine) ? '응원 수정' : '응원보내기'}
            </Text>
          </Pressable>
        ) : onDelete ? (
          /* 내 글에는 응원 대신 삭제 버튼 */
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="내 글 삭제"
            onPress={onDelete}
            hitSlop={8}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
          >
            <Text style={styles.deleteLabel}>삭제</Text>
          </Pressable>
        ) : null}
      </View>

      {/* 사진이 없는 글은 사진 영역 자체를 그리지 않는다 (빈 회색 박스 방지) */}
      {post.imageUrl ? <Image source={{ uri: post.imageUrl }} style={styles.photo} /> : null}

      <Text style={styles.body}>{post.body}</Text>

      <View style={styles.reactionRow}>
        {post.reactions.map((reaction) => (
          <View key={reaction.emoji} style={styles.reaction}>
            <Text style={styles.reactionLabel}>{`${reaction.emoji} ${reaction.count}`}</Text>
          </View>
        ))}

        {post.comments.map((comment, index) => (
          <Text key={comment.id ?? `${comment.userId}-${index}`} style={styles.comment} numberOfLines={1}>
            <Text style={styles.commentAuthor}>{`${comment.nickname} `}</Text>
            {comment.body}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    backgroundColor: colors.cardBorder,
  },
  headerTexts: {
    flex: 1,
    marginLeft: 10,
  },
  author: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
    color: colors.textMain,
  },
  time: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textSub,
    marginTop: 2,
  },
  cheer: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  cheerLabel: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 15,
    color: colors.white,
  },
  deleteButton: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteLabel: {
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 15,
    color: colors.textSub,
  },
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 8,
    marginTop: 12,
  },
  body: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMain,
    marginTop: 12,
  },
  reactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  reaction: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMain,
  },
  comment: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSub,
    flexShrink: 1,
  },
  commentAuthor: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: colors.textMain,
  },
});
