// Centralized payment configuration
// Update payment details here and they will automatically reflect everywhere

export const PAYMENT_INFO = {
    bank: "Khan Bank",
    accountNumber: "5429057057",
    iban: "MN360005005429057057",
    accountName: "Тэмүүлэн Дашцэнгэл",
} as const;

export type PaymentInfo = typeof PAYMENT_INFO;
