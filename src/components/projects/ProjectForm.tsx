import { useFormValidation } from '@/hooks/useFormValidation';
import { projectSchema, ProjectFormData } from '@/utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { TeamMemberSelector } from './TeamMemberSelector';
import { TaskSelector } from './TaskSelector';
import { Label } from '@/components/ui/label';

// Mock data for clients and users
const clients = [
  { id: 'CLI-001', name: 'Acme Corporation' },
  { id: 'CLI-002', name: 'Global Industries' },
  { id: 'CLI-003', name: 'Tech Solutions' },
  { id: 'CLI-004', name: 'Innovation Labs' },
];

const users = [
  { id: 'USR-001', name: 'John Smith', role: 'Project Manager' },
  { id: 'USR-002', name: 'Sarah Johnson', role: 'Project Manager' },
  { id: 'USR-003', name: 'Mike Brown', role: 'Developer' },
  { id: 'USR-004', name: 'Emily Davis', role: 'Designer' },
];

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel?: () => void;
}

export function ProjectForm({ initialData = {}, onSubmit, onCancel }: ProjectFormProps) {
  const {
    data,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
  } = useFormValidation({
    schema: projectSchema,
    initialData: {
      ...initialData,
      id: initialData.id || crypto.randomUUID(),
      tasks: initialData.tasks || [],
      documents: initialData.documents || [],
      team: initialData.team || [],
    },
    onSubmit,
  });

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Project Name
          </label>
          <Input
            id="name"
            value={data.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <Textarea
            id="description"
            value={data.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <label htmlFor="clientId" className="block text-sm font-medium mb-1">
            Client
          </label>
          <Select
            value={data.clientId || ''}
            onValueChange={(value) => handleChange('clientId', value)}
          >
            <SelectTrigger className={errors.clientId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select Client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.clientId && (
            <p className="text-sm text-red-500 mt-1">{errors.clientId}</p>
          )}
        </div>

        <div>
          <label htmlFor="managerId" className="block text-sm font-medium mb-1">
            Project Manager
          </label>
          <Select
            value={data.managerId || ''}
            onValueChange={(value) => handleChange('managerId', value)}
          >
            <SelectTrigger className={errors.managerId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select Project Manager" />
            </SelectTrigger>
            <SelectContent>
              {users
                .filter((user) => user.role === 'Project Manager')
                .map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.managerId && (
            <p className="text-sm text-red-500 mt-1">{errors.managerId}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            Status
          </label>
          <Select
            value={data.status || ''}
            onValueChange={(value) => handleChange('status', value)}
          >
            <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-500 mt-1">{errors.status}</p>
          )}
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-1">
            Start Date
          </label>
          <Input
            id="startDate"
            type="date"
            value={formatDate(data.startDate)}
            onChange={(e) => handleChange('startDate', new Date(e.target.value))}
            className={errors.startDate ? 'border-red-500' : ''}
          />
          {errors.startDate && (
            <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-1">
            End Date
          </label>
          <Input
            id="endDate"
            type="date"
            value={formatDate(data.endDate)}
            onChange={(e) => handleChange('endDate', new Date(e.target.value))}
            className={errors.endDate ? 'border-red-500' : ''}
          />
          {errors.endDate && (
            <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium mb-1">
            Budget
          </label>
          <Input
            id="budget"
            type="number"
            min="0"
            step="0.01"
            value={data.budget || ''}
            onChange={(e) => handleChange('budget', parseFloat(e.target.value))}
            className={errors.budget ? 'border-red-500' : ''}
          />
          {errors.budget && (
            <p className="text-sm text-red-500 mt-1">{errors.budget}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Team Members
          </label>
          <TeamMemberSelector
            value={data.team || []}
            onChange={(team) => handleChange('team', team)}
            availableUsers={users}
            error={errors.team}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tasks">Tasks</Label>
          <TaskSelector
            value={data.tasks || []}
            onChange={(taskIds) => handleChange('tasks', taskIds)}
            availableUsers={users}
            error={errors.tasks}
          />
        </div>

        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={reset}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Project'}
          </Button>
        </div>
      </form>
    </Card>
  );
} 