import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NewsCard({ headline, isDark }) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#1e1e1e' : '#fff',
          shadowColor: isDark ? '#000' : '#000',
        },
      ]}
    >
      <Text style={[styles.title, { color: isDark ? '#fff' : '#1c1c1e' }]} numberOfLines={3}>
        {headline.title}
      </Text>
      {headline.source && (
        <Text style={[styles.source, { color: isDark ? '#aaa' : '#888' }]}>
          Source: {headline.source}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  source: {
    marginTop: 8,
    fontSize: 12,
  },
});
