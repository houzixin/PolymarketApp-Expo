// src/components/StatCard.js
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function StatCard({label, value, color = '#4CAF50'}) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, {color}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#161b22',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#8b949e',
    marginBottom: 5,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
