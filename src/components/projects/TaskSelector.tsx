import { useState } from 'react';
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
import { X, Paperclip, MessageSquare, SortAsc, SortDesc } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  assigneeId: string;
  dueDate: string;
  dependencies: string[];
  comments: Array<{
    id: string;
    userId: string;
    content: string;
    createdAt: string;
    attachments?: Array<{
      id: string;
      name: string;
      url: string;
      type: string;
      size: number;
    }>;
  }>;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

interface TaskSelectorProps {
  value: string[];
  onChange: (taskIds: string[]) => void;
  availableUsers: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  error?: string;
}

export function TaskSelector({
  value,
  onChange,
  availableUsers,
  error,
}: TaskSelectorProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Not Started',
    assigneeId: '',
    dueDate: '',
    dependencies: [],
    comments: [],
    attachments: [],
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'status'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [newComment, setNewComment] = useState('');

  const handleAddTask = () => {
    if (
      newTask.title &&
      newTask.description &&
      newTask.assigneeId &&
      newTask.dueDate
    ) {
      const task: Task = {
        id: crypto.randomUUID(),
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority as 'High' | 'Medium' | 'Low',
        status: newTask.status as 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled',
        assigneeId: newTask.assigneeId,
        dueDate: newTask.dueDate,
        dependencies: newTask.dependencies || [],
        comments: [],
        attachments: [],
      };
      setTasks([...tasks, task]);
      onChange([...value, task.id]);
      setNewTask({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Not Started',
        assigneeId: '',
        dueDate: '',
        dependencies: [],
        comments: [],
        attachments: [],
      });
    }
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    onChange(value.filter((id) => id !== taskId));
  };

  const handleAddComment = (taskId: string) => {
    if (!newComment.trim()) return;
    
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          comments: [
            ...task.comments,
            {
              id: crypto.randomUUID(),
              userId: 'current-user-id', // Replace with actual user ID
              content: newComment,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    setNewComment('');
  };

  const handleFileUpload = (taskId: string, files: FileList) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const newAttachments = Array.from(files).map(file => ({
          id: crypto.randomUUID(),
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          size: file.size,
        }));
        return {
          ...task,
          attachments: [...task.attachments, ...newAttachments],
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
  };

  const getAssigneeName = (assigneeId: string) => {
    const user = availableUsers.find((u) => u.id === assigneeId);
    return user ? user.name : 'Unassigned';
  };

  const filteredTasks = tasks
    .filter(task => filterStatus === 'all' || task.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        return sortOrder === 'asc'
          ? priorityOrder[a.priority] - priorityOrder[b.priority]
          : priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (sortBy === 'dueDate') {
        return sortOrder === 'asc'
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      return sortOrder === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: 'priority' | 'dueDate' | 'status') => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Input
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <Textarea
          placeholder="Task Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <div className="flex gap-2">
          <Select
            value={newTask.priority}
            onValueChange={(value) =>
              setNewTask({ ...newTask, priority: value as 'High' | 'Medium' | 'Low' })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={newTask.status}
            onValueChange={(value) =>
              setNewTask({ ...newTask, status: value as Task['status'] })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={newTask.assigneeId}
            onValueChange={(value) =>
              setNewTask({ ...newTask, assigneeId: value })
            }
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select Assignee" />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            className="w-40"
          />

          <Button
            type="button"
            onClick={handleAddTask}
            disabled={
              !newTask.title ||
              !newTask.description ||
              !newTask.assigneeId ||
              !newTask.dueDate
            }
          >
            Add Task
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-2">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="p-3 bg-gray-50 rounded-md space-y-2"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{task.title}</h4>
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => (task)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Task Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Comments</h3>
                        <ScrollArea className="h-40">
                          {task.comments.map((comment) => (
                            <div key={comment.id} className="p-2 bg-gray-50 rounded-md mb-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">
                                  {getAssigneeName(comment.userId)}
                                </span>
                                <span className="text-gray-500">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="mt-1">{comment.content}</p>
                            </div>
                          ))}
                        </ScrollArea>
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                          />
                          <Button
                            onClick={() => handleAddComment(task.id)}
                            disabled={!newComment.trim()}
                          >
                            Comment
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium">Attachments</h3>
                        <div className="space-y-2">
                          {task.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                <Paperclip className="h-4 w-4" />
                                <span>{attachment.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(attachment.url, '_blank')}
                              >
                                Download
                              </Button>
                            </div>
                          ))}
                          <Input
                            type="file"
                            multiple
                            onChange={(e) => handleFileUpload(task.id, e.target.files!)}
                          />
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTask(task.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600">{task.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <Badge
                variant={
                  task.priority === 'High'
                    ? 'destructive'
                    : task.priority === 'Medium'
                    ? 'secondary'
                    : 'default'
                }
              >
                {task.priority}
              </Badge>
              <Badge
                variant={
                  task.status === 'Completed'
                    ? 'default'
                    : task.status === 'In Progress'
                    ? 'secondary'
                    : task.status === 'On Hold'
                    ? 'secondary'
                    : task.status === 'Cancelled'
                    ? 'destructive'
                    : 'default'
                }
              >
                {task.status}
              </Badge>
              <span>Assigned to: {getAssigneeName(task.assigneeId)}</span>
              <span>Due: {task.dueDate}</span>
            </div>
            {task.dependencies.length > 0 && (
              <div className="text-sm text-gray-500">
                Dependencies: {task.dependencies.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 