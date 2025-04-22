'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Mission } from '../services/airtable';
import { fetchMissions } from '../services/apiClient';

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
    const fetchMissionsData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchMissions();
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
        fetchMissionsData();
    }, []);

    // Context value
    const value = {
        missions,
        loading,
        error,
        refetchMissions: fetchMissionsData
    };

    return (
        <MissionsContext.Provider value={value}>
            {children}
        </MissionsContext.Provider>
    );
};

// Hook to use the context
export const useMissions = () => useContext(MissionsContext); 