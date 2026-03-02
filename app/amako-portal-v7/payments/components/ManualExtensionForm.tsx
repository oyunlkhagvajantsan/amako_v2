"use client";

import { useActionState } from "react";
import { PricingMonths } from "@/lib/pricing";

interface ManualExtensionFormProps {
    action: (prevState: any, formData: FormData) => Promise<{ success: boolean; message: string }>;
}

export function ManualExtensionForm({ action }: ManualExtensionFormProps) {
    const [state, formAction, isPending] = useActionState(action, null);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-red-600 rounded-full"></span>
                Manual Extension
            </h2>

            {state && (
                <div className={`mb-4 p-4 rounded-lg text-sm font-medium ${state.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {state.message}
                </div>
            )}

            <form action={formAction} className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[240px]">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">User Email</label>
                    <input
                        name="email"
                        type="email"
                        required
                        placeholder="user@example.com"
                        disabled={isPending}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
                    />
                </div>
                <div className="w-32">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Months</label>
                    <select
                        name="months"
                        disabled={isPending}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
                    >
                        <option value="1">1 Month</option>
                        <option value="2">2 Months</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">12 Months</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-sm shadow-red-200 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                    {isPending ? "Submitting..." : "Add Subscription"}
                </button>
            </form>
            <p className="mt-2 text-xs text-gray-400">
                * This will create an approved record and extend the user's subscription immediately. A confirmation email will be sent.
            </p>
        </div>
    );
}
