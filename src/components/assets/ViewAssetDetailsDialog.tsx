import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Badge } from "@/components/ui/badge";
  
  interface ViewAssetDetailsDialogProps {
    asset: any; // Assuming 'any' for now, can be more specific later
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }
  
  export function ViewAssetDetailsDialog({ asset, open, onOpenChange }: ViewAssetDetailsDialogProps) {
    if (!asset) return null;
  
    const DetailRow = ({ label, value }: { label: string; value: any }) => (
      <div className="grid grid-cols-3 gap-4 py-3 border-b last:border-0">
        <dt className="font-medium text-gray-500">{label}</dt>
        <dd className="col-span-2">{value}</dd>
      </div>
    );

    function getStatusBadge(status: string) {
        const statusMap: Record<string, { bg: string; text: string }> = {
          "In Use": { bg: "bg-green-100", text: "text-green-700" },
          "Active": { bg: "bg-blue-100", text: "text-blue-700" },
          "Maintenance": { bg: "bg-yellow-100", text: "text-yellow-700" },
          "Retired": { bg: "bg-red-100", text: "text-red-700" },
          "Available": { bg: "bg-gray-100", text: "text-gray-700" },
        };
      
        const { bg, text } = statusMap[status] || { bg: "bg-gray-100", text: "text-gray-700" };
      
        return (
          <Badge
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}
          >
            {status}
          </Badge>
        );
      }
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Asset Details</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="space-y-1">
                <DetailRow label="Name" value={asset.name} />
                <DetailRow label="Type" value={asset.type} />
                <DetailRow label="Category" value={asset.category} />
                <DetailRow label="Assigned To" value={asset.assignedTo || 'N/A'} />
                <DetailRow label="Location" value={asset.location} />
              </div>
            </div>
  
            {/* Status & Value */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Status & Value</h3>
              <div className="space-y-1">
                <DetailRow 
                  label="Status" 
                  value={getStatusBadge(asset.status)}
                />
                <DetailRow 
                  label="Value" 
                  value={`$${asset.value.toLocaleString()}`} 
                />
                <DetailRow 
                  label="Condition" 
                  value={asset.condition} 
                />
              </div>
            </div>
  
            {/* Purchase & Warranty */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Purchase & Warranty</h3>
              <div className="space-y-1">
                <DetailRow 
                  label="Purchase Date" 
                  value={asset.purchaseDate} 
                />
                <DetailRow 
                  label="Warranty Expiry" 
                  value={asset.warranty} 
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  } 