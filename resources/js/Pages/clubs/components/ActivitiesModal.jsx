import React, { useState, useEffect } from "react";
import { XMarkIcon, CheckBadgeIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

export default function ActivitiesModal({ member, closeModal }) {
    const { t } = useTranslation();
    const { app_url } = usePage().props;
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMemberAllEvents();
    }, [member]);

    const fetchMemberAllEvents = async () => {
        try {
            const response = await axios.get(`${app_url}/members/${member.id}/all-events`);
            setEvents(response.data.events);
        } catch (error) {
            console.error("Error fetching member events:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString("ar-EG", options);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t("أنشطة العضو")} - {member.name}</h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">{t("جاري تحميل البيانات...")}</p>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">{t("لا توجد أنشطة مسجلة لهذا العضو")}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {events.map((event) => (
                                <div key={event.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{event.title}</h4>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            event.attendance_status === "attending"
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                : event.attendance_status === "apologizing"
                                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                        }`}>
                                            {event.attendance_status === "attending" ? t("حاضر") :
                                             event.attendance_status === "apologizing" ? t("معتذر") : t("لم يحدد")}
                                        </span>
                                    </div>

                                    {/* <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.description}</p> */}

                                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                        <span>{formatDate(event.date)}</span>
                                        <div className="flex items-center">
                                            {event.attendance_status === "attending" ? (
                                                <CheckBadgeIcon className="h-4 w-4 text-green-500 ml-1" />
                                            ) : event.attendance_status === "apologizing" ? (
                                                <XCircleIcon className="h-4 w-4 text-red-500 ml-1" />
                                            ) : (
                                                <ClockIcon className="h-4 w-4 text-gray-500 ml-1" />
                                            )}
                                            <span>
                                                {event.attendance_status === "attending" ? t("حضر الحدث") :
                                                 event.attendance_status === "apologizing" ? t("اعتذر عن الحدث") : t("لم يحدد بعد")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={closeModal} className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">{t("إغلاق")}</button>
                </div>
            </div>
        </div>
    );
}
