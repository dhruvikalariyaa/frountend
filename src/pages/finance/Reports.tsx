
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  DollarSign,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// Mock data for financial reports
const financialData = {
  revenue: {
    current: 125000.00,
    previous: 110000.00,
    change: 13.6,
  },
  expenses: {
    current: 85000.00,
    previous: 78000.00,
    change: 9.0,
  },
  profit: {
    current: 40000.00,
    previous: 32000.00,
    change: 25.0,
  },
  outstanding: {
    current: 25000.00,
    previous: 30000.00,
    change: -16.7,
  },
};

const recentTransactions = [
  {
    id: 'TRX-001',
    description: 'Client Payment - Project Alpha',
    amount: 15000.00,
    date: '2024-03-15',
    type: 'income',
    category: 'Project Revenue',
  },
  {
    id: 'TRX-002',
    description: 'Office Rent',
    amount: 2000.00,
    date: '2024-03-14',
    type: 'expense',
    category: 'Rent',
  },
  {
    id: 'TRX-003',
    description: 'Software Licenses',
    amount: 1200.00,
    date: '2024-03-13',
    type: 'expense',
    category: 'Software',
  },
  {
    id: 'TRX-004',
    description: 'Client Payment - Project Beta',
    amount: 10000.00,
    date: '2024-03-12',
    type: 'income',
    category: 'Project Revenue',
  },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">
            View and analyze your financial data
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
            <div className="text-2xl font-bold">${financialData.revenue.current.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {financialData.revenue.change > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              )}
              {Math.abs(financialData.revenue.change)}% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialData.expenses.current.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {financialData.expenses.change > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-green-500 mr-1" />
              )}
              {Math.abs(financialData.expenses.change)}% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialData.profit.current.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {financialData.profit.change > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              )}
              {Math.abs(financialData.profit.change)}% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialData.outstanding.current.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {financialData.outstanding.change > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-green-500 mr-1" />
              )}
              {Math.abs(financialData.outstanding.change)}% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest financial transactions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search transactions..." className="pl-8" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell className={transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    <span className={`capitalize ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.type}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 