import { ArrowDownLeft, ArrowUpRight, DollarSign, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CryptoIcon } from './crypto-icons';

const transactions = [
    { type: 'Received', coin: 'Bitcoin', symbol: 'BTC', amount: '+0.05 BTC', value: '+$2,500.00', date: '2 days ago' },
    { type: 'Sent', coin: 'Ethereum', symbol: 'ETH', amount: '-0.5 ETH', value: '-$1,500.00', date: '3 days ago' },
    { type: 'Received', coin: 'Solana', symbol: 'SOL', amount: '+10 SOL', value: '+$1,500.00', date: '5 days ago' },
    { type: 'Sent', coin: 'Bitcoin', symbol: 'BTC', amount: '-0.01 BTC', value: '-$500.00', date: '1 week ago' },
]

export default function SecureWallet() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Secure Wallet</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="mb-6">
            <CardDescription>Total Balance</CardDescription>
            <p className="text-4xl font-bold font-headline">$26,641.79</p>
        </div>
        <div className="flex space-x-2 mb-6">
            <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                <ArrowDownLeft className="mr-2 h-4 w-4" /> Deposit
            </Button>
            <Button variant="secondary" className="flex-1">
                <ArrowUpRight className="mr-2 h-4 w-4" /> Withdraw
            </Button>
        </div>
        <CardDescription className="mb-2">Recent Transactions</CardDescription>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx, index) => (
              <TableRow key={index}>
                <TableCell>
                    <div className="flex items-center">
                        <CryptoIcon symbol={tx.symbol} className="h-6 w-6 mr-2" />
                        <div>
                            <div className="font-medium">{tx.coin}</div>
                            <div className="text-xs text-muted-foreground">{tx.type}</div>
                        </div>
                    </div>
                </TableCell>
                <TableCell className={`text-right font-medium ${tx.value.startsWith('+') ? 'text-accent-dark' : 'text-foreground'}`}>
                    <div>{tx.amount}</div>
                    <div className="text-xs text-muted-foreground">{tx.value}</div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-xs">{tx.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
