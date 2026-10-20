import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import type { AbandonedCartEmailModalProps } from '../../types';

export const AbandonedCartEmailModal = ({
    onClose,
    onConfirm,
    selectedCount,
    templates
}: AbandonedCartEmailModalProps) => {
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [discountCode, setDiscountCode] = useState('');

    const activeTemplate = templates.find(t => t.id === selectedTemplate);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Send Recovery Email</h3>
                            <p className="text-sm text-slate-600 mt-1">
                                Sending to {selectedCount} customer(s)
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            <X className="size-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6 space-y-6">
                    {/* Template Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                            Email Template *
                        </label>
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a template..." />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map(template => (
                                    <SelectItem key={template.id} value={template.id}>
                                        {template.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {activeTemplate && (
                            <p className="text-xs text-slate-600 mt-2">
                                Preview: {activeTemplate.preview}
                            </p>
                        )}
                    </div>

                    {/* Subject Line */}
                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                            Email Subject
                        </label>
                        <Input
                            value={emailSubject || activeTemplate?.subject || ''}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            placeholder="Enter custom subject (optional)"
                        />
                    </div>

                    {/* Discount Code */}
                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                            Discount Code (Optional)
                        </label>
                        <Input
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            placeholder="e.g., SAVE10, WELCOME20"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Include a special discount code to incentivize purchase completion
                        </p>
                    </div>

                    {/* Preview */}
                    {activeTemplate && (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-xs font-semibold text-slate-600 mb-2">EMAIL PREVIEW</p>
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-900">
                                    Subject: {emailSubject || activeTemplate.subject}
                                </p>
                                <p className="text-sm text-slate-600">
                                    {activeTemplate.preview}
                                </p>
                                {discountCode && (
                                    <div className="mt-3 p-2 bg-indigo-50 border border-indigo-200 rounded">
                                        <p className="text-xs font-medium text-indigo-900">
                                            Use code: <span className="font-mono font-bold">{discountCode}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-[#0e042f] hover:bg-[#0e042f]/90 text-white"
                        onClick={() => onConfirm(selectedTemplate)}
                        disabled={!selectedTemplate}
                    >
                        <Send className="size-4 mr-2" />
                        Send Email
                    </Button>
                </div>
            </div>
        </div>
    );
};
