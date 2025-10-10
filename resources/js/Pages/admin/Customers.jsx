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
    ArrowDownTrayIcon,
    DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import SendMessageModal from "./components/sendMessageModel";
import Register from "../Auth/Register";
import AddUserModel from "./components/AddUserModel";
import { useTranslation } from "react-i18next";

export default function CustomersRetailFlow() {
    const { app_url } = usePage().props;
    const { t } = useTranslation();
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [sendModal, setSendModal] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [errors, setErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [editSubscriptionValue, setEditSubscriptionValue] = useState("");
    const [editSubscription, setEditSubscription] = useState("");
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
                phone: selectedCustomer.company.phone,
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
            const response = await axios.get(`${app_url}/customers`);
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
        setEditSubscription(false);
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

    // Delete Customer
    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`${app_url}/users/${selectedCustomer.id}`);
            closeModal();
            showAllCustomers();
            setSelectedCustomer(null);
        } catch (error) {
            console.log(error);
        }
    };

    //edit subscription
    const handleEditeSubscription = async (customer) => {
        try {
            const response = await axios.post(
                `${app_url}/addSubscription/${selectedCustomer.company.id}`,
                {
                    subscription: editSubscriptionValue,
                }
            );
            closeModal();
            showAllCustomers();
            setSelectedCustomer(null);
            setEditSubscription(false);
        } catch (error) {
            console.log(error);
        }
    };

    const handleOpenModelEditSubsctiption = (customer) => {
        setSelectedCustomer(customer);
        setEditSubscriptionValue(customer.company.subscription);
        setEditSubscription(true);
    };

    // Export functions
    const handleExportPDF = async () => {
        try {
            const response = await axios.get(`${app_url}/export-users-pdf`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'تقرير_المستخدمين_' + new Date().toISOString().slice(0, 10) + '.pdf';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting PDF:', error);
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await axios.get(`${app_url}/export-users-excel`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'المستخدمين_' + new Date().toISOString().slice(0, 10) + '.xlsx';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting Excel:', error);
        }
    };

    return (
        <AdminLayout>
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        {t("العملاء")}
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
                                placeholder={t("ابحث عن عميل")}
                                className="w-60 px-3 py-2 border border-gray-300 rounded-l-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExportPDF}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                                title={t("تصدير PDF")}
                            >
                                <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />
                                PDF
                            </button>
                            <button
                                onClick={handleExportExcel}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                title={t("تصدير Excel")}
                            >
                                <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
                                Excel
                            </button>
                        </div>
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
                                    {t("#")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("الاسم")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("الرتبه")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("البريد الإلكتروني")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("الهاتف")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("نوع النظام")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("الدولة")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("اسم الشركة")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("العنوان")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("شعار الشركة")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("نوع الباقة المشترك فيها")}
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("الإجراءات")}
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("تعديل الباقة")}
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("رسائل")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {currentCustomers.filter(customer => customer.system_type !== 'manager').map((customer, idx) => (

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
                                        {customer.role}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                        {customer.email}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                        {customer.company.phone}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                        {customer.system_type}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                        {customer.country}
                                    </td>

                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                        {customer.company.company_name}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                        {customer.company.address}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                        <img
                                            src={`${app_url}/storage/${customer.company.logo}`}
                                            alt={t("logo")}
                                            className="h-8 w-10 object-cover object-center rounded"
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                        {customer.company.subscription}
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
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                handleOpenModelEditSubsctiption(
                                                    customer
                                                )
                                            }
                                            className="inline-flex items-center px-3 py-1.5 bg-primary dark:bg-primary-dark text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                                            title={t("تعديل الباقة ")}
                                        >
                                            <PaperAirplaneIcon className="h-4 w-4 ml-1" />
                                            {t("تعديل الباقة")}
                                        </button>
                                    </td>
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

                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {currentCustomers.length === 0 && (
                        <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                            {t("لا يوجد عملاء لعرضهم")}
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
                    <div className="fixed inset-0   bg-black bg-opacity-50 flex justify-end z-50">
                        <AddUserModel
                            closeModal={closeModal}
                            mode="add"
                            showAllCustomers={showAllCustomers}
                        />
                    </div>
                )}

                {/* Edit Customer Modal */}
                {editModal && (
                    <div className="fixed inset-0   bg-black bg-opacity-50 flex justify-end z-50">
                        <AddUserModel
                            closeModal={closeModal}
                            mode="edit"
                            customer={selectedCustomer}
                            showAllCustomers={showAllCustomers}
                        />
                    </div>
                )}

                {/* Delete Customer Modal */}
                {deleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("هل انت متأكد من حذف هذا العميل ؟")}
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
                {editSubscription && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("تعديل باقة الشركة المنتمى لها العميل")}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("اختر نوع الباقة")}
                                    </label>
                                    <select
                                        value={editSubscriptionValue}
                                        onChange={(e) =>
                                            setEditSubscriptionValue( e.target.value)
                                        }
                                        className="w-full px-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="basic">
                                            {t("Basic (مبتدئ)")}
                                        </option>
                                        <option value="premium">
                                            {t("Premium (مميز)")}
                                        </option>
                                        <option value="vip">
                                            {t("VIP (كبار العملاء)")}
                                        </option>
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                    >
                                        {t("إلغاء")}
                                    </button>
                                    <button
                                        onClick={handleEditeSubscription}
                                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                    >
                                        {t("تأكيد التعديل")}
                                    </button>
                                </div>
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
