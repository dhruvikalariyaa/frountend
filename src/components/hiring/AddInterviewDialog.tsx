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

interface Interview {
  id: number;
  candidateName: string;
  position: string;
  department: string;
  status: string;
  interviewDate: string;
  interviewTime: string;
  interviewType: string;
  interviewers: string[];
  location: string;
  notes: string;
  timeline: Array<{
    date: string;
    status: string;
    description: string;
  }>;
}

interface AddInterviewDialogProps {
  onAddInterview: (interview: Interview) => void;
  isReschedule?: boolean;
  interviewToReschedule?: Interview | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddInterviewDialog({ 
  onAddInterview, 
  isReschedule = false, 
  interviewToReschedule = null,
  open: controlledOpen,
  onOpenChange
}: AddInterviewDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const [form, setForm] = useState({
    candidateName: '',
    position: '',
    department: 'Engineering',
    interviewDate: '',
    interviewTime: '',
    interviewType: 'Technical',
    interviewers: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    if (isReschedule && interviewToReschedule) {
      setForm({
        candidateName: interviewToReschedule.candidateName,
        position: interviewToReschedule.position,
        department: interviewToReschedule.department,
        interviewDate: interviewToReschedule.interviewDate,
        interviewTime: interviewToReschedule.interviewTime,
        interviewType: interviewToReschedule.interviewType,
        interviewers: interviewToReschedule.interviewers.join(', '),
        location: interviewToReschedule.location,
        notes: interviewToReschedule.notes,
      });
    }
  }, [isReschedule, interviewToReschedule]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setForm((prev) => ({ ...prev, interviewType: value }));
  };

  const handleDepartmentChange = (value: string) => {
    setForm((prev) => ({ ...prev, department: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newInterview: Interview = {
      id: isReschedule ? interviewToReschedule!.id : Date.now(),
      candidateName: form.candidateName,
      position: form.position,
      department: form.department,
      status: isReschedule ? 'Rescheduled' : 'Scheduled',
      interviewDate: form.interviewDate,
      interviewTime: form.interviewTime,
      interviewType: form.interviewType,
      interviewers: form.interviewers.split(',').map(name => name.trim()),
      location: form.location,
      notes: form.notes,
      timeline: [
        ...(isReschedule ? interviewToReschedule!.timeline : []),
        {
          date: new Date().toISOString().split('T')[0],
          status: isReschedule ? 'Rescheduled' : 'Scheduled',
          description: isReschedule ? 'Interview rescheduled' : 'Interview scheduled'
        }
      ]
    };
    onAddInterview(newInterview);
    setOpen(false);
    if (!isReschedule) {
      setForm({
        candidateName: '',
        position: '',
        department: 'Engineering',
        interviewDate: '',
        interviewTime: '',
        interviewType: 'Technical',
        interviewers: '',
        location: '',
        notes: '',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isReschedule && (
        <DialogTrigger asChild>
          <Button className="hover:bg-primary">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Interview
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border-2 shadow-lg">
        <DialogHeader className="rounded-t-2xl bg-background p-6 border-b">
          <DialogTitle className="text-xl font-semibold">
            {isReschedule ? 'Reschedule Interview' : 'Schedule New Interview'}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto px-6 pb-6 max-h-[calc(90vh-8rem)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Candidate Name *</label>
                <Input
                  name="candidateName"
                  placeholder="Candidate Name"
                  value={form.candidateName}
                  onChange={handleChange}
                  required
                  disabled={isReschedule}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Position *</label>
                <Input
                  name="position"
                  placeholder="Position"
                  value={form.position}
                  onChange={handleChange}
                  required
                  disabled={isReschedule}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department *</label>
                <Select value={form.department} onValueChange={handleDepartmentChange} required disabled={isReschedule}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Interview Type *</label>
                <Select value={form.interviewType} onValueChange={handleTypeChange} required disabled={isReschedule}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Behavioral">Behavioral</SelectItem>
                    <SelectItem value="Portfolio Review">Portfolio Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Interview Date *</label>
                <Input
                  name="interviewDate"
                  type="date"
                  value={form.interviewDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Interview Time *</label>
                <Input
                  name="interviewTime"
                  type="time"
                  value={form.interviewTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Interviewers *</label>
              <Input
                name="interviewers"
                placeholder="Enter interviewer names (comma-separated)"
                value={form.interviewers}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location *</label>
              <Input
                name="location"
                placeholder="Interview location or meeting link"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                name="notes"
                placeholder="Additional notes about the interview"
                value={form.notes}
                onChange={handleChange}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="hover:bg-transparent">
                Cancel
              </Button>
              <Button type="submit" className="hover:bg-primary">
                {isReschedule ? 'Reschedule Interview' : 'Schedule Interview'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 