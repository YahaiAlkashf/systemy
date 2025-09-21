import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function GenerateToken({ onTokenGenerated }) {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await fetch("/api/login-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || t("Error logging in"));
            } else {
                onTokenGenerated(data.token); 
            }
        } catch (err) {
            setError(t("Something went wrong"));
        }
    };

    return (
        <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                {t("إنشاء رمز API")}
            </h2>
            <form onSubmit={handleLogin} className="space-y-3">
                <input
                    type="email"
                    placeholder={t("البريد الإلكتروني")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                />
                <input
                    type="password"
                    placeholder={t("كلمة المرور")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-primary text-white p-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                    {t("إنشاء الرمز")}
                </button>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
}