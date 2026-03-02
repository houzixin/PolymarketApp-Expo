// src/services/ConfigService.js

import Database from '../storage/Database';

/**
 * 配置管理服务
 */
class ConfigService {
  constructor() {
    this.defaultConfig = {
      polymarketUrl:
        'https://polymarket.com/event/who-will-trump-nominate-as-fed-chair',
      kalshiUrl:
        'https://kalshi.com/markets/kxfedchairnom/fed-chair-nominee/kxfedchairnom-29',
      pollIntervalSeconds: 60,
      minProfitCents: 1,
      tradingMode: 'CONSERVATIVE',
      tradeAmountCents: 100,
      matchingThreshold: 0.7,
      enableNotifications: true,
      proxy: null,
    };
  }

  /**
   * 加载配置
   */
  async load() {
    await Database.init();

    const config = {...this.defaultConfig};

    // 从数据库加载配置
    const keys = Object.keys(this.defaultConfig);
    for (const key of keys) {
      const value = await Database.getConfig(key);
      if (value !== null) {
        try {
          config[key] = JSON.parse(value);
        } catch {
          config[key] = value;
        }
      }
    }

    return config;
  }

  /**
   * 保存配置
   */
  async save(config) {
    await Database.init();

    for (const [key, value] of Object.entries(config)) {
      await Database.saveConfig(key, JSON.stringify(value));
    }

    console.log('ConfigService: Config saved');
  }

  /**
   * 重置为默认配置
   */
  async reset() {
    await this.save(this.defaultConfig);
    return this.defaultConfig;
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig() {
    return {...this.defaultConfig};
  }
}

export default new ConfigService();
