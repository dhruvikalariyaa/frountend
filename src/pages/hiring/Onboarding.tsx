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
  Eye,
  X,
  CheckCircle2,
  Upload
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Task {
  id: number;
  title: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Delayed';
  dueDate: string;
}

interface TimelineEvent {
  date: string;
  status: string;
  description: string;
}

interface RequiredDocument {
  id: number;
  name: string;
  description: string;
  isRequired: boolean;
  status: 'Pending' | 'Uploaded' | 'Verified' | 'Completed';
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

interface OnboardingTask {
  id: number;
  employeeName: string;
  position: string;
  department: string;
  status: string;
  startDate: string;
  dueDate: string;
  tasks: Task[];
  timeline: TimelineEvent[];
  requiredDocuments: RequiredDocument[];
  emergencyContact?: EmergencyContact;
}

// Update mock data to remove Emergency Contact from required documents
const mockOnboardingTasks: OnboardingTask[] = [
  {
    id: 1,
    employeeName: 'John Smith',
    position: 'Senior Frontend Developer',
    department: 'Engineering',
    status: 'In Progress',
    startDate: '2024-03-20',
    dueDate: '2024-03-27',
    tasks: [
      { id: 1, title: 'Complete HR Documentation', status: 'Completed', dueDate: '2024-03-21' },
      { id: 2, title: 'Set up Development Environment', status: 'In Progress', dueDate: '2024-03-22' },
      { id: 3, title: 'Team Introduction Meeting', status: 'Pending', dueDate: '2024-03-23' },
      { id: 4, title: 'Project Overview Session', status: 'Pending', dueDate: '2024-03-24' }
    ],
    timeline: [
      { date: '2024-03-20', status: 'Started', description: 'Onboarding process initiated' },
      { date: '2024-03-21', status: 'In Progress', description: 'HR documentation completed' }
    ],
    requiredDocuments: [
      { id: 1, name: 'ID Proof', description: 'Government issued ID card or passport', isRequired: true, status: 'Pending' },
      { id: 2, name: 'Resume', description: 'Updated resume with work experience', isRequired: true, status: 'Pending' },
      { id: 3, name: 'Educational Certificates', description: 'Degree certificates and transcripts', isRequired: true, status: 'Pending' },
      { id: 4, name: 'Address Proof', description: 'Utility bill or rental agreement', isRequired: true, status: 'Pending' },
      { id: 5, name: 'Tax Documents', description: 'PAN card and tax declaration forms', isRequired: true, status: 'Pending' },
      { id: 6, name: 'Bank Details', description: 'Bank account details for salary', isRequired: true, status: 'Pending' },
      { id: 7, name: 'Medical Insurance', description: 'Medical insurance documents', isRequired: false, status: 'Pending' }
    ]
  },
  {
    id: 2,
    employeeName: 'Sarah Johnson',
    position: 'Product Manager',
    department: 'Product',
    status: 'Completed',
    startDate: '2024-03-15',
    dueDate: '2024-03-22',
    tasks: [
      { id: 1, title: 'Complete HR Documentation', status: 'Completed', dueDate: '2024-03-16' },
      { id: 2, title: 'Set up Development Environment', status: 'Completed', dueDate: '2024-03-17' },
      { id: 3, title: 'Team Introduction Meeting', status: 'Completed', dueDate: '2024-03-18' },
      { id: 4, title: 'Project Overview Session', status: 'Completed', dueDate: '2024-03-19' }
    ],
    timeline: [
      { date: '2024-03-15', status: 'Started', description: 'Onboarding process initiated' },
      { date: '2024-03-22', status: 'Completed', description: 'All onboarding tasks completed' }
    ],
    requiredDocuments: [
      { id: 1, name: 'ID Proof', description: 'Government issued ID card or passport', isRequired: true, status: 'Verified' },
      { id: 2, name: 'Resume', description: 'Updated resume with work experience', isRequired: true, status: 'Verified' },
      { id: 3, name: 'Educational Certificates', description: 'Degree certificates and transcripts', isRequired: true, status: 'Verified' },
      { id: 4, name: 'Address Proof', description: 'Utility bill or rental agreement', isRequired: true, status: 'Verified' },
      { id: 5, name: 'Tax Documents', description: 'PAN card and tax declaration forms', isRequired: true, status: 'Verified' },
      { id: 6, name: 'Bank Details', description: 'Bank account details for salary', isRequired: true, status: 'Verified' },
      { id: 7, name: 'Medical Insurance', description: 'Medical insurance documents', isRequired: false, status: 'Verified' }
    ]
  },
  {
    id: 3,
    employeeName: 'Michael Chen',
    position: 'UX Designer',
    department: 'Design',
    status: 'Pending',
    startDate: '2024-03-25',
    dueDate: '2024-04-01',
    tasks: [
      { id: 1, title: 'Complete HR Documentation', status: 'Pending', dueDate: '2024-03-26' },
      { id: 2, title: 'Set up Development Environment', status: 'Pending', dueDate: '2024-03-27' },
      { id: 3, title: 'Team Introduction Meeting', status: 'Pending', dueDate: '2024-03-28' },
      { id: 4, title: 'Project Overview Session', status: 'Pending', dueDate: '2024-03-29' }
    ],
    timeline: [
      { date: '2024-03-25', status: 'Scheduled', description: 'Onboarding process scheduled' }
    ],
    requiredDocuments: [
      { id: 1, name: 'ID Proof', description: 'Government issued ID card or passport', isRequired: true, status: 'Pending' },
      { id: 2, name: 'Resume', description: 'Updated resume with work experience', isRequired: true, status: 'Pending' },
      { id: 3, name: 'Educational Certificates', description: 'Degree certificates and transcripts', isRequired: true, status: 'Pending' },
      { id: 4, name: 'Address Proof', description: 'Utility bill or rental agreement', isRequired: true, status: 'Pending' },
      { id: 5, name: 'Tax Documents', description: 'PAN card and tax declaration forms', isRequired: true, status: 'Pending' },
      { id: 6, name: 'Bank Details', description: 'Bank account details for salary', isRequired: true, status: 'Pending' },
      { id: 7, name: 'Medical Insurance', description: 'Medical insurance documents', isRequired: false, status: 'Pending' }
    ]
  }
];

interface OnboardingListProps {
  limit?: number;
  showFilters?: boolean;
}

const Onboarding: React.FC<OnboardingListProps> = ({ limit, showFilters = true }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [departmentFilter, setDepartmentFilter] = React.useState('all');
  const [dateRangeFilter, setDateRangeFilter] = React.useState('all');
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'startDate', direction: 'desc' });
  const [selectedTimelineEvent, setSelectedTimelineEvent] = React.useState<{ event: TimelineEvent; onboarding: OnboardingTask } | null>(null);
  const [selectedOnboarding, setSelectedOnboarding] = React.useState<OnboardingTask | null>(null);
  const [onboardingTasks, setOnboardingTasks] = React.useState<OnboardingTask[]>(mockOnboardingTasks);
  const [uploadingDocument, setUploadingDocument] = React.useState<number | null>(null);
  const fileInputRefs = React.useRef<{ [key: number]: HTMLInputElement | null }>({});
  const [emergencyContact, setEmergencyContact] = React.useState<EmergencyContact>({
    name: '',
    relationship: '',
    phone: '',
    email: ''
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDepartmentFilter('all');
    setDateRangeFilter('all');
    toast.success('Filters cleared');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-50 text-blue-700';
      case 'Completed':
        return 'bg-green-50 text-green-700';
      case 'Pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'Delayed':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-50 text-green-700';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700';
      case 'Pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'Delayed':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const handleUpdateTaskStatus = (onboardingId: number, taskId: number, newStatus: Task['status']) => {
    setOnboardingTasks((prevTasks: OnboardingTask[]) =>
      prevTasks.map((onboarding: OnboardingTask) =>
        onboarding.id === onboardingId
          ? {
              ...onboarding,
              tasks: onboarding.tasks.map((task: Task) =>
                task.id === taskId
                  ? { ...task, status: newStatus }
                  : task
              ),
              timeline: [
                ...onboarding.timeline,
                {
                  date: new Date().toISOString().split('T')[0],
                  status: 'Updated',
                  description: `Task "${onboarding.tasks.find((t: Task) => t.id === taskId)?.title}" marked as ${newStatus}`
                }
              ]
            }
          : onboarding
      )
    );

    if (selectedOnboarding?.id === onboardingId) {
      setSelectedOnboarding((prev: OnboardingTask | null) => {
        if (!prev) return null;
        return {
          ...prev,
          tasks: prev.tasks.map((task: Task) =>
            task.id === taskId
              ? { ...task, status: newStatus }
              : task
          ),
          timeline: [
            ...prev.timeline,
            {
              date: new Date().toISOString().split('T')[0],
              status: 'Updated',
              description: `Task "${prev.tasks.find((t: Task) => t.id === taskId)?.title}" marked as ${newStatus}`
            }
          ]
        };
      });
    }

    toast.success('Task status updated successfully');
  };

  const handleDocumentUpload = (documentId: number, file: File) => {
    // Basic file validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, JPEG, or PNG files only.');
      return;
    }

    if (file.size > maxSize) {
      toast.error('File size too large. Maximum size is 5MB.');
      return;
    }

    setUploadingDocument(documentId);
    // Simulate file upload
    setTimeout(() => {
      setOnboardingTasks(prevTasks =>
        prevTasks.map(onboarding =>
          onboarding.id === selectedOnboarding?.id
            ? {
                ...onboarding,
                requiredDocuments: onboarding.requiredDocuments.map(doc =>
                  doc.id === documentId
                    ? { 
                        ...doc, 
                        status: 'Uploaded',
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type,
                        uploadDate: new Date().toISOString()
                      }
                    : doc
                ),
                timeline: [
                  ...onboarding.timeline,
                  {
                    date: new Date().toISOString().split('T')[0],
                    status: 'Document Uploaded',
                    description: `Uploaded ${onboarding.requiredDocuments.find(d => d.id === documentId)?.name} (${file.name})`
                  }
                ]
              }
            : onboarding
        )
      );
      setUploadingDocument(null);
      toast.success(`Successfully uploaded ${file.name}`);
    }, 1500);
  };

  const handleVerifyDocument = (documentId: number) => {
    setOnboardingTasks(prevTasks =>
      prevTasks.map(onboarding =>
        onboarding.id === selectedOnboarding?.id
          ? {
              ...onboarding,
              requiredDocuments: onboarding.requiredDocuments.map(doc =>
                doc.id === documentId
                  ? { ...doc, status: 'Verified' }
                  : doc
              ),
              timeline: [
                ...onboarding.timeline,
                {
                  date: new Date().toISOString().split('T')[0],
                  status: 'Document Verified',
                  description: `Verified ${onboarding.requiredDocuments.find(d => d.id === documentId)?.name}`
                }
              ]
            }
          : onboarding
      )
    );
    toast.success('Document verified successfully');
  };

  const handleRejectDocument = (documentId: number) => {
    setOnboardingTasks(prevTasks =>
      prevTasks.map(onboarding =>
        onboarding.id === selectedOnboarding?.id
          ? {
              ...onboarding,
              requiredDocuments: onboarding.requiredDocuments.map(doc =>
                doc.id === documentId
                  ? { ...doc, status: 'Pending' }
                  : doc
              ),
              timeline: [
                ...onboarding.timeline,
                {
                  date: new Date().toISOString().split('T')[0],
                  status: 'Document Rejected',
                  description: `Rejected ${onboarding.requiredDocuments.find(d => d.id === documentId)?.name}`
                }
              ]
            }
          : onboarding
      )
    );
    toast.error('Document rejected');
  };

  const handleEmergencyContactSubmit = () => {
    setOnboardingTasks(prevTasks =>
      prevTasks.map(onboarding =>
        onboarding.id === selectedOnboarding?.id
          ? {
              ...onboarding,
              emergencyContact,
              timeline: [
                ...onboarding.timeline,
                {
                  date: new Date().toISOString().split('T')[0],
                  status: 'Emergency Contact Added',
                  description: `Added emergency contact: ${emergencyContact.name}`
                }
              ]
            }
          : onboarding
      )
    );
    toast.success('Emergency contact added successfully');
  };

  const filteredOnboardingTasks = React.useMemo(() => {
    return onboardingTasks.filter(onboarding => {
      const searchMatch = 
        onboarding.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        onboarding.position.toLowerCase().includes(searchQuery.toLowerCase());

      const statusMatch = statusFilter === 'all' || onboarding.status === statusFilter;
      const departmentMatch = departmentFilter === 'all' || onboarding.department === departmentFilter;

      const startDate = new Date(onboarding.startDate);
      const today = new Date();
      const dateMatch = dateRangeFilter === 'all' ||
        (dateRangeFilter === 'today' && startDate.toDateString() === today.toDateString()) ||
        (dateRangeFilter === 'week' && (today.getTime() - startDate.getTime()) <= 7 * 24 * 60 * 60 * 1000) ||
        (dateRangeFilter === 'month' && (today.getTime() - startDate.getTime()) <= 30 * 24 * 60 * 60 * 1000);

      return searchMatch && statusMatch && departmentMatch && dateMatch;
    });
  }, [onboardingTasks, searchQuery, statusFilter, departmentFilter, dateRangeFilter]);

  const sortedOnboardingTasks = React.useMemo(() => {
    return [...filteredOnboardingTasks].sort((a, b) => {
      if (sortConfig.key === 'employeeName') {
        return sortConfig.direction === 'asc' 
          ? a.employeeName.localeCompare(b.employeeName)
          : b.employeeName.localeCompare(a.employeeName);
      }
      if (sortConfig.key === 'startDate') {
        return sortConfig.direction === 'asc'
          ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          : new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      return 0;
    });
  }, [filteredOnboardingTasks, sortConfig]);

  const displayedOnboardingTasks = limit ? sortedOnboardingTasks.slice(0, limit) : sortedOnboardingTasks;

  const handleTimelineClick = (event: TimelineEvent, onboarding: OnboardingTask) => {
    setSelectedTimelineEvent({ event, onboarding });
  };

  const handleViewOnboarding = (onboarding: OnboardingTask) => {
    setSelectedOnboarding(onboarding);
  };

  const handleSendReminder = (onboarding: OnboardingTask) => {
    if (!onboarding) return;
    toast.success(`Reminder sent to ${onboarding.employeeName}`);
  };

  return (
    <div className="space-y-6 p-6 pb-16">
      {showFilters && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold tracking-tight">Onboarding</h2>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by employee or position..."
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
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
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
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
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
        <div className="col-span-full flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('employeeName')}
              className="flex items-center gap-2"
            >
              Employee Name
              {sortConfig.key === 'employeeName' && (
                <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('startDate')}
              className="flex items-center gap-2"
            >
              Start Date
              {sortConfig.key === 'startDate' && (
                <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            {displayedOnboardingTasks.length} employees
          </div>
        </div>
        {displayedOnboardingTasks.map((onboarding) => (
          <Card key={onboarding.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{onboarding.employeeName}</CardTitle>
                  <CardDescription className="mt-1">{onboarding.position}</CardDescription>
                </div>
                <Badge variant="outline" className={`${getStatusColor(onboarding.status)} border-current/20`}>
                  {onboarding.status}
                  </Badge>
              </div>
            </CardHeader>
            <CardContent>
                  <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {onboarding.startDate} - {onboarding.dueDate}
                      </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building2 className="h-4 w-4 text-gray-400" />
                  {onboarding.department}
                      </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-gray-400" />
                  {onboarding.tasks.filter(t => t.status === 'Completed').length} / {onboarding.tasks.length} tasks completed
                      </div>
                    </div>

              <div className="mt-4">
                <div className="flex items-center gap-1">
                  {onboarding.timeline.map((event, index) => (
                    <div 
                      key={index} 
                      className="relative flex-1 group"
                      onClick={() => handleTimelineClick(event, onboarding)}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        {index !== onboarding.timeline.length - 1 && (
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
                onClick={() => handleViewOnboarding(onboarding)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
                  </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleSendReminder(onboarding)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Reminder
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
                  <h3 className="font-semibold">{selectedTimelineEvent.onboarding.employeeName}</h3>
                  <p className="text-sm text-gray-500">{selectedTimelineEvent.onboarding.position}</p>
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

      <Dialog open={!!selectedOnboarding} onOpenChange={() => setSelectedOnboarding(null)}>
        <DialogContent className="sm:max-w-[800px] h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-blue-500" />
                Onboarding Details - {selectedOnboarding?.employeeName}
                  </div>
              <div className="flex items-center gap-2">
                {selectedOnboarding && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSendReminder(selectedOnboarding)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                )}
                </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {selectedOnboarding && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">{selectedOnboarding.employeeName}</h3>
                        <p className="text-sm text-gray-500">{selectedOnboarding.position}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={`${getStatusColor(selectedOnboarding.status)} border-current/20`}>
                          {selectedOnboarding.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {selectedOnboarding.startDate} - {selectedOnboarding.dueDate}
                        </span>
                      </div>
                        </div>
                  </div>
                </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Onboarding Tasks</h3>
                  <div className="space-y-4">
                    {selectedOnboarding.tasks.map((task: Task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Badge variant="outline" className={`${getTaskStatusColor(task.status)} border-current/20`}>
                                {task.status}
                          </Badge>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(selectedOnboarding.id, task.id, 'Pending')}>
                              Mark as Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(selectedOnboarding.id, task.id, 'In Progress')}>
                              Mark as In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(selectedOnboarding.id, task.id, 'Completed')}>
                              Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(selectedOnboarding.id, task.id, 'Delayed')}>
                              Mark as Delayed
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
                  <div className="space-y-4">
                    {selectedOnboarding.requiredDocuments.map((document) => (
                      <div key={document.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{document.name}</p>
                            <p className="text-sm text-gray-500">{document.description}</p>
                            {document.isRequired && (
                              <Badge variant="secondary" className="mt-1">Required</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={`${
                            document.status === 'Uploaded' ? 'bg-green-50 text-green-700' :
                            document.status === 'Verified' ? 'bg-blue-50 text-blue-700' :
                            'bg-yellow-50 text-yellow-700'
                          } border-current/20`}>
                            {document.status}
                          </Badge>
                          <div className="flex items-center gap-2">
                            {document.status === 'Uploaded' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleVerifyDocument(document.id)}
                                  className="bg-green-50 text-green-700 hover:bg-green-100"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Verify
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRejectDocument(document.id)}
                                  className="bg-red-50 text-red-700 hover:bg-red-100"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {document.status === 'Pending' && (
                              <div className="relative">
                                <Input
                                  type="file"
                                  ref={(el) => fileInputRefs.current[document.id] = el}
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleDocumentUpload(document.id, file);
                                    }
                                  }}
                                  disabled={document.status !== 'Pending' || uploadingDocument === document.id}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => fileInputRefs.current[document.id]?.click()}
                                  disabled={document.status !== 'Pending' || uploadingDocument === document.id}
                                >
                                  {uploadingDocument === document.id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-2" />
                                      Upload
                                    </>
                                  )}
                                </Button>
                        </div>
                            )}
                    </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Add Emergency Contact</p>
                        <p className="text-sm text-gray-500">Please provide emergency contact details</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Name"
                        value={emergencyContact.name}
                        onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                      />
                      <Input
                        placeholder="Relationship"
                        value={emergencyContact.relationship}
                        onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })}
                      />
                      <Input
                        placeholder="Phone"
                        value={emergencyContact.phone}
                        onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                      />
                      <Input
                        placeholder="Email"
                        value={emergencyContact.email}
                        onChange={(e) => setEmergencyContact({ ...emergencyContact, email: e.target.value })}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEmergencyContactSubmit}
                      className="bg-green-50 text-green-700 hover:bg-green-100"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Onboarding Timeline</h3>
                  <div className="space-y-4">
                    {selectedOnboarding.timeline.map((event: TimelineEvent, index: number) => (
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
    </div>
  );
};

export default Onboarding; 