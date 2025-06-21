import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";

interface AddReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function AddReviewDialog({ open, onOpenChange, onSubmit, initialData }: AddReviewDialogProps) {
  const [formData, setFormData] = useState({
    employeeName: initialData?.employeeName || '',
    department: initialData?.department || '',
    role: initialData?.role || '',
    rating: initialData?.rating || 0,
    projectsCompleted: initialData?.projectsCompleted || 0,
    productivity: initialData?.productivity || 0,
    status: initialData?.status || 'Meeting',
    comments: initialData?.comments || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  const renderStars = (currentRating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFull = currentRating >= i;
      const isHalf = currentRating >= i - 0.5 && currentRating < i;

      stars.push(
        <div key={i} className="relative w-6 h-6">
          {/* Visual Star (background for half or full fill) */}
          <Star
            className={`h-6 w-6 absolute ${
              isFull ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
            }`}
          />

          {/* This div creates the visual for a half-filled star by masking half of a filled star */}
          {isHalf && (
            <div className="absolute top-0 left-0 h-full w-1/2 overflow-hidden">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            </div>
          )}

          {/* Clickable area for the left half (sets X.5 rating) */}
          <div
            className="absolute left-0 top-0 h-full w-1/2 cursor-pointer z-10"
            onClick={() => setFormData({ ...formData, rating: i - 0.5 })}
          />
          {/* Clickable area for the right half (sets X.0 rating) */}
          <div
            className="absolute left-1/2 top-0 h-full w-1/2 cursor-pointer z-10"
            onClick={() => setFormData({ ...formData, rating: i })}
          />
        </div>
      );
    }
    return (
      <div className="flex gap-1">
        {stars}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {initialData ? 'Edit Performance Review' : 'Add Performance Review'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName" className="text-sm font-medium">Employee Name</Label>
              <Input
                id="employeeName"
                value={formData.employeeName}
                onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                placeholder="Enter employee name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Enter department"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">Role</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Enter role"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Rating</Label>
            {renderStars(formData.rating)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectsCompleted" className="text-sm font-medium">Projects Completed</Label>
              <Input
                id="projectsCompleted"
                type="number"
                value={formData.projectsCompleted}
                onChange={(e) => setFormData({ ...formData, projectsCompleted: parseInt(e.target.value) })}
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productivity" className="text-sm font-medium">Productivity (%)</Label>
              <Input
                id="productivity"
                type="number"
                value={formData.productivity}
                onChange={(e) => setFormData({ ...formData, productivity: parseInt(e.target.value) })}
                min="0"
                max="100"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Exceeding">Exceeding</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments" className="text-sm font-medium">Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Enter performance comments"
              rows={4}
            />
          </div>
        </form>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            {initialData ? 'Update Review' : 'Add Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 