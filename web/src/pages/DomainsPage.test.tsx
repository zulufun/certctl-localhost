import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DomainsPage from './DomainsPage';

describe('DomainsPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the domain management page and default domains', () => {
    render(
      <MemoryRouter>
        <DomainsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Quản Lý Domain')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('api.example.com')).toBeInTheDocument();
  });

  it('allows adding a new domain via modal', () => {
    render(
      <MemoryRouter>
        <DomainsPage />
      </MemoryRouter>
    );

    const addButton = screen.getByText('+ Thêm Domain Mới');
    fireEvent.click(addButton);

    expect(screen.getByText('Thêm Domain Mới Vừa Quản Lý')).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('e.g. example.com hoặc sub.domain.org');
    fireEvent.change(nameInput, { target: { value: 'newdomain.vn' } });

    const submitBtn = screen.getByRole('button', { name: 'Thêm Domain' });
    fireEvent.click(submitBtn);

    expect(screen.getByText('newdomain.vn')).toBeInTheDocument();
  });
});
