// src/screens/Dashboard.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, RefreshControl } from 'react-native';
import ScannerService from '../services/ScannerService';
import Database from '../storage/Database';
import StatCard from '../components/StatCard';
import OpportunityCard from '../components/OpportunityCard';

export default function Dashboard({ navigation }) {
  const [status, setStatus] = useState({ running: false, stats: {} });
  const [opportunities, setOpportunities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      await Database.init();
      const scannerStatus = ScannerService.getStatus();
      const stats = await Database.getStats();
      const opps = await Database.getOpportunities(10);
      
      const winRate = stats.totalTrades > 0 ? ((stats.wins / stats.totalTrades) * 100).toFixed(1) : '0';
      
      setStatus({ 
        running: scannerStatus.isRunning, 
        stats: { ...stats, winRate }
      });
      setOpportunities(opps);
      setRefreshing(false);
    } catch (error) {
      console.error('Dashboard: loadStatus failed:', error);
    }
  };

  const toggleScanner = async () => {
    try {
      const ConfigService = await import('../services/ConfigService');
      const config = await ConfigService.default.load();
      if (status.running) {
        await ScannerService.stop();
      } else {
        await ScannerService.start(config);
      }
      loadStatus();
    } catch (error) {
      alert('操作失败：' + error.message);
    }
  };

  const executeTrade = (opportunity) => {
    navigation.navigate('Opportunities', { execute: opportunity });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔄 跨平台套利</Text>
        <TouchableOpacity 
          style={[styles.button, status.running ? styles.stop : styles.start]}
          onPress={toggleScanner}
        >
          <Text style={styles.buttonText}>
            {status.running ? '⏹ 停止' : '▶ 启动'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <StatCard label="总盈亏" value={`$${(stats.totalPnl || 0).toFixed(2)}`} color={stats.totalPnl >= 0 ? '#4CAF50' : '#f44336'} />
        <StatCard label="交易数" value={stats.totalTrades || 0} />
        <StatCard label="胜率" value={`${stats.winRate || 0}%`} />
      </View>

      <Text style={styles.sectionTitle}>最新机会</Text>
      <FlatList
        data={opportunities}
        renderItem={({ item }) => (
          <OpportunityCard 
            opportunity={item} 
            onExecute={executeTrade}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadStatus} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>暂无机会，等待扫描...</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0f1419' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  button: { padding: 10, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  start: { backgroundColor: '#238636' },
  stop: { backgroundColor: '#da3633' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  empty: { textAlign: 'center', color: '#8b949e', marginTop: 50 },
});
