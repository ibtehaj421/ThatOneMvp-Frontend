"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export type AccountType = "individual" | "family-head" | "family-member";

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: "head" | "member";
  status: "active" | "pending";
  joinedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  gender?: string;
  accountType: AccountType;
  familyId?: string;
  familyMembers?: FamilyMember[];
  createdAt: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  accountType: AccountType;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  inviteFamilyMember: (email: string) => Promise<{ ok: boolean; error?: string }>;
  removeFamilyMember: (memberId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "anam-users";
const SESSION_KEY = "anam-session";

/* Seed two demo accounts on first load */
function seedDemoAccounts() {
  const existing = getStoredUsers();
  if (existing.length > 0) return;

  const demos: Array<User & { password: string }> = [
    {
      id: "demo-1",
      name: "Ibrahim Khan",
      email: "demo@anam-ai.com",
      accountType: "individual",
      createdAt: new Date().toISOString(),
      password: "password123",
    },
    {
      id: "demo-2",
      name: "Sara Ahmed",
      email: "family@anam-ai.com",
      accountType: "family-head",
      familyId: "family-demo",
      familyMembers: [
        {
          id: "fm-1",
          name: "Sara Ahmed",
          email: "family@anam-ai.com",
          role: "head",
          status: "active",
          joinedAt: new Date().toISOString(),
        },
        {
          id: "fm-2",
          name: "Ali Ahmed",
          email: "ali@example.com",
          role: "member",
          status: "active",
          joinedAt: new Date().toISOString(),
        },
        {
          id: "fm-3",
          name: "Pending Invite",
          email: "cousin@example.com",
          role: "member",
          status: "pending",
          joinedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      password: "family123",
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(demos));
}

function getStoredUsers(): Array<User & { password: string }> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: Array<User & { password: string }>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

function saveSession(userId: string) {
  localStorage.setItem(SESSION_KEY, userId);
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    seedDemoAccounts();
    const sessionId = getSession();
    if (sessionId) {
      const users = getStoredUsers();
      const found = users.find((u) => u.id === sessionId);
      if (found) {
        const { password: _pw, ...rest } = found;
        setUser(rest);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const users = getStoredUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      return { ok: false, error: "Invalid email or password." };
    }
    const { password: _pw, ...rest } = found;
    setUser(rest);
    saveSession(found.id);
    return { ok: true };
  };

  const register = async (
    data: RegisterData
  ): Promise<{ ok: boolean; error?: string }> => {
    const users = getStoredUsers();
    if (users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const id = `user-${Date.now()}`;
    const familyId =
      data.accountType === "family-head" ? `family-${Date.now()}` : undefined;

    const newUser: User & { password: string } = {
      id,
      name: data.name,
      email: data.email,
      password: data.password,
      accountType: data.accountType,
      familyId,
      familyMembers:
        data.accountType === "family-head"
          ? [
              {
                id: `fm-${Date.now()}`,
                name: data.name,
                email: data.email,
                role: "head",
                status: "active",
                joinedAt: new Date().toISOString(),
              },
            ]
          : undefined,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const { password: _pw, ...rest } = newUser;
    setUser(rest);
    saveSession(id);
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    clearSession();
    router.push("/");
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      saveUsers(users);
    }
  };

  const inviteFamilyMember = async (
    email: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!user || user.accountType !== "family-head") {
      return { ok: false, error: "Only family plan heads can invite members." };
    }
    const members = user.familyMembers ?? [];
    if (members.length >= 5) {
      return { ok: false, error: "Family plan allows a maximum of 5 members." };
    }
    if (members.find((m) => m.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: "This email is already in your family plan." };
    }
    const newMember: FamilyMember = {
      id: `fm-${Date.now()}`,
      name: email.split("@")[0],
      email,
      role: "member",
      status: "pending",
      joinedAt: new Date().toISOString(),
    };
    const updatedMembers = [...members, newMember];
    updateUser({ familyMembers: updatedMembers });
    return { ok: true };
  };

  const removeFamilyMember = (memberId: string) => {
    if (!user) return;
    const updatedMembers = (user.familyMembers ?? []).filter(
      (m) => m.id !== memberId
    );
    updateUser({ familyMembers: updatedMembers });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        inviteFamilyMember,
        removeFamilyMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
