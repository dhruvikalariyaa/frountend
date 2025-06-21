import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface LicenseFormData {
  id?: number;
  name: string;
  type: string;
  seats: number;
  used: number;
  status: string;
  startDate: string;
  endDate: string;
  cost: number;
  vendor: string;
  autoRenew: boolean;
}

type LicenseFormErrors = {
  [K in keyof LicenseFormData]?: string;
};

interface AddLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (license: LicenseFormData) => void;
  initialData?: LicenseFormData | null;
}

export function AddLicenseDialog({ open, onOpenChange, onSubmit, initialData }: AddLicenseDialogProps) {
  const [formData, setFormData] = useState<LicenseFormData>({
    name: '',
    type: 'Subscription',
    seats: 1,
    used: 0,
    status: 'Active',
    startDate: '',
    endDate: '',
    cost: 0,
    vendor: '',
    autoRenew: true,
  });

  const [errors, setErrors] = useState<LicenseFormErrors>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        type: 'Subscription',
        seats: 1,
        used: 0,
        status: 'Active',
        startDate: '',
        endDate: '',
        cost: 0,
        vendor: '',
        autoRenew: true,
      });
    }
    setErrors({}); // Clear errors when dialog opens or initial data changes
  }, [open, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'number' ? Number(value) : type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (id: keyof LicenseFormData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      autoRenew: checked,
    }));
  };

  const validateForm = () => {
    const newErrors: { [K in keyof LicenseFormData]?: string } = {};
    if (!formData.name) newErrors.name = 'License Name is required.';
    if (!formData.startDate) newErrors.startDate = 'Start Date is required.';
    if (!formData.endDate) newErrors.endDate = 'End Date is required.';
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End Date cannot be before Start Date.';
    }
    if (formData.seats <= 0) newErrors.seats = 'Seats must be greater than 0.';
    if (formData.used < 0) newErrors.used = 'Used seats cannot be negative.';
    if (formData.used > formData.seats) newErrors.used = 'Used seats cannot exceed total seats.';
    if (formData.cost < 0) newErrors.cost = 'Cost cannot be negative.';
    if (!formData.vendor) newErrors.vendor = 'Vendor is required.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onOpenChange(false);
      setFormData({ // Reset form after successful submission
        name: '',
        type: 'Subscription',
        seats: 1,
        used: 0,
        status: 'Active',
        startDate: '',
        endDate: '',
        cost: 0,
        vendor: '',
        autoRenew: true,
      });
    } else {
      toast.error('Please correct the errors in the form.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>{initialData ? 'Edit License' : 'Add New License'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <form onSubmit={handleSubmit} className="p-6 grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">License Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={handleSelectChange('type')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Subscription">Subscription</SelectItem>
                  <SelectItem value="Perpetual">Perpetual</SelectItem>
                  <SelectItem value="Volume">Volume</SelectItem>
                  <SelectItem value="Trial">Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seats">Total Seats</Label>
                <Input
                  id="seats"
                  type="number"
                  value={formData.seats}
                  onChange={handleChange}
                  className={errors.seats ? 'border-red-500' : ''}
                />
                {errors.seats && <p className="text-red-500 text-sm">{errors.seats}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="used">Used Seats</Label>
                <Input
                  id="used"
                  type="number"
                  value={formData.used}
                  onChange={handleChange}
                  className={errors.used ? 'border-red-500' : ''}
                />
                {errors.used && <p className="text-red-500 text-sm">{errors.used}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={handleSelectChange('status')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost (per unit/month/year)</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost}
                onChange={handleChange}
                className={errors.cost ? 'border-red-500' : ''}
              />
              {errors.cost && <p className="text-red-500 text-sm">{errors.cost}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                value={formData.vendor}
                onChange={handleChange}
                className={errors.vendor ? 'border-red-500' : ''}
              />
              {errors.vendor && <p className="text-red-500 text-sm">{errors.vendor}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="autoRenew"
                checked={formData.autoRenew}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="autoRenew">Auto Renew</Label>
            </div>
          </form>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            {initialData ? 'Save Changes' : 'Add License'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
