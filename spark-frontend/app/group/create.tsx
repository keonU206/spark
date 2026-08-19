import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { goBack } from '@/lib/navigation';
import { FormField } from '@/components/ui/FormField';
import { PillButton } from '@/components/ui/PillButton';
import { useCreateGroup } from '@/hooks/queries';
import { groupCreateSchema, limits, type GroupCreateForm } from '@/lib/validation';
import { colors, fontFamily } from '@/theme/tokens';

const MAX_LENGTH = limits.GROUP_NAME_MAX_LENGTH;

/**
 * 모임 만들기 — Figma `77:1982`
 * 시안: 헤더 / "모임 이름" / 입력(placeholder "모임 이름을 입력해주세요", 우측 0/20) / CTA `생성하기`
 */
export default function CreateGroupScreen() {
  const insets = useSafeAreaInsets();
  const { control, handleSubmit, setError, formState } = useForm<GroupCreateForm>({
    resolver: zodResolver(groupCreateSchema),
    defaultValues: { name: '' },
  });

  // 카운터에 쓸 현재 입력값
  const name = useWatch({ control, name: 'name' }) ?? '';

  const create = useCreateGroup();

  const onSubmit = handleSubmit(async (values) => {
    try {
      // mutation을 거쳐야 모임 목록·친구·홈 캐시가 무효화된다
      const group = await create.mutateAsync(values.name);
      router.replace(`/group/${group.id}`);
    } catch (e: unknown) {
      setError('name', { message: e instanceof Error ? e.message : String(e) });
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
        <Text style={styles.headerTitle}>모임 만들기</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>모임 이름</Text>

        <View>
          <FormField
            control={control}
            name="name"
            placeholder="모임 이름을 입력해주세요"
            maxLength={MAX_LENGTH}
            transform={(text) => text.slice(0, MAX_LENGTH)}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={() => void onSubmit()}
          />
          <Text style={styles.counter}>
            <Text style={styles.counterCurrent}>{name.length}</Text>
            {`/${MAX_LENGTH}`}
          </Text>
        </View>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 37 }]}>
        <PillButton
          label="생성하기"
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
  counter: {
    position: 'absolute',
    right: 14,
    top: 14,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSub,
  },
  counterCurrent: {
    color: colors.main,
    fontWeight: '700',
  },
  bottom: {
    alignItems: 'center',
  },
});
