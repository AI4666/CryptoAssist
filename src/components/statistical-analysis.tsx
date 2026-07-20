'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart as BarChartIcon, Activity, TrendingUp, AlertTriangle, ListOrdered, Scale } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function StatisticalAnalysis() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSkill = async (endpoint: string, inputs: any) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(`http://localhost:8000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs })
      });
      const data = await response.json();
      if (!response.ok || data.status === 'Error') {
        throw new Error(data.message || 'An error occurred while running the skill.');
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getVal = (v: any) => Array.isArray(v) ? v[0] : v;

  const renderExploreResult = (mainResult: any) => {
    if (!mainResult || !mainResult.histogram) return null;
    const chartData = mainResult.histogram.breaks.slice(0, -1).map((b: number, i: number) => ({
      range: `${b.toFixed(3)} to ${mainResult.histogram.breaks[i+1].toFixed(3)}`,
      count: mainResult.histogram.counts[i]
    }));

    return (
      <div className="space-y-6 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
            <h3 className="text-muted-foreground text-sm font-medium">Mean</h3>
            <p className="text-2xl font-bold">{getVal(mainResult.mean).toFixed(4)}</p>
          </div>
          <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
            <h3 className="text-muted-foreground text-sm font-medium">Std Dev</h3>
            <p className="text-2xl font-bold">{getVal(mainResult.sd).toFixed(4)}</p>
          </div>
          <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
            <h3 className="text-muted-foreground text-sm font-medium">Min</h3>
            <p className="text-2xl font-bold">{getVal(mainResult.min).toFixed(4)}</p>
          </div>
          <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
            <h3 className="text-muted-foreground text-sm font-medium">Max</h3>
            <p className="text-2xl font-bold">{getVal(mainResult.max).toFixed(4)}</p>
          </div>
        </div>
        <div className="h-72 w-full bg-background p-4 rounded-lg border pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" fontSize={10} angle={-25} textAnchor="end" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderCompareResult = (mainResult: any) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
          <h3 className="text-muted-foreground text-sm font-medium">Estimated Difference</h3>
          <p className="text-2xl font-bold">{getVal(mainResult.estimated_difference).toFixed(4)}</p>
        </div>
        <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
          <h3 className="text-muted-foreground text-sm font-medium">P-Value</h3>
          <p className="text-2xl font-bold">{getVal(mainResult.p_value).toFixed(4)}</p>
        </div>
        <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
          <h3 className="text-muted-foreground text-sm font-medium">Confidence Interval</h3>
          <p className="text-lg font-bold mt-1">
            [{mainResult.confidence_interval[0].toFixed(4)}, {mainResult.confidence_interval[1].toFixed(4)}]
          </p>
        </div>
      </div>
    );
  };

  const renderModelResult = (mainResult: any) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
          <h3 className="text-muted-foreground text-sm font-medium">R-Squared</h3>
          <p className="text-2xl font-bold">{getVal(mainResult.r_squared).toFixed(4)}</p>
        </div>
        <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
          <h3 className="text-muted-foreground text-sm font-medium">Adjusted R-Squared</h3>
          <p className="text-2xl font-bold">{getVal(mainResult.adj_r_squared).toFixed(4)}</p>
        </div>
      </div>
    );
  };

  const renderTrendResult = (mainResult: any) => {
    const dates = getVal(mainResult.plot_data.date) || [];
    const closes = getVal(mainResult.plot_data.close) || [];
    const ma30s = getVal(mainResult.plot_data.ma30) || [];
    
    let chartData = [];
    if (Array.isArray(dates)) {
       chartData = dates.map((d: string, i: number) => ({
         date: d,
         close: closes[i],
         ma30: ma30s[i]
       }));
    }

    return (
      <div className="space-y-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
            <h3 className="text-muted-foreground text-sm font-medium">Current Price</h3>
            <p className="text-2xl font-bold">${getVal(mainResult.current_price).toFixed(2)}</p>
          </div>
          <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
            <h3 className="text-muted-foreground text-sm font-medium">30-Day MA</h3>
            <p className="text-2xl font-bold">${getVal(mainResult.ma_30).toFixed(2)}</p>
          </div>
          <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
            <h3 className="text-muted-foreground text-sm font-medium">Trend</h3>
            <p className="text-xl font-bold mt-1 text-blue-600">{getVal(mainResult.trend)}</p>
          </div>
        </div>
        {chartData.length > 0 && (
          <div className="h-72 w-full bg-background p-4 rounded-lg border pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="close" stroke="#8884d8" dot={false} name="Close Price" />
                <Line type="monotone" dataKey="ma30" stroke="#ff7300" dot={false} name="30-Day MA" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderOutliersResult = (mainResult: any) => {
    const outliers = mainResult.outliers || [];
    return (
      <div className="space-y-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
            <h3 className="text-muted-foreground text-sm font-medium">Total Observations</h3>
            <p className="text-2xl font-bold">{getVal(mainResult.total_observations)}</p>
          </div>
          <div className="p-4 bg-background shadow-sm rounded-lg border text-center">
            <h3 className="text-muted-foreground text-sm font-medium">Outliers Detected</h3>
            <p className="text-2xl font-bold text-red-500">{getVal(mainResult.outlier_count)}</p>
          </div>
        </div>
        {outliers.length > 0 && (
          <div className="bg-background rounded-lg border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Value</th>
                  <th className="p-3">Z-Score</th>
                </tr>
              </thead>
              <tbody>
                {outliers.map((o: any, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{getVal(o.date)}</td>
                    <td className="p-3 font-medium">{getVal(o.value).toFixed(4)}</td>
                    <td className="p-3 text-red-500">{getVal(o.z_score).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderRankingResult = (mainResult: any) => {
    const ranking = mainResult.ranking || [];
    return (
      <div className="space-y-4 mb-4">
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
                  <td className="p-3 text-green-600">{getVal(r.sharpe_ratio).toFixed(4)}</td>
                  <td className="p-3">{getVal(r.mean_return).toFixed(4)}</td>
                  <td className="p-3">{getVal(r.volatility).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderResultContent = (skillName: string, mainResult: any) => {
    switch(skillName) {
      case 'explore': return renderExploreResult(mainResult);
      case 'compare': return renderCompareResult(mainResult);
      case 'model': return renderModelResult(mainResult);
      case 'trend-analysis': return renderTrendResult(mainResult);
      case 'outlier-detection': return renderOutliersResult(mainResult);
      case 'asset-ranking': return renderRankingResult(mainResult);
      default:
        return (
          <div className="bg-background p-4 rounded border mb-4 text-sm overflow-auto max-h-64">
            <pre>{JSON.stringify(mainResult, null, 2)}</pre>
          </div>
        );
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChartIcon className="h-5 w-5 text-primary" />
          Industry Statistical Assistant
        </CardTitle>
        <CardDescription>
          Run statistical models using the R Plumber API backend.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <Button onClick={() => runSkill('explore', { coin: 'BTC', variable: 'DailyReturn' })} variant="outline">
            <Activity className="mr-2 h-4 w-4" /> Explore Data
          </Button>
          <Button onClick={() => runSkill('compare', { coin1: 'BTC', coin2: 'ETH', outcome_variable: 'DailyReturn' })} variant="outline">
            <Scale className="mr-2 h-4 w-4" /> Compare Coins
          </Button>
          <Button onClick={() => runSkill('model', { coin: 'BTC', outcome_variable: 'DailyReturn', predictor_variables: ['Volume', 'MarketCap'] })} variant="outline">
            <BarChartIcon className="mr-2 h-4 w-4" /> Statistical Model
          </Button>
          <Button onClick={() => runSkill('trend', { coin: 'BTC' })} variant="outline">
            <TrendingUp className="mr-2 h-4 w-4" /> Trend Analysis
          </Button>
          <Button onClick={() => runSkill('outliers', { coin: 'ETH', variable: 'DailyReturn' })} variant="outline">
            <AlertTriangle className="mr-2 h-4 w-4" /> Outlier Detection
          </Button>
          <Button onClick={() => runSkill('ranking', {})} variant="outline">
            <ListOrdered className="mr-2 h-4 w-4" /> Asset Ranking
          </Button>
        </div>

        {loading && <p className="text-sm text-muted-foreground animate-pulse">Running analysis...</p>}
        
        {error && (
          <div className="p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
            <h3 className="font-semibold text-lg capitalize mb-2">{String(result.skill_name || '').replace('-', ' ')} Result</h3>
            <p className="text-sm text-muted-foreground mb-4"><strong>Method:</strong> {result.method}</p>
            
            {renderResultContent(String(result.skill_name), result.main_result)}
            
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 text-blue-900 rounded-md">
                <strong>Interpretation:</strong> {result.interpretation}
              </div>
              <div className="p-3 bg-amber-50 text-amber-900 rounded-md">
                <strong>Limitation:</strong> {result.limitation}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
