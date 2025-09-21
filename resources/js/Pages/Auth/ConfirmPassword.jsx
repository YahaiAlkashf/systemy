import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function ConfirmPassword() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-black to-purple-900 flex items-center justify-center p-6" dir="rtl">
            <div className="w-full max-w-md bg-black/90 rounded-2xl shadow-2xl p-6 text-white">
                <Head title={t('تأكيد كلمة المرور')} />

                <div className="mb-4 text-sm text-gray-300 text-center">
                    {t('هذه منطقة آمنة في التطبيق. يرجى تأكيد كلمة المرور الخاصة بك قبل المتابعة.')}
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="password" value={t('كلمة المرور')} />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full rounded-lg border border-purple-500 bg-black/40 p-3 text-white placeholder-gray-400"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-end mt-6">
                        <PrimaryButton
                            className="px-5 py-3 rounded-xl bg-purple-600 text-white font-medium shadow-md hover:bg-purple-700 transition-colors"
                            disabled={processing}
                        >
                            {t('تأكيد')}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}