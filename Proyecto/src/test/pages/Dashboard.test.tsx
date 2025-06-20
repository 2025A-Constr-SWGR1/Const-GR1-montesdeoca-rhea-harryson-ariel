import Dashboard from '@/pages/Dashboard';
import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockUser } from '../mocks/supabase';
import { render } from '../utils/test-utils';

// Mock de Navigation
vi.mock('@/components/Navigation', () => ({
  default: () => <div data-testid="navigation">Navigation Component</div>,
}));

// Mock de useAuth
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock de Supabase con funciones directamente en el factory
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          count: vi.fn().mockResolvedValue({ data: [], count: 0, error: null }),
        }),
      }),
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnValue({
        subscribe: vi.fn().mockResolvedValue({ status: 'SUBSCRIBED' }),
      }),
      unsubscribe: vi.fn().mockResolvedValue({ status: 'CLOSED' }),
    }),
    removeChannel: vi.fn().mockResolvedValue({ status: 'CLOSED' }),
  },
}));

describe('Dashboard Page', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
    });
  });

  it('renders dashboard title and navigation', async () => {
    render(<Dashboard />);
    
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/bienvenido/i)).toBeInTheDocument();
    });
  });

  it('displays dashboard statistics cards', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/juegos disponibles/i)).toBeInTheDocument();
      expect(screen.getByText(/alquileres activos/i)).toBeInTheDocument();
      expect(screen.getByText(/alquileres completados/i)).toBeInTheDocument();
      expect(screen.getByText(/alquileres vencidos/i)).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<Dashboard />);
    
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('displays recent activity section', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/información del sistema/i)).toBeInTheDocument();
    });
  });

  it('shows quick actions section', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/acciones rápidas/i)).toBeInTheDocument();
    });
  });

  it('renders responsive layout classes', () => {
    render(<Dashboard />);
    
    const mainContainer = document.querySelector('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
  });
});
