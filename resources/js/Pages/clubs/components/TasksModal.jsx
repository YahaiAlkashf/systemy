import React, { useState, useEffect, use } from "react";
import {
    XMarkIcon,
    CheckBadgeIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    PencilIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    PaperClipIcon,
    EyeIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

export default function TasksModal({ member, closeModal }) {
    const { t } = useTranslation();
        const { app_url, auth } = usePage().props;

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [editTaskModal, setEditTaskModal] = useState(false);
    const [cycles, setCycles] = useState([]);
    const [memberNameSearch, setMemberNameSearch] = useState("");
    const [memberIdSearch, setMemberIdSearch] = useState("");
    const [members, setMembers] = useState([]);
    const [editFileUploads, setEditFileUploads] = useState([]);
    const [errors, setErrors] = useState({});
    const [tasks2, setTasks2] = useState([]);
    const [taskId,setTaskId]=useState(null);
    const [fileUploads, setFileUploads] = useState([]);
    useEffect(() => {
        fetchMemberAllTasks();
        fetchCycles();
        showAllMembers();
    }, [member]);
const showAllTasks = async (task_id) => {
    try {
        const response = await axios.get(`${app_url}/tasks`);
        const tasksData = response.data.tasks;

        // تجميع المهام حسب task_id
        const groupedTasks = tasksData.reduce((acc, task) => {
            const key = task.task_id || 'individual';
            if (!acc[key]) acc[key] = [];
            acc[key].push(task);
            return acc;
        }, {});

        setTasks2(groupedTasks);
        return groupedTasks; // إرجاع القيمة لاستخدامها
    } catch (error) {
        console.log(error);
        setTasks2({});
        return {};
    }
};
    const handleFileUpload = (e, isEdit = false) => {
        const files = Array.from(e.target.files);
        if (isEdit) {
            setEditFileUploads([...editFileUploads, ...files]);
        } else {
            setFileUploads([...fileUploads, ...files]);
        }
    };
    const fetchMemberAllTasks = async () => {
        try {
            const response = await axios.get(
                `${app_url}/members/${member.id}/all-tasks`
            );
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
            return {
                text: t("مكتمل"),
                color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                icon: CheckBadgeIcon,
            };
        }

        if (dueDate && due < now && status !== "completed") {
            return {
                text: t("متأخر"),
                color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                icon: ExclamationTriangleIcon,
            };
        }

        switch (status) {
            case "in_progress":
                return {
                    text: t("قيد التنفيذ"),
                    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                    icon: ClockIcon,
                };
            case "overdue":
                return {
                    text: t("متأخر"),
                    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                    icon: ExclamationTriangleIcon,
                };
            default:
                return {
                    text: t("معلق"),
                    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                    icon: ClockIcon,
                };
        }
    };

    const openEditModal = async (task) => {
        try {
            const groupedTasks = await showAllTasks(task.task_id);
            setTaskId(task.id);
            const taskGroup = groupedTasks[task.task_id] || [];
            const assignedUserIds = taskGroup
                .map(t => t.assigned_to)
                .filter(Boolean)
                .map(id => Number(id));
            setSelectedTask({
                ...task,
                assigned_to: assignedUserIds,
            });
            setEditTaskModal(true);
        } catch (error) {
            console.error("Error opening edit modal:", error);
            setSelectedTask({
                ...task,
                assigned_to: task.assigned_to ? [Number(task.assigned_to)] : [],
            });
            setEditTaskModal(true);
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
            document.querySelectorAll("select").forEach((select) => {
                select.selectedIndex = 0;
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
        const showAllMembers = async () => {
            try {
                const response = await axios.get(`${app_url}/members`);
                setMembers(response.data.members);
            } catch (error) {
                console.log(error);
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
        if(editFileUploads){
            console.log('hello');
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
            `${app_url}/tasks/${taskId}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        console.log("Edit task response:", response.data);

        if (response.data.success || response.data.message) {
            await fetchMemberAllTasks();

            setEditTaskModal(false);
            setEditFileUploads([]);
            setTaskId(null);
            setSelectedTask(null);
            setMemberNameSearch("");
            setMemberIdSearch("");
        }
    } catch (error) {
        console.error("Error editing task:", error);

        if (error.response) {
            setErrors(error.response.data.errors || {});
            console.error("Server error:", error.response.data);

            if (error.response.status === 404) {
                await fetchMemberAllTasks();
                setEditTaskModal(false);
            }
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
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {t("مهام العضو")} - {member.name}
                    </h3>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">
                                {t("جاري تحميل البيانات...")}
                            </p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">
                                {t("لا توجد مهام مسجلة لهذا العضو")}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tasks.map((task) => {
                                const statusInfo = getStatusInfo(
                                    task.status,
                                    task.due_date
                                );
                                const StatusIcon = statusInfo.icon;

                                return (
                                    <div
                                        key={task.id}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                                                {task.title}
                                                  {(auth.user.role === 'superadmin' || auth.user.member?.add_tasks === 1) &&
                                                 <button
                                                onClick={() =>
                                                    openEditModal(task)
                                                }
                                                className="p-2 px-3 mt-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
                                            >
                                                <PencilIcon className="h-4 w-4  " />
                                            </button>
                                                  }

                                            </h4>
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${statusInfo.color}`}
                                            >
                                                {statusInfo.text}

                                            </span>

                                        </div>
                                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                            <span>
                                                {t("تاريخ الاستحقاق:")}{" "}
                                                {formatDate(task.due_date)}
                                            </span>

                                            <div className="flex items-center">
                                                <StatusIcon className="h-4 w-4 ml-1" />
                                                <span>
                                                    {t("تم التعيين بواسطة:")}{" "}
                                                    {task.assigner?.name ||
                                                        t("غير معروف")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
                                        onClick={() => handelSelectedAllEdit()}
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
                                            {t("تحديد حسب القسم")}
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
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder={t("البحث بالاسم...")}
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
                                            {filteredMembers.map((member) => {
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

                                                            setSelectedTask({
                                                                ...selectedTask,
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
                                                                        .cycle
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
                                            })}
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
                                                        {t("الأعضاء المحددون:")}{" "}
                                                        {
                                                            selectedTask
                                                                .assigned_to
                                                                .length
                                                        }
                                                    </p>
                                                    <p className="text-xs text-green-600 dark:text-green-400">
                                                        {selectedTask.assigned_to
                                                            .map((userId) => {
                                                                const member =
                                                                    members.find(
                                                                        (m) =>
                                                                            m.user_id ===
                                                                            userId
                                                                    );
                                                                return member?.name;
                                                            })
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
                            Object.entries(errors).map(([field, msgs], i) => (
                                <div
                                    key={i}
                                    className="bg-red-100 text-red-700 p-2 rounded mb-1 text-sm mx-6"
                                >
                                    {msgs.map((msg, j) => (
                                        <p key={j}>{msg}</p>
                                    ))}
                                </div>
                            ))}

                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                            <button
                                onClick={() => {
                                    setEditTaskModal(false);
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
        </div>
    );
}
