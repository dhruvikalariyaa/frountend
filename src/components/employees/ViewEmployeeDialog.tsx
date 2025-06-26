import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, isValid, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar, 
  IndianRupee, 
  CreditCard,
  Users,
  Clock
} from "lucide-react";

interface ViewEmployeeDialogProps {
  employee: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewEmployeeDialog({ employee, open, onOpenChange }: ViewEmployeeDialogProps) {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col p-0 rounded-xl overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Employee Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {(employee.user?.firstName || employee.firstName || 'N')[0]}
                  {(employee.user?.lastName || employee.lastName || 'A')[0]}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    {employee.user?.firstName || employee.firstName || 'Not provided'} {employee.user?.lastName || employee.lastName || ''}
                  </h1>
                  <p className="text-gray-600 text-base font-medium">
                    Employee ID: {employee.employeeId || 'No ID'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
                </div>
                
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                      <p className="font-semibold text-gray-900">{employee.user?.email || employee.email || "Not provided"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Phone className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Phone Number</p>
                      <p className="font-semibold text-gray-900">{employee.user?.phone || employee.phone || "Not provided"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
                      <p className="font-semibold text-gray-900">
                        {employee.address && typeof employee.address === 'object'
                          ? [
                              employee.address.street,
                              employee.address.city,
                              employee.address.state,
                              employee.address.country,
                              employee.address.postalCode
                            ].filter(Boolean).join(', ') || "Not provided"
                          : employee.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="bg-green-50 rounded-xl p-6 shadow-sm border border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Professional Details</h2>
                </div>
                
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Building2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Department</p>
                      <p className="font-semibold text-gray-900">
                        {typeof employee.department === 'object' ? employee.department?.name : employee.department || "Not specified"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Role</p>
                      <p className="font-semibold text-gray-900">
                        {(() => {
                          if (employee.user?.roles && Array.isArray(employee.user.roles)) {
                            if (employee.user.roles.length > 0) {
                              return employee.user.roles.map((role: any) => 
                                typeof role === 'object' ? (role.name || role) : role
                              ).join(', ');
                            }
                          }
                          if (employee.role) {
                            return typeof employee.role === 'object' 
                              ? (employee.role.name || 'Not specified')
                              : employee.role;
                          }
                          return 'Not specified';
                        })()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Joining Date</p>
                      <p className="font-semibold text-gray-900">
                        {employee.joiningDate && isValid(new Date(employee.joiningDate))
                          ? format(new Date(employee.joiningDate), 'PPP')
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <IndianRupee className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Salary</p>
                      <p className="font-semibold text-gray-900">
                        {employee.salary ? `₹${employee.salary.toLocaleString('en-IN')}` : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-yellow-50 rounded-xl p-6 shadow-sm border border-yellow-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-yellow-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Bank Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <CreditCard className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Account Number</p>
                    <p className="font-semibold text-gray-900">{employee.bankDetails?.accountNumber || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Building2 className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Bank Name</p>
                    <p className="font-semibold text-gray-900">{employee.bankDetails?.bankName || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <CreditCard className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">IFSC Code</p>
                    <p className="font-semibold text-gray-900">{employee.bankDetails?.ifscCode || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-purple-50 rounded-xl p-6 shadow-sm border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Emergency Contact</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Contact Name</p>
                    <p className="font-semibold text-gray-900">
                      {employee.emergencyContact && typeof employee.emergencyContact === 'object'
                        ? employee.emergencyContact.name || 'Not provided'
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Relationship</p>
                    <p className="font-semibold text-gray-900">
                      {employee.emergencyContact && typeof employee.emergencyContact === 'object'
                        ? employee.emergencyContact.relationship || 'Not provided'
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Phone className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Phone Number</p>
                    <p className="font-semibold text-gray-900">
                      {employee.emergencyContact && typeof employee.emergencyContact === 'object'
                        ? employee.emergencyContact.phone || 'Not provided'
                        : employee.emergencyContact || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 