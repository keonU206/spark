import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatCard, StatRow } from '@/components/domain/StatCard';
import { BackButton } from '@/components/ui/BackButton';
import { goBack } from '@/lib/navigation';
import { SettingGroup, SettingRow } from '@/components/ui/SettingRow';
import { ScreenError, ScreenLoading } from '@/components/ui/ScreenState';
import { useMyProfile } from '@/hooks/queries';
import { useAuth } from '@/stores/auth';
import { colors, fontFamily } from '@/theme/tokens';

/**
 * 마이페이지 — Figma `69:1383`
 * 시안: 프로필(닉네임 + 상태 문구) / 나의 운동 성과 / 설정
 */
export default function MyPageScreen() {
  const insets = useSafeAreaInsets();
  const { data: profile, error, isPending, refetch } = useMyProfile();
  const { signOut } = useAuth();

  if (error) return <ScreenError error={error} onRetry={() => void refetch()} />;
  if (isPending || !profile) return <ScreenLoading />;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerBack}>
          <BackButton onPress={() => goBack('/home')} />
        </View>
        <Text style={styles.headerTitle}>마이페이지</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profile}>
          <View style={styles.avatar} />
          <View style={styles.profileTexts}>
            <Text style={styles.nickname}>{profile.nickname}</Text>
            <Text style={styles.status}>{profile.statusMessage}</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>나의 운동 성과</Text>
          <StatRow>
            <StatCard label="연속 출석" value={`${profile.streakDays}일 🔥`} accent />
            <StatCard label="이번 달 완료" value={`${profile.monthCompletedCount}회`} />
            <StatCard label="획득 배지" value={`${profile.badgeCount}개 🏅`} />
          </StatRow>
        </View>

        <SettingGroup>
          <SettingRow
            title="운동 기록 / 통계"
            description="총 완료 루틴, 운동 시간 등 상세 기록 보기"
            onPress={() => router.push('/records')}
          />
          <SettingRow
            title="배지 목록"
            description="지금까지 획득한 성취 배지 모아보기"
            onPress={() => router.push('/stats/badges')}
          />
        </SettingGroup>

        <SettingGroup title="설정">
          <SettingRow title="프로필 편집" onPress={() => router.push('/my/profile')} />
          <SettingRow title="알림 설정" onPress={() => router.push('/my/notifications')} />
          <SettingRow
            title="AI PT 동의 관리"
            description="카메라 권한 및 자세 인식 동의 상태 확인"
            onPress={() => router.push('/my/ai-pt')}
          />
          {/* 로그아웃하면 라우트 가드가 스플래쉬로 되돌린다 */}
          <SettingRow title="로그아웃" onPress={() => void signOut()} />
        </SettingGroup>
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
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 19,
    color: colors.textMain,
    textAlign: 'center',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.cardBorder,
  },
  profileTexts: {
    flex: 1,
    marginLeft: 14,
  },
  nickname: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 20,
    lineHeight: 28,
    color: colors.textMain,
  },
  status: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSub,
    marginTop: 3,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 17,
    lineHeight: 24,
    color: colors.textMain,
    marginBottom: 12,
  },
});
