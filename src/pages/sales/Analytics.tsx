import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  BarChart3,
} from "lucide-react";

// Mock data for sales analytics
const salesData = {
  revenue: {
    current: 250000.0,
    previous: 220000.0,
    change: 13.6,
  },
  deals: {
    current: 25,
    previous: 20,
    change: 25.0,
  },
  conversion: {
    current: 65,
    previous: 60,
    change: 8.3,
  },
  averageDeal: {
    current: 10000.0,
    previous: 11000.0,
    change: -9.1,
  },
};

const topPerformers = [
  {
    name: "John Smith",
    deals: 8,
    revenue: 85000.0,
    conversion: 75,
    target: 100000.0,
  },
  {
    name: "Sarah Johnson",
    deals: 6,
    revenue: 65000.0,
    conversion: 70,
    target: 80000.0,
  },
  {
    name: "Mike Brown",
    deals: 5,
    revenue: 55000.0,
    conversion: 65,
    target: 75000.0,
  },
  {
    name: "Emily Davis",
    deals: 4,
    revenue: 45000.0,
    conversion: 60,
    target: 60000.0,
  },
];

const recentActivities = [
  {
    id: "ACT-001",
    type: "Deal Won",
    description: "Website Redesign - Acme Corporation",
    amount: 25000.0,
    date: "2024-03-15",
    salesperson: "John Smith",
  },
  {
    id: "ACT-002",
    type: "New Deal",
    description: "Software Implementation - Global Industries",
    amount: 50000.0,
    date: "2024-03-14",
    salesperson: "Sarah Johnson",
  },
  {
    id: "ACT-003",
    type: "Deal Lost",
    description: "Cloud Migration - Tech Solutions",
    amount: 75000.0,
    date: "2024-03-13",
    salesperson: "Mike Brown",
  },
  {
    id: "ACT-004",
    type: "Deal Won",
    description: "Security Audit - Innovation Labs",
    amount: 35000.0,
    date: "2024-03-12",
    salesperson: "Emily Davis",
  },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
          <p className="text-muted-foreground">
            Track and analyze your sales performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${salesData.revenue.current.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {salesData.revenue.change > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              )}
              {Math.abs(salesData.revenue.change)}% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.deals.current}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {salesData.deals.change > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              )}
              {Math.abs(salesData.deals.change)}% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesData.conversion.current}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {salesData.conversion.change > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              )}
              {Math.abs(salesData.conversion.change)}% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Deal Size
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${salesData.averageDeal.current.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {salesData.averageDeal.change > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              )}
              {Math.abs(salesData.averageDeal.change)}% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Sales team performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Salesperson</TableHead>
                  <TableHead>Deals</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Conversion</TableHead>
                  <TableHead>Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPerformers.map((performer) => (
                  <TableRow key={performer.name}>
                    <TableCell className="font-medium">
                      {performer.name}
                    </TableCell>
                    <TableCell>{performer.deals}</TableCell>
                    <TableCell>${performer.revenue.toLocaleString()}</TableCell>
                    <TableCell>{performer.conversion}%</TableCell>
                    <TableCell>${performer.target.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest sales activities and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Salesperson</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <span
                        className={`capitalize ${
                          activity.type === "Deal Won"
                            ? "text-green-500"
                            : activity.type === "Deal Lost"
                            ? "text-red-500"
                            : "text-blue-500"
                        }`}
                      >
                        {activity.type}
                      </span>
                    </TableCell>
                    <TableCell>{activity.description}</TableCell>
                    <TableCell>${activity.amount.toLocaleString()}</TableCell>
                    <TableCell>{activity.date}</TableCell>
                    <TableCell>{activity.salesperson}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
