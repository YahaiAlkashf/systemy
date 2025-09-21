import { usePage } from "@inertiajs/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { useTranslation } from "react-i18next";
export default function ChartData() {
    const [invoices, setInvoices] = useState([]);
    const [view, setView] = useState("weekly");
    const { t } = useTranslation();
    const { app_url } = usePage().props;
    const showAllInvoices = async () => {
        try {
            const response = await axios.get(`${app_url}/invoiceretailFlow`);
            setInvoices(response.data.data || response.data.invoices || []);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        showAllInvoices();
    }, []);

    const getChartData = () => {
        if (invoices.length === 0) return [];

        if (view === "weekly") {
            const days = [
                t("Sunday"),
                t("Monday"),
                t("Tuesday"),
                t("Wednesday"),
                t("Thursday"),
                t("Friday"),
                t("Saturday"),
            ];
            const totals = {};

            // Initialize all days with value 0
            days.forEach((_, index) => {
                totals[index] = 0;
            });

            // Calculate total for each day
            invoices.forEach((inv) => {
                const day = new Date(inv.created_at).getDay(); // 0 = Sunday, 1 = Monday, etc.
                totals[day] = (totals[day] || 0) + parseFloat(inv.total);
            });

            return days.map((day, index) => ({
                name: day,
                total: totals[index] || 0,
            }));
        }

        if (view === "monthly") {
            const months = [
                t("January"),
                t("February"),
                t("March"),
                t("April"),
                t("May"),
                t("June"),
                t("July"),
                t("August"),
                t("September"),
                t("October"),
                t("November"),
                t("December"),
            ];
            const totals = {};

            // Calculate total for each month
            invoices.forEach((inv) => {
                const month = new Date(inv.created_at).getMonth(); // 0 = January, 1 = February, etc.
                totals[month] = (totals[month] || 0) + parseFloat(inv.total);
            });

            return months.map((month, index) => ({
                name: month,
                total: totals[index] || 0,
            }));
        }

        if (view === "yearly") {
            const totals = {};

            // Calculate total for each year
            invoices.forEach((inv) => {
                const year = new Date(inv.created_at).getFullYear(); // 2024, 2025, etc.
                totals[year] = (totals[year] || 0) + parseFloat(inv.total);
            });

            // Convert to array and sort in ascending order
            return Object.keys(totals)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((year) => ({
                    name: year.toString(),
                    total: totals[year],
                }));
        }

        return [];
    };

    const viewLabels = {
        weekly: t("اسبوعى"),
        monthly: t("شهرى"),
        yearly: t("سنوى"),
    };

    return (
        <div className="bg-white dark:bg-gray-900 border border-primary  p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {t("Statistics")}
                </h3>
                <div className="flex space-x-2">
                    {["weekly", "monthly", "yearly"].map((viewType) => (
                        <button
                            key={viewType}
                            onClick={() => setView(viewType)}
                            className={`px-4 py-2 ml-2 rounded-lg text-sm font-medium transition-colors ${
                                view === viewType
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            }`}
                        >
                            {viewLabels[viewType]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={getChartData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#374151"
                            opacity={0.3}
                        />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: "#6B7280", fontSize: 12 }}
                            angle={view === "yearly" ? 0 : -45}
                            textAnchor={view === "yearly" ? "middle" : "end"}
                            height={view === "yearly" ? 40 : 80}
                            dx={-20}
                            dy={view === "yearly" ? 0 : 30}
                        />
                        <YAxis
                            tick={{ fill: "#6B7280", fontSize: 12 }}
                            tickFormatter={(value) => `${value} ${t("EGP")}`}
                            dx={-55}
                        />
                        <Tooltip
                            formatter={(value) => [`${value} ${t("EGP")}`, t("Total")]}
                            labelFormatter={(label) =>
                                view === "yearly" ? `${t("Year")} ${label}` : label
                            }
                            contentStyle={{
                                backgroundColor: "#1F2937",
                                border: "none",
                                borderRadius: "8px",
                                color: "white",
                            }}
                            wrapperStyle={{
                                backgroundColor: "transparent",
                            }}
                            cursor={false}
                        />

                        <Bar
                            dataKey="total"
                            fill="#4F2BED"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {invoices.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t("No data to display")}
                </div>
            )}
        </div>
    );
}
