import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectsApi } from '@/services/api';
import { Input, Button, Card } from '@/components/ui';
import { ProjectStatus, ProjectPriority } from '@project-management/shared';

export default function CreateProjectScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: ProjectStatus.PLANNING,
    priority: ProjectPriority.MEDIUM,
    userId: 'temp-user-id', // TODO: 実際のユーザーIDに置き換え
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createProjectMutation = useMutation({
    mutationFn: (data: typeof formData) => ProjectsApi.createProject(data),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      Alert.alert('成功', 'プロジェクトを作成しました', [
        {
          text: 'OK',
          onPress: () => router.push(`/projects/${project.id}`),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('エラー', error.message || 'プロジェクトの作成に失敗しました');
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

    createProjectMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (formData.name || formData.description) {
      Alert.alert(
        '確認',
        '入力内容が破棄されますが、よろしいですか？',
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

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>新規プロジェクト作成</Text>

        <Input
          label="プロジェクト名 *"
          value={formData.name}
          onChangeText={(text) =>
            setFormData({ ...formData, name: text })
          }
          placeholder="例: Webサイトリニューアル"
          error={errors.name}
        />

        <Input
          label="説明"
          value={formData.description}
          onChangeText={(text) =>
            setFormData({ ...formData, description: text })
          }
          placeholder="プロジェクトの概要を入力..."
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
            title="作成"
            onPress={handleSubmit}
            variant="primary"
            style={styles.actionButton}
            loading={createProjectMutation.isPending}
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
