import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Candidate } from '@/types/models';

// Separate trigger button component
interface AddCandidateButtonProps {
  onClick: () => void;
  isEditMode?: boolean;
}

export function AddCandidateButton({ onClick, isEditMode = false }: AddCandidateButtonProps) {
  if (isEditMode) {
    return (
      <Button variant="outline" size="sm" onClick={onClick}>
        <Edit className="mr-2 h-4 w-4" />
        Edit
      </Button>
    );
  }
  
  return (
    <Button 
      className="hover:bg-primary"
      onClick={() => {
        console.log('Add Candidate button clicked - calling onClick handler');
        onClick();
      }}
    >
      <Plus className="mr-2 h-4 w-4" />
      Add Candidate
    </Button>
  );
}

interface AddCandidateDialogProps {
  onAddCandidate?: (candidateData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    currentCompany?: string;
    currentRole?: string;
    experience: string;
    expectedSalary?: string;
    noticePeriod?: string;
    status: string;
    resume?: string;
    department?: string;
    notes?: string;
  }) => void;
  onUpdateCandidate?: (candidateId: string, candidateData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    currentCompany?: string;
    currentRole?: string;
    experience: string;
    expectedSalary?: string;
    noticePeriod?: string;
    status: string;
    resume?: string;
    department?: string;
    notes?: string;
  }) => void;
  candidate?: Candidate | null; // For edit mode
  isEditMode?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddCandidateDialog({ 
  onAddCandidate, 
  onUpdateCandidate,
  candidate = null,
  isEditMode = false,
  open,
  onOpenChange
}: AddCandidateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
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
    department: '',
    notes: '',
  });

  // Use external open state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Debug logging
  useEffect(() => {
    console.log('AddCandidateDialog state:', {
      isEditMode,
      isOpen,
      internalOpen,
      externalOpen: open,
      hasOnOpenChange: !!onOpenChange
    });
  }, [isEditMode, isOpen, internalOpen, open, onOpenChange]);

  // Populate form with candidate data in edit mode
  useEffect(() => {
    if (isEditMode && candidate) {
      setForm({
        firstName: candidate.firstName || '',
        lastName: candidate.lastName || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        experience: candidate.experienceYears?.toString() || '',
        currentCompany: candidate.currentCompany || '',
        currentRole: candidate.currentRole || '',
        expectedSalary: candidate.expectedSalary?.toString() || '',
        noticePeriod: candidate.noticePeriod || '',
        status: candidate.status || 'new',
        resume: candidate.resumeLink || '',
        department: candidate.department || '',
        notes: candidate.notes || '',
      });
    } else if (!isEditMode) {
      // Reset form for add mode
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
        department: '',
        notes: '',
      });
    }
  }, [isEditMode, candidate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setForm((prev) => ({ ...prev, status: value }));
  };

  const handleDepartmentChange = (value: string) => {
    // Convert "not-specified" to empty string for form handling
    const departmentValue = value === "not-specified" ? "" : value;
    setForm((prev) => ({ ...prev, department: departmentValue }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', form);
    console.log('isEditMode:', isEditMode);
    console.log('candidate:', candidate);
    console.log('onAddCandidate:', onAddCandidate);
    console.log('onUpdateCandidate:', onUpdateCandidate);
    
    if (isEditMode && candidate && onUpdateCandidate) {
      // Update existing candidate
      console.log('Calling onUpdateCandidate');
      onUpdateCandidate(candidate._id, form);
    } else if (!isEditMode && onAddCandidate) {
      // Add new candidate
      console.log('Calling onAddCandidate');
      onAddCandidate(form);
    } else {
      console.error('No appropriate handler found');
    }
    
    // Close dialog and reset form
    setIsOpen(false);
    if (!isEditMode) {
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
        department: '',
        notes: '',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border-2 shadow-lg">
        <DialogHeader className="rounded-t-2xl bg-background p-6 border-b">
          <DialogTitle className="text-xl font-semibold">
            {isEditMode ? 'Edit Candidate' : 'Add New Candidate'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update the candidate information below and click save to apply changes.' 
              : 'Fill in the candidate information below to add them to the system.'
            }
          </DialogDescription>
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
                  min="0"
                  max="50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expected Salary</label>
                <Input
                  name="expectedSalary"
                  type="number"
                  placeholder="Expected Salary (₹)"
                  value={form.expectedSalary}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Notice Period</label>
                <Input
                  name="noticePeriod"
                  placeholder="e.g., 2 months, Immediate"
                  value={form.noticePeriod}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select value={form.department || "not-specified"} onValueChange={handleDepartmentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-specified">Not Specified</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={form.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Resume Link</label>
              <Input
                name="resume"
                type="url"
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

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)} 
                className="hover:bg-transparent"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="hover:bg-primary"
                disabled={!form.firstName || !form.lastName || !form.email || !form.phone || !form.experience}
              >
                {isEditMode ? 'Update Candidate' : 'Add Candidate'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 