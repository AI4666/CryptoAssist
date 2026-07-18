'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Activity, TrendingUp, AlertTriangle, ListOrdered, Scale } from 'lucide-react';

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

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
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
            <BarChart className="mr-2 h-4 w-4" /> Statistical Model
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
            
            <div className="bg-background p-4 rounded border mb-4 text-sm overflow-auto max-h-64">
              <pre>{JSON.stringify(result.main_result, null, 2)}</pre>
            </div>
            
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
