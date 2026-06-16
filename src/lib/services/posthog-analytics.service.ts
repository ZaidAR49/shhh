export class PostHogAnalyticsService {
    private static cachedProjectId: string | null = null;
    private static baseUrl = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';
    private static personalApiKey = process.env.POSTHOG_PERSONAL_API;

    /**
     * Gets the Project ID. Fetches it from the PostHog API on the first run and caches it in memory.
     */
    private static async getProjectId(): Promise<string> {
        if (this.cachedProjectId) {
            return this.cachedProjectId;
        }

        if (!this.personalApiKey) {
            throw new Error("POSTHOG_PERSONAL_API is missing from environment variables.");
        }

        const res = await fetch(`${this.baseUrl}/api/projects/`, {
            headers: {
                'Authorization': `Bearer ${this.personalApiKey}`,
                'Content-Type': 'application/json'
            },
            // Cache fetching project id for an hour
            next: { revalidate: 3600 }
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch PostHog project ID: ${res.statusText}`);
        }

        const data = await res.json();
        
        if (!data?.results?.length) {
            throw new Error("No PostHog projects found for this Personal API Key.");
        }

        // We assume the first project is the active one
        this.cachedProjectId = data.results[0].id.toString();
        return this.cachedProjectId as string;
    }

    /**
     * Base query method for standardizing API calls to the PostHog Modern Query API.
     * @param queryPayload The TrendsQuery payload
     * @returns The raw PostHog API response
     */
    private static async query(queryPayload: any) {
        const projectId = await this.getProjectId();

        const res = await fetch(`${this.baseUrl}/api/projects/${projectId}/query/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.personalApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: {
                    kind: 'TrendsQuery',
                    ...queryPayload
                }
            }),
            // Revalidate analytics data every 10 minutes
            next: { revalidate: 600 }
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('PostHog API Error:', errorText);
            throw new Error(`PostHog API Error: ${res.statusText}`);
        }

        return res.json();
    }

    /**
     * Gets the total number of visits (pageviews) in the last 30 days.
     */
    static async getVisits() {
        const data = await this.query({
            series: [{ kind: 'EventsNode', event: '$pageview', math: 'total' }],
            dateRange: { date_from: '-30d' }
        });
        
        const result = data.results?.[0];
        
        return {
            total: result?.count || 0,
            timeline: result?.data || [],
            labels: result?.labels || []
        };
    }

    /**
     * Gets the Daily Active Users (unique visitors) in the last 30 days.
     */
    static async getUniqueVisitors() {
        const data = await this.query({
            series: [{ kind: 'EventsNode', event: '$pageview', math: 'dau' }],
            dateRange: { date_from: '-30d' }
        });

        const result = data.results?.[0];

        return {
            total: result?.count || 0,
            timeline: result?.data || [],
            labels: result?.labels || []
        };
    }

    /**
     * Gets a breakdown of where visits are coming from (Top 10 Referrers & Countries).
     */
    static async getSources() {
        const [referrersRes, countriesRes] = await Promise.all([
            this.query({
                series: [{ kind: 'EventsNode', event: '$pageview', math: 'total' }],
                breakdownFilter: { breakdown: '$referrer', breakdown_type: 'event' },
                dateRange: { date_from: '-30d' }
            }),
            this.query({
                series: [{ kind: 'EventsNode', event: '$pageview', math: 'total' }],
                breakdownFilter: { breakdown: '$geoip_country_name', breakdown_type: 'event' },
                dateRange: { date_from: '-30d' }
            })
        ]);

        const formatBreakdown = (res: any) => {
            return (res.results || [])
                .map((item: any) => ({
                    name: item.breakdown_value || 'Direct / None',
                    count: item.count || 0
                }))
                .filter((item: any) => item.count > 0)
                .sort((a: any, b: any) => b.count - a.count)
                .slice(0, 10);
        };

        return {
            referrers: formatBreakdown(referrersRes),
            countries: formatBreakdown(countriesRes)
        };
    }

    /**
     * Calculates the error rate by comparing exception events to total pageviews in the last 30 days.
     */
    static async getErrorRates() {
        const data = await this.query({
            series: [
                { kind: 'EventsNode', event: '$pageview', math: 'total' },
                { kind: 'EventsNode', event: '$exception', math: 'total' }
            ],
            dateRange: { date_from: '-30d' }
        });

        const pageviews = data.results?.find((r: any) => r.action?.id === '$pageview')?.count || 0;
        const exceptions = data.results?.find((r: any) => r.action?.id === '$exception')?.count || 0;

        const rate = pageviews > 0 ? (exceptions / pageviews) * 100 : 0;

        return {
            totalErrors: exceptions,
            errorRatePercentage: parseFloat(rate.toFixed(2))
        };
    }

    /**
     * Calculates website traffic growth compared to the previous period (e.g. 7 days vs previous 7 days).
     */
    static async getTrafficGrowth() {
        const data = await this.query({
            series: [{ kind: 'EventsNode', event: '$pageview', math: 'total' }],
            dateRange: { date_from: '-7d' },
            compareFilter: { compare: true }
        });

        // The result will have two items: current period and previous period
        const currentPeriod = data.results?.find((r: any) => r.compare_label === 'current')?.count || 0;
        const previousPeriod = data.results?.find((r: any) => r.compare_label === 'previous')?.count || 0;

        let growthPercentage = 0;
        if (previousPeriod > 0) {
            growthPercentage = ((currentPeriod - previousPeriod) / previousPeriod) * 100;
        } else if (currentPeriod > 0) {
            growthPercentage = 100; // From 0 to something is 100% growth
        }

        return {
            currentPeriodTotal: currentPeriod,
            previousPeriodTotal: previousPeriod,
            growthPercentage: parseFloat(growthPercentage.toFixed(2)),
            isPositive: growthPercentage >= 0
        };
    }
}
