import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { goBack } from '@/lib/navigation';
import { FormField } from '@/components/ui/FormField';
import { PillButton } from '@/components/ui/PillButton';
import { useJoinGroup } from '@/hooks/queries';
import { groupJoinSchema, limits, type GroupJoinForm } from '@/lib/validation';
import { colors, fontFamily } from '@/theme/tokens';

const CODE_LENGTH = limits.INVITE_CODE_LENGTH;

/**
 * 모임 참여하기 — Figma `77:2170`
 * 시안: 헤더 / "모임 초대코드" / 입력(placeholder "8자리 초대코드를 입력해주세요")
 *
 * CTA는 시안에 `생성하기`로 되어 있으나 모임 만들기 화면을 복사한 흔적으로 보여
 * `참여하기`로 바로잡았다. 초대코드를 넣는 화면에서 "생성"은 오해를 부른다.
 */
export default function JoinGroupScreen() {
  const insets = useSafeAreaInsets();
  const { control, handleSubmit, setError, formState } = useForm<GroupJoinForm>({
    resolver: zodResolver(groupJoinSchema),
    defaultValues: { inviteCode: '' },
  });

  const join = useJoinGroup();

  const onSubmit = handleSubmit(async (values) => {
    try {
      // mutation을 거쳐야 모임 목록·친구·홈 캐시가 무효화된다
      const group = await join.mutateAsync(values.inviteCode);
      router.replace(`/group/${group.id}`);
    } catch (e: unknown) {
      setError('inviteCode', { message: e instanceof Error ? e.message : String(e) });
    }
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerBack}>
          <BackButton onPress={() => goBack('/community')} />
        </View>
        <Text style={styles.headerTitle}>모임 참여하기</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>모임 초대코드</Text>

        <FormField
          control={control}
          name="inviteCode"
          placeholder={`${CODE_LENGTH}자리 초대코드를 입력해주세요`}
          maxLength={CODE_LENGTH}
          transform={(text) => text.replace(/\s/g, '').slice(0, CODE_LENGTH)}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => void onSubmit()}
        />
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 37 }]}>
        <PillButton
          label="참여하기"
          variant="primary"
          disabled={formState.isSubmitting}
          onPress={() => void onSubmit()}
        />
      </View>
    </KeyboardAvoidingView>
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
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 34,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 17,
    lineHeight: 24,
    color: colors.textMain,
    marginBottom: 14,
  },
  bottom: {
    alignItems: 'center',
  },
});
