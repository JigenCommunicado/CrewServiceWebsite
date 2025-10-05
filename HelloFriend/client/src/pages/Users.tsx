import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

// todo: remove mock functionality
const mockUsers = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `Пользователь ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? 'Админ' : i % 2 === 0 ? 'Модератор' : 'Пользователь',
  status: i % 4 === 0 ? 'Заблокирован' : 'Активен',
  registeredAt: new Date(2024, 0, i + 1).toLocaleDateString('ru-RU'),
}));

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Имя' },
  { key: 'email', label: 'Email' },
  { 
    key: 'role', 
    label: 'Роль',
    render: (value: string) => (
      <Badge variant={value === 'Админ' ? 'default' : 'secondary'}>
        {value}
      </Badge>
    )
  },
  { 
    key: 'status', 
    label: 'Статус',
    render: (value: string) => (
      <Badge variant={value === 'Активен' ? 'default' : 'destructive'}>
        {value}
      </Badge>
    )
  },
  { key: 'registeredAt', label: 'Дата регистрации' },
];

export default function Users() {
  const handleAction = (action: string, row: any) => {
    console.log(`${action} triggered for user:`, row);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Пользователи</h1>
          <p className="text-muted-foreground mt-1">
            Управление пользователями системы
          </p>
        </div>
        <Button data-testid="button-add-user">
          <UserPlus className="w-4 h-4 mr-2" />
          Добавить пользователя
        </Button>
      </div>

      <DataTable columns={columns} data={mockUsers} onAction={handleAction} />
    </div>
  );
}
