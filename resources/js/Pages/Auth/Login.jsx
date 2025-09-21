import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function Login({ status, canResetPassword }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-black to-purple-900 flex items-center justify-center p-6" dir="rtl">
            <div className="w-full max-w-md bg-black/90 rounded-2xl shadow-2xl p-8 text-white">
                <Head title={t('تسجيل الدخول')} />

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-purple-400">{t('مرحباً بعودتك')}</h2>
                    <p className="text-sm text-gray-300 mt-2">{t('سجل الدخول لإدارة شركتك ومتابعة أعمالك')}</p>
                </div>

                {status && (
                    <div className="mb-4 p-3 bg-green-900/30 border border-green-600 rounded-lg text-sm text-green-400">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <InputLabel htmlFor="email" value={t('البريد الإلكتروني')} className="text-gray-300" />
                        
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full rounded-lg border border-purple-500 bg-black/40 p-3 text-white placeholder-gray-400 focus:border-purple-400 focus:ring focus:ring-purple-400 focus:ring-opacity-50"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder={t('ادخل بريدك الإلكتروني')}
                        />

                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value={t('كلمة المرور')} className="text-gray-300" />
                        
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full rounded-lg border border-purple-500 bg-black/40 p-3 text-white placeholder-gray-400 focus:border-purple-400 focus:ring focus:ring-purple-400 focus:ring-opacity-50"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder={t('ادخل كلمة المرور')}
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="border-purple-500 bg-black/40 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ms-2 text-sm text-gray-300">
                                {t('تذكرني')}
                            </span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="rounded-md text-sm text-purple-400 underline hover:text-purple-300 transition-colors"
                            >
                                {t('نسيت كلمة المرور؟')}
                            </Link>
                        )}
                    </div>

                    <PrimaryButton 
                        className="w-full px-5 py-3 rounded-xl bg-purple-600 text-white font-medium shadow-md hover:bg-purple-700 transition-colors" 
                        disabled={processing}
                    >
                        {processing ? t('جاري التسجيل...') : t('تسجيل الدخول')}
                    </PrimaryButton>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-400">
                            {t('ليس لديك حساب؟')}{' '}
                            <Link
                                href={route('register')}
                                className="text-purple-400 underline hover:text-purple-300 transition-colors"
                            >
                                {t('إنشاء حساب جديد')}
                            </Link>
                        </p>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-700">
                    <h4 className="text-sm font-medium text-purple-400 mb-3">{t('لماذا تختار سيستمي؟')}</h4>
                    <ul className="text-xs text-gray-400 space-y-1">
                        <li>{t('• لوحة تحكم متكاملة لإدارة أعمالك')}</li>
                        <li>{t('• تقارير مفصلة وأدوات متقدمة')}</li>
                        <li>{t('• دعم فني متاح على مدار الساعة')}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
