import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Cpu, HardDrive, Activity, Database } from "lucide-react";

interface SystemMetric {
  label: string;
  value: number;
  icon: React.ElementType;
  status: 'healthy' | 'warning' | 'critical';
}

interface SystemMonitoringProps {
  metrics: SystemMetric[];
}

export function SystemMonitoring({ metrics }: SystemMonitoringProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-chart-2';
      case 'warning':
        return 'text-chart-3';
      case 'critical':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'critical':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} data-testid={`card-metric-${metric.label.toLowerCase()}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <Icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                  {metric.value}%
                </span>
                <Badge variant={getStatusVariant(metric.status)}>
                  {metric.status === 'healthy' ? 'Норма' : metric.status === 'warning' ? 'Внимание' : 'Критично'}
                </Badge>
              </div>
              <Progress value={metric.value} className="h-2" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
