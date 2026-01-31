import React, { createContext, useContext, useState, useEffect } from 'react';
import settingsApi from '../api/settings.api';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    const [exchangeRate, setExchangeRate] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [suggestedPricePercentage, setSuggestedPricePercentage] = useState(10);

    const fetchExchangeRate = async () => {
        // Para este negocio, mantendremos la relación 1:1 ya que los precios se cargan directamente en ARS
        setExchangeRate(1);
        setLoading(false);
    };

    const fetchSettings = async () => {
        try {
            const result = await settingsApi.get();
            if (result.success && result.data) {
                setSuggestedPricePercentage(result.data.suggestedPricePercentage);
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    useEffect(() => {
        fetchExchangeRate();
        fetchSettings();
    }, []);

    const formatInUSD = (arsAmount) => {
        return (arsAmount).toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        });
    };

    const convertToARS = (amount) => {
        return amount; // Ya están en ARS
    };

    const calculateSuggestedPrice = (basePriceUSD) => {
        return basePriceUSD * (1 + suggestedPricePercentage / 100);
    };

    const value = {
        exchangeRate,
        loading,
        error,
        suggestedPricePercentage,
        setSuggestedPricePercentage,
        formatInUSD,
        convertToARS,
        calculateSuggestedPrice,
        refreshRate: fetchExchangeRate,
        refreshSettings: fetchSettings
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
