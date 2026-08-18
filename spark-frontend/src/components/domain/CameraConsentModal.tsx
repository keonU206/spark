import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily } from '@/theme/tokens';

/**
 * 카메라 접근 권한 안내 — Figma `81:1725`
 * 운동 진행 화면 위에 덮이며, 동의해야 세션이 시작된다.
 * 문구는 시안에 적힌 그대로다 (개인정보 고지 성격이라 임의로 바꾸지 않았다).
 */
const SECTIONS = [
  {
    title: '카메라 사용 목적',
    body: '실시간으로 운동 자세 인식 후 정확한 동작 가이드와\n음성 교정 안내 서비스를 제공합니다.',
  },
  {
    title: '영상 데이터 처리',
    body: '카메라 영상은 자세 인식 후 즉시 삭제되며\n저장되지 않습니다.',
  },
  {
    title: '영상 데이터 처리',
    body: '수집된 자세 정보는 개인 운동 기록에만 활용되며\n친구나 모임에 공유되지 않습니다.',
  },
] as const;

export function CameraConsentModal({
  visible,
  onAgree,
  onDecline,
}: {
  visible: boolean;
  onAgree: () => void;
  onDecline: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDecline}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>카메라 접근 권한</Text>
          <Text style={styles.subtitle}>AI PT 자세 교정을 위해 카메라가 필요해요.</Text>

          {SECTIONS.map((section, i) => (
            <View key={i} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionBox}>
                <Text style={styles.sectionBody}>{section.body}</Text>
              </View>
            </View>
          ))}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onDecline}
              style={({ pressed }) => [styles.button, styles.decline, pressed && styles.pressed]}
            >
              <Text style={styles.declineLabel}>거부하고 나가기</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={onAgree}
              style={({ pressed }) => [styles.button, styles.agree, pressed && styles.pressed]}
            >
              <Text style={styles.agreeLabel}>동의하고 시작하기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 330,
    backgroundColor: colors.bg,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 22,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 19,
    lineHeight: 26,
    color: colors.textMain,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSub,
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 17,
    color: colors.textMain,
    marginBottom: 8,
  },
  sectionBox: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionBody: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSub,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 26,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  decline: {
    backgroundColor: '#D9D9D9',
  },
  declineLabel: {
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 18,
    color: colors.white,
  },
  agree: {
    backgroundColor: colors.main,
  },
  agreeLabel: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 18,
    color: colors.white,
  },
});
