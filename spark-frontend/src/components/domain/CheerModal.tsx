import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fontFamily } from '@/theme/tokens';

/** 시안(Frame 1000001151)의 프리셋 응원 문구 */
const PRESETS = [
  '😊 오늘도 힘내',
  '😌 괜찮아…',
  '👏 칭찬해요!',
  '🧡 응원해요',
  '😊 고생했어',
  '💪 잘 할 수 있다!',
  '🏃 다음에 같이 운동하자',
  '👍 대단해!',
  '🔥',
  '💯 100점 드립니다',
  '❤️',
  '😎 진정한 운동인',
] as const;

/**
 * 응원 보내기 모달 — Figma `Frame 1000001151/1152`
 * 프리셋 문구 중 하나를 고르거나 직접 입력해서 피드 글에 응원(댓글)을 단다.
 */
export function CheerModal({
  visible,
  authorNickname,
  initialMessage,
  sending,
  onSend,
  onClose,
}: {
  visible: boolean;
  authorNickname: string;
  /** 이미 남긴 응원이 있으면 그 내용 — 수정 모드로 열린다 */
  initialMessage?: string;
  sending: boolean;
  onSend: (message: string) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [custom, setCustom] = useState(initialMessage ?? '');

  const message = custom.trim() || picked;

  const close = () => {
    setPicked(null);
    setCustom('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable style={styles.card} onPress={() => undefined}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>응원 보내기</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={close} hitSlop={10}>
              <Text style={styles.closeGlyph}>✕</Text>
            </Pressable>
          </View>
          <Text style={styles.subtitle}>
            {initialMessage
              ? '다시 보내면 이전 응원이 새 내용으로 바뀌어요'
              : `${authorNickname}님에게 마음을 전해보세요`}
          </Text>

          <View style={styles.chips}>
            {PRESETS.map((preset) => {
              const selected = picked === preset && !custom.trim();
              return (
                <Pressable
                  key={preset}
                  accessibilityRole="button"
                  onPress={() => {
                    setPicked(preset);
                    setCustom('');
                  }}
                  style={({ pressed }) => [
                    styles.chip,
                    selected && styles.chipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                    {preset}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.customRow}>
            <Text style={styles.customLabel}>직접 입력</Text>
            <TextInput
              value={custom}
              onChangeText={setCustom}
              placeholder="내용을 입력해주세요"
              placeholderTextColor={colors.textSub}
              maxLength={100}
              style={styles.customInput}
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={close}
              style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
            >
              <Text style={styles.cancelLabel}>닫기</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={!message || sending}
              onPress={() => {
                if (!message) return;
                onSend(message);
                setPicked(null);
                setCustom('');
              }}
              style={({ pressed }) => [
                styles.send,
                (!message || sending) && styles.sendDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.sendLabel}>응원보내기</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 17,
    lineHeight: 22,
    color: colors.textMain,
  },
  closeGlyph: {
    fontSize: 16,
    color: colors.textSub,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSub,
    marginTop: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.main,
    borderColor: colors.main,
  },
  chipLabel: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 17,
    color: colors.textMain,
  },
  chipLabelSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },
  customLabel: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 13,
    color: colors.textMain,
  },
  customInput: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.bg,
    paddingHorizontal: 12,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textMain,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  cancel: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelLabel: {
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    fontSize: 14,
    color: colors.textSub,
  },
  send: {
    flex: 1,
    marginLeft: 12,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sendLabel: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 15,
    color: colors.white,
  },
  pressed: {
    opacity: 0.75,
  },
});
