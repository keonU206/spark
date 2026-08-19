import axios from 'axios';

import type { Pose } from '@/types/pose';

export type ExerciseType =
  | 'squat'
  | 'lunge'
  | 'chin_tuck'
  | 'shoulder_roll'
  | 'chest_opener'
  | 'side_bend';

export type AiLandmark = {
  index: number;
  x: number;
  y: number;
  visibility: number;
};

export type AiPoseResponse = {
  success: boolean;
  landmarks?: AiLandmark[] | null;
  angles?: number[] | null;
  message?: string | null;
};

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_AI_BASE_URL ?? 'http://localhost:8000/api/v1',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = process.env.EXPO_PUBLIC_AI_HTTP_TOKEN;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function detectPose(image: string, exerciseType: ExerciseType) {
  try {
    const response = await client.post<AiPoseResponse>('/pose', {
      image,
      exercise_type: exerciseType,
      timestamp_sec: Date.now() / 1000,
    });
    return response.data;
  } catch (reason) {
    if (axios.isAxiosError(reason)) {
      if (reason.response?.status === 401) {
        throw new Error('AI 분석 인증에 실패했어요. 시연용 토큰을 확인해주세요.');
      }
      if (reason.code === 'ECONNABORTED') {
        throw new Error('AI 분석 응답이 늦어요. 서버 상태를 확인해주세요.');
      }
      if (!reason.response) {
        throw new Error('AI 서버에 연결할 수 없어요. 서버 주소와 실행 상태를 확인해주세요.');
      }
      throw new Error(`AI 분석 요청에 실패했어요. (${reason.response.status})`);
    }
    throw reason;
  }
}

const MEDIAPIPE_TO_POSE = {
  0: 'nose',
  7: 'leftEar',
  8: 'rightEar',
  11: 'leftShoulder',
  12: 'rightShoulder',
  13: 'leftElbow',
  14: 'rightElbow',
  15: 'leftWrist',
  16: 'rightWrist',
  23: 'leftHip',
  24: 'rightHip',
  25: 'leftKnee',
  26: 'rightKnee',
  27: 'leftAnkle',
  28: 'rightAnkle',
} as const;

export function toPose(landmarks?: AiLandmark[] | null): Pose | null {
  if (!landmarks) return null;
  const keypoints = landmarks.flatMap((landmark) => {
    const name = MEDIAPIPE_TO_POSE[landmark.index as keyof typeof MEDIAPIPE_TO_POSE];
    return name
      ? [{ name, x: landmark.x, y: landmark.y, score: landmark.visibility }]
      : [];
  });
  return keypoints.length ? { keypoints, timestamp: Date.now() } : null;
}

export function exerciseTypeFor(id?: string, name?: string): ExerciseType {
  const value = `${id ?? ''} ${name ?? ''}`.toLowerCase();
  if (value.includes('e-13') || value.includes('턱 당기기') || value.includes('목 스트레칭')) return 'chin_tuck';
  if (value.includes('e-7') || value.includes('어깨')) return 'shoulder_roll';
  if (value.includes('e-14') || value.includes('가슴')) return 'chest_opener';
  if (value.includes('e-15') || value.includes('사이드 밴드')) return 'side_bend';
  if (value.includes('런지') || value.includes('lunge')) return 'lunge';
  return 'squat';
}
