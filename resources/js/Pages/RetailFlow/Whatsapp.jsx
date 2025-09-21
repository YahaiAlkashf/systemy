import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import AdminLayout from './layout';
import { useTranslation } from 'react-i18next';

const WhatsAppSettings = () => {
    const { settings, app_url } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        phone_number_id: settings?.phone_number_id || '',
        business_account_id: settings?.business_account_id || '',
        access_token: settings?.access_token || ''
    });
    const { t } = useTranslation();
    const [showToken, setShowToken] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [isTesting, setIsTesting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('company.whatsapp.settings.save'));
    };

    const testConnection = async () => {
        setIsTesting(true);
        setTestResult(null);

        try {
            const response = await axios.post(`${app_url}/whatsapp/test`, {
                phone_number_id: data.phone_number_id,
                business_account_id: data.business_account_id,
                access_token: data.access_token
            });

            setTestResult({ success: true, message: response.data.message });
        } catch (error) {
            setTestResult({
                success: false,
                message: error.response?.data?.message || t('حدث خطأ أثناء اختبار الاتصال')
            });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <AdminLayout>
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-background-card overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white dark:bg-background-card border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                                {t("إعدادات واتساب للأعمال")}
                            </h2>

                            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-md mb-6">
                                <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                                    {t("كيفية الحصول على بيانات الربط:")}
                                </h3>
                                <ol className="list-decimal list-inside mt-2 text-blue-700 dark:text-blue-300">
                                    <li>{t("ادخل على")} <a href="https://developers.facebook.com/" target="_blank" className="underline hover:text-blue-900 dark:hover:text-blue-100">{t("Meta for Developers")}</a></li>
                                    <li>{t("ادخل على التطبيق الخاص بشركتك")}</li>
                                    <li>{t("اذهب إلى إعدادات واتساب")}</li>
                                    <li>{t("انسخ البيانات المطلوبة من هناك")}</li>
                                </ol>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="phone_number_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t("رقم الهاتف (Phone Number ID)")}
                                    </label>
                                    <input
                                        type="text"
                                        id="phone_number_id"
                                        value={data.phone_number_id}
                                        onChange={e => setData('phone_number_id', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder={t("123456789012345")}
                                    />
                                    {errors.phone_number_id && (
                                        <div className="text-red-500 text-sm mt-1">{errors.phone_number_id}</div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="business_account_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t("رقم حساب الأعمال (Business Account ID)")}
                                    </label>
                                    <input
                                        type="text"
                                        id="business_account_id"
                                        value={data.business_account_id}
                                        onChange={e => setData('business_account_id', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder={t("987654321098765")}
                                    />
                                    {errors.business_account_id && (
                                        <div className="text-red-500 text-sm mt-1">{errors.business_account_id}</div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="access_token" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t("توكن الوصول (Access Token)")}
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input
                                            type={showToken ? "text" : "password"}
                                            id="access_token"
                                            value={data.access_token}
                                            onChange={e => setData('access_token', e.target.value)}
                                            className="block w-full pr-10 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder={t("رمز سري طويل")}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <button
                                                type="button"
                                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                onClick={() => setShowToken(!showToken)}
                                            >
                                                {showToken ? t('إخفاء') : t('عرض')}
                                            </button>
                                        </div>
                                    </div>
                                    {errors.access_token && (
                                        <div className="text-red-500 text-sm mt-1">{errors.access_token}</div>
                                    )}
                                </div>

                                <div className="flex justify-between gap-4">
                                    <button
                                        type="button"
                                        onClick={testConnection}
                                        disabled={isTesting || processing}
                                        className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
                                    >
                                        {isTesting ? t('جاري الاختبار...') : t('اختبار الاتصال')}
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={processing || isTesting}
                                        className="inline-flex items-center px-4 py-2 bg-primary border border-transparent rounded-md font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                                    >
                                        {processing ? t('جاري الحفظ...') : t('حفظ وإكمال الربط')}
                                    </button>
                                </div>
                            </form>

                            {testResult && (
                                <div className={`mt-4 p-4 rounded-md ${testResult.success ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900'}`}>
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            {testResult.success ? (
                                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <p className={`text-sm font-medium ${testResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                                                {testResult.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {settings?.is_connected && (
                                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-md">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                                                {t("متصل بواتساب للأعمال بنجاح")}
                                            </h3>
                                            <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                                                <p>{t("تم الربط بتاريخ:")} {new Date(settings.updated_at).toLocaleDateString('ar-EG')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default WhatsAppSettings;
