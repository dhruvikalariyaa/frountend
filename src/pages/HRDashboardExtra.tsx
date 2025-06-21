import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Briefcase,
  Clock,
  Plus,
  Calendar,
  MoreHorizontal,
  BarChart3,
  PieChart,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import CandidatesList from '@/pages/hiring/CandidatesList';
import JobsList from '@/pages/hiring/JobsList';
import InterviewsList from '@/pages/hiring/InterviewsList';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data for HR dashboard stats
const mockStats = {
  totalCandidates: 156,
  activeJobs: 12,
  hiredThisMonth: 8,
  pendingInterviews: 15,
  rejectedCandidates: 23,
  averageTimeToHire: 28,
  averageSalary: 85000,
  upcomingInterviews: 5,
};

// Mock data for charts
const hiringTrendData = [
  { month: 'Jan', hired: 4, interviewed: 12, applied: 45 },
  { month: 'Feb', hired: 6, interviewed: 15, applied: 52 },
  { month: 'Mar', hired: 8, interviewed: 18, applied: 48 },
  { month: 'Apr', hired: 5, interviewed: 14, applied: 40 },
  { month: 'May', hired: 7, interviewed: 16, applied: 55 },
  { month: 'Jun', hired: 9, interviewed: 20, applied: 60 },
];

const candidateStatusData = [
  { name: 'Screening', value: 35 },
  { name: 'Interview', value: 25 },
  { name: 'Offered', value: 15 },
  { name: 'Hired', value: 8 },
  { name: 'Rejected', value: 17 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const HRDashboardExtra: React.FC = () => {
  return (
    <div className="space-y-8 p-8 min-h-screen">
      {/* Visual Summaries Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Job Openings Summary */}
        <Link to="/hiring/jobs" className="block">
          <Card className="group relative border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.02] hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 transform group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="text-sm font-medium text-blue-600 bg-blue-50/80 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-100">
                  Active
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">{mockStats.activeJobs}</div>
                <div className="text-sm text-gray-600 font-medium">Active Job Openings</div>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>12% increase from last month</span>
                <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Recent Candidates Summary */}
        <Link to="/hiring/candidates" className="block">
          <Card className="group relative border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.02] hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20 transform group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6" />
                </div>
                <div className="text-sm font-medium text-green-600 bg-green-50/80 backdrop-blur-sm px-3 py-1 rounded-full border border-green-100">
                  Growing
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">{mockStats.totalCandidates}</div>
                <div className="text-sm text-gray-600 font-medium">Recent Candidates</div>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 group-hover:text-green-600 transition-colors">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>8% increase from last month</span>
                <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Upcoming Interviews Summary */}
        <Link to="/hiring/interviews" className="block">
          <Card className="group relative border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.02] hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/20 transform group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="text-sm font-medium text-purple-600 bg-purple-50/80 backdrop-blur-sm px-3 py-1 rounded-full border border-purple-100">
                  Scheduled
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">{mockStats.upcomingInterviews}</div>
                <div className="text-sm text-gray-600 font-medium">Upcoming Interviews</div>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 group-hover:text-purple-600 transition-colors">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span>Next interview in 2 days</span>
                <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring Trends Chart */}
        <Card className="group relative border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.01] hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative border-b border-gray-100/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 transform group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-4 w-4" />
                </div>
                Hiring Trends
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100/50">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hiringTrendData}>
                <defs>
                  <linearGradient id="hiredGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="appliedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    padding: '12px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="hired" 
                  stroke="#3B82F6" 
                  name="Hired" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#3B82F6' }} 
                  activeDot={{ r: 7, fill: '#3B82F6' }}
                  fill="url(#hiredGradient)"
                />
                <Line 
                  type="monotone" 
                  dataKey="applied" 
                  stroke="#10B981" 
                  name="Applied" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: '#10B981' }} 
                  activeDot={{ r: 6, fill: '#10B981' }}
                  fill="url(#appliedGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Candidate Status Pie Chart */}
        <Card className="group relative border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.01] hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative border-b border-gray-100/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20 transform group-hover:scale-110 transition-transform duration-300">
                  <PieChart className="h-4 w-4" />
                </div>
                Candidate Status
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100/50">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative p-6">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={candidateStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {candidateStatusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${entry.name}-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke="white" 
                      strokeWidth={2}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    padding: '12px'
                  }} 
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Job Openings */}
        <Card className="group relative border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.01] hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative border-b border-gray-100/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 transform group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  Active Job Openings
                </CardTitle>
                <p className="text-sm text-gray-500">Latest job postings and their status</p>
              </div>
              <Link to="/jobs">
                <Button variant="outline" size="sm" className="gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors border-blue-100">
                  <Plus className="h-4 w-4" />
                  View All Jobs
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="relative p-6">
            <JobsList limit={2} showFilters={false} />
          </CardContent>
        </Card>

        {/* Candidates */}
        <Card className="group relative border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.01] hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative border-b border-gray-100/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20 transform group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-4 w-4" />
                  </div>
                  Recent Candidates
                </CardTitle>
                <p className="text-sm text-gray-500">Latest candidates in the hiring pipeline</p>
              </div>
              <Link to="/candidates">
                <Button variant="outline" size="sm" className="gap-2 hover:bg-green-50 hover:text-green-600 transition-colors border-green-100">
                  <Plus className="h-4 w-4" />
                  View All Candidates
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="relative p-6">
            <CandidatesList limit={2} showFilters={false} />
          </CardContent>
        </Card>

        {/* Interviews */}
        <Card className="group relative border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.01] hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative border-b border-gray-100/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/20 transform group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-4 w-4" />
                  </div>
                  Upcoming Interviews
                </CardTitle>
                <p className="text-sm text-gray-500">Scheduled and completed interviews</p>
              </div>
              <Link to="/interviews">
                <Button variant="outline" size="sm" className="gap-2 hover:bg-purple-50 hover:text-purple-600 transition-colors border-purple-100">
                  <Plus className="h-4 w-4" />
                  View All Interviews
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="relative p-6">
            <InterviewsList limit={2} showFilters={false} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HRDashboardExtra; 