"use client";

import { Trash2 } from "lucide-react";

export default function DeleteChapterButtonInline() {
    return (
        <button
            type="submit"
            className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-bold transition-colors"
            title="Delete chapter"
            onClick={(e) => {
                if (!confirm("Are you sure you want to delete this chapter?")) {
                    e.preventDefault();
                }
            }}
        >
            <Trash2 size={12} />
            Delete
        </button>
    );
}
