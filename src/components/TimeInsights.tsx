import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Download, 
  Clock, 
  TrendingUp, 
  Coffee,
  Timer,
  PieChart as PieChartIcon,
  BarChart2,
  ChevronRight,
  LogOut,
 
  ChevronDown,
  Search,
  Filter,
  
  Info,
 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip as TooltipComponent,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { timeTrackingService } from '@/services/timeTrackingService';
import type { 
  TimeTracking, 
  BreakRecord, 
  DailyTimeRecord, 
  WeeklyReport 
} from '@/services/timeTrackingService';

interface TimeInsightsProps {
  timeWorked: TimeTracking;
  totalBreakTime: TimeTracking;
  breakHistory: BreakRecord[];
  defaultTab?: 'current' | 'weekly' | 'daily';
  showAllTabs?: boolean;
}

const TimeInsights: React.FC<TimeInsightsProps> = ({
  timeWorked,
  totalBreakTime,
  breakHistory,
  defaultTab = 'current',
  showAllTabs = true,
}) => {
  const [dailyRecords, setDailyRecords] = useState<DailyTimeRecord[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'date', direction: 'desc' });
  const [filters, setFilters] = useState({
    efficiency: {
      excellent: true,
      good: true,
      fair: true,
      poor: true
    },
    hasBreaks: 'all', // 'all' | 'with' | 'without'
  });
  const [] = useState<{
    start: string;
    end: string;
  }>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, [selectedWeek]);

  const loadData = () => {
    const history = timeTrackingService.getTimeHistory();
    setDailyRecords(history);

    const weekStart = new Date(selectedWeek);
    const report = timeTrackingService.generateWeeklyReport(weekStart);
    setWeeklyReport(report);
  };

  const formatTime = ({ hours, minutes, seconds }: TimeTracking): string => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const convertToMinutes = ({ hours, minutes }: TimeTracking): number => {
    return hours * 60 + minutes;
  };

  const getTimeDistributionData = () => {
    const workMinutes = convertToMinutes(timeWorked);
    const breakMinutes = convertToMinutes(totalBreakTime);
    
    return [
      { name: 'Work Time', value: workMinutes, color: '#60A5FA' }, // blue-400
      { name: 'Break Time', value: breakMinutes, color: '#C084FC' }, // purple-400
    ];
  };

  const getBreakDistributionData = () => {
    return breakHistory.map((record, index) => {
      const duration = record.endTime 
        ? convertToMinutes(record.duration)
        : 0;
      
      return {
        name: `Break ${index + 1}`,
        minutes: duration,
        startTime: new Date(record.startTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      };
    });
  };

  const calculateEfficiency = () => {
    const totalMinutes = convertToMinutes(timeWorked) + convertToMinutes(totalBreakTime);
    if (totalMinutes === 0) return 0;
    return Math.round((convertToMinutes(timeWorked) / totalMinutes) * 100);
  };

  const calculateAverageBreakTime = () => {
    if (breakHistory.length === 0) return 0;
    const totalBreakMinutes = convertToMinutes(totalBreakTime);
    return Math.round(totalBreakMinutes / breakHistory.length);
  };

  const getWorkStatus = () => {
    const efficiency = calculateEfficiency();
    if (efficiency >= 80) return { text: 'Excellent', color: 'text-green-400' };
    if (efficiency >= 60) return { text: 'Good', color: 'text-blue-400' };
    if (efficiency >= 40) return { text: 'Fair', color: 'text-yellow-400' };
    return { text: 'Needs Improvement', color: 'text-red-400' };
  };

  const getBreakStatus = () => {
    const avgBreak = calculateAverageBreakTime();
    if (avgBreak <= 15) return { text: 'Short Breaks', color: 'text-green-400' };
    if (avgBreak <= 30) return { text: 'Moderate Breaks', color: 'text-blue-400' };
    return { text: 'Long Breaks', color: 'text-yellow-400' };
  };

  const getWeekOptions = () => {
    const options = [];
    for (let i = 0; i < 4; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      options.push({
        value: date.toISOString().split('T')[0],
        label: `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      });
    }
    return options;
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Check In', 'Check Out', 'Work Time', 'Break Time', 'Efficiency'];
    const rows = dailyRecords.map(record => [
      record.date,
      record.checkInTime,
      record.checkOutTime || '-',
      timeTrackingService.formatTime(record.totalWorkTime),
      timeTrackingService.formatTime(record.totalBreakTime),
      `${record.efficiency}%`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-tracking-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Sorting function
  const sortData = (data: DailyTimeRecord[]) => {
    return [...data].sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sortConfig.key === 'efficiency') {
        return sortConfig.direction === 'asc' 
          ? a.efficiency - b.efficiency 
          : b.efficiency - a.efficiency;
      }
      if (sortConfig.key === 'workTime') {
        const timeA = convertToMinutes(a.totalWorkTime);
        const timeB = convertToMinutes(b.totalWorkTime);
        return sortConfig.direction === 'asc' ? timeA - timeB : timeB - timeA;
      }
      if (sortConfig.key === 'breakTime') {
        const timeA = convertToMinutes(a.totalBreakTime);
        const timeB = convertToMinutes(b.totalBreakTime);
        return sortConfig.direction === 'asc' ? timeA - timeB : timeB - timeA;
      }
      return 0;
    });
  };

  // Filter and search function
  const filteredAndSortedRecords = useMemo(() => {
    let filtered = dailyRecords.filter(record => {
      const matchesSearch = searchTerm === '' || 
        new Date(record.date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).toLowerCase().includes(searchTerm.toLowerCase());

      const matchesEfficiency = 
        (record.efficiency >= 80 && filters.efficiency.excellent) ||
        (record.efficiency >= 60 && record.efficiency < 80 && filters.efficiency.good) ||
        (record.efficiency >= 40 && record.efficiency < 60 && filters.efficiency.fair) ||
        (record.efficiency < 40 && filters.efficiency.poor);

      const breakTime = convertToMinutes(record.totalBreakTime);
      const matchesBreaks = 
        filters.hasBreaks === 'all' ||
        (filters.hasBreaks === 'with' && breakTime > 0) ||
        (filters.hasBreaks === 'without' && breakTime === 0);

      return matchesSearch && matchesEfficiency && matchesBreaks;
    });

    return sortData(filtered);
  }, [dailyRecords, searchTerm, sortConfig, filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 z-10 py-4 px-6 border-b">
        <h1 className="text-2xl font-semibold text-gray-900">Time Insights</h1>
        <div className="flex items-center gap-3">
          <Select
            value={selectedWeek}
            onValueChange={setSelectedWeek}
          >
            <SelectTrigger className="w-[180px] bg-white border shadow-sm">
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent>
              {getWeekOptions().map(option => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-sm"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="bg-white hover:bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm transition-all duration-200 h-9 w-9"
            onClick={exportToCSV}
          >
            <Download className="h-[18px] w-[18px] stroke-[2.25px]" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <div className="flex items-center justify-center sticky top-[68px] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 z-10 py-3 border-b">
          <TabsList className="grid w-[400px] grid-cols-3 bg-gray-100/80 rounded-full h-9 p-1">
            {showAllTabs && (
              <TabsTrigger 
                value="current"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-full text-sm text-gray-600 font-medium transition-all"
              >
                Current Session
              </TabsTrigger>
            )}
            {showAllTabs && (
              <TabsTrigger 
                value="weekly"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-full text-sm text-gray-600 font-medium transition-all"
              >
                Weekly Summary
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="daily"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-full text-sm text-gray-600 font-medium transition-all"
            >
              Daily Records
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-8 px-6">
          <TabsContent value="current" className="focus-visible:outline-none">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50/50 rounded-bl-[100px] -z-0" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Work Time
                    </CardTitle>
                    <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center">
                      <Clock className="h-[18px] w-[18px] stroke-[2.25px] text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 tabular-nums">
                      {formatTime(timeWorked)}
                    </div>
                    <div className={`text-sm mt-1.5 ${getWorkStatus().color} font-medium flex items-center gap-1.5`}>
                      {getWorkStatus().text}
                      <ChevronRight className="h-3.5 w-3.5 stroke-[2.25px]" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-purple-50/50 rounded-bl-[100px] -z-0" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Break Time
                    </CardTitle>
                    <div className="h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center">
                      <Coffee className="h-[18px] w-[18px] stroke-[2.25px] text-purple-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 tabular-nums">
                      {formatTime(totalBreakTime)}
                    </div>
                    <div className={`text-sm mt-1.5 ${getBreakStatus().color} font-medium flex items-center gap-1.5`}>
                      {getBreakStatus().text}
                      <ChevronRight className="h-3.5 w-3.5 stroke-[2.25px]" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-green-50/50 rounded-bl-[100px] -z-0" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Efficiency
                    </CardTitle>
                    <div className="h-9 w-9 rounded-full bg-green-50 flex items-center justify-center">
                      <TrendingUp className="h-[18px] w-[18px] stroke-[2.25px] text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 tabular-nums">
                      {calculateEfficiency()}%
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${calculateEfficiency()}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-amber-50/50 rounded-bl-[100px] -z-0" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Avg Break
                    </CardTitle>
                    <div className="h-9 w-9 rounded-full bg-amber-50 flex items-center justify-center">
                      <Timer className="h-[18px] w-[18px] stroke-[2.25px] text-amber-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 tabular-nums">
                      {calculateAverageBreakTime()} min
                    </div>
                    <div className="text-sm mt-1.5 text-gray-500 font-medium flex items-center gap-1.5">
                      {breakHistory.length} break{breakHistory.length !== 1 ? 's' : ''} taken
                      <ChevronRight className="h-3.5 w-3.5 stroke-[2.25px]" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white border-gray-200 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-blue-50/30 to-purple-50/30 rounded-bl-[100px] -z-0" />
                  <CardHeader className="pb-0">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <PieChartIcon className="h-[18px] w-[18px] stroke-[2.25px] text-gray-500" />
                      Time Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[320px]">
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
                          <Tooltip 
                            formatter={(value: number) => [
                              `${Math.floor(value / 60)}h ${value % 60}m`,
                              ''
                            ]}
                            contentStyle={{ 
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '0.75rem',
                              boxShadow: '0 4px 12px -2px rgba(0,0,0,0.08)'
                            }}
                            itemStyle={{ color: '#374151' }}
                          />
                          <Legend 
                            formatter={(value) => (
                              <span className="text-sm font-medium text-gray-600">{value}</span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-purple-50/30 to-amber-50/30 rounded-bl-[100px] -z-0" />
                  <CardHeader className="pb-0">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <BarChart2 className="h-[18px] w-[18px] stroke-[2.25px] text-gray-500" />
                      Break Duration Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getBreakDistributionData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="startTime" 
                            angle={-45} 
                            textAnchor="end"
                            height={60}
                            interval={0}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                          />
                          <YAxis 
                            label={{ 
                              value: 'Minutes', 
                              angle: -90, 
                              position: 'insideLeft',
                              fill: '#6b7280'
                            }}
                            tick={{ fill: '#6b7280' }}
                          />
                          <Tooltip
                            formatter={(value: number) => [`${value} minutes`, '']}
                            contentStyle={{ 
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '0.75rem',
                              boxShadow: '0 4px 12px -2px rgba(0,0,0,0.08)'
                            }}
                            itemStyle={{ color: '#374151' }}
                          />
                          <Bar 
                            dataKey="minutes" 
                            fill="#8b5cf6"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="focus-visible:outline-none">
            {weeklyReport && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Total Work Hours
                    </CardTitle>
                    <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center">
                      <Clock className="h-[18px] w-[18px] stroke-[2.25px] text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 tabular-nums">
                      {weeklyReport.totalWorkHours}h
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Average Efficiency
                    </CardTitle>
                    <div className="h-9 w-9 rounded-full bg-green-50 flex items-center justify-center">
                      <TrendingUp className="h-[18px] w-[18px] stroke-[2.25px] text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 tabular-nums">
                      {weeklyReport.averageEfficiency}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Total Break Time
                    </CardTitle>
                    <div className="h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center">
                      <Coffee className="h-[18px] w-[18px] stroke-[2.25px] text-purple-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 tabular-nums">
                      {weeklyReport.totalBreakTime} min
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Most Productive
                    </CardTitle>
                    <div className="h-9 w-9 rounded-full bg-amber-50 flex items-center justify-center">
                      <Calendar className="h-[18px] w-[18px] stroke-[2.25px] text-amber-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {new Date(weeklyReport.mostProductiveDay).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="daily" className="focus-visible:outline-none">
            <Card className="bg-white border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-blue-50/20 via-purple-50/20 to-transparent rounded-bl-[200px] -z-0" />
              
              {/* Search and Filter Bar */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-gray-50/50 border-gray-200"
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
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
                        Poor ( 40%)
                      </DropdownMenuCheckboxItem>
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Break Time</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className={filters.hasBreaks === 'all' ? 'bg-gray-100' : ''}
                        onClick={() => setFilters(prev => ({ ...prev, hasBreaks: 'all' }))}
                      >
                        Show All
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={filters.hasBreaks === 'with' ? 'bg-gray-100' : ''}
                        onClick={() => setFilters(prev => ({ ...prev, hasBreaks: 'with' }))}
                      >
                        With Breaks
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={filters.hasBreaks === 'without' ? 'bg-gray-100' : ''}
                        onClick={() => setFilters(prev => ({ ...prev, hasBreaks: 'without' }))}
                      >
                        Without Breaks
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button 
                    variant="ghost" 
                    className="text-gray-500"
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({
                        efficiency: { excellent: true, good: true, fair: true, poor: true },
                        hasBreaks: 'all'
                      });
                    }}
                  >
                    Clear
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{filteredAndSortedRecords.length} records</span>
                </div>
              </div>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 hover:bg-gray-50/80 transition-colors">
                        <TableHead 
                          className="font-medium text-gray-600 py-4 pl-6 cursor-pointer"
                          onClick={() => setSortConfig({
                            key: 'date',
                            direction: sortConfig.key === 'date' && sortConfig.direction === 'desc' ? 'asc' : 'desc'
                          })}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 stroke-[2.25px] text-gray-400" />
                            Date
                            {sortConfig.key === 'date' && (
                              <ChevronDown className={`h-4 w-4 transition-transform ${
                                sortConfig.direction === 'asc' ? 'rotate-180' : ''
                              }`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="font-medium text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 stroke-[2.25px] text-gray-400" />
                            Check In
                          </div>
                        </TableHead>
                        <TableHead className="font-medium text-gray-600">
                          <div className="flex items-center gap-2">
                            <LogOut className="h-4 w-4 stroke-[2.25px] text-gray-400" />
                            Check Out
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-medium text-gray-600 cursor-pointer"
                          onClick={() => setSortConfig({
                            key: 'workTime',
                            direction: sortConfig.key === 'workTime' && sortConfig.direction === 'desc' ? 'asc' : 'desc'
                          })}
                        >
                          <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4 stroke-[2.25px] text-gray-400" />
                            Work Time
                            {sortConfig.key === 'workTime' && (
                              <ChevronDown className={`h-4 w-4 transition-transform ${
                                sortConfig.direction === 'asc' ? 'rotate-180' : ''
                              }`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-medium text-gray-600 cursor-pointer"
                          onClick={() => setSortConfig({
                            key: 'breakTime',
                            direction: sortConfig.key === 'breakTime' && sortConfig.direction === 'desc' ? 'asc' : 'desc'
                          })}
                        >
                          <div className="flex items-center gap-2">
                            <Coffee className="h-4 w-4 stroke-[2.25px] text-gray-400" />
                            Break Time
                            {sortConfig.key === 'breakTime' && (
                              <ChevronDown className={`h-4 w-4 transition-transform ${
                                sortConfig.direction === 'asc' ? 'rotate-180' : ''
                              }`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-medium text-gray-600 pr-6 cursor-pointer"
                          onClick={() => setSortConfig({
                            key: 'efficiency',
                            direction: sortConfig.key === 'efficiency' && sortConfig.direction === 'desc' ? 'asc' : 'desc'
                          })}
                        >
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 stroke-[2.25px] text-gray-400" />
                            Efficiency
                            {sortConfig.key === 'efficiency' && (
                              <ChevronDown className={`h-4 w-4 transition-transform ${
                                sortConfig.direction === 'asc' ? 'rotate-180' : ''
                              }`} />
                            )}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedRecords.map((record, index) => (
                        <TableRow 
                          key={index}
                          className={`
                            hover:bg-gray-50/50 transition-colors duration-150
                            ${index % 2 === 0 ? 'bg-transparent' : 'bg-gray-50/30'}
                          `}
                        >
                          <TableCell className="py-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <span className="text-sm font-semibold text-blue-600">
                                  {new Date(record.date).getDate()}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  {new Date(record.date).toLocaleDateString('en-US', {
                                    weekday: 'short'
                                  })}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {new Date(record.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              {new Date(record.date).toDateString() === new Date().toDateString() && (
                                <Badge variant="secondary" className="ml-2">Today</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${record.checkInTime ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <span className="font-medium text-gray-900 tabular-nums">
                                {record.checkInTime}
                              </span>
                              <TooltipProvider>
                                <TooltipComponent>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Check-in time for the day</p>
                                  </TooltipContent>
                                </TooltipComponent>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${record.checkOutTime ? 'bg-red-500' : 'bg-gray-300'}`} />
                              <span className="font-medium text-gray-900 tabular-nums">
                                {record.checkOutTime || '-'}
                              </span>
                              <TooltipProvider>
                                <TooltipComponent>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Check-out time for the day</p>
                                  </TooltipContent>
                                </TooltipComponent>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-8 rounded-full bg-blue-100" />
                              <span className="font-medium text-blue-600 tabular-nums">
                                {timeTrackingService.formatTime(record.totalWorkTime)}
                              </span>
                              <TooltipProvider>
                                <TooltipComponent>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Total time spent working</p>
                                  </TooltipContent>
                                </TooltipComponent>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-8 rounded-full bg-purple-100" />
                              <span className="font-medium text-purple-600 tabular-nums">
                                {timeTrackingService.formatTime(record.totalBreakTime)}
                              </span>
                              <TooltipProvider>
                                <TooltipComponent>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Total time spent on breaks</p>
                                  </TooltipContent>
                                </TooltipComponent>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                          <TableCell className="pr-6">
                            <div className="flex items-center gap-3">
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
                              <span className={`font-medium tabular-nums w-12 text-right ${
                                record.efficiency >= 80 ? 'text-green-600' :
                                record.efficiency >= 60 ? 'text-blue-600' :
                                record.efficiency >= 40 ? 'text-amber-600' :
                                'text-red-600'
                              }`}>
                                {record.efficiency}%
                              </span>
                              <TooltipProvider>
                                <TooltipComponent>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Work efficiency for the day</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {record.efficiency >= 80 ? 'Excellent' :
                                       record.efficiency >= 60 ? 'Good' :
                                       record.efficiency >= 40 ? 'Fair' :
                                       'Needs Improvement'}
                                    </p>
                                  </TooltipContent>
                                </TooltipComponent>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredAndSortedRecords.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center">
                            <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                              <Search className="h-8 w-8 stroke-[1.5px] text-gray-400" />
                              <p className="text-sm font-medium">No matching records found</p>
                              {searchTerm && (
                                <p className="text-xs text-gray-400">
                                  Try adjusting your search or filters
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default TimeInsights; 