    import React, { useState, useEffect } from "react";
    import AdminLayout from "./layout";
    import axios from "axios";
    import { usePage } from "@inertiajs/react";
    import {
        XMarkIcon,
        PlusIcon,
        PencilIcon,
        TrashIcon,
        PaperAirplaneIcon,
    } from "@heroicons/react/24/outline";
    import SendMessageModal from "./components/sendMessageModel";
    import { useTranslation } from "react-i18next";

    export default function CustomersRetailFlow() {
        const { t } = useTranslation();
        const { app_url } = usePage().props;
        const [selectedCustomer, setSelectedCustomer] = useState(null);
        const [addModal, setAddModal] = useState(false);
        const [editModal, setEditModal] = useState(false);
        const [deleteModal, setDeleteModal] = useState(false);
        const [sendModal, setSendModal] = useState(false);
        const [customers, setCustomers] = useState([]);
        const [errors, setErrors] = useState({});
        const [currentPage, setCurrentPage] = useState(1);
        const rowsPerPage = 10;
        const [search, setSearch] = useState("");
        const { auth } = usePage().props;
        const [newCustomer, setNewCustomer] = useState({
            name: "",
            phone: "",
            email: "",
            address: "",
        });
        const [messageForm, setMessageForm] = useState({
            phone: "",
            message: "",
        });

        const filteredCustomers = customers.filter((customer) =>
            customer.name.toLowerCase().includes(search.toLowerCase())
        );

        const handleSendMessage = async () => {
            console.log(messageForm);
            try {
                await axios.post(`${app_url}/whatsapp/send`, {
                    phone: selectedCustomer.phone,
                    message: messageForm.message,
                });
                closeModal();
                setSendModal(false);
            } catch (error) {
                console.log(error);
            }
        };

        const indexOfLastCustomer = currentPage * rowsPerPage;
        const indexOfFirstCustomer = indexOfLastCustomer - rowsPerPage;
        const currentCustomers = filteredCustomers.slice(
            indexOfFirstCustomer,
            indexOfLastCustomer
        );

        // get all customers
        const showAllCustomers = async () => {
            try {
                const response = await axios.get(`${app_url}/customerretailFlow`);
                setCustomers(response.data.customers);
            } catch (error) {
                console.log(error);
            }
        };

        useEffect(() => {
            showAllCustomers();
        }, []);

        // Open modals
        const handleAddCustomer = () => {
            setAddModal(true);
        };

        const handleEditCustomer = (customer) => {
            setSelectedCustomer(customer);
            setEditModal(true);
        };

        const handleDeleteCustomer = (customer) => {
            setSelectedCustomer(customer);
            setDeleteModal(true);
        };

        const handleSendMessageToCustomer = (customer) => {
            setSelectedCustomer(customer);
                setMessageForm({
                phone: member.phone,
                message: ""
            });
            setSendModal(true);
        };

        const closeModal = () => {
            setAddModal(false);
            setEditModal(false);
            setDeleteModal(false);
            setSendModal(false);
            setErrors({});
        };

        // Add Customer
        const handleSaveAddCustomer = async () => {
            try {
                await axios.post(`${app_url}/customerretailFlow`, newCustomer);
                closeModal();
                showAllCustomers();
                setNewCustomer({
                    name: "",
                    phone: "",
                    email: "",
                    address: "",
                });
            } catch (error) {
                setErrors(error.response?.data?.errors || {});
            }
        };

        // Edit Customer
        const handleSaveEditCustomer = async () => {
            try {
                await axios.post(
                    `${app_url}/customerretailFlow/${selectedCustomer.id}`,
                    selectedCustomer
                );
                closeModal();
                showAllCustomers();
                setSelectedCustomer(null);
            } catch (error) {
                setErrors(error.response?.data?.errors || {});
            }
        };

        // Delete Customer
        const handleDeleteConfirm = async () => {
            try {
                await axios.delete(
                    `${app_url}/customerretailFlow/${selectedCustomer.id}`
                );
                closeModal();
                showAllCustomers();
                setSelectedCustomer(null);
            } catch (error) {
                console.log(error);
            }
        };

        return (
            <AdminLayout>
                <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                    {auth.user.company.subscription === 'vip' && (
                     <div className="flex gap-2 mb-4">
                        <button
                            onClick={() =>
                                (window.location.href = `${app_url}/retailflow/export/customers/excel`)
                            }
                            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            {t("تحميل Excel")}
                        </button>
                        <button
                            onClick={() =>
                                (window.location.href = `${app_url}/retailflow/export/customers/pdf`)
                            }
                            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            {t("تحميل PDF")}
                        </button>
                    </div>
                    )}


                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                            {auth.user.system_type === "delivery"
                                ? t("السائقين")
                                : t("العملاء")}
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center">
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
                                    placeholder={
                                        auth.user.system_type === "delivery"
                                            ? t("ابحث عن سائق")
                                            : t("ابحث عن العميل")
                                    }
                                    className="w-60 px-3 py-2 border border-gray-300 rounded-l-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={handleAddCustomer}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                <PlusIcon className="h-4 w-4 mr-1.5" />
                                {auth.user.system_type === "delivery"
                                    ? t("اضافة سائق")
                                    : t("اضافة عميل")}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full table-fixed">
                            <colgroup>
                                <col className="w-16" />
                                <col className="w-1/5" />
                                <col className="w-1/5" />
                                <col className="w-1/5" />
                                <col className="w-2/5" />
                                <col className="w-32" />
                                <col className="w-40" />
                            </colgroup>
                            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("الاسم")}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("الهاتف")}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {auth.user.system_type === "delivery"
                                            ? t("رقم السيارة")
                                            : t("العنوان")}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("البريد الإلكتروني")}
                                    </th>

                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("الإجراءات")}
                                    </th>
                                    {auth.user.company.subscription==='vip' &&
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                {t("رسائل")}
                                            </th>
                                    }
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {currentCustomers.map((customer, idx) => (
                                    <tr
                                        key={customer.id}
                                        className={`transition-colors duration-200 ${
                                            idx % 2 === 0
                                                ? "bg-white dark:bg-gray-800"
                                                : "bg-gray-50 dark:bg-gray-700"
                                        } hover:bg-gray-100 dark:hover:bg-gray-600`}
                                    >
                                        <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">
                                            {idx + 1}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">
                                            {customer.name}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                            {customer.phone}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                            {customer.email}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                            {customer.address}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleEditCustomer(customer)
                                                    }
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                                                    title={t("تعديل")}
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteCustomer(
                                                            customer
                                                        )
                                                    }
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                                                    title={t("حذف")}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                         {auth.user.company.subscription==='vip' &&
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() =>
                                                    handleSendMessageToCustomer(
                                                        customer
                                                    )
                                                }
                                                className="inline-flex items-center px-3 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm"
                                                title={t("إرسال رسالة")}
                                            >
                                                <PaperAirplaneIcon className="h-4 w-4 ml-1" />
                                                {t("إرسال")}
                                            </button>
                                        </td>
                                         }
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {currentCustomers.length === 0 && (
                            <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                                {auth.system_type === "delivery"
                                    ? t("لا يوجد سائقين لعرضهم")
                                    : t("لا يوجد عملاء لعرضهم")}
                            </p>
                        )}

                        {filteredCustomers.length > rowsPerPage && (
                            <div className="flex justify-between items-center mt-4">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {t("السابق")}
                                </button>
                                <span className="text-gray-700 dark:text-gray-300">
                                    {t("صفحة")} {currentPage} {t("من")}{" "}
                                    {Math.ceil(
                                        filteredCustomers.length / rowsPerPage
                                    )}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={
                                        currentPage ===
                                        Math.ceil(
                                            filteredCustomers.length / rowsPerPage
                                        )
                                    }
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {t("التالي")}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Add Customer Modal */}
                    {addModal && (
                        <CustomerModal
                            title={
                                auth.user.system_type === "delivery"
                                    ? t("اضافة سائق")
                                    : t("اضافة عميل")
                            }
                            customer={newCustomer}
                            setCustomer={setNewCustomer}
                            handleSave={handleSaveAddCustomer}
                            closeModal={closeModal}
                            errors={errors}
                            auth={auth}
                        />
                    )}

                    {/* Edit Customer Modal */}
                    {editModal && (
                        <CustomerModal
                            title={
                                auth.user.system_type === "delivery"
                                    ? t("تعديل بيانات السائق")
                                    : t("تعديل بيانات العميل")
                            }
                            customer={selectedCustomer}
                            setCustomer={setSelectedCustomer}
                            handleSave={handleSaveEditCustomer}
                            closeModal={closeModal}
                            errors={errors}
                            auth={auth}
                        />
                    )}

                    {/* Delete Customer Modal */}
                    {deleteModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                        {auth.user.system_type === "delivery"
                                            ? t("هل انت متأكد من حذف هذا السائق ؟")
                                            : t("هل انت متأكد من حذف هذا العميل ؟")}{" "}
                                    </h3>
                                    <button
                                        onClick={closeModal}
                                        className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>
                                <div className="p-6 flex gap-3">
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
                    )}

                    {/* Send Message Modal */}
                    {sendModal && (
                        <SendMessageModal
                            messageForm={messageForm}
                            setMessageForm={setMessageForm}
                            customer={selectedCustomer}
                            closeModal={closeModal}
                            handleSendMessage={handleSendMessage}

                        />
                    )}
                </div>
            </AdminLayout>
        );
    }

    // Modal Component
    function CustomerModal({
        title,
        customer,
        setCustomer,
        handleSave,
        closeModal,
        errors,
        auth
    }) {
        const { t } = useTranslation();
        const fieldLabels = {
            name: t("الاسم"),
            phone: t("الهاتف"),
            email: t("البريد الإلكتروني"),
            address:auth.user.system_type === "delivery"
                                    ? t("رقم السيارة")
                                    : t("العنوان"),
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
                <div className="bg-white dark:bg-gray-800 overflow-y-auto h-full shadow-2xl max-w-md w-full p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            {title}
                        </h3>
                        <button
                            onClick={closeModal}
                            className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {["name", "phone","address", "email" ].map((field, i) => (
                        <div key={i}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {fieldLabels[field]}
                            </label>
                            <input
                                type="text"
                                value={customer[field]}
                                onChange={(e) =>
                                    setCustomer({
                                        ...customer,
                                        [field]: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    ))}

                    {errors &&
                        Object.entries(errors).map(([field, msgs], i) => (
                            <div
                                key={i}
                                className="bg-red-100 text-red-700 p-2 rounded mb-1 text-sm"
                            >
                                {msgs.map((msg, j) => (
                                    <p key={j}>{msg}</p>
                                ))}
                            </div>
                        ))}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={closeModal}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            {t("إلغاء")}
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            {t("حفظ")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
