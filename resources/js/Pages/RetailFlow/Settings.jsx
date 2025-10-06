import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from '../Profile/Partials/DeleteUserForm';
import UpdatePasswordForm from '../Profile/Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from '../Profile/Partials/UpdateProfileInformationForm';
import AdminLayout from './layout';
import UserManagement from './components/UserManagement';
import { useTranslation } from 'react-i18next';

export default function Settings({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
        const { t } = useTranslation();
    return (
        <AdminLayout>
            <AuthenticatedLayout>
                <Head title={t("الإعدادات")} />

                <div className="py-12 min-h-screen bg-gray-50 dark:bg-background-dark transition-colors duration-300">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                        <div className="p-6 sm:p-8 bg-white dark:bg-background-card shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-primary dark:text-primary-dark mb-4">
                                {t("تحديث المعلومات الشخصية")}
                            </h2>
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </div>


                        <div className="p-6 sm:p-8 bg-white dark:bg-background-card shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-primary dark:text-primary-dark mb-4">
                                {t("تغيير كلمة المرور")}
                            </h2>
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>


                        <div className="p-6 sm:p-8 bg-white dark:bg-background-card shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
                                {t("حذف الحساب")}
                            </h2>
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    </div>
                </div>

                {/* User Management */}
                 {(auth.user.company.subscription==='vip'  || auth.user.company.subscription==='premium') &&
                 <>
                        {auth?.user?.role === "superadmin" && (
                            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-10">
                                <div className="p-6 sm:p-8 bg-white dark:bg-background-card shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700">
                                    <h2 className="text-xl font-bold text-primary dark:text-primary-dark mb-6">
                                        {t("إدارة المستخدمين")}
                                    </h2>
                                    <UserManagement />
                                </div>
                            </div>
                        )}
                </>

                 }

            </AuthenticatedLayout>
        </AdminLayout>
    );
}
