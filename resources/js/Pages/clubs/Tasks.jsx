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
    AdjustmentsHorizontalIcon,
    CheckBadgeIcon,
    UserCircleIcon,
    DocumentTextIcon,
    CalendarIcon,
    UserGroupIcon,
    PaperClipIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export default function Tasks() {
    const { app_url, auth } = usePage().props;
    const [activeTab, setActiveTab] = useState("tasks");
    const { t } = useTranslation();
    const [addTaskModal, setAddTaskModal] = useState(false);
    const [editTaskModal, setEditTaskModal] = useState(false);
    const [deleteTaskModal, setDeleteTaskModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [memberNameSearch, setMemberNameSearch] = useState("");
    const [memberIdSearch, setMemberIdSearch] = useState("");
    const [members, setMembers] = useState([]);
    const [searchTask, setSearchTask] = useState("");
    const [errors, setErrors] = useState({});
    const [cycles, setCycles] = useState([]);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        assigned_to: [],
        due_date: "",
        files: [],
        status: "pending",
    });
    const [tastText, setTaskText] = useState({
        task_text: "",
        task_file: null
    });
    const [modelTaskText, setModelTaskText] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedMemberEdit, setSelectedMemberEdit] = useState(null);
    const [loading, setLoading] = useState(false);

    const [fileUploads, setFileUploads] = useState([]);
    const [editFileUploads, setEditFileUploads] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const showAllTasks = async () => {
        try {
            const response = await axios.get(`${app_url}/tasks`);
            setTasks(response.data.tasks);
            console.log(response.data.tasks);
        } catch (error) {
            console.log(error);
            setTasks([]);
        }
    };

    const handelSelectedAllEdit = () => {
        const currentAssignees = Array.isArray(selectedTask.assigned_to)
            ? selectedTask.assigned_to
            : selectedTask.assigned_to
            ? [selectedTask.assigned_to]
            : [];

        const allUserIds = filteredMembers.map((member) =>
            Number(member.user_id)
        );

        if (currentAssignees.length === allUserIds.length) {
            setSelectedTask({
                ...selectedTask,
                assigned_to: [],
            });
        } else {
            setSelectedTask({
                ...selectedTask,
                assigned_to: allUserIds,
            });
        }
    };

    const handelSelectedcycleEdit = (cycleId) => {
        if (!cycleId) return;

        const id = Number(cycleId);
        const selectMem = members
            .filter((member) => member.cycle_id === id)
            .map((member) => Number(member.user_id));

        const currentAssignees = Array.isArray(selectedTask.assigned_to)
            ? selectedTask.assigned_to
            : selectedTask.assigned_to
            ? [selectedTask.assigned_to]
            : [];

        setSelectedTask({
            ...selectedTask,
            assigned_to: Array.from(
                new Set([...currentAssignees, ...selectMem])
            ),
        });
    };

    const handelSelectedroleEdit = (role) => {
        if (!role) return;

        const selectMem = members
            .filter((member) => member.role === role)
            .map((member) => Number(member.user_id));

        const currentAssignees = Array.isArray(selectedTask.assigned_to)
            ? selectedTask.assigned_to
            : selectedTask.assigned_to
            ? [selectedTask.assigned_to]
            : [];

        console.log(role, selectMem);
        setSelectedTask({
            ...selectedTask,
            assigned_to: Array.from(
                new Set([...currentAssignees, ...selectMem])
            ),
        });
    };

    const handleRemoveExistingFile = async (fileId) => {
        if (window.confirm("هل أنت متأكد من حذف هذا الملف؟")) {
            try {
                await axios.delete(`/api/tasks/files/${fileId}`);

                setSelectedTask({
                    ...selectedTask,
                    files: selectedTask.files.filter(
                        (file) => file.id !== fileId
                    ),
                });
            } catch (error) {
                console.error("Error deleting file:", error);
            }
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

    const showAllMembers = async () => {
        try {
            const response = await axios.get(`${app_url}/members`);
            setMembers(response.data.members);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        showAllTasks();
        showAllMembers();
        fetchCycles();
    }, []);

    const filteredTasks = tasks.filter(
        (task) =>
            task.title.toLowerCase().includes(searchTask.toLowerCase()) ||
            (task.assignee?.name || "")
                .toLowerCase()
                .includes(searchTask.toLowerCase())
    );

    const filteredMembers = useMemo(() => {
        return members.filter(
            (member) =>
                member.name
                    .toLowerCase()
                    .includes(memberNameSearch.toLowerCase()) &&
                (member.member_id
                    ? member.member_id.toString().includes(memberIdSearch)
                    : true)
        );
    }, [members, memberNameSearch, memberIdSearch]);

    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;
    const currentTasks = filteredTasks.slice(indexOfFirstItem, indexOfLastItem);

    const handleAddTask = async () => {
        setLoading(true);
        setErrors({});
        try {
            if (
                !newTask.title ||
                !newTask.due_date ||
                newTask.assigned_to.length === 0
            ) {
                setErrors({
                    general: ["جميع الحقول المطلوبة يجب ملؤها"],
                });
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append("title", newTask.title);
            formData.append("description", newTask.description || "");
            formData.append("due_date", newTask.due_date);

            newTask.assigned_to.forEach((userId) => {
                formData.append("assigned_to[]", userId);
            });

            fileUploads.forEach((file) => {
                formData.append("files[]", file);
            });

            console.log("Sending data:", {
                title: newTask.title,
                description: newTask.description,
                assigned_to: newTask.assigned_to,
                due_date: newTask.due_date,
                filesCount: fileUploads.length,
            });

            const response = await axios.post(`${app_url}/tasks`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("Add task response:", response.data);

            if (response.data.success) {
                showAllTasks();
                setAddTaskModal(false);
                setNewTask({
                    title: "",
                    description: "",
                    assigned_to: [],
                    due_date: "",
                    files: [],
                    status: "pending",
                });
                setFileUploads([]);
                setMemberNameSearch("");
                setMemberIdSearch("");
            }
        } catch (error) {
            console.error("Error adding task:", error);

            if (error.response) {
                setErrors(error.response.data.errors || {});
                console.error("Server error:", error.response.data);
            } else if (error.request) {
                setErrors({
                    general: ["تعذر الاتصال بالخادم"],
                });
            } else {
                setErrors({
                    general: ["حدث خطأ أثناء إعداد الطلب"],
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditTask = async () => {
        setLoading(true);
        setErrors({});

        try {
            if (
                !selectedTask.title ||
                !selectedTask.due_date ||
                (Array.isArray(selectedTask.assigned_to) &&
                    selectedTask.assigned_to.length === 0) ||
                (!Array.isArray(selectedTask.assigned_to) &&
                    !selectedTask.assigned_to)
            ) {
                setErrors({
                    general: ["جميع الحقول المطلوبة يجب ملؤها"],
                });
                setLoading(false);
                return;
            }

            const formData = new FormData();

            formData.append("title", selectedTask.title);
            formData.append("description", selectedTask.description || "");
            formData.append("due_date", selectedTask.due_date);

            if (Array.isArray(selectedTask.assigned_to)) {
                selectedTask.assigned_to.forEach((userId) => {
                    formData.append("assigned_to[]", userId);
                });
            } else {
                formData.append("assigned_to[]", selectedTask.assigned_to);
            }

            editFileUploads.forEach((file) => {
                formData.append("files[]", file);
            });

            console.log("Sending update data:", {
                title: selectedTask.title,
                description: selectedTask.description,
                assigned_to: selectedTask.assigned_to,
                due_date: selectedTask.due_date,
                newFilesCount: editFileUploads.length,
            });

            const response = await axios.post(
                `${app_url}/tasks/${selectedTask.id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log("Edit task response:", response.data);

            if (response.data.success || response.data.message) {
                showAllTasks();
                setEditTaskModal(false);
                setEditFileUploads([]);
                setSelectedMemberEdit(null);
                setMemberNameSearch("");
                setMemberIdSearch("");
            }
        } catch (error) {
            console.error("Error editing task:", error);

            if (error.response) {
                setErrors(error.response.data.errors || {});
                console.error("Server error:", error.response.data);
            } else if (error.request) {
                setErrors({
                    general: ["تعذر الاتصال بالخادم"],
                });
            } else {
                setErrors({
                    general: ["حدث خطأ أثناء إعداد الطلب"],
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = () => {
        try {
            const response = axios.delete(
                `${app_url}/tasks/${selectedTask.id}`
            );
            showAllTasks();
            setDeleteTaskModal(false);
            setSelectedTask(null);
        } catch (error) {
            console.log(error);
        }
    };

    const openEditModal = (task) => {
        setSelectedTask(task);

        if (task.task_id) {
            const groupTasks = tasks.filter((t) => t.task_id === task.task_id);
            const assignedUserIds = groupTasks
                .map((t) => t.assigned_to)
                .filter(Boolean);

            setSelectedTask({
                ...task,
                assigned_to: assignedUserIds,
            });
        } else {
            const assignedUserIds = task.assigned_to ? [task.assigned_to] : [];

            setSelectedTask({
                ...task,
                assigned_to: assignedUserIds,
            });
        }

        setEditTaskModal(true);
    };

    const openDeleteModal = (task) => {
        setSelectedTask(task);
        setDeleteTaskModal(true);
    };

    const handleTaskTextChange = (task) => {
        setSelectedTask(task);
        setModelTaskText(true);
    };

    const handleFileUpload = (e, isEdit = false) => {
        const files = Array.from(e.target.files);
        if (isEdit) {
            setEditFileUploads([...editFileUploads, ...files]);
        } else {
            setFileUploads([...fileUploads, ...files]);
        }
    };

    const removeFile = (index, isEdit = false) => {
        if (isEdit) {
            setEditFileUploads(editFileUploads.filter((_, i) => i !== index));
        } else {
            setFileUploads(fileUploads.filter((_, i) => i !== index));
        }
    };

    const handleTaskStatusChange = async (taskId, status) => {
        try {
            const response = await axios.post(
                `${app_url}/tasks/${taskId}/status`,
                { status: status }
            );
            showAllTasks();
        } catch (error) {
            console.log(error);
        }
    };

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
    const handelSelectedAll = () => {
        if (newTask.assigned_to.length === members.length) {
            setNewTask({
                ...newTask,
                assigned_to: [],
            });
        } else {
            const allmem = members.map((member) => member.user_id);
            setNewTask({
                ...newTask,
                assigned_to: allmem,
            });
        }
    };

    const handelSelectedcycle = (cycleId) => {
        if (!cycleId) return;
        const id = Number(cycleId);
        const selectMem = members
            .filter((member) => member.cycle_id === id)
            .map((member) => Number(member.user_id));

        setNewTask({
            ...newTask,
            assigned_to: Array.from(
                new Set([...newTask.assigned_to, ...selectMem])
            ),
        });
    };
    const handelSelectedrole = (role) => {
        if (!role) return;
        const selectMem = members
            .filter((member) => member.role === role)
            .map((member) => Number(member.user_id));
        console.log(role, selectMem);
        setNewTask({
            ...newTask,
            assigned_to: [...newTask.assigned_to, ...selectMem],
        });
    };
    const handleSendTaskText = async()=>{
        try{
            const formData = new FormData();
            formData.append("task_text", tastText.task_text);
            if (tastText.task_file) {
                formData.append("task_file", tastText.task_file);
            }
                 const response = await axios.post(`${app_url}/tasktext/${selectedTask.id}`,formData,{
                         headers: {
                "Content-Type": "multipart/form-data",
            },
        }
        );
        setModelTaskText(false);
        setTaskText({
                task_text: "",
                 task_file: null
        })
        }catch(error){
            console.log(error);
            setErrors(error.response.data.errors || {});
        }
    }

    // if user is member
    if (auth.user?.member?.role !== "manager") {
        return (
            <AdminLayout>
                <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                        {t("لوحة المهام")}
                    </h2>
                    {/* section tasks*/}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                            {t("المهام المطلوبة منك")}
                        </h3>

                        <div className="space-y-4">
                            {tasks
                                .filter(
                                    (task) => task.assigned_to === auth.user.id
                                )
                                .map((task) => (
                                    <div
                                        key={task.id}
                                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex justify-between items-center"
                                    >
                                        <div>
                                            <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                                {task.title}
                                            </h4>
                                            <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                                {task.description}
                                            </h4>
                                            {task.files &&
                                            task.files.length > 0 ? (
                                                task.files.map(
                                                    (file, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded"
                                                        >
                                                            <div className="flex items-center">
                                                                <PaperClipIcon className="h-4 w-4 mr-2 text-gray-500" />
                                                                <span className="text-sm">
                                                                    {
                                                                        file.file_name
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <a
                                                                    href={`${app_url}/storage/${file.file_path}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:text-blue-800"
                                                                >
                                                                    <EyeIcon className="h-4 w-4" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )
                                                )
                                            ) : (
                                                <p className="text-gray-500 text-sm">
                                                    {t("لا توجد ملفات مرفقة")}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {t("يجب التسليم قبل:")}{" "}
                                                {task.due_date}
                                            </p>
                                            <div className="p-2">
                                                {getStatusBadge(task.status)}
                                            </div>
                                        </div>
                                        {t(
                                            task.status !== "completed" &&
                                                task.status !== "overdue"
                                        ) && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        handleTaskStatusChange(
                                                            task.id,
                                                            "completed"
                                                        )
                                                    }
                                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                                >
                                                    {t("تم الإكمال")}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleTaskTextChange(
                                                            task
                                                        )
                                                    }
                                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                                >
                                                    {t("رفع رد")}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    // if user is manager
    return (
        <AdminLayout>
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        {t("إدارة المهام")}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setAddTaskModal(true)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <DocumentTextIcon className="h-4 w-4 mr-1.5" />
                            {t("إضافة مهمة")}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div>
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                {t("المهام")}
                            </h3>
                            <div className="flex items-center">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    className="px-4 py-2 bg-primary text-white rounded-r-lg hover:bg-primary-dark transition-colors"
                                >
                                    {t("بحث")}
                                </button>
                                <input
                                    type="text"
                                    value={searchTask}
                                    onChange={(e) =>
                                        setSearchTask(e.target.value)
                                    }
                                    placeholder={t("بحث عن مهمة أو شخص")}
                                    className="px-3 py-2 border border-gray-300 rounded-l-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full table-fixed">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t("المهمة")}
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t("المسؤول")}
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t("العضو")}
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t("مهمة لاكثر من عضو")}
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t("تاريخ التسليم")}
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t("الحالة")}
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t("رد العضو")}
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t("الإجراءات")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {currentTasks.map((task) => (
                                        <tr
                                            key={task.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-600"
                                        >
                                            <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">
                                                {task.title}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                                {task.assigner?.name ||
                                                    t("غير معروف")}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                                {task?.assignee?.name}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                                {task?.task_id && (
                                                    <div className="flex flex-col space-y-2">
                                                        <div className="mb-2">
                                                            <span className="font-medium">
                                                                الأعضاء:
                                                            </span>
                                                            {tasks
                                                                .filter(
                                                                    (t) =>
                                                                        t.task_id ===
                                                                        task.task_id
                                                                )
                                                                .map(
                                                                    (ta) =>
                                                                        ta
                                                                            ?.assignee
                                                                            ?.name
                                                                )
                                                                .join("، ")}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        task
                                                                    )
                                                                }
                                                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                                            >
                                                                تعديل
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    openDeleteModal(
                                                                        task
                                                                    )
                                                                }
                                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                                            >
                                                                حذف
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                                {task.due_date}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {getStatusBadge(task.status)}
                                            </td>
                                            <td className="px-4 py-3 text-right dark:text-white">
                                                <div className="flex items-center space-x-2 gap-2">
                                                    {task.task_text}
                                                    {task.task_file &&(
                                                        <a href={`${app_url}/storage/${task.task_file}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 w-5 h-5">
                                                            <EyeIcon className="w-4 h-5" />
                                                        </a>
                                                    )}

                                                </div>

                                            </td>
                                            {!task?.task_id && (
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex justify-center space-x-2">
                                                        <button
                                                            onClick={() =>
                                                                openEditModal(
                                                                    task
                                                                )
                                                            }
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    task
                                                                )
                                                            }
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredTasks.length > rowsPerPage && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    {t("عرض")} {indexOfFirstItem + 1}-
                                    {Math.min(
                                        indexOfLastItem,
                                        filteredTasks.length
                                    )}{" "}
                                    {t("من")} {filteredTasks.length} {t("مهمة")}
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.max(prev - 1, 1)
                                            )
                                        }
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 ${
                                            currentPage === 1
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                                                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                                        }`}
                                    >
                                        {t("السابق")}
                                    </button>

                                    <div className="flex space-x-1">
                                        {Array.from(
                                            {
                                                length: Math.ceil(
                                                    filteredTasks.length /
                                                        rowsPerPage
                                                ),
                                            },
                                            (_, i) => i + 1
                                        )
                                            .filter((page) => {
                                                return (
                                                    page === 1 ||
                                                    page ===
                                                        Math.ceil(
                                                            filteredTasks.length /
                                                                rowsPerPage
                                                        ) ||
                                                    Math.abs(
                                                        page - currentPage
                                                    ) <= 1
                                                );
                                            })
                                            .map((page, index, array) => {
                                                const showEllipsis =
                                                    index > 0 &&
                                                    page - array[index - 1] > 1;
                                                return (
                                                    <React.Fragment key={page}>
                                                        {showEllipsis && (
                                                            <span className="px-3 py-2 text-gray-500">
                                                                ...
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() =>
                                                                setCurrentPage(
                                                                    page
                                                                )
                                                            }
                                                            className={`px-3 py-2 rounded-lg border ${
                                                                currentPage ===
                                                                page
                                                                    ? "bg-primary text-white border-primary"
                                                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    </React.Fragment>
                                                );
                                            })}
                                    </div>

                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.min(
                                                    prev + 1,
                                                    Math.ceil(
                                                        filteredTasks.length /
                                                            rowsPerPage
                                                    )
                                                )
                                            )
                                        }
                                        disabled={
                                            currentPage ===
                                            Math.ceil(
                                                filteredTasks.length /
                                                    rowsPerPage
                                            )
                                        }
                                        className={`px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 ${
                                            currentPage ===
                                            Math.ceil(
                                                filteredTasks.length /
                                                    rowsPerPage
                                            )
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                                                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                                        }`}
                                    >
                                        {t("التالي")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Task Modal */}
                {addTaskModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("إضافة مهمة جديدة")}
                                </h3>
                                <button
                                    onClick={() => {
                                        setAddTaskModal(false);
                                        setMemberNameSearch("");
                                        setMemberIdSearch("");
                                        setSelectedMember(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("عنوان المهمة")}
                                    </label>
                                    <input
                                        type="text"
                                        value={newTask.title}
                                        onChange={(e) =>
                                            setNewTask({
                                                ...newTask,
                                                title: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("وصف المهمة")}
                                    </label>
                                    <textarea
                                        value={newTask.description}
                                        onChange={(e) =>
                                            setNewTask({
                                                ...newTask,
                                                description: e.target.value,
                                            })
                                        }
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("اختيار العضو")}
                                    </label>
                                    <div>
                                        <button
                                            className="bg-primary dark:bg-primary-dark text-white rounded-md p-4 m-2"
                                            onClick={handelSelectedAll}
                                        >
                                            {t("تحديد الكل ")}
                                        </button>
                                        <select
                                            className="bg-primary px-8 dark:bg-primary-dark text-white rounded-md py-2 m-2"
                                            onChange={(e) =>
                                                handelSelectedcycle(
                                                    e.target.value
                                                )
                                            }
                                            defaultValue=""
                                        >
                                            <option value="">
                                                {t("تحديد حسب المسمى الوظيفى")}
                                            </option>

                                            {cycles?.map((cycle) => (
                                                <option
                                                    key={cycle.id}
                                                    value={cycle.id}
                                                >
                                                    {cycle.name}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            className="bg-primary dark:bg-primary-dark px-8 text-white rounded-md py-2 m-2"
                                            onChange={(e) =>
                                                handelSelectedrole(
                                                    e.target.value
                                                )
                                            }
                                            name="member"
                                            id="member"
                                        >
                                            <option value="">
                                                {t("تحديد حسب الرتبة")}
                                            </option>
                                            <option value="member">
                                                members
                                            </option>
                                            <option value="manager">
                                                managers
                                            </option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder={t(
                                                    "البحث بالاسم..."
                                                )}
                                                value={memberNameSearch}
                                                onChange={(e) =>
                                                    setMemberNameSearch(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>

                                        <div className="relative">
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder={t(
                                                    "البحث برقم العضوية..."
                                                )}
                                                value={memberIdSearch}
                                                onChange={(e) =>
                                                    setMemberIdSearch(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-700 max-h-60 overflow-y-auto">
                                        {filteredMembers.length > 0 ? (
                                            <div className="space-y-2">
                                                {filteredMembers.map(
                                                    (member) => (
                                                        <div
                                                            key={member.id}
                                                            className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                                                                newTask.assigned_to.includes(
                                                                    member.user_id
                                                                )
                                                                    ? "bg-primary-100 border border-primary-300 dark:bg-primary-900 dark:border-primary-700"
                                                                    : "hover:bg-gray-100 dark:hover:bg-gray-600"
                                                            }`}
                                                            onClick={() => {
                                                                const updatedAssignees =
                                                                    newTask.assigned_to.includes(
                                                                        member.user_id
                                                                    )
                                                                        ? newTask.assigned_to.filter(
                                                                              (
                                                                                  id
                                                                              ) =>
                                                                                  id !==
                                                                                  member.user_id
                                                                          )
                                                                        : [
                                                                              ...newTask.assigned_to,
                                                                              member.user_id,
                                                                          ];

                                                                setNewTask({
                                                                    ...newTask,
                                                                    assigned_to:
                                                                        updatedAssignees,
                                                                });
                                                            }}
                                                        >
                                                            <div className="flex items-center">
                                                                <div className="ml-3">
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                        {
                                                                            member.name
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {t(
                                                                            "رقم العضوية:"
                                                                        )}{" "}
                                                                        {member.member_id ||
                                                                            t(
                                                                                "غير محدد"
                                                                            )}{" "}
                                                                        |{" "}
                                                                        {member
                                                                            .role
                                                                            ?.name ||
                                                                            t(
                                                                                "بدور"
                                                                            )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {newTask.assigned_to.includes(
                                                                member.user_id
                                                            ) && (
                                                                <CheckCircleIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                                {t("لا توجد نتائج")}
                                            </div>
                                        )}
                                    </div>

                                    {selectedMember && (
                                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                                        {t("العضو المحدد:")}{" "}
                                                        {selectedMember.name}
                                                    </p>
                                                    <p className="text-xs text-green-600 dark:text-green-400">
                                                        {t("رقم العضوية:")}{" "}
                                                        {selectedMember.member_id ||
                                                            t("غير محدد")}{" "}
                                                        |{" "}
                                                        {selectedMember.role
                                                            ?.name || t("بدور")}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setNewTask({
                                                            ...newTask,
                                                            assigned_to: null,
                                                        });
                                                        setSelectedMember(null);
                                                    }}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("تاريخ التسليم")}
                                    </label>
                                    <input
                                        type="date"
                                        value={newTask.due_date}
                                        onChange={(e) =>
                                            setNewTask({
                                                ...newTask,
                                                due_date: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("إرفاق ملفات")}
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={(e) =>
                                                handleFileUpload(e, false)
                                            }
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="cursor-pointer text-primary hover:text-primary-dark"
                                        >
                                            <PaperClipIcon className="h-8 w-8 mx-auto mb-2" />
                                            <span>
                                                {t(
                                                    "انقر لرفع الملفات أو اسحبها هنا"
                                                )}
                                            </span>
                                        </label>
                                    </div>
                                    <div className="mt-2 space-y-2">
                                        {fileUploads.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded"
                                            >
                                                <span className="text-sm">
                                                    {file.name}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        removeFile(index, false)
                                                    }
                                                    className="text-red-600"
                                                >
                                                    <XMarkIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {errors &&
                                Object.entries(errors).map(
                                    ([field, msgs], i) => (
                                        <div
                                            key={i}
                                            className="bg-red-100 text-red-700 p-2 rounded mb-1 text-sm mx-6"
                                        >
                                            {msgs.map((msg, j) => (
                                                <p key={j}>{msg}</p>
                                            ))}
                                        </div>
                                    )
                                )}
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <button
                                    onClick={() => {
                                        setAddTaskModal(false);
                                        setMemberNameSearch("");
                                        setMemberIdSearch("");
                                        setSelectedMember(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    {t("إلغاء")}
                                </button>
                                <button
                                    onClick={handleAddTask}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? t("جاري الإضافة...")
                                        : t("إضافة المهمة")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Task Modal */}
                {editTaskModal && selectedTask && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("تعديل المهمة")}
                                </h3>
                                <button
                                    onClick={() => {
                                        setEditTaskModal(false);
                                        setSelectedMemberEdit(null);
                                        setMemberNameSearch("");
                                        setMemberIdSearch("");
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("عنوان المهمة")}
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedTask.title}
                                        onChange={(e) =>
                                            setSelectedTask({
                                                ...selectedTask,
                                                title: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("وصف المهمة")}
                                    </label>
                                    <textarea
                                        value={selectedTask.description}
                                        onChange={(e) =>
                                            setSelectedTask({
                                                ...selectedTask,
                                                description: e.target.value,
                                            })
                                        }
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("اختيار العضو")}
                                    </label>
                                    <div>
                                        <button
                                            className="bg-primary dark:bg-primary-dark text-white rounded-md p-4 m-2"
                                            onClick={() =>
                                                handelSelectedAllEdit()
                                            }
                                        >
                                            {t("تحديد الكل")}
                                        </button>
                                        <select
                                            className="bg-primary px-8 dark:bg-primary-dark text-white rounded-md py-2 m-2"
                                            onChange={(e) =>
                                                handelSelectedcycleEdit(
                                                    e.target.value
                                                )
                                            }
                                            defaultValue=""
                                        >
                                            <option value="">
                                                {t("تحديد حسب المسمى الوظيفى")}
                                            </option>
                                            {cycles?.map((cycle) => (
                                                <option
                                                    key={cycle.id}
                                                    value={cycle.id}
                                                >
                                                    {cycle.name}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            className="bg-primary dark:bg-primary-dark px-8 text-white rounded-md py-2 m-2"
                                            onChange={(e) =>
                                                handelSelectedroleEdit(
                                                    e.target.value
                                                )
                                            }
                                            defaultValue=""
                                        >
                                            <option value="">
                                                {t("تحديد حسب الرتبة")}
                                            </option>
                                            <option value="member">
                                                members
                                            </option>
                                            <option value="manager">
                                                managers
                                            </option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder={t(
                                                    "البحث بالاسم..."
                                                )}
                                                value={memberNameSearch}
                                                onChange={(e) =>
                                                    setMemberNameSearch(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>

                                        <div className="relative">
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder={t(
                                                    "البحث برقم العضوية..."
                                                )}
                                                value={memberIdSearch}
                                                onChange={(e) =>
                                                    setMemberIdSearch(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-700 max-h-60 overflow-y-auto">
                                        {filteredMembers.length > 0 ? (
                                            <div className="space-y-2">
                                                {filteredMembers.map(
                                                    (member) => {
                                                        const currentAssignees =
                                                            Array.isArray(
                                                                selectedTask.assigned_to
                                                            )
                                                                ? selectedTask.assigned_to
                                                                : selectedTask.assigned_to
                                                                ? [
                                                                      selectedTask.assigned_to,
                                                                  ]
                                                                : [];

                                                        const isSelected =
                                                            currentAssignees.includes(
                                                                member.user_id
                                                            );

                                                        return (
                                                            <div
                                                                key={member.id}
                                                                className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                                                                    isSelected
                                                                        ? "bg-primary-100 border border-primary-300 dark:bg-primary-900 dark:border-primary-700"
                                                                        : "hover:bg-gray-100 dark:hover:bg-gray-600"
                                                                }`}
                                                                onClick={() => {
                                                                    const updatedAssignees =
                                                                        isSelected
                                                                            ? currentAssignees.filter(
                                                                                  (
                                                                                      id
                                                                                  ) =>
                                                                                      id !==
                                                                                      member.user_id
                                                                              )
                                                                            : [
                                                                                  ...currentAssignees,
                                                                                  member.user_id,
                                                                              ];

                                                                    setSelectedTask(
                                                                        {
                                                                            ...selectedTask,
                                                                            assigned_to:
                                                                                updatedAssignees,
                                                                        }
                                                                    );
                                                                }}
                                                            >
                                                                <div className="flex items-center">
                                                                    <div className="ml-3">
                                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                            {
                                                                                member.name
                                                                            }
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                            {t(
                                                                                "رقم العضوية:"
                                                                            )}{" "}
                                                                            {member.member_id ||
                                                                                t(
                                                                                    "غير محدد"
                                                                                )}{" "}
                                                                            |{" "}
                                                                            {member
                                                                                .role
                                                                                ?.name ||
                                                                                t(
                                                                                    "بدور"
                                                                                )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {isSelected && (
                                                                    <CheckCircleIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                                {t("لا توجد نتائج")}
                                            </div>
                                        )}
                                    </div>

                                    {selectedTask.assigned_to &&
                                        selectedTask.assigned_to.length > 0 && (
                                            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                                            {t(
                                                                "الأعضاء المحددون:"
                                                            )}{" "}
                                                            {
                                                                selectedTask
                                                                    .assigned_to
                                                                    .length
                                                            }
                                                        </p>
                                                        <p className="text-xs text-green-600 dark:text-green-400">
                                                            {selectedTask.assigned_to
                                                                .map(
                                                                    (
                                                                        userId
                                                                    ) => {
                                                                        const member =
                                                                            members.find(
                                                                                (
                                                                                    m
                                                                                ) =>
                                                                                    m.user_id ===
                                                                                    userId
                                                                            );
                                                                        return member?.name;
                                                                    }
                                                                )
                                                                .filter(Boolean)
                                                                .join("، ")}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedTask({
                                                                ...selectedTask,
                                                                assigned_to: [],
                                                            });
                                                        }}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        <XMarkIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("تاريخ التسليم")}
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedTask.due_date}
                                        onChange={(e) =>
                                            setSelectedTask({
                                                ...selectedTask,
                                                due_date: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("الملفات الحالية")}
                                    </label>
                                    <div className="space-y-2">
                                        {selectedTask.files &&
                                        selectedTask.files.length > 0 ? (
                                            selectedTask.files.map(
                                                (file, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded"
                                                    >
                                                        <div className="flex items-center">
                                                            <PaperClipIcon className="h-4 w-4 mr-2 text-gray-500" />
                                                            <span className="text-sm">
                                                                {file.file_name}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <a
                                                                href={`${app_url}/storage/${file.file_path}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                <EyeIcon className="h-4 w-4" />
                                                            </a>
                                                            <button
                                                                onClick={() =>
                                                                    handleRemoveExistingFile(
                                                                        file.id
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <XMarkIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <p className="text-gray-500 text-sm">
                                                {t("لا توجد ملفات مرفقة")}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("إضافة ملفات جديدة")}
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={(e) =>
                                                handleFileUpload(e, true)
                                            }
                                            className="hidden"
                                            id="file-upload-edit"
                                        />
                                        <label
                                            htmlFor="file-upload-edit"
                                            className="cursor-pointer text-primary hover:text-primary-dark"
                                        >
                                            <PaperClipIcon className="h-8 w-8 mx-auto mb-2" />
                                            <span>
                                                {t(
                                                    "انقر لرفع الملفات أو اسحبها هنا"
                                                )}
                                            </span>
                                        </label>
                                    </div>
                                    <div className="mt-2 space-y-2">
                                        {editFileUploads.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded"
                                            >
                                                <span className="text-sm">
                                                    {file.name}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        removeFile(index, true)
                                                    }
                                                    className="text-red-600"
                                                >
                                                    <XMarkIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {errors &&
                                Object.entries(errors).map(
                                    ([field, msgs], i) => (
                                        <div
                                            key={i}
                                            className="bg-red-100 text-red-700 p-2 rounded mb-1 text-sm mx-6"
                                        >
                                            {msgs.map((msg, j) => (
                                                <p key={j}>{msg}</p>
                                            ))}
                                        </div>
                                    )
                                )}

                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <button
                                    onClick={() => {
                                        setEditTaskModal(false);
                                        setSelectedMemberEdit(null);
                                        setMemberNameSearch("");
                                        setMemberIdSearch("");
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    {t("إلغاء")}
                                </button>
                                <button
                                    onClick={handleEditTask}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? t("جاري التعديل...")
                                        : t("حفظ التعديلات")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteTaskModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("تأكيد الحذف")}
                                </h3>
                                <button
                                    onClick={() => setDeleteTaskModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    {t(
                                        `هل أنت متأكد من أنك تريد حذف المهمة ${selectedTask.title}؟ هذا الإجراء لا يمكن التراجع عنه.`,
                                        {
                                            taskTitle: selectedTask?.title,
                                        }
                                    )}
                                </p>
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <button
                                    onClick={() => setDeleteTaskModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    {t("إلغاء")}
                                </button>
                                <button
                                    onClick={handleDeleteTask}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    {t("حذف")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Edit Task Text Modal */}
                {modelTaskText && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => {
                                        setModelTaskText(false);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("ارسال رد")}
                                    </label>
                                    <input
                                        type="text"
                                        value={tastText.task_text}
                                        onChange={(e) =>
                                            setTaskText({
                                                ...tastText,
                                                task_text: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("إرفاق ملف")}
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        <input
                                            type="file"
                                            onChange={(e) =>
                                                setTaskText({
                                                    ...tastText,
                                                    task_file:
                                                        e.target.files[0],
                                                })
                                            }
                                            id="file-upload"
                                        />
                                    </div>
                                </div>
                            </div>
                            {errors &&
                                Object.entries(errors).map(
                                    ([field, msgs], i) => (
                                        <div
                                            key={i}
                                            className="bg-red-100 text-red-700 p-2 rounded mb-1 text-sm mx-6"
                                        >
                                            {msgs.map((msg, j) => (
                                                <p key={j}>{msg}</p>
                                            ))}
                                        </div>
                                    )
                                )}
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <button
                                    onClick={() => {
                                        setModelTaskText(false);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    {t("إلغاء")}
                                </button>
                                <button
                                    onClick={handleSendTaskText}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? t("جاري الارسال...")
                                        : t("ارسال  ")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                    {t("لوحة المهام")}
                </h2>
                {/* section tasks*/}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        {t("المهام المطلوبة منك")}
                    </h3>
                    <div className="space-y-4">
                        {tasks
                            .filter((task) => task.assigned_to === auth.user.id)
                            .map((task) => (
                                <div
                                    key={task.id}
                                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex justify-between items-center"
                                >
                                    <div>
                                        <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                            {task.title}
                                        </h4>
                                        <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                            {task.description}
                                        </h4>
                                        {task.files && task.files.length > 0 ? (
                                            task.files.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded"
                                                >
                                                    <div className="flex items-center">
                                                        <PaperClipIcon className="h-4 w-4 mr-2 text-gray-500" />
                                                        <span className="text-sm">
                                                            {file.file_name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <a
                                                            href={`${app_url}/storage/${file.file_path}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm">
                                                {t("لا توجد ملفات مرفقة")}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t("يجب التسليم قبل:")}{" "}
                                            {task.due_date}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {task?.assignee?.name}
                                        </div>
                                        <div className="p-2">
                                            {getStatusBadge(task.status)}
                                        </div>
                                    </div>
                                    {task.status !== "completed" &&
                                        task.status !== "overdue" && (
                                            <div className="flex items-center space-x-2 gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleTaskStatusChange(
                                                            task.id,
                                                            "completed"
                                                        )
                                                    }
                                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                                >
                                                    {t("تم الإكمال")}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleTaskTextChange(
                                                            task
                                                        )
                                                    }
                                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                                >
                                                    {t("رفع رد")}
                                                </button>
                                            </div>
                                        )}
                                </div>
                            ))}
                    </div>
                </div>
            </div>

        </AdminLayout>
    );
}
