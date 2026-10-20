import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

interface OrderNotesProps {
  customerNote?: string;
  adminComment?: string;
}

export const OrderNotes = ({ customerNote, adminComment }: OrderNotesProps) => {
  if (!customerNote && !adminComment) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="size-5 text-icon-muted" />
        <h2 className="font-semibold text-slate-900">
          Notes & Comments
        </h2>
      </div>

      <div className="space-y-4">
        {customerNote && (
          <div>
            <p className="text-xs text-slate-600 mb-1">Customer Note</p>
            <p className="text-slate-900">{customerNote}</p>
          </div>
        )}
        {adminComment && (
          <div>
            <p className="text-xs text-slate-600 mb-1">Admin Comment</p>
            <p className="text-slate-900">{adminComment}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
