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

// Mock de Supabase con todas las funciones necesarias
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
    auth: {
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
    },
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnValue({
        subscribe: vi.fn().mockResolvedValue({ status: 'SUBSCRIBED' }),
      }),
      unsubscribe: vi.fn().mockResolvedValue({ status: 'CLOSED' }),
    }),
    removeChannel: vi.fn().mockResolvedValue({ status: 'CLOSED' }),
  },
}));

describe('Dashboard Page - Consolidated Tests', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
    });
  });

  it('renders dashboard with all components', async () => {
    render(<Dashboard />);
    
    // Navigation should be present
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    
    // Welcome message should appear
    await waitFor(() => {
      expect(screen.getByText(/bienvenido/i)).toBeInTheDocument();
    });

    // Statistics cards should be present
    await waitFor(() => {
      expect(screen.getByText(/juegos disponibles/i)).toBeInTheDocument();
      expect(screen.getByText(/alquileres activos/i)).toBeInTheDocument();
      expect(screen.getByText(/alquileres completados/i)).toBeInTheDocument();
      expect(screen.getByText(/alquileres vencidos/i)).toBeInTheDocument();
    });

    // System information section should be present
    await waitFor(() => {
      expect(screen.getByText(/información del sistema/i)).toBeInTheDocument();
    });

    // Quick actions should be present
    await waitFor(() => {
      expect(screen.getByText(/acciones rápidas/i)).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<Dashboard />);
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('has responsive layout classes', () => {
    render(<Dashboard />);
    const mainContainer = document.querySelector('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
  });

  it('handles Supabase real-time subscriptions without errors', () => {
    // This test verifies that the component can render without throwing
    // errors related to missing Supabase channel functions
    expect(() => {
      render(<Dashboard />);
    }).not.toThrow();

    // The mocked functions should be available without throwing errors
    // This validates that all necessary Supabase methods are properly mocked
  });
});
