import { BaseClient } from './base';
import {
    TraderPortfolioSummary,
    CreatePortfolioDto,
    UpdatePortfolioDto,
    TraderPortfolioDetail,
    TraderPriceAlert,
    CreatePriceAlertDto,
    UpdatePriceAlertDto,
    TraderTrendPeriod,
    TraderTrendResponse,
    TraderInsightsQuery,
    TraderInsightsResponse,
    TraderInsightDetail,
    TraderInsightChartResponse,
    CreateTransactionDto,
    UpdateTransactionDto,
    TraderPriceItem,
    TraderPricesOptions,
} from '../types';

/**
 * Client for Pricempire's "Trader" API (`/v4/trader/*`, trader-tier subscription required).
 *
 * This covers portfolio tracking (with buy/sell transactions and P&L analytics), price
 * alerts, trending/declining item lists, market "insights", and a Buff163/Skins.com-only
 * price feed. None of this is implemented by the upstream `@pricempire/api` package
 * (verified against both the published npm package and this repo's own history) — see
 * https://pricempire.com/docs for the full OpenAPI reference this client was built from.
 */
export class TraderClient extends BaseClient {
    constructor(apiKey: string, baseURL?: string) {
        super(apiKey, baseURL || 'https://api.pricempire.com/v4/trader');
    }

    // ---- Portfolios ---------------------------------------------------------------

    /** List all portfolios (with summary stats) for the account tied to the API key. */
    async getPortfolios(): Promise<TraderPortfolioSummary[]> {
        const { data } = await this.client.get('/portfolios');
        return data;
    }

    /** Create a new portfolio. */
    async createPortfolio(dto: CreatePortfolioDto): Promise<TraderPortfolioSummary> {
        const { data } = await this.client.post('/portfolios', dto);
        return data;
    }

    /**
     * Get full item-level detail plus advanced analytics (diversification score,
     * time-period performance, monthly/weekly patterns) for a single portfolio.
     * Identified by its slug (not its numeric id — the detail route is slug-scoped).
     */
    async getPortfolioDetails(slug: string): Promise<TraderPortfolioDetail> {
        const { data } = await this.client.get(`/portfolios/${encodeURIComponent(slug)}`);
        return data;
    }

    /** Get AI-powered buy/sell signals for all items in a portfolio. */
    async getPortfolioSignals(slug: string): Promise<unknown> {
        const { data } = await this.client.get(`/portfolios/${encodeURIComponent(slug)}/signals`);
        return data;
    }

    /** Update a portfolio's name/description. Note: keyed by numeric portfolio id, not slug. */
    async updatePortfolio(id: number, dto: UpdatePortfolioDto): Promise<{ success: boolean }> {
        const { data } = await this.client.put(`/portfolios/${id}`, dto);
        return data;
    }

    /** Delete a portfolio and all associated data. Note: keyed by numeric portfolio id, not slug. */
    async deletePortfolio(id: number): Promise<{ success: boolean }> {
        const { data } = await this.client.delete(`/portfolios/${id}`);
        return data;
    }

    /** Export a portfolio's full data (transactions + analytics) as JSON. */
    async exportPortfolio(slug: string): Promise<unknown> {
        const { data } = await this.client.get(`/portfolios/${encodeURIComponent(slug)}/export`);
        return data;
    }

    // ---- Transactions ---------------------------------------------------------------

    /** Add a buy or sell transaction to a portfolio (identified by slug). */
    async addTransaction(slug: string, dto: CreateTransactionDto): Promise<unknown> {
        const { data } = await this.client.post(`/portfolios/${encodeURIComponent(slug)}/transactions`, dto);
        return data;
    }

    /** Update an existing transaction in a portfolio. */
    async updateTransaction(slug: string, transactionId: number, dto: UpdateTransactionDto): Promise<unknown> {
        const { data } = await this.client.put(
            `/portfolios/${encodeURIComponent(slug)}/transactions/${transactionId}`,
            dto,
        );
        return data;
    }

    /** Delete a transaction from a portfolio's history. */
    async deleteTransaction(slug: string, transactionId: number): Promise<{ success: boolean }> {
        const { data } = await this.client.delete(`/portfolios/${encodeURIComponent(slug)}/transactions/${transactionId}`);
        return data;
    }

    // ---- Price alerts ---------------------------------------------------------------

    /** Get all price alerts for the authenticated user. Trader tier has unlimited alerts. */
    async getPriceAlerts(): Promise<TraderPriceAlert[]> {
        const { data } = await this.client.get('/alerts');
        return data;
    }

    /** Create a new price alert (below/above/percentage-change). */
    async createPriceAlert(dto: CreatePriceAlertDto): Promise<TraderPriceAlert> {
        const { data } = await this.client.post('/alerts', dto);
        return data;
    }

    /** Update an existing price alert (e.g. to enable/disable it). */
    async updatePriceAlert(id: number, dto: UpdatePriceAlertDto): Promise<TraderPriceAlert> {
        const { data } = await this.client.put(`/alerts/${id}`, dto);
        return data;
    }

    /** Permanently delete a price alert. */
    async deletePriceAlert(id: number): Promise<{ success: boolean }> {
        const { data } = await this.client.delete(`/alerts/${id}`);
        return data;
    }

    // ---- Market movers ---------------------------------------------------------------

    /** Get the top 100 trending items (largest price increases) for a given time period. */
    async getTrendingItems(period: TraderTrendPeriod = '7d', limit = 100): Promise<TraderTrendResponse> {
        const { data } = await this.client.get('/trending', { params: { period, limit } });
        return data;
    }

    /** Get the top 100 declining items (largest price decreases) for a given time period. */
    async getDecliningItems(period: TraderTrendPeriod = '7d', limit = 100): Promise<TraderTrendResponse> {
        const { data } = await this.client.get('/declining', { params: { period, limit } });
        return data;
    }

    // ---- Insights ---------------------------------------------------------------

    /**
     * Browse curated market "insights" (e.g. "All Knives", "Covert Rifles") with
     * aggregated price/volume stats and change percentages.
     */
    async getInsights(query: TraderInsightsQuery = {}): Promise<TraderInsightsResponse> {
        const { data } = await this.client.get('/insights', { params: query });
        return data;
    }

    /** Get detailed stats and price changes (24h/7d/30d/60d/90d) for a single insight. */
    async getInsight(slug: string): Promise<TraderInsightDetail> {
        const { data } = await this.client.get(`/insights/${encodeURIComponent(slug)}`);
        return data;
    }

    /**
     * Get historical daily chart data for an insight. Each data point is
     * `[timestamp, total_min, total_max, total_price, count, sold]`.
     */
    async getInsightChart(slug: string, provider?: string): Promise<TraderInsightChartResponse> {
        const { data } = await this.client.get(`/insights/${encodeURIComponent(slug)}/chart`, {
            params: provider ? { provider } : undefined,
        });
        return data;
    }

    // ---- Prices ---------------------------------------------------------------

    /**
     * Get current prices from buff163/buff163_buy/buffmarket/skins.com only (trader tier's
     * item-prices endpoint is more limited in sources than the paid v4 `/items/prices`).
     */
    async getPrices(options: TraderPricesOptions = {}): Promise<TraderPriceItem[]> {
        const { data } = await this.client.get('/items/prices', {
            params: {
                sources: options.sources ?? ['buff163', 'skins'],
                currency: options.currency ?? 'USD',
            },
        });
        return data;
    }
}
