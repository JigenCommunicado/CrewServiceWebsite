import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

interface LogViewerProps {
  logs: LogEntry[];
  onRefresh?: () => void;
  onExport?: () => void;
}

export function LogViewer({ logs, onRefresh, onExport }: LogViewerProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'INFO':
        return 'text-chart-4';
      case 'WARN':
        return 'text-chart-3';
      case 'ERROR':
        return 'text-destructive';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-semibold">Системные логи</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            data-testid="button-refresh-logs"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExport}
            data-testid="button-export-logs"
          >
            <Download className="w-4 h-4" />
            Экспорт
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md bg-black/40 p-4">
          <div className="font-mono text-sm space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="flex gap-3" data-testid={`log-entry-${index}`}>
                <span className="text-muted-foreground text-xs">{log.timestamp}</span>
                <span className={`font-semibold ${getLevelColor(log.level)}`}>
                  [{log.level}]
                </span>
                <span className="text-foreground">{log.message}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
