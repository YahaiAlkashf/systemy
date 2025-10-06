import React, { useState, useEffect, useContext, useRef } from "react";
import AdminLayout from "./layout";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import {
    XMarkIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    QrCodeIcon,
} from "@heroicons/react/24/outline";
import { CurrencyContext } from "../../Context/CurrencyContext ";
import { useTranslation } from "react-i18next";

export default function ProductsRetailFlow() {
    const { t } = useTranslation();
    const { app_url } = usePage().props;
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [errors, setErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [searsh, setShearsh] = useState("");
    const [barcodeInput, setBarcodeInput] = useState("");
    const [isBarcodeMode, setIsBarcodeMode] = useState(false);
    const [barcodeStatus, setBarcodeStatus] = useState("");
    const barcodeInputRef = useRef(null);
    const rowsPerPage = 10;

    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        net_profit: 0,
        additional_costs: "",
        wholesale_price: "",
        quantity: "0",
        category: "",
        barcode: "",
    });

    const { currency, setCurrency } = useContext(CurrencyContext);
    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searsh.toLowerCase())
    );
    const { auth } = usePage().props;
    const indexOfLastProduct = currentPage * rowsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - rowsPerPage;
    const currentProducts = filteredProducts.slice(
        indexOfFirstProduct,
        indexOfLastProduct
    );

    // get all products
    const showAllProducts = async () => {
        try {
            const response = await axios.get(`${app_url}/productretailFlow`);
            setProducts(response.data.products);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        showAllProducts();

        if (isBarcodeMode && barcodeInputRef.current) {
            barcodeInputRef.current.focus();
        }
    }, [isBarcodeMode]);

    const enableBarcodeMode = () => {
        setIsBarcodeMode(true);
        setBarcodeStatus(t("جاهز للمسح - قم بمسح الباركود الآن"));
    };

    const handleBarcodeInput = (e) => {
        const value = e.target.value;
        setBarcodeInput(value);
    };

    const handleBarcodeKeyPress = async (e) => {
        if (e.key === "Enter" && barcodeInput.trim() !== "") {
            await processBarcode(barcodeInput.trim());
        }
    };

    const processBarcode = async (barcode) => {
        setBarcodeStatus(t("جاري البحث عن المنتج..."));

        try {
            const response = await axios.get(
                `${app_url}/productretailFlow/barcode/${barcode}`
            );

            if (response.data.product) {
                setSelectedProduct(response.data.product);
                setEditModal(true);
                setBarcodeStatus(t("تم العثور على المنتج!"));
            } else {
                setNewProduct((prev) => ({
                    ...prev,
                    barcode: barcode,
                    name: t(`منتج باركود ${barcode}`),
                }));
                setAddModal(true);
                setBarcodeStatus(t("منتج جديد - تم تعبئة الباركود"));
            }
        } catch (error) {
            console.error("Error fetching product by barcode:", error);
            setNewProduct((prev) => ({
                ...prev,
                barcode: barcode,
                name: t(`منتج باركود ${barcode}`),
            }));
            setAddModal(true);
            setBarcodeStatus(t("منتج جديد - تم تعبئة الباركود"));
        }

        setBarcodeInput("");
        setIsBarcodeMode(false);
    };

    const cancelBarcodeMode = () => {
        setIsBarcodeMode(false);
        setBarcodeInput("");
        setBarcodeStatus("");
    };

    // Open modals
    const handleAddProduct = () => {
        setAddModal(true);
    };
    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setEditModal(true);
    };
    const handleDeleteProduct = (product) => {
        setSelectedProduct(product);
        setDeleteModal(true);
    };
    const closeModal = () => {
        setAddModal(false);
        setEditModal(false);
        setDeleteModal(false);
        setErrors({});
        setNewProduct({
            name: "",
            price: "",
            net_profit: 0,
            additional_costs: "",
            wholesale_price: "",
            quantity: "0",
            category: "",
            barcode: "",
        });
    };

    // Add Product
    const handleSaveAddProduct = async () => {
        const formData = new FormData();
        formData.append("name", newProduct.name);
        formData.append("price", newProduct.price);
        formData.append("wholesale_price", newProduct.wholesale_price);
        formData.append("additional_costs", newProduct.additional_costs);
        formData.append("barcode", newProduct.barcode);

        if (auth.user.system_type === "delivery") {
            formData.append(
                "net_profit",
                newProduct.price - newProduct.additional_costs
            );
        } else {
            formData.append(
                "net_profit",
                newProduct.price -
                    newProduct.wholesale_price -
                    newProduct.additional_costs
            );
        }

        formData.append("quantity", newProduct.quantity);
        formData.append("category", newProduct.category);

        try {
            await axios.post(`${app_url}/productretailFlow`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            closeModal();
            showAllProducts();
            setNewProduct({
                name: "",
                price: "",
                net_profit: "",
                additional_costs: "",
                wholesale_price: "",
                quantity: "",
                category: "",
                barcode: "",
            });
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
        }
    };

    // Edit Product
    const handleSaveEditProduct = async () => {
        const formData = new FormData();
        formData.append("name", selectedProduct.name);
        formData.append("price", selectedProduct.price);
        formData.append("wholesale_price", selectedProduct.wholesale_price);
        formData.append("additional_costs", selectedProduct.additional_costs);
        formData.append("barcode", selectedProduct.barcode);

        if (auth.user.system_type === "delivery") {
            formData.append(
                "net_profit",
                selectedProduct.price - selectedProduct.additional_costs
            );
        } else {
            formData.append(
                "net_profit",
                selectedProduct.price -
                    selectedProduct.wholesale_price -
                    selectedProduct.additional_costs
            );
        }

        formData.append("quantity", selectedProduct.quantity);
        formData.append("category", selectedProduct.category);

        try {
            await axios.post(
                `${app_url}/productretailFlow/${selectedProduct.id}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            closeModal();
            showAllProducts();
            setSelectedProduct(null);
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
        }
    };

    // Delete Product
    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(
                `${app_url}/productretailFlow/${selectedProduct.id}`
            );
            closeModal();
            showAllProducts();
            setSelectedProduct(null);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <AdminLayout>
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                <div className="flex gap-2 mb-4 flex-wrap">
                    {auth.user.system_type === "retail" &&
                        auth.user.company.company.subscription === "vip" && (
                            <button
                                onClick={enableBarcodeMode}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                                    isBarcodeMode
                                        ? "bg-blue-700 text-white"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                            >
                                <QrCodeIcon className="h-5 w-5" />
                                {isBarcodeMode
                                    ? t("جاري المسح...")
                                    : t("مسح الباركود")}
                            </button>
                        )}
                    {isBarcodeMode && (
                        <button
                            onClick={cancelBarcodeMode}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5" />
                            {t("إلغاء المسح")}
                        </button>
                    )}
                    {auth.user.company.subscription === "vip" && (
                        <>
                            <button
                                onClick={() =>
                                    (window.location.href = `${app_url}/retailflow/export/products/excel`)
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
                                    (window.location.href = `${app_url}/retailflow/export/products/pdf`)
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
                        </>
                    )}
                </div>

                {isBarcodeMode && (
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                            {t(
                                "قم بمسح الباركود أو أدخله يدوياً ثم اضغط Enter"
                            )}
                        </label>
                        <div className="flex gap-2">
                            <input
                                ref={barcodeInputRef}
                                type="text"
                                value={barcodeInput}
                                onChange={handleBarcodeInput}
                                onKeyPress={handleBarcodeKeyPress}
                                className="flex-1 px-3 py-2 border border-blue-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={t("أدخل الباركود هنا...")}
                            />
                            <button
                                onClick={() => processBarcode(barcodeInput)}
                                disabled={!barcodeInput.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                            >
                                {t("بحث")}
                            </button>
                        </div>
                        {barcodeStatus && (
                            <p
                                className={`mt-2 text-sm ${
                                    barcodeStatus.includes("جاهز")
                                        ? "text-blue-600 dark:text-blue-400"
                                        : barcodeStatus.includes("جاري")
                                        ? "text-yellow-600 dark:text-yellow-400"
                                        : "text-green-600 dark:text-green-400"
                                }`}
                            >
                                {barcodeStatus}
                            </p>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        {auth.user.system_type === "services"
                            ? t("الخدمات")
                            : auth.user.system_type === "education"
                            ? t("الدورات")
                            : auth.user.system_type === "realEstate"
                            ? t("العقارات")
                            : auth.user.system_type === "delivery"
                            ? t("الطلبات")
                            : auth.user.system_type === "travels"
                            ? t("الرحلات")
                            : t("المنتجات")}
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
                                value={searsh}
                                onChange={(e) => setShearsh(e.target.value)}
                                placeholder={`${
                                    auth.user.system_type === "services"
                                        ? t("بحث عن خدمة")
                                        : auth.user.system_type === "education"
                                        ? t("بحث عن دورة")
                                        : auth.user.system_type === "realEstate"
                                        ? t("بحث عن عقار")
                                        : auth.user.system_type === "delivery"
                                        ? t("بحث عن طلب")
                                        : auth.user.system_type === "travels"
                                        ? t("بحث عن رحلة ")
                                        : t("بحث عن منتج")
                                }`}
                                className="w-full px-3 py-2 border border-gray-300 rounded-l-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={handleAddProduct}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <PlusIcon className="h-4 w-4 mr-1.5" />
                            {auth.user.system_type === "services"
                                ? t("اضافة خدمة")
                                : auth.user.system_type === "education"
                                ? t("اضافة دورة")
                                : auth.user.system_type === "realEstate"
                                ? t("اضافة عقار")
                                : auth.user.system_type === "delivery"
                                ? t("اضافة طلب")
                                : auth.user.system_type === "travels"
                                ? t("اضافة رحلة")
                                : t("اضافة منتج")}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full table-fixed">
                        <colgroup>
                            <col className="w-16" />
                            <col className="w-1/5" />
                            <col className="w-2/5" />
                            <col className="w-32" />
                            <col className="w-32" />
                            <col className="w-32" />
                        </colgroup>
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    #
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {auth.user.system_type === "services"
                                        ? t("اسم الخدمة")
                                        : auth.user.system_type === "education"
                                        ? t("اسم الدوره")
                                        : auth.user.system_type === "realEstate"
                                        ? t("اسم العقار")
                                        : auth.user.system_type === "delivery"
                                        ? t("اسم الطلب")
                                        : auth.user.system_type === "travels"
                                        ? t("اسم الرحلة")
                                        : t("اسم المنتج")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {auth.user.system_type === "delivery"
                                        ? t("اسم صاحب الطلب")
                                        : t("الفئة")}
                                </th>
                                {auth.user.system_type === "retail" &&
                                    auth.user.company.subscription === "vip" && (
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            {t("الباركود")}
                                        </th>
                                    )}
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {auth.user.system_type === "services"
                                        ? ""
                                        : auth.user.system_type === "education"
                                        ? ""
                                        : auth.user.system_type === "realEstate"
                                        ? t("الكمية")
                                        : auth.user.system_type === "delivery"
                                        ? t("حالة الطلب")
                                        : auth.user.system_type === "travels"
                                        ? ""
                                        : t("الكمية")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {auth.user.system_type === "delivery"
                                        ? t("سعر الطلب")
                                        : t("سعر البيع")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {auth.user.system_type === "delivery"
                                        ? t("عنوان الطلب")
                                        :auth.user.system_type === "realEstate"  ?t("سعر الشراء") :
                                        t("سعر الجملة")
                                    }
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {auth.user.system_type === "delivery"
                                        ? t("تكلفة توصيل الطلب")
                                        : t("تكايف اضافيه")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("صافى الارباح")}
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("الإجراءات")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {currentProducts.map((product, idx) => (
                                <tr
                                    key={product.id}
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
                                        {product.name}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                        {product.category}
                                    </td>
                                    {auth.user.system_type === "retail" &&
                                        auth.user.company.subscription === "vip" && (
                                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                                {product.barcode && (
                                                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded-full">
                                                        {product.barcode}
                                                    </span>
                                                )}
                                            </td>
                                        )}
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                        {auth.user.system_type === "services"
                                            ? ""
                                            : auth.user.system_type ===
                                              "education"
                                            ? ""
                                            : auth.user.system_type ===
                                              "realEstate"
                                            ? product.quantity
                                            : auth.user.system_type ===
                                              "delivery"
                                            ? product.quantity
                                            : auth.user.system_type ===
                                              "travels"
                                            ? ""
                                            : product.quantity}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex gap-1 justify-center items-center px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                                            <div>{product.price}</div>
                                            <div>{currency}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex gap-1 justify-center items-center px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                                            {auth.user.system_type ===
                                            "delivery" ? (
                                                <div>
                                                    {product.wholesale_price}
                                                </div>
                                            ) : (
                                                <>
                                                    <div>
                                                        {
                                                            product.wholesale_price
                                                        }
                                                    </div>
                                                    <div>{currency}</div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex gap-1 justify-center items-center px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                                            <div>
                                                {product.additional_costs}
                                            </div>
                                            <div>{currency}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                        <div className="flex gap-1 justify-center items-center px-2 py-1 bg-green-700 text-white text-xs font-medium rounded-full">
                                            <div>{product.net_profit}</div>
                                            <div>{currency}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 text-center">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() =>
                                                    handleEditProduct(product)
                                                }
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteProduct(product)
                                                }
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            {auth.user.system_type === "services"
                                ? t("لا توجد خدمات لعرضها")
                                : auth.user.system_type === "education"
                                ? t("لا توجد دورات لعرضها")
                                : auth.user.system_type === "realEstate"
                                ? t("لا توجد عقارات لعرضها")
                                : auth.user.system_type === "delivery"
                                ? t("لا توجد طلبات لعرضها")
                                : auth.user.system_type === "travels"
                                ? t("لا توجد رحلات لعرضها")
                                : t("لا توجد منتجات لعرضها")}
                        </div>
                    )}
                    {currentProducts.length > 10 && (
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
                                {Math.ceil(products.length / rowsPerPage)}
                            </span>
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={
                                    currentPage ===
                                    Math.ceil(products.length / rowsPerPage)
                                }
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                {t("التالي")}
                            </button>
                        </div>
                    )}
                </div>

                {/* Add Product Modal */}
                {addModal && (
                    <ProductModal
                        title={
                            auth.user.system_type === "services"
                                ? t("اضافة خدمة")
                                : auth.user.system_type === "education"
                                ? t("اضافة دورة")
                                : auth.user.system_type === "realEstate"
                                ? t("اضافة عقار")
                                : auth.user.system_type === "delivery"
                                ? t("اضافة طلب")
                                : auth.user.system_type === "travels"
                                ? t("اضافة رحلة")
                                : t("اضافة منتج")
                        }
                        t={t}
                        product={newProduct}
                        setProduct={setNewProduct}
                        handleSave={handleSaveAddProduct}
                        closeModal={closeModal}
                        errors={errors}
                        currency={currency}
                        auth={auth}
                    />
                )}

                {/* Edit Product Modal */}
                {editModal && (
                    <ProductModal
                        title={
                            auth.user.system_type === "services"
                                ? t("تعديل الخدمة")
                                : auth.user.system_type === "education"
                                ? t("تعديل الدورة")
                                : auth.user.system_type === "realEstate"
                                ? t("تعديل العقار")
                                : auth.user.system_type === "delivery"
                                ? t("تعديل الطلب")
                                : auth.user.system_type === "travels"
                                ? t("تعديل الرحلة")
                                : t("تعديل المنتج")
                        }
                        t={t}
                        product={selectedProduct}
                        setProduct={setSelectedProduct}
                        handleSave={handleSaveEditProduct}
                        closeModal={closeModal}
                        errors={errors}
                        currency={currency}
                        auth={auth}
                    />
                )}

                {/* Delete Product Modal */}
                {deleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-background-card rounded-xl shadow-2xl max-w-md w-full">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {auth.user.system_type === "services"
                                        ? t("هل أنت متأكد من حذف هذه الخدمة")
                                        : auth.user.system_type === "education"
                                        ? t("هل أنت متأكد من حذف هذه الدورة")
                                        : auth.user.system_type === "realEstate"
                                        ? t("هل أنت متأكد من حذف هذا العقار")
                                        : auth.user.system_type === "delivery"
                                        ? t("هل أنت متأكد من حذف هذا الطلب")
                                        : auth.user.system_type === "travels"
                                        ? t("هل أنت متأكد من حذف هذه الرحلة")
                                        : t("هل أنت متأكد من حذف هذا المنتج")}
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
            </div>
        </AdminLayout>
    );
}

// Modal Component
function ProductModal({
    title,
    product,
    setProduct,
    handleSave,
    closeModal,
    currency,
    errors,
    auth,
    t,
}) {
    const fieldLabels = {
        name:
            auth.user.system_type === "services"
                ? t("اسم الخدمة")
                : auth.user.system_type === "education"
                ? t("اسم الدوره")
                : auth.user.system_type === "realEstate"
                ? t("اسم العقار")
                : auth.user.system_type === "delivery"
                ? t("اسم الطلب")
                : auth.user.system_type === "travels"
                ? t("اسم الرحلة")
                : t("اسم المنتج"),
        price:
            auth.user.system_type === "delivery"
                ? t("سعر الطلب")
                : t("سعر البيع"),
        wholesale_price:
            auth.user.system_type === "delivery"
                ? t("عنوان الطلب")
                : t("سعر الجملة"),
        additional_costs: t("تكايف اضافيه"),
        net_profit: t("صافى الربح"),
        quantity:
            auth.user.system_type === "services"
                ? ""
                : auth.user.system_type === "education"
                ? ""
                : auth.user.system_type === "realEstate"
                ? t("العقارات")
                : auth.user.system_type === "delivery"
                ? t("حالة الطلب")
                : auth.user.system_type === "travels"
                ? ""
                : t("الكمية"),
        category: t("الفئة"),
        barcode: t("الباركود"),
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
                {["name"].map((field, i) => (
                    <div key={i}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {fieldLabels[field]}
                        </label>
                        <input
                            type="text"
                            value={product[field]}
                            onChange={(e) =>
                                setProduct({
                                    ...product,
                                    [field]: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                ))}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {auth.user.system_type === "delivery"
                            ? t("اسم صاحب الطلب")
                            : t("الفئة")}
                    </label>
                    <input
                        type="text"
                        value={product.category}
                        onChange={(e) =>
                            setProduct({
                                ...product,
                                category: e.target.value,
                            })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
                {auth.user.system_type === "retail" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t("الباركود")}
                        </label>
                        <input
                            type="text"
                            value={product.barcode}
                            onChange={(e) =>
                                setProduct({
                                    ...product,
                                    barcode: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {auth.user.system_type === "delivery"
                            ? t("عنوان الطلب")
                            : t("سعر الشراء")}
                    </label>
                    <input
                        type={
                            auth.user.system_type === "delivery"
                                ? "text"
                                : "number"
                        }
                        value={product.wholesale_price}
                        onChange={(e) =>
                            setProduct({
                                ...product,
                                wholesale_price: e.target.value,
                            })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
                {["price"].map((field, i) => (
                    <div key={i}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {fieldLabels[field]}
                        </label>
                        <input
                            type="number"
                            value={product[field]}
                            onChange={(e) =>
                                setProduct({
                                    ...product,
                                    [field]: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                ))}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {auth.user.system_type === "delivery"
                            ? t("تكلفة توصيل الطلب")
                            : t("مصاريف اضافية")}
                    </label>
                    <input
                        type="number"
                        value={product.additional_costs}
                        onChange={(e) =>
                            setProduct({
                                ...product,
                                additional_costs: e.target.value,
                            })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
                {["services", "education", "travels"].includes(
                    auth.user.system_type
                ) ? (
                    ""
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {auth.user.system_type === "realEstate"
                                ? t("الكمية")
                                : auth.user.system_type === "delivery"
                                ? t("حالة الطلب")
                                : t("الكمية")}
                        </label>
                        <input
                            type={
                                auth.user.system_type === "realEstate"
                                    ? "number"
                                    : auth.user.system_type === "delivery"
                                    ? "text"
                                    : "number"
                            }
                            value={product.quantity}
                            onChange={(e) =>
                                setProduct({
                                    ...product,
                                    quantity: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                )}
                <div className="flex flex-col justify-center items-center">
                    <h2 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("الربح")}
                    </h2>
                    <div className="relative">
                        <div className="w-20 h-20 flex justify-center items-center border-2 border-green-300 dark:border-green-600 rounded-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-500 ease-in-out transform hover:scale-110 hover:shadow-xl animate-pulse-slow">
                            {auth.user.system_type === "delivery" ? (
                                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                    {Number(product.price) -
                                        Number(product.additional_costs)}
                                </span>
                            ) : (
                                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                    {Number(product.price) -
                                        Number(product.wholesale_price) -
                                        Number(product.additional_costs)}
                                </span>
                            )}
                        </div>
                        <div className="absolute inset-0 flex justify-center items-center">
                            <div className="w-24 h-24 border-2 border-green-200 dark:border-green-700 rounded-full animate-ping-slow opacity-75"></div>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            <span className="text-xs font-bold">
                                {currency}
                            </span>
                        </div>
                    </div>
                </div>
                {errors &&
                    Object.entries(errors).map(([field, msgs], i) => (
                        <div
                            key={i}
                            className="bg-red-100 text-red-700 p-2 rounded mb-1 text-sm"
                        >
                            {msgs.map((msg, j) => (
                                <p key={j}>{t(msg)}</p>
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
