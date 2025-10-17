import React, { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import AdminLayout from "./layout";
import axios from "axios";
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export default function RentsRetailFlow() {
    const { app_url, auth } = usePage().props;
    const { t } = useTranslation();
    const [rents, setRents] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [printModal, setPrintModal] = useState(false);
    const [selectedRent, setSelectedRent] = useState(null);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        customer_id: "",
        start_date: "",
        end_date: "",
        monthly_rent: "",
        paid_amount: "",
        subscription_type: "",
    });

    const resetForm = () => {
        setForm({
            customer_id: "",
            start_date: "",
            end_date: "",
            monthly_rent: "",
            paid_amount: "",
            subscription_type: "",
        });
        setErrors({});
    };

    const showAllCustomers = async () => {
        try {
            const response = await axios.get(`${app_url}/customerretailFlow`);
            setCustomers(response.data.customers || []);
        } catch (error) {
            console.log(error);
        }
    };

    const showAllRents = async () => {
        try {
            const response = await axios.get(`${app_url}/rentsretailFlow`);
            setRents(response.data.data || response.data.rents || []);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        showAllCustomers();
        showAllRents();
    }, []);

    const filteredRents = rents.filter((rent) =>
        (rent.customer?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (rent.id ? String(rent.id).includes(search) : false)
    );

    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;
    const currentRents = filteredRents.slice(indexOfFirstItem, indexOfLastItem);

    const openAdd = () => {
        resetForm();
        setAddModal(true);
    };

    const openEdit = (rent) => {
        setSelectedRent(rent);
        setForm({
            customer_id: rent.customer_id || "",
            start_date: rent.start_date || "",
            end_date: rent.end_date || "",
            monthly_rent: rent.monthly_rent || "",
            paid_amount: rent.paid_amount || "",
            subscription_type: rent.subscription_type || "",
        });
        setEditModal(true);
    };

    const openDelete = (rent) => {
        setSelectedRent(rent);
        setDeleteModal(true);
    };

    const handlePrintInvoice = (rent) => {
        setSelectedRent(rent);
        setPrintModal(true);
    };

    const closeModals = () => {
        setAddModal(false);
        setEditModal(false);
        setDeleteModal(false);
        setPrintModal(false);
        setSelectedRent(null);
        setErrors({});
    };

    const handleSaveAdd = async () => {
        try {
            await axios.post(`${app_url}/rentsretailFlow`, form, {
                headers: { "Content-Type": "application/json" },
            });
            closeModals();
            resetForm();
            showAllRents();
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
        }
    };

    const handleSaveEdit = async () => {
        try {
            await axios.post(`${app_url}/rentsretailFlow/${selectedRent.id}`, form, {
                headers: { "Content-Type": "application/json" },
            });
            closeModals();
            showAllRents();
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`${app_url}/rentsretailFlow/${selectedRent.id}`);
            closeModals();
            showAllRents();
        } catch (error) {
            console.log(error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString("ar-EG", options);
    };

    const isGym = auth.user.system_type === 'gym';
    const pageTitle = isGym ? t("الاشتراكات") : t("الإيجارات");
    const addButtonText = isGym ? t("إضافة اشتراك") : t("إضافة إيجار");
    const contractNumberText = isGym ? t("رقم الاشتراك") : t("رقم الإيجار");
    const contractText = isGym ? t("اشتراك") : t("عقد");

    return (
        <AdminLayout>
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                {auth.user.company.subscription === 'vip' && (
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => (window.location.href = `${app_url}/retailflow/export/rents/excel`)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {t("تصدير Excel")}
                    </button>
                    <button
                        onClick={() => (window.location.href = `${app_url}/retailflow/export/rents/pdf`)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {t("تصدير PDF")}
                    </button>
                </div>
                )}

                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{pageTitle}</h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center ">
                            <button
                                onClick={() => setCurrentPage(1)}
                                className="px-4 py-2 bg-primary text-white rounded-r-lg hover:bg-primary-dark transition-colors"
                            >
                                {t("بحث")}
                            </button>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={isGym ? t("ابحث باسم العميل (المشترك) أو رقم الاشتراك...") : t("ابحث باسم العميل (المستأجر) أو رقم العقد...")}
                                className="w-60 px-3 py-2 border border-gray-300 rounded-l-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={openAdd}
                            className="inline-flex left-0 items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <PlusIcon className="h-4 w-4 mr-1.5" />
                            {addButtonText}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full table-fixed">
                        <colgroup>
                            <col className="w-12" />
                            <col className="w-1/6" />
                            <col className="w-1/6" />
                            <col className="w-1/6" />
                            <col className="w-1/6" />
                            <col className="w-40" />
                        </colgroup>
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">#</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {contractNumberText}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {isGym ? t("العميل (المشترك)") : t("العميل (المستأجر)")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {isGym ? t("قيمة الاشتراك الشهري") : t("قيمة الإيجار الشهري")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("تاريخ بداية")} {contractText}</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("تاريخ نهاية")} {contractText}</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("المبلغ المدفوع")}</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("نوع الاشتراك")}</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("الإجراءات")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {currentRents.map((rent, idx) => (
                                <tr key={rent.id || idx} className={`transition-colors duration-200 ${idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"} hover:bg-gray-100 dark:hover:bg-gray-600`}>
                                    <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{idx + 1}</td>
                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">#{indexOfFirstItem + idx + 1}</td>
                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">{rent.customer?.name || "-"}</td>
                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">{Number(rent.monthly_rent || 0).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">{formatDate(rent.start_date)}</td>
                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">{formatDate(rent.end_date)}</td>
                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">{Number(rent.paid_amount || 0).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">
                                        {rent.subscription_type === 'monthly' ? t("شهري") :
                                         rent.subscription_type === 'yearly' ? t("سنوي") : "-"}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 text-center">
                                        <div className="flex justify-center space-x-2">
                                            <button onClick={() => openEdit(rent)} className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900 rounded-lg transition-colors" title={`${t("تعديل")} ${contractText}`}>
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => openDelete(rent)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors" title={`${t("حذف")} ${contractText}`}>
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handlePrintInvoice(rent)}
                                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                                                title={t("طباعة الفاتورة")}
                                            >
                                                <PrinterIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredRents.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t("لا توجد")} {isGym ? t("اشتراكات") : t("عقود")} {t("لعرضها")}</div>
                    )}

                    {filteredRents.length > rowsPerPage && (
                        <div className="flex justify-between items-center mt-4">
                            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">{t("السابق")}</button>
                            <span className="text-gray-700 dark:text-gray-300">{t("صفحة")} {currentPage} {t("من")} {Math.ceil(filteredRents.length / rowsPerPage)}</span>
                            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === Math.ceil(filteredRents.length / rowsPerPage)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">{t("التالي")}</button>
                        </div>
                    )}
                </div>

                {addModal && (
                    <RentModal
                        title={isGym ? t("إضافة اشتراك جديد") : t("إضافة عقد إيجار")}
                        customers={customers}
                        form={form}
                        setForm={setForm}
                        errors={errors}
                        onClose={closeModals}
                        onSave={handleSaveAdd}
                        isGym={isGym}
                        t={t}
                    />
                )}
                {editModal && selectedRent && (
                    <RentModal
                        title={isGym ? `${t("تعديل الاشتراك")} #${selectedRent.id}` : `${t("تعديل العقد")} #${selectedRent.id}`}
                        customers={customers}
                        form={form}
                        setForm={setForm}
                        errors={errors}
                        onClose={closeModals}
                        onSave={handleSaveEdit}
                        isGym={isGym}
                        t={t}
                    />
                )}
                {deleteModal && selectedRent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-background-card rounded-xl shadow-2xl max-w-md w-full">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {isGym ? `${t("هل أنت متأكد من حذف الاشتراك")} #${selectedRent.id}؟` : `${t("هل أنت متأكد من حذف العقد")} #${selectedRent.id}؟`}
                                </h3>
                                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 dark:text-gray-300">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {isGym ? t("سيتم حذف هذا الاشتراك بشكل دائم ولا يمكن التراجع عن هذه العملية.") : t("سيتم حذف هذا العقد بشكل دائم ولا يمكن التراجع عن هذه العملية.")}
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={closeModals} className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">{t("إلغاء")}</button>
                                    <button onClick={handleDeleteConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">{t("حذف")}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Print Modal */}
{printModal && selectedRent && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:bg-white print:inset-0 print:opacity-100">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full print:shadow-none print:rounded-none print:max-w-none print:w-full">

            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 print:hidden">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {isGym ? t("إيصال اشتراك") : t("إيصال إيجار")}
                </h3>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 dark:text-gray-300">
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>

            <div className="p-6 print:p-8">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isGym ? t("إيصال اشتراك") : t("إيصال إيجار")}
                    </h1>

                    <p className="text-gray-600">{new Date().toLocaleDateString('ar-EG')}</p>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                        <span className="font-semibold">{isGym ? t("المشترك") : t("المستأجر")}:</span>
                        <span>{selectedRent.customer?.name || t('غير محدد')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold">{isGym ? t("قيمة الاشتراك") : t("قيمة الإيجار")}:</span>
                        <span>{Number(selectedRent.monthly_rent || 0).toFixed(2)} {t("ج.م")}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold">{t("المبلغ المدفوع")}:</span>
                        <span>{Number(selectedRent.paid_amount || 0).toFixed(2)} {t("ج.م")}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold">{t("المبلغ المتبقي")}:</span>
                        <span>{Number((selectedRent.monthly_rent || 0) - (selectedRent.paid_amount || 0)).toFixed(2)} {t("ج.م")}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold">{t("نوع الاشتراك")}:</span>
                        <span>
                            {selectedRent.subscription_type === 'monthly' ? t("شهري") :
                             selectedRent.subscription_type === 'yearly' ? t("سنوي") : t("غير محدد")}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold">{t("الفترة من")}:</span>
                        <span>{formatDate(selectedRent.start_date)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold">{t("إلى")}:</span>
                        <span>{formatDate(selectedRent.end_date)}</span>
                    </div>
                </div>

                <div className="border-t pt-4 mt-6">
                    <div className="flex justify-between font-bold text-lg">
                        <span>{t("الإجمالي")}:</span>
                        <span>{Number(selectedRent.monthly_rent || 0).toFixed(2)} {t("ج.م")}</span>
                    </div>
                </div>


                <div className="mt-8 text-center print:hidden">
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-primary text-white rounded-lg flex items-center justify-center mx-auto hover:bg-primary-dark transition-colors"
                    >
                        <PrinterIcon className="h-4 w-4 ml-2" />
                        {t("طباعة")}
                    </button>
                </div>

            
                <div className="hidden print:block mt-12 pt-4 border-t border-gray-300 text-center">
                    <div className="flex justify-center items-center gap-3 mb-2">
                        <p className="text-gray-600">{t("شكراً لتعاملكم معنا")}</p>
                        <p className="text-gray-600">{auth.user?.company?.company_name}</p>
                    </div>
                    <div className="flex justify-center items-center gap-3">
                        {(auth.user.company.subscription === "basic" || auth.user.company.subscription === "premium") && (
                            <img src={`${app_url}/favicon-v2.ico`} alt="logo" className="w-6 h-6 rounded-lg" />
                        )}
                        <p className="text-gray-500 text-xs">
                            {(auth.user.company.subscription === "basic" || auth.user.company.subscription === "premium") && (
                                t("سيستمى نظام متكامل لادارة الانشطة التجارية")
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
)}
            </div>
        </AdminLayout>
    );
}


function RentModal({ title, customers, form, setForm, errors, onClose, onSave, isGym, t }) {
    const [customerSearch, setCustomerSearch] = useState("");
    const [showCustomerList, setShowCustomerList] = useState(false);

    useEffect(() => {
        if (form.customer_id) {
            const customer = customers.find(c => c.id === form.customer_id);
            if (customer) {
                setCustomerSearch(customer.name);
            }
        } else {
            setCustomerSearch("");
        }
    }, [form.customer_id, customers]);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase())
    );

    const handleCustomerSelect = (customer) => {
        setForm({ ...form, customer_id: customer.id });
        setCustomerSearch(customer.name);
        setShowCustomerList(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-background-card rounded-xl shadow-2xl max-w-2xl w-full" onMouseLeave={() => setShowCustomerList(false)}>
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-300">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {isGym ? t("العميل (المشترك)") : t("العميل (المستأجر)")}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={customerSearch}
                                onChange={(e) => {
                                    setCustomerSearch(e.target.value);
                                    setShowCustomerList(true);
                                    if (form.customer_id) {
                                        const currentCustomer = customers.find(c => c.id === form.customer_id);
                                        if (currentCustomer && e.target.value !== currentCustomer.name) {
                                            setForm({ ...form, customer_id: "" });
                                        }
                                    }
                                }}
                                onFocus={() => setShowCustomerList(true)}
                                placeholder={isGym ? t("ابحث عن مشترك...") : t("ابحث عن مستأجر...")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            {showCustomerList && (
                                <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto">
                                    {filteredCustomers.map((c) => (
                                        <div
                                            key={c.id}
                                            onClick={() => handleCustomerSelect(c)}
                                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                                        >
                                            {c.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {errors.customer_id && <p className="text-red-600 text-sm mt-1">{errors.customer_id}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {isGym ? t("تاريخ بداية الاشتراك") : t("تاريخ بداية العقد")}
                            </label>
                            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                            {errors.start_date && <p className="text-red-600 text-sm mt-1">{errors.start_date}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {isGym ? t("تاريخ نهاية الاشتراك") : t("تاريخ نهاية العقد")}
                            </label>
                            <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                            {errors.end_date && <p className="text-red-600 text-sm mt-1">{errors.end_date}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {isGym ? t("قيمة الاشتراك ") : t("قيمة الإيجار ")}
                            </label>
                            <input type="number" step="0.01" value={form.monthly_rent} onChange={(e) => setForm({ ...form, monthly_rent: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                            {errors.monthly_rent && <p className="text-red-600 text-sm mt-1">{errors.monthly_rent}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t("المبلغ المدفوع")}
                            </label>
                            <input type="number" step="0.01" value={form.paid_amount} onChange={(e) => setForm({ ...form, paid_amount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                            {errors.paid_amount && <p className="text-red-600 text-sm mt-1">{errors.paid_amount}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm  font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t("نوع الاشتراك")}
                        </label>
                        <select
                            value={form.subscription_type}
                            onChange={(e) => setForm({ ...form, subscription_type: e.target.value })}
                            className="w-full px-8 py-2  border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">{t("اختر نوع الاشتراك")}</option>
                            <option value="monthly">{t("شهري")}</option>
                            <option value="yearly">{t("سنوي")}</option>
                        </select>
                        {errors.subscription_type && <p className="text-red-600 text-sm mt-1">{errors.subscription_type}</p>}
                    </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">{t("إلغاء")}</button>
                    <button onClick={onSave} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">{t("حفظ")}</button>
                </div>
            </div>
        </div>
    );
}
