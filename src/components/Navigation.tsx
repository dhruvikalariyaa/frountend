import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Clock,
  Coffee,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Menu as MenuIcon,
  Timer,
  ClockIcon,
  History,
  BarChart3,
  LogOut,
  ListFilter,
  CalendarDays,
  BarChart2,
  Search,
  Filter,
  Printer,
  FileDown,
  Share2,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/components/ui/use-toast';
import TimeInsights from '@/components/TimeInsights';
import { timeTrackingService } from '@/services/timeTrackingService';
import type { TimeTracking, BreakRecord, DailyTimeRecord } from '@/services/timeTrackingService';
import TimeConfirmationDialog from '@/components/TimeConfirmationDialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Input } from "@/components/ui/input";

interface TimeNotification {
  id: string;
  type: 'warning' | 'info' | 'success';
  message: string;
  time: string;
  read: boolean;
}

// Memoize the time tracking calculations
const calculateTimeWorked = (now: Date, checkInTime: Date | null, breakHistory: BreakRecord[], isOnBreak: boolean, lastBreakTime: Date | null) => {
  if (!checkInTime) return { hours: 0, minutes: 0, seconds: 0 };

  let totalMilliseconds = now.getTime() - checkInTime.getTime();
  
  // Calculate total break time in milliseconds
  const totalBreakMilliseconds = breakHistory.reduce((total, record) => {
    if (record.endTime) {
      return total + (record.endTime.getTime() - record.startTime.getTime());
    }
    return total;
  }, 0);

  // Add current break if on break
  if (isOnBreak && lastBreakTime) {
    const currentBreakMilliseconds = now.getTime() - lastBreakTime.getTime();
    totalMilliseconds -= (totalBreakMilliseconds + currentBreakMilliseconds);
  } else {
    totalMilliseconds -= totalBreakMilliseconds;
  }

  return {
    hours: Math.floor(totalMilliseconds / (1000 * 60 * 60)),
    minutes: Math.floor((totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((totalMilliseconds % (1000 * 60)) / 1000)
  };
};

// Memoize the NavigationIcons component
const NavigationIcons: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [timeWorked, setTimeWorked] = useState<TimeTracking>({ hours: 0, minutes: 0, seconds: 0 });
  const [lastBreakTime, setLastBreakTime] = useState<Date | null>(null);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakDuration, setBreakDuration] = useState<TimeTracking>({ hours: 0, minutes: 0, seconds: 0 });
  const [totalBreakTime, setTotalBreakTime] = useState<TimeTracking>({ hours: 0, minutes: 0, seconds: 0 });
  const [breakHistory, setBreakHistory] = useState<BreakRecord[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmationType, setConfirmationType] = useState<'checkin' | 'checkout' | 'break' | 'endbreak'>('checkin');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    efficiency: { excellent: false, good: false, fair: false, poor: false },
  });
  const [dailyRecords, setDailyRecords] = useState<DailyTimeRecord[]>([]);

  // Load saved state from localStorage only once on mount
  useEffect(() => {
    const savedState = timeTrackingService.getCurrentState();
    if (savedState) {
      const { 
        isCheckedIn: savedIsCheckedIn, 
        checkInTime: savedCheckInTime,
        lastBreakTime: savedLastBreakTime,
        isOnBreak: savedIsOnBreak,
        breakHistory: savedBreakHistory,
        totalBreakTime: savedTotalBreakTime
      } = savedState;

      setIsCheckedIn(savedIsCheckedIn);
      setCheckInTime(savedCheckInTime ? new Date(savedCheckInTime) : null);
      setLastBreakTime(savedLastBreakTime ? new Date(savedLastBreakTime) : null);
      setIsOnBreak(savedIsOnBreak);
      setBreakHistory(savedBreakHistory?.map((record: any) => ({
        ...record,
        startTime: new Date(record.startTime),
        endTime: record.endTime ? new Date(record.endTime) : undefined
      })) || []);
      setTotalBreakTime(savedTotalBreakTime || { hours: 0, minutes: 0, seconds: 0 });
    }

    const history = timeTrackingService.getTimeHistory();
    setDailyRecords(history);
  }, []); // Empty dependency array to run only once on mount

  // Optimize timer effect with useCallback and useRef
  const timerRef = useRef<NodeJS.Timeout>();
  const lastUpdateRef = useRef<number>(Date.now());

  const updateTime = useCallback(() => {
    const now = new Date();
    if (now.getTime() - lastUpdateRef.current >= 1000) {
      lastUpdateRef.current = now.getTime();
      
      if (isOnBreak && lastBreakTime) {
        const currentBreakMilliseconds = now.getTime() - lastBreakTime.getTime();
        const breakDuration = {
          hours: Math.floor(currentBreakMilliseconds / (1000 * 60 * 60)),
          minutes: Math.floor((currentBreakMilliseconds % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((currentBreakMilliseconds % (1000 * 60)) / 1000)
        };
        setBreakDuration(breakDuration);

        const totalBreakMs = breakHistory.reduce((total, record) => {
          if (record.endTime) {
            return total + (record.endTime.getTime() - record.startTime.getTime());
          }
          return total;
        }, 0) + currentBreakMilliseconds;

        setTotalBreakTime({
          hours: Math.floor(totalBreakMs / (1000 * 60 * 60)),
          minutes: Math.floor((totalBreakMs % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((totalBreakMs % (1000 * 60)) / 1000)
        });
      }

      const timeWorked = calculateTimeWorked(now, checkInTime, breakHistory, isOnBreak, lastBreakTime);
      setTimeWorked(timeWorked);
    }
  }, [isOnBreak, lastBreakTime, checkInTime, breakHistory]);

  useEffect(() => {
    if (isCheckedIn) {
      timerRef.current = setInterval(updateTime, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isCheckedIn, updateTime]);

  // Optimize state saving with useCallback and useRef
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  const saveState = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      timeTrackingService.saveCurrentState({
        isCheckedIn,
        checkInTime,
        lastBreakTime,
        isOnBreak,
        breakHistory,
        totalBreakTime
      });
    }, 1000);
  }, [isCheckedIn, checkInTime, lastBreakTime, isOnBreak, breakHistory, totalBreakTime]);

  useEffect(() => {
    saveState();
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [saveState]);

  const handleCheckInOutClick = () => {
    setConfirmationType(isCheckedIn ? 'checkout' : 'checkin');
    setShowConfirmDialog(true);
  };

  const handleBreakClick = () => {
    setConfirmationType(isOnBreak ? 'endbreak' : 'break');
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = () => {
    switch (confirmationType) {
      case 'checkin':
      case 'checkout':
        handleConfirmCheckInOut();
        break;
      case 'break':
      case 'endbreak':
        handleConfirmBreak();
        break;
    }
  };

  const handleConfirmBreak = () => {
    const now = new Date();
    if (!isOnBreak) {
      setLastBreakTime(now);
      toast({
        title: "☕ Break Started",
        description: "Your break time has started. Take your time!",
        className: "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200",
      });
      setBreakHistory([...breakHistory, { startTime: now, duration: { hours: 0, minutes: 0, seconds: 0 }}]);
    } else {
      const breakTime = timeTrackingService.formatTime(breakDuration);
      const currentBreak = breakHistory[breakHistory.length - 1];
      if (currentBreak) {
        currentBreak.endTime = now;
        currentBreak.duration = breakDuration;
      }
      setLastBreakTime(null);
      toast({
        title: "💪 Break Ended",
        description: `Break duration: ${breakTime}`,
        className: "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200",
      });
      setBreakDuration({ hours: 0, minutes: 0, seconds: 0 });
    }
    setIsOnBreak(!isOnBreak);
    setShowConfirmDialog(false);
  };

  const handleConfirmCheckInOut = () => {
    if (!isCheckedIn) {
      const now = new Date();
      setCheckInTime(now);
      setTimeWorked({ hours: 0, minutes: 0, seconds: 0 });
      setBreakHistory([]);
      setTotalBreakTime({ hours: 0, minutes: 0, seconds: 0 });
      toast({
        title: "✅ Welcome!",
        description: "You have successfully checked in. Have a productive day!",
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
      });
    } else {
      if (isOnBreak) {
        handleConfirmBreak();
      }
      const now = new Date();
      const dailyRecord = {
        date: now.toISOString().split('T')[0],
        checkInTime: checkInTime?.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) || '',
        checkOutTime: now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        totalWorkTime: timeWorked,
        totalBreakTime,
        breaks: breakHistory,
        efficiency: calculateEfficiency()
      };

      timeTrackingService.saveDailyRecord(dailyRecord);
      
      // Update daily records state directly instead of reloading
      setDailyRecords(prev => [...prev, dailyRecord]);

      const finalTime = timeTrackingService.formatTime(timeWorked);
      const totalBreak = timeTrackingService.formatTime(totalBreakTime);
      toast({
        title: "👋 Day Summary",
        description: `Work time: ${finalTime}\nTotal breaks: ${totalBreak}`,
        className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200",
      });
      setCheckInTime(null);
      setLastBreakTime(null);
      setTimeWorked({ hours: 0, minutes: 0, seconds: 0 });
      setBreakDuration({ hours: 0, minutes: 0, seconds: 0 });
      setBreakHistory([]);
    }
    setIsCheckedIn(!isCheckedIn);
    setShowConfirmDialog(false);
  };

  const calculateEfficiency = () => {
    const totalMinutes = timeWorked.hours * 60 + timeWorked.minutes;
    const breakMinutes = totalBreakTime.hours * 60 + totalBreakTime.minutes;
    const totalTime = totalMinutes + breakMinutes;
    if (totalTime === 0) return 100;
    return Math.round((totalMinutes / totalTime) * 100);
  };

  const handleLogout = () => {
    if (isCheckedIn) {
      toast({
        title: "⚠️ Warning",
        description: "Please check out before logging out.",
        className: "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200",
      });
      return;
    }
    timeTrackingService.clearData();
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    toast({
      title: "👋 Goodbye!",
      description: "You have been logged out successfully.",
      className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200",
    });
    navigate('/login');
  };

  // Notification generation
  const generateNotifications = (): TimeNotification[] => {
    const notifications: TimeNotification[] = [];
    const now = new Date();

    // Work time notifications
    if (timeWorked.hours >= 4 && timeWorked.minutes >= 30 && !isOnBreak) {
      notifications.push({
        id: 'long-work',
        type: 'warning',
        message: 'You have been working for over 4.5 hours. Consider taking a break.',
        time: now.toLocaleTimeString(),
        read: false,
      });
    }

    // Break time notifications
    if (isOnBreak && breakDuration.minutes >= 45) {
      notifications.push({
        id: 'long-break',
        type: 'warning',
        message: 'Your break has exceeded 45 minutes.',
        time: now.toLocaleTimeString(),
        read: false,
      });
    }

    // Work efficiency notifications
    if (timeWorked.hours >= 2 && !isOnBreak) {
      notifications.push({
        id: 'efficiency',
        type: 'info',
        message: 'Remember to stay hydrated and maintain good posture.',
        time: now.toLocaleTimeString(),
        read: false,
      });
    }

    // Break reminder
    if (timeWorked.hours >= 2 && timeWorked.minutes >= 0 && !isOnBreak) {
      notifications.push({
        id: 'break-reminder',
        type: 'info',
        message: 'Consider taking a short break to maintain productivity.',
        time: now.toLocaleTimeString(),
        read: false,
      });
    }

    return notifications;
  };

  const notifications = generateNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  // Update the filteredAndSortedRecords to use dailyRecords instead of breakHistory
  const filteredAndSortedRecords = useMemo(() => {
    let filtered = dailyRecords.filter(record => {
      const matchesSearch = searchTerm === '' || 
        record.date.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesEfficiency = 
        (record.efficiency >= 80 && filters.efficiency.excellent) ||
        (record.efficiency >= 60 && record.efficiency < 80 && filters.efficiency.good) ||
        (record.efficiency >= 40 && record.efficiency < 60 && filters.efficiency.fair) ||
        (record.efficiency < 40 && filters.efficiency.poor);

      return matchesSearch && matchesEfficiency;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [dailyRecords, searchTerm, filters]);

  const getTimeDistributionData = () => {
    const data = [
      { value: 40, color: '#0088FE' },
      { value: 30, color: '#00C49F' },
      { value: 30, color: '#FFBB28' },
    ];
    return data;
  };

  const convertToMinutes = (time: TimeTracking): number => {
    return time.hours * 60 + time.minutes;
  };

  const exportToCSV = () => {
    // Implementation of exportToCSV function
  };

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-50 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
      <div className="w-full">
        <div className="flex h-16 items-center px-6">
          {/* Left Section - Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="block group">
              <img 
                src="https://dvijinfotech.com/wp-content/uploads/2024/11/logo-header.svg" 
                alt="Dvij Infotech Logo" 
                className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Right Section - Combined Controls */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Analytics & History Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                onClick={() => setShowAnalytics(true)}
                variant="ghost"
                className="h-9 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 flex items-center gap-2 font-medium transition-all duration-200 rounded-xl hover:shadow-sm"
              >
                <BarChart3 className="h-[18px] w-[18px] stroke-[2.25px] text-blue-600" />
                <span>Analytics</span>
              </Button>
              <Button
                onClick={() => setShowHistory(true)}
                variant="ghost"
                className="h-9 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 flex items-center gap-2 font-medium transition-all duration-200 rounded-xl hover:shadow-sm"
              >
                <History className="h-[18px] w-[18px] stroke-[2.25px] text-indigo-600" />
                <span>History</span>
              </Button>
            </div>

            {/* Time Controls */}
            {!isCheckedIn ? (
              <Button
                onClick={handleCheckInOutClick}
                variant="outline"
                className="h-9 px-4 bg-gradient-to-r from-emerald-500/10 via-emerald-500/10 to-green-500/10 border-emerald-200 text-emerald-700 hover:bg-emerald-50/80 flex items-center gap-2 shadow-sm transition-all duration-200 rounded-xl hover:shadow-md hover:scale-[1.02]"
              >
                <CheckCircle2 className="h-[18px] w-[18px] stroke-[2.25px]" />
                <span className="font-medium">Check In</span>
                <span className="text-sm text-emerald-600 font-normal">
                  Start your day
                </span>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleBreakClick}
                  variant="outline"
                  className={`h-9 px-4 flex items-center gap-2 shadow-sm transition-all duration-200 rounded-xl hover:shadow-md hover:scale-[1.02] ${
                    isOnBreak
                      ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/10 to-orange-500/10 border-amber-200 text-amber-700 hover:bg-amber-50/80'
                      : 'bg-gradient-to-r from-purple-500/10 via-purple-500/10 to-fuchsia-500/10 border-purple-200 text-purple-700 hover:bg-purple-50/80'
                  }`}
                >
                  <Coffee className="h-[18px] w-[18px] stroke-[2.25px]" />
                  <span className="font-medium">{isOnBreak ? 'End Break' : 'Break'}</span>
                  {isOnBreak && (
                    <span className="text-sm font-normal tabular-nums">
                      {timeTrackingService.formatTime(breakDuration)}
                    </span>
                  )}
                </Button>

                <Button
                  onClick={handleCheckInOutClick}
                  variant="outline"
                  className="h-9 px-4 bg-gradient-to-r from-red-500/10 via-red-500/10 to-rose-500/10 border-red-200 text-red-700 hover:bg-red-50/80 flex items-center gap-2 shadow-sm transition-all duration-200 rounded-xl hover:shadow-md hover:scale-[1.02]"
                >
                  <XCircle className="h-[18px] w-[18px] stroke-[2.25px]" />
                  <span className="font-medium">Check Out</span>
                  <span className="text-sm text-red-600 font-normal tabular-nums">
                    {timeTrackingService.formatTime(timeWorked)}
                  </span>
                </Button>
              </div>
            )}

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 hover:bg-gray-50/80 text-gray-500 hover:text-gray-700 transition-all duration-200 rounded-xl hover:shadow-sm"
                >
                  <Bell className="h-[18px] w-[18px] stroke-[2.25px]" />
                  {unreadCount > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center bg-red-500 text-[10px] p-0 border-2 border-white animate-pulse"
                      variant="destructive"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Notifications</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Time tracking alerts and reminders
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No notifications
                    </div>
                  ) :
                    notifications.map((notification) => (
                      <DropdownMenuItem key={notification.id} className="p-3 cursor-pointer hover:bg-gray-50/80 transition-colors">
                        <div className="flex items-start gap-3">
                          {notification.type === 'warning' ? (
                            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                          ) : notification.type === 'info' ? (
                            <Clock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  }
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden h-9 w-9 hover:bg-gray-50/80 text-gray-500 hover:text-gray-700 transition-all duration-200 rounded-xl hover:shadow-sm"
                >
                  <MenuIcon className="h-[18px] w-[18px] stroke-[2.25px]" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader className="border-b border-gray-200 pb-4">
                  <SheetTitle className="text-lg font-semibold text-gray-900">
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  {/* Mobile Analytics & History */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setShowAnalytics(true)}
                      variant="outline"
                      className="w-full h-auto py-3 px-4 flex flex-col items-center gap-2 bg-white rounded-xl hover:shadow-sm transition-all duration-200"
                    >
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">Analytics</span>
                    </Button>
                    <Button
                      onClick={() => setShowHistory(true)}
                      variant="outline"
                      className="w-full h-auto py-3 px-4 flex flex-col items-center gap-2 bg-white rounded-xl hover:shadow-sm transition-all duration-200"
                    >
                      <History className="h-5 w-5 text-indigo-600" />
                      <span className="text-sm font-medium">History</span>
                    </Button>
                  </div>

                  {/* Mobile Time Status */}
                  {isCheckedIn && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
                        <div className="text-xs font-medium text-blue-600 mb-1">Work Time</div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-blue-700 tabular-nums">
                            {timeTrackingService.formatTime(timeWorked)}
                          </span>
                        </div>
                      </div>
                      {isOnBreak && (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-sm">
                          <div className="text-xs font-medium text-amber-600 mb-1">Break Time</div>
                          <div className="flex items-center gap-2">
                            <Coffee className="h-4 w-4 text-amber-500" />
                            <span className="font-semibold text-amber-700 tabular-nums">
                              {timeTrackingService.formatTime(breakDuration)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mobile Logout */}
                  <Button 
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full h-10 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl hover:shadow-sm transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5 stroke-2" />
                    <span>Log Out</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <TimeConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmAction}
        type={confirmationType}
        timeWorked={timeWorked}
        breakDuration={breakDuration}
        totalBreakTime={totalBreakTime}
      />

      {/* Analytics/History Dialog */}
      <Dialog open={showAnalytics || showHistory} onOpenChange={(open) => {
        if (showHistory) {
          setShowHistory(open);
        } else {
          setShowAnalytics(open);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {showHistory ? 'Time History' : ''}
            </DialogTitle>
          </DialogHeader>
          
          {showHistory ? (
            <div className="flex-1 overflow-y-auto">
              {/* Toolbar */}
              <div className="border-b px-6 py-3 bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-36"
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-36"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      <ListFilter className="h-4 w-4" />
                      List
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 ${viewMode === 'calendar' ? 'bg-gray-100' : ''}`}
                      onClick={() => setViewMode('calendar')}
                    >
                      <CalendarDays className="h-4 w-4" />
                      Calendar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 ${viewMode === 'analytics' ? 'bg-gray-100' : ''}`}
                      onClick={() => setViewMode('analytics')}
                    >
                      <BarChart2 className="h-4 w-4" />
                      Analytics
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Efficiency</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={filters.efficiency.excellent}
                        onCheckedChange={(checked) => 
                          setFilters(prev => ({
                            ...prev,
                            efficiency: { ...prev.efficiency, excellent: checked }
                          }))
                        }
                      >
                        Excellent (80%+)
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={filters.efficiency.good}
                        onCheckedChange={(checked) => 
                          setFilters(prev => ({
                            ...prev,
                            efficiency: { ...prev.efficiency, good: checked }
                          }))
                        }
                      >
                        Good (60-79%)
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={filters.efficiency.fair}
                        onCheckedChange={(checked) => 
                          setFilters(prev => ({
                            ...prev,
                            efficiency: { ...prev.efficiency, fair: checked }
                          }))
                        }
                      >
                        Fair (40-59%)
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={filters.efficiency.poor}
                        onCheckedChange={(checked) => 
                          setFilters(prev => ({
                            ...prev,
                            efficiency: { ...prev.efficiency, poor: checked }
                          }))
                        }
                      >
                        Poor (≤ 40%)
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" size="icon" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={exportToCSV}>
                    <FileDown className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {viewMode === 'list' && (
                  <div className="space-y-4">
                    {filteredAndSortedRecords.map((record, index) => (
                      <Card key={index} className="hover:bg-gray-50/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                              <span className="text-lg font-semibold text-blue-600">
                                {new Date(record.date).getDate()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-gray-900">
                                  {new Date(record.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </h3>
                                {new Date(record.date).toDateString() === new Date().toDateString() && (
                                  <Badge variant="secondary">Today</Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-3 gap-4 mt-3">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    {record.checkInTime} - {record.checkOutTime}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Timer className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm font-medium text-blue-600">
                                    {timeTrackingService.formatTime(record.totalWorkTime)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Coffee className="h-4 w-4 text-purple-500" />
                                  <span className="text-sm font-medium text-purple-600">
                                    {timeTrackingService.formatTime(record.totalBreakTime)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 mt-3">
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      record.efficiency >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                      record.efficiency >= 60 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                                      record.efficiency >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                                      'bg-gradient-to-r from-red-500 to-rose-500'
                                    }`}
                                    style={{ width: `${record.efficiency}%` }}
                                  />
                                </div>
                                <span className={`text-sm font-medium ${
                                  record.efficiency >= 80 ? 'text-green-600' :
                                  record.efficiency >= 60 ? 'text-blue-600' :
                                  record.efficiency >= 40 ? 'text-amber-600' :
                                  'text-red-600'
                                }`}>
                                  {record.efficiency}% Efficiency
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {viewMode === 'calendar' && (
                  <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 35 }).map((_, index) => {
                      const date = new Date(dateRange.start);
                      date.setDate(date.getDate() + index);
                      const record = dailyRecords.find(r => 
                        new Date(r.date).toDateString() === date.toDateString()
                      );

                      return (
                        <div 
                          key={index}
                          className={`bg-white p-2 min-h-[100px] ${
                            record ? 'hover:bg-gray-50/50' : 'bg-gray-50/50'
                          } transition-colors`}
                        >
                          <div className="text-sm text-gray-400">
                            {date.getDate()}
                          </div>
                          {record && (
                            <div className="mt-2 space-y-1">
                              <div className="text-xs font-medium text-gray-900">
                                {record.checkInTime} - {record.checkOutTime || 'Present'}
                              </div>
                              <div className="flex items-center gap-1">
                                <Timer className="h-3 w-3 text-blue-500" />
                                <span className="text-xs text-blue-600">
                                  {timeTrackingService.formatTime(record.totalWorkTime)}
                                </span>
                              </div>
                              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    record.efficiency >= 80 ? 'bg-green-500' :
                                    record.efficiency >= 60 ? 'bg-blue-500' :
                                    record.efficiency >= 40 ? 'bg-amber-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${record.efficiency}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {viewMode === 'analytics' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Efficiency Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredAndSortedRecords}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis 
                                dataKey="date" 
                                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              />
                              <YAxis />
                              <Tooltip />
                              <Bar 
                                dataKey="efficiency" 
                                fill="#8b5cf6"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Work vs Break Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getTimeDistributionData()}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {getTimeDistributionData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Daily Work Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={filteredAndSortedRecords}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                  dataKey="date" 
                                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                />
                                <YAxis />
                                <Tooltip />
                                <Bar 
                                  dataKey={(record) => convertToMinutes(record.totalWorkTime) / 60}
                                  fill="#60a5fa"
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2">
              <TimeInsights
                timeWorked={timeWorked}
                totalBreakTime={totalBreakTime}
                breakHistory={breakHistory}
                defaultTab={showHistory ? 'daily' : 'current'}
                showAllTabs={!showHistory}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default memo(NavigationIcons); 