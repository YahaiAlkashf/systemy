import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "./layout";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import {
    PaperAirplaneIcon,
    PencilIcon,
    TrashIcon,
    UserCircleIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";


export default function CompanyChat() {
    const { app_url, auth } = usePage().props;
    const { t } = useTranslation();
    const [announcement, setAnnouncement] = useState("");
    const [currentAnnouncement, setCurrentAnnouncement] = useState("");
    const [editAnnouncementMode, setEditAnnouncementMode] = useState(false);
    const [deleteAnnouncementMode, setDeleteAnnouncementMode] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const scrollPositionRef = useRef(0);
    const preventScrollRef = useRef(false); // مرجع جديد لمنع التمرير

    useEffect(() => {
        fetchAnnouncement();
        fetchMessages();

        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // عدم التمرير إذا كنا في وضع تحرير الإعلان
        if (!preventScrollRef.current) {
            scrollToBottom();
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const saveScrollPosition = () => {
        scrollPositionRef.current = window.scrollY;
    };

    const restoreScrollPosition = () => {
        window.scrollTo(0, scrollPositionRef.current);
    };

    const fetchAnnouncement = async () => {
        try {
            const response = await axios.get(`${app_url}/announcement`);
            setCurrentAnnouncement(response.data.announcement || "");
        } catch (error) {
            console.error(t("Error fetching announcement:"), error);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${app_url}/messages`);
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error(t("Error fetching messages:"), error);
        }
    };

    const handleSaveAnnouncement = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${app_url}/announcement`, {
                content: announcement
            });
            setCurrentAnnouncement(announcement);
            setAnnouncement("");
            setEditAnnouncementMode(false);
            // السماح بالتمرير مرة أخرى بعد حفظ الإعلان
            preventScrollRef.current = false;
            restoreScrollPosition();
        } catch (error) {
            console.error(t("Error saving announcement:"), error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditAnnouncement = () => {
        saveScrollPosition();
        setAnnouncement(currentAnnouncement);
        setEditAnnouncementMode(true);
        // منع التمرير التلقائي عند فتح نموذج التعديل
        preventScrollRef.current = true;
    };

    const handleDeleteAnnouncement = async () => {
        try {
            await axios.delete(`${app_url}/announcement`);
            setCurrentAnnouncement("");
            closeModal();
        } catch (error) {
            console.error(t("Error deleting announcement:"), error);
        }
    };

    const closeModal = () => {
        setDeleteAnnouncementMode(false);
        restoreScrollPosition();
    }

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setLoading(true);
        try {
            await axios.post(`${app_url}/messages`, {
                content: newMessage
            });
            setNewMessage("");
            setTimeout(fetchMessages, 300);
        } catch (error) {
            console.error(t("Error sending message:"), error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (window.confirm(t("هل أنت متأكد من حذف هذه الرسالة؟"))) {
            try {
                await axios.delete(`${app_url}/messages/${messageId}`);
                fetchMessages();
            } catch (error) {
                console.error(t("Error deleting message:"), error);
                alert(t("حدث خطأ أثناء حذف الرسالة"));
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return `${t("اليوم")} ${date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffDays === 1) {
            return `${t("أمس")} ${date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    return (
        <AdminLayout>
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                {/* addv  */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                            {t("لوحة الإعلانات")}
                        </h3>
                        {auth?.user?.member?.role === "manager" && (
                            <div className="flex gap-2">
                                {!editAnnouncementMode && currentAnnouncement && (
                                    <>
                                        <button
                                            onClick={handleEditAnnouncement}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                                            title={t("تعديل الإعلان")}
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                saveScrollPosition();
                                                setDeleteAnnouncementMode(true);
                                            }}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                                            title={t("حذف الإعلان")}
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {auth?.user?.member?.role === "manager" && editAnnouncementMode ? (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 animate-pulse">
                            <div className="flex items-start mb-3">
                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" />
                                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                                    {t("هذا الإعلان سيكون ظاهراً لجميع أعضاء الشركة")}
                                </p>
                            </div>
                            <textarea
                                value={announcement}
                                onChange={(e) => setAnnouncement(e.target.value)}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder={t("اكتب إعلانك هنا...")}
                            ></textarea>
                            <div className="flex gap-3 mt-3">
                                <button
                                    onClick={() => {
                                        setEditAnnouncementMode(false);
                                        setAnnouncement("");
                                        // السماح بالتمرير مرة أخرى عند الإلغاء
                                        preventScrollRef.current = false;
                                        restoreScrollPosition();
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {t("إلغاء")}
                                </button>
                                <button
                                    onClick={handleSaveAnnouncement}
                                    disabled={loading || !announcement.trim()}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                                >
                                    {loading ? (
                                        <span>{t("جاري الحفظ...")}</span>
                                    ) : (
                                        <span>{t("حفظ الإعلان")}</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : currentAnnouncement ? (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                    {t("إعلان هام")}
                                </h4>
                                <span className="text-xs text-blue-600 dark:text-blue-300">
                                    {formatDate(new Date())}
                                </span>
                            </div>
                            <p className="text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
                                {currentAnnouncement}
                            </p>
                        </div>
                    ) : auth?.user?.member?.role === "manager" ? (
                        <div
                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
                            onClick={() => {
                                saveScrollPosition();
                                setEditAnnouncementMode(true);
                                // منع التمرير التلقائي عند فتح نموذج الإضافة
                                preventScrollRef.current = true;
                            }}
                        >
                            <p className="text-gray-500 dark:text-gray-400 mb-2">
                                {t("لا يوجد إعلان حالياً")}
                            </p>
                            <p className="text-primary font-medium">
                                {t("انقر هنا لإضافة إعلان جديد")}
                            </p>
                        </div>
                    ) : (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                {t("لا يوجد إعلانات حالياً")}
                            </p>
                        </div>
                    )}
                </div>

                {/* erea chat*/}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                            {t("دردشة الشركة")}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {messages.length} {t("رسالة")}
                        </span>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4 h-96 overflow-y-auto">
                        {messages.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-500 dark:text-gray-400">
                                    {t("لا توجد رسائل بعد. كن أول من يرسل رسالة!")}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.user_id === auth.user.id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl p-3 relative group ${message.user_id === auth.user.id
                                                ? 'bg-primary text-white rounded-br-none'
                                                : 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-bl-none'
                                            }`}
                                        >
                                            {/* زر الحذف - يظهر للمدير أو لصاحب الرسالة فقط */}
                                            {(auth.user.member.role === 'manager' || message.user_id === auth.user.id) && (
                                                <button
                                                    onClick={() => handleDeleteMessage(message.id)}
                                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title={t("حذف الرسالة")}
                                                >
                                                    <TrashIcon className="h-3 w-3" />
                                                </button>
                                            )}

                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-sm">
                                                    {message.user_id === auth.user.id
                                                        ? t('أنت')
                                                        : `${message.user?.name} (${message.user?.member?.cycle?.name})`
                                                    }
                                                </span>
                                                <span className={`text-xs ${message.user_id === auth.user.id ? 'text-blue-100' : 'text-gray-500'}`}>
                                                    {formatDate(message.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder={t("اكتب رسالتك هنا...")}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !newMessage.trim()}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            <PaperAirplaneIcon className="h-5 w-5 ml-1 transform rotate-90" />
                            {t("إرسال")}
                        </button>
                    </form>
                </div>
                                {deleteAnnouncementMode && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                        <div className="bg-white dark:bg-background-card rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up">
                                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                                    {t("هل أنت متأكد من حذف هذا الاعلان؟")}
                                                </h3>
                                                <button
                                                    onClick={closeModal}
                                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                                                >
                                                    <XMarkIcon className="h-6 w-6" />
                                                </button>
                                            </div>
                                            <div className="p-6">

                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={closeModal}
                                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                    >
                                                        {t("إلغاء")}
                                                    </button>
                                                    <button
                                                        onClick={handleDeleteAnnouncement}
                                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        {t("حذف")}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
            </div>
        </AdminLayout>
    );
}
