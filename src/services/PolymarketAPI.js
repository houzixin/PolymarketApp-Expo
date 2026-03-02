// src/services/PolymarketAPI.js

import pmxt from 'pmxtjs';

/**
 * Polymarket API 客户端
 */
class PolymarketAPI {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  /**
   * 初始化客户端
   */
  async init(privateKey, proxyUrl = null) {
    try {
      const options = {
        privateKey,
        signatureType: 1,
      };

      // 如果配置了代理
      if (proxyUrl) {
        const {HttpsProxyAgent} = await import('https-proxy-agent');
        const agent = new HttpsProxyAgent(proxyUrl);
        options.agent = agent;
        options.httpAgent = agent;
        options.httpsAgent = agent;
      }

      this.client = new pmxt.polymarket(options);
      this.initialized = true;
      console.log('PolymarketAPI: Initialized');
      return true;
    } catch (error) {
      console.error('PolymarketAPI: Init failed:', error);
      throw error;
    }
  }

  /**
   * 检查是否已初始化
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * 获取市场数据
   */
  async getMarkets(url) {
    if (!this.initialized) {
      throw new Error('PolymarketAPI not initialized');
    }

    const slug = this.extractSlug(url);
    const markets = await this.client.getMarketsBySlug(slug);
    return markets;
  }

  /**
   * 创建订单
   */
  async createOrder(marketId, outcomeId, side, amount) {
    const order = await this.client.createOrder({
      marketId,
      outcomeId,
      side,
      amount,
      type: 'market',
    });
    return order;
  }

  /**
   * 提取市场 slug
   */
  extractSlug(url) {
    const match = url.match(/event\/([^/?]+)/);
    return match ? match[1] : null;
  }

  /**
   * 获取余额
   */
  async getBalance() {
    const balance = await this.client.getBalance();
    return balance;
  }
}

export default new PolymarketAPI();
