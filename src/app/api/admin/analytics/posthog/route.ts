import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PostHogAnalyticsService } from '@/lib/services/posthog-analytics.service';

export async function GET() {
    // Multi-Authentication validation
    const session = await getServerSession(authOptions);
    
    // Check standard Auth && Check Admin Role Auth
    if (!session?.user || !['admin', 'supervisor'].includes((session.user as any).role)) {
        return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    try {
        // Fetch all requested queries in parallel
        const [visits, uniqueVisitors, sources, errorRates, trafficGrowth] = await Promise.all([
            PostHogAnalyticsService.getVisits(),
            PostHogAnalyticsService.getUniqueVisitors(),
            PostHogAnalyticsService.getSources(),
            PostHogAnalyticsService.getErrorRates(),
            PostHogAnalyticsService.getTrafficGrowth()
        ]);

        return NextResponse.json({
            success: true,
            data: {
                visits,
                uniqueVisitors,
                sources,
                errorRates,
                trafficGrowth
            }
        });
    } catch (error: any) {
        console.error('PostHog Analytics Route Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Failed to fetch analytics data' 
        }, { status: 500 });
    }
}
