import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical,
  Loader2,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import { toast } from "sonner";
import { useTimeline } from '@/hooks/useTimeline';
import { TimelineEntry } from '@/types/models';
import { TimelineFilters } from '@/services/timeline.service';

interface TimelineProps {
  referenceId: string;
  referenceType: 'candidate' | 'interview' | 'job' | 'employee';
  title?: string;
  showAddButton?: boolean;
  maxHeight?: string;
  filters?: Omit<TimelineFilters, 'referenceType'>;
  onTimelineUpdate?: (timeline: TimelineEntry[]) => void;
}

interface TimelineEntryFormData {
  type: TimelineEntry['type'];
  subType: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

const Timeline: React.FC<TimelineProps> = ({
  referenceId,
  referenceType,
  title = 'Timeline',
  showAddButton = true,
  maxHeight = '400px',
  filters = {},
  onTimelineUpdate
}) => {
  const {
    timeline,
    loading,
    error,
    total,
    fetchTimeline,
    createTimelineEntry,
    updateTimelineEntry,
    deleteTimelineEntry,
    clearError
  } = useTimeline();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TimelineEntryFormData>({
    type: 'candidate',
    subType: '',
    title: '',
    description: '',
    metadata: {}
  });

  // Fetch timeline on mount and when referenceId changes
  useEffect(() => {
    if (referenceId) {
      fetchTimeline(referenceId, { ...filters, referenceType });
    }
  }, [referenceId, referenceType, fetchTimeline]);

  // Notify parent component when timeline updates
  useEffect(() => {
    if (onTimelineUpdate) {
      onTimelineUpdate(timeline);
    }
  }, [timeline, onTimelineUpdate]);

  const handleAddEntry = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createTimelineEntry({
        referenceType,
        referenceId,
        type: formData.type,
        subType: formData.subType || 'general',
        title: formData.title,
        description: formData.description,
        metadata: formData.metadata
      });

      toast.success('Timeline entry added successfully');
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add timeline entry');
    }
  };

  const handleEditEntry = async () => {
    if (!editingEntry || !formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateTimelineEntry(editingEntry._id, {
        title: formData.title,
        description: formData.description,
        metadata: formData.metadata
      });

      toast.success('Timeline entry updated successfully');
      setIsEditDialogOpen(false);
      setEditingEntry(null);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update timeline entry');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm('Are you sure you want to delete this timeline entry?')) {
      return;
    }

    try {
      await deleteTimelineEntry(entryId);
      toast.success('Timeline entry deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete timeline entry');
    }
  };

  const openEditDialog = (entry: TimelineEntry) => {
    setEditingEntry(entry);
    setFormData({
      type: entry.type,
      subType: entry.subType,
      title: entry.title,
      description: entry.description,
      metadata: entry.metadata || {}
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'candidate',
      subType: '',
      title: '',
      description: '',
      metadata: {}
    });
  };

  const getStatusColor = (subType: string) => {
    switch (subType) {
      case 'new':
        return '#3b82f6'; // blue
      case 'interview':
        return '#f59e0b'; // amber
      case 'rejected':
        return '#ef4444'; // red
      case 'hired':
        return '#10b981'; // emerald
      case 'completed':
        return '#10b981'; // emerald
      case 'cancelled':
        return '#ef4444'; // red
      case 'rescheduled':
        return '#f59e0b'; // amber
      default:
        return '#6b7280'; // gray
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={clearError}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            {title}
            {total > 0 && (
              <Badge variant="secondary" className="ml-2">
                {total} entries
              </Badge>
            )}
          </CardTitle>
          {showAddButton && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Timeline Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Type</label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as TimelineEntry['type'] }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="candidate">Candidate</SelectItem>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="status_change">Status Change</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Sub Type</label>
                      <Input
                        placeholder="e.g., new, interview, rejected"
                        value={formData.subType}
                        onChange={(e) => setFormData(prev => ({ ...prev, subType: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title *</label>
                    <Input
                      placeholder="Timeline entry title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description *</label>
                    <Textarea
                      placeholder="Timeline entry description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEntry} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Entry'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="space-y-4 overflow-y-auto pr-2"
          style={{ maxHeight }}
        >
          {loading && timeline.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading timeline...</span>
              </div>
            </div>
          ) : timeline.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No timeline entries</h3>
              <p className="text-gray-500">
                {showAddButton ? 'Add the first timeline entry to get started' : 'No entries found'}
              </p>
            </div>
          ) : (
            timeline.map((entry, index) => (
              <div key={entry._id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getStatusColor(entry.subType) }}
                  />
                  {index !== timeline.length - 1 && (
                    <div className="w-0.5 h-16 bg-gray-200 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{entry.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {entry.type}
                          </Badge>
                          {entry.subType && (
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                backgroundColor: `${getStatusColor(entry.subType)}20`,
                                color: getStatusColor(entry.subType),
                                borderColor: `${getStatusColor(entry.subType)}40`
                              }}
                            >
                              {entry.subType}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{entry.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString()}
                          </div>
                          {entry.createdBy && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {entry.createdBy.firstName} {entry.createdBy.lastName}
                            </div>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(entry)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteEntry(entry._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(entry.metadata).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-500 capitalize">
                                {key.replace(/([A-Z])/g, ' $1')}:
                              </span>
                              <span className="text-gray-700">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      {/* Edit Timeline Entry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Timeline Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as TimelineEntry['type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="candidate">Candidate</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="status_change">Status Change</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Sub Type</label>
                <Input
                  placeholder="e.g., new, interview, rejected"
                  value={formData.subType}
                  onChange={(e) => setFormData(prev => ({ ...prev, subType: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Title *</label>
              <Input
                placeholder="Timeline entry title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                placeholder="Timeline entry description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setEditingEntry(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditEntry} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Entry'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Timeline; 