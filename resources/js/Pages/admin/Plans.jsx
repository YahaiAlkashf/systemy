import React, { useState, useEffect } from "react";
import AdminLayout from "./layout";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import {
    XMarkIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const emptyCouponForm = {
    code: "",
    plan_id: "",
    price_in_egp: "",
    price_outside_egp: "",
};

export default function Plans() {
    const { auth, app_url } = usePage().props;
    const [coupons, setCoupons] = useState([]);
    const [plans, setPlans] = useState([]);
    const { t } = useTranslation();
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const [isAddCouponModalOpen, setAddCouponModalOpen] = useState(false);
    const [isEditCouponModalOpen, setEditCouponModalOpen] = useState(false);
    const [isDeleteCouponModalOpen, setDeleteCouponModalOpen] = useState(false);
    const [isEditPlansModalOpen, setEditPlansModalOpen] = useState(false);

    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [couponFormData, setCouponFormData] = useState(emptyCouponForm);
    const [plansFormData, setPlansFormData] = useState({
        basic: { price_in_egp: "", price_outside_egp: "" },
        premium: { price_in_egp: "", price_outside_egp: "" },
        vip: { price_in_egp: "", price_outside_egp: "" }
    });

    useEffect(() => {
        showAllPlans();
    }, []);

    const showAllPlans = async () => {
        try {
            const response = await axios.get(`${app_url}/plans`);
            const allPlans = response.data.plans || [];
            setPlans(allPlans);
            const allCoupons = [];
            allPlans.forEach(plan => {
                if (plan.coupons && plan.coupons.length > 0) {
                    plan.coupons.forEach(coupon => {
                        allCoupons.push({
                            ...coupon,
                            plan_name: plan.name
                        });
                    });
                }
            });
            setCoupons(allCoupons);
        } catch (error) {
            console.log(error);
        }
    };

    const sendDataAddCoupon = async () => {
        setIsLoading(true);
        setErrors({});

        try {
            const response = await axios.post(`${app_url}/coupons`, {
                code: couponFormData.code,
                plan_id: couponFormData.plan_id,
                price_in_egp: couponFormData.price_in_egp,
                price_outside_egp: couponFormData.price_outside_egp,
            });

            if (response.data.success) {
                closeModal();
                showAllPlans();
            } else {
                if (response.data.errors) {
                    setErrors(response.data.errors);
                }
                console.error(t("فشل في إضافة الكوبون:"), response.data.errors);
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error(t("خطأ في إضافة الكوبون:"), error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const sendDataUpdateCoupon = async () => {
        setIsLoading(true);
        setErrors({});

        try {
            const response = await axios.put(`${app_url}/coupons/${selectedCoupon.id}`, {
                code: couponFormData.code,
                plan_id: couponFormData.plan_id,
                price_in_egp: couponFormData.price_in_egp,
                price_outside_egp: couponFormData.price_outside_egp,
            });

            if (response.data.success) {
                closeModal();
                showAllPlans();
            } else {
                if (response.data.errors) {
                    setErrors(response.data.errors);
                }
                console.error(t("فشل في تحديث الكوبون:"), response.data.errors);
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error(t("خطأ في تحديث الكوبون:"), error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const sendDataDeleteCoupon = async () => {
        setIsLoading(true);

        try {
            const response = await axios.delete(`${app_url}/coupons/${selectedCoupon.id}`);

            if (response.data.success) {
                closeModal();
                showAllPlans();
            } else {
                console.error(t("فشل في حذف الكوبون:"), response.data.errors);
            }
        } catch (error) {
            console.error(t("خطأ في حذف الكوبون:"), error);
        } finally {
            setIsLoading(false);
        }
    };

    const sendDataUpdatePlans = async () => {
        setIsLoading(true);
        setErrors({});

        try {
            const updates = [];
            for (const [planName, planData] of Object.entries(plansFormData)) {
                const plan = plans.find(p => p.name === planName);
                if (plan) {
                    const response = await axios.put(`${app_url}/plans/${plan.id}`, {
                        name: planName,
                        price_in_egp: planData.price_in_egp,
                        price_outside_egp: planData.price_outside_egp,
                    });
                    updates.push(response);
                }
            }

            const allSuccess = updates.every(update => update.data.success);

            if (allSuccess) {
                closeModal();
                showAllPlans();
            } else {
                console.error(t("فشل في تحديث بعض الباقات"));
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error(t("خطأ في تحديث الباقات:"), error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const openAddCouponModal = () => {
        setCouponFormData(emptyCouponForm);
        setErrors({});
        setAddCouponModalOpen(true);
    };

    const openEditCouponModal = (coupon) => {
        setSelectedCoupon(coupon);
        setCouponFormData({
            code: coupon.code,
            plan_id: coupon.plan_id,
            price_in_egp: coupon.price_in_egp,
            price_outside_egp: coupon.price_outside_egp,
        });
        setErrors({});
        setEditCouponModalOpen(true);
    };

    const openDeleteCouponModal = (coupon) => {
        setSelectedCoupon(coupon);
        setDeleteCouponModalOpen(true);
    };

    const openEditPlansModal = () => {
        const newPlansFormData = {};
        plans.forEach(plan => {
            newPlansFormData[plan.name] = {
                price_in_egp: plan.price_in_egp,
                price_outside_egp: plan.price_outside_egp
            };
        });
        setPlansFormData(newPlansFormData);
        setErrors({});
        setEditPlansModalOpen(true);
    };

    const closeModal = () => {
        setAddCouponModalOpen(false);
        setEditCouponModalOpen(false);
        setDeleteCouponModalOpen(false);
        setEditPlansModalOpen(false);
        setSelectedCoupon(null);
        setErrors({});
    };

    const handleSaveCoupon = () => {
        if (selectedCoupon) {
            sendDataUpdateCoupon();
        } else {
            sendDataAddCoupon();
        }
    };

    const handleDeleteCoupon = () => {
        sendDataDeleteCoupon();
    };

    const handleSavePlans = () => {
        sendDataUpdatePlans();
    };

    // دالة مساعدة لعرض رسائل الخطأ
    const renderError = (field) => {
        if (errors[field]) {
            return (
                <div className="flex items-center mt-1 text-red-600 text-sm">
                    <ExclamationCircleIcon className="h-4 w-4 ml-1" />
                    {errors[field][0]}
                </div>
            );
        }
        return null;
    };

    const basicPlan = plans.find(plan => plan.name === "basic");
    const premiumPlan = plans.find(plan => plan.name === "premium");
    const vipPlan = plans.find(plan => plan.name === "vip");

    return (
        <AdminLayout auth={auth}>
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        {t("إدارة الكوبونات والباقات")}
                    </h3>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={openAddCouponModal}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <PlusIcon className="h-4 w-4 ml-1.5" />
                            {t("إضافة كوبون خصم")}
                        </button>
                        <button
                            onClick={openEditPlansModal}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <PencilIcon className="h-4 w-4 ml-1.5" />
                            {t("تعديل الباقات")}
                        </button>
                    </div>
                </div>

                {/* Coupons Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full table-fixed">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("كود الكوبون")}</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("الباقة المستهدفة")}</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("السعر (داخل مصر)")}</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("السعر (خارج مصر)")}</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("الإجراءات")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {coupons.map((coupon, idx) => (
                                <tr key={coupon.id} className={`transition-colors duration-200 ${idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"} hover:bg-gray-100 dark:hover:bg-gray-600`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{coupon.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{coupon.plan_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{coupon.price_in_egp}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{coupon.price_outside_egp}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center items-center space-x-2">
                                            <button onClick={() => openEditCouponModal(coupon)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors">
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => openDeleteCouponModal(coupon)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {coupons.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            {t("لا توجد كوبونات لعرضها حالياً.")}
                        </div>
                    )}
                </div>


                <div className="mt-10">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t("أسعار الباقات الحالية")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {basicPlan && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t("الباقة الأساسية (Basic)")}</h4>
                                <p className="text-gray-600 dark:text-gray-300">{t("داخل مصر:")} {basicPlan.price_in_egp}</p>
                                <p className="text-gray-600 dark:text-gray-300">{t("خارج مصر:")} {basicPlan.price_outside_egp}</p>
                            </div>
                        )}
                        {premiumPlan && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t("الباقة المتوسطة (Premium)")}</h4>
                                <p className="text-gray-600 dark:text-gray-300">{t("داخل مصر:")} {premiumPlan.price_in_egp}</p>
                                <p className="text-gray-600 dark:text-gray-300">{t("خارج مصر:")} {premiumPlan.price_outside_egp}</p>
                            </div>
                        )}
                        {vipPlan && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t("الباقة المتقدمة (VIP)")}</h4>
                                <p className="text-gray-600 dark:text-gray-300">{t("داخل مصر:")} {vipPlan.price_in_egp}</p>
                                <p className="text-gray-600 dark:text-gray-300">{t("خارج مصر:")} {vipPlan.price_outside_egp}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add/Edit Coupon Modal */}
                {(isAddCouponModalOpen || isEditCouponModalOpen) && (
                    <FormModal
                        title={isAddCouponModalOpen ? t("إضافة كوبون جديد") : t("تعديل الكوبون")}
                        onClose={closeModal}
                        onSave={handleSaveCoupon}
                        isLoading={isLoading}
                        t={t}
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("كود الكوبون")}</label>
                            <input
                                type="text"
                                value={couponFormData.code}
                                onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                    errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                                }`}
                            />
                            {renderError('code')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("الباقة")}</label>
                            <select
                                value={couponFormData.plan_id}
                                onChange={(e) => setCouponFormData({ ...couponFormData, plan_id: e.target.value })}
                                className={`w-full px-8 py-2 border rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                    errors.plan_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                                }`}
                            >
                                <option value="">{t("اختر الباقة")}</option>
                                {plans.map(plan => (
                                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                                ))}
                            </select>
                            {renderError('plan_id')}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("السعر بعد الخصم (داخل مصر)")}</label>
                                <input
                                    type="number"
                                    value={couponFormData.price_in_egp}
                                    onChange={(e) => setCouponFormData({ ...couponFormData, price_in_egp: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                        errors.price_in_egp ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                                    }`}
                                />
                                {renderError('price_in_egp')}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("السعر بعد الخصم (خارج مصر)")}</label>
                                <input
                                    type="number"
                                    value={couponFormData.price_outside_egp}
                                    onChange={(e) => setCouponFormData({ ...couponFormData, price_outside_egp: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                        errors.price_outside_egp ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                                    }`}
                                />
                                {renderError('price_outside_egp')}
                            </div>
                        </div>
                    </FormModal>
                )}

                {/* Edit Plans Modal */}
                {isEditPlansModalOpen && (
                    <FormModal
                        title={t("تعديل أسعار الباقات")}
                        onClose={closeModal}
                        onSave={handleSavePlans}
                        isLoading={isLoading}
                        t={t}
                    >
                        <div className="space-y-4">
                            {/* Basic Plan */}
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{t("الباقة الأساسية (Basic)")}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("السعر داخل مصر")}</label>
                                        <input
                                            type="number"
                                            value={plansFormData.basic?.price_in_egp || ""}
                                            onChange={(e) => setPlansFormData({
                                                ...plansFormData,
                                                basic: {
                                                    ...plansFormData.basic,
                                                    price_in_egp: e.target.value
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("السعر خارج مصر")}</label>
                                        <input
                                            type="number"
                                            value={plansFormData.basic?.price_outside_egp || ""}
                                            onChange={(e) => setPlansFormData({
                                                ...plansFormData,
                                                basic: {
                                                    ...plansFormData.basic,
                                                    price_outside_egp: e.target.value
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Premium Plan */}
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{t("الباقة المتوسطة (Premium)")}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("السعر داخل مصر")}</label>
                                        <input
                                            type="number"
                                            value={plansFormData.premium?.price_in_egp || ""}
                                            onChange={(e) => setPlansFormData({
                                                ...plansFormData,
                                                premium: {
                                                    ...plansFormData.premium,
                                                    price_in_egp: e.target.value
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("السعر خارج مصر")}</label>
                                        <input
                                            type="number"
                                            value={plansFormData.premium?.price_outside_egp || ""}
                                            onChange={(e) => setPlansFormData({
                                                ...plansFormData,
                                                premium: {
                                                    ...plansFormData.premium,
                                                    price_outside_egp: e.target.value
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* VIP Plan */}
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{t("الباقة المتقدمة (VIP)")}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("السعر داخل مصر")}</label>
                                        <input
                                            type="number"
                                            value={plansFormData.vip?.price_in_egp || ""}
                                            onChange={(e) => setPlansFormData({
                                                ...plansFormData,
                                                vip: {
                                                    ...plansFormData.vip,
                                                    price_in_egp: e.target.value
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("السعر خارج مصر")}</label>
                                        <input
                                            type="number"
                                            value={plansFormData.vip?.price_outside_egp || ""}
                                            onChange={(e) => setPlansFormData({
                                                ...plansFormData,
                                                vip: {
                                                    ...plansFormData.vip,
                                                    price_outside_egp: e.target.value
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FormModal>
                )}

                {/* Delete Coupon Modal */}
                {isDeleteCouponModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t("هل أنت متأكد من حذف هذا الكوبون؟")}</h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:text-gray-300">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                                    {t('لا يمكن التراجع عن هذا الإجراء. سيتم حذف الكوبون "{0}" نهائياً.', selectedCoupon?.code)}
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={closeModal} className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">
                                        {t("إلغاء")}
                                    </button>
                                    <button
                                        onClick={handleDeleteCoupon}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? t('جاري الحذف...') : t('حذف')}
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

// Generic Modal Component for Forms
function FormModal({ title, children, onClose, onSave, isLoading = false,t }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-300">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {children}
                </div>
                <div className="flex gap-3 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        {t("إلغاء")}
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                        {isLoading ? t('جاري الحفظ...') : t('حفظ')}
                    </button>
                </div>
            </div>
        </div>
    );
}
