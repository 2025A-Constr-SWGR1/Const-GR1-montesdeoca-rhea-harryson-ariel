import Auth from '@/pages/Auth';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '../utils/test-utils';

// Mock del componente Navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to, replace }: { to: string; replace?: boolean }) => {
      mockNavigate(to, replace);
      return <div data-testid="navigate">Redirecting to {to}</div>;
    },
  };
});

// Mock del hook useAuth
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Auth Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      signIn: mockSignIn,
      signUp: mockSignUp,
      loading: false,
    });
  });

  it('renders auth form when user is not logged in', () => {
    render(<Auth />);

    expect(screen.getAllByText('Iniciar Sesión')).toHaveLength(2); // Tab and button
    expect(screen.getByText('Registrarse')).toBeInTheDocument();
  });

  it('redirects to dashboard when user is already logged in', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@test.com' },
      signIn: mockSignIn,
      signUp: mockSignUp,
      loading: false,
    });

    render(<Auth />);

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', true);
  });

  it('shows sign in form by default', () => {
    render(<Auth />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('can switch to sign up form', async () => {
    const user = userEvent.setup();
    render(<Auth />);

    const signUpTab = screen.getByRole('tab', { name: 'Registrarse' });
    await user.click(signUpTab);

    // Esperar a que el tab cambie usando waitFor
    await waitFor(() => {
      expect(signUpTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('handles sign in form submission', async () => {
    mockSignIn.mockResolvedValue({ error: null });

    render(<Auth />);

    // Llenar el formulario
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'password123' },
    });

    // Enviar formulario
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@test.com', 'password123');
    });
  });

  it('handles sign up form submission', async () => {
    mockSignUp.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    render(<Auth />);

    // Cambiar a la pestaña de registro
    const signUpTab = screen.getByRole('tab', { name: 'Registrarse' });
    await user.click(signUpTab);

    // Esperar a que el tab cambie y el formulario aparezca
    await waitFor(() => {
      expect(signUpTab).toHaveAttribute('aria-selected', 'true');
    });

    // Verificar que aparece el formulario de registro
    await waitFor(() => {
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during authentication', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      signIn: mockSignIn,
      signUp: mockSignUp,
      loading: true,
    });

    render(<Auth />);

    // Durante loading, no debería mostrar el Navigate
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('displays error messages when authentication fails', async () => {
    mockSignIn.mockResolvedValue({ 
      error: { message: 'Invalid email or password' } 
    });

    render(<Auth />);

    // Llenar y enviar formulario
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'wrongpassword' },
    });

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
  });
});
