"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  apiLogin,
  apiRegister,
  apiLogout,
  apiGetProfile,
  getToken,
  BackendProfile,
} from "../../_lib/api";

export type AccountType =
  | "individual"
  | "family-head"
  | "family-member"
  | "doctor";

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
  specialty?: string;
  accountType: AccountType;
  role?: "patient" | "provider" | "admin";
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
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string; user?: User }>;
  register: (data: RegisterData) => Promise<{ ok: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  inviteFamilyMember: (
    email: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  removeFamilyMember: (memberId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function profileToUser(profile: BackendProfile): User {
  const role = profile.Role as User["role"];
  return {
    id: String(profile.ID),
    name: profile.Username,
    email: profile.Email,
    accountType: role === "provider" || role === "admin" ? "doctor" : "individual",
    role,
    createdAt: profile.CreatedAt,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const restoreSession = async () => {
      if (getToken()) {
        const result = await apiGetProfile();
        if (result.ok && result.profile) {
          setUser(profileToUser(result.profile));
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ ok: boolean; error?: string; user?: User }> => {
    const backendResult = await apiLogin(email, password);

    if (backendResult.ok) {
      const profileResult = await apiGetProfile();
      if (profileResult.ok && profileResult.profile) {
        const nextUser = profileToUser(profileResult.profile);
        setUser(nextUser);
        return { ok: true, user: nextUser };
      }
      return { ok: false, error: "Could not load profile after login." };
    }

    return { ok: false, error: backendResult.error };
  };

  const register = async (
    data: RegisterData,
  ): Promise<{ ok: boolean; error?: string; user?: User }> => {
    const regResult = await apiRegister(
      data.name,
      data.email,
      data.password,
      data.accountType === "doctor" ? "provider" : undefined,
    );
    if (!regResult.ok) {
      return { ok: false, error: regResult.error };
    }

    const loginResult = await apiLogin(data.email, data.password);
    if (!loginResult.ok) {
      return { ok: false, error: loginResult.error };
    }

    const profileResult = await apiGetProfile();
    if (profileResult.ok && profileResult.profile) {
      const nextUser = profileToUser(profileResult.profile);
      setUser(nextUser);
      return { ok: true, user: nextUser };
    }
    return {
      ok: true,
      user: {
        id: "pending",
        name: data.name,
        email: data.email,
        accountType: data.accountType,
        createdAt: new Date().toISOString(),
      },
    };
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    router.push("/");
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  const inviteFamilyMember = async (
    email: string,
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
    updateUser({ familyMembers: [...members, newMember] });
    return { ok: true };
  };

  const removeFamilyMember = (memberId: string) => {
    if (!user) return;
    updateUser({
      familyMembers: (user.familyMembers ?? []).filter((m) => m.id !== memberId),
    });
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
