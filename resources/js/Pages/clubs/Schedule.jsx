import React, { useState, useEffect } from "react";
import AdminLayout from "./layout";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import {
    XMarkIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    UserCircleIcon,
    CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export default function Schedules() {
    const { app_url, auth } = usePage().props;
        const { t } = useTranslation();
    const [viewType, setViewType] = useState("weekly");
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [attendingModal, setAttendingModal] = useState(false);
    const [apologizingModal, setApologizingModal] = useState(false);
    const [notSeenModal, setNotSeenModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [status, setStatus] = useState("");
    const [selectedMembersType, setSelectedMembersType] = useState("");
    const [errors, setErrors] = useState({});
    const [members, setMembers] = useState([]);
    const [loading,setLoading]=useState(false);
    const [newEvent, setNewEvent] = useState({
        title: "",
        date: "",
        description: "",
        option:"select"
    });

    const updateEventAttendanceLocally = (eventId, newStatus) => {
        setEvents((prevEvents) =>
            prevEvents.map((event) =>
                event.id === eventId
                    ? {
                          ...event,
                          user_attendance: { status: newStatus },
                      }
                    : event
            )
        );

        setFilteredEvents((prevFilteredEvents) =>
            prevFilteredEvents.map((event) =>
                event.id === eventId
                    ? {
                          ...event,
                          user_attendance: { status: newStatus },
                      }
                    : event
            )
        );
    };

    const showAllEvents = async () => {
        try {
            const response = await axios.get(`${app_url}/events`);
            setEvents(response.data.events);

            handleViewTypeChange(viewType, response.data.events);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        showAllEvents();
        handleViewTypeChange();
    }, []);

    const handleViewTypeChange = (type, eventsList = events) => {
        setViewType(type);
        const today = new Date();
        let filtered = [];

        if (type === "daily") {
            filtered = eventsList.filter((event) => {
                const eventDate = new Date(event.date);
                return (
                    eventDate.getFullYear() === today.getFullYear() &&
                    eventDate.getMonth() === today.getMonth() &&
                    eventDate.getDate() === today.getDate()
                );
            });
        } else if (type === "weekly") {
            const startOfWeek = getStartOfWeek(today);
            const endOfWeek = getEndOfWeek(today);

            filtered = eventsList.filter((event) => {
                const eventDate = new Date(event.date);
                return eventDate >= startOfWeek && eventDate <= endOfWeek;
            });
        } else if (type === "monthly") {
            filtered = eventsList.filter((event) => {
                const eventDate = new Date(event.date);
                return (
                    eventDate.getFullYear() === today.getFullYear() &&
                    eventDate.getMonth() === today.getMonth()
                );
            });
        }

        setFilteredEvents(filtered);
    };

    function getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        const startOfWeek = new Date(d.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
    }

    function getEndOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() + (6 - day);
        const endOfWeek = new Date(d.setDate(diff));
        endOfWeek.setHours(23, 59, 59, 999);
        return endOfWeek;
    }

    const handleAddEvent = () => {
        setAddModal(true);
    };

    const handleEditEvent = (event) => {
        setSelectedEvent(event);
        setEditModal(true);
    };

    const handleDeleteEvent = (event) => {
        setSelectedEvent(event);
        setDeleteModal(true);
    };

    const handleViewAttending = async (event) => {
        setSelectedEvent(event);
        setAttendingModal(true);
    };

    const handleViewApologizing = async (event) => {
        setSelectedEvent(event);
       setApologizingModal(true);
    };

    const handleAttend = async (eventId, newStatus) => {
        try {
            updateEventAttendanceLocally(eventId, newStatus);
            await axios.post(`${app_url}/events/${eventId}/status`, {
                status: newStatus,
            });

            showAllEvents();
        } catch (error) {
            console.log(error);
        }
    };

    const closeModal = () => {
        setAddModal(false);
        setEditModal(false);
        setDeleteModal(false);
        setAttendingModal(false);
        setApologizingModal(false);
        setNotSeenModal(false);
        setSelectedEvent(null);
        setSelectedMembersType("");
        setErrors({});
        setNewEvent({
            title: "",
            date: "",
            description: "",
            option:"select"
        });
        setLoading(false);
    };

    const handleSaveAddEvent = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${app_url}/events`, {
                title: newEvent.title,
                description: newEvent.description,
                date: newEvent.date,
                option: newEvent.option
            });
            showAllEvents();
            closeModal();
            setNewEvent({
                title: "",
                date: "",
                description: "",
                option:"select"
            });
        } catch (error) {
            setLoading(false);
            setErrors(error.response?.data?.errors || {});
        }
    };

    const handleSaveEditEvent = async () => {
        try {
            await axios.post(`${app_url}/events/${selectedEvent.id}`, {
                title: selectedEvent.title,
                description: selectedEvent.description,
                date: selectedEvent.date,
                option:selectedEvent.option
            });

            showAllEvents();
            closeModal();
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`${app_url}/events/${selectedEvent.id}`);
            showAllEvents();
            closeModal();
        } catch (error) {
            console.log(error);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString("ar-EG", options);
    };

    return (
        <AdminLayout>
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        {t("جداول المواعيد")}
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleViewTypeChange("daily")}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    viewType === "daily"
                                        ? "bg-primary text-white"
                                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                }`}
                            >
                                {t("اليوم")}
                            </button>
                            <button
                                onClick={() => handleViewTypeChange("weekly")}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    viewType === "weekly"
                                        ? "bg-primary text-white"
                                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                }`}
                            >
                                {t("الاسبوع")}
                            </button>
                            <button
                                onClick={() => handleViewTypeChange("monthly")}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    viewType === "monthly"
                                        ? "bg-primary text-white"
                                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                }`}
                            >
                                {t("الشهر")}
                            </button>
                        </div>
                        {auth?.user?.member?.role === "manager" && (
                            <button
                                onClick={handleAddEvent}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                <PlusIcon className="h-4 w-4 mr-1.5" />
                                {t("إضافة نشاط")}
                            </button>
                        )}
                    </div>
                </div>

                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    {t("عرض الأحداث:")}
                    <span className="font-medium ml-2">
                        {viewType === "daily" && t("اليوم")}
                        {viewType === "weekly" && t("هذا الأسبوع")}
                        {viewType === "monthly" && t("هذا الشهر")}
                    </span>
                    <span className="mx-2">•</span>
                    {t("عدد النتائج:")} {filteredEvents.length}
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full table-fixed">
                        <colgroup>
                            <col className="w-16" />
                            <col className="w-1/4" />
                            <col className="w-1/4" />
                            <col className="w-1/3" />
                            <col className="w-1/4" />
                        </colgroup>
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    #
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("اسم النشاط")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("التاريخ")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("الوصف")}
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("الإجراءات")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredEvents.map((event, idx) => (
                                <tr
                                    key={event.id}
                                    className={`transition-colors duration-200 ${
                                        idx % 2 === 0
                                            ? "bg-white dark:bg-gray-800"
                                            : "bg-gray-50 dark:bg-gray-700"
                                    } hover:bg-gray-100 dark:hover:bg-gray-600`}
                                >
                                    <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">
                                        {idx + 1}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200 font-medium">
                                        {event.title}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                        {formatDate(event.date)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                        {event.description}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 text-center">
                                        <div className="flex justify-center space-x-2 gap-2">
                                            {auth.user.member.role ===
                                            "manager"  &&
                                                <>
                                                {event.option === 'select' && (
<>
                                                    <button
                                                        onClick={() =>
                                                            handleViewAttending(
                                                                event
                                                            )
                                                        }
                                                        className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex items-center gap-1"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                        {t("الحاضرون")}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleViewApologizing(
                                                                event
                                                            )
                                                        }
                                                        className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors flex items-center gap-1"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                        {t("المعتذرون")}
                                                    </button></>
                                                )}

                                                    <button
                                                        onClick={() =>
                                                            handleEditEvent(
                                                                event
                                                            )
                                                        }
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteEvent(
                                                                event
                                                            )
                                                        }
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </>
                                            }
                                                <>
                                                    {event.attendances.some(
                                                        (attendance) =>
                                                            attendance.user_id ===
                                                            auth.user.id
                                                    ) ? (
                                                        <>
                                                            {event.attendances.find(
                                                                (attendance) =>
                                                                    attendance.user_id ===
                                                                    auth.user.id
                                                            )?.status ===
                                                            "attending" ? (
                                                                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-lg flex items-center gap-1">
                                                                    <CheckBadgeIcon className="h-4 w-4" />
                                                                    {t("تم تسجيل حضور")}
                                                                </span>
                                                            ) : (
                                                                <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-lg flex items-center gap-1">
                                                                    <XMarkIcon className="h-4 w-4" />
                                                                    {t("تم تسجيل اعتذار")}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {event.option ===
                                                                "select" && (
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() =>
                                                                            handleAttend(
                                                                                event.id,
                                                                                "attending"
                                                                            )
                                                                        }
                                                                        className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex items-center gap-1"
                                                                    >
                                                                        <CheckBadgeIcon className="h-4 w-4" />
                                                                        {t("سأحضر")}
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleAttend(
                                                                                event.id,
                                                                                "apologizing"
                                                                            )
                                                                        }
                                                                        className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors flex items-center gap-1"
                                                                    >
                                                                        <XMarkIcon className="h-4 w-4" />
                                                                        {t("أعتذر")}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredEvents.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            {t("لا توجد أنشطة لعرضها")}
                        </div>
                    )}
                </div>

                {addModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("إضافة نشاط جديد")}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("اسم النشاط")}
                                    </label>
                                    <input
                                        type="text"
                                        value={newEvent.title}
                                        onChange={(e) =>
                                            setNewEvent({
                                                ...newEvent,
                                                title: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.title[0]}
                                        </p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("التاريخ")}
                                    </label>
                                    <input
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) =>
                                            setNewEvent({
                                                ...newEvent,
                                                date: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    {errors.date && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.date[0]}
                                        </p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("الوصف")}
                                    </label>
                                    <textarea
                                        value={newEvent.description}
                                        onChange={(e) =>
                                            setNewEvent({
                                                ...newEvent,
                                                description: e.target.value,
                                            })
                                        }
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    ></textarea>
                                    {errors.description && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.description[0]}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="mb-4 mx-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t("هل تريد ان يقدم الاعضاء حضورهم او اعتذارهم ؟")}
                                </label>
                                <select
                                    value={newEvent.option || ""}
                                    onChange={(e) => {
                                        setNewEvent({ ...newEvent, option: e.target.value });
                                    }}
                                    className="w-full px-8 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 focus:scale-[1.02]"
                                >
                                    <option value="select">{t("نعم")}</option>
                                    <option  value="not_select">{t("لا")}</option>
                                </select>
                                {errors.option && <p className="text-red-500 text-xs mt-1">{errors.option[0]}</p>}
                            </div>

                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {t("إلغاء")}
                                </button>
                                 <button
                                    onClick={handleSaveAddEvent}
                                    disabled={loading}
                                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center ${
                                        loading
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-primary hover:bg-primary-dark"
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {t("جارى الحفظ...")}
                                        </>
                                    ) : t("حفظ")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Event Modal */}
                {editModal && selectedEvent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("تعديل النشاط")}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("اسم النشاط")}
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedEvent.title}
                                        onChange={(e) =>
                                            setSelectedEvent({
                                                ...selectedEvent,
                                                title: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.title[0]}
                                        </p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("التاريخ")}
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedEvent.date}
                                        onChange={(e) =>
                                            setSelectedEvent({
                                                ...selectedEvent,
                                                date: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    {errors.date && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.date[0]}
                                        </p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("الوصف")}
                                    </label>
                                    <textarea
                                        value={selectedEvent.description}
                                        onChange={(e) =>
                                            setSelectedEvent({
                                                ...selectedEvent,
                                                description: e.target.value,
                                            })
                                        }
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    ></textarea>
                                    {errors.description && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.description[0]}
                                        </p>
                                    )}
                                </div>
                                <div className="mb-4 ">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t("هل تريد ان يقدم الاعضاء حضورهم او اعتذارهم ؟")}
                                </label>
                                <select
                                    value={selectedEvent.option || ""}
                                    onChange={(e) => {
                                        setSelectedEvent({ ...selectedEvent, option: e.target.value });
                                    }}
                                    className="w-full px-8 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 focus:scale-[1.02]"
                                >
                                    <option value="select">{t("نعم")}</option>
                                    <option  value="not_select">{t("لا")}</option>
                                </select>
                                {errors.option && <p className="text-red-500 text-xs mt-1">{errors.option[0]}</p>}
                            </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {t("إلغاء")}
                                </button>
                                <button
                                    onClick={handleSaveEditEvent}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                >
                                    {t("حفظ")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Event Modal */}
                {deleteModal && selectedEvent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("هل أنت متأكد من حذف هذا النشاط؟")}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    {t("سيتم حذف النشاط")}{" "}
                                    <span className="font-bold">
                                        {selectedEvent.title}
                                    </span>{" "}
                                    {t("بشكل دائم.")}
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        {t("إلغاء")}
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        {t("حذف")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Members List Modal */}
                {attendingModal && selectedEvent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("الأعضاء الحاضرون")} - {selectedEvent.title}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6 max-h-96 overflow-y-auto">
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {selectedEvent.attendances && selectedEvent.attendances.length > 0 ? (
                                        selectedEvent.attendances
                                            .filter(attendance => attendance.status === "attending")
                                            .map(attendance => (
                                                <li key={attendance.id} className="py-3 flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <UserCircleIcon className="h-8 w-8 text-gray-400 mr-2" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                                {attendance.user?.name || t("مستخدم غير معروف")}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {attendance.user?.member?.cycle?.name || t("دورة غير محددة")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t("لا يوجد حاضرون")}</p>
                                    )}
                                </ul>
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={closeModal}
                                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                >
                                    {t("إغلاق")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {apologizingModal && selectedEvent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("الأعضاء المعتذرون")} - {selectedEvent.title}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6 max-h-96 overflow-y-auto">
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {selectedEvent.attendances && selectedEvent.attendances.length > 0 ? (
                                        selectedEvent.attendances
                                            .filter(attendance => attendance.status === "apologizing")
                                            .map(attendance => (
                                                <li key={attendance.id} className="py-3 flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <UserCircleIcon className="h-8 w-8 text-gray-400 mr-2" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                                {attendance.user?.name || t("مستخدم غير معروف")}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {attendance.user?.member?.cycle?.name || t("دورة غير محددة")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t("لا يوجد معتذرون")}</p>
                                    )}
                                </ul>
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={closeModal}
                                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                >
                                    {t("إغلاق")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
