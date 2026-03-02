// src/screens/Settings.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import ConfigService from '../services/ConfigService';
import SecureStorage from '../storage/SecureStorage';

export default function Settings() {
  const [config, setConfig] = useState(null);
  const [privateKey, setPrivateKey] = useState('');
  const [kalshiKey, setKalshiKey] = useState('');
  const [kalshiSecret, setKalshiSecret] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const cfg = await ConfigService.load();
    setConfig(cfg);
  };

  const saveConfig = async () => {
    try {
      if (privateKey) {
        await SecureStorage.set('polymarket_private_key', privateKey, {
          biometric: true,
        });
      }
      if (kalshiKey) {
        await SecureStorage.set('kalshi_api_key', kalshiKey, {biometric: true});
      }
      if (kalshiSecret) {
        await SecureStorage.set('kalshi_api_secret', kalshiSecret, {
          biometric: true,
        });
      }

      await ConfigService.save(config);
      Alert.alert('✅ 成功', '配置已保存');
    } catch (error) {
      Alert.alert('❌ 失败', error.message);
    }
  };

  if (!config) {
    return <Text style={styles.loading}>加载中...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ 配置</Text>

      <Text style={styles.label}>Polymarket 私钥</Text>
      <TextInput
        style={styles.input}
        value={privateKey}
        onChangeText={setPrivateKey}
        placeholder="输入私钥"
        secureTextEntry
      />

      <Text style={styles.label}>Kalshi API Key</Text>
      <TextInput
        style={styles.input}
        value={kalshiKey}
        onChangeText={setKalshiKey}
        placeholder="输入 API Key"
        secureTextEntry
      />

      <Text style={styles.label}>Kalshi API Secret</Text>
      <TextInput
        style={styles.input}
        value={kalshiSecret}
        onChangeText={setKalshiSecret}
        placeholder="输入 API Secret"
        secureTextEntry
      />

      <Text style={styles.label}>最小利润 (¢)</Text>
      <TextInput
        style={styles.input}
        value={String(config.minProfitCents)}
        onChangeText={v =>
          setConfig({...config, minProfitCents: parseFloat(v) || 0})
        }
        keyboardType="numeric"
      />

      <Text style={styles.label}>轮询间隔 (秒)</Text>
      <TextInput
        style={styles.input}
        value={String(config.pollIntervalSeconds)}
        onChangeText={v =>
          setConfig({...config, pollIntervalSeconds: parseInt(v) || 60})
        }
        keyboardType="numeric"
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>推送通知</Text>
        <Switch
          value={config.enableNotifications}
          onValueChange={v => setConfig({...config, enableNotifications: v})}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveConfig}>
        <Text style={styles.saveButtonText}>💾 保存配置</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#0f1419'},
  title: {fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20},
  label: {fontSize: 14, color: '#8b949e', marginTop: 15, marginBottom: 5},
  input: {
    backgroundColor: '#161b22',
    padding: 12,
    borderRadius: 6,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  saveButton: {
    backgroundColor: '#238636',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
  loading: {textAlign: 'center', marginTop: 50, color: '#8b949e'},
});
