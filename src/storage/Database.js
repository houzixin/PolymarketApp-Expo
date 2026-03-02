// src/storage/Database.js

import SQLite from 'react-native-sqlite-storage';

/**
 * SQLite 数据库管理
 */
class Database {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  /**
   * 初始化数据库
   */
  async init() {
    if (this.initialized) {
      return;
    }

    try {
      this.db = await SQLite.openDatabase({
        name: 'Polymarket.db',
        location: 'default',
      });

      await this.createTables();
      this.initialized = true;
      console.log('Database: Initialized');
    } catch (error) {
      console.error('Database: Init failed:', error);
      throw error;
    }
  }

  /**
   * 创建数据表
   */
  async createTables() {
    const queries = [
      // 机会表
      `CREATE TABLE IF NOT EXISTS opportunities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        outcome TEXT NOT NULL,
        profit REAL NOT NULL,
        roi REAL,
        description TEXT,
        polymarket_price REAL,
        kalshi_price REAL,
        executed INTEGER DEFAULT 0,
        executed_at INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      // 交易表
      `CREATE TABLE IF NOT EXISTS trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        opportunity_id INTEGER,
        outcome TEXT NOT NULL,
        platform TEXT NOT NULL,
        side TEXT NOT NULL,
        contracts INTEGER NOT NULL,
        price REAL NOT NULL,
        pnl REAL DEFAULT 0,
        status TEXT NOT NULL,
        order_id TEXT,
        error_message TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (opportunity_id) REFERENCES opportunities(id)
      )`,

      // 配置表
      `CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      // 统计表
      `CREATE TABLE IF NOT EXISTS stats (
        date TEXT PRIMARY KEY,
        totalTrades INTEGER DEFAULT 0,
        totalPnl REAL DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,
    ];

    for (const query of queries) {
      await this.db.executeSql(query);
    }

    // 创建索引
    await this.db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_opportunities_timestamp ON opportunities(timestamp DESC)',
    );
    await this.db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades(timestamp DESC)',
    );
    await this.db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_trades_opportunity ON trades(opportunity_id)',
    );

    console.log('Database: Tables created');
  }

  // ========== 机会相关操作 ==========

  async saveOpportunity(opportunity) {
    try {
      const result = await this.db.executeSql(
        'INSERT INTO opportunities (timestamp, outcome, profit, roi, description, polymarket_price, kalshi_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          opportunity.timestamp || Date.now(),
          opportunity.outcome,
          opportunity.profit,
          opportunity.roi,
          opportunity.description,
          opportunity.polymarketOutcome?.yesPrice || 0,
          opportunity.kalshiOutcome?.noPrice || 0,
        ],
      );
      return result[0].insertId;
    } catch (error) {
      console.error('Database: saveOpportunity failed:', error);
      throw error;
    }
  }

  async getOpportunities(limit = 50) {
    try {
      const results = await this.db.executeSql(
        'SELECT * FROM opportunities ORDER BY timestamp DESC LIMIT ?',
        [limit],
      );
      return this.rowsToArray(results[0]);
    } catch (error) {
      console.error('Database: getOpportunities failed:', error);
      return [];
    }
  }

  async markOpportunityExecuted(id) {
    await this.db.executeSql(
      'UPDATE opportunities SET executed = 1, executed_at = ? WHERE id = ?',
      [Date.now(), id],
    );
  }

  // ========== 交易相关操作 ==========

  async saveTrade(trade) {
    try {
      const result = await this.db.executeSql(
        'INSERT INTO trades (timestamp, opportunity_id, outcome, platform, side, contracts, price, pnl, status, order_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          trade.timestamp || Date.now(),
          trade.opportunityId,
          trade.outcome,
          trade.platform,
          trade.side,
          trade.contracts,
          trade.price,
          trade.pnl || 0,
          trade.status,
          trade.orderId,
        ],
      );
      return result[0].insertId;
    } catch (error) {
      console.error('Database: saveTrade failed:', error);
      throw error;
    }
  }

  async getTrades(limit = 50) {
    try {
      const results = await this.db.executeSql(
        'SELECT * FROM trades ORDER BY timestamp DESC LIMIT ?',
        [limit],
      );
      return this.rowsToArray(results[0]);
    } catch (error) {
      console.error('Database: getTrades failed:', error);
      return [];
    }
  }

  // ========== 统计相关操作 ==========

  async getStats() {
    try {
      const results = await this.db.executeSql(
        'SELECT COUNT(*) as totalTrades, SUM(pnl) as totalPnl, SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as wins FROM trades',
      );
      return results[0].item(0);
    } catch (error) {
      console.error('Database: getStats failed:', error);
      return {totalTrades: 0, totalPnl: 0, wins: 0};
    }
  }

  async updateStats(date) {
    const stats = await this.getStats();
    await this.db.executeSql(
      'INSERT OR REPLACE INTO stats (date, totalTrades, totalPnl, wins, updated_at) VALUES (?, ?, ?, ?, ?)',
      [date, stats.totalTrades, stats.totalPnl, stats.wins, Date.now()],
    );
  }

  // ========== 配置相关操作 ==========

  async saveConfig(key, value) {
    await this.db.executeSql(
      'INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?, ?, ?)',
      [key, value, Date.now()],
    );
  }

  async getConfig(key) {
    const results = await this.db.executeSql(
      'SELECT value FROM config WHERE key = ?',
      [key],
    );
    if (results[0].length > 0) {
      return results[0].item(0).value;
    }
    return null;
  }

  // ========== 工具方法 ==========

  rowsToArray(rows) {
    const results = [];
    for (let i = 0; i < rows.length; i++) {
      results.push(rows.item(i));
    }
    return results;
  }

  async close() {
    if (this.db) {
      await this.db.close();
      this.initialized = false;
    }
  }
}

export default new Database();
