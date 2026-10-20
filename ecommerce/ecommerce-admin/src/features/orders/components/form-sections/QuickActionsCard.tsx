import { MessageCircle, Tag, Send, Package } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickActionsCardProps {
  onAddNote: () => void;
  onAddTag: () => void;
  onSendInvoice: () => void;
  onAddFulfillment: () => void;
}

export function QuickActionsCard({
  onAddNote,
  onAddTag,
  onSendInvoice,
  onAddFulfillment,
}: QuickActionsCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 py-3 px-4">
        <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="py-3 px-4 space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs justify-start"
          type="button"
          onClick={onAddNote}
        >
          <MessageCircle className="w-3 h-3 mr-2" />
          Add Note
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs justify-start"
          type="button"
          onClick={onAddTag}
        >
          <Tag className="w-3 h-3 mr-2" />
          Add Tag
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs justify-start"
          type="button"
          onClick={onSendInvoice}
        >
          <Send className="w-3 h-3 mr-2" />
          Send Invoice
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs justify-start"
          type="button"
          onClick={onAddFulfillment}
        >
          <Package className="w-3 h-3 mr-2" />
          Add Fulfillment
        </Button>
      </CardContent>
    </Card>
  );
}
