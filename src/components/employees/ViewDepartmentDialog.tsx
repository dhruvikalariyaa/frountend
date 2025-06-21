import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Badge } from "@/components/ui/badge";
  
  interface ViewDepartmentDialogProps {
    department: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }
  
  export function ViewDepartmentDialog({ department, open, onOpenChange }: ViewDepartmentDialogProps) {
    if (!department) return null;
  
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
            <DialogTitle className="text-2xl font-bold">Department Details</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="space-y-1">
                <DetailRow label="Name" value={department.name} />
                <DetailRow label="Code" value={department.code} />
                <DetailRow label="Manager" value={department.manager} />
                <DetailRow label="Location" value={department.location} />
              </div>
            </div>
  
            {/* Department Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Department Statistics</h3>
              <div className="space-y-1">
                <DetailRow 
                  label="Status" 
                  value={
                    <Badge 
                      variant="outline" 
                      className={`${
                        department.status === "active" 
                          ? "bg-green-50 text-green-700" 
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {department.status.charAt(0).toUpperCase() + department.status.slice(1)}
                    </Badge>
                  } 
                />
                <DetailRow 
                  label="Budget" 
                  value={`$${department.budget.toLocaleString()}`} 
                />
                <DetailRow 
                  label="Employee Count" 
                  value={department.employeeCount} 
                />
                <DetailRow 
                  label="Projects" 
                  value={department.projects} 
                />
              </div>
            </div>
  
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Description</h3>
              <div className="space-y-1">
                <DetailRow 
                  label="Description" 
                  value={department.description || "No description provided"} 
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  } 