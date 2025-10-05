import { SystemMonitoring } from '../SystemMonitoring';
import { Cpu, HardDrive, Activity, Database } from 'lucide-react';

// todo: remove mock functionality
const mockMetrics = [
  { label: 'Загрузка CPU', value: 45, icon: Cpu, status: 'healthy' as const },
  { label: 'Использование памяти', value: 72, icon: Activity, status: 'warning' as const },
  { label: 'Диск', value: 89, icon: HardDrive, status: 'critical' as const },
  { label: 'База данных', value: 34, icon: Database, status: 'healthy' as const },
];

export default function SystemMonitoringExample() {
  return (
    <div className="p-4">
      <SystemMonitoring metrics={mockMetrics} />
    </div>
  );
}
