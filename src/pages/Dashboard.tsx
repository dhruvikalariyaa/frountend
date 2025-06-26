import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddCandidateDialog } from '@/components/hiring/AddCandidateDialog';
import { AddJobDialog } from '@/components/hiring/AddJobDialog';
import Notification from '@/components/Notification';
import { 
  Users, 
  UserPlus, 
  Briefcase, 
  DollarSign, 
  CreditCard, 
  Calendar,
  TrendingUp,
  FileText,
  CheckCircle,
  MoreHorizontal,
  ChevronRight,
  Activity,
  BarChart4} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS } from '../contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import HRDashboardExtra from './HRDashboardExtra';

// --- Centralized Mock Data for Dynamic Content ---
const MOCK_MODULE_DATA = [
  {
    title: 'Employee Management',
    icon: <Users className="h-5 w-5" />,
    color: 'from-blue-600 to-blue-700',
    permissions: [PERMISSIONS.EMPLOYEES_VIEW, PERMISSIONS.DEPARTMENT_MANAGE],
    stats: [
      { label: 'Total Employees', value: '45', change: '+5%', trend: 'up', href: '/employees', permission: PERMISSIONS.EMPLOYEES_VIEW },
      { label: 'Active Projects', value: '12', change: '+2', trend: 'up', href: '/projects', permission: PERMISSIONS.EMPLOYEES_VIEW },
      { label: 'Attendance Rate', value: '95%', change: '+2%', trend: 'up', href: '/employees/attendance', permission: PERMISSIONS.EMPLOYEES_VIEW }
    ]
  },
  {
    title: 'Hiring Management',
    icon: <UserPlus className="h-5 w-5" />,
    color: 'from-green-600 to-green-700',
    permissions: [PERMISSIONS.JOB_VIEW, PERMISSIONS.CANDIDATE_VIEW],
    stats: [
      { label: 'Open Positions', value: '8', change: '-2', trend: 'down', href: '/hiring/jobs', permission: PERMISSIONS.JOB_VIEW },
      { label: 'Active Candidates', value: '24', change: '+8', trend: 'up', href: '/hiring/candidates', permission: PERMISSIONS.CANDIDATE_VIEW },
      { label: 'Interviews This Week', value: '12', change: '+3', trend: 'up', href: '/hiring/interviews', permission: PERMISSIONS.JOB_VIEW }
    ]
  },
  {
    title: 'Project Management',
    icon: <Briefcase className="h-5 w-5" />,
    color: 'from-purple-600 to-purple-700',
    permissions: [PERMISSIONS.EMPLOYEES_VIEW],
    stats: [
      { label: 'Active Projects', value: '15', change: '+3', trend: 'up', href: '/projects', permission: PERMISSIONS.EMPLOYEES_VIEW },
      { label: 'Completed Projects', value: '8', change: '+2', trend: 'up', href: '/projects', permission: PERMISSIONS.EMPLOYEES_VIEW },
      { label: 'Project Health', value: '92%', change: '+5%', trend: 'up', href: '/projects', permission: PERMISSIONS.EMPLOYEES_VIEW }
    ]
  },
  {
    title: 'Sales & Clients',
    icon: <DollarSign className="h-5 w-5" />,
    color: 'from-orange-600 to-orange-700',
    permissions: [PERMISSIONS.EMPLOYEES_VIEW],
    stats: [
      { label: 'Total Clients', value: '32', change: '+4', trend: 'up', href: '/sales/clients', permission: PERMISSIONS.EMPLOYEES_VIEW },
      { label: 'Monthly Revenue', value: '$45K', change: '+15%', trend: 'up', href: '/sales/revenue', permission: PERMISSIONS.EMPLOYEES_VIEW },
      { label: 'Growth Rate', value: '+15%', change: '+3%', trend: 'up', href: '/sales/revenue', permission: PERMISSIONS.EMPLOYEES_VIEW }
    ]
  },
  {
    title: 'Finance',
    icon: <CreditCard className="h-5 w-5" />,
    color: 'from-red-600 to-red-700',
    permissions: [PERMISSIONS.EMPLOYEES_VIEW],
    stats: [
      { label: 'Pending Invoices', value: '12', change: '-3', trend: 'down', href: '/finance', permission: PERMISSIONS.EMPLOYEES_VIEW },
      { label: 'Monthly Expenses', value: '$28K', change: '-5%', trend: 'down', href: '/finance', permission: PERMISSIONS.EMPLOYEES_VIEW },
      { label: 'Profit Margin', value: '35%', change: '+2%', trend: 'up', href: '/finance', permission: PERMISSIONS.EMPLOYEES_VIEW }
    ]
  }
];

const MOCK_ACTIVITIES_DATA = [
  {
    id: 1,
    type: 'employee',
    action: 'New Employee Onboarded',
    details: 'Sarah Johnson joined as Senior Developer',
    time: '2 hours ago',
    icon: <Users className="h-4 w-4" />,
    status: 'success',
    href: '/employees',
    permission: PERMISSIONS.EMPLOYEES_VIEW
  },
  {
    id: 2,
    type: 'project',
    action: 'Project Milestone Completed',
    details: 'E-commerce Platform Phase 1 delivered',
    time: '5 hours ago',
    icon: <CheckCircle className="h-4 w-4" />,
    status: 'success',
    href: '/projects',
    permission: PERMISSIONS.EMPLOYEES_VIEW
  },
  {
    id: 3,
    type: 'sales',
    action: 'New Contract Signed',
    details: 'Enterprise deal with TechCorp Inc.',
    time: '1 day ago',
    icon: <FileText className="h-4 w-4" />,
    status: 'success',
    href: '/sales/contracts',
    permission: PERMISSIONS.EMPLOYEES_VIEW
  },
  {
    id: 4,
    type: 'finance',
    action: 'Invoice Generated',
    details: 'Invoice #INV-2024-001 for $15,000',
    time: '1 day ago',
    icon: <CreditCard className="h-4 w-4" />,
    status: 'pending',
    href: '/finance/invoices',
    permission: PERMISSIONS.EMPLOYEES_VIEW
  }
];

const MOCK_EVENTS_DATA = [
  {
    id: 1,
    title: 'Team Meeting',
    time: 'Today at 2:00 PM',
    type: 'meeting',
    icon: <Calendar className="h-4 w-4" />,
    priority: 'high',
    href: '/team-meetings',
    permission: PERMISSIONS.EMPLOYEES_VIEW
  },
  {
    id: 2,
    title: 'Client Presentation',
    time: 'Tomorrow at 10:00 AM',
    type: 'presentation',
    icon: <FileText className="h-4 w-4" />,
    priority: 'medium',
    href: '/client-presentations',
    permission: PERMISSIONS.EMPLOYEES_VIEW
  },
  {
    id: 3,
    title: 'Project Review',
    time: 'Tomorrow at 3:00 PM',
    type: 'review',
    icon: <CheckCircle className="h-4 w-4" />,
    priority: 'high',
    href: '/project-reviews',
    permission: PERMISSIONS.EMPLOYEES_VIEW
  }
];

const MOCK_METRICS_DATA = [
  {
    title: 'Project Completion Rate',
    value: 85,
    target: 90,
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'bg-blue-500',
    permission: PERMISSIONS.EMPLOYEES_VIEW
  },
  {
    title: 'Client Satisfaction',
    value: 92,
    target: 95,
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'bg-green-500',
    permission: PERMISSIONS.EMPLOYEES_VIEW
  },
  {
    title: 'Resource Utilization',
    value: 78,
    target: 85,
    icon: <Users className="h-4 w-4" />,
    color: 'bg-purple-500',
    permission: PERMISSIONS.EMPLOYEES_VIEW
  }
];

// --- Admin Mock Data ---

// Module stats with permission checks
const getModuleStats = (hasPermission: (permission: string) => boolean) => {
  return MOCK_MODULE_DATA.filter(module =>
    module.permissions.some(p => hasPermission(p))
  ).map(module => ({
    ...module,
    stats: module.stats.filter(stat => hasPermission(stat.permission))
  }));
};

// Recent activities with permission checks
const getRecentActivities = (hasPermission: (permission: string) => boolean) => {
  return MOCK_ACTIVITIES_DATA.filter(activity => hasPermission(activity.permission));
};

// Upcoming events with permission checks
const getUpcomingEvents = (hasPermission: (permission: string) => boolean) => {
  return MOCK_EVENTS_DATA.filter(event => hasPermission(event.permission));
};

// Performance metrics with permission checks
const getPerformanceMetrics = (hasPermission: (permission: string) => boolean) => {
  return MOCK_METRICS_DATA.filter(metric => hasPermission(metric.permission));
};

const ICON_GRADIENTS = {
  'Employee Management': 'from-blue-500 to-blue-600',
  'Hiring Management': 'from-green-500 to-green-600',
  'Project Management': 'from-purple-500 to-purple-600',
  'Sales & Clients': 'from-orange-500 to-orange-600',
  'Finance': 'from-red-500 to-red-600',
};



const CARD_HOVER_GRADIENTS = {
  'Employee Management': 'from-blue-500/10 to-transparent',
  'Hiring Management': 'from-green-500/10 to-transparent',
  'Project Management': 'from-purple-500/10 to-transparent',
  'Sales & Clients': 'from-orange-500/10 to-transparent',
  'Finance': 'from-red-500/10 to-transparent',
};

// Add a function to get the time-based greeting
function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Motivational quotes/tips
const MOTIVATIONAL_QUOTES = [
  'Success is not the key to happiness. Happiness is the key to success.',
  'The only way to do great work is to love what you do.',
  'Stay positive, work hard, make it happen.',
  "Your limitation—it's only your imagination.",
  'Push yourself, because no one else is going to do it for you.'
];
function getRandomQuote() {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
}

// Animated statistics hook
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    function step() {
      start += increment;
      if (start < target) {
        setCount(Math.floor(start));
        requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    }
    step();
    // eslint-disable-next-line
  }, [target]);
  return count;
}

// Collapsible widgets state
const DEFAULT_WIDGETS: Record<string, boolean> = {
  weather: true,
};

const Dashboard: React.FC = () => {
  const { hasPermission, user } = useAuth();

  const moduleStats = getModuleStats(hasPermission);
  const recentActivities = getRecentActivities(hasPermission);
  const upcomingEvents = getUpcomingEvents(hasPermission);
  const performanceMetrics = getPerformanceMetrics(hasPermission);

  const userName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'User';

  const [quote] = useState(getRandomQuote());
  const [] = useState<Record<string, boolean>>(DEFAULT_WIDGETS);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Accessibility: close notifications on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && (notifRef.current as any).contains(e.target)) return;
      setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="min-h-screen p-8 space-y-8 font-sans">
      <Notification
        open={notifOpen}
        message="Welcome to your dashboard!"
        severity="info"
        onClose={() => setNotifOpen(false)}
      />
      {/* Greeting Section with Buttons to the Right */}
      <div className="group relative border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.01] hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative p-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight drop-shadow-sm">{getTimeGreeting()}, {userName.split(' ')[0]}</h1>
            <p className="text-l text-gray-500 dark:text-gray-300 font-medium">Hope you have a productive day! Let's achieve great things together.</p>
            <div className="mt-2 text-blue-700 dark:text-blue-300 italic animate-fade-in" aria-live="polite">{quote}</div>
          </div>
          <div className="flex items-center mt-6 md:mt-0 ml-0 md:ml-8 gap-4">
            {user?.role === 'HR Manager' && <AddJobDialog /> }
            {user?.role === 'HR Manager' && <AddCandidateDialog onAddCandidate={() => {}} /> }
          </div>
        </div>
      </div>

      {/* HR-only extra dashboard functionality (role-based) */}
      

      {/* Module Stats Grid: Clean and Informative */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
        {moduleStats.map((module) => (
          <Link
            key={module.title}
            to={module.stats[0]?.href || '/'}
            className="block h-full"
          >
            <Card className="group relative h-full border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.02] hover:-translate-y-1">
              <div className={`absolute inset-0 bg-gradient-to-br ${(CARD_HOVER_GRADIENTS as any)[module.title] || 'from-gray-500/10 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <CardHeader className="relative flex flex-row items-start justify-between space-y-0 p-8 pb-4">
                <div className="flex items-start gap-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${(ICON_GRADIENTS as any)[module.title] || 'from-gray-500 to-gray-600'} text-white transform group-hover:scale-110 transition-transform duration-300`}>
                    {module.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
                      {module.title}
                    </CardTitle>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-gray-400 dark:text-gray-500 rounded-lg">
                  <MoreHorizontal className="h-6 w-6" />
                </Button>
              </CardHeader>
              <CardContent className="relative p-8 pt-0">
                <div className="grid grid-cols-3 gap-y-6">
                  {module.stats.map((stat) => (
                    hasPermission(stat.permission) && (
                      <div
                        key={stat.label}
                        className="flex flex-col gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            {useCountUp(Number(stat.value.replace(/[^0-9]/g, '')) || 0)}
                          </span>
                          <span className={cn(
                            "text-xs font-semibold px-2 py-1 rounded-full",
                            stat.trend === 'up'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          )}>
                            {stat.change}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">
                          {stat.label}
                        </p>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {user?.role === 'HR Manager' && <HRDashboardExtra />}
      {/* Performance Metrics: Data-rich and Focused */}
      {performanceMetrics.length > 0 && (
        <div className="grid gap-8 md:grid-cols-3">
          {performanceMetrics.map((metric) => (
            <Card key={metric.title} className="group relative border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.02] hover:-translate-y-1">
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color === 'bg-blue-500' ? 'from-blue-500/10 to-transparent' : metric.color === 'bg-green-500' ? 'from-green-500/10 to-transparent' : 'from-purple-500/10 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 p-8 pb-4">
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {metric.title}
                </CardTitle>
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color === 'bg-blue-500' ? 'from-blue-500 to-blue-600' : metric.color === 'bg-green-500' ? 'from-green-500 to-green-600' : 'from-purple-500 to-purple-600'} text-white transform group-hover:scale-110 transition-transform duration-300`}>
                  {metric.icon}
                </div>
              </CardHeader>
              <CardContent className="relative p-8 pt-0">
                <div className="space-y-6">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-muted-foreground">Current: <span className="font-bold text-gray-800 dark:text-gray-100">{metric.value}%</span></span>
                    <span className="text-muted-foreground">Target: <span className="font-bold text-gray-800 dark:text-gray-100">{metric.target}%</span></span>
                  </div>
                  <Progress
                    value={(metric.value / metric.target) * 100}
                    className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full [&>*]:bg-gradient-to-r [&>*]:from-blue-500 [&>*]:to-purple-500"
                  />
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <BarChart4 className="h-5 w-5 text-blue-500" />
                      <span className="text-base">Performance</span>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-xs font-semibold px-4 py-2 rounded-full",
                      metric.value >= metric.target
                        ? "border-green-500 text-green-600 dark:border-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                        : "border-yellow-500 text-yellow-600 dark:border-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                    )}>
                      {metric.value >= metric.target ? 'On Track' : 'Needs Attention'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent Activities: Timeline-like and Scrollable */}
        {recentActivities.length > 0 && (
          <div>
            <Card className="group relative border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.01] hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative border-b border-gray-100/50 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white transform group-hover:scale-110 transition-transform duration-300">
                        <Activity className="h-4 w-4" />
                      </div>
                      Recent Activities
                    </CardTitle>
                    <p className="text-sm text-gray-500">Latest updates across all modules</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 rounded-lg">
                    View All <ChevronRight className="ml-1 h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative p-6">
                <ScrollArea className="h-[320px] pr-4">
                  <div className="space-y-6">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="relative"
                      >
                        <Link
                          to={activity.href}
                          className="flex items-center space-x-5 p-4 rounded-xl hover:bg-gray-50/60 dark:hover:bg-gray-700/60 transition-colors duration-200"
                        >
                          <div className={cn(
                            "p-3 rounded-xl",
                            activity.status === 'success'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/20'
                              : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20'
                          )}>
                            {activity.icon}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-lg font-semibold leading-none text-gray-800 dark:text-gray-100">
                              {activity.action}
                            </p>
                            <p className="text-base text-muted-foreground">
                              {activity.details}
                            </p>
                          </div>
                          <div className="text-base text-gray-500 dark:text-gray-400">
                            {activity.time}
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upcoming Events: Clear and Prioritized */}
        {upcomingEvents.length > 0 && (
          <div>
            <Card className="group relative border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.01] hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative border-b border-gray-100/50 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white transform group-hover:scale-110 transition-transform duration-300">
                        <Calendar className="h-4 w-4" />
                      </div>
                      Upcoming Events
                    </CardTitle>
                    <p className="text-sm text-gray-500">Schedule and important dates</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-400 rounded-lg">
                    View Calendar <ChevronRight className="ml-1 h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative p-6">
                <ScrollArea className="h-[320px] pr-4">
                  <div className="space-y-6">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="relative"
                      >
                        <Link
                          to={event.href}
                          className="flex items-center space-x-5 p-4 rounded-xl hover:bg-gray-50/60 dark:hover:bg-gray-700/60 transition-colors duration-200"
                        >
                          <div className={cn(
                            "p-3 rounded-xl",
                            event.priority === 'high'
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/20'
                              : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20'
                          )}>
                            {event.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{event.title}</p>
                            <p className="text-base text-muted-foreground">
                              {event.time}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="text-xs px-4 py-2 h-auto text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 rounded-lg">
                            View
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 