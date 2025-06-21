import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { mockDepartments, Department } from '@/pages/employees/Departments';

interface Job {
  id: number;
  title: string;
  department: string;
  status: string;
  postedDate: string;
  location: string;
  type: string;
  salary: string;
  applicants: number;
  timeline: Array<{
    date: string;
    status: string;
    description: string;
  }>;
}

interface AddJobDialogProps {
  onAddJob?: (job: Job) => void;
  initialData?: Job;
  isEdit?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddJobDialog({ 
  onAddJob, 
  initialData, 
  isEdit = false,
  open: controlledOpen,
  onOpenChange
}: AddJobDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  
  // Use controlled or uncontrolled state based on props
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = onOpenChange || setUncontrolledOpen;

  const [form, setForm] = useState({
    title: '',
    location: '',
    status: 'open',
    description: '',
    salary: '',
    type: 'full-time',
    department: 'Engineering',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        location: initialData.location,
        status: initialData.status.toLowerCase(),
        description: '',
        salary: initialData.salary,
        type: initialData.type.toLowerCase(),
        department: initialData.department,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setForm((prev) => ({ ...prev, status: value }));
  };

  const handleTypeChange = (value: string) => {
    setForm((prev) => ({ ...prev, type: value }));
  };

  const handleDepartmentChange = (value: string) => {
    setForm((prev) => ({ ...prev, department: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onAddJob) {
      const jobData = {
        ...form,
        id: initialData?.id || Date.now(),
        postedDate: initialData?.postedDate || new Date().toISOString().split('T')[0],
        applicants: initialData?.applicants || 0,
        timeline: initialData?.timeline || [{
          date: new Date().toISOString().split('T')[0],
          status: form.status.charAt(0).toUpperCase() + form.status.slice(1),
          description: isEdit ? 'Job details updated' : 'Job listing published'
        }]
      };
      onAddJob(jobData);
    }
    if (!isEdit) {
      setForm({
        title: '',
        location: '',
        status: 'open',
        description: '',
        salary: '',
        type: 'full-time',
        department: 'Engineering',
      });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Job
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border-2 shadow-lg">
        <DialogHeader className="rounded-t-2xl bg-background p-6 border-b">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? 'Edit Job' : 'Add New Job'}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto px-6 pb-6 max-h-[calc(90vh-8rem)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title *</label>
              <Input
                name="title"
                placeholder="Job Title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department *</label>
              <Select value={form.department} onValueChange={handleDepartmentChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {mockDepartments.map((dept: Department) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location *</label>
              <Input
                name="location"
                placeholder="Location"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Salary Range *</label>
              <Input
                name="salary"
                placeholder="Salary Range"
                value={form.salary}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Description *</label>
              <Textarea
                name="description"
                placeholder="Job Description"
                value={form.description}
                onChange={handleChange}
                required
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Type *</label>
              <Select value={form.type} onValueChange={handleTypeChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status *</label>
              <Select value={form.status} onValueChange={handleStatusChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEdit ? 'Update Job' : 'Add Job'}</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 