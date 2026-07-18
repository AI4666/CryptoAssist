import {
  Bell,
  Bitcoin,
  CircleUser,
  Home,
  LineChart,
  Package,
  Package2,
  ShoppingCart,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';

import AiInsights from './ai-insights';
import MarketData from './market-data';
import PortfolioOverview from './portfolio-overview';
import SecureWallet from './secure-wallet';
import StatisticalAnalysis from './statistical-analysis';

export function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link href="#" className="flex items-center gap-2 text-lg font-semibold md:text-base">
            <Bitcoin className="h-6 w-6 text-primary" />
            <span className="font-headline">CryptoAssist</span>
          </Link>
          <Link href="#" className="text-foreground transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
            Wallet
          </Link>
          <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
            Markets
          </Link>
          <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
            AI Insights
          </Link>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link href="#" className="flex items-center gap-2 text-lg font-semibold">
                <Bitcoin className="h-6 w-6 text-primary" />
                <span className="sr-only">CryptoAssist</span>
              </Link>
              <Link href="#">Dashboard</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                Wallet
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                Markets
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                AI Insights
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial">
            {/* Future search bar can go here */}
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <PortfolioOverview />
          <SecureWallet />
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <MarketData />
          <AiInsights />
        </div>
        <div className="grid gap-4 md:gap-8">
          <StatisticalAnalysis />
        </div>
      </main>
    </div>
  );
}
