import { BaseClient } from './base';
import { TraderClient } from './trader';
import { ItemPriceResponse, ItemMeta, V4Options } from '../types';

export class V4Client extends BaseClient {
    /** Self-account-scoped Trader Portfolio API (`/v4/trader/*`). See TraderClient for details. */
    public readonly trader: TraderClient;

    constructor(apiKey: string, baseURL?: string) {
        super(apiKey, baseURL || 'https://api.pricempire.com/v4/paid');
        // Trader endpoints live under /v4/trader, a sibling of /v4/paid, so they get their
        // own BaseClient instance with their own base URL rather than reusing this.client.
        this.trader = new TraderClient(apiKey);
    }

    async getPrices(options: V4Options = {}): Promise<ItemPriceResponse[]> {
        const { data } = await this.client.get('/items/prices', {
            params: {
                currency: options.currency || 'USD',
                sources: options.sources || ['buff163', 'steam'],
                app_id: options.app_id || 730,
                avg: options.avg || false,
                inflation_threshold: options.inflation_threshold || 30,
                metas: options.metas || []
            }
        });
        return data;
    }

    async getItemMetas(): Promise<ItemMeta[]> {
        const { data } = await this.client.get('/items/metas');
        return data;
    }

    async getItems(options: V4Options = {}): Promise<any> {
        const { data } = await this.client.get('/items', {
            params: {
                language: options.language || 'en'
            }
        });
        return data;
    }

    async getItemImages(): Promise<Record<string, { steam: string; cdn: string }>> {
        const { data } = await this.client.get('/items/images');
        return data;
    }
}