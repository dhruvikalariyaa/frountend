
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from "@/lib/utils";

interface License {
  id: number;
  name: string;
  type: string;
  seats: number;
  used: number;
  status: string;
  startDate: string;
  endDate: string;
  cost: number;
  vendor: string;
  autoRenew: boolean;
}

interface ViewLicenseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  license: License | null;
}

function getStatusBadge(status: string) {
  const statusMap: Record<string, { bg: string; text: string }> = {
    "Active": { bg: "bg-green-50", text: "text-green-700" },
    "Expired": { bg: "bg-red-50", text: "text-red-700" },
    "Pending": { bg: "bg-yellow-50", text: "text-yellow-700" },
  };

  const { bg, text } = statusMap[status] || { bg: "bg-gray-50", text: "text-gray-700" };

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2.5 py-0.5 rounded-full text-xs font-medium",
        bg,
        text
      )}
    >
      {status}
    </Badge>
  );
}

export function ViewLicenseDetailsDialog({ open, onOpenChange, license }: ViewLicenseDetailsDialogProps) {
  if (!license) {
    return null;
  }

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
          <DialogTitle className="text-2xl font-bold">License Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="space-y-1">
              <DetailRow label="Name" value={license.name} />
              <DetailRow label="Type" value={license.type} />
              <DetailRow label="Vendor" value={license.vendor} />
              <DetailRow 
                label="Status" 
                value={getStatusBadge(license.status)} 
              />
            </div>
          </div>

          {/* License Usage */}
          <div>
            <h3 className="text-lg font-semibold mb-4">License Usage</h3>
            <div className="space-y-1">
              <DetailRow 
                label="Seats" 
                value={`${license.used} / ${license.seats}`} 
              />
              <DetailRow 
                label="Cost" 
                value={`$${license.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              />
              <DetailRow 
                label="Auto Renew" 
                value={license.autoRenew ? 'Yes' : 'No'} 
              />
            </div>
          </div>

          {/* Validity Period */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Validity Period</h3>
            <div className="space-y-1">
              <DetailRow label="Start Date" value={license.startDate} />
              <DetailRow label="End Date" value={license.endDate} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 