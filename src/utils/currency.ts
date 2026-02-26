export const convertCurrency = (amountINR: number, targetCurrency: string): number => {
    // Hardcoded simple exchange rates for demonstration.
    // In a real startup, this would come from an API or DB.
    const exchangeRates: { [key: string]: number } = {
        INR: 1,
        USD: 0.012, // 1 INR = ~0.012 USD
        EUR: 0.011,
        GBP: 0.0094,
    };

    const rate = exchangeRates[targetCurrency] || 1;
    return amountINR * rate;
};

export const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
