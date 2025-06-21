import React from 'react';
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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { AddCandidateDialog } from '@/components/hiring/AddCandidateDialog';

interface TimelineEvent {
  date: string;
  status: string;
  description: string;
}

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
  timeline: TimelineEvent[];
}

// Mock data for candidates
const mockCandidates = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 234-567-8901',
    position: 'Senior Frontend Developer',
    department: 'Engineering',
    status: 'Screening',
    appliedDate: '2024-03-15',
    experience: '5 years',
    currentCompany: 'Tech Corp',
    timeline: [
      { date: '2024-03-15', status: 'Applied', description: 'Application received' },
      { date: '2024-03-16', status: 'Screening', description: 'Initial screening started' },
      { date: '2024-03-17', status: 'Screening', description: 'Resume review completed' }
    ]
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 234-567-8902',
    position: 'Product Manager',
    department: 'Product',
    status: 'Interview',
    appliedDate: '2024-03-14',
    experience: '7 years',
    currentCompany: 'Product Inc',
    timeline: [
      { date: '2024-03-14', status: 'Applied', description: 'Application received' },
      { date: '2024-03-15', status: 'Screening', description: 'Initial screening completed' },
      { date: '2024-03-16', status: 'Interview', description: 'Technical interview scheduled' }
    ]
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    phone: '+1 234-567-8903',
    position: 'UX Designer',
    department: 'Design',
    status: 'Offered',
    appliedDate: '2024-03-13',
    experience: '4 years',
    currentCompany: 'Design Studio',
    timeline: [
      { date: '2024-03-13', status: 'Applied', description: 'Application received' },
      { date: '2024-03-14', status: 'Screening', description: 'Portfolio review completed' },
      { date: '2024-03-15', status: 'Interview', description: 'Design challenge completed' },
      { date: '2024-03-16', status: 'Offered', description: 'Offer letter sent' }
    ]
  },
  {
    id: 4,
    name: 'Emily Brown',
    email: 'emily.b@example.com',
    phone: '+1 234-567-8904',
    position: 'Backend Developer',
    department: 'Engineering',
    status: 'Hired',
    appliedDate: '2024-03-12',
    experience: '6 years',
    currentCompany: 'Dev Solutions',
    timeline: [
      { date: '2024-03-12', status: 'Applied', description: 'Application received' },
      { date: '2024-03-13', status: 'Screening', description: 'Technical assessment completed' },
      { date: '2024-03-14', status: 'Interview', description: 'System design interview completed' },
      { date: '2024-03-15', status: 'Offered', description: 'Offer letter sent' },
      { date: '2024-03-16', status: 'Hired', description: 'Offer accepted' }
    ]
  }
];

interface CandidatesListProps {
  limit?: number;
  showFilters?: boolean;
}

const CandidatesList: React.FC<CandidatesListProps> = ({ limit, showFilters = true }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [departmentFilter, setDepartmentFilter] = React.useState('all');
  const [dateRangeFilter, setDateRangeFilter] = React.useState('all');
  const [selectedTimelineEvent, setSelectedTimelineEvent] = React.useState<{ event: TimelineEvent; candidate: Candidate } | null>(null);
  const [selectedResume, setSelectedResume] = React.useState<Candidate | null>(null);
  const [selectedProfile, setSelectedProfile] = React.useState<Candidate | null>(null);
  const [isProfileDirty, setIsProfileDirty] = React.useState(false);
  const [pendingStatus, setPendingStatus] = React.useState<string | null>(null);
  const [candidates, setCandidates] = React.useState<Candidate[]>(mockCandidates);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDepartmentFilter('all');
    setDateRangeFilter('all');
    toast.success('Filters cleared');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-50 text-blue-700';
      case 'Screening':
        return 'bg-yellow-50 text-yellow-700';
      case 'Interview':
        return 'bg-purple-50 text-purple-700';
      case 'Offered':
        return 'bg-green-50 text-green-700';
      case 'Hired':
        return 'bg-emerald-50 text-emerald-700';
      case 'Rejected':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const handleUpdateStatus = (_candidate: Candidate, newStatus: string) => {
    setPendingStatus(newStatus);
    setIsProfileDirty(true);
  };

  const handleAddCandidate = (newCandidate: Omit<Candidate, 'id' | 'appliedDate' | 'timeline'>) => {
    const candidateWithId = {
      ...newCandidate,
      id: candidates.length + 1,
      appliedDate: new Date().toISOString().split('T')[0],
      timeline: [
        {
          date: new Date().toISOString().split('T')[0],
          status: 'Applied',
          description: 'Application received'
        }
      ]
    };
    setCandidates(prevCandidates => [...prevCandidates, candidateWithId]);
    toast.success('New candidate added successfully');
  };

  const handleSaveProfile = () => {
    if (pendingStatus && selectedProfile) {
      // Update the candidate's status in the local state
      setCandidates(prevCandidates => 
        prevCandidates.map(candidate => 
          candidate.id === selectedProfile.id 
            ? { ...candidate, status: pendingStatus }
            : candidate
        )
      );

      // Update the selected profile's status
      setSelectedProfile(prev => prev ? {
        ...prev,
        status: pendingStatus
      } : null);

      // Add a new timeline event
      const newTimelineEvent = {
        date: new Date().toISOString().split('T')[0],
        status: pendingStatus,
        description: `Status updated to ${pendingStatus}`
      };

      setCandidates(prevCandidates =>
        prevCandidates.map(candidate =>
          candidate.id === selectedProfile.id
            ? {
                ...candidate,
                timeline: [...candidate.timeline, newTimelineEvent]
              }
            : candidate
        )
      );

      setSelectedProfile(prev => prev ? {
        ...prev,
        timeline: [...prev.timeline, newTimelineEvent]
      } : null);

      toast.success(`Status updated to ${pendingStatus} for ${selectedProfile.name}`);
      setPendingStatus(null);
      setIsProfileDirty(false);
    }
  };

  const filteredCandidates = React.useMemo(() => {
    return candidates.filter(candidate => {
      // Search filter
      const searchMatch = 
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const statusMatch = statusFilter === 'all' || candidate.status === statusFilter;

      // Department filter
      const departmentMatch = departmentFilter === 'all' || candidate.department === departmentFilter;

      // Date range filter
      const appliedDate = new Date(candidate.appliedDate);
      const today = new Date();
      const dateMatch = dateRangeFilter === 'all' ||
        (dateRangeFilter === 'today' && appliedDate.toDateString() === today.toDateString()) ||
        (dateRangeFilter === 'week' && (today.getTime() - appliedDate.getTime()) <= 7 * 24 * 60 * 60 * 1000) ||
        (dateRangeFilter === 'month' && (today.getTime() - appliedDate.getTime()) <= 30 * 24 * 60 * 60 * 1000);

      return searchMatch && statusMatch && departmentMatch && dateMatch;
    });
  }, [candidates, searchQuery, statusFilter, departmentFilter, dateRangeFilter]);

  const displayedCandidates: Candidate[] = limit ? filteredCandidates.slice(0, limit) : filteredCandidates;

  const handleTimelineClick = (event: TimelineEvent, candidate: Candidate) => {
    setSelectedTimelineEvent({ event, candidate });
  };

  const handleViewProfile = (candidate: Candidate) => {
    setSelectedProfile(candidate);
  };

  const handleViewResume = (candidate: Candidate) => {
    setSelectedResume(candidate);
  };

  const handleDownloadResume = (candidate: Candidate) => {
    toast.success(`Downloading resume for ${candidate.name}`);
  };

  const handleSendEmail = (candidate: Candidate) => {
    const subject = encodeURIComponent(`Regarding your application for ${candidate.position}`);
    const body = encodeURIComponent(`Dear ${candidate.name},\n\n`);
    window.open(`mailto:${candidate.email}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="space-y-6 p-6 pb-16">
      {showFilters && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold tracking-tight">Candidates</h2>
            <div>
              <AddCandidateDialog onAddCandidate={handleAddCandidate} />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
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
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Screening">Screening</SelectItem>
                  <SelectItem value="Interview">Interview</SelectItem>
                  <SelectItem value="Offered">Offered</SelectItem>
                  <SelectItem value="Hired">Hired</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <Building2 className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger>
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
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Filter className="h-4 w-4" />
                  <span>Active Filters:</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="bg-gray-100">
                      Search: {searchQuery}
                    </Badge>
                  )}
                  {statusFilter !== 'all' && (
                    <Badge variant="secondary" className="bg-gray-100">
                      Status: {statusFilter}
                    </Badge>
                  )}
                  {departmentFilter !== 'all' && (
                    <Badge variant="secondary" className="bg-gray-100">
                      Department: {departmentFilter}
                    </Badge>
                  )}
                  {dateRangeFilter !== 'all' && (
                    <Badge variant="secondary" className="bg-gray-100">
                      Date: {dateRangeFilter}
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedCandidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{candidate.name}</CardTitle>
                  <CardDescription className="mt-1">{candidate.position}</CardDescription>
                </div>
                <Badge variant="outline" className={`${getStatusColor(candidate.status)} border-current/20`}>
                  {candidate.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {candidate.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {candidate.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  {candidate.department}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Applied on {candidate.appliedDate}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-1">
                  {candidate.timeline.map((event, index) => (
                    <div 
                      key={index} 
                      className="relative flex-1 group"
                      onClick={() => handleTimelineClick(event, candidate)}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        {index !== candidate.timeline.length - 1 && (
                          <div className="flex-1 h-0.5 bg-gray-200" />
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-600 text-center">
                        {event.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleViewProfile(candidate)}
              >
                <UserCircle className="h-4 w-4 mr-2" />
                View Profile
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleViewResume(candidate)}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Resume
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

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
                  <h3 className="font-semibold">{selectedTimelineEvent.candidate.name}</h3>
                  <p className="text-sm text-gray-500">{selectedTimelineEvent.candidate.position}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="font-medium">{selectedTimelineEvent.event.status}</span>
                  </div>
                  <Badge variant="outline" className="bg-gray-50">
                    {selectedTimelineEvent.event.date}
                  </Badge>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{selectedTimelineEvent.event.description}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedResume} onOpenChange={() => setSelectedResume(null)}>
        <DialogContent className="sm:max-w-[800px] h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Resume - {selectedResume?.name}
              </div>
              {selectedResume && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => selectedResume && handleDownloadResume(selectedResume)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {selectedResume && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedResume.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedResume.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedResume.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Experience</h3>
                  <p className="font-medium">{selectedResume.experience} years</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Applied Position</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Position</p>
                      <p className="font-medium">{selectedResume.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{selectedResume.department}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedProfile} onOpenChange={() => {
        if (isProfileDirty) {
          if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
            setSelectedProfile(null);
            setIsProfileDirty(false);
            setPendingStatus(null);
          }
        } else {
          setSelectedProfile(null);
        }
      }}>
        <DialogContent className="sm:max-w-[800px] h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-blue-500" />
                {selectedProfile?.name}'s Profile
              </div>
              {selectedProfile && (
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Update Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => selectedProfile && handleUpdateStatus(selectedProfile, 'Screening')}>
                        Move to Screening
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => selectedProfile && handleUpdateStatus(selectedProfile, 'Interview')}>
                        Schedule Interview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => selectedProfile && handleUpdateStatus(selectedProfile, 'Offered')}>
                        Send Offer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => selectedProfile && handleUpdateStatus(selectedProfile, 'Hired')}>
                        Mark as Hired
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => selectedProfile && handleUpdateStatus(selectedProfile, 'Rejected')}>
                        Reject Application
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                 
                  {isProfileDirty && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={handleSaveProfile}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Save Changes
                    </Button>
                  )}
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {selectedProfile && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">{selectedProfile.name}</h3>
                        <p className="text-sm text-gray-500">{selectedProfile.position}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={`${getStatusColor(pendingStatus || selectedProfile.status)} border-current/20`}>
                          {pendingStatus || selectedProfile.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Applied on {selectedProfile.appliedDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => selectedProfile && handleSendEmail(selectedProfile)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => selectedProfile && handleViewResume(selectedProfile)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Resume
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedProfile.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedProfile.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedProfile.currentCompany}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Application Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="font-medium">{selectedProfile.department}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="font-medium">{selectedProfile.experience} years</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Application Timeline</h3>
                  <div className="space-y-4">
                    {selectedProfile.timeline.map((event: TimelineEvent, index: number) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{event.status}</p>
                            <Badge variant="outline" className="text-xs">
                              {event.date}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Notes</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full bg-gray-400 mt-2" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Initial Screening</p>
                          <Badge variant="outline" className="text-xs">
                            {selectedProfile.appliedDate}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Candidate has strong experience in {selectedProfile.department} with {selectedProfile.experience} years of relevant work.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidatesList; 