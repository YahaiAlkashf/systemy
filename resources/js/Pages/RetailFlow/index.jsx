import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import {
    UserGroupIcon,
    ShoppingBagIcon,
    ReceiptPercentIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import AdminLayout from "./layout";
import ChartData from "./components/ChartData";
import { CurrencyContext } from "../../Context/CurrencyContext ";
import { useTranslation } from "react-i18next";

export default function Index() {
    const { t } = useTranslation();
    const { app_url } = usePage().props;
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [totalSales, setTotalSales] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [loading, setLoading] = useState(true);
    const { currency } = useContext(CurrencyContext);
    const { auth } = usePage().props;
    const showAllInvoices = async () => {
        try {
            const response = await axios.get(`${app_url}/invoiceretailFlow`);
            setInvoices(response.data.data || response.data.invoices || []);
        } catch (error) {
            console.log(error);
        }
    };

    const showAllCustomers = async () => {
        try {
            const response = await axios.get(`${app_url}/customerretailFlow`);
            const allCustomers = response.data.customers || [];
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const filtered = allCustomers.filter((customer) => {
                const date = new Date(customer.created_at);
                return (
                    date.getMonth() === currentMonth &&
                    date.getFullYear() === currentYear
                );
            });

            setCustomers(filtered);
        } catch (error) {
            console.log(error);
        }
    };

    const showAllProducts = async () => {
        try {
            const response = await axios.get(`${app_url}/productretailFlow`);
            const allProducts = response.data.products || [];
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const filtered = allProducts.filter((product) => {
                const date = new Date(product.created_at);
                return (
                    date.getMonth() === currentMonth &&
                    date.getFullYear() === currentYear
                );
            });

            setProducts(filtered);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                showAllInvoices(),
                showAllCustomers(),
                showAllProducts(),
            ]);
            setLoading(false);
        };

        loadData();
    }, []);

    useEffect(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        setMonth(now.toLocaleString("ar-EG", { month: "long" }));
        setYear(currentYear);

        let sales = 0;
        let profit = 0;

        invoices.forEach((invoice) => {
            const date = new Date(invoice.created_at);
            if (
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear
            ) {
                sales += parseFloat(invoice.total) || 0;
                profit += parseFloat(invoice.total_profit) || 0;
            }
        });

        setTotalSales(sales);
        setTotalProfit(profit);
    }, [invoices]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="px-3 max-w-7xl min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="px-3 max-w-7xl min-h-screen">
                {/* Header with Month and Year */}
                <div className="flex items-center justify-between mb-8 p-4 bg-gradient-to-r from-primary to-primary-dark rounded-2xl text-white">
                    <div className="flex items-center">
                        <CalendarDaysIcon className="h-8 w-8 mr-3" />
                        <div>
                            <h2 className="text-2xl font-bold">
                                {t("إحصائيات شهر")} {month}
                            </h2>
                            <p className="text-primary-light">{t("عام")} {year}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm opacity-80">{t("التاريخ الحالي")}</div>
                        <div className="font-medium">
                            {new Date().toLocaleDateString("ar-EG", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 flex flex-col items-center justify-center transform transition duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                        <div className="absolute top-4 right-4 bg-blue-400 bg-opacity-20 p-2 rounded-full">
                            <UserGroupIcon className="h-6 w-6" />
                        </div>
                        <span className="text-lg font-semibold tracking-wide">
                            {auth.user.system_type === "delivery"
                                ? t("السائقين الجدد")
                                : t("العملاء الجدد")}
                        </span>
                        <span className="text-3xl font-bold mt-2">
                            {customers.length}
                        </span>
                        <span className="text-sm opacity-80 mt-1">
                            {" "}
                            {auth.user.system_type === "delivery"
                                ? t("سائق هذا الشهر")
                                : t("عميل هذا الشهر")}{" "}
                        </span>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-700 text-white p-6 transform transition duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in-up delay-100">
                        <div className="absolute top-4 right-4 bg-green-400 bg-opacity-20 p-2 rounded-full">
                            <CurrencyDollarIcon className="h-6 w-6" />
                        </div>

                        <div className="text-center mb-4">
                            <span className="text-lg font-semibold tracking-wide block">
                                {t("إجمالي المبيعات")}
                            </span>
                            <span className="text-3xl font-bold">
                                {totalSales} {currency}
                            </span>
                        </div>

                        <div className="border-t border-green-300 pt-3 text-center">
                            <span className="text-sm font-medium tracking-wide block">
                                {t("صافي الربح")}
                            </span>
                            <span className="text-2xl font-bold">
                                {totalProfit} {currency}
                            </span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 flex flex-col items-center justify-center transform transition duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in-up delay-200">
                        <div className="absolute top-4 right-4 bg-purple-400 bg-opacity-20 p-2 rounded-full">
                            <ShoppingBagIcon className="h-6 w-6" />
                        </div>
                        <span className="text-lg font-semibold tracking-wide">
                            {auth.user.system_type === "services"
                                ? t("الخدمات المضافة")
                                : auth.user.system_type === "education"
                                ? t("الورات المضافة")
                                : auth.user.system_type === "realEstate"
                                ? t("العقارات المضافة")
                                : auth.user.system_type === "delivery"
                                ? t("الطلبات المضافة")
                                : auth.user.system_type === "travels"
                                ? t("الرحلات المضافة")
                                : t("المنتجات المضافة")}
                        </span>
                        <span className="text-3xl font-bold mt-2">
                            {products.length}
                        </span>
                        <span className="text-sm opacity-80 mt-1">
                            {" "}
                            {auth.user.system_type === "services"
                                ? t("رحلة جديده")
                                : auth.user.system_type === "education"
                                ? t("دورة جديده")
                                : auth.user.system_type === "realEstate"
                                ? t("عقار جديد")
                                : auth.user.system_type === "delivery"
                                ? t("طلب جديد")
                                : auth.user.system_type === "travels"
                                ? t("رحلة جديده")
                                : t("منتج جديد")}
                        </span>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-pink-700 text-white p-6 flex flex-col items-center justify-center transform transition duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in-up delay-300">
                        <div className="absolute top-4 right-4 bg-pink-400 bg-opacity-20 p-2 rounded-full">
                            <ReceiptPercentIcon className="h-6 w-6" />
                        </div>
                        <span className="text-lg font-semibold tracking-wide">
                            {t("الفواتير")}
                        </span>
                        <span className="text-3xl font-bold mt-2">
                            {invoices.length}
                        </span>
                        <span className="text-sm opacity-80 mt-1">
                            {t("فاتورة هذا الشهر")}
                        </span>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-pink-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </div>
                </div>
                {(auth.user.company.subscription === "vip" || auth.user.company.subscription === "premium") && (
                    <>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                            {t("تحليل الأداء الشهري للمبيعات")}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {t("بيانات شهر")} {month} {year}
                        </span>
                    </div>
                    <ChartData />
                </div>
                <div className=" mb-10">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            {t("ملخص الأداء")}
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {t("متوسط قيمة الفاتورة")}
                                </span>
                                <span className="font-semibold text-primary dark:text-primary-dark">
                                    {invoices.length > 0
                                        ? (
                                              totalSales / invoices.length
                                          ).toFixed(2)
                                        : 0}{" "}
                                    {currency}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {t("نسبة الربحية")}
                                </span>
                                <span className="font-semibold text-green-600 dark:text-green-400">
                                    {totalSales > 0
                                        ? (
                                              (totalProfit / totalSales) *
                                              100
                                          ).toFixed(2)
                                        : 0}
                                    %
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {" "}
                                    {auth.user.system_type === "delivery"
                                        ? t("سائق هذا الشهر")
                                        : t("عميل هذا الشهر")}
                                </span>
                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                    {customers.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                </>
                )}





                {/* Animations */}
                <style>{`
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(40px) scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.7s cubic-bezier(0.4,0,0.2,1) both;
                }
                .delay-100 {
                    animation-delay: 0.1s;
                }
                .delay-200 {
                    animation-delay: 0.2s;
                }
                .delay-300 {
                    animation-delay: 0.3s;
                }
            `}</style>
            </div>
        </AdminLayout>
    );
}
