import { MetricCard } from '../MetricCard';
import { Users, Activity, Database, TrendingUp } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-4">
      <MetricCard
        title="Всего пользователей"
        value="2,847"
        icon={Users}
        trend={{ value: 12.5, isPositive: true }}
      />
      <MetricCard
        title="Активных сессий"
        value="1,234"
        icon={Activity}
        trend={{ value: 8.2, isPositive: true }}
      />
      <MetricCard
        title="Размер БД"
        value="45.2 GB"
        icon={Database}
        trend={{ value: 3.1, isPositive: false }}
      />
      <MetricCard
        title="Конверсия"
        value="64.3%"
        icon={TrendingUp}
        trend={{ value: 2.4, isPositive: true }}
      />
    </div>
  );
}
