import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { goBack } from '@/lib/navigation';
import { SettingGroup, SettingRow } from '@/components/ui/SettingRow';
import { ScreenError, ScreenLoading } from '@/components/ui/ScreenState';
import { useNotificationSettings, useUpdateNotificationSettings } from '@/hooks/queries';
import { colors, fontFamily } from '@/theme/tokens';
import type { NotificationSettings } from '@/types/api';

/** 30분 간격 프리셋. 시안에 시간 선택 화면이 없어 흔한 운동 시간대로 채웠다 */
const REMINDER_TIMES = [
  '오전 6:00',
  '오전 7:00',
  '오전 8:00',
  '오전 9:00',
  '오후 12:00',
  '오후 6:00',
  '오후 7:00',
  '오후 8:00',
  '오후 9:00',
  '오후 10:00',
] as const;

/**
 * 알림 설정 — Figma `69:1650`
 * 시안: 운동 리마인더 / 소셜 알림 / 알림 권한 상태
 */
export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { data: settings, error, isPending, refetch } = useNotificationSettings();
  // 낙관적 업데이트는 훅 안에서 처리한다
  const update = useUpdateNotificationSettings();
  const patch = (next: Partial<NotificationSettings>) => update.mutate(next);
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  if (error) return <ScreenError error={error} onRetry={() => void refetch()} />;
  if (isPending || !settings) return <ScreenLoading />;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerBack}>
          <BackButton onPress={() => goBack('/my')} />
        </View>
        <Text style={styles.headerTitle}>알림 설정</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <SettingGroup title="운동 리마인더">
          <SettingRow
            title="리마인더 활성화"
            description="운동 시작 시간에 알림을 받습니다"
            value={settings.reminderEnabled}
            onValueChange={(reminderEnabled) => patch({ reminderEnabled })}
          />
          <SettingRow
            title="알림 시간대"
            trailingText={settings.reminderTime}
            onPress={() => setTimePickerOpen(true)}
          />
        </SettingGroup>

        <SettingGroup title="소셜 알림">
          <SettingRow
            title="친구 독려 알림"
            description="친구가 보낸 재촉을 받습니다"
            value={settings.friendNudgeEnabled}
            onValueChange={(friendNudgeEnabled) => patch({ friendNudgeEnabled })}
          />
          <SettingRow
            title="모임 활동 알림"
            description="모임 친구의 운동 완료와 피드 댓글을 받습니다"
            value={settings.groupActivityEnabled}
            onValueChange={(groupActivityEnabled) => patch({ groupActivityEnabled })}
          />
        </SettingGroup>

        <SettingGroup title="알림 권한 상태">
          <SettingRow
            title="기기 알림 권한"
            trailingText={settings.devicePermissionGranted ? '허용됨' : '거부됨'}
            trailingAccent={settings.devicePermissionGranted}
          />
        </SettingGroup>

        <Text style={styles.footnote}>
          알림을 받으려면 기기 설정에서 앱 알림 권한을 활성화하세요
        </Text>
      </ScrollView>

      {/* 시간 선택 화면은 시안에 없어 하단 시트로 만들었다 */}
      <Modal
        visible={timePickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setTimePickerOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setTimePickerOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.grabber} />
          <Text style={styles.sheetTitle}>알림 시간대</Text>

          <ScrollView bounces={false}>
            {REMINDER_TIMES.map((time) => {
              const selected = time === settings.reminderTime;
              return (
                <Pressable
                  key={time}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    patch({ reminderTime: time });
                    setTimePickerOpen(false);
                  }}
                  style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                >
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                    {time}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '60%',
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray6,
    marginBottom: 16,
  },
  sheetTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 17,
    lineHeight: 22,
    color: colors.textMain,
    marginBottom: 8,
  },
  option: {
    height: 52,
    justifyContent: 'center',
  },
  optionLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textMain,
  },
  optionLabelSelected: {
    color: colors.main,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
  footnote: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSub,
    paddingHorizontal: 20,
    marginTop: 12,
  },
});
