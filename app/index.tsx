import { Redirect } from 'expo-router';

/** 진입점 — 인증 플로우의 첫 화면인 스플래쉬로 보낸다. */
export default function Index() {
  return <Redirect href="/splash" />;
}
