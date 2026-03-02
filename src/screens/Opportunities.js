// src/screens/Opportunities.js
import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import Database from '../storage/Database';
import OpportunityCard from '../components/OpportunityCard';

export default function Opportunities({navigation, route}) {
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    loadOpportunities();
    const interval = setInterval(loadOpportunities, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOpportunities = async () => {
    try {
      await Database.init();
      const opps = await Database.getOpportunities(50);
      setOpportunities(opps);
    } catch (error) {
      console.error('Opportunities: load failed:', error);
    }
  };

  const executeTrade = async opportunity => {
    navigation.navigate('TradeExecute', {opportunity});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 套利机会</Text>
      <FlatList
        data={opportunities}
        renderItem={({item}) => (
          <OpportunityCard opportunity={item} onExecute={executeTrade} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>🔍 正在扫描市场...</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#0f1419'},
  title: {fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20},
  empty: {textAlign: 'center', color: '#8b949e', marginTop: 50},
});
