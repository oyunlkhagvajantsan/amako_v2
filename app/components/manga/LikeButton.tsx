"use client";

import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface LikeButtonProps {
    mangaId: number;
}

export default function LikeButton({ mangaId }: LikeButtonProps) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const queryKey = ["manga-like", mangaId];

    // Fetch like status
    const { data } = useQuery({
        queryKey,
        queryFn: async () => {
            const res = await fetch(`/api/manga/${mangaId}/like`);
            if (!res.ok) throw new Error("Failed to fetch like status");
            return res.json();
        },
    });

    const isLiked = data?.isLiked || false;
    const likeCount = data?.likeCount || 0;

    const mutation = useMutation({
        mutationFn: async () => {
            if (!session) {
                window.location.href = "/login";
                return;
            }
            const res = await fetch(`/api/manga/${mangaId}/like`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to toggle like");
            return res.json();
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey });
            const previousData = queryClient.getQueryData(queryKey);

            queryClient.setQueryData(queryKey, (old: any) => ({
                ...old,
                isLiked: !isLiked,
                likeCount: isLiked ? likeCount - 1 : likeCount + 1
            }));

            return { previousData };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(queryKey, context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    return (
        <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className={`group flex items-center gap-2.5 px-6 py-3 rounded-full transition-all duration-300 font-bold shadow-md hover:shadow-lg active:scale-95 ${isLiked
                ? "bg-[#d8454f] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-100"
                }`}
        >
            <Heart
                size={20}
                className={`transition-transform duration-300 group-hover:scale-110 ${isLiked ? "fill-current" : ""}`}
            />
            <span>{isLiked ? "Таалагдсан" : "Таалагдсан"}</span>
            <span className={`w-px h-4 mx-1 ${isLiked ? "bg-white/30" : "bg-gray-200"}`} />
            <span className="tabular-nums">{likeCount}</span>
        </button>
    );
}
