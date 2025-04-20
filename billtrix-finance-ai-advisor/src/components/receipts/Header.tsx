import { RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface HeaderProps {
  syncing: boolean;
  onSync: () => void;
}

export const Header = ({ syncing, onSync }: HeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gmail Receipts</h2>
        <p className="text-muted-foreground">
          Automatically import and process email receipts
        </p>
      </div>
      {/* Responsive button group: vertical on mobile, horizontal on desktop */}
      <div className="flex flex-col gap-2 w-full max-w-xs sm:max-w-none sm:w-auto sm:flex-row sm:gap-2 sm:justify-end">
        <Button 
          className="sm:self-start w-full sm:w-auto" 
          onClick={onSync}
          disabled={syncing}
        >
          {syncing ? <Spinner size="sm" className="mr-2" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Sync Now
        </Button>
        <Button variant="outline" className="sm:self-start w-full sm:w-auto">
          <Mail className="mr-2 h-4 w-4" /> Connect Gmail
        </Button>
      </div>
    </div>
  );
};
