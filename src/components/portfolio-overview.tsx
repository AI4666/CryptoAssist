
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { CryptoIcon } from './crypto-icons';

const chartData = [
  { month: 'Jan', value: 12345 },
  { month: 'Feb', value: 13579 },
  { month: 'Mar', value: 15793 },
  { month: 'Apr', value: 14234 },
  { month: 'May', value: 16890 },
  { month: 'Jun', value: 18321 },
];

const chartConfig = {
    value: {
        label: "Value",
        color: "hsl(var(--primary))",
    },
};

const assets = [
    { name: 'Bitcoin', symbol: 'BTC', value: 11987.45, allocation: '45.1%', change: '+2.5%' },
    { name: 'Ethereum', symbol: 'ETH', value: 8765.32, allocation: '32.9%', change: '+5.1%' },
    { name: 'Solana', symbol: 'SOL', value: 2543.90, allocation: '9.5%', change: '-1.2%' },
    { name: 'Cardano', symbol: 'ADA', value: 3345.12, allocation: '12.5%', change: '+0.8%' },
]

export default function PortfolioOverview() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Portfolio Overview</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold font-headline">$26,641.79</div>
        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
        <div className="h-[200px] mt-4">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${(value as number/1000)}k`} />
                  <ChartTooltip 
                      cursor={{fill: 'hsl(var(--muted))'}}
                      content={<ChartTooltipContent indicator='dot' hideLabel />}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Asset Allocation</h3>
            <div className="space-y-4">
                {assets.map(asset => (
                    <div key={asset.symbol} className="flex items-center">
                        <CryptoIcon symbol={asset.symbol} className="h-8 w-8 mr-3" />
                        <div className="flex-grow">
                            <p className="font-medium">{asset.name}</p>
                            <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                        </div>
                        <div className="text-right">
                             <p className="font-medium">${asset.value.toLocaleString()}</p>
                             <p className="text-sm text-muted-foreground">{asset.allocation}</p>
                        </div>
                         <Badge variant={asset.change.startsWith('+') ? 'default' : 'destructive'} className={`ml-4 w-16 justify-center ${asset.change.startsWith('+') ? 'bg-accent text-accent-foreground' : ''}`}>
                            {asset.change}
                        </Badge>
                    </div>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
