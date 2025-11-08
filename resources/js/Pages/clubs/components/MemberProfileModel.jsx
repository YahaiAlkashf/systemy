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
    const [modelImage, setModelImage] = useState(false);
    const [memberId, setMemberId] = useState(null);
    const [image, setImage] = useState(null);
    const [showEditTitle, setShowEditTitle] = useState(true);
    const [title, setTitle] = useState(null);

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

            const userTasks = allTasks.filter(
                (task) => task.assigned_to === auth.user.id
            );

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

    const attendedEvents = myEvents.filter((event) =>
        event.attendances.some((att) => att.status === "attending")
    ).length;

    const apologizedEvents = myEvents.filter((event) =>
        event.attendances.some((att) => att.status === "apologizing")
    ).length;

    const completedTasks = myTasks.filter(
        (task) => task.status === "completed"
    ).length;
    const inProgressTasks = myTasks.filter(
        (task) => task.status === "in_progress"
    ).length;
    const pendingTasks = myTasks.filter(
        (task) => task.status === "pending"
    ).length;

    const showModleImage = ($id) => {
        setModelImage(true);
        setMemberId($id);
    };

    const handelImage = async () => {
        try {
            const formData = new FormData();
            formData.append("image", image);
            await axios.post(`${app_url}/memberimage/${memberId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setModelImage(false);
            fetchMemberProfile();
        } catch (error) {
            console.log(error);
        }
    };

    const handelMemberId = async ($id) => {
        try {
            await axios.post(`${app_url}/memberId/${$id}`, {
                member_id: memberId,
            });
            fetchMemberProfile();
        } catch (error) {
            console.log(error);
        }
    };
    const handelTitle =async ($id) =>{
        try {
            await axios.post(`${app_url}/memberTitle/${$id}`, {
                title: title,
            });
            fetchMemberProfile();
            setShowEditTitle(true);
        } catch (error) {
            console.log(error);
        }
    }
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
                            <div className="relative group w-20 h-20">
                                {member.image ? (
                                    <>
                                        <img
                                            src={`${app_url}/storage/${member.image}`}
                                            alt="image"
                                            className="h-20 w-20 rounded-full object-cover"
                                        />
                                        <div
                                            className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-full
                                              opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                                            onClick={() =>
                                                showModleImage(member.id)
                                            }
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <UserCircleIcon className="h-20 w-20 text-gray-400" />
                                        <div
                                            className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-full
                                              opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                                            onClick={() =>
                                                showModleImage(member.id)
                                            }
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="absolute bottom-0 right-0 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                {member.jop_title}
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
                                    {member.member_id || (
                                        <>
                                            <input
                                                type="text"
                                                className="text-black"
                                                onChange={(e) =>
                                                    setMemberId(e.target.value)
                                                }
                                            />
                                            <button
                                                onClick={() =>
                                                    handelMemberId(member.id)
                                                }
                                                className="flex-1 px-4 py-2 bg-primary text-gray-100 rounded-lg hover:bg-primary-dark dark:bg-primary dark:text-gray-200 dark:hover:bg-primary-dark"
                                            >
                                                حفظ
                                            </button>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                            <BuildingOfficeIcon className="h-6 w-6 text-primary ml-2" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t("الكلية")}
                                </p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">
                                    {showEditTitle ? (
                                        <>
                                            {member.jop_title || "غير محدد"}{" "}
                                            <PencilIcon
                                                className="w-4 h-4 inline-block hover:text-primary cursor-pointer"
                                                onClick={() =>{
                                                    setShowEditTitle(false);
                                                    setTitle(member.jop_title);
                                                }
                                                }
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                className="text-black"
                                                value={title}
                                                onChange={(e) =>
                                                    setTitle(e.target.value)
                                                }
                                            />
                                            <div className="flex gap-2 p-1">
                                            <button
                                                onClick={() =>
                                                    handelTitle(member.id)
                                                }
                                                className="flex-1 px-4 py-2 bg-primary text-gray-100 rounded-lg hover:bg-primary-dark dark:bg-primary dark:text-gray-200 dark:hover:bg-primary-dark"
                                            >
                                                حفظ
                                            </button>
                                           <button
                                                onClick={() =>
                                                   setShowEditTitle(true)
                                                }
                                                className="flex-1 px-4 py-2 bg-gray-400 text-gray-100 rounded-lg hover:bg-gray-300 dark:bg-gray-400 dark:text-gray-200 dark:hover:bg-gray-300"
                                            >
                                                تجاهل
                                            </button>
                                            </div>
                                        </>
                                    )}
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

                {modelImage && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t(" تحديث الصورة الشخصية")}
                                </h3>
                                <button
                                    onClick={() => {
                                        setModelImage(false);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6 max-w-md align-top">
                                <input
                                    type="file"
                                    onChange={(e) =>
                                        setImage(e.target.files[0])
                                    }
                                />
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <button
                                    onClick={() => {
                                        handelImage();
                                    }}
                                    className="flex-1 px-4 py-2 bg-primary text-gray-100 rounded-lg hover:bg-primary-dark dark:bg-primary dark:text-gray-200 dark:hover:bg-primary-dark"
                                >
                                    {t("حفظ")}
                                </button>
                                <button
                                    onClick={() => {
                                        setModelImage(false);
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
        </div>
    );
}
