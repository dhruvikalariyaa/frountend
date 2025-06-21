import { useState } from 'react';
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

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: string;
  appliedDate: string;
  experience: string;
  currentCompany: string;
  timeline: Array<{
    date: string;
    status: string;
    description: string;
  }>;
}

interface AddCandidateDialogProps {
  onAddCandidate: (candidate: Candidate) => void;
}

export function AddCandidateDialog({ onAddCandidate }: AddCandidateDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    experience: '',
    currentCompany: '',
    currentRole: '',
    expectedSalary: '',
    noticePeriod: '',
    status: 'new',
    resume: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setForm((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newCandidate: Candidate = {
      id: Date.now(),
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: form.phone,
      position: form.currentRole,
      department: 'Engineering', // Default department
      status: form.status,
      appliedDate: new Date().toISOString().split('T')[0],
      experience: form.experience,
      currentCompany: form.currentCompany,
      timeline: [
        {
          date: new Date().toISOString().split('T')[0],
          status: 'Applied',
          description: 'Application received'
        }
      ]
    };
    onAddCandidate(newCandidate);
    setOpen(false);
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      experience: '',
      currentCompany: '',
      currentRole: '',
      expectedSalary: '',
      noticePeriod: '',
      status: 'new',
      resume: '',
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="hover:bg-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Candidate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border-2 shadow-lg">
        <DialogHeader className="rounded-t-2xl bg-background p-6 border-b">
          <DialogTitle className="text-xl font-semibold">Add New Candidate</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto px-6 pb-6 max-h-[calc(90vh-8rem)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name *</label>
                <Input
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name *</label>
                <Input
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone *</label>
                <Input
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Company</label>
                <Input
                  name="currentCompany"
                  placeholder="Current Company"
                  value={form.currentCompany}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Role</label>
                <Input
                  name="currentRole"
                  placeholder="Current Role"
                  value={form.currentRole}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Experience (Years) *</label>
                <Input
                  name="experience"
                  type="number"
                  placeholder="Experience in years"
                  value={form.experience}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expected Salary</label>
                <Input
                  name="expectedSalary"
                  placeholder="Expected Salary"
                  value={form.expectedSalary}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Notice Period</label>
                <Input
                  name="noticePeriod"
                  placeholder="Notice Period"
                  value={form.noticePeriod}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status *</label>
                <Select value={form.status} onValueChange={handleStatusChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="offered">Offered</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Resume Link</label>
              <Input
                name="resume"
                placeholder="Resume URL or Drive Link"
                value={form.resume}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                name="notes"
                placeholder="Additional notes about the candidate"
                value={form.notes}
                onChange={handleChange}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="hover:bg-transparent">
                Cancel
              </Button>
              <Button type="submit" className="hover:bg-primary">Add Candidate</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 