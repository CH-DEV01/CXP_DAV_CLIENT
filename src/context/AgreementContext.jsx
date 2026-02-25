import React, { createContext, useContext, useState, useEffect } from 'react';

const AgreementContext = createContext();

export const AgreementProvider = ({ children }) => {

    const [agreement, setAgreement] = useState(() => {
        const storedAgreement = sessionStorage.getItem('agreement');
        return storedAgreement ? JSON.parse(storedAgreement) : null;
    });

    useEffect(() => {
        const storedAgreement = sessionStorage.getItem('agreement');
        if (storedAgreement) {
            try {
                setAgreement(JSON.parse(storedAgreement));
            } catch (error) {
                console.error('Error parsing stored agreement:', error);
                sessionStorage.removeItem('agreement');
            }
        }
    }, []);

    const saveAgreement = (agreementData) => {
        setAgreement(agreementData);
        sessionStorage.setItem('agreement', JSON.stringify(agreementData));
    };

    return (
        <AgreementContext.Provider value={{ agreement, saveAgreement }}>
            {children}
        </AgreementContext.Provider>
    );
};

export const useAgreement = () => {
    const context = useContext(AgreementContext);
    if (context === undefined) {
        throw new Error('useAgreement must be used within an AgreementProvider');
    }
    return context;
};