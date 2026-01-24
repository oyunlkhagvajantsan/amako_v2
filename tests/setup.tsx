import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '',
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
    useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
    SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Lucide icons to avoid rendering heavy SVG components in tests
vi.mock('lucide-react', async () => {
    const actual = await vi.importActual('lucide-react');
    return {
        ...actual as any,
        MessageSquare: () => <div data-testid="icon-message-square" />,
        ThumbsUp: () => <div data-testid="icon-thumbs-up" />,
        Send: () => <div data-testid="icon-send" />,
        RefreshCcw: () => <div data-testid="icon-refresh" />,
        LogIn: () => <div data-testid="icon-login" />,
        Trash2: () => <div data-testid="icon-trash" />,
        EyeOff: () => <div data-testid="icon-eye-off" />,
        Eye: () => <div data-testid="icon-eye" />,
        MoreVertical: () => <div data-testid="icon-more" />,
    };
});
