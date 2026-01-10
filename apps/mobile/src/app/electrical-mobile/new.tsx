import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectsApi } from '@/services/api';

export default function NewElectricalProject() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    customerName: '',
    address: '',
    phone: '',
    workDescription: '',
    estimateAmount: '',
    memo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createProjectMutation = useMutation({
    mutationFn: (data: any) => ProjectsApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      Alert.alert(
        '登録完了',
        '案件を登録しました',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
            style: 'default',
          },
        ],
        { cancelable: false }
      );
    },
    onError: (error: any) => {
      Alert.alert('エラー', '登録に失敗しました\nもう一度お試しください');
    },
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'お客様名を入力してください';
    }

    if (!formData.workDescription.trim()) {
      newErrors.workDescription = '工事内容を入力してください';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // エラーがある場合、最初のエラーをアラート表示
      const firstError = Object.values(newErrors)[0];
      Alert.alert('入力エラー', firstError);
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    // データを整形
    const projectData = {
      name: formData.customerName,
      description: `【住所】${formData.address}\n【電話】${formData.phone}\n【工事内容】${formData.workDescription}\n【見積金額】${formData.estimateAmount}円\n【メモ】${formData.memo}`,
      status: 'PLANNING',
      priority: 'MEDIUM',
    };

    createProjectMutation.mutate(projectData);
  };

  const handleCancel = () => {
    const hasInput =
      formData.customerName ||
      formData.address ||
      formData.phone ||
      formData.workDescription ||
      formData.estimateAmount ||
      formData.memo;

    if (hasInput) {
      Alert.alert(
        '確認',
        '入力した内容は保存されません\nよろしいですか？',
        [
          {
            text: 'キャンセル',
            style: 'cancel',
          },
          {
            text: '戻る',
            onPress: () => router.back(),
            style: 'destructive',
          },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <Text style={styles.backButtonText}>← 戻る</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>➕ 新しい</Text>
          <Text style={styles.headerTitle}>案件登録</Text>
        </View>

        <View style={styles.form}>
          {/* お客様名 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              お客様名 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.customerName && styles.inputError]}
              value={formData.customerName}
              onChangeText={(text) => {
                setFormData({ ...formData, customerName: text });
                if (errors.customerName) {
                  setErrors({ ...errors, customerName: '' });
                }
              }}
              placeholder="例: 山田太郎"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
          </View>

          {/* 住所 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>住所</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="例: 東京都〇〇区〇〇 1-2-3"
              placeholderTextColor="#9CA3AF"
              multiline
            />
          </View>

          {/* 電話番号 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>電話番号</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="例: 03-1234-5678"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>

          {/* 工事内容 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              工事内容 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.workDescription && styles.inputError,
              ]}
              value={formData.workDescription}
              onChangeText={(text) => {
                setFormData({ ...formData, workDescription: text });
                if (errors.workDescription) {
                  setErrors({ ...errors, workDescription: '' });
                }
              }}
              placeholder="例: エアコン取り付け&#10;室外機設置&#10;配管工事"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* 見積金額 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>見積金額（円）</Text>
            <TextInput
              style={styles.input}
              value={formData.estimateAmount}
              onChangeText={(text) =>
                setFormData({ ...formData, estimateAmount: text })
              }
              placeholder="例: 50000"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          {/* メモ */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>メモ</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.memo}
              onChangeText={(text) => setFormData({ ...formData, memo: text })}
              placeholder="その他気づいたことなど"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* ヘルプメッセージ */}
          <View style={styles.helpBox}>
            <Text style={styles.helpText}>
              💡 <Text style={styles.required}>*</Text> は必須項目です
            </Text>
            <Text style={styles.helpText}>その他は後から追加できます</Text>
          </View>

          {/* ボタン */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={createProjectMutation.isPending}
              activeOpacity={0.7}
            >
              <Text style={styles.submitButtonText}>
                {createProjectMutation.isPending ? '登録中...' : '✅ 登録する'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 余白 */}
        <View style={styles.footer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1E40AF',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 52,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  required: {
    color: '#EF4444',
    fontSize: 28,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    fontSize: 24,
    color: '#1F2937',
    minHeight: 80,
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 4,
  },
  textArea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  helpBox: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  helpText: {
    fontSize: 22,
    color: '#1E40AF',
    lineHeight: 32,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#9CA3AF',
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cancelButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footer: {
    height: 40,
  },
});
