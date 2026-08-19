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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
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
        setError(reason instanceof Error ? reason.message : '카메라를 열 수 없어요.');
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
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = Math.round((video.videoHeight / video.videoWidth) * 480);
      const context = canvas.getContext('2d');
      if (!context) return;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.45).split(',')[1];
      if (base64) onFrame(base64);
    }, 500);
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
          objectFit: 'cover',
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
