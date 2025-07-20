// src/ai/flows/portfolio-insights.ts
'use server';
/**
 * @fileOverview Provides AI-powered insights and personalized recommendations based on user portfolios, market trends, and news.
 *
 * - getPortfolioInsights - A function that generates portfolio insights.
 * - PortfolioInsightsInput - The input type for the getPortfolioInsights function.
 * - PortfolioInsightsOutput - The return type for the getPortfolioInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PortfolioInsightsInputSchema = z.object({
  portfolio: z.record(z.number()).describe('A record of cryptocurrency holdings with ticker symbols as keys and amounts as values.'),
  marketTrends: z.string().describe('Current market trends and analysis.'),
  news: z.string().describe('Relevant cryptocurrency news headlines and summaries.'),
  riskTolerance: z.enum(['low', 'medium', 'high']).describe('The user risk tolerance.'),
});
export type PortfolioInsightsInput = z.infer<typeof PortfolioInsightsInputSchema>;

const PortfolioInsightsOutputSchema = z.object({
  summary: z.string().describe('A summary of the portfolio performance and potential risks.'),
  recommendations: z.array(z.string()).describe('Personalized recommendations for adjusting the portfolio.'),
  alerts: z.array(z.string()).describe('Important alerts based on market conditions and news.'),
  disclaimer: z.string().describe('A disclaimer stating that this is not financial advice.'),
});
export type PortfolioInsightsOutput = z.infer<typeof PortfolioInsightsOutputSchema>;

export async function getPortfolioInsights(input: PortfolioInsightsInput): Promise<PortfolioInsightsOutput> {
  return portfolioInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'portfolioInsightsPrompt',
  input: {schema: PortfolioInsightsInputSchema},
  output: {schema: PortfolioInsightsOutputSchema},
  prompt: `You are an AI assistant specializing in providing cryptocurrency portfolio insights and recommendations.

  Based on the user's portfolio, current market trends, relevant news, and risk tolerance, provide a summary of the portfolio, personalized recommendations, and important alerts.

  **Crucially, you must also provide a disclaimer.** The disclaimer should state that the information provided is for informational purposes only and does not constitute financial advice, and that users should consult with a qualified financial advisor before making any investment decisions.

  Portfolio:
  {{#each (keys portfolio)}}
    - {{this}}: {{lookup ../portfolio this}}
  {{/each}}

  Market Trends: {{{marketTrends}}}

  News: {{{news}}}

  Risk Tolerance: {{{riskTolerance}}}
  `,
});

const portfolioInsightsFlow = ai.defineFlow(
  {
    name: 'portfolioInsightsFlow',
    inputSchema: PortfolioInsightsInputSchema,
    outputSchema: PortfolioInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
