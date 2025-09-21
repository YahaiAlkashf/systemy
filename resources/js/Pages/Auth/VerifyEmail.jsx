import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function VerifyEmail({ status }) {
    const { t } = useTranslation();
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-black to-purple-900 flex items-center justify-center p-6" dir="rtl">
            <div className="w-full max-w-md bg-black/90 rounded-2xl shadow-2xl p-6 text-white">
                <Head title={t('تأكيد البريد الإلكتروني')} />

                <h2 className="text-2xl font-semibold mb-4 text-center text-purple-400">
                    {t('تأكيد البريد الإلكتروني')}
                </h2>

                <div className="mb-4 text-sm text-gray-300 text-center">
                    {t('شكرًا لتسجيلك! قبل البدء، يرجى تأكيد بريدك الإلكتروني بالضغط على الرابط الذي أرسلناه إلى بريدك. إذا لم تصلك الرسالة، سنرسل لك رابط تفعيل آخر بكل سرور.')}
                </div>

                {status === 'verification-link-sent' && (
                    <div className="mb-4 p-3 text-sm font-medium text-green-400 bg-green-900/30 rounded-lg border border-green-600 text-center">
                        {t('تم إرسال رابط تفعيل جديد إلى البريد الإلكتروني الذي سجلت به.')}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <PrimaryButton
                            className="px-5 py-3 rounded-xl bg-purple-600 text-white font-medium shadow-md hover:bg-purple-700 transition-colors flex-1 justify-center"
                            disabled={processing}
                        >
                            {t('إعادة إرسال رابط التفعيل')}
                        </PrimaryButton>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="rounded-md text-sm text-gray-300 underline hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 py-2 px-4 border border-gray-600 hover:border-gray-400 transition-colors"
                        >
                            {t('تسجيل الخروج')}
                        </Link>
                    </div>
                </form>

                <div className="mt-6 pt-4 border-t border-gray-700 text-center">
                    <p className="text-sm text-gray-400">
                        {t('لم تستلم البريد؟ تحقق من مجلد الرسائل غير المرغوب فيها (Spam)')}
                    </p>
                </div>
            </div>
        </div>
    );
}