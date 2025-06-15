
import React, { createContext, useContext } from 'react';
import { useLazyPdfProcessor } from '../hooks/useLazyPdfProcessor';
import type { UseLazyPdfProcessorReturn } from '../hooks/useLazyPdfProcessor';

const LazyPdfProcessorContext = createContext<UseLazyPdfProcessorReturn | undefined>(undefined);

export const LazyPdfProcessorProvider = ({ children }: { children: React.ReactNode }) => {
    const value = useLazyPdfProcessor();
    return (
        <LazyPdfProcessorContext.Provider value={value}>
            {children}
        </LazyPdfProcessorContext.Provider>
    );
};

export const useSharedLazyPdfProcessor = () => {
    const context = useContext(LazyPdfProcessorContext);
    if (context === undefined) {
        throw new Error('useSharedLazyPdfProcessor must be used within a LazyPdfProcessorProvider');
    }
    return context;
};
