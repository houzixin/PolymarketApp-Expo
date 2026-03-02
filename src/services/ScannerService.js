// src/services/ScannerService.js

import PushNotification from 'react-native-push-notification';
import PolymarketAPI from './PolymarketAPI';
import KalshiAPI from './KalshiAPI';
import MatcherService from './MatcherService';
import ArbitrageService from './ArbitrageService';
import Database from '../storage/Database';
import SecureStorage from '../storage/SecureStorage';

/**
 * 套利扫描服务
 */
class ScannerService {
  constructor() {
    this.interval = null;
    this.isRunning = false;
    this.lastScanTime = 0;
    this.config = null;
  }

  /**
   * 启动扫描服务
   */
  async start(config) {
    if (this.isRunning) {
      console.log('ScannerService: Already running');
      return;
    }

    this.config = config;
    this.isRunning = true;

    // 设置定时器
    this.interval = setInterval(() => {
      this.scan();
    }, config.pollIntervalSeconds * 1000);

    // 立即执行一次
    this.scan();

    console.log(
      `ScannerService: Started (interval: ${config.pollIntervalSeconds}s)`,
    );
  }

  /**
   * 停止扫描服务
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('ScannerService: Stopped');
  }

  /**
   * 执行一次扫描
   */
  async scan() {
    try {
      console.log(
        `ScannerService: Scanning at ${new Date().toLocaleTimeString()}`,
      );
      this.lastScanTime = Date.now();

      // 1. 初始化 API 客户端
      await this.initAPIClients();

      // 2. 获取市场数据
      const [polyMarkets, kalshiMarkets] = await Promise.all([
        PolymarketAPI.getMarkets(this.config.polymarketUrl),
        KalshiAPI.getMarkets(this.config.kalshiUrl),
      ]);

      // 3. 解析 outcomes
      const polyOutcomes = this.parseOutcomes(polyMarkets, 'polymarket');
      const kalshiOutcomes = this.parseOutcomes(kalshiMarkets, 'kalshi');

      // 4. 匹配市场
      const matches = MatcherService.match(
        polyOutcomes,
        kalshiOutcomes,
        this.config.matchingThreshold,
      );

      // 5. 计算套利机会
      const opportunities = ArbitrageService.findOpportunities(
        matches,
        this.config.minProfitCents,
      );

      // 6. 保存到数据库
      for (const opp of opportunities) {
        await Database.saveOpportunity(opp);
      }

      // 7. 发送通知 (只发送最佳机会)
      if (opportunities.length > 0 && this.config.enableNotifications) {
        this.sendNotification(opportunities[0]);
      }

      console.log(
        `ScannerService: Found ${opportunities.length} opportunities`,
      );
    } catch (error) {
      console.error('ScannerService: Scan failed:', error);
    }
  }

  /**
   * 初始化 API 客户端
   */
  async initAPIClients() {
    // 初始化 Polymarket
    if (!PolymarketAPI.isInitialized()) {
      const privateKey = await SecureStorage.get('polymarket_private_key');
      if (privateKey) {
        await PolymarketAPI.init(privateKey, this.config?.proxy);
      }
    }

    // 初始化 Kalshi
    if (!KalshiAPI.isInitialized()) {
      const apiKey = await SecureStorage.get('kalshi_api_key');
      const apiSecret = await SecureStorage.get('kalshi_api_secret');
      if (apiKey && apiSecret) {
        await KalshiAPI.init(apiKey, apiSecret, this.config?.proxy);
      }
    }
  }

  /**
   * 解析 outcomes
   */
  parseOutcomes(markets, platform) {
    return markets
      .filter(m => m.outcomes && m.outcomes.length >= 2)
      .map(market => {
        const yesOutcome = market.outcomes.find(
          o => o.label.toLowerCase().includes('yes') || o.side === 'yes',
        );
        const noOutcome = market.outcomes.find(
          o => o.label.toLowerCase().includes('no') || o.side === 'no',
        );

        const title = yesOutcome ? yesOutcome.label : market.outcomes[0].label;
        const yesId = yesOutcome ? yesOutcome.id : market.outcomes[0].id;
        const noId = noOutcome ? noOutcome.id : market.outcomes[1].id;

        const yesPrice = yesOutcome
          ? Number((yesOutcome.price * 100).toFixed(2))
          : Number((market.outcomes[0].price * 100).toFixed(2));

        const noPrice = noOutcome
          ? Number((noOutcome.price * 100).toFixed(2))
          : Number((market.outcomes[1].price * 100).toFixed(2));

        return {
          title,
          marketId: market.id,
          yesId,
          noId,
          yesPrice,
          noPrice,
          platform,
          volume: market.volume || 0,
        };
      });
  }

  /**
   * 发送推送通知
   */
  sendNotification(opportunity) {
    PushNotification.localNotification({
      title: '🎯 发现套利机会！',
      message: `${opportunity.outcome}\n利润：${
        opportunity.profit
      }¢ (${opportunity.roi.toFixed(2)}%)`,
      data: {
        type: 'opportunity',
        outcome: opportunity.outcome,
        profit: opportunity.profit,
      },
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
    });
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastScanTime: this.lastScanTime,
    };
  }
}

export default new ScannerService();
