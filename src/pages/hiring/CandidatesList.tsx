import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Mail, 
  Calendar,
  Clock,
  User,
  FileText,
  UserCircle,
  Building2,
  Download,
  X,
  Phone,
  Loader2,
  Edit,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { AddCandidateDialog, AddCandidateButton } from '@/components/hiring/AddCandidateDialog';
import CandidateTimelineDialog from '@/components/hiring/CandidateTimelineDialog';
import { useCandidates } from '@/hooks/useCandidates';
import { candidateService } from '@/services/candidate.service';
import { Candidate, TimelineEntry, CreateCandidateRequest } from '@/types/models';

interface CandidatesListProps {
  limit?: number;
  showFilters?: boolean;
}

const CandidatesList: React.FC<CandidatesListProps> = ({ limit, showFilters = true }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('No access token found, redirecting to login');
      navigate('/login');
      return;
    }
  }, [navigate]);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [departmentFilter, setDepartmentFilter] = React.useState('all');
  const [dateRangeFilter, setDateRangeFilter] = React.useState('all');
  const [selectedTimelineEvent, setSelectedTimelineEvent] = React.useState<{ event: TimelineEntry; candidate: Candidate } | null>(null);
  const [selectedResume, setSelectedResume] = React.useState<Candidate | null>(null);
  const [selectedProfile, setSelectedProfile] = React.useState<Candidate | null>(null);
  
  // Edit dialog state
  const [editingCandidate, setEditingCandidate] = React.useState<Candidate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  
  // Add dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  
  // Timeline dialog state
  const [selectedTimelineCandidate, setSelectedTimelineCandidate] = React.useState<Candidate | null>(null);
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = React.useState(false);
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'info'
  });
  
  // Track if initial fetch has been done
  const initialFetchDone = useRef(false);

  // Use our candidates hook
  const {
    candidates,
    loading,
    error,
    total,
    fetchCandidates,
    createCandidate,
    updateCandidate,
    updateCandidateStatus,
    deleteCandidate,
    clearError
  } = useCandidates();

  // Initial fetch - only run once on mount or when limit changes significantly
  useEffect(() => {
    if (!initialFetchDone.current) {
      // Pass proper default parameters
      const defaultFilters = {
        page: 1,
        limit: limit || 10
      };
      fetchCandidates(defaultFilters);
      initialFetchDone.current = true;
    }
  }, [limit]); // Only depend on limit, not fetchCandidates

  // Filter candidates based on current filters
  const filteredCandidates = useMemo(() => {
    // Ensure candidates is an array and filter out any invalid entries
    let filtered = Array.isArray(candidates) ? candidates.filter(candidate => {
      const isValid = candidate && 
        typeof candidate === 'object' && 
        candidate._id &&
        candidate.firstName &&
        candidate.lastName &&
        candidate.email;
      
      return isValid;
    }) : [];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(candidate =>
        candidateService.getCandidateFullName(candidate).toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.currentRole?.toLowerCase().includes(query) ||
        candidate.currentCompany?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.status === statusFilter);
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.department === departmentFilter);
    }

    // Date range filter
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      
      switch (dateRangeFilter) {
        case 'today':
          filtered = filtered.filter(candidate => {
            const candidateDate = new Date(candidate.createdAt);
            return candidateDate.toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(candidate => {
            const candidateDate = new Date(candidate.createdAt);
            return candidateDate >= weekAgo;
          });
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(candidate => {
            const candidateDate = new Date(candidate.createdAt);
            return candidateDate >= monthAgo;
          });
          break;
      }
    }

    return filtered;
  }, [candidates, searchQuery, statusFilter, departmentFilter, dateRangeFilter]);

  // Apply limit if specified and filter out any undefined candidates
  const displayedCandidates = (limit ? filteredCandidates.slice(0, limit) : filteredCandidates)
    .filter(candidate => candidate && candidate._id); // Remove undefined/null candidates

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDepartmentFilter('all');
    setDateRangeFilter('all');
    toast({
      title: "🔍 Filters Cleared",
      description: "All search filters have been reset",
      duration: 3000,
    });
  };

  // Helper function to show confirmation dialog
  const showConfirmDialog = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      type?: 'danger' | 'warning' | 'info';
    }
  ) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm,
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel',
      type: options?.type || 'info'
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  const handleConfirmAction = () => {
    confirmDialog.onConfirm();
    closeConfirmDialog();
  };

  const getStatusColor = (status: string) => {
    const validStatuses: Candidate['status'][] = ['new', 'interview', 'rejected'];
    const candidateStatus = validStatuses.includes(status as Candidate['status']) ? status as Candidate['status'] : 'new';
    return candidateService.getStatusColor(candidateStatus);
  };

  const handleUpdateStatus = async (candidate: Candidate, newStatus: string) => {
    // Add confirmation for rejected status
    if (newStatus === 'rejected') {
      showConfirmDialog(
        'Reject Application',
        `Are you sure you want to reject ${candidateService.getCandidateFullName(candidate)}'s application?\n\nThis action will terminate their application and no further actions can be taken.`,
        async () => {
          await updateStatusConfirmed(candidate, newStatus);
        },
        {
          confirmText: 'Reject Application',
          cancelText: 'Cancel',
          type: 'danger'
        }
      );
      return;
    }

    // For other status updates, proceed directly
    await updateStatusConfirmed(candidate, newStatus);
  };

  const updateStatusConfirmed = async (candidate: Candidate, newStatus: string) => {
    try {
      // Make the API call first - this will handle adding the timeline entry
      const updatedCandidate = await updateCandidateStatus(candidate._id, newStatus as Candidate['status'], `Status updated from candidate list - ${candidateService.getStatusDisplayText(candidate.status)} to ${candidateService.getStatusDisplayText(newStatus as Candidate['status'])}`);
      
      // Refresh candidates to get the latest timeline data with proper parameters
      const refreshFilters = {
        page: 1,
        limit: limit || 10
      };
      await fetchCandidates(refreshFilters);
      
      // Update selected profile if it's the same candidate
      if (selectedProfile && selectedProfile._id === candidate._id) {
        setSelectedProfile(updatedCandidate);
      }
      
      toast({
        title: `✅ Status Updated Successfully`,
        description: `${candidateService.getCandidateFullName(candidate)}'s status updated to ${candidateService.getStatusDisplayText(newStatus as Candidate['status'])}`,
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "❌ Status Update Failed",
        description: error.message || 'Please try again later',
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleAddCandidate = async (newCandidateData: any) => {
    try {
      const candidateData: CreateCandidateRequest = {
        firstName: newCandidateData.firstName,
        lastName: newCandidateData.lastName,
        email: newCandidateData.email,
        phone: newCandidateData.phone,
        currentCompany: newCandidateData.currentCompany,
        currentRole: newCandidateData.currentRole,
        experienceYears: parseInt(newCandidateData.experience) || 0,
        expectedSalary: newCandidateData.expectedSalary ? parseInt(newCandidateData.expectedSalary) : undefined,
        noticePeriod: newCandidateData.noticePeriod,
        resumeLink: newCandidateData.resume,
        department: newCandidateData.department || null,
        notes: newCandidateData.notes,
      };

      const result = await createCandidate(candidateData);
      
      // Manual refresh to ensure UI is updated
      const refreshFilters = {
        page: 1,
        limit: limit || 10
      };
      await fetchCandidates(refreshFilters);
      
      // Close the dialog
      setIsAddDialogOpen(false);
      
      toast({
        title: "🎉 Candidate Added Successfully!",
        description: `${candidateData.firstName} ${candidateData.lastName} has been added to the hiring pipeline`,
        duration: 3000,
      });
      
    } catch (error: any) {
      toast({
        title: "❌ Failed to Add Candidate",
        description: error.message || 'Please check the form data and try again',
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleUpdateCandidate = async (candidateId: string, updatedCandidateData: any) => {
    try {
      const candidateData = {
        firstName: updatedCandidateData.firstName,
        lastName: updatedCandidateData.lastName,
        email: updatedCandidateData.email,
        phone: updatedCandidateData.phone,
        currentCompany: updatedCandidateData.currentCompany,
        currentRole: updatedCandidateData.currentRole,
        experienceYears: parseInt(updatedCandidateData.experience) || 0,
        expectedSalary: updatedCandidateData.expectedSalary ? parseInt(updatedCandidateData.expectedSalary) : undefined,
        noticePeriod: updatedCandidateData.noticePeriod,
        resumeLink: updatedCandidateData.resume,
        department: updatedCandidateData.department || null,
        notes: updatedCandidateData.notes,
        status: updatedCandidateData.status,
      };

      await updateCandidate(candidateId, candidateData);
      
      // Close edit dialog
      setIsEditDialogOpen(false);
      setEditingCandidate(null);
      
      // Update selected profile if it's the same candidate
      if (selectedProfile && selectedProfile._id === candidateId) {
        const updatedCandidate = candidates.find(c => c._id === candidateId);
        if (updatedCandidate) {
          setSelectedProfile(updatedCandidate);
        }
      }
      
      toast({
        title: "✅ Candidate Updated Successfully",
        description: `${candidateData.firstName} ${candidateData.lastName}'s information has been updated`,
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "❌ Failed to Update Candidate",
        description: error.message || 'Please try again later',
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setIsEditDialogOpen(true);
    toast({
      title: "✏️ Edit Mode",
      description: `Editing ${candidateService.getCandidateFullName(candidate)}'s information`,
      duration: 3000,
    });
  };

  const handleDeleteCandidate = async (candidate: Candidate) => {
    showConfirmDialog(
      'Delete Candidate',
      `Are you sure you want to delete ${candidateService.getCandidateFullName(candidate)}?\n\nThis action cannot be undone.`,
      async () => {
        try {
          await deleteCandidate(candidate._id);
          
          // Close dialogs if the deleted candidate was selected
          if (selectedProfile && selectedProfile._id === candidate._id) {
            setSelectedProfile(null);
          }
          if (selectedResume && selectedResume._id === candidate._id) {
            setSelectedResume(null);
          }
          
          toast({
            title: "🗑️ Candidate Deleted Successfully",
            description: `${candidateService.getCandidateFullName(candidate)} has been removed from the system`,
            duration: 3000,
          });
        } catch (error: any) {
          toast({
            title: "❌ Failed to Delete Candidate",
            description: error.message || 'Please try again later',
            variant: "destructive",
            duration: 3000,
          });
        }
      },
      {
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    );
  };

  const handleTimelineClick = (event: TimelineEntry, candidate: Candidate) => {
    setSelectedTimelineEvent({ event, candidate });
  };

  const handleViewProfile = (candidate: Candidate) => {
    setSelectedProfile(candidate);
    toast({
      title: "👤 Profile Opened",
      description: `Viewing ${candidateService.getCandidateFullName(candidate)}'s profile`,
      duration: 3000,
    });
  };

  const handleViewResume = (candidate: Candidate) => {
    setSelectedResume(candidate);
    if (candidate.resumeLink) {
      toast({
        title: "📄 Resume Opened",
        description: `Opening ${candidateService.getCandidateFullName(candidate)}'s resume`,
        duration: 3000,
      });
    } else {
      toast({
        title: "⚠️ No Resume Available",
        description: `${candidateService.getCandidateFullName(candidate)} hasn't uploaded a resume yet`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleDownloadResume = (candidate: Candidate) => {
    if (candidate.resumeLink) {
      window.open(candidate.resumeLink, '_blank');
      toast({
        title: "⬇️ Resume Download Started",
        description: `Downloading ${candidateService.getCandidateFullName(candidate)}'s resume`,
        duration: 3000,
      });
    } else {
      toast({
        title: "❌ No Resume Available",
        description: `${candidateService.getCandidateFullName(candidate)} hasn't uploaded a resume yet`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleSendEmail = (candidate: Candidate) => {
    const subject = encodeURIComponent(`Regarding your application for ${candidate.currentRole || 'position'}`);
    const body = encodeURIComponent(`Dear ${candidateService.getCandidateFullName(candidate)},\n\n`);
    window.open(`mailto:${candidate.email}?subject=${subject}&body=${body}`);
    toast({
      title: "📧 Email Client Opened",
      description: `Composing email to ${candidateService.getCandidateFullName(candidate)}`,
      duration: 3000,
    });
  };

  const handleRefresh = () => {
    const refreshFilters = {
      page: 1,
      limit: limit || 10
    };
    
    fetchCandidates(refreshFilters).then(() => {
      toast({
        title: "✅ Candidates Refreshed",
        description: "Latest candidate data has been loaded",
        duration: 3000,
      });
    }).catch((error) => {
      toast({
        title: "❌ Failed to Refresh Candidates",
        description: "Please try again later",
        variant: "destructive",
        duration: 3000,
      });
    });
  };

  const handleViewTimeline = (candidate: Candidate) => {
    setSelectedTimelineCandidate(candidate);
    setIsTimelineDialogOpen(true);
    toast({
      title: "📅 Timeline Opened",
      description: `Viewing ${candidateService.getCandidateFullName(candidate)}'s timeline`,
      duration: 3000,
    });
  };

  const handleTimelineUpdate = (timeline: TimelineEntry[]) => {
    // Update the candidate's timeline in the local state
    if (selectedTimelineCandidate) {
      const updatedCandidate = { ...selectedTimelineCandidate, timeline };
      setSelectedTimelineCandidate(updatedCandidate);
      
      // Also update in the main candidates list
      const updatedCandidates = candidates.map(candidate => 
        candidate._id === updatedCandidate._id ? updatedCandidate : candidate
      );
      // We would need to update the candidates state here, but since we're using a hook,
      // we'll let the next fetch handle the update
    }
  };

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: "❌ Error Occurred",
        description: error || 'Please refresh the page or try again later',
        variant: "destructive",
        duration: 3000,
      });
      clearError();
    }
  }, [error, clearError]);

  // Debug add dialog state
  useEffect(() => {
    // Debug code removed
  }, [isAddDialogOpen]);

  // Debug candidates array changes
  useEffect(() => {
    // Debug code removed
  }, [candidates]);

  return (
    <div className="space-y-6 p-6 pb-16">
      {showFilters && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Candidates</h2>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={loading}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
              <AddCandidateButton 
                onClick={() => {
                  console.log('Opening add candidate dialog');
                  setIsAddDialogOpen(true);
                }} 
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-sm"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1 h-6 w-6"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-sm">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="text-sm">
                  <Building2 className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="text-sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Applied Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchQuery || statusFilter !== 'all' || departmentFilter !== 'all' || 
              dateRangeFilter !== 'all') && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                  <Filter className="h-4 w-4 shrink-0" />
                  <span className="shrink-0">Active Filters:</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="bg-gray-100 text-xs">
                      Search: {searchQuery}
                    </Badge>
                  )}
                  {statusFilter !== 'all' && (
                    <Badge variant="secondary" className="bg-gray-100 text-xs">
                      Status: {candidateService.getStatusDisplayText(statusFilter as Candidate['status'])}
                    </Badge>
                  )}
                  {departmentFilter !== 'all' && (
                    <Badge variant="secondary" className="bg-gray-100 text-xs">
                      Department: {departmentFilter}
                    </Badge>
                  )}
                  {dateRangeFilter !== 'all' && (
                    <Badge variant="secondary" className="bg-gray-100 text-xs">
                      Date: {dateRangeFilter}
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800 text-xs shrink-0"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {loading && displayedCandidates.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading candidates...</span>
          </div>
        </div>
      ) : displayedCandidates.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all' || departmentFilter !== 'all' || dateRangeFilter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Get started by adding your first candidate'}
            </p>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayedCandidates.map((candidate) => (
            <Card 
              key={candidate._id} 
              className={`hover:shadow-md transition-shadow h-[320px] sm:h-[340px] flex flex-col relative ${
                candidate.status === 'rejected' ? 'opacity-75 bg-gray-50' : ''
              }`}
            >
            <CardHeader className="pb-2 flex-shrink-0">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg leading-tight">
                      {candidateService.getCandidateFullName(candidate)}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs leading-tight">
                      {candidate.currentRole || 'Position not specified'}
                      {candidate.status === 'rejected' && (
                        <span className="text-[10px] text-red-600 font-medium ml-2">
                          (Application Terminated)
                        </span>
                      )}
                    </CardDescription>
                </div>
                  <Badge 
                    variant="outline" 
                    className="border-current/20 text-xs shrink-0"
                    style={{ 
                      backgroundColor: `${getStatusColor(candidate.status)}20`,
                      color: getStatusColor(candidate.status),
                      borderColor: `${getStatusColor(candidate.status)}40`
                    }}
                  >
                    {candidateService.getStatusDisplayText(candidate.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="py-2 flex-1 flex flex-col overflow-hidden">
              <div className="space-y-1.5 flex-shrink-0">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                  <span className="truncate">{candidate.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                  <span className="truncate">{candidate.phone}</span>
                </div>
                  {candidate.department && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                  <span className="truncate">{candidate.department}</span>
                </div>
                  )}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                  <span className="truncate">Applied {new Date(candidate.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                    <span className="truncate">{candidate.experienceYears} years exp</span>
                </div>
              </div>

                {candidate.timeline && candidate.timeline.length > 0 && (
              <div className="mt-1 pt-1 border-t border-gray-100 flex-1 flex flex-col justify-center min-h-0 overflow-auto">
                {/* Horizontal timeline for larger screens */}
                <div className="hidden sm:flex items-center justify-between relative">
                  {candidate.timeline.slice().reverse().slice(0, 4).map((event, index) => (
                    <div key={event._id || index} className="flex flex-col items-center relative flex-1">
                      {/* Connecting line */}
                      {index < candidate.timeline.slice().reverse().slice(0, 4).length - 1 && (
                        <div className="absolute top-1.5 left-1/2 h-0.5 bg-gray-200 z-0" 
                             style={{ 
                               width: 'calc(100% + 12px)', 
                               transform: 'translateX(6px)' 
                             }} />
                      )}
                      
                      {/* Status dot */}
                      <div 
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full z-10 relative cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: getStatusColor(event.subType || 'default') }}
                      onClick={() => handleTimelineClick(event, candidate)}
                        title={`${event.title} - ${new Date(event.createdAt).toLocaleDateString()}`}
                      />
                      
                      {/* Status label */}
                      <div className="mt-0.5 text-center">
                        <p className="text-[10px] sm:text-xs font-medium text-gray-700 truncate max-w-16 sm:max-w-20">
                          {event.type === 'status_change' || event.subType === 'status_change'
                            ? (event.metadata?.newStatus 
                                ? candidateService.getStatusDisplayText(event.metadata.newStatus as Candidate['status'])
                                : candidateService.getStatusDisplayText(event.subType as Candidate['status'])
                              )
                            : (event.subType || event.type)
                          }
                        </p>
                        <p className="text-[8px] sm:text-[10px] text-gray-500 mt-0.5">
                          {new Date(event.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vertical timeline for small screens */}
                <div className="sm:hidden space-y-2 max-h-20 overflow-y-auto">
                  {candidate.timeline.slice().reverse().slice(0, 3).map((event, index) => (
                    <div key={event._id || index} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                         onClick={() => handleTimelineClick(event, candidate)}>
                      {/* Status dot */}
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getStatusColor(event.subType || 'default') }}
                      />
                      
                      {/* Status info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-medium text-gray-700 truncate">
                          {event.type === 'status_change' || event.subType === 'status_change'
                            ? (event.metadata?.newStatus 
                                ? candidateService.getStatusDisplayText(event.metadata.newStatus as Candidate['status'])
                                : candidateService.getStatusDisplayText(event.subType as Candidate['status'])
                              )
                            : (event.subType || event.type)
                          }
                        </p>
                        <p className="text-[8px] text-gray-500">
                          {new Date(event.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {candidate.timeline.length > 4 && (
                  <div className="text-center mt-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[8px] sm:text-[10px] text-gray-500 hover:text-gray-700 h-4 sm:h-6 px-1 sm:px-2"
                      onClick={() => handleViewTimeline(candidate)}
                    >
                      <span className="hidden sm:inline">View all {candidate.timeline.length}</span>
                      <span className="sm:hidden">+{candidate.timeline.length - 3}</span>
                    </Button>
              </div>
                )}
              </div>
                )}

                {/* Spacer when no timeline */}
                {(!candidate.timeline || candidate.timeline.length === 0) && (
                  <div className="flex-1" />
                )}
            </CardContent>
            <CardFooter className="flex gap-1.5 sm:gap-2 pt-2 pb-3 px-3 flex-shrink-0 mt-auto">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 h-6 sm:h-8 text-[10px] sm:text-xs px-1 sm:px-2 py-1 rounded-full bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800"
                onClick={() => {
                  handleViewProfile(candidate);
                }}
              >
                <UserCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                <span className="hidden xs:inline text-[9px] sm:text-[10px]">View </span>
                <span className="text-[9px] sm:text-[10px]">Profile</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 h-6 sm:h-8 text-[10px] sm:text-xs px-1 sm:px-2 py-1 rounded-full bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
                onClick={() => {
                  handleViewResume(candidate);
                }}
              >
                <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                <span className="text-[9px] sm:text-[10px]">Resume</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      )}

      {/* Timeline Event Dialog */}
      <Dialog open={!!selectedTimelineEvent} onOpenChange={() => setSelectedTimelineEvent(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Timeline Event Details
            </DialogTitle>
          </DialogHeader>
          {selectedTimelineEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-8 w-8 text-gray-500" />
                <div>
                  <h3 className="font-semibold">
                    {candidateService.getCandidateFullName(selectedTimelineEvent.candidate)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedTimelineEvent.candidate.currentRole || 'Position not specified'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getStatusColor(selectedTimelineEvent.event.subType || 'default') }}
                    />
                    <span className="font-medium">{selectedTimelineEvent.event.title}</span>
                  </div>
                  <Badge variant="outline" className="bg-gray-50">
                    {new Date(selectedTimelineEvent.event.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{selectedTimelineEvent.event.description}</p>
                </div>

                {selectedTimelineEvent.event.metadata && Object.keys(selectedTimelineEvent.event.metadata).length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Additional Details</h4>
                    <div className="space-y-1">
                      {Object.entries(selectedTimelineEvent.event.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="text-gray-700">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resume Dialog */}
      <Dialog open={!!selectedResume} onOpenChange={() => setSelectedResume(null)}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
          <DialogHeader className="border-b pb-4 flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Resume - {selectedResume && candidateService.getCandidateFullName(selectedResume)}
              </div>
              {selectedResume && selectedResume.resumeLink && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (selectedResume.resumeLink) {
                      // Create a temporary link element to trigger download
                      const link = document.createElement('a');
                      link.href = selectedResume.resumeLink;
                      link.download = `${candidateService.getCandidateFullName(selectedResume)}_Resume`;
                      link.target = '_blank';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      toast({
                        title: "⬇️ Resume Download Started",
                        description: `Downloading ${candidateService.getCandidateFullName(selectedResume)}'s resume`,
                        duration: 3000,
                      });
                    } else {
                      toast({
                        title: "❌ No Resume Available",
                        description: "This candidate has not uploaded a resume",
                        variant: "destructive",
                        duration: 3000,
                      });
                    }
                  }}
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {selectedResume && (
              <div className="space-y-6">
                {selectedResume.resumeLink ? (
                  <>
                    {/* Resume Link */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900">Resume Link</h3>
                          <p className="text-sm text-blue-700">Click to open in new tab</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <a 
                          href={selectedResume.resumeLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline break-all text-sm font-medium"
                        >
                          {selectedResume.resumeLink}
                        </a>
                      </div>
                    </div>

                    {/* Resume Preview */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
                      <div className="bg-blue-100 px-4 py-3 border-b border-blue-200">
                        <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-200 rounded flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-700" />
                          </div>
                          Resume Preview
                        </h3>
                      </div>
                      <div className="p-4 bg-white">
                        {(() => {
                          const url = selectedResume.resumeLink;
                          const isGoogleDrive = url.includes('drive.google.com');
                          const isPDF = url.toLowerCase().includes('.pdf') || url.includes('pdf');
                          const isGoogleDocs = url.includes('docs.google.com');
                          
                          if (isGoogleDrive) {
                            // Convert Google Drive share link to embed link
                            const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
                            if (fileId) {
                              const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                              return (
                                <iframe
                                  src={embedUrl}
                                  className="w-full h-96 border border-blue-200 rounded"
                                  title="Resume Preview"
                                  allow="autoplay"
                                />
                              );
                            }
                          } else if (isGoogleDocs) {
                            // Google Docs embed
                            const embedUrl = url.replace('/edit', '/preview');
                            return (
                              <iframe
                                src={embedUrl}
                                className="w-full h-96 border border-blue-200 rounded"
                                title="Resume Preview"
                              />
                            );
                          } else if (isPDF || url.startsWith('http')) {
                            // Try to embed PDF or other documents
                            return (
                              <div className="space-y-4">
                                <iframe
                                  src={url}
                                  className="w-full h-96 border border-blue-200 rounded"
                                  title="Resume Preview"
                                  onError={(e) => {
                                    console.log('iframe failed to load');
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'block';
                                  }}
                                />
                                <div className="hidden bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FileText className="h-6 w-6 text-yellow-600" />
                                  </div>
                                  <p className="text-yellow-800 font-medium mb-2">Preview Not Available</p>
                                  <p className="text-yellow-700 text-sm mb-3">
                                    This document cannot be previewed directly. Click the link above to view it.
                                  </p>
                                  <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    <FileText className="h-4 w-4" />
                                    Open Resume
                                  </a>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <p className="text-blue-800 font-medium mb-2">Preview Not Available</p>
                                <p className="text-blue-700 text-sm">
                                  This link format cannot be previewed. Click the link above to view the resume.
                                </p>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resume Available</h3>
                    <p className="text-gray-600">
                      No resume link was provided for this candidate.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={() => {
        if (selectedProfile) {
          setSelectedProfile(null);
        }
      }}>
        <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col p-0 rounded-xl overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {selectedProfile && (
                <>
                  {selectedProfile.status === 'rejected' && (
                    <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <X className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-red-800">Application Terminated</h4>
                          <p className="text-sm text-red-600 mt-1">
                            This candidate's application has been rejected. No further status updates or edits are allowed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Candidate Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                          {(selectedProfile.firstName || 'N')[0]}
                          {(selectedProfile.lastName || 'A')[0]}
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900 mb-1">
                            {candidateService.getCandidateFullName(selectedProfile)}
                          </h1>
                          <p className="text-gray-600 text-base font-medium">
                            {selectedProfile.currentRole || 'Position not specified'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant="outline" 
                              className="px-3 py-1 text-sm font-medium"
                              style={{ 
                                backgroundColor: `${getStatusColor(selectedProfile.status)}15`,
                                color: getStatusColor(selectedProfile.status),
                                borderColor: `${getStatusColor(selectedProfile.status)}30`
                              }}
                            >
                              {candidateService.getStatusDisplayText(selectedProfile.status)}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>Applied {new Date(selectedProfile.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={selectedProfile.status === 'rejected'}
                              title={selectedProfile.status === 'rejected' ? 'Cannot update status - Application has been terminated' : ''}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                            >
                              Update Status
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                              if (selectedProfile) {
                                handleUpdateStatus(selectedProfile, 'interview');
                              }
                            }}>
                              Schedule Interview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              if (selectedProfile) {
                                handleUpdateStatus(selectedProfile, 'rejected');
                              }
                            }}>
                              Reject Application
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                       
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="bg-gray-50 hover:bg-gray-100">
                              Actions
                          </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem 
                              onClick={() => selectedProfile && handleSendEmail(selectedProfile)}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => selectedProfile && handleEditCandidate(selectedProfile)}
                              disabled={selectedProfile.status === 'rejected'}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Candidate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => selectedProfile && handleViewResume(selectedProfile)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Resume
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => selectedProfile && handleDeleteCandidate(selectedProfile)}
                              className="text-red-600"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Delete Candidate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-100">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
                      </div>
                      
                      <div className="space-y-5">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Mail className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                            <p className="font-semibold text-gray-900">{selectedProfile.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Phone className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Phone Number</p>
                            <p className="font-semibold text-gray-900">{selectedProfile.phone}</p>
                          </div>
                        </div>
                        
                        {selectedProfile.currentCompany && (
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              <Building2 className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">Current Company</p>
                              <p className="font-semibold text-gray-900">{selectedProfile.currentCompany}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Professional Details */}
                    <div className="bg-green-50 rounded-xl p-6 shadow-sm border border-green-100">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Professional Details</h2>
                      </div>
                      
                      <div className="space-y-5">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Building2 className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Department</p>
                            <p className="font-semibold text-gray-900">{selectedProfile.department || 'Not specified'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Clock className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Experience</p>
                            <p className="font-semibold text-gray-900">{selectedProfile.experienceYears} years</p>
                          </div>
                        </div>
                        
                        {selectedProfile.expectedSalary && (
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              <div className="text-green-600 font-bold text-sm">₹</div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">Expected Salary</p>
                              <p className="font-semibold text-gray-900">₹{selectedProfile.expectedSalary.toLocaleString()}</p>
                            </div>
                          </div>
                        )}
                        
                        {selectedProfile.noticePeriod && (
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              <Calendar className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">Notice Period</p>
                              <p className="font-semibold text-gray-900">{selectedProfile.noticePeriod}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Resume Section */}
                  <div className="bg-yellow-50 rounded-xl p-6 shadow-sm border border-yellow-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <FileText className="h-5 w-5 text-yellow-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Resume & Documents</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <FileText className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500 mb-1">Resume</p>
                          {selectedProfile.resumeLink ? (
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">Available</p>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewResume(selectedProfile)}
                                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-yellow-200 h-7 px-2 text-xs"
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownloadResume(selectedProfile)}
                                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-yellow-200 h-7 px-2 text-xs"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          ) : (
                            <p className="font-semibold text-gray-500">Not uploaded</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Section */}
                  <div className="bg-purple-50 rounded-xl p-6 shadow-sm border border-purple-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Activity className="h-5 w-5 text-purple-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Application Timeline</h2>
                    </div>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {selectedProfile.timeline && selectedProfile.timeline.length > 0 ? (
                        selectedProfile.timeline.map((event: TimelineEntry, index: number) => (
                          <div key={event._id} className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col items-center">
                              <div 
                                className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: getStatusColor(event.subType || 'default') }}
                              />
                              {index < (selectedProfile.timeline?.length || 0) - 1 && (
                                <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-gray-900">
                                  {event.type === 'status_change' || event.subType === 'status_change'
                                    ? (event.metadata?.newStatus 
                                        ? `Status changed to ${candidateService.getStatusDisplayText(event.metadata.newStatus as Candidate['status'])}`
                                        : event.title
                                      )
                                    : event.title
                                  }
                                </p>
                                <Badge variant="outline" className="text-xs bg-gray-50">
                                  {new Date(event.createdAt).toLocaleDateString()}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                              {event.createdBy && (
                                <p className="text-xs text-gray-500">
                                  by {event.createdBy.firstName} {event.createdBy.lastName}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-sm text-gray-500">No timeline events available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes Section */}
                  {selectedProfile.notes && (
                    <div className="bg-orange-50 rounded-xl p-6 shadow-sm border border-orange-100">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                          <FileText className="h-5 w-5 text-orange-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Notes & Comments</h2>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-gray-700 leading-relaxed">{selectedProfile.notes}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Candidate Dialog */}
      <AddCandidateDialog
        isEditMode={true}
        candidate={editingCandidate}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdateCandidate={handleUpdateCandidate}
      />

      {/* Add Candidate Dialog */}
      <AddCandidateDialog
        isEditMode={false}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddCandidate={handleAddCandidate}
      />

      {/* Candidate Timeline Dialog */}
      <CandidateTimelineDialog
        candidate={selectedTimelineCandidate}
        open={isTimelineDialogOpen}
        onOpenChange={setIsTimelineDialogOpen}
        onTimelineUpdate={handleTimelineUpdate}
      />

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={closeConfirmDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmDialog.type === 'danger' && (
                <X className="h-5 w-5 text-red-500" />
              )}
              {confirmDialog.type === 'warning' && (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              {confirmDialog.type === 'info' && (
                <Activity className="h-5 w-5 text-blue-500" />
              )}
              {confirmDialog.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {confirmDialog.message}
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={closeConfirmDialog}
              >
                {confirmDialog.cancelText}
              </Button>
              <Button 
                variant={confirmDialog.type === 'danger' ? 'destructive' : 'default'}
                onClick={handleConfirmAction}
              >
                {confirmDialog.confirmText}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidatesList; 