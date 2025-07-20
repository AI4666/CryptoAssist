import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { CryptoIcon } from './crypto-icons';
import { Alert, AlertDescription } from './ui/alert';

const marketData = [
  { symbol: 'BTC', name: 'Bitcoin', price: '$50,123.45', change: '+2.5%', marketCap: '$980.5B' },
  { symbol: 'ETH', name: 'Ethereum', price: '$3,012.89', change: '+5.1%', marketCap: '$360.2B' },
  { symbol: 'SOL', name: 'Solana', price: '$150.76', change: '-1.2%', marketCap: '$68.1B' },
  { symbol: 'ADA', name: 'Cardano', price: '$0.45', change: '+0.8%', marketCap: '$16.2B' },
  { symbol: 'DOGE', name: 'Dogecoin', price: '$0.15', change: '-3.4%', marketCap: '$21.7B' },
];

export default function MarketData() {
  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Market Data</CardTitle>
        <CardDescription>Real-time cryptocurrency prices and market trends.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>24h Change</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marketData.map((coin) => (
              <TableRow key={coin.symbol}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <CryptoIcon symbol={coin.symbol} className="h-6 w-6" />
                    <div>
                      <div className="font-medium">{coin.name}</div>
                      <div className="text-sm text-muted-foreground">{coin.symbol}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{coin.price}</TableCell>
                <TableCell>
                  <div className={`flex items-center gap-1 ${coin.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {coin.change.startsWith('+') ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {coin.change}
                  </div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{coin.marketCap}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Alert className="mt-6 bg-gray-50 border-gray-200">
            <Info className="h-4 w-4 text-gray-600" />
            <AlertDescription className="text-gray-700 text-xs">
                The data displayed is for informational purposes only and does not constitute investment advice. Prices are indicative and may not be real-time.
            </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
