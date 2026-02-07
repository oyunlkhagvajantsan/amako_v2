import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import CommentItem from './CommentItem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

const mockComment = {
    id: '1',
    content: 'Test comment content',
    createdAt: new Date().toISOString(),
    userId: 'user-1',
    mangaId: 1,
    isHidden: false,
    user: {
        id: 'user-1',
        username: 'Test User',
        image: null,
        role: 'USER',
    },
    likes: [],
    _count: {
        likes: 0,
        replies: 0,
    },
    replies: [],
};

test('renders comment content and user name', () => {
    const queryClient = createTestQueryClient();
    render(
        <QueryClientProvider client={queryClient}>
            <CommentItem comment={mockComment as any} mangaId={1} onRefresh={() => { }} />
        </QueryClientProvider>
    );

    expect(screen.getByText('Test comment content')).toBeDefined();
    expect(screen.getByText('Test User')).toBeDefined();
});

test('renders admin badge for admin user', () => {
    const queryClient = createTestQueryClient();
    const adminComment = {
        ...mockComment,
        user: { ...mockComment.user, role: 'ADMIN' },
    };

    render(
        <QueryClientProvider client={queryClient}>
            <CommentItem comment={adminComment as any} mangaId={1} onRefresh={() => { }} />
        </QueryClientProvider>
    );

    expect(screen.getByText('Админ')).toBeDefined();
});
