'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Mission, getMissions } from '../services/airtable';

// Create default empty missions array
const defaultMissions: Mission[] = [];

// Create context type
interface MissionsContextType {
    missions: Mission[];
    loading: boolean;
    error: string | null;
    refetchMissions: () => Promise<void>;
}

// Create context
const MissionsContext = createContext<MissionsContextType>({
    missions: defaultMissions,
    loading: true,
    error: null,
    refetchMissions: async () => { }
});

// Context provider props
interface MissionsProviderProps {
    children: ReactNode;
}

// Context provider component
export const MissionsProvider: React.FC<MissionsProviderProps> = ({ children }) => {
    const [missions, setMissions] = useState<Mission[]>(defaultMissions);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Function to fetch mission data
    const fetchMissions = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getMissions();
            setMissions(data);
        } catch (err) {
            setError('Failed to fetch missions data');
            console.error('Error fetching missions:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when component mounts
    useEffect(() => {
        fetchMissions();
    }, []);

    // Context value
    const value = {
        missions,
        loading,
        error,
        refetchMissions: fetchMissions
    };

    return (
        <MissionsContext.Provider value={value}>
            {children}
        </MissionsContext.Provider>
    );
};

// Hook to use the context
export const useMissions = () => useContext(MissionsContext); 