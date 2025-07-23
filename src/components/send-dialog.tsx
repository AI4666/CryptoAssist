
'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CryptoIcon } from './crypto-icons';

export function SendDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Cryptocurrency</DialogTitle>
          <DialogDescription>Enter the details below to send funds from your wallet.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="asset" className="text-right">
              Asset
            </Label>
            <Select>
              <SelectTrigger id="asset" className="col-span-3">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="btc">
                  <div className="flex items-center gap-2">
                    <CryptoIcon symbol="BTC" className="h-5 w-5" />
                    Bitcoin (BTC)
                  </div>
                </SelectItem>
                <SelectItem value="eth">
                  <div className="flex items-center gap-2">
                    <CryptoIcon symbol="ETH" className="h-5 w-5" />
                    Ethereum (ETH)
                  </div>
                </SelectItem>
                <SelectItem value="sol">
                  <div className="flex items-center gap-2">
                    <CryptoIcon symbol="SOL" className="h-5 w-5" />
                    Solana (SOL)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Recipient
            </Label>
            <Input id="address" placeholder="Enter recipient address" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input id="amount" placeholder="0.00" type="number" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" className="w-full">
            Review Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
