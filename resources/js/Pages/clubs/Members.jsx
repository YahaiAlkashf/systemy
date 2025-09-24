import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "./layout";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import {
    XMarkIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    AdjustmentsHorizontalIcon,
    UserCircleIcon,
    ChartBarIcon,
    TrophyIcon,
    ArrowDownTrayIcon
} from "@heroicons/react/24/outline";
import ActivitiesModal from "./components/ActivitiesModal";
import TasksModal from "./components/TasksModal";
import MemberModal from "./components/MemberModal"
import { useTranslation } from "react-i18next";
import { FaWhatsapp } from "react-icons/fa";
import SendMessageModal from "./components/sendMessageModel";

export default function Members() {
    const { app_url ,auth} = usePage().props;
    const { t } = useTranslation();
    const [selectedMember, setSelectedMember] = useState(null);
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [activitiesModal, setActivitiesModal] = useState(false);
    const [tasksModal, setTasksModal] = useState(false);
    const [rolesModal, setRolesModal] = useState(false);
    const [members, setMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [cycles, setCycles] = useState([]);
    const [newCycle, setNewCycle] = useState("");
    const [editingCycle, setEditingCycle] = useState(null);
    const [errors, setErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [sendModal, setSendModal] = useState(false);
    const [messageForm, setMessageForm] = useState({
                phone: "",
                message: "",
    });
    const [newMember, setNewMember] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        phone: "",
        cycle_id: null,
        role: "",
        add_members:0,
        rating: 0,
        member_id: ""
    });
    const roles = ["manager", "member"];
    const rowsPerPage = 10;

    // استخدام useRef لتتبع إذا كان التحديث بسبب إجراء مستخدم
    const isUserActionRef = useRef(false);

    const fetchMembersWithDetails = async () => {
        try {
            const response = await axios.get(`${app_url}/members-with-details`);
            setMembers(response.data.members);
            setFilteredMembers(response.data.members);
        } catch (error) {
            console.log(t("Error fetching members:"), error);
        }
    };

    const fetchCycles = async () => {
        try {
            const response = await axios.get(`${app_url}/cycles`);
            setCycles(response.data.cycles);
        } catch (error) {
            console.log(t("Error fetching cycles:"), error);
        }
    };

    const handleSendMessage = async () => {
        console.log(messageForm);
        try {
            await axios.post(`${app_url}/whatsapp/send`, {
                phone: selectedMember.phone,
                message: messageForm.message,
            });
            closeModal();
            setSendModal(false);
        } catch (error) {
            console.log(error);
        }
    };

    const handleSendMessageToMember = (member) => {
        setSelectedMember(member);
        setMessageForm({
            phone: member.phone,
            message: ""
        });
        setSendModal(true);
    };

    useEffect(() => {
        fetchMembersWithDetails();
        fetchCycles();
    }, []);

    useEffect(() => {
        let result = members.filter(
            (member) =>
                member.name.toLowerCase().includes(search.toLowerCase()) ||
                (member.user?.email && member.user.email.toLowerCase().includes(search.toLowerCase())) ||
                member.phone.includes(search) ||
                (member.role && member.role.toLowerCase().includes(search.toLowerCase())) ||
                (member.member_id && member.member_id.toString().includes(search))
        );

        result = sortMembers(result, sortBy);
        setFilteredMembers(result);

        // أعيد تعيين الصفحة فقط إذا كان الإجراء من المستخدم (بحث أو ترتيب)
        if (isUserActionRef.current) {
            setCurrentPage(1);
            isUserActionRef.current = false; // إعادة تعيين العلامة
        }
    }, [search, sortBy, members]);

    const handleSortByTasks = () => {
        isUserActionRef.current = true; // علامة أن هذا إجراء مستخدم
        setSortBy("completed_tasks");
    };

    const handleSortByAttendance = () => {
        isUserActionRef.current = true; // علامة أن هذا إجراء مستخدم
        setSortBy("attended_events");
    };

    const handleSortByRank = () => {
        isUserActionRef.current = true; // علامة أن هذا إجراء مستخدم
        setSortBy("total_score");
    };

    const handleSearch = () => {
        isUserActionRef.current = true; // علامة أن هذا إجراء مستخدم
        setCurrentPage(1);
    };

    const sortMembers = (membersList, sortType) => {
        const sorted = [...membersList];

        switch (sortType) {
            case "completed_tasks":
                return sorted.sort((a, b) => (b.completed_tasks_count || 0) - (a.completed_tasks_count || 0));
            case "attended_events":
                return sorted.sort((a, b) => (b.attended_events_count || 0) - (a.attended_events_count || 0));
            case "total_score":
                return sorted.sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
            default:
                return sorted;
        }
    };

    const handleAddCycle = async () => {
        if (!newCycle.trim()) return;
        try {
            await axios.post(`${app_url}/cycles`, { name: newCycle });
            setNewCycle("");
            fetchCycles();
        } catch (error) {
            console.log(t("Error adding cycle:"), error);
        }
    };

    const handleSaveEditCycle = async () => {
        if (!editingCycle.name.trim()) return;
        try {
            await axios.put(`${app_url}/cycles/${editingCycle.id}`, { name: editingCycle.name });
            fetchCycles();
            setEditingCycle(null);
        } catch (error) {
            console.log(t("Error editing cycle:"), error);
        }
    };

    const handleDeleteCycle = async (cycleId) => {
        try {
            await axios.delete(`${app_url}/cycles/${cycleId}`);
            fetchCycles();
        } catch (error) {
            console.log(t("Error deleting cycle:"), error);
        }
    };

    const handleAddMember = () => setAddModal(true);

    const handleEditMember = (member) => {
        setSelectedMember({
            ...member,
            password: "",
            password_confirmation: "",
            email:member.user.email
        });
        setEditModal(true);
    };

    const handleDeleteMember = (member) => {
        setSelectedMember(member);
        setDeleteModal(true);
    };

    const handleViewActivities = (member) => {
        setSelectedMember(member);
        setActivitiesModal(true);
    };

    const handleViewTasks = (member) => {
        setSelectedMember(member);
        setTasksModal(true);
    };

    const handleManageRoles = () => setRolesModal(true);

    const closeModal = () => {
        setAddModal(false);
        setEditModal(false);
        setDeleteModal(false);
        setActivitiesModal(false);
        setTasksModal(false);
        setRolesModal(false);
        setSendModal(false);
        setSelectedMember(null);
        setErrors({});
        setNewMember({
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
            phone: "",
            cycle_id: null,
            role: "",
            rating: 0,
            member_id: ""
        });
    };

    const handleSaveAddMember = async () => {
        if (newMember.password !== newMember.password_confirmation) {
            setErrors({ password: [t("كلمة المرور غير متطابقة")] });
            return;
        }
        try {
            await axios.post(`${app_url}/members`, newMember);
            closeModal();
            fetchMembersWithDetails();
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
        }
    };

    const handleSaveEditMember = async () => {
        if (selectedMember.password && selectedMember.password !== selectedMember.password_confirmation) {
            setErrors({ password: [t("كلمة المرور غير متطابقة")] });
            return;
        }
        try {
            const dataToSend = { ...selectedMember };
            if (!dataToSend.password) {
                delete dataToSend.password;
                delete dataToSend.password_confirmation;
            }
            await axios.post(`${app_url}/members/${selectedMember.id}`, dataToSend);
            closeModal();
            fetchMembersWithDetails();
            setSelectedMember(null);
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`${app_url}/members/${selectedMember.id}`);
            closeModal();
            fetchMembersWithDetails();
            setSelectedMember(null);
        } catch (error) {
            console.log(t("Error deleting member:"), error);
        }
    };

    const handleExportPDF = async () => {
        try {
            const response = await axios.get(`${app_url}/members/export-pdf`, {
                params: { sort_by: sortBy, search },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `أعضاء_${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.log(t("Error exporting PDF:"), error);
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await axios.get(`${app_url}/members/export-excel`, {
                params: { sort_by: sortBy, search },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `أعضاء_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.log(t("Error exporting Excel:"), error);
        }
    };

    const renderRatingStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={`text-lg ${i <= rating ? "text-yellow-400" : "text-gray-300"}`}>
                    ★
                </span>
            );
        }
        return <div className="flex">{stars}</div>;
    };

    const indexOfLastMember = currentPage * rowsPerPage;
    const indexOfFirstMember = indexOfLastMember - rowsPerPage;
    const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);

    return (
        <AdminLayout>
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t("إدارة الأعضاء")}</h3>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={handleSortByTasks} className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${sortBy === "completed_tasks" ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200"}`}>
                                <AdjustmentsHorizontalIcon className="h-4 w-4 ml-1.5" />
                                {t("ترتيب حسب المهام")}
                            </button>
                            <button onClick={handleSortByAttendance} className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${sortBy === "attended_events" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"}`}>
                                <ChartBarIcon className="h-4 w-4 ml-1.5" />
                                {t("ترتيب حسب الحضور")}
                            </button>
                            <button onClick={handleSortByRank} className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${sortBy === "total_score" ? "bg-green-600 text-white" : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"}`}>
                                <TrophyIcon className="h-4 w-4 ml-1.5" />
                                {t("ترتيب حسب الأعلى")}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                        <div className="flex items-center w-full sm:w-auto">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t("بحث عن عضو")}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <button onClick={handleSearch} className="px-4 py-2 bg-primary text-white rounded-l-lg hover:bg-primary-dark transition-colors border border-primary">
                                {t("بحث")}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={handleExportPDF} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                                <ArrowDownTrayIcon className="h-4 w-4 ml-1.5" />
                                {t("PDF")}
                            </button>
                            <button onClick={handleExportExcel} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                                <ArrowDownTrayIcon className="h-4 w-4 ml-1.5" />
                                {t("Excel")}
                            </button>
                            <button onClick={handleManageRoles} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                                <AdjustmentsHorizontalIcon className="h-4 w-4 ml-1.5" />
                                {t("إدارة المسميات")}
                            </button>
                            <button onClick={handleAddMember} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors">
                                <PlusIcon className="h-4 w-4 ml-1.5" />
                                {t("إضافة عضو")}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full table-fixed">
                        <colgroup>
                            <col className="w-16" />
                            <col className="w-1/6" />
                            <col className="w-1/6" />
                            <col className="w-1/6" />
                            <col className="w-1/6" />
                            <col className="w-1/6" />
                            <col className="w-1/6" />
                            <col className="w-1/6" />
                        </colgroup>
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">#</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("الاسم")}</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("البريد الإلكتروني")}</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("المسمى الوظيفى")}</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("رقم التليفون")}</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("الرقم التعريفى (id)")}</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("الرتبة")}</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("يمكن اضافة اعضاء ")}</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("التقييم")}</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("الأحداث الحاضرة")}</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("المهام المكتملة")}</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("المجموع الكلي")}</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("الإجراءات")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {currentMembers.map((member, idx) => (
                                <tr key={member.id} className={`transition-colors duration-200 ${idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"} hover:bg-gray-100 dark:hover:bg-gray-600`}>
                                    <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{idx + 1 + (currentPage - 1) * rowsPerPage}</td>
                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200 font-medium">{member.name}</td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{member.user?.email || t("لا يوجد")}</td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{member.cycle?.name || t("لا يوجد")}</td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{member.phone}</td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{member.member_id}</td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                        <span className={`px-2 py-1 text-xs rounded-full ${member.role === "manager" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : member.role === "member" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"}`}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                        <span className={`px-2 py-1 text-xs rounded-full ${member.role === "manager" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : member.role === "member" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"}`}>
                                            {member?.add_members ? "نعم " : "لا" || t("لم يتم التحديد ")}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{renderRatingStars(member.rating)}</td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-bold">{member.attended_events_count || 0}</td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-bold">{member.completed_tasks_count || 0}</td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-bold">{member.total_score || 0}</td>
                                    <td className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 text-center">
                                        <div className="flex justify-center space-x-2">
                                            <button onClick={() => handleViewActivities(member)} className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors flex items-center gap-1">
                                                <EyeIcon className="h-4 w-4" /> {t("الأنشطة")}
                                            </button>
                                            <button onClick={() => handleViewTasks(member)} className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex items-center gap-1">
                                                <EyeIcon className="h-4 w-4" /> {t("المهام")}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    window.location.href = `mailto:${member.user?.email}?subject=رسالة%20إدارية&body=مرحباً%20${member.name}`;
                                                }}
                                                className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-1"
                                            >
                                                {t('إرسال إيميل')}
                                            </button>
                                            <button
                                                onClick={() => handleSendMessageToMember(member)}
                                                className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-2"
                                            >
                                                <FaWhatsapp className="text-green-600 text-lg" />
                                                {t('إرسال رسالة ')}
                                            </button>
                                            <button onClick={() => handleEditMember(member)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors">
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDeleteMember(member)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors">
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredMembers.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t("لا توجد أعضاء لعرضها")}</div>
                    )}
                    {filteredMembers.length > rowsPerPage && (
                        <div className="flex justify-between items-center mt-4">
                            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">{t("السابق")}</button>
                            <span className="text-gray-700 dark:text-gray-300">{t("صفحة")} {currentPage} {t("من")} {Math.ceil(filteredMembers.length / rowsPerPage)}</span>
                            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === Math.ceil(filteredMembers.length / rowsPerPage)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">{t("التالي")}</button>
                        </div>
                    )}
                </div>

                {rolesModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t("إدارة المسميات الوظيفية")}</h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6" /></button>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("إضافة مسمى وظيفي جديد")}</label>
                                    <div className="flex gap-2">
                                        <input type="text" value={newCycle} onChange={(e) => setNewCycle(e.target.value)} placeholder={t("أدخل اسم المسمى الوظيفي")} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200" />
                                        <button onClick={handleAddCycle} className="px-4 py-2 bg-primary text-white rounded-lg">{t("إضافة")}</button>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">{t("المسميات الوظيفية الحالية")}</h4>
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-y-auto">
                                        {cycles.map((cycle) => (
                                            <li key={cycle.id} className="py-3 flex items-center justify-between">
                                                {editingCycle?.id === cycle.id ? (
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <input type="text" value={editingCycle.name} onChange={(e) => setEditingCycle({...editingCycle, name: e.target.value})} className="flex-1 px-3 py-1 border border-gray-300 rounded-lg" />
                                                        <button onClick={handleSaveEditCycle} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">{t("حفظ")}</button>
                                                        <button onClick={() => setEditingCycle(null)} className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm">{t("إلغاء")}</button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="text-gray-700 dark:text-gray-300">{cycle.name}</span>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setEditingCycle(cycle)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg"><PencilIcon className="h-4 w-4" /></button>
                                                            <button onClick={() => handleDeleteCycle(cycle.id)} className="p-1 text-red-600 hover:bg-red-100 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                                                        </div>
                                                    </>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                                <button onClick={closeModal} className="w-full px-4 py-2 bg-primary text-white rounded-lg">{t("إغلاق")}</button>
                            </div>
                        </div>
                    </div>
                )}

            {addModal && (
                <MemberModal
                    title={t("إضافة عضو جديد")}
                    member={newMember}
                    setMember={setNewMember}
                    handleSave={handleSaveAddMember}
                    closeModal={closeModal}
                    errors={errors}
                    roles={roles}
                    cycles={cycles}
                    handlePermissionChange={() => {}}
                    handleRoleChange={(role) => setNewMember({...newMember, role})}
                    isEdit={false}
                />
            )}
            {editModal && selectedMember && (
                <MemberModal
                    title={t("تعديل العضو")}
                    member={selectedMember}
                    setMember={setSelectedMember}
                    handleSave={handleSaveEditMember}
                    closeModal={closeModal}
                    errors={errors}
                    roles={roles}
                    cycles={cycles}
                    handlePermissionChange={() => {}}
                    handleRoleChange={(role) => setSelectedMember({...selectedMember, role})}
                    isEdit={true}
                />
            )}

            {deleteModal && selectedMember && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            {t("هل أنت متأكد من حذف هذا العضو؟")}
                        </h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {t("سيتم حذف العضو")} <span className="font-bold">{selectedMember.name}</span> {t("بشكل دائم.")}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={closeModal} className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg">
                                {t("إلغاء")}
                            </button>
                            <button onClick={handleDeleteConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg">
                                {t("حذف")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            )}
            {sendModal && (
                <SendMessageModal
                    messageForm={messageForm}
                    setMessageForm={setMessageForm}
                    member={selectedMember}
                    closeModal={closeModal}
                    handleSendMessage={handleSendMessage}
                />
            )}
            {activitiesModal && selectedMember && <ActivitiesModal member={selectedMember} closeModal={closeModal} />}
            {tasksModal && selectedMember && <TasksModal member={selectedMember} closeModal={closeModal} />}
            </div>
        </AdminLayout>
    );
}
