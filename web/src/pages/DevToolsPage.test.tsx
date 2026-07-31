import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

vi.mock('../hooks/useAuthMe', () => ({
  useAuthMe: vi.fn(),
}));

import DevToolsPage from './DevToolsPage';
import { useAuthMe } from '../hooks/useAuthMe';

function renderWithQuery(ui: ReactNode) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('DevToolsPage coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders restricted access banner for non-admin users', async () => {
    vi.mocked(useAuthMe).mockReturnValue({
      data: { actor_id: 'user-1', roles: ['User'], admin: false },
      isLoading: false,
      isAdmin: () => false,
    } as never);

    renderWithQuery(<DevToolsPage />);
    expect(screen.getByText(/Quyền Truy Cập Bị Hạn Chế/i)).toBeInTheDocument();
  });

  it('renders full API DevTools center for admin users', async () => {
    vi.mocked(useAuthMe).mockReturnValue({
      data: { actor_id: 'admin-1', roles: ['Admin'], admin: true },
      isLoading: false,
      isAdmin: () => true,
    } as never);

    renderWithQuery(<DevToolsPage />);
    expect(screen.getByText(/Công Cụ Phát Triển & API/i)).toBeInTheDocument();
    expect(screen.getByText(/Các API Đang Có/i)).toBeInTheDocument();
    expect(screen.getByText(/Các API Đã Xóa Đi/i)).toBeInTheDocument();
    expect(screen.getByText(/Các API Dự Kiến Thêm/i)).toBeInTheDocument();
  });
});
