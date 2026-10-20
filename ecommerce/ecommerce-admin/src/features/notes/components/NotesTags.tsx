import { StickyNote, Tag as TagIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SmartTagInput } from '@/components/forms/inputs/SmartTagInput';
import { cn } from '@/lib/utils';

interface NotesTagsProps {
  customerNote?: string;
  onCustomerNoteChange?: (value: string) => void;
  adminComment?: string;
  onAdminCommentChange?: (value: string) => void;
  tags?: string[];
  onTagsChange?: (tags: string[]) => void;
  availableTags?: string[];
  className?: string;
  showCustomerNote?: boolean;
  tagType?: 'product' | 'customer' | 'order'; // Type for tag categorization
  onTagCreated?: (tagName: string) => void; // Callback when tag is created
}

export function NotesTags({
  customerNote,
  onCustomerNoteChange,
  adminComment,
  onAdminCommentChange,
  tags = [],
  onTagsChange,
  availableTags = [],
  className,
  showCustomerNote = true,
  tagType,
  onTagCreated,
}: NotesTagsProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 p-6 space-y-6", className)}>
      <div className="flex items-center gap-2">
        <StickyNote className="size-5 text-icon-muted" />
        <div>
          <h2 className="font-semibold text-slate-900">Notes & Tags</h2>
          <p className="text-sm text-slate-600 mt-1">Additional details and categorization</p>
        </div>
      </div>

      <div className="space-y-5">
        {showCustomerNote && onCustomerNoteChange && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 block">Customer Note</Label>
            <div className="relative group">
              <Textarea
                placeholder="Note visible to the customer..."
                value={customerNote}
                onChange={(e) => onCustomerNoteChange(e.target.value)}
                className="min-h-[80px] rounded-xl resize-y"
              />
            </div>
          </div>
        )}

        {onAdminCommentChange && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 block">Notes</Label>
            <div className="relative group">
              <Textarea
                placeholder="Add internal notes..."
                value={adminComment}
                onChange={(e) => onAdminCommentChange(e.target.value)}
                className="min-h-[80px] rounded-xl resize-y"
              />
            </div>
          </div>
        )}

        {onTagsChange && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <TagIcon className="size-4 text-icon-muted" />
              <Label className="text-sm font-medium text-slate-700">Tags</Label>
            </div>
            <SmartTagInput
              value={tags}
              onChange={onTagsChange}
              availableTags={availableTags}
              placeholder="Add a tag..."
              tagType={tagType}
              onTagCreated={onTagCreated}
            />
          </div>
        )}
      </div>
    </div>
  );
}
