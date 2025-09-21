import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function ResetPassword({ token, email }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-black to-purple-900 flex items-center justify-center p-6" dir="rtl">
            <div className="w-full max-w-md bg-black/90 rounded-2xl shadow-2xl p-6 text-white">
                <Head title={t('إعادة تعيين كلمة المرور')} />

                <h2 className="text-2xl font-semibold mb-6 text-center text-purple-400">
                    {t('إعادة تعيين كلمة المرور')}
                </h2>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="email" value={t('البريد الإلكتروني')} />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full rounded-lg border border-purple-500 bg-black/40 p-3 text-white placeholder-gray-400"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            disabled
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value={t('كلمة المرور الجديدة')} />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full rounded-lg border border-purple-500 bg-black/40 p-3 text-white placeholder-gray-400"
                            autoComplete="new-password"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            placeholder={t('أدخل كلمة المرور الجديدة')}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="password_confirmation"
                            value={t('تأكيد كلمة المرور الجديدة')}
                        />
                        <TextInput
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full rounded-lg border border-purple-500 bg-black/40 p-3 text-white placeholder-gray-400"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                            placeholder={t('أعد إدخال كلمة المرور الجديدة')}
                        />
                        <InputError
                            message={errors.password_confirmation}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6">
                        <PrimaryButton
                            className="w-full px-5 py-3 rounded-xl bg-purple-600 text-white font-medium shadow-md hover:bg-purple-700 transition-colors justify-center"
                            disabled={processing}
                        >
                            {t('تعيين كلمة المرور الجديدة')}
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