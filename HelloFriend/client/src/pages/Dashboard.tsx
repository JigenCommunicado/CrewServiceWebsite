import { MetricCard } from "@/components/MetricCard";
import { ChartCard } from "@/components/ChartCard";
import { SystemMonitoring } from "@/components/SystemMonitoring";
import { LogViewer } from "@/components/LogViewer";
import { Users, Activity, Database, TrendingUp, Cpu, HardDrive } from "lucide-react";

// todo: remove mock functionality
const mockChartData = [
  { name: 'Пн', value: 120 },
  { name: 'Вт', value: 190 },
  { name: 'Ср', value: 150 },
  { name: 'Чт', value: 220 },
  { name: 'Пт', value: 280 },
  { name: 'Сб', value: 310 },
  { name: 'Вс', value: 260 },
];

const mockMetrics = [
  { label: 'Загрузка CPU', value: 45, icon: Cpu, status: 'healthy' as const },
  { label: 'Использование памяти', value: 72, icon: Activity, status: 'warning' as const },
  { label: 'Диск', value: 89, icon: HardDrive, status: 'critical' as const },
  { label: 'База данных', value: 34, icon: Database, status: 'healthy' as const },
];

const mockLogs = [
  { timestamp: '10:23:45', level: 'INFO' as const, message: 'Сервер запущен на порту 5000' },
  { timestamp: '10:24:12', level: 'INFO' as const, message: 'Подключение к базе данных установлено' },
  { timestamp: '10:25:33', level: 'WARN' as const, message: 'Высокая загрузка CPU: 85%' },
  { timestamp: '10:26:01', level: 'INFO' as const, message: 'Новый пользователь зарегистрирован' },
  { timestamp: '10:27:18', level: 'ERROR' as const, message: 'Ошибка при обработке запроса: timeout' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Обзор ключевых метрик и состояния системы
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard
          title="Активность пользователей"
          description="Количество активных пользователей за последнюю неделю"
          data={mockChartData}
        />
        <div>
          <h2 className="text-lg font-semibold mb-4">Мониторинг системы</h2>
          <SystemMonitoring metrics={mockMetrics} />
        </div>
      </div>

      <LogViewer
        logs={mockLogs}
        onRefresh={() => console.log('Refresh logs')}
        onExport={() => console.log('Export logs')}
      />
    </div>
  );
}
