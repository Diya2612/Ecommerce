import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Plus } from 'lucide-react';
import { FormSection } from '@/components/forms';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
} from '@/components/ui/pagination';
import { FaqItem } from './FaqItem';
import { useFormContext, useFieldArray } from 'react-hook-form';
import type { ProductSchemaData } from '@/features/products/validation/productSchema';

interface FaqSectionProps {
    expandedFaqId?: string | null;
    setExpandedFaqId?: (id: string | null) => void;
}

export function FaqSection({
    expandedFaqId: controlledExpandedId,
    setExpandedFaqId: controlledSetExpandedId
}: FaqSectionProps) {
    const { control, register, formState: { errors } } = useFormContext<ProductSchemaData>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "faqs",
        keyName: "key"
    });

    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Controlled vs Uncontrolled state logic
    const [localExpandedFaqId, setLocalExpandedFaqId] = useState<string | null>(null);
    const isControlled = controlledExpandedId !== undefined;
    const expandedFaqId = isControlled ? controlledExpandedId : localExpandedFaqId;
    const setExpandedFaqId = isControlled ? controlledSetExpandedId! : setLocalExpandedFaqId;

    const [prevFaqCount, setPrevFaqCount] = useState(fields.length);
    const itemsPerPage = 5;

    // Calculate pagination
    const totalPages = Math.ceil(fields.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentFaqs = fields.slice(startIndex, startIndex + itemsPerPage);

    // Auto-expand new FAQ
    useEffect(() => {
        if (fields.length > prevFaqCount) {
            const lastFaq = fields[fields.length - 1];
            if (lastFaq) {
                setExpandedFaqId(lastFaq.id);
            }
        }
        setPrevFaqCount(fields.length);
    }, [fields.length, prevFaqCount, setExpandedFaqId, fields]);

    const onRemoveClick = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteIndex(index);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (deleteIndex !== null) {
            remove(deleteIndex);
            setDeleteIndex(null);
            setShowDeleteDialog(false);

            // Adjust current page if last item on page was deleted
            const newTotal = fields.length - 1;
            const newTotalPages = Math.ceil(newTotal / itemsPerPage);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }
        }
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleToggleExpand = (id: string) => {
        setExpandedFaqId(expandedFaqId === id ? null : id);
    };

    const handleAddFAQ = () => {
        append({ id: `faq-${Date.now()}`, question: '', answer: '' });
        // Go to last page when adding new FAQ
        const newTotal = fields.length + 1;
        const newTotalPages = Math.ceil(newTotal / itemsPerPage);
        setCurrentPage(newTotalPages);
    };

    const addButton = (
        <Button
            type="button"
            onClick={handleAddFAQ}
            size="sm"
            variant="outline"
            className="rounded-lg"
        >
            <Plus className="size-3.5 mr-1 text-icon-muted" />
            Add FAQ
        </Button>
    );

    return (
        <>
            <FormSection icon={MessageCircle} title="FAQ Group" actions={addButton}>
                {fields.length > 0 ? (
                    <div className="space-y-4">
                        {currentFaqs.map((faq, chunkIndex) => {
                            // Calculate the actual index in the full fields array
                            const index = startIndex + chunkIndex;

                            return (
                                <FaqItem
                                    key={faq.key}
                                    id={faq.id}
                                    index={index}
                                    question={faq.question}
                                    isExpanded={expandedFaqId === faq.id}
                                    onToggle={handleToggleExpand}
                                    onRemove={onRemoveClick}
                                    register={register}
                                    errors={errors}
                                />
                            );
                        })}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                                <div className="text-sm text-slate-500">
                                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, fields.length)} of {fields.length} FAQs
                                </div>
                                <Pagination className="mx-0 justify-end w-auto">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); goToPage(currentPage - 1); }}
                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <span className="text-xs font-medium text-slate-700 mx-2">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); goToPage(currentPage + 1); }}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <MessageCircle className="size-10 mx-auto mb-3 text-icon-muted" />
                        <p className="text-sm text-slate-500">No FAQs added yet. Click "Add FAQ" to get started.</p>
                    </div>
                )}
            </FormSection>

            <ConfirmationDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title="Delete FAQ"
                description="Are you sure you want to delete this FAQ? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </>
    );
}
