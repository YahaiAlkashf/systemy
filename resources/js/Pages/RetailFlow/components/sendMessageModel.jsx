import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from "react-i18next";
export default function SendMessageModal({
    messageForm,
    setMessageForm,
    customer,
    closeModal,
    handleSendMessage,
}) {
    const { t } = useTranslation();
    return (
        <>
            {customer.phone ? (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-background-card rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    إرسال رسالة إلى {customer.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    رقم الهاتف: {customer.phone}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    محتوى الرسالة
                                </label>
                                <textarea
                                    value={messageForm.message || ''}
                                    onChange={(e) =>
                                        setMessageForm({
                                            ...messageForm,
                                            message: e.target.value,phone:customer.phone
                                        })
                                    }
                                    rows="4"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                    placeholder="اكتب محتوى الرسالة هنا..."
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    عدد الأحرف: {messageForm.message?.length || 0}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSendMessage}
                                disabled={!messageForm.message?.trim()}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                إرسال
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-background-card rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                لا يمكن إرسال رسالة
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-4">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p className="text-center text-gray-600 dark:text-gray-400">
                                العميل <span className="font-semibold">{customer.name}</span> لا يحتوي على رقم هاتف مسجل في النظام.
                            </p>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={closeModal}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                موافق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
