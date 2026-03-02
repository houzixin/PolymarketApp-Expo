// src/screens/Trades.js
import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import Database from '../storage/Database';
import TradeRow from '../components/TradeRow';

export default function Trades() {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      await Database.init();
      const tradeList = await Database.getTrades(50);
      setTrades(tradeList);
    } catch (error) {
      console.error('Trades: load failed:', error);
    }
  };

  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 交易历史</Text>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          总盈亏：{totalPnl >= 0 ? '+' : ''}
          {totalPnl.toFixed(2)}¢
        </Text>
      </View>
      <FlatList
        data={trades}
        renderItem={({item}) => <TradeRow trade={item} />}
        ListEmptyComponent={<Text style={styles.empty}>📭 暂无交易记录</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#0f1419'},
  title: {fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20},
  summary: {
    backgroundColor: '#161b22',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryText: {fontSize: 18, fontWeight: 'bold', color: '#fff'},
  empty: {textAlign: 'center', color: '#8b949e', marginTop: 50},
});
