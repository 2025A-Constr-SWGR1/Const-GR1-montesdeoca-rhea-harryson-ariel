import Navigation from '@/components/Navigation';
import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '../utils/test-utils';

// Mock del hook useAuth
const mockSignOut = vi.fn();
const mockUseAuth = {
  user: { 
    id: '1', 
    email: 'test@test.com',
    user_metadata: { name: 'Test User' }
  },
  signOut: mockSignOut
};

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth
}));

describe('Navigation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation brand correctly', () => {
    render(<Navigation />);
    
    expect(screen.getByText('AEIS Game Rental')).toBeInTheDocument();
  });

  it('renders all navigation links when user is logged in', () => {
    render(<Navigation />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Juegos')).toBeInTheDocument();
    expect(screen.getByText('Mis Alquileres')).toBeInTheDocument();
    expect(screen.getByText('Planes')).toBeInTheDocument();
    expect(screen.getByText('Perfil')).toBeInTheDocument();
  });

  it('renders sign out button when user is logged in', () => {
    render(<Navigation />);
    
    const signOutButton = screen.getByRole('button');
    expect(signOutButton).toBeInTheDocument();
  });

  it('calls signOut when sign out button is clicked', () => {
    render(<Navigation />);
    
    const signOutButton = screen.getByRole('button');
    fireEvent.click(signOutButton);
    
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('navigation links have correct href attributes', () => {
    render(<Navigation />);
    
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('Juegos').closest('a')).toHaveAttribute('href', '/games');
    expect(screen.getByText('Mis Alquileres').closest('a')).toHaveAttribute('href', '/rentals');
    expect(screen.getByText('Planes').closest('a')).toHaveAttribute('href', '/subscriptions');
    expect(screen.getByText('Perfil').closest('a')).toHaveAttribute('href', '/profile');
  });

  it('renders when user is not logged in', () => {
    vi.mocked(mockUseAuth).user = null;
    
    render(<Navigation />);
    
    expect(screen.getByText('AEIS Game Rental')).toBeInTheDocument();
  });

  it('has responsive design classes', () => {
    render(<Navigation />);
    
    const navContainer = screen.getByRole('navigation');
    expect(navContainer).toHaveClass('bg-white', 'shadow-sm', 'border-b');
  });
});
