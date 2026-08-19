import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { goBack } from '@/lib/navigation';
import { SettingGroup, SettingRow } from '@/components/ui/SettingRow';
import { ScreenError, ScreenLoading } from '@/components/ui/ScreenState';
import { useAiPtConsent, useUpdateAiPtConsent } from '@/hooks/queries';
import { colors, fontFamily } from '@/theme/tokens';
import type { AiPtConsent } from '@/types/api';

/** 시안 문구 그대로 — 개인정보 고지 성격이라 임의로 바꾸지 않았다 */
const NOTICES = [
  '• AI PT는 스쿼트, 런지, 턱 당기기, 어깨 돌리기, 가슴 열기, 사이드 밴드 운동에서만 지원됩니다.',
  '• AI PT 자세 인식은 의료 진단이 아니며, 통증이나 불편함이 발생하면 즉시 운동을 중단하고 전문가의 상담을 받으세요.',
  '• 영상과 자세 데이터는 친구나 모임에 공개되지 않습니다.',
] as const;

/**
 * AI PT 동의 관리 — Figma `69:1695`
 * 시안: 카메라 권한 상태 / 개인정보 동의 / 안내 및 주의사항
 */
export default function AiPtConsentScreen() {
  const insets = useSafeAreaInsets();
  const { data: consent, error, isPending, refetch } = useAiPtConsent();
  const update = useUpdateAiPtConsent();
  const patch = (next: Partial<AiPtConsent>) => update.mutate(next);

  if (error) return <ScreenError error={error} onRetry={() => void refetch()} />;
  if (isPending || !consent) return <ScreenLoading />;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerBack}>
          <BackButton onPress={() => goBack('/my')} />
        </View>
        <Text style={styles.headerTitle}>AI PT 동의 관리</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>AI PT 카메라 설정</Text>

        <SettingGroup title="카메라 권한 상태">
          <SettingRow
            title="카메라 접근"
            trailingText={consent.cameraPermissionGranted ? '활성화' : '미활성화'}
            trailingAccent={consent.cameraPermissionGranted}
          />
        </SettingGroup>

        {!consent.cameraPermissionGranted ? (
          <Text style={styles.footnote}>
            현재 카메라 권한이 없습니다. 기기 설정에서 &apos;스파크&apos;에 카메라 접근을 허용하면
            AI PT를 이용할 수 있습니다.
          </Text>
        ) : null}

        <SettingGroup title="개인정보 동의">
          <SettingRow
            title="AI PT 자세 분석"
            description="카메라로 촬영한 영상을 실시간 자세 인식에만 사용하며, 저장하거나 공유하지 않습니다."
            value={consent.poseAnalysisAgreed}
            onValueChange={(poseAnalysisAgreed) => patch({ poseAnalysisAgreed })}
          />
        </SettingGroup>

        <Text style={styles.footnote}>
          동의를 거부해도 일반 운동 루틴은 모두 이용할 수 있습니다.
        </Text>

        <View style={styles.noticeSection}>
          <Text style={styles.noticeTitle}>안내 및 주의사항</Text>
          {NOTICES.map((notice) => (
            <Text key={notice} style={styles.notice}>
              {notice}
            </Text>
          ))}
          <Text style={styles.warning}>
            동의를 철회하면 저장된 자세 데이터가 영구 삭제되며 복구할 수 없습니다.
          </Text>
        </View>
      </ScrollView>
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
  pageTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 20,
    lineHeight: 28,
    color: colors.textMain,
    paddingHorizontal: 20,
    marginTop: 24,
  },
  footnote: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSub,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  noticeSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  noticeTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 17,
    lineHeight: 24,
    color: colors.textMain,
    marginBottom: 10,
  },
  notice: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 19,
    color: colors.textSub,
    marginBottom: 6,
  },
  warning: {
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 19,
    color: colors.main,
    marginTop: 8,
  },
});
