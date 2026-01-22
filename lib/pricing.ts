// Centralized pricing configuration
// Update prices here and they will automatically reflect everywhere

export const PRICING = {
    1: 5000,   // 1 month
    2: 9000,   // 2 months
    3: 13000,  // 3 months
} as const;

export type PricingMonths = keyof typeof PRICING;

// Helper function to get price for a specific duration
export function getPrice(months: number): number {
    return PRICING[months as PricingMonths] || PRICING[1];
}

// Helper to format price with currency
export function formatPrice(price: number): string {
    return `${price.toLocaleString()}₮`;
}
