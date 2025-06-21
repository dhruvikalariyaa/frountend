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
import { AddJobDialog } from '@/components/hiring/AddJobDialog';
import { 
  Search, 
  Filter, 
  Calendar,
  Clock,
  FileText,
  Building2,
  Eye,
  X,
  Briefcase,
  Users,
  MapPin,
  DollarSign
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Mock data for jobs
const mockJobs = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    status: 'Open',
    postedDate: '2024-03-15',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$120,000 - $150,000',
    applicants: 12,
    timeline: [
      { date: '2024-03-15', status: 'Posted', description: 'Job listing published' },
      { date: '2024-03-16', status: 'Active', description: 'Job is now active' },
      { date: '2024-03-17', status: 'Active', description: 'First applications received' }
    ]
  },
  {
    id: 2,
    title: 'Product Manager',
    department: 'Product',
    status: 'Open',
    postedDate: '2024-03-14',
    location: 'Remote',
    type: 'Full-time',
    salary: '$130,000 - $160,000',
    applicants: 8,
    timeline: [
      { date: '2024-03-14', status: 'Posted', description: 'Job listing published' },
      { date: '2024-03-15', status: 'Active', description: 'Job is now active' }
    ]
  },
  {
    id: 3,
    title: 'UX Designer',
    department: 'Design',
    status: 'Closed',
    postedDate: '2024-03-13',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$100,000 - $130,000',
    applicants: 15,
    timeline: [
      { date: '2024-03-13', status: 'Posted', description: 'Job listing published' },
      { date: '2024-03-14', status: 'Active', description: 'Job is now active' },
      { date: '2024-03-15', status: 'Closed', description: 'Position filled' }
    ]
  }
];

interface JobsListProps {
  limit?: number;
  showFilters?: boolean;
}

interface Job {
  id: number;
  title: string;
  department: string;
  status: string;
  postedDate: string;
  location: string;
  type: string;
  salary: string;
  applicants: number;
  timeline: Array<{
    date: string;
    status: string;
    description: string;
  }>;
}

const JobsList: React.FC<JobsListProps> = ({ limit, showFilters = true }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [departmentFilter, setDepartmentFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [dateRangeFilter, setDateRangeFilter] = React.useState('all');
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'postedDate', direction: 'desc' });
  const [selectedTimelineEvent, setSelectedTimelineEvent] = React.useState<{ event: any; job: any } | null>(null);
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
  const [isProfileDirty, setIsProfileDirty] = React.useState(false);
  const [pendingStatus, setPendingStatus] = React.useState<string | null>(null);
  const [jobs, setJobs] = React.useState<Job[]>(mockJobs);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [jobToEdit, setJobToEdit] = React.useState<Job | null>(null);

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
      case 'Open':
        return 'bg-green-50 text-green-700';
      case 'Closed':
        return 'bg-red-50 text-red-700';
      case 'Draft':
        return 'bg-gray-50 text-gray-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const handleUpdateStatus = (newStatus: string) => {
    setPendingStatus(newStatus);
    setIsProfileDirty(true);
  };

  const handleSaveProfile = () => {
    if (pendingStatus && selectedJob) {
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === selectedJob.id 
            ? { ...job, status: pendingStatus }
            : job
        )
      );

      setSelectedJob(prev => prev ? {
        ...prev,
        status: pendingStatus
      } : null);

      const newTimelineEvent = {
        date: new Date().toISOString().split('T')[0],
        status: pendingStatus,
        description: `Status updated to ${pendingStatus}`
      };

      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === selectedJob.id
            ? {
                ...job,
                timeline: [...job.timeline, newTimelineEvent]
              }
            : job
        )
      );

      setSelectedJob(prev => prev ? {
        ...prev,
        timeline: [...prev.timeline, newTimelineEvent]
      } : null);

      toast.success(`Status updated to ${pendingStatus} for ${selectedJob.title}`);
      setPendingStatus(null);
      setIsProfileDirty(false);
    }
  };

  const handleAddJob = (newJob: any) => {
    const jobWithId = {
      ...newJob,
      id: jobs.length + 1,
      postedDate: new Date().toISOString().split('T')[0],
      applicants: 0,
      timeline: [
        {
          date: new Date().toISOString().split('T')[0],
          status: newJob.status.charAt(0).toUpperCase() + newJob.status.slice(1),
          description: 'Job listing published'
        }
      ]
    };
    setJobs(prevJobs => [...prevJobs, jobWithId]);
    toast.success('New job added successfully');
  };

  const handleEditJob = (job: Job) => {
    setJobToEdit(job);
    setIsEditDialogOpen(true);
  };

  const handleUpdateJob = (updatedJob: Job) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === updatedJob.id 
          ? {
              ...updatedJob,
              timeline: [
                ...job.timeline,
                {
                  date: new Date().toISOString().split('T')[0],
                  status: 'Updated',
                  description: 'Job details updated'
                }
              ]
            }
          : job
      )
    );
    toast.success('Job updated successfully');
    setIsEditDialogOpen(false);
    setJobToEdit(null);
  };

  const filteredJobs = React.useMemo(() => {
    return jobs.filter(job => {
      const searchMatch = 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase());

      const statusMatch = statusFilter === 'all' || job.status === statusFilter;
      const departmentMatch = departmentFilter === 'all' || job.department === departmentFilter;
      const typeMatch = typeFilter === 'all' || job.type === typeFilter;

      const postedDate = new Date(job.postedDate);
      const today = new Date();
      const dateMatch = dateRangeFilter === 'all' ||
        (dateRangeFilter === 'today' && postedDate.toDateString() === today.toDateString()) ||
        (dateRangeFilter === 'week' && (today.getTime() - postedDate.getTime()) <= 7 * 24 * 60 * 60 * 1000) ||
        (dateRangeFilter === 'month' && (today.getTime() - postedDate.getTime()) <= 30 * 24 * 60 * 60 * 1000);

      return searchMatch && statusMatch && departmentMatch && typeMatch && dateMatch;
    });
  }, [jobs, searchQuery, statusFilter, departmentFilter, typeFilter, dateRangeFilter]);

  const sortedJobs = React.useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      if (sortConfig.key === 'title') {
        return sortConfig.direction === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      if (sortConfig.key === 'postedDate') {
        return sortConfig.direction === 'asc'
          ? new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime()
          : new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      }
      return 0;
    });
  }, [filteredJobs, sortConfig]);

  const displayedJobs = limit ? sortedJobs.slice(0, limit) : sortedJobs;

  const handleTimelineClick = (event: any, job: any) => {
    setSelectedTimelineEvent({ event, job });
  };

  const handleViewJob = (job: any) => {
    setSelectedJob(job);
  };

  return (
    <div className="space-y-6 p-6 pb-16">
      {showFilters && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold tracking-tight">Jobs</h2>
            <div className="flex items-center gap-4">
              <Select
                value={`${sortConfig.key}-${sortConfig.direction}`}
                onValueChange={(value) => {
                  const [key, direction] = value.split('-');
                  setSortConfig({ key, direction: direction as 'asc' | 'desc' });
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                  <SelectItem value="postedDate-desc">Newest First</SelectItem>
                  <SelectItem value="postedDate-asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
              <AddJobDialog onAddJob={handleAddJob} />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or department..."
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
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
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
                  <SelectValue placeholder="Posted Date" />
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
        {displayedJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <CardDescription className="mt-1">{job.department}</CardDescription>
                </div>
                <Badge variant="outline" className={`${getStatusColor(job.status)} border-current/20`}>
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  {job.salary}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4 text-gray-400" />
                  {job.applicants} applicants
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Posted on {job.postedDate}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-1">
                  {job.timeline.map((event, index) => (
                    <div 
                      key={index} 
                      className="relative flex-1 group"
                      onClick={() => handleTimelineClick(event, job)}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        {index !== job.timeline.length - 1 && (
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
                onClick={() => handleViewJob(job)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleEditJob(job)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Edit Job
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
                <Briefcase className="h-8 w-8 text-gray-500" />
                <div>
                  <h3 className="font-semibold">{selectedTimelineEvent.job.title}</h3>
                  <p className="text-sm text-gray-500">{selectedTimelineEvent.job.department}</p>
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

      <Dialog open={!!selectedJob} onOpenChange={() => {
        if (isProfileDirty) {
          if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
            setSelectedJob(null);
            setIsProfileDirty(false);
            setPendingStatus(null);
          }
        } else {
          setSelectedJob(null);
        }
      }}>
        <DialogContent className="sm:max-w-[800px] h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" />
                {selectedJob?.title}
              </div>
              <div className="flex items-center gap-2">
                {selectedJob && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Update Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleUpdateStatus('Open')}>
                        Mark as Open
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus('Closed')}>
                        Mark as Closed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus('Draft')}>
                        Save as Draft
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
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
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {selectedJob && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">{selectedJob.title}</h3>
                        <p className="text-sm text-gray-500">{selectedJob.department}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={`${getStatusColor(pendingStatus || selectedJob.status)} border-current/20`}>
                          {pendingStatus || selectedJob.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Posted on {selectedJob.postedDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Job Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedJob.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedJob.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedJob.salary}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Application Stats</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedJob.applicants} applicants</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Job Timeline</h3>
                  <div className="space-y-4">
                    {selectedJob.timeline.map((event: any, index: number) => (
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

      <AddJobDialog 
        onAddJob={handleUpdateJob}
        initialData={jobToEdit || undefined}
        isEdit={true}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
};

export default JobsList; 