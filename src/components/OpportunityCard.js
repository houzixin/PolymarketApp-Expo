// src/components/OpportunityCard.js
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

export default function OpportunityCard({opportunity, onExecute}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {opportunity.outcome}
        </Text>
        <Text
          style={[
            styles.profit,
            {color: opportunity.profit > 0 ? '#4CAF50' : '#f44336'},
          ]}>
          +{opportunity.profit.toFixed(2)}¢ ({opportunity.roi?.toFixed(2)}%)
        </Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {opportunity.description}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => onExecute(opportunity)}>
        <Text style={styles.buttonText}>执行</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161b22',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  profit: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#8b949e',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#238636',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
