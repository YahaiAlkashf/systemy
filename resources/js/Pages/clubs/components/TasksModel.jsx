import React, { useState, useEffect } from "react";
import { XMarkIcon, CheckBadgeIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { EyeIcon, DownloadIcon, Edit2Icon, PencilIcon } from "lucide-react";

export default function TasksModel({ task, closeModal,handleTaskStatusChange }) {
    const { t } = useTranslation();
    const { app_url } = usePage().props;
    const [events, setEvents] = useState([]);
    const [taskStatus ,setTaskStatus]=useState('');
    const [status,setStatus] =useState('');
    const [showModel,setShowModel] = useState(false);
    const [modelDescription,setModelDescription]=useState(false);
    const [description,setDescription]=useState('');


    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'مكتمل':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'pending':
            case 'قيد الانتظار':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'rejected':
            case 'مرفوض':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'in progress':
            case 'قيد التنفيذ':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };


    const handleShowStatusEdite = (tas) =>{
        setTaskStatus(tas);
        setStatus(tas.status);
        setShowModel(true);
    }
    const getStatusBadge = (status) => {
        switch (status) {
            case "completed":
                return (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-lg">
                        {t("مكتملة")}
                    </span>
                );
            case "in_progress":
                return (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg">
                        {t("جارية")}
                    </span>
                );
            case "overdue":
                return (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-lg">
                        {t("متأخرة")}
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-lg">
                        {t("جارية")}
                    </span>
                );
        }
    };

        const openDescriptionModal=(des)=>{
        setDescription(des);
        setModelDescription(true);
     }
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white  dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] ">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {t("تفاصيل المهمة")}
                    </h3>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-auto max-h-[60vh]">
                    {task.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">{t("لا توجد مهام مسجلة")}</p>
                        </div>
                    ) : (
                        <>
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700">
                            {/* Table */}
                            <table className="min-w-full divide-y  overflow-auto divide-gray-200 dark:divide-gray-700">
                                {/* Table Header */}
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t("المهمة")}
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t("رد العضو")}
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t("الملفات")}
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t("العضو")}
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t("الحالة")}
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t("الإجراءات")}
                                        </th>
                                    </tr>
                                </thead>

                                {/* Table Body */}
                                <tbody className="divide-y divide-gray-100  dark:divide-gray-700">
                                    {task.map((ta, index) => (
                                        <tr key={index}  className="hover:bg-gray-50  dark:hover:bg-gray-600">

                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                                    {ta.title}
                                                </h4>
                                            </td>


                                            <td className="px-4 py-4 max-w-xs align-top">
                                                <p  className="text-xs text-gray-600 dark:text-gray-400 whitespace-normal break-words">
                                                    {ta.task_text  ? (
                                                        <button onClick={() => openDescriptionModal(ta.task_text)} className="px-3 py-1 flex gap-2  bg-primary text-white rounded hover:bg-primary-dark text-sm">
                                                            رد العضو
                                                        </button>
                                                    ):(
                                                         t("لم يتم ارسال رد")
                                                    )}

                                                </p>
                                            </td>


                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {ta.task_file ? (
                                                    <div className="flex gap-2">
                                                        <a
                                                            href={`${app_url}/storage/${ta.task_file}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors text-xs"
                                                            title={t("عرض الملف")}
                                                        >
                                                            <EyeIcon className="w-3 h-3" />
                                                            {t("عرض")}
                                                        </a>
                                                        <a
                                                            href={`${app_url}/storage/${ta.task_file}`}
                                                            download
                                                            className="flex items-center gap-1 p-1.5 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors text-xs"
                                                            title={t("تحميل الملف")}
                                                        >
                                                            <DownloadIcon className="w-3 h-3" />
                                                            {t("تحميل")}
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                                        {t("لا توجد ملفات")}
                                                    </span>
                                                )}
                                            </td>


                                            <td className="px-4 py-4 whitespace-nowrap text-center">
                                                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                    {ta.assignee?.name || t("غير محدد")}
                                                </span>
                                            </td>


                                            <td className="px-4 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(ta.status)}`}>
                                                    {getStatusBadge(ta.status)}

                                                </span>
                                            </td>


                                            <td className="px-4 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => handleShowStatusEdite(ta)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                </>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {t("عدد الاعضاء")}: {task.length}
                        </span>
                        <button
                            onClick={closeModal}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                        >
                            {t("إغلاق")}
                        </button>
                    </div>
                </div>
            </div>
            {showModel && ( <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white flex flex-col justify-center items-center dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] ">
                    <select value={status} onChange={(e)=>setStatus(e.target.value)} className="bg-primary px-8 dark:bg-primary-dark text-white rounded-md py-2 m-2">
                        <option value="pending">جارية </option>
                        <option value="completed">مكتمل</option>
                        <option value="overdue">متأخرة</option>
                    </select>
                    <div className="flex gap-2">
                        <button
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={()=>{handleTaskStatusChange(taskStatus.id,status);setShowModel(false)}}>  حفظ
                        </button>
                        <button
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            onClick={()=>setShowModel(false)}>  الغاء
                        </button>
                    </div>
                    </div>
                </div>
            )}
                            {modelDescription && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t(" رد العضو")}
                                </h3>
                                <button
                                    onClick={() => {
                                        setModelDescription(false);
                                        setDescription("");
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6 max:w-md align-top">
                                <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-normal break-words">
                                    {description}
                                </p>
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <button
                                    onClick={() => {
                                        setModelDescription(false);
                                        setDescription("");
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    {t("إغلاق")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}
