// Core User and Authentication
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  position: string;
  avatar?: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Employee Management
export interface Employee extends User {
  employeeId: string;
  joiningDate: Date;
  salary: number;
  managerId: string;
  status: 'active' | 'on_leave' | 'terminated';
  documents: EmployeeDocument[];
  emergencyContact: EmergencyContact;
  customFields: Record<string, any>;
}

export interface EmployeeDocument {
  id: string;
  type: 'id_proof' | 'resume' | 'certificate' | 'other';
  name: string;
  url: string;
  uploadedAt: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Department {
  id: string;
  name: string;
  managerId: string;
  description: string;
  employeeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: Date;
  checkIn: Date;
  checkOut: Date;
  status: 'present' | 'absent' | 'late' | 'half_day';
  workHours: number;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'annual' | 'sick' | 'maternity' | 'unpaid';
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  approvedBy?: string;
  approvedAt?: Date;
  documents?: string[];
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  rating: number;
  goals: PerformanceGoal[];
  feedback: string;
  status: 'draft' | 'submitted' | 'reviewed';
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
}

// Project Management
export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  managerId: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  budget: number;
  team: ProjectTeamMember[];
  tasks: Task[];
  documents: ProjectDocument[];
  customFields: Record<string, any>;
}

export interface ProjectTeamMember {
  employeeId: string;
  role: string;
  allocation: number;
  startDate: Date;
  endDate?: Date;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high';
  startDate: Date;
  dueDate: Date;
  estimatedHours: number;
  actualHours?: number;
  dependencies: string[];
  attachments: string[];
  customFields: Record<string, any>;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'completed';
  velocity: number;
  tasks: string[];
  burndownData: BurndownData[];
}

export interface BurndownData {
  date: Date;
  remainingPoints: number;
}

// Sales & Clients
export interface Client {
  id: string;
  name: string;
  type: 'individual' | 'company';
  industry: string;
  status: 'active' | 'inactive' | 'lead';
  contacts: ClientContact[];
  projects: string[];
  contracts: string[];
  billingInfo: BillingInfo;
  createdAt: Date;
  updatedAt: Date;
  customFields: Record<string, any>;
}

export interface ClientContact {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface BillingInfo {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxId?: string;
  paymentTerms: string;
}

export interface Proposal {
  id: string;
  clientId: string;
  title: string;
  description: string;
  value: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  validUntil: Date;
  items: ProposalItem[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProposalItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Contract {
  id: string;
  clientId: string;
  proposalId: string;
  type: 'fixed_price' | 'recurring' | 'subscription' | 'time_materials';
  startDate: Date;
  endDate: Date;
  value: number;
  status: 'active' | 'expired' | 'terminated';
  terms: string;
  documents: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Asset Management
export interface Asset {
  id: string;
  name: string;
  type: 'hardware' | 'software' | 'furniture' | 'other';
  category: string;
  status: 'active' | 'maintenance' | 'retired';
  assignedTo?: string;
  purchaseDate: Date;
  purchasePrice: number;
  warrantyExpiry?: Date;
  location: string;
  specifications: Record<string, any>;
  maintenanceHistory: MaintenanceRecord[];
  customFields: Record<string, any>;
}

export interface License {
  id: string;
  name: string;
  type: 'software' | 'subscription' | 'service';
  vendor: string;
  startDate: Date;
  endDate: Date;
  cost: number;
  status: 'active' | 'expired' | 'cancelled';
  seats: number;
  usedSeats: number;
  assignedTo: string[];
  renewalDate: Date;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  type: 'preventive' | 'corrective';
  description: string;
  date: Date;
  cost: number;
  performedBy: string;
  nextMaintenanceDate?: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
}

// Finance
export interface Invoice {
  id: string;
  clientId: string;
  contractId: string;
  number: string;
  issueDate: Date;
  dueDate: Date;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  items: InvoiceItem[];
  payments: Payment[];
  notes?: string;
  customFields: Record<string, any>;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: Date;
  method: 'bank_transfer' | 'credit_card' | 'check';
  status: 'pending' | 'completed' | 'failed';
  reference: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: Date;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  receipt?: string;
  projectId?: string;
}

// Settings
export interface Role {
  _id: string;
  id: string;
  name: string;
  description: string;
  permissions: Record<string, any>;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
  pending?: boolean;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string | number | boolean | object;
  description: string;
  isPublic: boolean;
  updatedBy: string;
  updatedAt: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'contract' | 'proposal' | 'report' | 'other';
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  version: string;
  description?: string;
}

// Role and Permission Models
export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: string;
}

// Custom Field Models
export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'file';
  entity: 'client' | 'project' | 'task' | 'employee' | 'asset' | 'invoice';
  isRequired: boolean;
  options?: string[]; // For select/multiselect fields
  defaultValue?: string | number | boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Status Configuration Models
export interface StatusConfig {
  id: string;
  name: string;
  type: 'client' | 'project' | 'task' | 'invoice' | 'asset';
  color: string;
  order: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Workflow Models
export interface WorkflowStep {
  id: string;
  name: string;
  statusId: string;
  order: number;
  canBeReassigned: boolean;
  requiredFields: string[];
  notifications: {
    type: 'email' | 'in-app';
    template: string;
    recipients: string[];
  }[];
}

export interface Workflow {
  id: string;
  name: string;
  type: 'client' | 'project' | 'task' | 'invoice' | 'asset';
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Notification Template Models
export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'in-app';
  subject: string;
  body: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

// Audit Log Models
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata: Record<string, any>;
  createdAt: string;
}

// Recruitment Management
export interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentCompany?: string;
  currentRole?: string;
  experienceYears: number;
  expectedSalary?: number;
  noticePeriod?: string;
  status: 'new' | 'interview' | 'rejected';
  resumeLink?: string;
  department?: string | null;
  notes?: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  timeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEntry {
  _id: string;
  type: 'candidate' | 'interview' | 'feedback' | 'status_change';
  subType: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

export interface CandidateFilters {
  search?: string;
  status?: string;
  department?: string;
  experienceYears?: number;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CandidatesResponse {
  data: Candidate[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CreateCandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentCompany?: string;
  currentRole?: string;
  experienceYears: number;
  expectedSalary?: number;
  noticePeriod?: string;
  resumeLink?: string;
  department?: string;
  notes?: string;
}

export interface UpdateCandidateRequest extends Partial<CreateCandidateRequest> {
  status?: Candidate['status'];
}

export interface CandidateStats {
  totalCandidates: number;
  newCandidates: number;
  inProcess: number;
  hired: number;
  rejected: number;
  statusDistribution: { [key: string]: number };
  departmentDistribution: { [key: string]: number };
} 