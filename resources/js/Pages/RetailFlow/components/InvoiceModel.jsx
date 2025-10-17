import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CurrencyContext } from "../../../Context/CurrencyContext ";
import { useTranslation } from "react-i18next";
export default function InvoiceModal({
    title,
    products,
    handleSave,
    closeModal,
    errors,
    productSearch,
    setProductSearch,
    customerSearch,
    setCustomerSearch,
    currentProducts,
    currentCustomers,
    searchInCustomer,
    searchInProduct,
    invoiceData,
    setInvoiceData,
    addProductToInvoice,
    removeProductFromInvoice,
    updateProductQuantity,
    isEditMode = false,
}) {
    const { t } = useTranslation();
    const { currency } = useContext(CurrencyContext);
    const { auth } = usePage().props;

    const calculateTotalProfit = () => {
        let totalProfit = 0;
        invoiceData.products.forEach((productId, index) => {
            const product = products.find((p) => p.id === productId);
            if (product) {
                let productProfit = 0;
                const quantity = Number(invoiceData.quantities[index]) || 1;
                const price = Number(invoiceData.prices[index]) || 0;

                if (auth.user.system_type === "delivery") {
                    productProfit = price - (product.additional_costs || 0);
                } else if (
                    ["services", "education", "travels"].includes(
                        auth.user.system_type
                    )
                ) {
                    productProfit =
                        price -
                        (product.wholesale_price || 0) -
                        (product.additional_costs || 0);
                } else {
                    productProfit =
                        price -
                        (product.wholesale_price || 0) -
                        (product.additional_costs || 0);
                }

                totalProfit += productProfit * quantity;
            }
        });
        return totalProfit;
    };

    const totalProfit = calculateTotalProfit();

    const currentTotal = invoiceData.prices.reduce((total, price, index) => {
        const quantity = Number(invoiceData.quantities[index]) || 1;
        return total + Number(price) * quantity;
    }, 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
            <div className="bg-white dark:bg-gray-800 overflow-y-auto h-full shadow-2xl max-w-2xl w-full p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {t(`${title}`)}
                    </h3>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {auth.user.system_type === "services"
                                ? t("بحث عن خدمة")
                                : auth.user.system_type === "education"
                                ? t("بحث عن دورة")
                                : auth.user.system_type === "realEstate"
                                ? t("بحث عن عقار")
                                : auth.user.system_type === "delivery"
                                ? t("بحث عن طلب")
                                : auth.user.system_type === "travels"
                                ? t("بحث عن رحلة ")
                                : t("بحث عن منتج")}{" "}
                        </label>
                        <div className="flex">
                            <button
                                onClick={searchInProduct}
                                className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium
                       text-white bg-primary rounded-r-lg
                       hover:bg-primary-dark
                       transition-colors"
                            >
                                {t("بحث")}
                            </button>
                            <input
                                type="text"
                                onChange={(e) => {
                                    setProductSearch(e.target.value);
                                    searchInProduct();
                                }}
                                value={productSearch}
                                placeholder={`${
                                    auth.user.system_type === "services"
                                        ? t("ابحث عن خدمة")
                                        : auth.user.system_type === "education"
                                        ? t("ابحث عن دورة")
                                        : auth.user.system_type === "realEstate"
                                        ? t("ابحث عن عقار")
                                        : auth.user.system_type === "delivery"
                                        ? t("ابحث عن طلب")
                                        : auth.user.system_type === "travels"
                                        ? t("ابحث عن رحلة ")
                                        : t("ابحث عن منتج")
                                }`}
                                className="flex-grow h-10 px-3 border border-gray-300 rounded-l-lg
                       bg-white text-gray-800
                       dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Products List */}
                        <div className="flex flex-col gap-2 mt-2 max-h-40 overflow-y-auto">
                            {currentProducts &&
                                productSearch &&
                                currentProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between px-4 py-2 rounded-lg border
                                                    border-gray-200 bg-gray-50
                                                    dark:border-gray-600 dark:bg-gray-800 "
                                    >
                                        {/* Product Name */}
                                        <div>
                                            <h2 className="text-gray-800  dark:text-gray-200 font-medium">
                                                {product.name}
                                            </h2>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                <div className="flex gap-1 justify-center items-center">
                                                    <div>{product.price}</div>
                                                    <div className="text-xs">
                                                        {currency}
                                                    </div>
                                                </div>
                                            </p>
                                        </div>

                                        {/* Add Button */}
                                        <button
                                            onClick={() => {
                                                addProductToInvoice(product);
                                                setProductSearch("");
                                            }}
                                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium
                                            text-white bg-primary rounded-lg
                                            hover:bg-primary-dark
                                              transition-colors"
                                        >
                                            <PlusIcon className="h-4 w-4 mr-1.5" />
                                            {t("إضافة")}
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {auth.user.system_type === "delivery"
                                ? t("بحث عن السائق")
                                : t("بحث عن عميل")}
                        </label>
                        <div className="flex">
                            <button
                                onClick={searchInCustomer}
                                className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium
                                text-white bg-primary rounded-r-lg
                                hover:bg-primary-dark
                                transition-colors"
                            >
                                {t("بحث")}
                            </button>
                            <input
                                type="text"
                                onChange={(e) => {
                                    setCustomerSearch(e.target.value);
                                    searchInCustomer();
                                }}
                                value={customerSearch}
                                placeholder={`${
                                    auth.user.system_type === "delivery"
                                        ? t("ابحث عن سائق")
                                        : t("ابحث عن عميل")
                                }`}
                                className="flex-grow h-10 px-3 border border-gray-300 rounded-l-lg
                       bg-white text-gray-800
                       dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Customers List */}
                        <div className="flex flex-col gap-2 mt-2 max-h-40 overflow-y-auto">
                            {currentCustomers &&
                                customerSearch &&
                                currentCustomers.map((customer, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between px-4 py-2 rounded-lg border
                                                     border-gray-200 bg-gray-50
                                                      dark:border-gray-600 dark:bg-gray-800 "
                                    >
                                        <h2 className="text-gray-800  dark:text-gray-200 font-medium">
                                            {customer.name}
                                        </h2>

                                        <button
                                            onClick={() => {
                                                setInvoiceData({
                                                    ...invoiceData,
                                                    name: customer.name,
                                                    customer_id: customer.id,
                                                });
                                                setCustomerSearch("");
                                            }}
                                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium
                                            text-white bg-primary rounded-lg
                                            hover:bg-primary-dark
                                            transition-colors"
                                        >
                                            <PlusIcon className="h-4 w-4 mr-1.5" />
                                            {t("إضافة")}
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t("المبلغ المدفوع")}
                        </label>
                        <input
                            type="number"
                            value={invoiceData.paid_amount}
                            onChange={(e) =>
                                setInvoiceData({
                                    ...invoiceData,
                                    paid_amount: Number(e.target.value) || 0,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {auth.user.system_type === "delivery"
                                ? t("السائق المحدد")
                                : t("العميل المحدد")}
                        </label>
                        <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
                            {invoiceData?.name
                                ? invoiceData.name
                                : auth.user.system_type === "delivery"
                                ? t("لم يتم اختيار سائق")
                                : t("لم يتم اختيار عميل")}
                        </div>
                    </div>
                </div>

                <hr />
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-3 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {auth.user.system_type === "services"
                                        ? t(" الخدمة")
                                        : auth.user.system_type === "education"
                                        ? t(" الدوره")
                                        : auth.user.system_type === "realEstate"
                                        ? t(" العقار")
                                        : auth.user.system_type === "delivery"
                                        ? t(" الطلب")
                                        : auth.user.system_type === "travels"
                                        ? t(" الرحلة")
                                        : t(" المنتج")}
                                </th>
                                {[
                                    "services",
                                    "education",
                                    "travels",
                                    "realEstate",
                                ].includes(auth.user.system_type) ? (
                                    ""
                                ) : (
                                    <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {auth.user.system_type === "delivery"
                                            ? t("حالة الطلب")
                                            : t("الكمية")}
                                    </th>
                                )}
                                <th className="px-3 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t("السعر")}
                                </th>
                                <th className="px-3 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t("الإجمالي")}
                                </th>
                                <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t("إجراءات")}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.products.map((productId, index) => {
                                const product = products.find(
                                    (p) => p.id === productId
                                );

                                return (
                                    <tr
                                        key={productId}
                                        className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-3 py-2 text-gray-800 dark:text-gray-200">
                                            {product?.name}
                                        </td>
                                        {[
                                            "services",
                                            "education",
                                            "travels",
                                            "realEstate"
                                        ].includes(auth.user.system_type) ? (
                                            ""
                                        ) : (
                                            <td className="px-3 py-2 text-center">
                                                {auth.user.system_type ===
                                                "delivery" ? (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                        {invoiceData.quantities[
                                                            index
                                                        ] || t("قيد التوصيل")}
                                                    </span>
                                                ) : (
                                                    <input
                                                        type="number"
                                                        value={
                                                            invoiceData
                                                                .quantities[
                                                                index
                                                            ]
                                                        }
                                                        onChange={(e) =>
                                                            updateProductQuantity(
                                                                index,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-20 px-2 py-1 border rounded dark:bg-gray-600 dark:text-gray-200 text-center"
                                                    />
                                                )}
                                            </td>
                                        )}
                                        <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                                            <div className="flex items-center">
                                                <div>
                                                    {invoiceData.prices[index]}
                                                </div>
                                                <div className="text-xs">
                                                    {currency}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                                            <div className="flex items-center">
                                                <div>
                                                    {(Number(
                                                        invoiceData.quantities[
                                                            index
                                                        ]
                                                    ) || 1) *
                                                        (Number(
                                                            invoiceData.prices[
                                                                index
                                                            ]
                                                        ) || 0)}
                                                </div>
                                                <div className="text-xs">
                                                    {currency}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <button
                                                onClick={() =>
                                                    removeProductFromInvoice(
                                                        index
                                                    )
                                                }
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <td
                                    colSpan="3"
                                    className="px-3 py-2 font-semibold text-right text-gray-800 dark:text-gray-200"
                                >
                                    {t("الإجمالي")}
                                </td>
                                <td
                                    colSpan="2"
                                    className="px-3 py-2 text-right text-primary dark:text-primary-dark font-bold"
                                >
                                    <div className="flex items-center">
                                        <div>{currentTotal}</div>
                                        <div className="text-xs">
                                            {currency}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td
                                    colSpan="3"
                                    className="px-3 py-2 font-semibold text-right text-gray-800 dark:text-gray-200"
                                >
                                    {t("صافى الارباح:")}
                                </td>
                                <td
                                    colSpan="2"
                                    className="px-3 py-2 text-right text-green-600 dark:text-green-400 font-bold"
                                >
                                    <div className="flex items-center">
                                        <div>{totalProfit}</div>
                                        <div className="text-xs">
                                            {currency}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {errors &&
                    Object.entries(errors).map(([field, msgs], i) => (
                        <div
                            key={i}
                            className="bg-red-100 text-red-700 p-2 rounded mb-1 text-sm"
                        >
                            {Array.isArray(msgs) ? (
                                msgs.map((msg, j) => <p key={j}>{msg}</p>)
                            ) : (
                                <p>{msgs}</p>
                            )}
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
