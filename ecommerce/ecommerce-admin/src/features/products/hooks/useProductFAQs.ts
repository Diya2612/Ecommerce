import { useState } from 'react';
import { notifySuccess } from '@/utils';
import type { FAQItem } from '@/features/products/types';

/**
 * Hook for managing product FAQs
 * Handles adding, removing, updating, and reordering FAQs
 * 
 * Note: UI state (accordion expansion) should be managed at the component level
 * 
 * @param initialFAQs - Initial FAQ items
 * @returns FAQ state and handlers
 * 
 * @example
 * ```tsx
 * const { faqs, addFAQ, removeFAQ, updateFAQ } = useProductFAQs(initialData?.faqs);
 * ```
 */
export function useProductFAQs(initialFAQs: FAQItem[] = []) {
    const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs);

    /**
     * Add a new empty FAQ
     * Returns the new FAQ ID for UI expansion if needed
     */
    const addFAQ = (): string => {
        const newFAQ: FAQItem = {
            id: `faq-${Date.now()}`,
            question: '',
            answer: ''
        };
        setFaqs(prev => [...prev, newFAQ]);
        return newFAQ.id;
    };

    /**
     * Remove an FAQ by ID
     */
    const removeFAQ = (id: string) => {
        setFaqs(prev => prev.filter(faq => faq.id !== id));
        notifySuccess('FAQ removed');
    };

    /**
     * Update a specific field of an FAQ
     */
    const updateFAQ = (id: string, field: 'question' | 'answer', value: string) => {
        setFaqs(prev => prev.map(faq =>
            faq.id === id ? { ...faq, [field]: value } : faq
        ));
    };

    /**
     * Reorder FAQs (drag and drop support)
     */
    const reorderFAQs = (startIndex: number, endIndex: number) => {
        setFaqs(prev => {
            const result = Array.from(prev);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return result;
        });
    };

    /**
     * Validate FAQs
     * Returns error object keyed by faq-{id}-{field}
     */
    const validateFAQs = (): Record<string, string> => {
        const errors: Record<string, string> = {};

        faqs.forEach((faq) => {
            const question = typeof faq.question === 'string' ? faq.question.trim() : '';
            const answer = typeof faq.answer === 'string' ? faq.answer.trim() : '';

            if (!question) {
                errors[`faq-${faq.id}-question`] = 'Question is required';
            }
            if (!answer) {
                errors[`faq-${faq.id}-answer`] = 'Answer is required';
            }
        });

        return errors;
    };

    return {
        // State
        faqs,

        // Setters
        setFaqs,

        // Operations
        addFAQ,
        removeFAQ,
        updateFAQ,
        reorderFAQs,
        validateFAQs,
    };
}
