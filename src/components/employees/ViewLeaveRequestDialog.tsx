import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Badge } from "@/components/ui/badge";
  
  interface ViewLeaveRequestDialogProps {
    request: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }
  
  export function ViewLeaveRequestDialog({ request, open, onOpenChange }: ViewLeaveRequestDialogProps) {
    if (!request) return null;
  
    const DetailRow = ({ label, value }: { label: string; value: any }) => (
      <div className="grid grid-cols-3 gap-4 py-3 border-b last:border-0">
        <dt className="font-medium text-gray-500">{label}</dt>
        <dd className="col-span-2">{value}</dd>
      </div>
    );
  
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'approved':
          return 'bg-green-100 text-green-800';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'rejected':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Leave Request Details</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            {/* Request Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Request Information</h3>
              <div className="space-y-1">
                <DetailRow label="Employee" value={request.employee} />
                <DetailRow label="Leave Type" value={request.type} />
                <DetailRow label="Start Date" value={request.startDate} />
                <DetailRow label="End Date" value={request.endDate} />
                <DetailRow label="Days" value={request.days} />
              </div>
            </div>
  
            {/* Status and Reason */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Status & Reason</h3>
              <div className="space-y-1">
                <DetailRow
                  label="Status"
                  value={
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  }
                />
                <DetailRow label="Reason" value={request.reason || "No reason provided"} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  } 