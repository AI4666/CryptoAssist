'use client';
import { useState } from 'react';
import { type PortfolioInsightsOutput } from '@/ai/flows/portfolio-insights';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Lightbulb, Loader2, Sparkles, ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { generateInsightsAction } from '@/app/actions';

export default function AiInsights() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<PortfolioInsightsOutput | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    setInsights(null);
    try {
      const result = await generateInsightsAction();
      setInsights(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate AI insights. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>AI-Powered Insights</CardTitle>
          <CardDescription>Personalized analysis of your portfolio.</CardDescription>
        </div>
        <Sparkles className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent>
        {!insights && !loading && (
          <div className="flex flex-col items-center justify-center text-center h-64">
            <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">Get AI-driven recommendations based on your holdings and market data.</p>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        )}
        {loading && (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Analyzing your portfolio...</p>
            </div>
        )}
        {insights && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Summary</h3>
              </div>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{insights.summary}</p>
            </div>
            
            <Separator />

            <div>
              <div className="flex items-center gap-3 mb-2">
                <ThumbsUp className="h-5 w-5 text-accent" />
                <h3 className="text-lg font-semibold">Recommendations</h3>
              </div>
              <ul className="space-y-2 list-disc list-inside text-sm">
                {insights.recommendations.map((rec, index) => (
                  <li key={index} className="text-muted-foreground">{rec}</li>
                ))}
              </ul>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <h3 className="text-lg font-semibold">Alerts</h3>
              </div>
              <ul className="space-y-2 list-disc list-inside text-sm">
                {insights.alerts.map((alert, index) => (
                  <li key={index} className="text-muted-foreground">{alert}</li>
                ))}
              </ul>
            </div>
            
            <Button onClick={handleGenerate} disabled={loading} variant="outline" className="w-full mt-4">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                'Regenerate Insights'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
