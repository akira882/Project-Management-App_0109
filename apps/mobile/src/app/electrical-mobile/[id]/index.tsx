import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { ProjectsApi } from '@/services/api';
import { Card } from '@/components/ui';
import { PhotoService, Photo } from '@/services/photos';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ElectricalDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => ProjectsApi.getProject(id!),
    enabled: !!id,
  });

  // 写真を読み込み
  const loadPhotos = async () => {
    if (id) {
      const projectPhotos = await PhotoService.getPhotosByProject(id);
      setPhotos(projectPhotos);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [id]);

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) =>
      ProjectsApi.updateProject(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      Alert.alert('完了', 'ステータスを変更しました');
    },
    onError: () => {
      Alert.alert('エラー', 'ステータスの変更に失敗しました');
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => ProjectsApi.deleteProject(id!),
    onSuccess: async () => {
      // プロジェクトの写真も削除
      await PhotoService.deleteProjectPhotos(id!);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      Alert.alert('削除完了', '案件を削除しました', [
        {
          text: 'OK',
          onPress: () => router.push('/electrical-mobile'),
        },
      ]);
    },
    onError: () => {
      Alert.alert('エラー', '削除に失敗しました');
    },
  });

  const handleTakePhoto = async () => {
    // カメラのパーミッションを確認
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'カメラへのアクセス',
        'カメラを使用するには、設定でカメラへのアクセスを許可してください'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const photo: Omit<Photo, 'id'> = {
        uri: result.assets[0].uri,
        projectId: id!,
        timestamp: Date.now(),
        type: 'other',
      };

      await PhotoService.savePhoto(photo);
      await loadPhotos();
      Alert.alert('✅ 保存完了', '写真を保存しました');
    }
  };

  const handleChooseFromGallery = async () => {
    // ギャラリーのパーミッションを確認
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'ギャラリーへのアクセス',
        'ギャラリーを使用するには、設定でアクセスを許可してください'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const photo: Omit<Photo, 'id'> = {
        uri: result.assets[0].uri,
        projectId: id!,
        timestamp: Date.now(),
        type: 'other',
      };

      await PhotoService.savePhoto(photo);
      await loadPhotos();
      Alert.alert('✅ 保存完了', '写真を保存しました');
    }
  };

  const handlePhotoPress = (photo: Photo) => {
    setSelectedPhoto(photo);
    setPhotoModalVisible(true);
  };

  const handleDeletePhoto = (photo: Photo) => {
    Alert.alert(
      '🗑️ 写真を削除',
      'この写真を削除しますか？\n\n削除した写真は元に戻せません',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: async () => {
            await PhotoService.deletePhoto(photo.id);
            await loadPhotos();
            setPhotoModalVisible(false);
            Alert.alert('削除完了', '写真を削除しました');
          },
        },
      ]
    );
  };

  const handleStatusChange = (status: string) => {
    const confirmMessages: Record<string, string> = {
      PLANNING: '見積中に変更しますか？',
      IN_PROGRESS: '工事中に変更しますか？',
      COMPLETED: '完了に変更しますか？\n\n（完了後は変更できません）',
      ON_HOLD: '保留に変更しますか？',
    };

    Alert.alert(
      'ステータス変更',
      confirmMessages[status],
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'OK',
          onPress: () => updateStatusMutation.mutate(status),
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      '⚠️ 削除の確認',
      'この案件を削除しますか？\n\n削除したデータは元に戻せません。\n\n本当によろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: () => deleteProjectMutation.mutate(),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>⚡</Text>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>❌</Text>
        <Text style={styles.loadingText}>案件が見つかりません</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const project = data;
  const description = project.description || '';

  // 説明から情報を抽出
  const addressMatch = description.match(/【住所】([^\n]+)/);
  const phoneMatch = description.match(/【電話】([^\n]+)/);
  const workMatch = description.match(/【工事内容】([^\n]+)/);
  const estimateMatch = description.match(/【見積金額】([^\n]+)/);
  const memoMatch = description.match(/【メモ】([^\n]+)/);

  // ステータステキスト
  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      PLANNING: '📋 見積中',
      IN_PROGRESS: '🔧 工事中',
      COMPLETED: '✅ 完了',
      ON_HOLD: '⏸️ 保留',
    };
    return map[status] || status;
  };

  return (
    <ScrollView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Text style={styles.headerBackButtonText}>← 一覧に戻る</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📋 案件詳細</Text>
      </View>

      {/* ステータスバッジ */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadgeLarge,
            project.status === 'PLANNING'
              ? styles.statusBadgeYellow
              : project.status === 'IN_PROGRESS'
              ? styles.statusBadgeBlue
              : project.status === 'COMPLETED'
              ? styles.statusBadgeGreen
              : styles.statusBadgeGray,
          ]}
        >
          <Text style={styles.statusBadgeLargeText}>
            {getStatusText(project.status)}
          </Text>
        </View>
      </View>

      {/* メイン情報 */}
      <Card style={styles.infoCard}>
        {/* お客様名 */}
        <View style={styles.infoRow}>
          <Text style={styles.infoEmoji}>👤</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>お客様名</Text>
            <Text style={styles.infoValue}>
              {project.name || '（未設定）'}
            </Text>
          </View>
        </View>

        {/* 住所 */}
        {addressMatch && (
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>📍</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>住所</Text>
              <Text style={styles.infoValue}>{addressMatch[1]}</Text>
            </View>
          </View>
        )}

        {/* 電話番号 */}
        {phoneMatch && (
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>📞</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>電話番号</Text>
              <Text style={styles.infoValue}>{phoneMatch[1]}</Text>
            </View>
          </View>
        )}

        {/* 工事内容 */}
        {workMatch && (
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>🔧</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>工事内容</Text>
              <Text style={styles.infoValue}>{workMatch[1]}</Text>
            </View>
          </View>
        )}

        {/* 見積金額 */}
        {estimateMatch && (
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>💰</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>見積金額</Text>
              <Text style={[styles.infoValue, styles.infoValueBold]}>
                {estimateMatch[1]}
              </Text>
            </View>
          </View>
        )}

        {/* メモ */}
        {memoMatch && (
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>📝</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>メモ</Text>
              <Text style={styles.infoValue}>{memoMatch[1]}</Text>
            </View>
          </View>
        )}

        {/* 登録日 */}
        <View style={styles.infoRow}>
          <Text style={styles.infoEmoji}>📅</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>登録日</Text>
            <Text style={styles.infoValue}>
              {new Date(project.createdAt).toLocaleDateString('ja-JP')}
            </Text>
          </View>
        </View>
      </Card>

      {/* 写真セクション */}
      <Card style={styles.photoCard}>
        <Text style={styles.sectionTitle}>📷 現場写真 ({photos.length}枚)</Text>

        {/* 写真撮影ボタン */}
        <View style={styles.photoButtonsContainer}>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={handleTakePhoto}
            activeOpacity={0.7}
          >
            <Text style={styles.photoButtonEmoji}>📷</Text>
            <Text style={styles.photoButtonText}>カメラで撮影</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.photoButtonSecondary}
            onPress={handleChooseFromGallery}
            activeOpacity={0.7}
          >
            <Text style={styles.photoButtonEmoji}>🖼️</Text>
            <Text style={styles.photoButtonTextSecondary}>ギャラリーから選択</Text>
          </TouchableOpacity>
        </View>

        {/* 写真一覧 */}
        {photos.length > 0 ? (
          <View style={styles.photoGrid}>
            {photos.map((photo) => (
              <TouchableOpacity
                key={photo.id}
                style={styles.photoThumbnail}
                onPress={() => handlePhotoPress(photo)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: photo.uri }} style={styles.thumbnailImage} />
                <Text style={styles.photoDate}>
                  {new Date(photo.timestamp).toLocaleDateString('ja-JP', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyPhotos}>
            <Text style={styles.emptyPhotosEmoji}>📸</Text>
            <Text style={styles.emptyPhotosText}>まだ写真がありません</Text>
            <Text style={styles.emptyPhotosSubtext}>
              工事前後の写真を撮影して記録しましょう
            </Text>
          </View>
        )}
      </Card>

      {/* ステータス変更ボタン */}
      <Card style={styles.statusChangeCard}>
        <Text style={styles.sectionTitle}>ステータス変更</Text>
        <View style={styles.statusButtons}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              project.status === 'PLANNING' && styles.statusButtonActiveYellow,
            ]}
            onPress={() => handleStatusChange('PLANNING')}
            disabled={project.status === 'PLANNING'}
            activeOpacity={0.7}
          >
            <Text style={styles.statusButtonEmoji}>📋</Text>
            <Text
              style={[
                styles.statusButtonText,
                project.status === 'PLANNING' && styles.statusButtonTextActive,
              ]}
            >
              見積中
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              project.status === 'IN_PROGRESS' && styles.statusButtonActiveBlue,
            ]}
            onPress={() => handleStatusChange('IN_PROGRESS')}
            disabled={project.status === 'IN_PROGRESS'}
            activeOpacity={0.7}
          >
            <Text style={styles.statusButtonEmoji}>🔧</Text>
            <Text
              style={[
                styles.statusButtonText,
                project.status === 'IN_PROGRESS' && styles.statusButtonTextActive,
              ]}
            >
              工事中
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              project.status === 'COMPLETED' && styles.statusButtonActiveGreen,
            ]}
            onPress={() => handleStatusChange('COMPLETED')}
            disabled={project.status === 'COMPLETED'}
            activeOpacity={0.7}
          >
            <Text style={styles.statusButtonEmoji}>✅</Text>
            <Text
              style={[
                styles.statusButtonText,
                project.status === 'COMPLETED' && styles.statusButtonTextActive,
              ]}
            >
              完了
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* 操作ボタン */}
      <Card style={styles.actionsCard}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={deleteProjectMutation.isPending}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>
            {deleteProjectMutation.isPending ? '削除中...' : '🗑️ この案件を削除'}
          </Text>
        </TouchableOpacity>
      </Card>

      {/* 注意書き */}
      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          💡 ステータスを変更すると自動的に保存されます
        </Text>
        <Text style={styles.noteText}>
          写真は端末に保存され、案件と紐付けられます
        </Text>
        <Text style={styles.noteText}>
          削除した案件・写真は復元できませんのでご注意ください
        </Text>
      </View>

      {/* 余白 */}
      <View style={styles.footer} />

      {/* 写真プレビューモーダル */}
      <Modal
        visible={photoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedPhoto && (
              <>
                <Image
                  source={{ uri: selectedPhoto.uri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <Text style={styles.modalDate}>
                  撮影日時: {new Date(selectedPhoto.timestamp).toLocaleString('ja-JP')}
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalDeleteButton}
                    onPress={() => handleDeletePhoto(selectedPhoto)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalDeleteButtonText}>🗑️ 削除</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setPhotoModalVisible(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalCloseButtonText}>閉じる</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  header: {
    backgroundColor: '#1E40AF',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerBackButton: {
    marginBottom: 16,
  },
  headerBackButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statusContainer: {
    padding: 16,
    alignItems: 'center',
  },
  statusBadgeLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statusBadgeYellow: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeBlue: {
    backgroundColor: '#DBEAFE',
  },
  statusBadgeGreen: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeGray: {
    backgroundColor: '#F3F4F6',
  },
  statusBadgeLargeText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  infoCard: {
    margin: 16,
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoEmoji: {
    fontSize: 36,
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 26,
    color: '#1F2937',
    fontWeight: '600',
    lineHeight: 36,
  },
  infoValueBold: {
    fontWeight: 'bold',
    color: '#10B981',
  },
  photoCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
  },
  photoButtonsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  photoButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  photoButtonSecondary: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  photoButtonEmoji: {
    fontSize: 36,
  },
  photoButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  photoButtonTextSecondary: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoThumbnail: {
    width: (SCREEN_WIDTH - 32 - 20 * 2 - 12) / 2,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  photoDate: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    padding: 8,
    textAlign: 'center',
  },
  emptyPhotos: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyPhotosEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  emptyPhotosText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyPhotosSubtext: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  statusChangeCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  statusButtonActiveYellow: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  statusButtonActiveBlue: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
  },
  statusButtonActiveGreen: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  statusButtonEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  statusButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  statusButtonTextActive: {
    color: '#FFFFFF',
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteButtonText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  noteBox: {
    backgroundColor: '#DBEAFE',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  noteText: {
    fontSize: 20,
    color: '#1E40AF',
    fontWeight: '600',
    lineHeight: 30,
    marginBottom: 8,
  },
  footer: {
    height: 40,
  },
  backButton: {
    marginTop: 24,
    backgroundColor: '#2563EB',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // モーダルスタイル
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalImage: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_WIDTH - 40,
    borderRadius: 12,
  },
  modalDate: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 30,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalDeleteButtonText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
