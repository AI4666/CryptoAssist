
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
import { Copy } from 'lucide-react';
import Image from 'next/image';

export function ReceiveDialog({ children }: { children: React.ReactNode }) {
  const walletAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receive Funds</DialogTitle>
          <DialogDescription>
            Share your address or QR code to receive cryptocurrency into your wallet.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-white rounded-lg">
                <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${walletAddress}`}
                    alt="Wallet QR Code"
                    width={180}
                    height={180}
                />
            </div>
            <div className="w-full space-y-2">
                <Label htmlFor="wallet-address">Your Wallet Address</Label>
                <div className="flex items-center space-x-2">
                <Input id="wallet-address" value={walletAddress} readOnly />
                <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(walletAddress)}>
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy Address</span>
                </Button>
                </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
            <p className="text-xs text-muted-foreground">Only send assets compatible with this address.</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
