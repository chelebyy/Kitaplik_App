import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple local user interface
export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (name: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'local_user_profile';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const savedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (name: string) => {
        const newUser: User = {
            uid: 'local-user-' + Date.now(),
            displayName: name,
            email: null, // No email for local user
            photoURL: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=random',
        };

        try {
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
            setUser(newUser);
        } catch (error) {
            console.error('Failed to save user profile:', error);
        }
    };

    const signOut = async () => {
        try {
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
            setUser(null);
        } catch (error) {
            console.error('Failed to remove user profile:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
