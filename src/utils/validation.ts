import { z } from 'zod';
import { 
 
  Project, 
  Task, 
  Proposal, 
  Contract,
  Asset,
  License,
  LeaveRequest
} from '@/types/models';

// User Validation
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['admin', 'manager', 'employee']),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  avatar: z.string().optional(),
  permissions: z.array(z.string())
});

// Employee Validation
export const employeeSchema = userSchema.extend({
  employeeId: z.string().min(1, 'Employee ID is required'),
  joiningDate: z.date(),
  salary: z.number().positive('Salary must be positive'),
  managerId: z.string().min(1, 'Manager ID is required'),
  status: z.enum(['active', 'on_leave', 'terminated']),
  documents: z.array(z.object({
    id: z.string(),
    type: z.enum(['id_proof', 'resume', 'certificate', 'other']),
    name: z.string(),
    url: z.string().url('Invalid URL'),
    uploadedAt: z.date()
  })),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z.string().min(10, 'Invalid phone number'),
    email: z.string().email('Invalid email').optional()
  })
});

// Project Validation
export const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required'),
  clientId: z.string().min(1, 'Client is required'),
  managerId: z.string().min(1, 'Project manager is required'),
  startDate: z.date(),
  endDate: z.date().refine((date) => date > new Date(), {
    message: 'End date must be in the future',
  }),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']),
  budget: z.number().min(0, 'Budget must be a positive number'),
  team: z.array(z.object({
    userId: z.string(),
    role: z.string(),
  })),
  tasks: z.array(z.string()),
  documents: z.array(z.string()),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// Task Validation
export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['High', 'Medium', 'Low']),
  status: z.enum(['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled']),
  assigneeId: z.string().min(1, 'Assignee is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  dependencies: z.array(z.string()).optional(),
  comments: z.array(z.object({
    id: z.string(),
    userId: z.string(),
    content: z.string(),
    createdAt: z.string(),
    attachments: z.array(z.object({
      id: z.string(),
      name: z.string(),
      url: z.string(),
      type: z.string(),
      size: z.number()
    })).optional()
  })).optional(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number()
  })).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

// Client Validation
export const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  type: z.enum(['individual', 'company']),
  industry: z.string().min(1, 'Industry is required'),
  status: z.enum(['active', 'inactive', 'lead']),
  contacts: z.array(z.object({
    name: z.string().min(1, 'Contact name is required'),
    position: z.string().min(1, 'Position is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Invalid phone number'),
    isPrimary: z.boolean()
  })),
  billingInfo: z.object({
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    taxId: z.string().optional(),
    paymentTerms: z.string().min(1, 'Payment terms are required')
  })
});

// Proposal Validation
export const proposalSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  title: z.string().min(1, 'Proposal title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  value: z.number().positive('Value must be positive'),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected']),
  validUntil: z.date().refine((date) => date > new Date(), {
    message: 'Valid until date must be in the future'
  }),
  items: z.array(z.object({
    description: z.string().min(1, 'Item description is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    total: z.number().positive('Total must be positive')
  }))
});

// Contract Validation
export const contractSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  proposalId: z.string().min(1, 'Proposal is required'),
  type: z.enum(['fixed_price', 'recurring', 'subscription', 'time_materials']),
  startDate: z.date(),
  endDate: z.date().refine((date) => date > new Date(), {
    message: 'End date must be in the future'
  }),
  value: z.number().positive('Value must be positive'),
  status: z.enum(['active', 'expired', 'terminated']),
  terms: z.string().min(10, 'Terms must be at least 10 characters'),
  documents: z.array(z.string())
});

// Asset Validation
export const assetSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  type: z.enum(['hardware', 'software', 'furniture', 'other']),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['active', 'maintenance', 'retired']),
  assignedTo: z.string().optional(),
  purchaseDate: z.date(),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  warrantyExpiry: z.date().optional(),
  location: z.string().min(1, 'Location is required'),
  specifications: z.record(z.any())
});

// License Validation
export const licenseSchema = z.object({
  name: z.string().min(1, 'License name is required'),
  type: z.enum(['software', 'subscription', 'service']),
  vendor: z.string().min(1, 'Vendor is required'),
  startDate: z.date(),
  endDate: z.date().refine((date) => date > new Date(), {
    message: 'End date must be in the future'
  }),
  cost: z.number().positive('Cost must be positive'),
  status: z.enum(['active', 'expired', 'cancelled']),
  seats: z.number().positive('Number of seats must be positive'),
  usedSeats: z.number().min(0, 'Used seats cannot be negative'),
  assignedTo: z.array(z.string()),
  renewalDate: z.date()
});

// Invoice Validation
export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  contractId: z.string().min(1, 'Contract is required'),
  number: z.string().min(1, 'Invoice number is required'),
  issueDate: z.date(),
  dueDate: z.date().refine((date) => date > new Date(), {
    message: 'Due date must be in the future'
  }),
  amount: z.number().positive('Amount must be positive'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
  items: z.array(z.object({
    description: z.string().min(1, 'Item description is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    total: z.number().positive('Total must be positive')
  })),
  notes: z.string().optional()
});

// Leave Request Validation
export const leaveRequestSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  type: z.enum(['annual', 'sick', 'maternity', 'unpaid']),
  startDate: z.date(),
  endDate: z.date().refine((date) => date > new Date(), {
    message: 'End date must be in the future'
  }),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  documents: z.array(z.string()).optional()
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date'
});

// Business Logic Validation Functions
export const validateProjectTeam = (team: Project['team']) => {
  const totalAllocation = team.reduce((sum, member) => sum + member.allocation, 0);
  if (totalAllocation > 100) {
    throw new Error('Total team allocation cannot exceed 100%');
  }
};

export const validateTaskDependencies = (tasks: Task[], taskId: string) => {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const visited = new Set<string>();
  const checkCycle = (currentId: string): boolean => {
    if (visited.has(currentId)) return true;
    visited.add(currentId);
    
    const currentTask = tasks.find(t => t.id === currentId);
    if (!currentTask) return false;

    return currentTask.dependencies.some(depId => checkCycle(depId));
  };

  if (checkCycle(taskId)) {
    throw new Error('Circular dependency detected in task dependencies');
  }
};

export const validateLeaveBalance = (
  leaveRequests: LeaveRequest[],
  employeeId: string,
  type: LeaveRequest['type'],
  startDate: Date,
  endDate: Date
) => {
  const existingLeaves = leaveRequests.filter(
    req => req.employeeId === employeeId &&
    req.status === 'approved' &&
    req.type === type &&
    ((req.startDate <= endDate && req.endDate >= startDate))
  );

  if (existingLeaves.length > 0) {
    throw new Error('Leave request overlaps with existing approved leaves');
  }
};

export const validateContractValue = (
  contract: Contract,
  proposal: Proposal
) => {
  if (contract.value !== proposal.value) {
    throw new Error('Contract value must match proposal value');
  }
};

export const validateAssetAssignment = (
  asset: Asset,
  employeeId: string
) => {
  if (asset.status !== 'active') {
    throw new Error('Cannot assign inactive asset');
  }
  if (asset.assignedTo && asset.assignedTo !== employeeId) {
    throw new Error('Asset is already assigned to another employee');
  }
};

export const validateLicenseSeats = (
  license: License,
  employeeId: string
) => {
  if (license.usedSeats >= license.seats) {
    throw new Error('No available seats in license');
  }
  if (license.assignedTo.includes(employeeId)) {
    throw new Error('Employee already has this license assigned');
  }
}; 