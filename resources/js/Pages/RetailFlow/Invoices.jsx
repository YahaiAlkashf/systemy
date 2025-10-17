import React, { useState, useEffect, useContext } from "react";
import AdminLayout from "./layout";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import {
    XMarkIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    PrinterIcon,
    ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import InvoiceModal from "./components/InvoiceModel";
import { CurrencyContext } from "../../Context/CurrencyContext ";
import { useTranslation } from "react-i18next";

export default function InvoicesRetailFlow() {
    const { t } = useTranslation();
    const { app_url, auth } = usePage().props;
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [printModal, setPrintModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [errors, setErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [customers, setCustomers] = useState([]);
    const [customerSearch, setCustomerSearch] = useState("");
    const [productSearch, setProductSearch] = useState("");
    const rowsPerPage = 10;
    const rowSearch = 4;
    const [search, setSearch] = useState("");
    const [currentProducts, setCurrentProducts] = useState([]);
    const [currentCustomers, setCurrentCustomers] = useState([]);
    const [newInvoice, setNewInvoice] = useState({
        customer_id: "",
        paid_amount: 0,
        name: "",
        total: 0,
        total_profit: 0,
        products: [],
        quantities: [],
        prices: [],
    });
    const { currency } = useContext(CurrencyContext);

    const searchInProduct = () => {
        const filteredProducts = products.filter((product) =>
            product.name.toLowerCase().includes(productSearch.toLowerCase())
        );
        const indexOfLastProduct = currentPage * rowSearch;
        const indexOfFirstProduct = indexOfLastProduct - rowSearch;
        setCurrentProducts(
            filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
        );
    };

    const searchInCustomer = () => {
        const filteredCustomers = customers.filter((customer) =>
            customer.name.toLowerCase().includes(customerSearch.toLowerCase())
        );

        const indexOfLastCustomer = currentPage * rowSearch;
        const indexOfFirstCustomer = indexOfLastCustomer - rowSearch;
        setCurrentCustomers(
            filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer)
        );
    };

    // get all products
    const showAllProducts = async () => {
        try {
            const response = await axios.get(`${app_url}/productretailFlow`);
            setProducts(response.data.products);
        } catch (error) {
            console.log(error);
        }
    };

    const showAllCustomers = async () => {
        try {
            const response = await axios.get(`${app_url}/customerretailFlow`);
            setCustomers(response.data.customers);
        } catch (error) {
            console.log(error);
        }
    };

    const showAllInvoices = async () => {
        try {
            const response = await axios.get(`${app_url}/invoiceretailFlow`);
            setInvoices(response.data.data || response.data.invoices || []);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        showAllProducts();
        showAllCustomers();
        showAllInvoices();
    }, []);

    // Open modals
    const handleAddInvoice = () => {
        setAddModal(true);
    };

    const handleEditInvoice = (invoice) => {
        const editInvoice = {
            ...invoice,
            name: invoice.customer?.name || "",
            products: invoice.items?.map((item) => item.product_id) || [],
            quantities: invoice.items?.map((item) => item.quantity) || [],
            prices: invoice.items?.map((item) => item.price) || [],
        };

        setSelectedInvoice(editInvoice);
        setEditModal(true);
    };

    const handleDeleteInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setDeleteModal(true);
    };

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setViewModal(true);
    };

    const handlePrintInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setPrintModal(true);
        setTimeout(() => {
            window.print();
        }, 500);
    };

    const closeModal = () => {
        setAddModal(false);
        setEditModal(false);
        setDeleteModal(false);
        setViewModal(false);
        setPrintModal(false);
        setSelectedInvoice(null);
        setErrors({});
    };

    const calculateTotalProfit = (invoiceData) => {
        let totalProfit = 0;

        invoiceData.products.forEach((productId, index) => {
            const product = products.find((p) => p.id === productId);
            if (product) {
                let productProfit = 0;
                const quantity = Number(invoiceData.quantities[index]) || 1;
                const price = Number(invoiceData.prices[index]) || 0;

                if (auth.user.system_type === "delivery") {
                    productProfit = price - (product.additional_costs || 0);
                } else if (["services", "education", "travels"].includes(auth.user.system_type)) {
                    productProfit = price - (product.wholesale_price || 0) - (product.additional_costs || 0);
                } else {
                    productProfit = price - (product.wholesale_price || 0) - (product.additional_costs || 0);
                }

                totalProfit += productProfit * quantity;
            }
        });

        return totalProfit;
    };

    // Add invoice
    const handleSaveAddInvoice = async () => {
        try {
            const calculatedTotal = newInvoice.prices.reduce((total, price, index) => {
                const quantity = Number(newInvoice.quantities[index]) || 1;
                return total + (Number(price) * quantity);
            }, 0);

            const calculatedTotalProfit = calculateTotalProfit(newInvoice);

            await axios.post(
                `${app_url}/invoiceretailFlow`,
                {
                    customer_id: newInvoice.customer_id,
                    paid_amount: Number(newInvoice.paid_amount) || 0,
                    name: newInvoice.name,
                    total: calculatedTotal,
                    total_profit: calculatedTotalProfit,
                    products: newInvoice.products,
                    quantities: newInvoice.quantities.map(q => Number(q) || 1),
                    prices: newInvoice.prices.map(p => Number(p) || 0),
                },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            closeModal();
            setNewInvoice({
                customer_id: "",
                paid_amount: 0,
                name: "",
                total: 0,
                total_profit: 0,
                products: [],
                quantities: [],
                prices: [],
            });
            showAllInvoices();
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
        }
    };

    const addProductToInvoice = (product, isEditMode = false) => {
        const targetInvoice = isEditMode ? selectedInvoice : newInvoice;
        const setTargetInvoice = isEditMode ? setSelectedInvoice : setNewInvoice;

        if (!targetInvoice.products.includes(product.id)) {
            let productProfit = 0;
            const price = Number(product.price) || 0;

            if (auth.user.system_type === "delivery") {
                productProfit = price - (product.additional_costs || 0);
            } else {
                productProfit = price - (product.wholesale_price || 0) - (product.additional_costs || 0);
            }

            setTargetInvoice({
                ...targetInvoice,
                products: [...targetInvoice.products, product.id],
                quantities: [...targetInvoice.quantities, 1],
                prices: [...targetInvoice.prices, price],
                total: Number(targetInvoice.total || 0) + price,
                total_profit: Number(targetInvoice.total_profit || 0) + productProfit,
            });
        }
    };

    // Edit Invoice
    const handleSaveEditInvoice = async () => {
        try {
            const calculatedTotal = selectedInvoice.prices.reduce((total, price, index) => {
                const quantity = Number(selectedInvoice.quantities[index]) || 1;
                return total + (Number(price) * quantity);
            }, 0);

            const calculatedTotalProfit = calculateTotalProfit(selectedInvoice);

            await axios.post(
                `${app_url}/invoiceretailFlow/${selectedInvoice.id}`,
                {
                    ...selectedInvoice,
                    total: calculatedTotal,
                    total_profit: calculatedTotalProfit,
                    paid_amount: Number(selectedInvoice.paid_amount) || 0,
                    quantities: selectedInvoice.quantities.map(q => Number(q) || 1),
                    prices: selectedInvoice.prices.map(p => Number(p) || 0),
                },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            closeModal();
            showAllInvoices();
            setSelectedInvoice(null);
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
        }
    };

    // Delete Invoice
    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(
                `${app_url}/invoiceretailFlow/${selectedInvoice.id}`
            );
            closeModal();
            showAllInvoices();
            setSelectedInvoice(null);
        } catch (error) {
            console.log(error);
        }
    };

    const filteredInvoices = invoices.filter(
        (invoice) =>
            invoice.customer?.name
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            invoice.id.toString().includes(search)
    );

    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;
    const currentInvoices = filteredInvoices.slice(
        indexOfFirstItem,
        indexOfLastItem
    );

    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "short", day: "numeric" };
        return new Date(dateString).toLocaleDateString("ar-EG", options);
    };

    const removeProductFromInvoice = (index, isEditMode = false) => {
        const targetInvoice = isEditMode ? selectedInvoice : newInvoice;
        const setTargetInvoice = isEditMode
            ? setSelectedInvoice
            : setNewInvoice;

        const productId = targetInvoice.products[index];
        const product = products.find((p) => p.id === productId);
        const price = Number(targetInvoice.prices[index]) || 0;
        const quantity = Number(targetInvoice.quantities[index]) || 1;

        let productProfit = 0;
        if (product) {
            if (auth.user.system_type === "delivery") {
                productProfit = price - (product.additional_costs || 0);
            } else {
                productProfit = price - (product.wholesale_price || 0) - (product.additional_costs || 0);
            }
        }

        const updatedProducts = targetInvoice.products.filter(
            (_, i) => i !== index
        );
        const updatedQuantities = targetInvoice.quantities.filter(
            (_, i) => i !== index
        );
        const updatedPrices = targetInvoice.prices.filter(
            (_, i) => i !== index
        );

        const updatedTotal = updatedPrices.reduce(
            (acc, price, i) => acc + (Number(price) * (Number(updatedQuantities[i]) || 1)),
            0
        );

        const updatedProfit = Number(targetInvoice.total_profit || 0) - (productProfit * quantity);

        setTargetInvoice({
            ...targetInvoice,
            products: updatedProducts,
            quantities: updatedQuantities,
            prices: updatedPrices,
            total: updatedTotal,
            total_profit: updatedProfit,
        });
    };

    const updateProductQuantity = (index, newQuantity, isEditMode = false) => {
        const targetInvoice = isEditMode ? selectedInvoice : newInvoice;
        const setTargetInvoice = isEditMode
            ? setSelectedInvoice
            : setNewInvoice;

        const quantity = Number(newQuantity) || 1;
        const oldQuantity = Number(targetInvoice.quantities[index]) || 1;

        const updatedQuantities = [...targetInvoice.quantities];
        updatedQuantities[index] = quantity;

        const updatedTotal = targetInvoice.prices.reduce(
            (acc, price, i) => acc + (Number(price) * (Number(updatedQuantities[i]) || 1)),
            0
        );

        setTargetInvoice({
            ...targetInvoice,
            quantities: updatedQuantities,
            total: updatedTotal,
        });
    };

    return (
        <AdminLayout>

            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                {(auth.user.company.subscription==='vip')&& (
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() =>
                                (window.location.href = `${app_url}/retailflow/export/invoices/excel`)
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
                            {t("تصدير Excel")}
                        </button>
                        <button
                            onClick={() =>
                                (window.location.href = `${app_url}/retailflow/export/invoices/pdf`)
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
                            {t("تصدير PDF")}
                        </button>
                    </div>
                )}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        {t("الفواتير")}
                    </h3>
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
                                placeholder={t("ابحث باسم العميل أو رقم الفاتورة...")}
                                className="w-60 px-3 py-2 border border-gray-300 rounded-l-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={handleAddInvoice}
                            className="inline-flex left-0 items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <PlusIcon className="h-4 w-4 mr-1.5" />
                            {t("إضافة فاتورة")}
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
                            <col className="w-1/6" />
                            <col className="w-1/6" />
                            <col className="w-40" />
                        </colgroup>
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    #
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("رقم الفاتورة")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {auth.user.system_type === "delivery"
                                        ? t("السائق")
                                        : t("العميل")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("الإجمالي")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("صافى الارباح")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("المدفوع")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("التاريخ")}
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("الإجراءات")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {currentInvoices.map((invoice, idx) => (
                                <tr
                                    key={invoice.id}
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
                                        #{indexOfFirstItem + idx + 1}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">
                                        {invoice.customer?.name || t("عميل نقدي")}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex gap-1 justify-center items-center px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                                            <div>{invoice.total || 0}</div>
                                            <div>{currency}</div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        <div className="flex gap-1 justify-center items-center px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                                            <div>
                                                {invoice.total_profit || 0}
                                            </div>
                                            <div>{currency}</div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        <div className="flex gap-1 justify-center items-center px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                                            <div>{invoice.paid_amount || 0}</div>
                                            <div>{currency}</div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                        {formatDate(invoice.created_at)}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 text-center">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() =>
                                                    handleViewInvoice(invoice)
                                                }
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                                                title={t("عرض الفاتورة")}
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handlePrintInvoice(invoice)
                                                }
                                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                                                title={t("طباعة الفاتورة")}
                                            >
                                                <PrinterIcon className="h-4 w-4" />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleEditInvoice(invoice)
                                                }
                                                className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900 rounded-lg transition-colors"
                                                title={t("تعديل الفاتورة")}
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteInvoice(invoice)
                                                }
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                                                title={t("حذف الفاتورة")}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredInvoices.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            {t("لا توجد فواتير لعرضها")}
                        </div>
                    )}

                    {filteredInvoices.length > rowsPerPage && (
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
                                    filteredInvoices.length / rowsPerPage
                                )}
                            </span>
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={
                                    currentPage ===
                                    Math.ceil(
                                        filteredInvoices.length / rowsPerPage
                                    )
                                }
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                {t("التالي")}
                            </button>
                        </div>
                    )}
                </div>
                {/* Add Invoice Modal */}
                {addModal && (
                    <InvoiceModal
                        title={t("إضافة فاتورة")}
                        products={products}
                        handleSave={handleSaveAddInvoice}
                        closeModal={closeModal}
                        errors={errors}
                        productSearch={productSearch}
                        setProductSearch={setProductSearch}
                        customerSearch={customerSearch}
                        setCustomerSearch={setCustomerSearch}
                        currentProducts={currentProducts}
                        currentCustomers={currentCustomers}
                        searchInCustomer={searchInCustomer}
                        searchInProduct={searchInProduct}
                        invoiceData={newInvoice}
                        setInvoiceData={setNewInvoice}
                        addProductToInvoice={addProductToInvoice}
                        removeProductFromInvoice={removeProductFromInvoice}
                        updateProductQuantity={updateProductQuantity}
                    />
                )}
                {/* Edit Invoice Modal */}
                {editModal && selectedInvoice && (
                    <InvoiceModal
                        title={`${t("تعديل الفاتورة")} #${selectedInvoice.id}`}
                        products={products}
                        handleSave={handleSaveEditInvoice}
                        closeModal={closeModal}
                        errors={errors}
                        productSearch={productSearch}
                        setProductSearch={setProductSearch}
                        customerSearch={customerSearch}
                        setCustomerSearch={setCustomerSearch}
                        currentProducts={currentProducts}
                        currentCustomers={currentCustomers}
                        searchInCustomer={searchInCustomer}
                        searchInProduct={searchInProduct}
                        invoiceData={selectedInvoice}
                        setInvoiceData={setSelectedInvoice}
                        addProductToInvoice={(product) =>
                            addProductToInvoice(product, true)
                        }
                        removeProductFromInvoice={(index) =>
                            removeProductFromInvoice(index, true)
                        }
                        updateProductQuantity={(index, quantity) =>
                            updateProductQuantity(index, quantity, true)
                        }
                        isEditMode={true}
                    />
                )}
                {/* Delete Invoice Modal */}
                {deleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-background-card rounded-xl shadow-2xl max-w-md w-full">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("هل أنت متأكد من حذف الفاتورة #")}
                                    {selectedInvoice.id}؟
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {t("سيتم حذف هذه الفاتورة بشكل دائم ولا يمكن التراجع عن هذه العملية.")}
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
                {viewModal && selectedInvoice && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-background-card rounded-xl shadow-2xl max-w-2xl w-full">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("فاتورة")}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                                            {auth.user.system_type === "delivery"
                                                ? t("السائق ")
                                                : t("العميل")}
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {selectedInvoice.customer?.name ||
                                                t("عميل نقدي")}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                                            {t("التاريخ")}
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {formatDate(
                                                selectedInvoice.created_at
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                                            {t("الحالة")}
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {selectedInvoice.paid_amount === 0
                                                ? t("غير مدفوعة")
                                                : selectedInvoice.paid_amount <
                                                  selectedInvoice.total
                                                ? t("مدفوعة جزئياً")
                                                : t("مدفوعة بالكامل")}
                                        </p>
                                    </div>

                                </div>

                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {auth.user.system_type ===
                                                    "services"
                                                        ? t("اسم الخدمة")
                                                        : auth.user
                                                              .system_type ===
                                                          "education"
                                                        ? t("اسم الدوره")
                                                        : auth.user
                                                              .system_type ===
                                                          "realEstate"
                                                        ? t("اسم العقار")
                                                        : auth.user
                                                              .system_type ===
                                                          "delivery"
                                                        ? t("اسم الطلب")
                                                        : auth.user
                                                              .system_type ===
                                                          "travels"
                                                        ? t("اسم الرحلة")
                                                        : t("اسم المنتج")}
                                                </th>
                                                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {auth.user.system_type ===
                                                    "services"
                                                        ? ""
                                                        : auth.user
                                                              .system_type ===
                                                          "education"
                                                        ? ""
                                                        : auth.user
                                                              .system_type ===
                                                          "realEstate"
                                                        ? ""
                                                        : auth.user
                                                              .system_type ===
                                                          "delivery"
                                                        ? t("حالة الطلب")
                                                        : auth.user
                                                              .system_type ===
                                                          "travels"
                                                        ? ""
                                                        : t("الكمية")}
                                                </th>
                                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {t("السعر")}
                                                </th>
                                                {auth.user.system_type==="delivery" ? (
                                                 <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {t("اسم صاحب الطلب")}
                                                </th>):(
                                               <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {t("الفئة")}
                                                </th>
                                                )}
                                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {t("السعر الكلي")}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {selectedInvoice.items?.map(
                                                (item, index) => (
                                                    <tr
                                                        key={index}
                                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    >
                                                        <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-200">
                                                            {item.product?.name}
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                                                            {auth.user
                                                                .system_type ===
                                                            "services"
                                                                ? ""
                                                                : auth.user
                                                                      .system_type ===
                                                                  "education"
                                                                ? ""
                                                                : auth.user
                                                                      .system_type ===
                                                                  "realEstate"
                                                                ? ""
                                                                : auth.user
                                                                      .system_type ===
                                                                  "delivery"
                                                                ? item.quantity
                                                                : auth.user
                                                                      .system_type ===
                                                                  "travels"
                                                                ? ""
                                                                : item.quantity}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                                                            {item.price}{" "}
                                                            {currency}
                                                        </td>
                                                       <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                                                            {item.product.category}{" "}

                                                        </td>
                                                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                                                            {item.quantity *
                                                                item.price}{" "}
                                                            {currency}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                        <tfoot className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <td
                                                    colSpan="3"
                                                    className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-200"
                                                >
                                                    {t("الإجمالي")}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-primary dark:text-primary-dark">
                                                    {selectedInvoice.total}{" "}
                                                    {currency}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    colSpan="3"
                                                    className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-200"
                                                >
                                                    {t("المدفوع")}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                                                    {
                                                        selectedInvoice.paid_amount
                                                    }{" "}
                                                    {currency}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    colSpan="3"
                                                    className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-200"
                                                >
                                                    {t("المتبقي")}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-red-600 dark:text-red-400">
                                                    {selectedInvoice.total -
                                                        selectedInvoice.paid_amount}{" "}
                                                    {currency}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={closeModal}
                                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        {t("إغلاق")}
                                    </button>
                                    <button
                                        onClick={() =>
                                            handlePrintInvoice(selectedInvoice)
                                        }
                                        className="px-4 py-2 bg-primary text-white rounded-lg flex items-center hover:bg-primary-dark transition-colors"
                                    >
                                        <PrinterIcon className="h-4 w-4 ml-2" />
                                        {t("طباعة")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {printModal && selectedInvoice && (
                    <div className="fixed inset-0 bg-white z-50 p-8 print:bg-white print:p-0 hidden print:block">
                        <div className="max-w-2xl mx-auto bg-white p-8 border border-gray-300 rounded-lg print:border-0 print:shadow-none">
                            <div className="text-center mb-8 border-b pb-4">
                                <h1 className="text-2xl font-bold text-gray-800">
                                    {t("فاتورة مبيعات")}
                                </h1>
                                <div className="flex justify-between mt-4">
                                    <div className="text-left">
                                        {/* <p className="text-gray-600">
                                            {t("رقم الفاتورة:")} #{selectedInvoice.id}
                                        </p> */}
                                        <p className="text-gray-600">
                                            {t("التاريخ:")}{" "}
                                            {formatDate(
                                                selectedInvoice.created_at
                                            )}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-600">
                                            {t("الحالة:")}
                                            {selectedInvoice.paid_amount === 0
                                                ? t(" غير مدفوعة")
                                                : selectedInvoice.paid_amount <
                                                  selectedInvoice.total
                                                ? t(" مدفوعة جزئياً")
                                                : t(" مدفوعة بالكامل")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between mb-6">
                                {auth.user.system_type === "delivery" ? (
                                                                   <div>
                                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                        {t("معلومات العميل")}
                                    </h2>
                                    <p className="text-gray-700">
                                        {selectedInvoice.product?.category ||
                                            t("عميل نقدي")}
                                    </p>
                                </div>
                                ) :(<div>
                                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                        {t("معلومات العميل")}
                                    </h2>
                                    <p className="text-gray-700">
                                        {selectedInvoice.customer?.name ||
                                            t("عميل نقدي")}
                                    </p>
                                </div>)}

                            </div>

                            <table className="w-full border border-gray-300 mb-6">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 text-right border border-gray-300">
                                            {auth.user.system_type ===
                                            "services"
                                                ? t("اسم الخدمة")
                                                : auth.user.system_type ===
                                                  "education"
                                                ? t("اسم الدوره")
                                                : auth.user.system_type ===
                                                  "realEstate"
                                                ? t("اسم العقار")
                                                : auth.user.system_type ===
                                                  "delivery"
                                                ? t("اسم الطلب")
                                                : auth.user.system_type ===
                                                  "travels"
                                                ? t("اسم الرحلة")
                                                : t("اسم المنتج")}
                                        </th>
                                            {auth.user.system_type ===
                                            "services"
                                                ? ""
                                                : auth.user.system_type ===
                                                  "education"
                                                ? ""
                                                : auth.user.system_type ===
                                                  "realEstate"
                                                ? t("")
                                                : auth.user.system_type ===
                                                  "delivery"
                                                ? <th className="px-4 py-2 text-center border border-gray-300">
                                                    {t("حالة الطلب")}
                                                </th>
                                                : auth.user.system_type ===
                                                  "travels"
                                                ? ""
                                                : <th className="px-4 py-2 text-center border border-gray-300">{t("الكمية")}</th>}

                                     {auth.user.system_type==="delivery" ? (
                                        <th className="px-4 py-2 text-center border border-gray-300">
                                                    {t("اسم صاحب الطلب")}
                                                </th>):(
                                                     <th className="px-4 py-2 text-center border border-gray-300">
                                                        {t("الفئة")}
                                                        </th>
                                                )}
                                        <th className="px-4 py-2 text-right border border-gray-300">
                                            {t("السعر")}
                                        </th>
                                        <th className="px-4 py-2 text-right border border-gray-300">
                                            {t("السعر الكلي")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedInvoice.items?.map(
                                        (item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2 border border-gray-300 text-right">
                                                    {item.product?.name}
                                                </td>

                                                    {auth.user.system_type ===
                                                    "services"
                                                        ? ""
                                                        : auth.user
                                                              .system_type ===
                                                          "education"
                                                        ? ""
                                                        : auth.user
                                                              .system_type ===
                                                          "realEstate"
                                                        ? ""
                                                        : auth.user
                                                              .system_type ===
                                                          "delivery"
                                                        ?<td className="px-4 py-2 border border-gray-300 text-center"> {item.quantity} </td>
                                                        : auth.user
                                                              .system_type ===
                                                          "travels"
                                                        ? ""
                                                        : <td className="px-4 py-2 border border-gray-300 text-center"> {item.quantity} </td>}

                                                <td className="px-4 py-2 border border-gray-300 text-right">
                                                            {item.product.category}{" "}

                                                </td>
                                                <td className="px-4 py-2 border border-gray-300 text-right">
                                                    {item.price} {currency}
                                                </td>
                                                <td className="px-4 py-2 border border-gray-300 text-right">
                                                    {item.quantity * item.price}{" "}
                                                    {currency}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className="px-4 py-2  border border-gray-300 text-right font-semibold"
                                        >
                                            {t("الإجمالي")}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-300 text-right font-semibold">
                                            {selectedInvoice.total} {currency}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className="px-4 py-2 border border-gray-300 text-right font-semibold"
                                        >
                                            {t("المدفوع")}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-300 text-right font-semibold">
                                            {selectedInvoice.paid_amount}{" "}
                                            {currency}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className="px-4 py-2 border border-gray-300 text-right font-semibold"
                                        >
                                           {t("المتبقي")}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-300 text-right font-semibold">
                                            {selectedInvoice.total -
                                                selectedInvoice.paid_amount}{" "}
                                            {currency}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div className="text-center mt-12 pt-4 border-t border-gray-300">
                                <div className="flex justify-center items-center gap-3">
                                <p className="text-gray-600">
                                    {t("شكراً لتعاملكم معنا")}
                                </p>
                                <p className="text-gray-600">
                                    {auth.user?.company?.company_name}
                                </p>
                                </div>
                                <div className="flex justify-center items-center gap-3">
                                    {(auth.user.company.subscription === "basic" || auth.user.company.subscription === "premium")
                                    && (
                                       <img src={`${app_url}/favicon-v2.ico`} alt="logo" className="w-7 h-7 rounded-lg" />
                                    )}
                                <p className="text-gray-500 text-sm mt-2 ">
                                {(auth.user.company.subscription === "basic" || auth.user.company.subscription === "premium") && (
                                    t("سيستمى نظام متكامل لادارة الانشطة التجارية")
                                )}
                                </p>
                                </div>
                            </div>

                            <div className="mt-8 text-center print:hidden">
                                <button
                                    onClick={closeModal}
                                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg mr-4 hover:bg-gray-300 transition-colors"
                                >
                                    {t("إغلاق")}
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="px-6 py-2 bg-primary text-white rounded-lg flex items-center justify-center mx-auto hover:bg-primary-dark transition-colors"
                                >
                                    <PrinterIcon className="h-4 w-4 ml-2" />
                                    {t("طباعة")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
