import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { goBack } from '@/lib/navigation';
import { HighlightText } from '@/components/ui/HighlightText';
import { FormField } from '@/components/ui/FormField';
import { PillButton } from '@/components/ui/PillButton';
import { strings } from '@/constants/strings';
import { signupNameSchema, type SignupNameForm } from '@/lib/validation';
import { useAuth } from '@/stores/auth';
import { useSignupDraft } from '@/stores/signupDraft';
import { colors, fontFamily } from '@/theme/tokens';

const copy = strings.signup.name;

/**
 * 회원가입 2단계 (이름) — Figma `75:2774`
 * 시안: 타이틀 y=169 / 서브 y=257 / 입력 y=338 / CTA y=736
 */
export default function SignupNameScreen() {
  const insets = useSafeAreaInsets();
  const { draft, clear } = useSignupDraft();
  const { signUp } = useAuth();

  const { control, handleSubmit, setError, formState } = useForm<SignupNameForm>({
    resolver: zodResolver(signupNameSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!draft) {
      // 1단계를 건너뛰고 들어온 경우
      router.replace('/signup');
      return;
    }

    try {
      await signUp({ email: draft.email, password: draft.password, name: values.name });
      clear();
      // 계정 생성 직후이므로 서버가 `surveyCompleted: false`를 준다.
      // 라우트 가드가 설문으로 보낸다.
    } catch (e: unknown) {
      setError('name', { message: e instanceof Error ? e.message : String(e) });
    }
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top + 37 }}>
        <BackButton onPress={() => goBack('/signup')} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <HighlightText segments={copy.title} style={styles.title} />
        <Text style={styles.subtitle}>{copy.subtitle}</Text>

        <FormField
          control={control}
          name="name"
          containerStyle={styles.field}
          label={copy.name}
          autoCapitalize="none"
          textContentType="nickname"
          returnKeyType="done"
          onSubmitEditing={() => void onSubmit()}
        />
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 37 }]}>
        <PillButton
          label={copy.cta}
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    // 뒤로가기 행이 37(y) + 24(높이) = 61에서 끝나고, 시안 타이틀은 y=109(169 - 상태바 60)
    marginTop: 48,
    marginLeft: 5,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSub,
    marginTop: 12,
    marginLeft: 5,
  },
  field: {
    marginTop: 43,
  },
  bottom: {
    alignItems: 'center',
  },
});
