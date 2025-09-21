import React, { Children, createContext, useEffect, useState } from "react";

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState("EGP");

    useEffect(
        ()=>{
                const savedCurrency = localStorage.getItem("currency");
                if(savedCurrency){
                    setCurrency(savedCurrency);
                }
        },[]);

        useEffect(()=>{
            localStorage.setItem("currency", currency);
        },[currency]);

        return (
            <CurrencyContext.Provider value={{ currency, setCurrency }}>
                {children}
            </CurrencyContext.Provider>
        )
};
