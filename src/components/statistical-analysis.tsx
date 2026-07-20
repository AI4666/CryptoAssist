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

  const runMarketSkill = async (skill: string) => {
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
        </div>
      );
    }

    if (skill_name === 'compare') {
      const mainResult = data.pair.main_result;
      return (
        <div className="space-y-4 mb-4">
          <h3 className="font-semibold text-lg border-b pb-2">T-Test Comparison: {selectedCoins[0]} vs {selectedCoins[1]}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
              <h3 className="text-muted-foreground text-sm font-medium">Estimated Diff</h3>
              <p className="text-2xl font-bold">{getVal(mainResult.estimated_difference).toFixed(4)}</p>
            </div>
            <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
              <h3 className="text-muted-foreground text-sm font-medium">P-Value</h3>
              <p className="text-2xl font-bold">{getVal(mainResult.p_value).toFixed(4)}</p>
            </div>
            <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
              <h3 className="text-muted-foreground text-sm font-medium">95% CI</h3>
              <p className="text-lg font-bold mt-1">
                [{mainResult.confidence_interval[0].toFixed(4)}, {mainResult.confidence_interval[1].toFixed(4)}]
              </p>
            </div>
          </div>
          <div className="p-4 bg-blue-50 text-blue-900 rounded-md border border-blue-200 mt-4">
            <strong>Interpretation:</strong> {data.pair.interpretation}
          </div>
        </div>
      );
    }

    if (skill_name === 'trend') {
      const allDates = new Set<string>();
      Object.keys(data).forEach(coin => {
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
            if (idx !== -1) row[`${coin}_ma30`] = coinData.ma30[idx];
          }
        });
        return row;
      });
      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#d0ed57'];

      return (
        <div className="space-y-4 mb-4">
          <h3 className="font-semibold text-lg border-b pb-2">Unified Market Trend (30-Day Moving Average)</h3>
          <div className="h-[400px] w-full bg-background p-4 rounded-lg border pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Legend />
                {Object.keys(data).map((coin, i) => (
                  <Line key={coin} type="monotone" dataKey={`${coin}_ma30`} stroke={colors[i % colors.length]} dot={false} name={`${coin} 30-Day MA`} strokeWidth={2} />
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
