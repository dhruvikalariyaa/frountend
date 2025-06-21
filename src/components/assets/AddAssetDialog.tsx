import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (asset: any) => void;
  initialData?: any; // For editing existing asset
}

export function AddAssetDialog({ open, onOpenChange, onSubmit, initialData }: AddAssetDialogProps) {
  const [assetData, setAssetData] = useState({
    name: '',
    type: '',
    category: '',
    status: 'Available',
    assignedTo: '',
    location: '',
    purchaseDate: '',
    warranty: '',
    value: 0,
    condition: '',
  });

  useEffect(() => {
    if (initialData) {
      setAssetData(initialData);
    } else {
      setAssetData({
        name: '',
        type: '',
        category: '',
        status: 'Available',
        assignedTo: '',
        location: '',
        purchaseDate: '',
        warranty: '',
        value: 0,
        condition: '',
      });
    }
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setAssetData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setAssetData(prev => ({ ...prev, [id]: value }));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setAssetData(prev => ({ ...prev, [id]: Number(value) }));
  };

  const handleSubmit = () => {
    onSubmit(assetData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px]">
          <div className="grid gap-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name</Label>
              <Input id="name" value={assetData.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input id="type" value={assetData.type} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={assetData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laptop">Laptop</SelectItem>
                  <SelectItem value="Server">Server</SelectItem>
                  <SelectItem value="License">License</SelectItem>
                  <SelectItem value="Network">Network</SelectItem>
                  <SelectItem value="Printer">Printer</SelectItem>
                  <SelectItem value="Smartphone">Smartphone</SelectItem>
                  <SelectItem value="Storage">Storage</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={assetData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Use">In Use</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Retired">Retired</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input id="assignedTo" value={assetData.assignedTo} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={assetData.location} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input id="purchaseDate" type="date" value={assetData.purchaseDate} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warranty">Warranty Expiry</Label>
              <Input id="warranty" type="date" value={assetData.warranty} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input id="value" type="number" value={assetData.value} onChange={handleNumericChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Textarea id="condition" value={assetData.condition} onChange={handleChange} />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{initialData ? 'Save Changes' : 'Add Asset'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 