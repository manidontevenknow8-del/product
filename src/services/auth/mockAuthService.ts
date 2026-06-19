import type {
  AuthSession,
  User,
} from '@/types/auth';
import type { IAuthService } from './types';

const STORAGE_KEY = 'petclues_auth_session';
const USERS_KEY = 'petclues_mock_users';

type StoredUser = User & { password: string };

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveSession(session: AuthSession | null) {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function createSession(user: User): AuthSession {
  return {
    user,
    accessToken: `mock_token_${user.id}`,
  };
}

type AuthListener = (session: AuthSession | null) => void;

const listeners = new Set<AuthListener>();

function notifyListeners(session: AuthSession | null) {
  listeners.forEach((listener) => listener(session));
}

export const mockAuthService: IAuthService = {
  async signUp({ name, email, password }) {
    const users = loadUsers();
    if (users.some((u) => u.email === email)) {
      return {
        success: false,
        error: { code: 'email_exists', message: 'An account with this email already exists.' },
      };
    }

    const user: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      emailVerified: false,
      needsOnboarding: true,
      subscriptionTier: 'free',
      subscriptionPlan: 'free',
      subscriptionStatus: 'inactive',
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    saveUsers(users);

    const { password: _, ...safeUser } = user;
    const session = createSession(safeUser);
    saveSession(session);
    notifyListeners(session);
    return { success: true, session };
  },

  async signIn({ email, password }) {
    const users = loadUsers();
    const found = users.find((u) => u.email === email && u.password === password);

    if (!found) {
      return {
        success: false,
        error: { code: 'invalid_credentials', message: 'Invalid email or password.' },
      };
    }

    const { password: _, ...safeUser } = found;
    const session = createSession(safeUser);
    saveSession(session);
    notifyListeners(session);
    return { success: true, session };
  },

  async signInWithGoogle() {
    const users = loadUsers();
    const email = 'google.demo@petclues.com';
    let found = users.find((u) => u.email === email);

    if (!found) {
      found = {
        id: crypto.randomUUID(),
        name: 'Google Demo User',
        email,
        password: '',
        emailVerified: true,
        needsOnboarding: true,
        subscriptionTier: 'free',
        subscriptionPlan: 'free',
        subscriptionStatus: 'inactive',
        createdAt: new Date().toISOString(),
      };
      users.push(found);
      saveUsers(users);
    }

    const { password: _, ...safeUser } = found;
    const session = createSession({ ...safeUser, emailVerified: true });
    saveSession(session);
    notifyListeners(session);
    return { success: true, session };
  },

  async signOut() {
    saveSession(null);
    notifyListeners(null);
  },

  async resetPassword(email) {
    const users = loadUsers();
    if (!users.some((u) => u.email === email)) {
      return { success: false, error: 'No account found with this email.' };
    }
    return { success: true };
  },

  async getSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const session: AuthSession = JSON.parse(raw);
      const users = loadUsers();
      const fresh = users.find((u) => u.id === session.user.id);
      if (!fresh) {
        saveSession(null);
        return null;
      }
      const { password: _, ...safeUser } = fresh;
      return createSession(safeUser);
    } catch {
      return null;
    }
  },

  async refreshSession() {
    return mockAuthService.getSession();
  },

  async completeOnboarding(userId) {
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx >= 0) {
      users[idx].needsOnboarding = false;
      saveUsers(users);
      const session = await mockAuthService.getSession();
      if (session?.user.id === userId) {
        const updated = createSession({ ...session.user, needsOnboarding: false });
        saveSession(updated);
        notifyListeners(updated);
      }
    }
  },

  async verifyEmail(userId) {
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx >= 0) {
      users[idx].emailVerified = true;
      saveUsers(users);
      const session = await mockAuthService.getSession();
      if (session?.user.id === userId) {
        const updated = createSession({ ...session.user, emailVerified: true });
        saveSession(updated);
        notifyListeners(updated);
      }
    }
  },

  async resendVerificationEmail(_email) {
    return { success: true };
  },

  async updatePassword(_password) {
    return { success: true };
  },

  onAuthStateChange(listener) {
    listeners.add(listener);
    void mockAuthService.getSession().then(listener);
    return () => listeners.delete(listener);
  },
};
