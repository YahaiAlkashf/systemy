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
    const [users, setUsers] = useState([]);
    const [totalSales, setTotalSales] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [loading, setLoading] = useState(true);
    const { currency } = useContext(CurrencyContext);
    const [basicSubscriptions, setBasicSubscriptions] = useState([]);
    const [premiumSubscriptions, setPremiumSubscriptions] = useState([]);
    const [vipSubscriptions, setVipSubscriptions] = useState([]);
    const { auth } = usePage().props;

    const showAllCustomers = async () => {
        try {
            const response = await axios.get(`${app_url}/customers`);
            const allCustomers = response.data.customers || [];
            setCustomers(allCustomers);
            const basic = allCustomers.filter(customer =>
                customer.subscription && customer.subscription.toLowerCase() === 'basic'
            );
            const premium = allCustomers.filter(customer =>
                customer.subscription && customer.subscription.toLowerCase() === 'premium'
            );
            const vip = allCustomers.filter(customer =>
                customer.subscription && customer.subscription.toLowerCase() === 'vip'
            );

            setBasicSubscriptions(basic);
            setPremiumSubscriptions(premium);
            setVipSubscriptions(vip);

        } catch (error) {
            console.log(error);
        }
    };

    const showAllUsers = async () => {
        try {
            const response = await axios.get(`${app_url}/users`);
            const allUsers = response.data.users || [];
            setUsers(allUsers);
        } catch (error) {
            console.log(error);
        }
    };



    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([

                showAllCustomers(),
                showAllUsers(),
            ]);
            setLoading(false);
        };

        loadData();
    }, []);

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

                            <p className="text-primary-light"> {year}</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-10">
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 flex flex-col items-center justify-center transform transition duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                        <div className="absolute top-4 right-4 bg-blue-400 bg-opacity-20 p-2 rounded-full">
                            <UserGroupIcon className="h-6 w-6" />
                        </div>
                        <span className="text-lg font-semibold tracking-wide">
                            {t("العملاء الجدد")}
                        </span>
                        <span className="text-3xl font-bold mt-2">
                            {customers.length}
                        </span>
                        <span className="text-sm opacity-80 mt-1">
                            {" "}
                            {t("عميل")}  {" "}
                        </span>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-700 text-white p-6 flex flex-col items-center justify-center transform transition duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                        <div className="absolute top-4 right-4 bg-green-400 bg-opacity-20 p-2 rounded-full">
                            <UserGroupIcon className="h-6 w-6" />
                        </div>
                        <span className="text-lg font-semibold tracking-wide">
                            {t("المستخدمين الجدد")}
                        </span>
                        <span className="text-3xl font-bold mt-2">
                            {users.length}
                        </span>
                        <span className="text-sm opacity-80 mt-1">
                            {" "}
                             {t("مستخدم")} {" "}
                        </span>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </div>




                </div>



                <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
                    <h3 className="text-xl font-bold mb-6 text-center">{t("توزيع الباقات")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500">
                            <h4 className="font-semibold text-blue-700">{t("الباقة الأساسية")}</h4>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-2xl font-bold text-blue-600">{basicSubscriptions.length}</span>
                                <span className="text-sm text-blue-500">{t("عميل")}</span>
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl border-l-4 border-purple-500">
                            <h4 className="font-semibold text-purple-700">{t("الباقة المتقدمة")}</h4>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-2xl font-bold text-purple-600">{premiumSubscriptions.length}</span>
                                <span className="text-sm text-purple-500">{t("عميل")}</span>
                            </div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-500">
                            <h4 className="font-semibold text-yellow-700">{t("الباقة المميزة")}</h4>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-2xl font-bold text-yellow-600">{vipSubscriptions.length}</span>
                                <span className="text-sm text-yellow-500">{t("عميل")}</span>
                            </div>
                        </div>
                    </div>
                </div>

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