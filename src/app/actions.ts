'use server';

import { getPortfolioInsights } from '@/ai/flows/portfolio-insights';

export async function generateInsightsAction() {
  try {
    const insights = await getPortfolioInsights({
      portfolio: {
        BTC: 0.5,
        ETH: 3,
        SOL: 50,
        ADA: 1000,
      },
      marketTrends:
        'Bitcoin is showing strong resistance at $52,000. Altcoins are experiencing volatility with increased trading volumes. DeFi sector continues to grow.',
      news: 'Major exchange announces support for three new tokens. Regulatory discussions about stablecoins are ongoing in the US Senate.',
      riskTolerance: 'medium',
    });
    return insights;
  } catch (error) {
    console.error('AI Insights Error:', error);
    // In a real app, you might want to throw a more specific error
    throw new Error('Failed to generate AI insights.');
  }
}
