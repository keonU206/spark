import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoMark } from '@/components/illustrations/LogoMark';
import { GoogleIcon, KeyIcon, MailIcon } from '@/components/illustrations/icons';
import { FormField } from '@/components/ui/FormField';
import { PillButton } from '@/components/ui/PillButton';
import { strings } from '@/constants/strings';
import { loginSchema, type LoginForm } from '@/lib/validation';
import { useAuth } from '@/stores/auth';
import { colors, fontFamily } from '@/theme/tokens';

/** 시안의 입력·버튼 폭 (`72:2327` 기준 298.63) */
const FIELD_WIDTH = 298.63;
const FIELD_HEIGHT = 45.04;

/** 로그인 — Figma `72:2327` */
export default function LoginScreen() {
  const insets = useSafeAreaInsets();

  const { signInWithEmail, signInWithGoogle } = useAuth();

  const { control, handleSubmit, setError, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // 로그인에 성공하면 라우트 가드가 홈으로 보낸다
  const onSubmit = handleSubmit(async (values) => {
    try {
      await signInWithEmail(values.email, values.password);
    } catch (e: unknown) {
      setError('password', { message: e instanceof Error ? e.message : String(e) });
    }
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 124, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <LogoMark width={128.27} />

        <FormField
          control={control}
          name="email"
          containerStyle={styles.emailField}
          height={FIELD_HEIGHT}
          icon={<MailIcon />}
          placeholder={strings.login.emailPlaceholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />

        <FormField
          control={control}
          name="password"
          containerStyle={styles.passwordField}
          height={FIELD_HEIGHT}
          icon={<KeyIcon />}
          placeholder={strings.login.passwordPlaceholder}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
        />

        <PillButton
          label={strings.login.submit}
          variant="primary"
          height={FIELD_HEIGHT}
          disabled={formState.isSubmitting}
          onPress={() => void onSubmit()}
          style={styles.submit}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>{strings.login.divider}</Text>
          <View style={styles.dividerLine} />
        </View>

        <PillButton
          label={strings.login.google}
          variant="outline"
          height={FIELD_HEIGHT}
          leading={<GoogleIcon />}
          disabled={formState.isSubmitting}
          onPress={() => void signInWithGoogle()}
          style={styles.google}
        />

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/signup')}
          hitSlop={8}
          style={styles.signupLink}
        >
          <Text style={styles.signupLinkLabel}>{strings.login.toSignup}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emailField: {
    width: FIELD_WIDTH,
    maxWidth: '100%',
    marginTop: 57,
  },
  passwordField: {
    width: FIELD_WIDTH,
    maxWidth: '100%',
    marginTop: 10,
  },
  submit: {
    width: FIELD_WIDTH,
    marginTop: 10,
  },
  divider: {
    width: FIELD_WIDTH,
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.inputBorder,
  },
  dividerLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 16,
    color: colors.textSub,
    marginHorizontal: 14,
  },
  google: {
    width: FIELD_WIDTH,
    marginTop: 20,
  },
  signupLink: {
    marginTop: 8,
    paddingVertical: 8,
  },
  signupLinkLabel: {
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 16,
    color: colors.textMain,
    textAlign: 'center',
  },
});
