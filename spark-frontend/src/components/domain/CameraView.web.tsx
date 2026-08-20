import { createElement, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily } from '@/theme/tokens';

/**
 * 웹용 대체 프리뷰.
 *
 * vision-camera는 네이티브 모듈이라 웹 번들에 넣을 수 없다.
 * Metro가 플랫폼 확장자로 이 파일을 골라주므로, 웹에서는 vision-camera가 아예 로드되지 않는다.
 */
export function CameraView({
  isActive,
  onReady,
  onFrame,
}: {
  isActive: boolean;
  onReady?: (ready: boolean) => void;
  onFrame?: (base64: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('이 브라우저는 카메라를 지원하지 않아요. Chrome의 localhost로 접속해주세요.');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
            aspectRatio: { ideal: 4 / 3 },
          },
          audio: false,
        });
        if (disposed) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        onReady?.(true);
      } catch (reason) {
        const message =
          reason instanceof DOMException && reason.name === 'NotAllowedError'
            ? '주소창의 카메라 권한을 허용한 뒤 새로고침해주세요.'
            : reason instanceof Error
              ? reason.message
              : '카메라를 열 수 없어요.';
        setError(message);
        onReady?.(false);
      }
    }
    void start();
    return () => {
      disposed = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      onReady?.(false);
    };
    // 콜백 변경으로 카메라가 재시작되지 않도록 최초 한 번만 실행한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isActive || !onFrame) return;
    const timer = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !video.videoWidth) return;
      const canvas = canvasRef.current ?? document.createElement('canvas');
      canvasRef.current = canvas;
      const height = Math.round((video.videoHeight / video.videoWidth) * 512);
      if (canvas.width !== 512) canvas.width = 512;
      if (canvas.height !== height) canvas.height = height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      // 화면의 전면 카메라 미러링과 분석 이미지 좌표를 일치시킨다.
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.65).split(',')[1];
      if (base64) onFrame(base64);
    }, 350);
    return () => clearInterval(timer);
  }, [isActive, onFrame]);

  return (
    <View style={styles.container}>
      {createElement('video', {
        ref: videoRef,
        muted: true,
        playsInline: true,
        style: {
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: 'scaleX(-1)',
        },
      })}
      {error ? (
        <View style={styles.fallback}>
          <Text style={styles.label}>카메라 권한을 확인해주세요</Text>
          <Text style={styles.hint}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#B3B3B3',
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 22,
    color: colors.white,
  },
  hint: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.white,
    opacity: 0.85,
    marginTop: 4,
    textAlign: 'center',
  },
});
