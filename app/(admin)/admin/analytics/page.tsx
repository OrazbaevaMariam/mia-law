import { AnalyticsDashboard } from '@/app/features/admin/AnalyticsDashboard';

export default function AnalyticsPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold p-8">📊 Аналитика</h1>
            <AnalyticsDashboard />
        </div>
    );
}