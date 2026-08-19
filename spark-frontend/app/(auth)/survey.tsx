import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { goBack } from '@/lib/navigation';
import { Checkbox } from '@/components/ui/Checkbox';
import { HighlightText } from '@/components/ui/HighlightText';
import { PillButton } from '@/components/ui/PillButton';
import { SelectField } from '@/components/ui/SelectField';
import { strings } from '@/constants/strings';
import { surveySchema, type SurveyForm } from '@/lib/validation';
import { submitSurvey } from '@/services/api/auth';
import { useAuth } from '@/stores/auth';
import { colors, fontFamily } from '@/theme/tokens';

const copy = strings.survey;

type PainKey = (typeof copy.pain.options)[number]['key'];

const NO_PAIN: PainKey = 'none';

/**
 * 초기 설문 — Figma `72:2466`(빈 상태) / `75:3079`(선택된 상태)
 *
 * 계정 생성 직후 한 번만 거치는 화면이다. 회원가입 마지막 단계에서만 진입하고,
 * 로그인은 홈으로 바로 간다. 시안 높이가 1049라 스크롤된다.
 */
export default function SurveyScreen() {
  const insets = useSafeAreaInsets();

  const { markSurveyCompleted } = useAuth();

  const { control, handleSubmit, setError, formState } = useForm<SurveyForm>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      fitnessLevel: '',
      activityLevel: '',
      availableTime: '',
      intensity: '',
      painAreas: [],
    },
  });

  /** "통증 없음"과 나머지는 함께 선택될 수 없다 */
  function nextPain(current: string[], key: PainKey): string[] {
    if (key === NO_PAIN) return current.includes(NO_PAIN) ? [] : [NO_PAIN];
    const withoutNone = current.filter((k) => k !== NO_PAIN);
    return withoutNone.includes(key)
      ? withoutNone.filter((k) => k !== key)
      : [...withoutNone, key];
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await submitSurvey(values);
      markSurveyCompleted();
      router.replace('/ready');
    } catch (e: unknown) {
      setError('painAreas', { message: e instanceof Error ? e.message : String(e) });
    }
  });

  return (
    <View style={styles.container}>
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

        {copy.fields.map((field, i) => (
          <View key={field.key} style={i === 0 ? styles.firstField : styles.field}>
            <Controller
              control={control}
              name={field.key}
              render={({ field: formField, fieldState }) => (
                <SelectField
                  label={field.label}
                  placeholder={copy.placeholder}
                  options={field.options}
                  value={formField.value || undefined}
                  onChange={formField.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </View>
        ))}

        <View style={styles.painSection}>
          <HighlightText segments={copy.pain.title} style={styles.painTitle} />
          <Text style={styles.painSubtitle}>{copy.pain.subtitle}</Text>

          <Controller
            control={control}
            name="painAreas"
            render={({ field, fieldState }) => (
              <>
                <View style={styles.painList}>
                  {copy.pain.options.map((option) => (
                    <Checkbox
                      key={option.key}
                      label={option.label}
                      checked={field.value.includes(option.key)}
                      onToggle={() => field.onChange(nextPain(field.value, option.key))}
                    />
                  ))}
                </View>

                {fieldState.error ? (
                  <Text style={styles.error}>{fieldState.error.message}</Text>
                ) : null}
              </>
            )}
          />
        </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 37 }]}>
        <PillButton
          label={copy.cta}
          variant="primary"
          disabled={formState.isSubmitting}
          onPress={() => void onSubmit()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
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
    marginTop: 43,
  },
  field: {
    marginTop: 20,
  },
  painSection: {
    marginTop: 24,
  },
  painTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },
  painSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 17,
    color: colors.textSub,
    marginTop: 5,
  },
  painList: {
    marginTop: 14,
  },
  error: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 17,
    color: colors.main,
    marginTop: 8,
  },
  bottom: {
    alignItems: 'center',
  },
});
