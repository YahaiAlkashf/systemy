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
    const { t } = useTranslation();
    const [invoices, setInvoices] = useState([]);
    const [view, setView] = useState("weekly");
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
                t("الأحد"),
                t("الإثنين"),
                t("الثلاثاء"),
                t("الأربعاء"),
                t("الخميس"),
                t("الجمعة"),
                t("السبت"),
            ];
            const totals = {};

            // تهيئة جميع الأيام بقيمة 0
            days.forEach((_, index) => {
                totals[index] = 0;
            });

            // حساب الإجمالي لكل يوم
            invoices.forEach((inv) => {
                const day = new Date(inv.created_at).getDay(); // 0 = الأحد, 1 = الإثنين, إلخ
                totals[day] = (totals[day] || 0) + parseFloat(inv.total);
            });

            return days.map((day, index) => ({
                name: day,
                total: totals[index] || 0,
            }));
        }

        if (view === "monthly") {
            const months = [
                t("يناير"),
                t("فبراير"),
                t("مارس"),
                t("أبريل"),
                t("مايو"),
                t("يونيو"),
                t("يوليو"),
                t("أغسطس"),
                t("سبتمبر"),
                t("أكتوبر"),
                t("نوفمبر"),
                t("ديسمبر"),
            ];
            const totals = {};

            // حساب الإجمالي لكل شهر
            invoices.forEach((inv) => {
                const month = new Date(inv.created_at).getMonth(); // 0 = يناير, 1 = فبراير, إلخ
                totals[month] = (totals[month] || 0) + parseFloat(inv.total);
            });

            return months.map((month, index) => ({
                name: month,
                total: totals[index] || 0,
            }));
        }

        if (view === "yearly") {
            const totals = {};

            // حساب الإجمالي لكل سنة
            invoices.forEach((inv) => {
                const year = new Date(inv.created_at).getFullYear(); // 2024, 2025, إلخ
                totals[year] = (totals[year] || 0) + parseFloat(inv.total);
            });

            // تحويل إلى مصفوفة وترتيبها تصاعدياً
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
        weekly: t("أسبوعي"),
        monthly: t("شهري"),
        yearly: t("سنوي"),
    };

    return (
        <div className="bg-white dark:bg-gray-900 border border-primary  p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {t("الإحصائيات")}
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
                            tickFormatter={(value) => `${value} ج.م`}
                            dx={-55}
                        />
                        <Tooltip
                            formatter={(value) => [`${value} ج.م`, t("الإجمالي")]}
                            labelFormatter={(label) =>
                                view === "yearly" ? `${t("سنة")} ${label}` : label
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
                    {t("لا توجد بيانات لعرضها")}
                </div>
            )}
        </div>
    );
}