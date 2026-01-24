"use client";

import { useFormStatus } from "react-dom";

export default function DeleteChapterButton() {
    const { pending } = useFormStatus();

    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!confirm("Are you SURE you want to delete this entire chapter? This cannot be undone.")) {
            e.preventDefault();
        }
    };

    return (
        <button
            type="submit"
            disabled={pending}
            className="px-6 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50"
            onClick={handleDelete}
        >
            {pending ? "Deleting..." : "Delete Forever"}
        </button>
    );
}
