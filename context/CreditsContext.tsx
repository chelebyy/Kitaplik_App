import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CreditsContextType {
    credits: number;
    addCredits: (amount: number) => Promise<void>;
    spendCredits: (amount: number) => Promise<boolean>;
    isLoading: boolean;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

const CREDITS_STORAGE_KEY = '@user_credits';

export function CreditsProvider({ children }: { children: React.ReactNode }) {
    const [credits, setCredits] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    // Load credits on mount
    useEffect(() => {
        loadCredits();
    }, []);

    const loadCredits = async () => {
        try {
            const storedCredits = await AsyncStorage.getItem(CREDITS_STORAGE_KEY);
            if (storedCredits !== null) {
                setCredits(parseInt(storedCredits, 10));
            }
        } catch (error) {
            console.error('Failed to load credits:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveCredits = async (newCredits: number) => {
        try {
            await AsyncStorage.setItem(CREDITS_STORAGE_KEY, newCredits.toString());
        } catch (error) {
            console.error('Failed to save credits:', error);
        }
    };

    const addCredits = async (amount: number) => {
        setCredits((prev) => {
            const newValue = prev + amount;
            saveCredits(newValue);
            return newValue;
        });
    };

    const spendCredits = async (amount: number): Promise<boolean> => {
        if (credits >= amount) {
            setCredits((prev) => {
                const newValue = prev - amount;
                saveCredits(newValue);
                return newValue;
            });
            return true;
        }
        return false;
    };

    return (
        <CreditsContext.Provider value={{ credits, addCredits, spendCredits, isLoading }}>
            {children}
        </CreditsContext.Provider>
    );
}

export function useCredits() {
    const context = useContext(CreditsContext);
    if (!context) {
        throw new Error('useCredits must be used within a CreditsProvider');
    }
    return context;
}
