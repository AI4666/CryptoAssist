'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart as BarChartIcon, Activity, TrendingUp, AlertTriangle, ListOrdered, Scale } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function StatisticalAnalysis() {
  const [availableCoins, setAvailableCoins] = useState<string[]>([]);
  
  const [coin1, setCoin1] = useState('BTC');
  const [coin2, setCoin2] = useState('ETH');
  const [coin3, setCoin3] = useState('BNB');
  
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareCoin1, setCompareCoin1] = useState('BTC');
  const [compareCoin2, setCompareCoin2] = useState('ETH');
  const [trendWindow, setTrendWindow] = useState('30');
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch available coins on mount
  useEffect(() => {
    fetch('http://localhost:8000/coins')
      .then(res => {
        if (!res.ok) throw new Error("API not ready");
        return res.json();
      })
      .then(data => {
        if (data.coins) {
          setAvailableCoins(data.coins);
        } else {
          setAvailableCoins(['BTC', 'ETH', 'BNB']);
        }
      })
      .catch(err => {
        console.error("Could not fetch coins:", err);
        setAvailableCoins(['BTC', 'ETH', 'BNB']); 
      });
  }, []);

  const getVal = (v: any) => Array.isArray(v) ? v[0] : v;

  const runMarketSkill = async (skill: string, overrideWindow?: string) => {
    // Get unique, non-empty selected coins
    const selectedCoins = Array.from(new Set([coin1, coin2, coin3].filter(c => c && c !== 'none')));
    
    if (selectedCoins.length === 0) {
      setError("Please select at least one valid coin from the dropdowns.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      if (skill === 'ranking') {
        const response = await fetch(`http://localhost:8000/ranking`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputs: {} })
        });
        const data = await response.json();
        setResult({ skill_name: 'ranking', data: { all: data } });
        setLoading(false);
        return;
      }

      // Run parallel for explore, model, trend, outliers
      const promises = selectedCoins.map(coin => {
        let inputs: any = { coin: coin };
        if (skill === 'explore' || skill === 'outliers') inputs.variable = 'DailyReturn';
        if (skill === 'model') {
          inputs.outcome_variable = 'DailyReturn';
          inputs.predictor_variables = ['Volume', 'MarketCap'];
        }
        if (skill === 'trend') {
          inputs.window = overrideWindow || trendWindow;
        }
        
        return fetch(`http://localhost:8000/${skill}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputs })
        }).then(res => res.json());
      });
      
      const results = await Promise.all(promises);
      const failed = results.find(r => !r || r.status === 'Error');
      if (failed) throw new Error(failed.message || 'An error occurred in one of the models.');
      
      const combinedResults = selectedCoins.reduce((acc, coin, idx) => {
        acc[coin] = results[idx];
        return acc;
      }, {} as any);
      
      setResult({ skill_name: skill, data: combinedResults, selectedCoins });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runCompareSkill = async () => {
    if (!compareCoin1 || !compareCoin2 || compareCoin1 === 'none' || compareCoin2 === 'none' || compareCoin1 === compareCoin2) {
      setError("Please select two distinct coins to compare.");
      setIsCompareOpen(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    setIsCompareOpen(false);
    
    try {
      const response = await fetch(`http://localhost:8000/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: { coin1: compareCoin1, coin2: compareCoin2, outcome_variable: 'DailyReturn' } })
      });
      const data = await response.json();
      if (data.status === 'Error') throw new Error(data.message);
      
      setResult({ skill_name: 'compare', data: { pair: data }, selectedCoins: [compareCoin1, compareCoin2] });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatHistogramData = (hist: any) => {
    if (!hist || !hist.breaks || !hist.counts) return [];
    return hist.counts.map((count: number, i: number) => ({
      range: `${hist.breaks[i].toFixed(2)} to ${hist.breaks[i+1].toFixed(2)}`,
      count: count
    }));
  };

  const renderTrendSummary = () => {
    return (
      <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-lg p-6 shadow-sm">
         <h3 className="text-lg font-bold mb-4 flex items-center text-blue-900">
           <TrendingUp className="mr-2 h-5 w-5 text-blue-600" /> Trend Analysis Metrics Guide
         </h3>
         
         <div className="space-y-4 text-sm text-blue-900/90 leading-relaxed">
           <p className="font-semibold mb-2">This guide explains how to interpret the Moving Average (MA) chart and trend signals:</p>
           
           <div>
             <h4 className="font-bold text-base text-blue-950">1. Moving Average (MA)</h4>
             <ul className="list-disc pl-5 space-y-1">
               <li><strong>What it is:</strong> A constantly updated average price over a specific number of past days (e.g., 7 days for a week, 30 days for a month). It smooths out daily price fluctuations to reveal the underlying trend direction.</li>
               <li><strong>Timeframes:</strong> Shorter timeframes (like 7-Day) react quickly to price changes but can produce "fakeouts". Longer timeframes (like 90-Day) are slower to react but show the macro, long-term trend more reliably.</li>
             </ul>
           </div>
           
           <div>
             <h4 className="font-bold text-base text-blue-950">2. Bullish vs Bearish Signals</h4>
             <ul className="list-disc pl-5 space-y-1">
               <li><strong>Bullish (Above MA):</strong> When the current price crosses and stays above the moving average, it suggests buyers are in control and the trend is turning upward.</li>
               <li><strong>Bearish (Below MA):</strong> When the current price falls below the moving average, it suggests sellers are in control and the trend is turning downward.</li>
             </ul>
           </div>

           <div className="mt-6 pt-4 border-t border-blue-200">
             <h4 className="font-bold text-base text-blue-950">Dynamic Analysis Conclusion:</h4>
             <p className="mt-2">
               The chart plots the moving average for each coin. If a coin's price is currently above its moving average, its status will read <span className="text-green-600 font-bold">Bullish</span> below. Use the timeframe selector above the chart to see how the trend changes across different time horizons.
             </p>
           </div>
         </div>
      </div>
    );
  };

  const renderRankingSummary = (ranking: any[]) => {
    if (!ranking || ranking.length === 0) return null;

    const topCoin = getVal(ranking[0].coin);
    const topSharpe = getVal(ranking[0].sharpe_ratio).toFixed(4);
    
    let maxReturnCoin = getVal(ranking[0].coin);
    let maxReturn = getVal(ranking[0].mean_return);
    let minVolCoin = getVal(ranking[0].coin);
    let minVol = getVal(ranking[0].volatility);

    ranking.forEach(r => {
      if (getVal(r.mean_return) > maxReturn) {
        maxReturn = getVal(r.mean_return);
        maxReturnCoin = getVal(r.coin);
      }
      if (getVal(r.volatility) < minVol) {
        minVol = getVal(r.volatility);
        minVolCoin = getVal(r.coin);
      }
    });

    let interpretation = `Based on the Sharpe Ratio, ${topCoin} is currently ranked #1 with a ratio of ${topSharpe}. This means it historically provided the best return for the amount of risk taken. `;
    
    if (topCoin !== maxReturnCoin) {
      interpretation += `Interestingly, ${maxReturnCoin} actually had a higher raw return, but it is ranked lower because it took on significantly more risk (Volatility) to achieve those returns. `;
    }
    
    if (topCoin !== minVolCoin) {
       interpretation += `Meanwhile, ${minVolCoin} was the safest asset with the lowest volatility, but its returns weren't high enough to beat ${topCoin} in risk-adjusted performance. `;
    } else {
       interpretation += `Impressively, ${topCoin} also had the lowest volatility, making it the clear winner in both safety and efficiency.`;
    }

    return (
      <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-lg p-6 shadow-sm">
         <h3 className="text-lg font-bold mb-4 flex items-center text-blue-900">
           <ListOrdered className="mr-2 h-5 w-5 text-blue-600" /> Asset Ranking Metrics Guide
         </h3>
         
         <div className="space-y-4 text-sm text-blue-900/90 leading-relaxed">
           <p className="font-semibold mb-2">This guide explains the metrics used to calculate the official Asset Ranking:</p>
           
           <div>
             <h4 className="font-bold text-base text-blue-950">1. Mean Return</h4>
             <ul className="list-disc pl-5 space-y-1">
               <li><strong>What it is:</strong> The average daily profit (or loss) the coin generated.</li>
               <li><strong>Why it matters:</strong> This is your raw reward. Higher is always better, but looking at returns alone is dangerous because it ignores the risk taken to achieve them.</li>
             </ul>
           </div>
           
           <div>
             <h4 className="font-bold text-base text-blue-950">2. Volatility</h4>
             <ul className="list-disc pl-5 space-y-1">
               <li><strong>What it is:</strong> The standard deviation of the daily returns (how wild the price swings are).</li>
               <li><strong>Why it matters:</strong> This is your risk. A high volatility means the coin is a rollercoaster and susceptible to massive crashes. Lower volatility means a smoother, safer ride.</li>
             </ul>
           </div>
           
           <div>
             <h4 className="font-bold text-base text-blue-950">3. Sharpe Ratio (The Ranking Metric)</h4>
             <ul className="list-disc pl-5 space-y-1">
               <li><strong>What it is:</strong> A formula widely used in finance: <code>(Mean Return) / (Volatility)</code>.</li>
               <li><strong>Why it matters:</strong> The Sharpe Ratio tells you how much reward you are getting <em>per unit of risk</em>. It is the gold standard for comparing assets because it penalizes coins that only achieve high returns through reckless, dangerous price swings. The higher the Sharpe Ratio, the better the investment.</li>
             </ul>
           </div>

           <div className="mt-6 pt-4 border-t border-blue-200">
             <h4 className="font-bold text-base text-blue-950">Dynamic Analysis Conclusion:</h4>
             <p className="mt-2">
               {interpretation}
             </p>
           </div>
         </div>
      </div>
    );
  };

  const renderOutliersSummary = (dataObj: any) => {
    const coins = Object.keys(dataObj);
    if (coins.length === 0) return null;
    
    let mostOutliersCoin = coins[0];
    let maxOutliers = getVal(dataObj[coins[0]].main_result.outlier_count);
    let leastOutliersCoin = coins[0];
    let minOutliers = maxOutliers;
    let totalOutliers = 0;
    
    coins.forEach(c => {
      const count = getVal(dataObj[c].main_result.outlier_count);
      totalOutliers += count;
      if (count > maxOutliers) {
        maxOutliers = count;
        mostOutliersCoin = c;
      }
      if (count < minOutliers) {
        minOutliers = count;
        leastOutliersCoin = c;
      }
    });

    let interpretation = "";
    if (totalOutliers === 0) {
       interpretation = `Across your selected coins, no extreme outliers were detected during this timeframe. This suggests relatively normal market behavior without historically massive, unexpected daily crashes or spikes.`;
    } else {
       interpretation = `Among your selected coins, ${mostOutliersCoin} is the most erratic asset with ${maxOutliers} extreme price events (outliers). `;
       if (maxOutliers !== minOutliers) {
         interpretation += `In contrast, ${leastOutliersCoin} experienced the fewest extreme events (${minOutliers} outliers), making its daily returns far more predictable and less susceptible to sudden, violent market shocks.`;
       } else {
         interpretation += `All selected coins experienced a similar number of extreme events.`;
       }
    }

    return (
      <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-lg p-6 shadow-sm">
         <h3 className="text-lg font-bold mb-4 flex items-center text-blue-900">
           <AlertTriangle className="mr-2 h-5 w-5 text-blue-600" /> Outlier Detection Metrics Guide
         </h3>
         
         <div className="space-y-4 text-sm text-blue-900/90 leading-relaxed">
           <p className="font-semibold mb-2">This guide explains what Outliers are and how they measure extreme risk:</p>
           
           <div>
             <h4 className="font-bold text-base text-blue-950">1. What is an Outlier?</h4>
             <ul className="list-disc pl-5 space-y-1">
               <li>In this analysis, an outlier is defined as a daily return that is <strong>more than 3 Standard Deviations</strong> away from the coin's historical average (Z-Score &gt; 3 or &lt; -3).</li>
               <li>In a perfectly normal market, 99.7% of all daily price movements should fall within 3 standard deviations. When a movement breaks outside this bound, it's considered an extreme, statistically rare market shock (like a sudden crash or a massive pump).</li>
             </ul>
           </div>
           
           <div>
             <h4 className="font-bold text-base text-blue-950">2. Why do Outliers matter?</h4>
             <ul className="list-disc pl-5 space-y-1">
               <li>Coins with a high number of outliers are susceptible to unpredictable "Black Swan" events. Even if a coin has a good average return, a sudden extreme outlier can wipe out a portfolio.</li>
               <li>Tracking outlier frequency helps distinguish between a coin that is steadily volatile versus a coin that is normally stable but occasionally experiences violent crashes.</li>
             </ul>
           </div>

           <div className="mt-6 pt-4 border-t border-blue-200">
             <h4 className="font-bold text-base text-blue-950">Dynamic Analysis Conclusion:</h4>
             <p className="mt-2">
               {interpretation}
             </p>
           </div>
         </div>
      </div>
    );
  };

  const renderModelSummary = (dataObj: any) => {
    const coins = Object.keys(dataObj);
    if (coins.length === 0) return null;
    
    let bestCoin = coins[0];
    let maxR2 = getVal(dataObj[coins[0]].main_result.r_squared);
    
    coins.forEach(c => {
      const r2 = getVal(dataObj[c].main_result.r_squared);
      if (r2 > maxR2) {
        maxR2 = r2;
        bestCoin = c;
      }
    });

    let interpretation = "";
    if (maxR2 < 0.05) {
       interpretation = `Looking at your selected coins, even the best performing model (${bestCoin} with an R² of ${maxR2.toFixed(4)}) explains less than 5% of the variance. This indicates that the current variables (Volume and Market Cap) explain very little of the daily price movements. The low values highlight the inherent difficulty and randomness in predicting crypto asset movements with these basic features.`;
    } else if (maxR2 < 0.2) {
       interpretation = `Looking at your selected coins, the model for ${bestCoin} explains the most variance with an R² of ${maxR2.toFixed(4)}. While it captures some of the relationship, it still explains a relatively small portion (less than 20%) of the daily price movements, meaning other external factors are heavily influencing the price.`;
    } else {
       interpretation = `Looking at your selected coins, the model for ${bestCoin} performs the best, with an R² of ${maxR2.toFixed(4)}. This suggests that Volume and Market Cap explain a noticeable portion of ${bestCoin}'s daily return variability.`;
    }

    const negativeAdjCoins = coins.filter(c => getVal(dataObj[c].main_result.adj_r_squared) < 0);
    if (negativeAdjCoins.length > 0) {
      interpretation += ` Note that ${negativeAdjCoins.join(', ')} currently show a negative Adjusted R-Squared, meaning the current predictors actually fit the data slightly worse than just guessing the historical average return.`;
    }

    return (
      <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-lg p-6 shadow-sm">
         <h3 className="text-lg font-bold mb-4 flex items-center text-blue-900">
           <BarChartIcon className="mr-2 h-5 w-5 text-blue-600" /> Statistical Model Metrics Guide
         </h3>
         
         <div className="space-y-4 text-sm text-blue-900/90 leading-relaxed">
           <p className="font-semibold mb-2">This guide explains the metrics displayed in the Statistical Model section:</p>
           
           <div>
             <h4 className="font-bold text-base text-blue-950">1. R-Squared (R²)</h4>
             <ul className="list-disc pl-5 space-y-1">
               <li><strong>What it is:</strong> Also known as the Coefficient of Determination. It represents the proportion of the variance in the dependent variable (the asset's daily return) that is predictable from the independent variables (Volume and Market Cap).</li>
               <li><strong>How to interpret it:</strong> Ranges from 0 to 1 (0% to 100%). In cryptocurrency markets, prices are highly volatile, so seeing very low values (e.g., 0.0003) is common when predicting short-term movements.</li>
             </ul>
           </div>
           
           <div>
             <h4 className="font-bold text-base text-blue-950">2. Adjusted R-Squared (Adj R-Sq)</h4>
             <ul className="list-disc pl-5 space-y-1">
               <li><strong>What it is:</strong> A modified version of R-Squared adjusted for the number of predictors. It increases only if a new term improves the model more than expected by chance.</li>
               <li><strong>How to interpret it:</strong> It can occasionally be negative, which simply means the model fits the data worse than a horizontal line. Always use Adj R-Sq instead of R-Squared when comparing models with a different number of predictors.</li>
             </ul>
           </div>

           <div className="mt-6 pt-4 border-t border-blue-200">
             <h4 className="font-bold text-base text-blue-950">Dynamic Analysis Conclusion:</h4>
             <p className="mt-2">
               {interpretation}
             </p>
           </div>
         </div>
      </div>
    );
  };

  const renderExploreSummary = (dataObj: any) => {
    const coins = Object.keys(dataObj);
    if (coins.length < 2) return null;
    
    let maxMeanCoin = coins[0];
    let minMeanCoin = coins[0];
    let maxSdCoin = coins[0];
    let minSdCoin = coins[0];
    let minReturnCoin = coins[0];
    let maxReturnCoin = coins[0];
    
    coins.forEach(c => {
      const stats = dataObj[c].main_result;
      if (getVal(stats.mean) > getVal(dataObj[maxMeanCoin].main_result.mean)) maxMeanCoin = c;
      if (getVal(stats.mean) < getVal(dataObj[minMeanCoin].main_result.mean)) minMeanCoin = c;
      if (getVal(stats.sd) > getVal(dataObj[maxSdCoin].main_result.sd)) maxSdCoin = c;
      if (getVal(stats.sd) < getVal(dataObj[minSdCoin].main_result.sd)) minSdCoin = c;
      if (getVal(stats.min) < getVal(dataObj[minReturnCoin].main_result.min)) minReturnCoin = c;
      if (getVal(stats.max) > getVal(dataObj[maxReturnCoin].main_result.max)) maxReturnCoin = c;
    });
    
    return (
      <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-lg p-6 shadow-sm">
         <h3 className="text-lg font-bold mb-4 flex items-center text-blue-900">
           <Activity className="mr-2 h-5 w-5 text-blue-600" /> Executive Market Summary & Metric Guide
         </h3>
         
         <div className="space-y-4 text-sm text-blue-900/90 leading-relaxed">
           <p className="font-semibold mb-2">Here is exactly how these four metrics help you compare your selected coins based on their Daily Returns:</p>
           
           <div>
             <h4 className="font-bold text-base text-blue-950">1. Mean (Average Return)</h4>
             <ul className="list-disc pl-5 space-y-1">
               <li><strong>What it is:</strong> The mathematical average of all the daily returns.</li>
               <li><strong>How to compare:</strong> If {maxMeanCoin} has a higher Mean than {minMeanCoin}, it tells you that historically, {maxMeanCoin} has generated a higher average daily profit. This is your primary measure of <strong>historical reward</strong>.</li>
             </ul>
           </div>
           
           <div>
             <h4 className="font-bold text-base text-blue-950">2. Standard Deviation (Std Dev)</h4>
             <ul className="list-disc pl-5 space-y-1">
               <li><strong>What it is:</strong> This measures how spread out the daily returns are from the Mean. In finance, this is known as <strong>Volatility</strong> or <strong>Risk</strong>.</li>
               <li><strong>How to compare:</strong> This is arguably the most important metric in crypto! Comparing the Std Dev tells you which coin is a "safer, stable" bet (<strong>{minSdCoin}</strong>) and which is a "high-risk, high-reward" rollercoaster (<strong>{maxSdCoin}</strong>).</li>
             </ul>
           </div>

           <div>
             <h4 className="font-bold text-base text-blue-950">3. Min (Minimum)</h4>
             <ul className="list-disc pl-5 space-y-1">
               <li><strong>What it is:</strong> The single lowest (most negative) daily return in the entire dataset.</li>
               <li><strong>How to compare:</strong> This gives you a reality check on extreme risk. Comparing this across coins shows you which one crashes the hardest during market panics. In your selection, <strong>{minReturnCoin}</strong> had the worst single day crash ({getVal(dataObj[minReturnCoin].main_result.min).toFixed(4)}).</li>
             </ul>
           </div>

           <div>
             <h4 className="font-bold text-base text-blue-950">4. Max (Maximum)</h4>
             <ul className="list-disc pl-5 space-y-1">
               <li><strong>What it is:</strong> The single highest (most positive) daily return in the dataset.</li>
               <li><strong>How to compare:</strong> This shows you the extreme upside potential. In your selection, <strong>{maxReturnCoin}</strong> had the best single day jump ({getVal(dataObj[maxReturnCoin].main_result.max).toFixed(4)}).</li>
             </ul>
           </div>

           <div className="mt-6 pt-4 border-t border-blue-200">
             <h4 className="font-bold text-base text-blue-950">Dynamic Analysis Conclusion:</h4>
             <p className="mt-2">
               Looking at your selected coins side-by-side, you can observe that <strong>{maxMeanCoin}</strong> has the highest <strong>Mean</strong> and <strong>{maxReturnCoin}</strong> has the highest <strong>Max</strong> (meaning highest potential profits). However, if you look at risk, <strong>{maxSdCoin}</strong> carries the highest <strong>Std Dev</strong> and <strong>{minReturnCoin}</strong> carries the scariest <strong>Min</strong> (meaning they carry much more risk of a crash). In contrast, <strong>{minSdCoin}</strong> has proven historically to be your most stable, least volatile asset.
             </p>
           </div>
         </div>
      </div>
    );
  };

  const renderResultContent = () => {
    if (!result) return null;
    const { skill_name, data, selectedCoins } = result;

    if (skill_name === 'ranking') {
      const ranking = data.all.main_result?.ranking || [];
      return (
        <div className="space-y-4 mb-4">
          <h3 className="font-semibold text-lg border-b pb-2">Market Asset Ranking (Sharpe Ratio)</h3>
          <div className="bg-background rounded-lg border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Coin</th>
                  <th className="p-3">Sharpe Ratio</th>
                  <th className="p-3">Mean Return</th>
                  <th className="p-3">Volatility</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r: any, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="p-3 font-bold">#{getVal(r.rank)}</td>
                    <td className="p-3 font-medium">{getVal(r.coin)}</td>
                    <td className="p-3 text-green-600 font-bold">{getVal(r.sharpe_ratio).toFixed(4)}</td>
                    <td className="p-3">{getVal(r.mean_return).toFixed(4)}</td>
                    <td className="p-3">{getVal(r.volatility).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderRankingSummary(ranking)}
        </div>
      );
    }

    if (skill_name === 'compare') {
      const mainResult = data.pair.main_result;
      const coin1 = selectedCoins[0];
      const coin2 = selectedCoins[1];
      const estDiff = getVal(mainResult.estimated_difference);
      const pVal = getVal(mainResult.p_value);
      const isSignificant = pVal < 0.05;
      const betterCoin = estDiff > 0 ? coin1 : coin2;
      const worseCoin = estDiff > 0 ? coin2 : coin1;

      return (
        <div className="space-y-4 mb-4">
          <h3 className="font-semibold text-lg border-b pb-2">T-Test Comparison: {coin1} vs {coin2}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
              <h3 className="text-muted-foreground text-sm font-medium">Estimated Diff</h3>
              <p className="text-2xl font-bold">{estDiff.toFixed(4)}</p>
            </div>
            <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
              <h3 className="text-muted-foreground text-sm font-medium">P-Value</h3>
              <p className={`text-2xl font-bold ${isSignificant ? 'text-green-600' : 'text-slate-700'}`}>{pVal.toFixed(4)}</p>
            </div>
            <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
              <h3 className="text-muted-foreground text-sm font-medium">95% CI</h3>
              <p className="text-lg font-bold mt-1">
                [{mainResult.confidence_interval[0].toFixed(4)}, {mainResult.confidence_interval[1].toFixed(4)}]
              </p>
            </div>
          </div>
          <div className="p-4 bg-blue-50 text-blue-900 rounded-md border border-blue-200 mt-4">
            <strong>R Interpretation:</strong> {data.pair.interpretation}
          </div>

          <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-lg p-6 shadow-sm">
             <h3 className="text-lg font-bold mb-4 flex items-center text-blue-900">
               <Scale className="mr-2 h-5 w-5 text-blue-600" /> T-Test Summary & Metric Guide
             </h3>
             
             <div className="space-y-4 text-sm text-blue-900/90 leading-relaxed">
               <p className="font-semibold mb-2">Here is exactly how to interpret the T-Test results for {coin1} and {coin2}:</p>
               
               <div>
                 <h4 className="font-bold text-base text-blue-950">1. Estimated Diff (Difference)</h4>
                 <ul className="list-disc pl-5 space-y-1">
                   <li><strong>What it is:</strong> Simply {coin1}'s average return minus {coin2}'s average return.</li>
                   <li><strong>How to understand it:</strong> If it is negative, {coin1} is underperforming {coin2}. If it is positive, {coin1} is outperforming.</li>
                 </ul>
               </div>
               
               <div>
                 <h4 className="font-bold text-base text-blue-950">2. P-Value (The most important number!)</h4>
                 <ul className="list-disc pl-5 space-y-1">
                   <li><strong>What it is:</strong> The probability that the difference you are seeing is just a random fluke.</li>
                   <li><strong>How to understand it:</strong> If it is less than 0.05, you have found a "Statistically Significant" difference (real, not random). If it is greater than 0.05, the difference is not significant (just random market noise).</li>
                 </ul>
               </div>

               <div>
                 <h4 className="font-bold text-base text-blue-950">3. 95% CI (Confidence Interval)</h4>
                 <ul className="list-disc pl-5 space-y-1">
                   <li><strong>What it is:</strong> A range where the <em>true</em> difference between the two coins is guaranteed to lie with 95% confidence.</li>
                   <li><strong>How to understand it:</strong> If the range includes zero (e.g. [-0.01, 0.02]), there is a chance the true difference is exactly zero. If the range is entirely positive or entirely negative, it means one coin is definitively outperforming the other.</li>
                 </ul>
               </div>

               <div className="mt-6 pt-4 border-t border-blue-200">
                 <h4 className="font-bold text-base text-blue-950">Dynamic Analysis Conclusion:</h4>
                 <p className="mt-2">
                   Looking at the T-Test between <strong>{coin1}</strong> and <strong>{coin2}</strong>: The Estimated Difference is <strong>{estDiff.toFixed(4)}</strong>. 
                   Because the P-Value is <strong>{isSignificant ? 'less than 0.05, this difference IS statistically significant' : 'greater than 0.05, this difference is NOT statistically significant'}</strong>. 
                   {isSignificant 
                      ? ` This means we can be mathematically confident that ${betterCoin} truly performs differently than ${worseCoin} over this timeframe.` 
                      : ` This means any observed difference is likely just random market noise, and statistically, you should treat ${coin1} and ${coin2} as having the same performance.`}
                 </p>
               </div>
             </div>
          </div>
        </div>
      );
    }

    if (skill_name === 'trend') {
      const allDates = new Set<string>();
      let currentWindow = 30;
      Object.keys(data).forEach(coin => {
        if (data[coin]?.main_result?.window) currentWindow = data[coin].main_result.window;
        const dates = data[coin]?.main_result?.plot_data?.date || [];
        dates.forEach((d: string) => allDates.add(d));
      });
      const sortedDates = Array.from(allDates).sort();
      const chartData = sortedDates.map(date => {
        const row: any = { date };
        Object.keys(data).forEach(coin => {
          const coinData = data[coin].main_result?.plot_data;
          if (coinData && coinData.date) {
            const idx = coinData.date.indexOf(date);
            if (idx !== -1) {
              row[`${coin}_ma`] = coinData.ma_val ? coinData.ma_val[idx] : (coinData.ma30 ? coinData.ma30[idx] : null);
            }
          }
        });
        return row;
      });
      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#d0ed57'];

      return (
        <div className="space-y-4 mb-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-semibold text-lg">Unified Market Trend ({currentWindow}-Day Moving Average)</h3>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-muted-foreground">Timeframe:</label>
              <Select value={trendWindow} onValueChange={(val) => { setTrendWindow(val); runMarketSkill('trend', val); }}>
                <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7-Day (Week)</SelectItem>
                  <SelectItem value="14">14-Day (2 Weeks)</SelectItem>
                  <SelectItem value="30">30-Day (Month)</SelectItem>
                  <SelectItem value="90">90-Day (Quarter)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="h-[400px] w-full bg-background p-4 rounded-lg border pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Legend />
                {Object.keys(data).map((coin, i) => (
                  <Line key={coin} type="monotone" dataKey={`${coin}_ma`} stroke={colors[i % colors.length]} dot={false} name={`${coin} ${currentWindow}-Day MA`} strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="p-4 bg-blue-50 text-blue-900 rounded-md border border-blue-200 mt-4">
            <h4 className="font-bold mb-2 flex items-center"><Activity className="w-4 h-4 mr-2"/> Market Synthesis</h4> 
            <ul className="space-y-1 ml-6 list-disc">
              {Object.keys(data).map(coin => (
                <li key={coin}><strong>{coin}</strong>: <span className={data[coin].main_result.trend.includes('Bullish') ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{data[coin].main_result.trend}</span></li>
              ))}
            </ul>
          </div>
          
          {renderTrendSummary()}
        </div>
      );
    }

    // Generic multi-result display for Explore, Model, Outliers
    return (
      <div className="space-y-6 mb-4">
        <h3 className="font-semibold text-lg border-b pb-2 capitalize">Multi-Asset {skill_name} Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.keys(data).map(coin => {
            const mainResult = data[coin].main_result;
            return (
              <div key={coin} className="bg-background shadow-sm border rounded-lg p-5 flex flex-col">
                <h4 className="font-bold text-xl mb-4 pb-2 border-b">{coin}</h4>
                {skill_name === 'explore' && (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div><span className="text-muted-foreground block">Mean</span><strong className="text-lg">{getVal(mainResult.mean).toFixed(4)}</strong></div>
                      <div><span className="text-muted-foreground block">Std Dev</span><strong className="text-lg">{getVal(mainResult.sd).toFixed(4)}</strong></div>
                      <div><span className="text-muted-foreground block">Min</span><strong className="text-lg">{getVal(mainResult.min).toFixed(4)}</strong></div>
                      <div><span className="text-muted-foreground block">Max</span><strong className="text-lg">{getVal(mainResult.max).toFixed(4)}</strong></div>
                    </div>
                    <div className="h-[200px] w-full mb-4">
                      <h5 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Return Distribution</h5>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={formatHistogramData(mainResult.histogram)}>
                          <XAxis dataKey="range" tick={{fontSize: 10}} hide />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-900 rounded-md border border-blue-200 text-sm mt-auto">
                      <strong>Analysis:</strong> {data[coin].interpretation}
                    </div>
                  </>
                )}
                {skill_name === 'model' && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground block">R-Squared</span><strong className="text-lg">{getVal(mainResult.r_squared).toFixed(4)}</strong></div>
                    <div><span className="text-muted-foreground block">Adj R-Sq</span><strong className="text-lg">{getVal(mainResult.adj_r_squared).toFixed(4)}</strong></div>
                  </div>
                )}
                {skill_name === 'outliers' && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground block">Observations</span><strong className="text-lg">{getVal(mainResult.total_observations)}</strong></div>
                    <div><span className="text-muted-foreground block">Outliers</span><strong className="text-lg text-red-500">{getVal(mainResult.outlier_count)}</strong></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {skill_name === 'explore' && renderExploreSummary(data)}
        {skill_name === 'model' && renderModelSummary(data)}
        {skill_name === 'outliers' && renderOutliersSummary(data)}
      </div>
    );
  };

  return (
    <>
      <Card className="col-span-full shadow-md">
        <CardHeader className="bg-muted/50 border-b mb-6">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BarChartIcon className="h-6 w-6 text-primary" />
            Market Insight Dashboard
          </CardTitle>
          <CardDescription className="text-base">
            Use the three dropdowns below to select which coins you want to analyze and compare. All selected coins will be plotted on unified charts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 pb-6 border-b">
            <label className="text-sm font-semibold mb-3 block uppercase tracking-wider text-muted-foreground">Select Assets to Compare</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Asset 1</label>
                <Select value={coin1} onValueChange={setCoin1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a coin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {availableCoins.map(coin => (
                      <SelectItem key={coin} value={coin}>{coin}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Asset 2</label>
                <Select value={coin2} onValueChange={setCoin2}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a coin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {availableCoins.map(coin => (
                      <SelectItem key={coin} value={coin}>{coin}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Asset 3</label>
                <Select value={coin3} onValueChange={setCoin3}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a coin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {availableCoins.map(coin => (
                      <SelectItem key={coin} value={coin}>{coin}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            <Button onClick={() => runMarketSkill('explore')} variant={result?.skill_name === 'explore' ? 'default' : 'outline'}>
              <Activity className="mr-2 h-4 w-4" /> Explore Data
            </Button>
            <Button onClick={() => setIsCompareOpen(true)} variant={result?.skill_name === 'compare' ? 'default' : 'outline'}>
              <Scale className="mr-2 h-4 w-4" /> Run T-Test (2 Coins)
            </Button>
            <Button onClick={() => runMarketSkill('model')} variant={result?.skill_name === 'model' ? 'default' : 'outline'}>
              <BarChartIcon className="mr-2 h-4 w-4" /> Statistical Model
            </Button>
            <Button onClick={() => runMarketSkill('trend')} variant={result?.skill_name === 'trend' ? 'default' : 'outline'}>
              <TrendingUp className="mr-2 h-4 w-4" /> Trend Analysis
            </Button>
            <Button onClick={() => runMarketSkill('outliers')} variant={result?.skill_name === 'outliers' ? 'default' : 'outline'}>
              <AlertTriangle className="mr-2 h-4 w-4" /> Outlier Detection
            </Button>
            <Button onClick={() => runMarketSkill('ranking')} variant={result?.skill_name === 'ranking' ? 'default' : 'outline'}>
              <ListOrdered className="mr-2 h-4 w-4" /> Asset Ranking
            </Button>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border rounded-lg bg-muted/20">
              <Activity className="h-8 w-8 animate-pulse mb-4 text-primary" />
              <p className="animate-pulse font-medium">Running parallel statistical models in R...</p>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-200 flex items-start">
              <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="block mb-1">Execution Error</strong>
                {error}
              </div>
            </div>
          )}

          {!loading && !error && renderResultContent()}
          
        </CardContent>
      </Card>

      <Dialog open={isCompareOpen} onOpenChange={setIsCompareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run T-Test (2 Coins)</DialogTitle>
            <DialogDescription>
              Select exactly two coins from your dataset to perform a statistical hypothesis test on their daily returns.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Coin 1</label>
              <Select value={compareCoin1} onValueChange={setCompareCoin1}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableCoins.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Coin 2</label>
              <Select value={compareCoin2} onValueChange={setCompareCoin2}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableCoins.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompareOpen(false)}>Cancel</Button>
            <Button onClick={runCompareSkill}>Run Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
