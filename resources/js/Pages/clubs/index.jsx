import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, usePage } from "@inertiajs/react";
import {
    UserGroupIcon,
    CalendarDaysIcon,
    TrophyIcon,
    ChartBarIcon,
    ClockIcon,
    CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import AdminLayout from "./layout";
import { useTranslation } from "react-i18next";


export default function ClubDashboard() {
    const { app_url, auth } = usePage().props;
        const { t } = useTranslation();
    const [stats, setStats] = useState({
        totalMembers: 0,
        activeMembers: 0,
        totalEvents: 0,
        upcomingEvents: 0,
        attendanceRate: 0,
        completedTasks: 0
    });
    const [recentEvents, setRecentEvents] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        showAllMembers();
        showAllEvents();
        setLoading(false);
    }, []);



    const showAllMembers = async () => {
                try {
                    const response = await axios.get(`${app_url}/members`);
                    setMembers(response.data.members);
                } catch (error) {
                    console.log(t("Error fetching members:"), error);
                }
    };

    const showAllEvents = async () => {
            try {
                const response = await axios.get(`${app_url}/events`);
                setEvents(response.data.events);

            } catch (error) {
                console.log(t("Error fetching events:"), error);
            }
    };
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
                {/* Header */}
                <div className="flex items-center justify-between mb-8 p-6 bg-gradient-to-r from-primary to-primary-dark rounded-2xl text-white">
                    <div className="flex items-center">
                        <TrophyIcon className="h-10 w-10 mr-4" />
                        <div>
                            <h1 className="text-3xl font-bold">{t("لوحة تحكم النادي")}</h1>
                            <p className="text-primary-light">{t("نظرة عامة على أداء النادي")}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">{t("إجمالي الأعضاء")}</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                                    {members.length}
                                </p>
                            </div>
                            <UserGroupIcon className="h-12 w-12 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-l-4 border-indigo-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">{t("إجمالي الفعاليات")}</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                                    {events.length}
                                </p>
                            </div>
                            <CalendarDaysIcon className="h-12 w-12 text-indigo-500" />
                        </div>
                    </div>
                </div>


                {/* Quick Actions */}
                {(auth.user.role === 'superadmin')&& (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                        {t("إجراءات سريعة")}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href='/clubs/members' className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 p-4 rounded-lg text-center transition-colors">
                            <UserGroupIcon className="h-8 w-8 mx-auto mb-2" />
                            <span>{t("إدارة الأعضاء")}</span>
                        </Link>
                        <Link href='/clubs/schedule' className="bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-200 p-4 rounded-lg text-center transition-colors">
                            <CalendarDaysIcon className="h-8 w-8 mx-auto mb-2" />
                            <span>{t("الفعاليات")}</span>
                        </Link>
                        <Link href='/clubs/members' className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-200 p-4 rounded-lg text-center transition-colors">
                            <TrophyIcon className="h-8 w-8 mx-auto mb-2" />
                            <span>{t("التقارير")}</span>
                        </Link>
                        <Link href='/clubs/members' className="bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-200 p-4 rounded-lg text-center transition-colors">
                            <ChartBarIcon className="h-8 w-8 mx-auto mb-2" />
                            <span>{t("الإحصائيات")}</span>
                        </Link>
                    </div>
                </div>)}
            </div>
        </AdminLayout>
    );
}
