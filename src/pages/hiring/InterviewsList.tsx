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
  Building2,
  Eye,
  X,
  Users,
  Video,
  CalendarClock,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { AddInterviewDialog } from '@/components/hiring/AddInterviewDialog';

// Mock data for interviews
const mockInterviews = [
  {
    id: 1,
    candidateName: 'John Smith',
    position: 'Senior Frontend Developer',
    department: 'Engineering',
    status: 'Scheduled',
    interviewDate: '2024-03-20',
    interviewTime: '10:00 AM',
    interviewType: 'Technical',
    interviewers: ['Sarah Johnson', 'Mike Chen'],
    location: 'Conference Room A',
    notes: 'Focus on React and TypeScript experience',
    timeline: [
      { date: '2024-03-15', status: 'Scheduled', description: 'Interview scheduled' },
      { date: '2024-03-16', status: 'Confirmed', description: 'Candidate confirmed attendance' },
      { date: '2024-03-17', status: 'Scheduled', description: 'Interviewer assigned' }
    ]
  },
  {
    id: 2,
    candidateName: 'Sarah Johnson',
    position: 'Product Manager',
    department: 'Product',
    status: 'Completed',
    interviewDate: '2024-03-18',
    interviewTime: '2:00 PM',
    interviewType: 'Behavioral',
    interviewers: ['Alex Brown', 'Lisa Wang'],
    location: 'Virtual Meeting',
    notes: 'Focus on product strategy and team management',
    timeline: [
      { date: '2024-03-15', status: 'Scheduled', description: 'Interview scheduled' },
      { date: '2024-03-16', status: 'Confirmed', description: 'Candidate confirmed attendance' },
      { date: '2024-03-18', status: 'Completed', description: 'Interview completed' }
    ]
  },
  {
    id: 3,
    candidateName: 'Michael Chen',
    position: 'UX Designer',
    department: 'Design',
    status: 'Cancelled',
    interviewDate: '2024-03-19',
    interviewTime: '11:00 AM',
    interviewType: 'Portfolio Review',
    interviewers: ['Emma Davis'],
    location: 'Design Studio',
    notes: 'Review portfolio and design process',
    timeline: [
      { date: '2024-03-15', status: 'Scheduled', description: 'Interview scheduled' },
      { date: '2024-03-17', status: 'Cancelled', description: 'Candidate requested reschedule' }
    ]
  }
];

interface InterviewsListProps {
  limit?: number;
  showFilters?: boolean;
}

const InterviewsList: React.FC<InterviewsListProps> = ({ limit, showFilters = true }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [departmentFilter, setDepartmentFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [dateRangeFilter, setDateRangeFilter] = React.useState('all');
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'interviewDate', direction: 'desc' });
  const [selectedTimelineEvent, setSelectedTimelineEvent] = React.useState<{ event: any; interview: any } | null>(null);
  const [selectedInterview, setSelectedInterview] = React.useState<any>(null);
  const [isInterviewDirty, setIsInterviewDirty] = React.useState(false);
  const [pendingStatus, setPendingStatus] = React.useState<string | null>(null);
  const [interviews, setInterviews] = React.useState(mockInterviews);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = React.useState(false);
  const [interviewToReschedule, setInterviewToReschedule] = React.useState<any | null>(null);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDepartmentFilter('all');
    setTypeFilter('all');
    setDateRangeFilter('all');
    setSortConfig({ key: 'interviewDate', direction: 'desc' });
    toast.success('Filters reset successfully');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDepartmentFilter('all');
    setTypeFilter('all');
    setDateRangeFilter('all');
    toast.success('Filters cleared');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-50 text-blue-700';
      case 'Confirmed':
        return 'bg-green-50 text-green-700';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700';
      case 'Cancelled':
        return 'bg-red-50 text-red-700';
      case 'Rescheduled':
        return 'bg-yellow-50 text-yellow-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const handleUpdateStatus = (newStatus: string) => {
    setPendingStatus(newStatus);
    setIsInterviewDirty(true);
  };

  const handleSaveInterview = () => {
    if (pendingStatus && selectedInterview) {
      setInterviews(prevInterviews => 
        prevInterviews.map(interview => 
          interview.id === selectedInterview.id 
            ? { ...interview, status: pendingStatus }
            : interview
        )
      );

      setSelectedInterview((prev: any) => ({
        ...prev,
        status: pendingStatus
      }));

      const newTimelineEvent = {
        date: new Date().toISOString().split('T')[0],
        status: pendingStatus,
        description: `Status updated to ${pendingStatus}`
      };

      setInterviews(prevInterviews =>
        prevInterviews.map(interview =>
          interview.id === selectedInterview.id
            ? {
                ...interview,
                timeline: [...interview.timeline, newTimelineEvent]
              }
            : interview
        )
      );

      setSelectedInterview((prev: any) => ({
        ...prev,
        timeline: [...prev.timeline, newTimelineEvent]
      }));

      toast.success(`Status updated to ${pendingStatus} for ${selectedInterview.candidateName}`);
      setPendingStatus(null);
      setIsInterviewDirty(false);
    }
  };

  const filteredInterviews = React.useMemo(() => {
    return interviews.filter(interview => {
      const searchMatch = 
        interview.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.position.toLowerCase().includes(searchQuery.toLowerCase());

      const statusMatch = statusFilter === 'all' || interview.status === statusFilter;
      const departmentMatch = departmentFilter === 'all' || interview.department === departmentFilter;
      const typeMatch = typeFilter === 'all' || interview.interviewType === typeFilter;

      const interviewDate = new Date(interview.interviewDate);
      const today = new Date();
      const dateMatch = dateRangeFilter === 'all' ||
        (dateRangeFilter === 'today' && interviewDate.toDateString() === today.toDateString()) ||
        (dateRangeFilter === 'week' && (today.getTime() - interviewDate.getTime()) <= 7 * 24 * 60 * 60 * 1000) ||
        (dateRangeFilter === 'month' && (today.getTime() - interviewDate.getTime()) <= 30 * 24 * 60 * 60 * 1000);

      return searchMatch && statusMatch && departmentMatch && typeMatch && dateMatch;
    });
  }, [interviews, searchQuery, statusFilter, departmentFilter, typeFilter, dateRangeFilter]);

  const sortedInterviews = React.useMemo(() => {
    return [...filteredInterviews].sort((a, b) => {
      if (sortConfig.key === 'candidateName') {
        return sortConfig.direction === 'asc' 
          ? a.candidateName.localeCompare(b.candidateName)
          : b.candidateName.localeCompare(a.candidateName);
      }
      if (sortConfig.key === 'interviewDate') {
        return sortConfig.direction === 'asc'
          ? new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime()
          : new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime();
      }
      return 0;
    });
  }, [filteredInterviews, sortConfig]);

  const displayedInterviews = limit ? sortedInterviews.slice(0, limit) : sortedInterviews;

  const handleTimelineClick = (event: any, interview: any) => {
    setSelectedTimelineEvent({ event, interview });
  };

  const handleViewInterview = (interview: any) => {
    setSelectedInterview(interview);
  };

  const handleRescheduleInterview = (interview: any) => {
    setInterviewToReschedule(interview);
    setIsRescheduleDialogOpen(true);
  };

  const handleSendReminder = (interview: any) => {
    toast.success(`Reminder sent to ${interview.candidateName}`);
  };

  const handleAddInterview = (newInterview: any) => {
    setInterviews(prevInterviews => [...prevInterviews, newInterview]);
    toast.success('New interview scheduled successfully');
  };

  const handleUpdateInterview = (updatedInterview: any) => {
    setInterviews(prevInterviews =>
      prevInterviews.map(interview =>
        interview.id === updatedInterview.id ? updatedInterview : interview
      )
    );
    if (selectedInterview?.id === updatedInterview.id) {
      setSelectedInterview(updatedInterview);
    }
    toast.success(`Interview rescheduled for ${updatedInterview.candidateName}`);
    setIsRescheduleDialogOpen(false);
    setInterviewToReschedule(null);
  };

  return (
    <div className="space-y-6 p-6 pb-16">
      {showFilters && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold tracking-tight">Interviews</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('candidateName')}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Sort by Name
                {sortConfig.key === 'candidateName' && (
                  <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('interviewDate')}
                className="flex items-center gap-2"
              >
                <CalendarClock className="h-4 w-4" />
                Sort by Date
                {sortConfig.key === 'interviewDate' && (
                  <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </Button>
              <AddInterviewDialog onAddInterview={handleAddInterview} />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by candidate or position..."
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
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Rescheduled">Rescheduled</SelectItem>
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

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <Video className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Interview Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Behavioral">Behavioral</SelectItem>
                  <SelectItem value="Portfolio Review">Portfolio Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchQuery || statusFilter !== 'all' || departmentFilter !== 'all' || 
              typeFilter !== 'all') && (
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
                  {typeFilter !== 'all' && (
                    <Badge variant="secondary" className="bg-gray-100">
                      Type: {typeFilter}
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
        {displayedInterviews.map((interview) => (
          <Card key={interview.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{interview.candidateName}</CardTitle>
                  <CardDescription className="mt-1">{interview.position}</CardDescription>
                </div>
                <Badge variant="outline" className={`${getStatusColor(interview.status)} border-current/20`}>
                  {interview.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarClock className="h-4 w-4 text-gray-400" />
                  {interview.interviewDate} at {interview.interviewTime}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  {interview.department}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Video className="h-4 w-4 text-gray-400" />
                  {interview.interviewType}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4 text-gray-400" />
                  {interview.interviewers.join(', ')}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-1">
                  {interview.timeline.map((event, index) => (
                    <div 
                      key={index} 
                      className="relative flex-1 group"
                      onClick={() => handleTimelineClick(event, interview)}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        {index !== interview.timeline.length - 1 && (
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
                onClick={() => handleViewInterview(interview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleRescheduleInterview(interview)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Reschedule
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
                  <h3 className="font-semibold">{selectedTimelineEvent.interview.candidateName}</h3>
                  <p className="text-sm text-gray-500">{selectedTimelineEvent.interview.position}</p>
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

      <Dialog open={!!selectedInterview} onOpenChange={() => {
        if (isInterviewDirty) {
          if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
            setSelectedInterview(null);
            setIsInterviewDirty(false);
            setPendingStatus(null);
          }
        } else {
          setSelectedInterview(null);
        }
      }}>
        <DialogContent className="sm:max-w-[800px] h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-blue-500" />
                Interview Details - {selectedInterview?.candidateName}
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Update Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleUpdateStatus('Scheduled')}>
                      Mark as Scheduled
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateStatus('Confirmed')}>
                      Mark as Confirmed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateStatus('Completed')}>
                      Mark as Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateStatus('Cancelled')}>
                      Mark as Cancelled
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateStatus('Rescheduled')}>
                      Mark as Rescheduled
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
               
                {isInterviewDirty && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleSaveInterview}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save Changes
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {selectedInterview && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">{selectedInterview.candidateName}</h3>
                        <p className="text-sm text-gray-500">{selectedInterview.position}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={`${getStatusColor(pendingStatus || selectedInterview.status)} border-current/20`}>
                          {pendingStatus || selectedInterview.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {selectedInterview.interviewDate} at {selectedInterview.interviewTime}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSendReminder(selectedInterview)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Reminder
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRescheduleInterview(selectedInterview)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Reschedule
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Interview Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium">{selectedInterview.interviewType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{selectedInterview.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="font-medium">{selectedInterview.department}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Interviewers</h3>
                    <div className="space-y-3">
                      {selectedInterview.interviewers.map((interviewer: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{interviewer}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Notes</h3>
                  <p className="text-gray-600">{selectedInterview.notes}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Interview Timeline</h3>
                  <div className="space-y-4">
                    {selectedInterview.timeline.map((event: any, index: number) => (
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
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddInterviewDialog
        onAddInterview={handleUpdateInterview}
        isReschedule={true}
        interviewToReschedule={interviewToReschedule}
        open={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
      />
    </div>
  );
};

export default InterviewsList; 