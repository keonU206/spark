import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { goBack } from '@/lib/navigation';
import { PillButton } from '@/components/ui/PillButton';
import { ScreenError, ScreenLoading } from '@/components/ui/ScreenState';
import { SettingGroup, SettingRow } from '@/components/ui/SettingRow';
import { TextField } from '@/components/ui/TextField';
import { useDeleteAccount, useMyProfile, useUpdateMyProfile } from '@/hooks/queries';
import { useAuth } from '@/stores/auth';
import { colors, fontFamily } from '@/theme/tokens';

/**
 * 프로필 편집 — Figma `69:1603`
 * 시안: 프로필 사진 / 표시 이름 / 가입한 모임 / 계정 설정(계정 삭제)
 */
export default function ProfileEditScreen() {
  const insets = useSafeAreaInsets();
  const { data: profile, error, isPending, refetch } = useMyProfile();
  const update = useUpdateMyProfile();
  const remove = useDeleteAccount();
  const { signOut } = useAuth();

  const [editedNickname, setEditedNickname] = useState<string>();
  const [pickedAvatar, setPickedAvatar] = useState<string>();

  async function pickImage() {
    // 사진첩 접근 권한을 먼저 묻는다
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('사진 접근 권한', '기기 설정에서 사진 접근을 허용해주세요.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    const asset = result.assets?.[0];
    if (!result.canceled && asset) setPickedAvatar(asset.uri);
  }

  function confirmDelete() {
    Alert.alert('계정 삭제', '스파크 계정과 모든 운동 기록을 삭제합니다. 되돌릴 수 없어요.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          // 삭제에 성공해야만 로그아웃까지 이어간다
          remove.mutate(undefined, {
            onSuccess: () => void signOut(),
            onError: (e: unknown) =>
              Alert.alert('삭제하지 못했어요', e instanceof Error ? e.message : String(e)),
          });
        },
      },
    ]);
  }

  if (error) return <ScreenError error={error} onRetry={() => void refetch()} />;
  if (isPending || !profile) return <ScreenLoading />;

  // 아직 안 고쳤으면 서버 값을 그대로 보여준다
  const nickname = editedNickname ?? profile.nickname;
  const avatarUri = pickedAvatar ?? profile.avatarUrl;
  const isDirty = nickname !== profile.nickname || !!pickedAvatar;

  function save() {
    update.mutate(
      { nickname, ...(pickedAvatar ? { avatarUri: pickedAvatar } : {}) },
      {
        onSuccess: () => {
          setEditedNickname(undefined);
          setPickedAvatar(undefined);
          goBack('/my');
        },
        onError: (e: unknown) =>
          Alert.alert('저장하지 못했어요', e instanceof Error ? e.message : String(e)),
      },
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerBack}>
          <BackButton onPress={() => goBack('/my')} />
        </View>
        <Text style={styles.headerTitle}>프로필 편집</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>프로필 사진</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="프로필 사진 변경"
            onPress={() => void pickImage()}
            style={({ pressed }) => [styles.avatarWrap, pressed && styles.pressed]}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar} />
            )}
            <Text style={styles.avatarHint}>사진 변경</Text>
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={styles.sectionTitle}>표시 이름</Text>
          <TextField
            value={nickname}
            onChangeText={setEditedNickname}
            placeholder="표시할 이름을 입력해주세요"
            autoCapitalize="none"
          />
        </View>

        <SettingGroup title="가입한 모임">
          <SettingRow
            title={`참여 중인 모임 ${profile.joinedGroupCount}개`}
            onPress={() => router.push('/community')}
          />
        </SettingGroup>

        <SettingGroup title="계정 설정">
          <SettingRow
            title="계정 삭제"
            description="스파크 계정과 모든 운동 기록을 삭제합니다"
            danger
            onPress={confirmDelete}
          />
        </SettingGroup>
      </ScrollView>

      {/* 바꾼 게 있을 때만 저장 버튼을 띄운다 */}
      {isDirty ? (
        <View style={[styles.bottom, { paddingBottom: insets.bottom + 20 }]}>
          <PillButton
            label={update.isPending ? '저장 중…' : '저장하기'}
            variant="primary"
            height={52}
            disabled={update.isPending}
            onPress={save}
          />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.white,
    paddingBottom: 18,
    justifyContent: 'center',
  },
  headerBack: {
    position: 'absolute',
    left: 0,
    bottom: 14,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 19,
    color: colors.textMain,
    textAlign: 'center',
  },
  content: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 17,
    lineHeight: 24,
    color: colors.textMain,
    marginBottom: 12,
  },
  photoSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  avatarWrap: {
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.6,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.cardBorder,
  },
  avatarHint: {
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 17,
    color: colors.main,
    marginTop: 8,
  },
  field: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  bottom: {
    alignItems: 'center',
    paddingTop: 12,
    backgroundColor: colors.bg,
  },
});
