import { z } from 'zod';

import { validation } from '@/constants/strings';

/**
 * 폼 스키마 모음.
 *
 * 화면마다 손으로 검사하던 규칙을 한곳으로 모았다.
 * 안내 문구는 `constants/strings.ts`의 `validation`을 그대로 쓴다.
 */

const MIN_PASSWORD_LENGTH = 8;
const INVITE_CODE_LENGTH = 8;
const GROUP_NAME_MAX_LENGTH = 20;

const email = z
  .string()
  .trim()
  .min(1, validation.emailRequired)
  .email(validation.emailInvalid);

export const loginSchema = z.object({
  email,
  password: z.string().min(1, validation.passwordRequired),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    email,
    password: z
      .string()
      .min(1, validation.passwordRequired)
      .min(MIN_PASSWORD_LENGTH, validation.passwordTooShort),
    passwordConfirm: z.string(),
  })
  // 확인란 불일치는 확인란에 표시한다
  .refine((values) => values.password === values.passwordConfirm, {
    message: validation.passwordMismatch,
    path: ['passwordConfirm'],
  });
export type SignupForm = z.infer<typeof signupSchema>;

export const signupNameSchema = z.object({
  name: z.string().trim().min(1, validation.nameRequired),
});
export type SignupNameForm = z.infer<typeof signupNameSchema>;

export const groupCreateSchema = z.object({
  name: z.string().trim().min(1, '모임 이름을 입력해주세요.').max(GROUP_NAME_MAX_LENGTH),
});
export type GroupCreateForm = z.infer<typeof groupCreateSchema>;

export const groupJoinSchema = z.object({
  inviteCode: z
    .string()
    .trim()
    .length(INVITE_CODE_LENGTH, `초대코드는 ${INVITE_CODE_LENGTH}자리예요.`),
});
export type GroupJoinForm = z.infer<typeof groupJoinSchema>;

/**
 * 초기 설문.
 * 드롭다운 4개는 필수, 통증 부위는 최소 1개(없으면 "통증 없음")를 골라야 한다.
 */
export const surveySchema = z.object({
  fitnessLevel: z.string().min(1, validation.surveyFieldRequired),
  activityLevel: z.string().min(1, validation.surveyFieldRequired),
  availableTime: z.string().min(1, validation.surveyFieldRequired),
  intensity: z.string().min(1, validation.surveyFieldRequired),
  painAreas: z.array(z.string()).min(1, validation.surveyPainRequired),
});
export type SurveyForm = z.infer<typeof surveySchema>;

export const limits = {
  MIN_PASSWORD_LENGTH,
  INVITE_CODE_LENGTH,
  GROUP_NAME_MAX_LENGTH,
} as const;
