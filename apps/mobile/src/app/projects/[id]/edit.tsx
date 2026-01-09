import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProjectsApi } from '@/services/api';
import { Input, Button, Card, LoadingSpinner, ErrorView } from '@/components/ui';
import { ProjectStatus, ProjectPriority } from '@project-management/shared';

export default function EditProjectScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: ProjectStatus.PLANNING,
    priority: ProjectPriority.MEDIUM,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // プロジェクトデータを取得
  const { data, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => ProjectsApi.getProject(id!),
    enabled: !!id,
  });

  // データ取得後、フォームに反映
  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name,
        description: data.description || '',
        status: data.status,
        priority: data.priority,
      });
    }
  }, [data]);

  const updateProjectMutation = useMutation({
    mutationFn: (updatedData: typeof formData) =>
      ProjectsApi.updateProject(id!, updatedData),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      Alert.alert('成功', 'プロジェクトを更新しました', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('エラー', error.message || 'プロジェクトの更新に失敗しました');
    },
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'プロジェクト名は必須です';
    } else if (formData.name.length > 200) {
      newErrors.name = 'プロジェクト名は200文字以内で入力してください';
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = '説明は2000文字以内で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    updateProjectMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (JSON.stringify(formData) !== JSON.stringify({
      name: data?.name || '',
      description: data?.description || '',
      status: data?.status || ProjectStatus.PLANNING,
      priority: data?.priority || ProjectPriority.MEDIUM,
    })) {
      Alert.alert(
        '確認',
        '変更内容が破棄されますが、よろしいですか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: '破棄',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="プロジェクトを読み込んでいます..." />;
  }

  if (error || !data) {
    return (
      <ErrorView
        message="プロジェクトの読み込みに失敗しました"
        onRetry={() => router.back()}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>プロジェクト編集</Text>

        <Input
          label="プロジェクト名 *"
          value={formData.name}
          onChangeText={(text) =>
            setFormData({ ...formData, name: text })
          }
          placeholder="例: モバイルアプリ開発"
          error={errors.name}
        />

        <Input
          label="説明"
          value={formData.description}
          onChangeText={(text) =>
            setFormData({ ...formData, description: text })
          }
          placeholder="プロジェクトの詳細を入力..."
          multiline
          numberOfLines={4}
          style={styles.textArea}
          error={errors.description}
        />

        <View style={styles.statusSection}>
          <Text style={styles.sectionLabel}>ステータス</Text>
          <View style={styles.statusButtons}>
            {Object.values(ProjectStatus).map((status) => (
              <Button
                key={status}
                title={status}
                onPress={() =>
                  setFormData({ ...formData, status })
                }
                variant={
                  formData.status === status ? 'primary' : 'outline'
                }
                size="small"
                style={styles.statusButton}
              />
            ))}
          </View>
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.sectionLabel}>優先度</Text>
          <View style={styles.statusButtons}>
            {Object.values(ProjectPriority).map((priority) => (
              <Button
                key={priority}
                title={priority}
                onPress={() =>
                  setFormData({ ...formData, priority })
                }
                variant={
                  formData.priority === priority ? 'primary' : 'outline'
                }
                size="small"
                style={styles.statusButton}
              />
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="キャンセル"
            onPress={handleCancel}
            variant="secondary"
            style={styles.actionButton}
          />
          <Button
            title="更新"
            onPress={handleSubmit}
            variant="primary"
            style={styles.actionButton}
            loading={updateProjectMutation.isPending}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  formCard: {
    margin: 16,
    padding: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  statusSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    minWidth: 80,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
  },
});
