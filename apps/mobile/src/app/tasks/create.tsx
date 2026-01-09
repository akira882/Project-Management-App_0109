import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TasksApi, ProjectsApi } from '@/services/api';
import { Input, Button, Card } from '@/components/ui';
import { TaskStatus, TaskPriority } from '@project-management/shared';
import { Picker } from '@react-native-picker/picker';

export default function CreateTaskScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    projectId: '',
    dueDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // プロジェクト一覧を取得
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => ProjectsApi.getProjects(),
  });

  const projects = projectsData?.data || [];

  const createTaskMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const payload: any = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        projectId: data.projectId,
      };

      if (data.dueDate) {
        payload.dueDate = new Date(data.dueDate).toISOString();
      }

      return TasksApi.createTask(payload);
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (formData.projectId) {
        queryClient.invalidateQueries({ queryKey: ['project', formData.projectId] });
      }
      Alert.alert('成功', 'タスクを作成しました', [
        {
          text: 'OK',
          onPress: () => router.push(`/tasks/${task.id}`),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('エラー', error.message || 'タスクの作成に失敗しました');
    },
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'タスク名は必須です';
    } else if (formData.title.length > 200) {
      newErrors.title = 'タスク名は200文字以内で入力してください';
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = '説明は2000文字以内で入力してください';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'プロジェクトを選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    createTaskMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (formData.title || formData.description) {
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
        <Text style={styles.formTitle}>新規タスク作成</Text>

        <Input
          label="タスク名 *"
          value={formData.title}
          onChangeText={(text) =>
            setFormData({ ...formData, title: text })
          }
          placeholder="例: APIドキュメント作成"
          error={errors.title}
        />

        <Input
          label="説明"
          value={formData.description}
          onChangeText={(text) =>
            setFormData({ ...formData, description: text })
          }
          placeholder="タスクの詳細を入力..."
          multiline
          numberOfLines={4}
          style={styles.textArea}
          error={errors.description}
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>プロジェクト *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.projectId}
              onValueChange={(value) =>
                setFormData({ ...formData, projectId: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="プロジェクトを選択" value="" />
              {projects.map((project) => (
                <Picker.Item
                  key={project.id}
                  label={project.name}
                  value={project.id}
                />
              ))}
            </Picker>
          </View>
          {errors.projectId && (
            <Text style={styles.errorText}>{errors.projectId}</Text>
          )}
        </View>

        <Input
          label="期限"
          value={formData.dueDate}
          onChangeText={(text) =>
            setFormData({ ...formData, dueDate: text })
          }
          placeholder="YYYY-MM-DD"
          error={errors.dueDate}
        />

        <View style={styles.statusSection}>
          <Text style={styles.sectionLabel}>ステータス</Text>
          <View style={styles.statusButtons}>
            {Object.values(TaskStatus).map((status) => (
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
            {Object.values(TaskPriority).map((priority) => (
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
            loading={createTaskMutation.isPending}
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
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        paddingVertical: 0,
      },
      android: {
        paddingVertical: 0,
      },
    }),
  },
  picker: {
    height: 50,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  statusSection: {
    marginBottom: 16,
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
