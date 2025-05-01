import React, { ReactNode } from 'react';
import { AuthState, AuthUser } from '../types';
interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    signup: (username: string, email: string, password: string, avatar: File) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
    isLoading: boolean;
    uploadAvatar: (file: File) => Promise<AuthUser>;
}
export declare const useAuth: () => AuthContextType;
interface AuthProviderProps {
    children: ReactNode;
}
export declare const AuthProvider: React.FC<AuthProviderProps>;
export {};
