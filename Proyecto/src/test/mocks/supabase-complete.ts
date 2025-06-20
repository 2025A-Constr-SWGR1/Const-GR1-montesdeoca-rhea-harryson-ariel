// Mock completo de Supabase para todos los tests
import { vi } from 'vitest';

export const createSupabaseMock = () => ({
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
});

export const supabaseMock = createSupabaseMock();
