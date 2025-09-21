import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword({ status }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-black to-purple-900 flex items-center justify-center p-6" dir="rtl">
            <div className="w-full max-w-md bg-black/90 rounded-2xl shadow-2xl p-6 text-white">
                <Head title={t('استعادة كلمة المرور')} />

                <div className="mb-4 text-sm text-gray-300 text-center">
                    {t('نسيت كلمة المرور؟ لا مشكلة. فقط أخبرنا بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور التي تسمح لك باختيار كلمة مرور جديدة.')}
                </div>

                {status && (
                    <div className="mb-4 p-3 text-sm font-medium text-green-400 bg-green-900/30 rounded-lg border border-green-600 text-center">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                            {t('البريد الإلكتروني')}
                        </label>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full rounded-lg border border-purple-500 bg-black/40 p-3 text-white placeholder-gray-400"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder={t('أدخل بريدك الإلكتروني')}
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mt-4 flex items-center justify-center">
                        <PrimaryButton
                            className="px-5 py-3 rounded-xl bg-purple-600 text-white font-medium shadow-md hover:bg-purple-700 transition-colors w-full justify-center"
                            disabled={processing}
                        >
                            {t('إرسال رابط إعادة التعيين')}
                        </PrimaryButton>
                    </div>

                    <div className="mt-4 text-center">
                        <a
                            href={route('login')}
                            className="text-sm text-purple-400 hover:text-purple-300 underline"
                        >
                            {t('العودة إلى تسجيل الدخول')}
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}