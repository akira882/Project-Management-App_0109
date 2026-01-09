import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import {
  ProjectStatus,
  ProjectPriority,
  TaskStatus,
  TaskPriority,
} from '@project-management/shared';

interface BadgeProps {
  label: string;
  type?:
    | ProjectStatus
    | ProjectPriority
    | TaskStatus
    | TaskPriority
    | 'default';
}

export const Badge: React.FC<BadgeProps> = ({ label, type = 'default' }) => {
  const getStyleForType = (): {
    container: ViewStyle;
    text: TextStyle;
  } => {
    const styles: Record<
      string,
      { container: ViewStyle; text: TextStyle }
    > = {
      // Project Status
      PLANNING: {
        container: { backgroundColor: '#DDD6FE' },
        text: { color: '#5B21B6' },
      },
      IN_PROGRESS: {
        container: { backgroundColor: '#DBEAFE' },
        text: { color: '#1E40AF' },
      },
      ON_HOLD: {
        container: { backgroundColor: '#FEF3C7' },
        text: { color: '#92400E' },
      },
      COMPLETED: {
        container: { backgroundColor: '#D1FAE5' },
        text: { color: '#065F46' },
      },
      ARCHIVED: {
        container: { backgroundColor: '#E5E7EB' },
        text: { color: '#374151' },
      },
      // Task Status
      TODO: {
        container: { backgroundColor: '#E5E7EB' },
        text: { color: '#374151' },
      },
      IN_REVIEW: {
        container: { backgroundColor: '#FEF3C7' },
        text: { color: '#92400E' },
      },
      DONE: {
        container: { backgroundColor: '#D1FAE5' },
        text: { color: '#065F46' },
      },
      BLOCKED: {
        container: { backgroundColor: '#FEE2E2' },
        text: { color: '#991B1B' },
      },
      // Priority
      LOW: {
        container: { backgroundColor: '#D1FAE5' },
        text: { color: '#065F46' },
      },
      MEDIUM: {
        container: { backgroundColor: '#FEF3C7' },
        text: { color: '#92400E' },
      },
      HIGH: {
        container: { backgroundColor: '#FFEDD5' },
        text: { color: '#9A3412' },
      },
      URGENT: {
        container: { backgroundColor: '#FEE2E2' },
        text: { color: '#991B1B' },
      },
      // Default
      default: {
        container: { backgroundColor: '#F3F4F6' },
        text: { color: '#1F2937' },
      },
    };

    return styles[type] || styles.default;
  };

  const customStyles = getStyleForType();

  return (
    <View style={[baseStyles.container, customStyles.container]}>
      <Text style={[baseStyles.text, customStyles.text]}>{label}</Text>
    </View>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
