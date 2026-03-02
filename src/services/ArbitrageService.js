// src/services/ArbitrageService.js

/**
 * 套利计算服务
 */
class ArbitrageService {
  /**
   * 计算套利机会
   */
  calculate(match) {
    const {polymarket, kalshi} = match;

    // 策略 1: 买 Poly YES + 买 Kalshi NO
    const strategy1Cost = polymarket.yesPrice + kalshi.noPrice;
    const strategy1Profit = 100 - strategy1Cost;

    // 策略 2: 买 Poly NO + 买 Kalshi YES
    const strategy2Cost = kalshi.yesPrice + polymarket.noPrice;
    const strategy2Profit = 100 - strategy2Cost;

    let bestStrategy = null;

    if (strategy1Profit > 0 && strategy1Profit >= strategy2Profit) {
      bestStrategy = {
        type: 'STRATEGY_1',
        description: `Buy YES on Polymarket (${polymarket.yesPrice}¢), Buy NO on Kalshi (${kalshi.noPrice}¢)`,
        polymarketSide: 'YES',
        kalshiSide: 'NO',
        totalCost: strategy1Cost,
        profit: strategy1Profit,
        roi: (strategy1Profit / strategy1Cost) * 100,
      };
    } else if (strategy2Profit > 0) {
      bestStrategy = {
        type: 'STRATEGY_2',
        description: `Buy YES on Kalshi (${kalshi.yesPrice}¢), Buy NO on Polymarket (${polymarket.noPrice}¢)`,
        polymarketSide: 'NO',
        kalshiSide: 'YES',
        totalCost: strategy2Cost,
        profit: strategy2Profit,
        roi: (strategy2Profit / strategy2Cost) * 100,
      };
    }

    if (!bestStrategy) {
      return null;
    }

    return {
      outcome: polymarket.title,
      similarity: match.similarity,
      ...bestStrategy,
      polymarketOutcome: polymarket,
      kalshiOutcome: kalshi,
      timestamp: Date.now(),
    };
  }

  /**
   * 寻找套利机会
   */
  findOpportunities(matches, minProfit = 1) {
    const opportunities = [];

    for (const match of matches) {
      const arb = this.calculate(match);
      if (arb && arb.profit >= minProfit) {
        opportunities.push(arb);
      }
    }

    // 按利润降序排序
    opportunities.sort((a, b) => b.profit - a.profit);

    return opportunities;
  }

  /**
   * 获取最佳机会
   */
  getBestOpportunity(opportunities) {
    return opportunities.length > 0 ? opportunities[0] : null;
  }
}

export default new ArbitrageService();
