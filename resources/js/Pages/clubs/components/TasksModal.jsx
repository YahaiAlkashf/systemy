import React, { useState, useEffect } from "react";
import { XMarkIcon, CheckBadgeIcon, ClockIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

export default function TasksModal({ member, closeModal }) {
    const { t } = useTranslation();
    const { app_url } = usePage().props;
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMemberAllTasks();
    }, [member]);

    const fetchMemberAllTasks = async () => {
        try {
            const response = await axios.get(`${app_url}/members/${member.id}/all-tasks`);
            setTasks(response.data.tasks);
        } catch (error) {
            console.error("Error fetching member tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return t("غير محدد");
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString("ar-EG", options);
    };

    const getStatusInfo = (status, dueDate) => {
        const now = new Date();
        const due = new Date(dueDate);
        
        if (status === "completed") {
            return { text: t("مكتمل"), color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckBadgeIcon };
        }
        
        if (dueDate && due < now && status !== "completed") {
            return { text: t("متأخر"), color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: ExclamationTriangleIcon };
        }
        
        switch (status) {
            case "in_progress":
                return { text: t("قيد التنفيذ"), color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: ClockIcon };
            case "overdue":
                return { text: t("متأخر"), color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: ExclamationTriangleIcon };
            default:
                return { text: t("معلق"), color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: ClockIcon };
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t("مهام العضو")} - {member.name}</h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">{t("جاري تحميل البيانات...")}</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">{t("لا توجد مهام مسجلة لهذا العضو")}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tasks.map((task) => {
                                const statusInfo = getStatusInfo(task.status, task.due_date);
                                const StatusIcon = statusInfo.icon;
                                
                                return (
                                    <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{task.title}</h4>
                                            <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
                                                {statusInfo.text}
                                            </span>
                                        </div>
                                        
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {task.description || t("لا يوجد وصف")}
                                        </p>
                                        
                                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                            <span>{t("تاريخ الاستحقاق:")} {formatDate(task.due_date)}</span>
                                            <div className="flex items-center">
                                                <StatusIcon className="h-4 w-4 ml-1" />
                                                <span>{t("تم التعيين بواسطة:")} {task.assigner?.name || t("غير معروف")}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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