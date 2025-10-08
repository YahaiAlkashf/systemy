import React, { useState, useEffect } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import {
    PencilIcon,
    DevicePhoneMobileIcon,
    IdentificationIcon,
    BuildingOfficeIcon,
    StarIcon,
    UserCircleIcon,
    CheckBadgeIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export default function MemberProfileModel() {
    const { t } = useTranslation();
    const { app_url, auth } = usePage().props;
    const [member, setMember] = useState(null);
    const [editModal, setEditModal] = useState(false);
    const [myEvents, setMyEvents] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        showAllEvents();
        fetchMemberProfile();
        showAllTasks();
    }, []);

    const showAllEvents = async () => {
        try {
            const response = await axios.get(`${app_url}/events`);
            const allEvents = response.data.events;

            const userEvents = allEvents.filter((event) =>
                event.attendances.some((att) => att.user_id === auth.user.id)
            );

            setMyEvents(userEvents);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchMemberProfile = async () => {
        try {
            const response = await axios.get(`${app_url}/member/profile`);
            setMember(response.data.member);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    const showAllTasks = async () => {
        try {
            const response = await axios.get(`${app_url}/tasks`);
            const allTasks = response.data.tasks;

            const userTasks = allTasks.filter((task) => task.assigned_to === auth.user.id);

            setMyTasks(userTasks);
        } catch (error) {
            console.log(error);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <StarIcon
                    key={i}
                    className={`h-5 w-5 ${
                        i <= rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                    }`}
                />
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-pulse text-gray-500">
                        {t("جاري تحميل البيانات...")}
                    </div>
                </div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                <div className="text-center text-red-500 py-8">
                    {t("لم يتم العثور على بيانات العضو")}
                </div>
            </div>
        );
    }

    const attendedEvents = myEvents.filter(event =>
        event.attendances.some(att => att.status === "attending")
    ).length;

    const apologizedEvents = myEvents.filter(event =>
        event.attendances.some(att => att.status === "apologizing")
    ).length;

    const completedTasks = myTasks.filter(task => task.status === "completed").length;
    const inProgressTasks = myTasks.filter(task => task.status === "in_progress").length;
    const pendingTasks = myTasks.filter(task => task.status === "pending").length;

    return (
        <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {t("الملف الشخصي")}
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                            <UserCircleIcon className="h-20 w-20 text-gray-400" />

                                <div className="absolute bottom-0 right-0 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                    {member.jop_title }
                                </div>

                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                {member.name}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {member.company?.company_name}
                            </p>
                            <div className="flex items-center mt-2">
                                {renderStars(member.rating)}
                                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                                    ({member.rating})
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                            <DevicePhoneMobileIcon className="h-6 w-6 text-primary ml-2" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t("رقم الهاتف")}
                                </p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">
                                    {member.phone}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                            <IdentificationIcon className="h-6 w-6 text-primary ml-2" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t("رقم العضوية")}
                                </p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">
                                    {member.member_id || t("غير محدد")}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                            <BuildingOfficeIcon className="h-6 w-6 text-primary ml-2" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t("المسمى الوظيفى")}
                                </p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">
                                    {member.jop_title || 'غير محدد'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                            <CheckBadgeIcon className="h-6 w-6 text-primary ml-2" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t("القسم")}
                                </p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">
                                    {member.cycle?.name || t("غير محدد")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                        {t("الإحصائيات")}
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-300">
                                    {t("الفعاليات الحاضرة")}
                                </span>
                                <span className="font-bold text-primary">
                                    {attendedEvents}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-300">
                                    {t("الفعاليات المعتذر عنها")}
                                </span>
                                <span className="font-bold text-red-500">
                                    {apologizedEvents}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-300">
                                    {t("المهام المنجزة")}
                                </span>
                                <span className="font-bold text-primary">
                                    {completedTasks}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-300">
                                    {t("المهام الجارية")}
                                </span>
                                <span className="font-bold text-yellow-500">
                                    {inProgressTasks}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-300">
                                    {t("المهام المعلقة")}
                                </span>
                                <span className="font-bold text-gray-500">
                                    {pendingTasks}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
