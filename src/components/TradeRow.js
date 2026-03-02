// src/components/TradeRow.js
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function TradeRow({trade}) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.outcome} numberOfLines={1}>
          {trade.outcome}
        </Text>
        <Text style={styles.time}>
          {new Date(trade.timestamp).toLocaleString()}
        </Text>
      </View>
      <View style={styles.right}>
        <Text
          style={[styles.pnl, {color: trade.pnl > 0 ? '#4CAF50' : '#f44336'}]}>
          {trade.pnl > 0 ? '+' : ''}
          {trade.pnl.toFixed(2)}¢
        </Text>
        <Text style={styles.status}>{trade.status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#161b22',
    borderRadius: 6,
    marginBottom: 8,
  },
  left: {
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
  },
  outcome: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    color: '#8b949e',
    marginTop: 4,
  },
  pnl: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 12,
    color: '#8b949e',
    marginTop: 4,
  },
});
