import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ViewEmployeeDialogProps {
  employee: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewEmployeeDialog({ employee, open, onOpenChange }: ViewEmployeeDialogProps) {
  if (!employee) return null;

  const DetailRow = ({ label, value }: { label: string; value: any }) => (
    <div className="grid grid-cols-3 gap-4 py-3 border-b last:border-0">
      <dt className="font-medium text-gray-500">{label}</dt>
      <dd className="col-span-2">{value}</dd>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="space-y-1">
              <DetailRow label="Name" value={employee.name} />
              <DetailRow label="Email" value={employee.email} />
              <DetailRow label="Phone" value={employee.phone || "Not provided"} />
              <DetailRow label="Address" value={employee.address || "Not provided"} />
            </div>
          </div>

          {/* Employment Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Employment Details</h3>
            <div className="space-y-1">
              <DetailRow 
                label="Department" 
                value={
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {employee.department}
                  </Badge>
                } 
              />
              <DetailRow label="Role" value={employee.role} />
              <DetailRow 
                label="Status" 
                value={
                  <Badge 
                    variant="outline" 
                    className={`${
                      employee.status === "Active" 
                        ? "bg-green-50 text-green-700" 
                        : employee.status === "Inactive"
                        ? "bg-red-50 text-red-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {employee.status}
                  </Badge>
                } 
              />
              <DetailRow 
                label="Join Date" 
                value={format(new Date(employee.joinDate), 'PPP')} 
              />
              <DetailRow 
                label="Employee ID" 
                value={employee.employeeId || "Not assigned"} 
              />
              <DetailRow 
                label="Salary" 
                value={employee.salary ? `$${employee.salary.toLocaleString()}` : "Not provided"} 
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
            <div className="space-y-1">
              <DetailRow 
                label="Emergency Contact" 
                value={employee.emergencyContact || "Not provided"} 
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 