// ============================================================================
// AMC TypeScript Interfaces
// ============================================================================

export interface AMCPlan {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    notIncluded: string[];
    popular: boolean;
    color: string;
}
