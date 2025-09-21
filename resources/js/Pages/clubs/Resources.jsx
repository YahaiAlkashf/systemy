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
    FolderIcon,
    DocumentIcon,
    ArrowDownTrayIcon,
    CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export default function Library() {
    const { app_url, auth } = usePage().props;
        const { t } = useTranslation();
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [addFolderModal, setAddFolderModal] = useState(false);
    const [renameFolderModal, setRenameFolderModal] = useState(false);
    const [deleteFolderModal, setDeleteFolderModal] = useState(false);
    const [uploadModal, setUploadModal] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newFolderName, setNewFolderName] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState({});
    const [uploadFiles, setUploadFiles] = useState([]);

    const showAllFolders = async () => {
        try {
            const response = await axios.get(`${app_url}/library/folders`);
            setFolders(response.data.folders);
        } catch (error) {
            console.log(error);
        }
    };

    const showFilesInFolder = async (folderId = null) => {
        try {
            const url = folderId
                ? `${app_url}/library/folders/${folderId}/files`
                : `${app_url}/library/files`;

            const response = await axios.get(url);
            setFiles(response.data.files);
            setCurrentFolder(folderId);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        showAllFolders();
        showFilesInFolder();
    }, []);

    const handleAddFolder = () => {
        setAddFolderModal(true);
    };

    const handleRenameFolder = (folder) => {
        setSelectedFolder(folder);
        setNewFolderName(folder.name);
        setRenameFolderModal(true);
    };

    const handleDeleteFolder = (folder) => {
        setSelectedFolder(folder);
        setDeleteFolderModal(true);
    };

    const handleOpenFolder = (folder) => {
        showFilesInFolder(folder.id);
    };

    const handleUploadFile = () => {
        setUploadModal(true);
    };

    const handleDownloadFile = (file) => {
        const downloadUrl = `${app_url}/library/files/${file.id}/download`;
        window.open(downloadUrl, '_blank');
    };

    const handleDeleteFile = async (file) => {
        if (window.confirm(t(`هل أنت متأكد من حذف الملف "${file.name}"؟`))) {
            try {
                await axios.delete(`${app_url}/library/files/${file.id}`);
                showFilesInFolder(currentFolder);
            } catch (error) {
                console.log(error);
            }
        }
    };

    const closeModal = () => {
        setAddFolderModal(false);
        setRenameFolderModal(false);
        setDeleteFolderModal(false);
        setUploadModal(false);
        setSelectedFolder(null);
        setSelectedFile(null);
        setNewFolderName("");
        setUploadProgress(0);
        setUploading(false);
        setErrors({});
        setUploadFiles([]);
    };

    const handleSaveAddFolder = async () => {
        try {
            const response = await axios.post(`${app_url}/library/folders`, {
                name: newFolderName,
            });
            showAllFolders();
            closeModal();
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
        }
    };

    const handleSaveRenameFolder = async () => {
        try {
            await axios.post(`${app_url}/library/folders/${selectedFolder.id}`, {
                name: newFolderName,
                _method: 'PUT'
            });
            showAllFolders();
            closeModal();
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`${app_url}/library/folders/${selectedFolder.id}`);
            showAllFolders();

            if (currentFolder === selectedFolder.id) {
                showFilesInFolder();
            }

            closeModal();
        } catch (error) {
            console.log(error);
        }
    };

    const handleFileUpload = async () => {
        if (uploadFiles.length === 0) return;

        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();

        for (let i = 0; i < uploadFiles.length; i++) {
            formData.append('files[]', uploadFiles[i]);
        }

        if (currentFolder) {
            formData.append('folder_id', currentFolder);
        }

        try {
            const response = await axios.post(`${app_url}/library/files`, formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            showFilesInFolder(currentFolder);
            closeModal();
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
            setUploading(false);
        }
    };

    const handleFileSelect = (e) => {
        setUploadFiles(Array.from(e.target.files));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString("ar-EG", options);
    };

    return (
        <AdminLayout>
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        {t("مكتبة الملفات")}
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => showFilesInFolder()}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    !currentFolder
                                        ? "bg-primary text-white"
                                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                }`}
                            >
                                {t("الكل")}
                            </button>
                        </div>

                        <button
                            onClick={handleAddFolder}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <PlusIcon className="h-4 w-4 mr-1.5" />
                            {t("إنشاء مجلد")}
                        </button>
                        <button
                            onClick={handleUploadFile}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <CloudArrowUpIcon className="h-4 w-4 mr-1.5" />
                            {t("رفع ملف")}
                        </button>
                    </div>
                </div>

                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 gap-2">
                    {t("المسار الحالى:")}
                    <span className="font-medium ml-2 gap-2">
                        {currentFolder
                            ? folders.find(f => f.id === currentFolder)?.name
                            : t("المجلد الرئيسي")}
                    </span>
                    <span className="mx-2">•</span>
                    {t("عدد الملفات:")} {files.length}
                </div>

                {/* show folders*/}
                <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("المجلدات")}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {folders.map((folder) => (
                            <div
                                key={folder.id}
                                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                onClick={() => handleOpenFolder(folder)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 ">
                                        <FolderIcon className="h-8 w-8 text-yellow-500 mr-2" />
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">{folder.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {folder.files_count} {t("ملف")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex space-x-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRenameFolder(folder);
                                            }}
                                            className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteFolder(folder);
                                            }}
                                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {folders.length === 0 && (
                            <div className="col-span-full text-center py-4 text-gray-500 dark:text-gray-400">
                                {t("لا توجد مجلدات")}
                            </div>
                        )}
                    </div>
                </div>

                {/* show files  */}
                <div>
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("الملفات")}</h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-fixed">
                            <colgroup>
                                <col className="w-16" />
                                <col className="w-1/3" />
                                <col className="w-1/4" />
                                <col className="w-1/4" />
                                <col className="w-1/4" />
                            </colgroup>
                            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("اسم الملف")}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("الحجم")}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("تاريخ الرفع")}
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("الإجراءات")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {files.map((file, idx) => (
                                    <tr
                                        key={file.id}
                                        className={`transition-colors duration-200 ${
                                            idx % 2 === 0
                                                ? "bg-white dark:bg-gray-800"
                                                : "bg-gray-50 dark:bg-gray-700"
                                        } hover:bg-gray-100 dark:hover:bg-gray-600`}
                                    >
                                        <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">
                                            {idx + 1}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200 font-medium">
                                            <div className="flex items-center">
                                                <DocumentIcon className="h-5 w-5 text-blue-500 ml-2" />
                                                {file.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                            {formatFileSize(file.size)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                            {formatDate(file.created_at)}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => handleDownloadFile(file)}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-1"
                                                >
                                                    <ArrowDownTrayIcon className="h-4 w-4" />
                                                    {t("تحميل")}
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteFile(file)}
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
                        {files.length === 0 && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                {t("لا توجد ملفات لعرضها")}
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Folder Modal */}
                {addFolderModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("إنشاء مجلد جديد")}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("اسم المجلد")}
                                    </label>
                                    <input
                                        type="text"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.name[0]}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {t("إلغاء")}
                                </button>
                                <button
                                    onClick={handleSaveAddFolder}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                >
                                    {t("إنشاء")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rename Folder Modal */}
                {renameFolderModal && selectedFolder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("إعادة تسمية المجلد")}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("اسم المجلد")}
                                    </label>
                                    <input
                                        type="text"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.name[0]}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {t("إلغاء")}
                                </button>
                                <button
                                    onClick={handleSaveRenameFolder}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                >
                                    {t("حفظ")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Folder Modal */}
                {deleteFolderModal && selectedFolder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("هل أنت متأكد من حذف هذا المجلد؟")}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    {t("سيتم حذف المجلد")}{" "}
                                    <span className="font-bold">
                                        {selectedFolder.name}
                                    </span>{" "}
                                    {t("وجميع الملفات بداخله بشكل دائم.")}
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

                {/* Upload File Modal */}
                {uploadModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("رفع ملفات جديدة")}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("اختر الملفات")}
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileSelect}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        disabled={uploading}
                                    />
                                    {errors.files && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.files[0]}
                                        </p>
                                    )}
                                </div>

                                {uploadFiles.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {t("الملفات المحددة:")}
                                        </p>
                                        <ul className="text-sm text-gray-700 dark:text-gray-300">
                                            {uploadFiles.map((file, index) => (
                                                <li key={index} className="truncate">
                                                    {file.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {uploading && (
                                    <div className="mb-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                            <div
                                                className="bg-primary h-2.5 rounded-full"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                                            {t("جاري الرفع:")} {uploadProgress}%
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    disabled={uploading}
                                >
                                    {t("إلغاء")}
                                </button>
                                <button
                                    onClick={handleFileUpload}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
                                    disabled={uploading || uploadFiles.length === 0}
                                >
                                    {uploading ? (
                                        <>
                                            <span>{t("جاري الرفع...")}</span>
                                        </>
                                    ) : (
                                        <>
                                            <CloudArrowUpIcon className="h-4 w-4 ml-1.5" />
                                            {t("رفع الملفات")}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
