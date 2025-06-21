import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface MaintenanceTask {
  id: number;
  assetName: string;
  type: string;
  status: string;
  priority: string;
  assignedTo: string;
  dueDate: string;
  lastMaintenance: string;
  frequency: string;
  description: string;
}

interface ViewMaintenanceDialogProps {
  task: MaintenanceTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getStatusBadge(status: string) {
  const statusMap: Record<string, { bg: string; text: string }> = {
    "Scheduled": { bg: "bg-blue-50", text: "text-blue-700" },
    "In Progress": { bg: "bg-yellow-50", text: "text-yellow-700" },
    "Completed": { bg: "bg-green-50", text: "text-green-700" },
    "Overdue": { bg: "bg-red-50", text: "text-red-700" },
  };

  const { bg, text } = statusMap[status] || { bg: "bg-gray-50", text: "text-gray-700" };

  return (
    <Badge
      variant="outline"
      className={`${bg} ${text}`}
    >
      {status}
    </Badge>
  );
}

function getPriorityBadge(priority: string) {
  const priorityMap: Record<string, { bg: string; text: string }> = {
    "High": { bg: "bg-red-50", text: "text-red-700" },
    "Medium": { bg: "bg-yellow-50", text: "text-yellow-700" },
    "Low": { bg: "bg-green-50", text: "text-green-700" },
  };

  const { bg, text } = priorityMap[priority] || { bg: "bg-gray-50", text: "text-gray-700" };

  return (
    <Badge
      variant="outline"
      className={`${bg} ${text}`}
    >
      {priority}
    </Badge>
  );
}

export function ViewMaintenanceDialog({ task, open, onOpenChange }: ViewMaintenanceDialogProps) {
  if (!task) return null;

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
          <DialogTitle className="text-2xl font-bold">Maintenance Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="space-y-1">
              <DetailRow label="Asset Name" value={task.assetName} />
              <DetailRow label="Type" value={task.type} />
              <DetailRow label="Status" value={getStatusBadge(task.status)} />
              <DetailRow label="Priority" value={getPriorityBadge(task.priority)} />
            </div>
          </div>

          {/* Assignment Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Assignment Details</h3>
            <div className="space-y-1">
              <DetailRow label="Assigned To" value={task.assignedTo} />
              <DetailRow label="Due Date" value={task.dueDate} />
              <DetailRow label="Last Maintenance" value={task.lastMaintenance} />
              <DetailRow label="Frequency" value={task.frequency} />
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Description</h3>
            <div className="space-y-1">
              <DetailRow 
                label="Description" 
                value={task.description || "No description provided"} 
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 