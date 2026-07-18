export interface TraderPortfolioSummary {
    id: number;
    name: string;
    slug: string;
    provider_key: string;
    currency: string;
    value: number;
    change24h: number;
    change24h_percentage: number;
    items_count: number;
    total_invested: number;
    profit_loss: number;
    roi: number;
}

export interface CreatePortfolioDto {
    /** Portfolio name (max 100 chars). */
    name: string;
    /** Optional portfolio description (max 500 chars). */
    description?: string;
    /** Portfolio provider key, e.g. "lisskins". Required by the live Trader API. */
    provider_key: string;
}

export interface UpdatePortfolioDto {
    name?: string;
    description?: string;
}

export interface TraderPortfolioItemStats {
    holdings: number;
    avgBuyPrice: number;
    currentValue: number;
    totalInvested: number;
    realizedPL: number;
    unrealizedPL: number;
    totalProfit: number;
    roi: number;
}

/**
 * A single item within a portfolio's detail response. The live API is known to return more
 * fields in practice than the documented example (e.g. `prices`, `asset`, `metas`,
 * `portfolio_transactions`, `change_1d`/`change_7d`/`change_30d`), so this type only
 * declares the documented, guaranteed fields and allows arbitrary additional properties.
 */
export interface TraderPortfolioItem {
    id: number;
    market_hash_name: string;
    currentPrice: number;
    stats: TraderPortfolioItemStats;
    [extra: string]: unknown;
}

export interface TraderPortfolioTimePeriodStat {
    value: number;
    percentage: number;
}

export interface TraderPortfolioStats {
    totalValue: number;
    totalInvested: number;
    totalRealizedPL: number;
    totalUnrealizedPL: number;
    totalProfit: number;
    totalROI: number;
    change24h: number;
    change24hPercentage: number;
    diversificationScore: number;
    timePeriodPerformance: {
        '1w': TraderPortfolioTimePeriodStat;
        '1m': TraderPortfolioTimePeriodStat;
        '3m': TraderPortfolioTimePeriodStat;
        '6m': TraderPortfolioTimePeriodStat;
        '1y': TraderPortfolioTimePeriodStat;
    };
    monthlyPerformance: {
        averageMonthlyReturn: number;
        bestMonth: { month: string; monthName: string; changePercentage: number };
        worstMonth: { month: string; monthName: string; changePercentage: number };
    };
    weeklyPatterns: {
        bestDay: { day: string; averageChange: number };
        worstDay: { day: string; averageChange: number };
        weekendVsWeekday: { weekend: number; weekday: number };
    };
}

export interface TraderPortfolioDetail {
    portfolio: {
        id: number;
        name: string;
        slug: string;
        provider_key: string;
        currency: string;
        status: boolean;
        created_at: string;
    };
    /** Advanced analytics for the portfolio (trader tier). */
    stats: TraderPortfolioStats;
    items: TraderPortfolioItem[];
}

export type TraderPriceAlertType = 'below' | 'above' | 'change';
export type TraderNotificationMethod = 'email' | 'push' | 'any';

export interface TraderPriceAlert {
    id: number;
    asset_item: {
        id: number;
        market_hash_name: string;
        asset?: { name: string; type: string };
    };
    type: TraderPriceAlertType;
    target_price?: number;
    percentage_change?: number;
    provider_key: string;
    notification_method: TraderNotificationMethod;
    enabled: boolean;
    last_triggered_at: string | null;
    trigger_count: number;
    created_at: string;
}

export interface CreatePriceAlertDto {
    /** The asset_item id (not market_hash_name) to monitor. */
    asset_item_id: number;
    type: TraderPriceAlertType;
    /** Required for "below"/"above" alerts, in USD. */
    target_price?: number;
    /** Required for "change" alerts. */
    percentage_change?: number;
    provider_key: string;
    notification_method: TraderNotificationMethod;
    notes?: string;
}

export interface UpdatePriceAlertDto {
    type?: TraderPriceAlertType;
    target_price?: number;
    is_active?: boolean;
}

export type TraderTrendPeriod = '1d' | '7d' | '30d' | '90d';

export interface TraderTrendItem {
    id: number;
    market_hash_name: string;
    type: string;
    image: string;
    current_price: number;
    old_price: number;
    price_change: number;
    price_change_percentage: number;
}

export interface TraderTrendResponse {
    period: TraderTrendPeriod;
    items: TraderTrendItem[];
    generated_at: string;
}

export interface TraderInsightsQuery {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sort?: 'views' | 'avg_change_1d' | 'avg_change_7d' | 'avg_change_30d' | 'current_price' | 'total_items' | 'created_at';
    order?: 'ASC' | 'DESC';
}

export interface TraderInsightSummary {
    id: number;
    name: string;
    slug: string;
    description: string;
    category: string;
    stats: {
        current_price: number;
        avg_change_1d: number;
        avg_change_7d: number;
        avg_change_30d: number;
        total_items: number;
    };
    sample_images: string[];
}

export interface TraderInsightsResponse {
    data: TraderInsightSummary[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface TraderInsightDetail {
    id: number;
    name: string;
    slug: string;
    description: string;
    category: string;
    provider: string;
    filters: Record<string, unknown>;
    views: number;
    stats: {
        current_price: number;
        total_value: number;
        avg_price: number;
        highest_price: number;
        lowest_price: number;
        median_price: number;
        total_volume: number;
        total_sold: number;
        total_items: number;
        unique_items: number;
    };
    changes: { '24h': number; '7d': number; '30d': number; '60d': number; '90d': number };
    stats_updated_at: string;
    created_at: string;
    updated_at: string;
}

export interface TraderInsightChartResponse {
    slug: string;
    provider: string;
    format: string;
    /** Each entry is [timestamp, total_min, total_max, total_price, count, sold]. */
    data: Array<[number, number, number, number, number, number]>;
    generated_at: string;
}

export type TraderTransactionType = 'buy' | 'sell';

export interface CreateTransactionDto {
    /** Asset ID for the transaction (not market_hash_name). */
    asset_id: number;
    type: TraderTransactionType;
    /** Number of items (1-10000). */
    quantity: number;
    /** Price per item in USD (0-1000000). */
    price: number;
    /** Transaction date in ISO 8601 format. */
    date: string;
}

export interface UpdateTransactionDto {
    type?: TraderTransactionType;
    quantity?: number;
    price?: number;
    date?: string;
}

export interface TraderPriceItem {
    market_hash_name: string;
    prices: Array<{
        price: number;
        count: number;
        updated_at: string;
        provider_key: string;
        avg_7?: number;
        avg_30?: number;
        avg_60?: number;
        avg_90?: number;
        median_7?: number;
        median_30?: number;
        median_60?: number;
        median_90?: number;
    }>;
}

export interface TraderPricesOptions {
    /** Only "buff163" and "skins" are accepted for the trader tier item-prices endpoint. */
    sources?: Array<'buff163' | 'skins'>;
    currency?: string;
}
