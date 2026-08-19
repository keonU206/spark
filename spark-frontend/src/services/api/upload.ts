import { http } from '@/services/http';

/**
 * 이미지 업로드 — 프로필 사진·피드 사진 공용.
 * 기기 로컬 경로(file://)를 서버가 이해하지 못하므로, 먼저 올려서 공개 URL을 받는다.
 */
export async function uploadImage(localUri: string): Promise<string> {
  const formData = new FormData();
  const filename = localUri.split('/').pop() ?? 'photo.jpg';
  const ext = filename.includes('.') ? filename.split('.').pop() : 'jpg';
  // React Native의 FormData는 { uri, name, type } 객체를 파일로 처리한다
  formData.append('file', {
    uri: localUri,
    name: filename,
    type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
  } as unknown as Blob);

  const { data } = await http.post<{ url: string }>('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
}
