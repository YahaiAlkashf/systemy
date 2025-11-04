import React, { useState, useEffect } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

export default function Plans() {
    const [showModal, setShowModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [country, setCountry] = useState(null);
    const [isEgypt, setIsEgypt] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentError, setPaymentError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [couponData, setCouponData] = useState(null);
    const [couponError, setCouponError] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const { auth, app_url } = usePage().props;
    const [allPlans, setAllPlans] = useState([]);
    const [type,setType]=useState("monthly");
    const { t } = useTranslation();

    const showAllPlans = async () => {
        try {
            const response = await axios.get(`${app_url}/plans`);
            setAllPlans(response.data.plans);
        } catch (error) {
            console.log(error);
        }
    };

    const handleSubscribe = async (plan) => {
        if (plan.name === 'basic' && !auth.user.company.trial_used) {
            try {
                const response = await axios.post(`${app_url}/subscription/basic`);
                if (response.data.success) {
                    window.location.href = '/retailFlow';
                }
            } catch (error) {
                console.log(error);
                setPaymentError(t("حدث خطأ أثناء الاشتراك في الباقة الأساسية"));
            }
        } else {
            setSelectedPlan(plan);
            setShowModal(true);
            setPaymentError(null);
            setCouponError(null);
            setCouponCode("");
            setCouponData(null);
        }
    };

const applyCoupon = async () => {
    if (!couponCode.trim()) {
        setCouponError(t("كود الخصم مطلوب"));
        return;
    }

    setCouponLoading(true);
    setCouponError(null);

    try {
        const response = await axios.post(`${app_url}/subscription/coupons`, {
            code: couponCode,
            planName: selectedPlan?.name,
            type:type
        });

        if (response.data && response.data.success) {

            const priceInEgz = parseFloat(response.data.coupon?.price_in_egp || selectedPlan?.priceInsideEgypt);
            const priceOutsideEgz = parseFloat(response.data.coupon?.price_outside_egp || selectedPlan?.priceOutsideEgypt);

            if (priceInEgz === 0 || priceOutsideEgz === 0) {

                setCouponData(response.data.coupon);


                try {
                    const subscriptionResponse = await axios.post(`${app_url}/subscription/free`, {
                        plan: selectedPlan?.name,
                        coupon_code: couponCode,
                        type:type
                    });

                    if (subscriptionResponse.data.success) {

                        setTimeout(() => {
                            switch (auth.user.system_type) {
                                case 'clubs':
                                    window.location.href = '/clubs';
                                    break;
                                case 'manager':
                                    window.location.href = '/admin';
                                    break;
                                case 'retail':
                                case 'services':
                                case 'education':
                                case 'realEstate':
                                case 'delivery':
                                case 'travels':
                                case 'gym':
                                case 'hotel':
                                    window.location.href = '/retailFlow';
                                    break;
                                default:
                                    window.location.href = '/';
                            }
                        }, 1000);
                    }
                } catch (error) {
                    console.error('Free subscription error:', error);
                    setCouponError(t("حدث خطأ أثناء تفعيل الاشتراك المجاني"));
                }
                return;
            }

            setCouponData(response.data.coupon);
            setCouponError(null);
        } else {
            const errorMessage = response.data?.errors?.code?.[0] ||
            t("كود الخصم غير صالح");
            setCouponError(errorMessage);
        }
    } catch (error) {
        if (error.response?.status === 422) {
            const serverError = error.response.data.errors;
            setCouponError(serverError.code ? serverError.code[0] : t("كود الخصم غير صالح"));
        } else if (error.response?.data?.message) {
            setCouponError(error.response.data.message);
        } else {
            setCouponError(t("حدث خطأ أثناء التحقق من الكوبون"));
        }
        console.error('Coupon error:', error);
    } finally {
        setCouponLoading(false);
    }
};

    useEffect(() => {
        setIsLoading(true);
        showAllPlans();
        fetch("https://ipapi.co/json/")
            .then((res) => res.json())
            .then((data) => {
                setCountry(data.country_name);
                setIsEgypt(data.country_code === "EG");
                setIsLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setIsLoading(false);
            });
    }, []);

    const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

    const handlePayment = async (method) => {
        setPaymentError(null);
        setIsProcessing(true);

        let finalPriceInsideEgypt = selectedPlan?.priceInsideEgypt || 0;
        let finalPriceOutsideEgypt = selectedPlan?.priceOutsideEgypt || 0;

        if (couponData) {
            finalPriceInsideEgypt = couponData.price_in_egp || finalPriceInsideEgypt;
            finalPriceOutsideEgypt = couponData.price_outside_egp || finalPriceOutsideEgypt;
        }

        try {
            let response;

            if (method === "stripe") {
                response = await axios.post("/stripe/checkout", {
                    plan: selectedPlan?.name,
                    country: country,
                    coupon: couponCode || null,
                    price_in_egp: finalPriceInsideEgypt,
                    price_outside_egp: finalPriceOutsideEgypt
                });

                if (response.data.error) {
                    setPaymentError(response.data.error);
                    setIsProcessing(false);
                    return;
                }

                const stripe = await stripePromise;
                const result = await stripe.redirectToCheckout({
                    sessionId: response.data.id,
                });

                if (result.error) {
                    setPaymentError(t(`خطأ في Stripe: ${result.error.message}`));
                    setIsProcessing(false);
                }
            } else if (method === "paymob") {
                response = await axios.post("/paymob/checkout", {
                    plan: selectedPlan?.name,
                    country: country,
                    coupon: couponCode || null,
                    price_in_egp: finalPriceInsideEgypt,
                    price_outside_egp: finalPriceOutsideEgypt
                });

                if (response.data.error) {
                    setPaymentError(response.data.error);
                    setIsProcessing(false);
                    return;
                }

                if (response.data.redirect_url) {
                    window.location.href = response.data.redirect_url;
                } else if (response.data.iframe_url) {
                    window.open(response.data.iframe_url, "_blank");
                    setShowModal(false);
                } else {
                    setPaymentError(t("لم يتم استرداد رابط الدفع من الخادم"));
                    setIsProcessing(false);
                }
            } else if (method === "fawry") {
                response = await axios.post("/fawry/create-payment", {
                    plan: selectedPlan?.name,
                    coupon: couponCode || null,
                    price_in_egp: finalPriceInsideEgypt
                });

                if (response.data.error) {
                    setPaymentError(response.data.error);
                    setIsProcessing(false);
                    return;
                }

                if (response.data.success) {
                    window.location.href = response.data.payment_url;
                } else {
                    setPaymentError(t("فشل في إنشاء طلب الدفع مع فوري"));
                    setIsProcessing(false);
                }
            }
        } catch (error) {
            console.error(`${method} payment error:`, error);
            if (error.response?.data?.error) {
                setPaymentError(error.response.data.error);
            } else {
                setPaymentError(t("حدث خطأ أثناء عملية الدفع. يرجى المحاولة مرة أخرى."));
            }
            setIsProcessing(false);
        }
    };

    let plans = [];
    if (auth.user.system_type === "clubs") {
        plans = [
            {
                name2: t("الباقة المتقدمة"),
                name: "premium",
                description: t("مناسبة لاداراة التواصل بين اعضاء الشركات والمؤسسات وتوزيع المهام"),
                priceInsideEgypt: allPlans[1]?.price_in_egp,
                priceInsideEgyptYearly: allPlans[1]?.price_year_in_egp,
                priceOutsideEgypt: allPlans[1]?.price_outside_egp,
                priceOutsideEgyptYearly: allPlans[1]?.price_year_outside_egp,
                icon: (
                    <svg
                        className="w-12 h-12 mx-auto text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                    </svg>
                ),
                features: [
                    t("امكانية اضافة اعضاء مع التحكم فى صلاحياتهم"),
                    t("اعطاء مهام للأعضاء ومتابعتهم"),
                    t("إرسال اشعارات للاعضاء فى حالة التاخر عن تسليم المهام"),
                    t("دعم فنى 24/7"),
                    t("مجموعة دردشة بين اعضاء الشركة"),
                    t("اضافة انشطة وتحديد موعدها"),
                    t("مكتبة لرفع الملفات "),
                ]
            },
        ];
    } else {
        plans = [
            {
                name2: t("الباقة الأساسية"),
                name: "basic",
                description: t("مناسبة للشركات الناشئة والصغيرة"),
                priceInsideEgypt: allPlans[0]?.price_in_egp,
                priceInsideEgyptYearly: allPlans[0]?.price_year_in_egp,
                priceOutsideEgypt: allPlans[0]?.price_outside_egp,
                priceOutsideEgyptYearly: allPlans[0]?.price_year_outside_egp,
                icon: (
                    <svg
                        className="w-12 h-12 mx-auto text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                    </svg>
                ),
                features: [
                    t("ادارة عملاء (CRM بسيط)"),
                    t("تتبع الفواتير والمدفوعات"),
                    t("تقارير مالية اساسية"),
                    t("دعم فنى عبر الايميل"),
                    t("وصول مستخدم واحد"),
                ],

            },
            {
                name2: t("الباقة المتقدمة"),
                name: "premium",
                description: t("مناسبة للشركات المتوسطة والمتنامية"),
                priceInsideEgypt: allPlans[1]?.price_in_egp,
                priceInsideEgyptYearly: allPlans[1]?.price_year_in_egp,
                priceOutsideEgypt: allPlans[1]?.price_outside_egp,
                priceOutsideEgyptYearly: allPlans[1]?.price_year_outside_egp,
                icon: (
                    <svg
                        className="w-12 h-12 mx-auto text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                    </svg>
                ),
                features: [
                    t("كل المميزات الأساسية + تقارير متقدمة"),
                    t("ادارة المخزون والمبيعات"),
                    t("تنبيهات   عند اقتراب نفاذ المخزون"),
                    t("لوحة تقارير متقدمة بالرسوم البيانية"),
                    t("دعم فنى 24/7"),
                    t("وصول حتى 5 مستخدمين"),
                ],
            },
            {
                name2: t("الباقة المميزة"),
                name: "vip",
                description: t("مناسبة للشركات الكبيرة والمؤسسات"),
                priceInsideEgypt: allPlans[2]?.price_in_egp,
                priceInsideEgyptYearly: allPlans[2]?.price_year_in_egp,
                priceOutsideEgypt: allPlans[2]?.price_outside_egp,
                priceOutsideEgyptYearly: allPlans[2]?.price_year_outside_egp,
                icon: (
                    <svg
                        className="w-12 h-12 mx-auto text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                ),
                features: [
                    t("كل مميزات الباقة المتقديمة"),
                    t("نظام تقارير ضريبية وحساب صافى الارباح"),
                    t("API مخصصة للشركات"),
                    t("دعم اولى VIP"),
                    t("وصول غير محدود للمستخدمين"),
                    t("قوالب فواتير مخصصة"),
                    t("تحكم كامل بالعلامة التجارية على الفواتير"),
                    t("تصدير البيانات PDF/Excel بضغطة زر"),
                    t("الربط بواتساب للاعمال ")
                ]
            },
        ];
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white" dir="rtl">
            <section id="plans" className="py-12 px-6 bg-gray-900 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">
                    {t("اختر الباقة المناسبة لعملك")}
                </h2>
                <p className="text-gray-300 mb-16">
                    {t("أسعارنا تنافسية ومناسبة لكل أنواع الأعمال")}
                </p>
                <div className="mb-8">
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setType('yearly')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                                type === 'yearly'
                                    ? "bg-primary text-white"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                        >
                            {t("اشتراك سنوى")}
                        </button>
                        <button
                            onClick={() => setType('monthly')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                                type === 'monthly'
                                    ? "bg-primary text-white"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                        >
                            {t("اشتراك شهرى")}
                        </button>
                    </div>
                </div>
                {isLoading ? (
                    <div className="text-white text-lg">
                        {t("جاري تحميل الخطط...")}
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`bg-[#1a1a1a] p-8 rounded-xl border ${
                                    index === 1
                                        ? "border-primary transform scale-105 shadow-lg shadow-primary/30"
                                        : "border-gray-700"
                                } w-80 relative`}
                            >
                                {index === 0 && !auth.user.trial_used && (
                                    <div className="absolute -top-4 right-1/2 transform translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                                        {t("تجربة مجانية 7 أيام")}
                                    </div>
                                )}

                                <div className="mb-6">{plan.icon}</div>

                                <h3 className="text-2xl font-semibold text-primary mb-4">
                                    {plan.name2}
                                </h3>
                                <p className="text-gray-300 mb-4">
                                    {plan.description}
                                </p>

                                <ul className="text-right mb-6 space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start"
                                        >
                                            <svg
                                                className="w-5 h-5 mt-0.5 text-primary flex-shrink-0 ml-2"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="text-gray-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <p className="text-xl font-bold mb-6 text-white">
                                    {type === 'yearly' ? (
                                        <>
                                        {isEgypt
                                            ? `${plan.priceInsideEgyptYearly} جنيه / سنة`
                                            : `$${plan.priceOutsideEgyptYearly} / year`}
                                        </>
                                    ) : (
                                        <>
                                        {isEgypt
                                            ? `${plan.priceInsideEgypt} جنيه / شهر`
                                            : `$${plan.priceOutsideEgypt} / month`}
                                        </>
                                    )}
                                </p>


                                <button
                                    onClick={() => handleSubscribe(plan)}
                                    className={`${
                                        index === 1
                                            ? "bg-primary hover:bg-primary-dark"
                                            : "bg-gray-700 hover:bg-gray-600"
                                    } px-6 py-3 rounded-xl font-semibold text-white transition-colors inline-block w-full`}
                                    disabled={plan.name === 'basic' && auth.user.trial_used && auth.user.subscription !== 'basic'}
                                >
                                    {plan.name === 'basic' && !auth.user.company.trial_used
                                        ? t("ابدأ التجربة المجانية")
                                        : auth.user.subscription === plan.name
                                        ? t("الباقة مفعلة")
                                        : t("اشترك الآن")
                                    }
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

{showModal && (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-300">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 h-full overflow-auto rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl transform transition-transform duration-300 scale-100 text-white border border-gray-700" dir="rtl">

            <div className="text-center">
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {t("اختر وسيلة الدفع")}
                </h3>
                <p className="mb-3 text-gray-300">
                    {t("لـ")} {selectedPlan?.name2}
                </p>
             <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <h4 className="text-lg font-semibold mb-2 text-blue-400">{t("للتواصل مع الإدارة")}</h4>
                    <p className="text-sm text-gray-300 mb-3">لديك استفسار أو تحتاج مساعدة؟ فريق الدعم جاهز لمساعدتك</p>

                    <button
                        onClick={() => window.open('https://wa.me/+971556127735', '_blank')}
                        className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.017 2.047c-5.511 0-9.98 4.468-9.98 9.98 0 1.766.465 3.42 1.277 4.85L2 22l5.255-1.386c1.425.802 3.078 1.267 4.843 1.267 5.512 0 9.98-4.468 9.98-9.98s-4.468-9.98-9.98-9.98zm-.005 1.818c4.52 0 8.162 3.642 8.162 8.162s-3.642 8.162-8.162 8.162c-1.6 0-3.102-.46-4.367-1.257l-.3-.18-3.12.82.834-3.047-.197-.314c-.87-1.322-1.362-2.87-1.362-4.524 0-4.52 3.642-8.162 8.162-8.162zM8.898 7.462c-.24 0-.36.117-.554.39-.195.273-1.04 1.016-1.04 2.476 0 1.46 1.06 2.87 1.208 3.07.148.195 2.09 3.332 5.16 4.562 2.578 1.03 3.105.82 3.652.78.547-.04 1.76-.72 2.01-1.415.25-.695.25-1.29.175-1.415-.074-.125-.273-.195-.566-.34-.293-.145-1.76-.87-2.03-.967-.274-.1-.47-.15-.664.146-.195.293-.75.967-.92 1.17-.17.2-.34.224-.625.075-.293-.15-1.235-.455-2.35-1.45-.87-.78-1.46-1.74-1.63-2.04-.17-.29-.018-.45.13-.59.133-.133.293-.35.44-.525.146-.175.195-.29.293-.487.097-.195.05-.367-.025-.515-.075-.146-.664-1.595-.91-2.18-.24-.57-.48-.475-.664-.484l-.566-.01z"/>
                        </svg>
                        {t("تواصل عبر واتساب")}
                    </button>
                </div>


                <div className="mb-6 bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <h4 className="text-lg font-semibold mb-2 text-yellow-400">
                        {t("أدخل كود الخصم")}
                    </h4>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder={t("أدخل كود الخصم هنا")}
                            className="flex-1 px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            disabled={couponLoading}
                        />
                        <button
                            onClick={applyCoupon}
                            disabled={couponLoading}
                            className="px-4 py-2 bg-yellow-500 text-gray-900 font-medium rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {couponLoading ? t("...") : t("تطبيق")}
                        </button>
                    </div>
                    {couponError && (
                        <div className="flex items-center mt-1 text-red-400 text-sm">
                            <ExclamationCircleIcon className="h-4 w-4 ml-1" />
                            {couponError}
                        </div>
                    )}
                    {couponData && (
                        <div className="flex items-center mt-1 text-green-400 text-sm">
                            <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {t("كود الخصم تم تطبيقه بنجاح!")}
                        </div>
                    )}
                </div>

                {couponData ? (
                    <div className="mb-4">
                        <p className="text-gray-400 line-through">
                                    {type === 'yearly' ? (
                                        <>
                                        {isEgypt
                                            ? `${selectedPlan.priceInsideEgyptYearly} جنيه / سنة`
                                            : `$${selectedPlan.priceOutsideEgyptYearly} / year`}
                                        </>
                                    ) : (
                                        <>
                                        {isEgypt
                                            ? `${selectedPlan.priceInsideEgypt} جنيه / شهر`
                                            : `$${selectedPlan.priceOutsideEgypt} / month`}
                                        </>
                                    )}
                        </p>
                        <p className="text-2xl font-bold text-green-400">
                                    {type === 'yearly' ? (
                                        <>
                                        {isEgypt
                                            ? `${selectedPlan.priceInsideEgyptYearly} جنيه / سنة`
                                            : `$${selectedPlan.priceOutsideEgyptYearly} / year`}
                                        </>
                                    ) : (
                                        <>
                                        {isEgypt
                                            ? `${selectedPlan.priceInsideEgypt} جنيه / شهر`
                                            : `$${selectedPlan.priceOutsideEgypt} / month`}
                                        </>
                                    )}
                        </p>
                        <p className="text-sm text-green-400 mt-1">
                            {t("خصم مطبق بنجاح!")}
                        </p>
                    </div>
                ) : (
                    <p className="mb-6 text-2xl font-bold text-purple-400">
                                    {type === 'yearly' ? (
                                        <>
                                        {isEgypt
                                            ? `${selectedPlan.priceInsideEgyptYearly} جنيه / سنة`
                                            : `$${selectedPlan.priceOutsideEgyptYearly} / year`}
                                        </>
                                    ) : (
                                        <>
                                        {isEgypt
                                            ? `${selectedPlan.priceInsideEgypt} جنيه / شهر`
                                            : `$${selectedPlan.priceOutsideEgypt} / month`}
                                        </>
                                    )}
                    </p>
                )}

                {paymentError && (
                    <div className="bg-red-900 border-l-4 border-red-500 text-red-100 p-4 mb-4 text-right rounded-lg">
                        <p>{paymentError}</p>
                    </div>
                )}

                <div className="space-y-4 mb-6">
                    {/* Stripe */}
                    <button
                        onClick={() => handlePayment("stripe")}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                    >
                        {isProcessing ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                {t("جاري المعالجة...")}
                            </>
                        ) : (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="text-white"
                                >
                                    <path d="M12.876 13.59l2.211-2.211h-5.087v-1.758h5.087l-2.211-2.211 1.244-1.244 4.411 4.411-4.411 4.411-1.244-1.244zm-10.876-11.59v20h18v-20h-18zm16 18h-14v-16h14v16z" />
                                </svg>
                                {t("الدفع بـ Stripe")}
                            </>
                        )}
                    </button>

                    {/* Paymob */}
                    <button
                        onClick={() => handlePayment("paymob")}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                    >
                        {isProcessing ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                {t("جاري المعالجة...")}
                            </>
                        ) : (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="text-white"
                                >
                                    <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1 17l-5-5 1.5-1.5 3.5 3.5 7.5-7.5 1.5 1.5-9 9z" />
                                </svg>
                                {t("الدفع بـ Paymob")}
                            </>
                        )}
                    </button>

                    {/* Fawry */}
                    {isEgypt && (
                        <button
                            onClick={() => handlePayment("fawry")}
                            disabled={isProcessing}
                            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 px-4 rounded-xl hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                        >
                            {isProcessing ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    {t("جاري المعالجة...")}
                                </>
                            ) : (
                                <>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="text-white"
                                    >
                                        <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1 6h2v8h-2v-8zm1 12.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
                                    </svg>
                                    {t("الدفع بـ Fawry")}
                                </>
                            )}
                        </button>
                    )}


                    <div className="pt-4 border-t border-gray-600">
                        <h4 className="text-lg font-semibold mb-3 text-green-400">{t("المحافظ الإلكترونية")}</h4>
                        <div className="grid grid-cols-3 gap-3">

                            <button
                                onClick={() => handlePayment("vodafone_cash")}
                                disabled={isProcessing}
                                className="bg-gradient-to-r from-red-600 to-red-500 text-white p-3 rounded-lg hover:from-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex flex-col items-center justify-center gap-1 shadow-md"
                            >
                                <div className="bg-white rounded-full p-1 w-10 h-10 flex items-center justify-center">
                                    <span className="text-red-600 font-bold text-lg">V</span>
                                </div>
                                <span className="text-xs">فودافون كاش</span>
                            </button>
                            <button
                                onClick={() => handlePayment("orange_cash")}
                                disabled={isProcessing}
                                className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-3 rounded-lg hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex flex-col items-center justify-center gap-1 shadow-md"
                            >
                                <div className="bg-white rounded-full p-1 w-10 h-10 flex items-center justify-center">
                                    <span className="text-orange-600 font-bold text-lg">O</span>
                                </div>
                                <span className="text-xs">أورانج كاش</span>
                            </button>

                            <button
                                onClick={() => handlePayment("orange_cash")}
                                disabled={isProcessing}
                                className="bg-gradient-to-r from-green-500 to-green-500 text-white p-3 rounded-lg hover:from-orange-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex flex-col items-center justify-center gap-1 shadow-md"
                            >
                                <div className="bg-white rounded-full p-1 w-10 h-10 flex items-center justify-center">
                                    <span className="text-green-600 font-bold text-lg">O</span>
                                </div>
                                <span className="text-xs">اتصالات كاش</span>
                            </button>

                            <button
                                onClick={() => handlePayment("instapay")}
                                disabled={isProcessing}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex flex-col items-center justify-center gap-1 shadow-md"
                            >
                                <div className="bg-white rounded-full p-1 w-10 h-10 flex items-center justify-center">
                                    <span className="text-purple-600 font-bold text-lg">I</span>
                                </div>
                                <span className="text-xs">InstaPay</span>
                            </button>
                        </div>
                    </div>
                </div>





                <div className="mb-6">
                    <p className="text-sm text-gray-400 mb-2">
                        {t("البطاقات المقبولة")}
                    </p>
                    <p className="text-sm text-gray-400 mb-3">
                        {t("نوفّر جميع طرق الدفع")}
                    </p>
                    <div className="flex justify-center space-x-2">
                        <div className="bg-gray-700 p-2 rounded-lg">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="24"
                                viewBox="0 0 32 24"
                            >
                                <path
                                    fill="#ff5f00"
                                    d="M20 0h-8c-2.209 0-4 1.791-4 4v16c0 2.209 1.791 4 4 4h8c2.209 0 4-1.791 4-4v-16c0-2.209-1.791-4-4-4z"
                                />
                                <path
                                    fill="#eb001b"
                                    d="M12 0h-8c-2.209 0-4 1.791-4 4v16c0 2.209 1.791 4 4 4h8c2.209 0 4-1.791 4-4v-16c0-2.209-1.791-4-4-4z"
                                />
                                <path
                                    fill="#f79e1b"
                                    d="M16 9a7 7 0 1 0 0 6 7 7 0 0 0 0-6z"
                                />
                            </svg>
                        </div>
                        <div className="bg-gray-700 p-2 rounded-lg">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="24"
                                viewBox="0 0 32 24"
                            >
                                <path
                                    fill="#0061a8"
                                    d="M28 0h-24c-2.209 0-4 1.791-4 4v16c0 2.209 1.791 4 4 4h24c2.209 0 4-1.791 4-4v-16c0-2.209-1.791-4-4-4z"
                                />
                                <path
                                    fill="#0079c1"
                                    d="M16 9a7 7 0 1 0 0 6 7 7 0 0 0 0-6z"
                                />
                                <path
                                    fill="#e60028"
                                    d="M28 0h-12v24h12c2.209 0 4-1.791 4-4v-16c0-2.209-1.791-4-4-4z"
                                />
                            </svg>
                        </div>
                        <div className="bg-gray-700 p-2 rounded-lg">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="24"
                                viewBox="0 0 32 24"
                            >
                                <path
                                    fill="#012169"
                                    d="M28 0h-24c-2.209 0-4 1.791-4 4v16c0 2.209 1.791 4 4 4h24c2.209 0 4-1.791 4-4v-16c0-2.209-1.791-4-4-4z"
                                />
                                <path
                                    fill="#fff"
                                    d="M16 9a7 7 0 1 0 0 6 7 7 0 0 0 0-6z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setShowModal(false);
                        setIsProcessing(false);
                        setCouponData(null);
                        setCouponCode("");
                        setCouponError(null);
                        setPaymentError(null);
                    }}
                    className="text-gray-400 hover:text-red-400 transition-colors duration-200 flex items-center justify-center mx-auto"

                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {t("إلغاء")}
                </button>
            </div>
        </div>
    </div>
)}

            <footer className="bg-gray-800 py-8 text-center text-gray-400">
                <p>©  {t(" سيستمى. جميع الحقوق محفوظة.")}</p>
            </footer>
        </div>
    );
}
