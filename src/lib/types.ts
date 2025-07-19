export interface Coin {
    symbol: string;
    name: string;
    price: string;
    change: string;
    marketCap: string;
}

export interface Transaction {
    type: 'Received' | 'Sent';
    coin: string;
    symbol: string;
    amount: string;
    value: string;
    date: string;
}

export interface PortfolioAsset {
    name: string;
    symbol: string;
    value: number;
    allocation: string;
    change: string;
}
