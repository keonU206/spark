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
import { signupSchema, type SignupForm } from '@/lib/validation';
import { useSignupDraft } from '@/stores/signupDraft';
import { colors, fontFamily } from '@/theme/tokens';

const copy = strings.signup.account;

/**
 * 회원가입 1단계 (계정) — Figma `72:2375`
 * 시안: 타이틀 y=169 / 서브 y=257 / 입력 3개 y=339·431·523 / CTA y=736
 */
export default function SignupScreen() {
  const insets = useSafeAreaInsets();

  const { setAccount } = useSignupDraft();

  const { control, handleSubmit } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', passwordConfirm: '' },
  });

  // 계정 정보는 2단계(이름)까지 받은 뒤 한 번에 생성한다.
  // 비밀번호는 URL에 남지 않도록 라우터 파라미터가 아니라 draft에 담는다.
  const onSubmit = handleSubmit((values) => {
    setAccount({ email: values.email, password: values.password });
    router.push('/signup-name');
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top + 37 }}>
        <BackButton onPress={() => goBack('/login')} />
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
          name="email"
          containerStyle={styles.firstField}
          label={copy.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />

        <FormField
          control={control}
          name="password"
          containerStyle={styles.field}
          label={copy.password}
          secureTextEntry
          autoCapitalize="none"
          textContentType="newPassword"
        />

        <FormField
          control={control}
          name="passwordConfirm"
          containerStyle={styles.field}
          label={copy.passwordConfirm}
          secureTextEntry
          autoCapitalize="none"
          textContentType="newPassword"
        />
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 37 }]}>
        <PillButton label={copy.cta} variant="primary" onPress={() => void onSubmit()} />
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
  firstField: {
    marginTop: 44,
  },
  field: {
    marginTop: 20,
  },
  bottom: {
    alignItems: 'center',
  },
});
