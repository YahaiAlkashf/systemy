import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { SparklesIcon } from "@heroicons/react/24/outline";

export default function LandingPage() {
    const { t, i18n } = useTranslation();
    const [language, setLanguage] = useState("ar");
    const [isVisible, setIsVisible] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("i18nextLng", lang);
        setLanguage(lang);
    };

    useEffect(() => {
        localStorage.setItem("language", language);
    }, [language]);

    useEffect(() => {
        setIsVisible(true);

        const handleScroll = () => {
            const elements = document.querySelectorAll('.fade-in, .slide-in');
            elements.forEach(el => {
                const elementTop = el.getBoundingClientRect().top;
                const elementVisible = 150;
                if (elementTop < window.innerHeight - elementVisible) {
                    el.classList.add('active');
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // إغلاق القائمة عند تغيير حجم النافذة
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-r from-[#0a0f3c] to-black text-white font-tajawal" dir="rtl">
            <Head>
                <title>سيستمي - نظامك لإدارة الأعمال</title>
                <meta name="description" content="سيستمي نظام SaaS متكامل لإدارة المبيعات، الإيجارات، المخزون، الفواتير، والفريق. كل ما تحتاجه لإدارة أعمالك بسهولة وكفاءة." />
                <meta name="keywords" content="سيستم, نظام إدارة, ERP, SaaS, إدارة الأعمال, إدارة المبيعات, إدارة الفواتير, إدارة المخزون, POS, إدارة الإيجارات" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />

                {/* Open Graph for social media */}
                <meta property="og:title" content="سيستمي - نظامك لإدارة الأعمال" />
                <meta property="og:description" content="منصة احترافية لإدارة المبيعات والإيجارات والفواتير بكل سهولة." />
                <meta property="og:type" content="website" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="سيستمي - نظامك لإدارة الأعمال" />
                <meta name="twitter:description" content="منصة SaaS متكاملة لإدارة المبيعات والإيجارات." />
                <meta name="twitter:image" content="/images/preview.png" />
            </Head>

            {/* Header */}
            <header className="bg-black py-4 px-4 md:px-10 flex justify-between items-center sticky top-0 z-50">
                <h1 className="text-xl md:text-2xl font-bold text-primary">{t("سيستمي")}</h1>

                {/* قائمة الجوال */}
                <div className="md:hidden flex items-center space-x-4 space-x-reverse">
                    <div className="relative">
                        <select
                            value={i18n.language}
                            onChange={(e) => changeLanguage(e.target.value)}
                            className="appearance-none w-28 px-3 py-1 pr-6 rounded-xl
                       border border-gray-300 dark:border-gray-700
                       bg-white dark:bg-gray-800
                       text-gray-700 dark:text-gray-200 text-xs font-medium
                       shadow-md transition duration-200
                       hover:border-[#4F2BED]
                       focus:ring-2 focus:ring-[#4F2BED] focus:outline-none"
                        >
                            <option value="ar">🇪🇬 عربي</option>
                            <option value="en">🇬🇧 English</option>
                        </select>
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-white focus:outline-none"
                        aria-label="قائمة التنقل"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* قائمة التنقل - للشاشات الكبيرة */}
                <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
                    <Link href="/" className="text-white hover:text-gray-300 transition-colors">{t("الرئيسية")}</Link>
                    <Link href="#features" className="text-white hover:text-gray-300 transition-colors">{t("المميزات")}</Link>
                    <Link href="#plans" className="text-white hover:text-gray-300 transition-colors">{t("ماذا يوفر سيستمى ")}</Link>
                    <Link href="#faq" className="text-white hover:text-gray-300 transition-colors">{t("الأسئلة")}</Link>
                </nav>

                {/* عناصر التحكم - للشاشات الكبيرة */}
                <div className="hidden md:flex items-center space-x-4 space-x-reverse">
                    <div className="relative">
                        <select
                            value={i18n.language}
                            onChange={(e) => changeLanguage(e.target.value)}
                            className="appearance-none w-36 px-4 py-2 pr-8 rounded-xl
                       border border-gray-300 dark:border-gray-700
                       bg-white dark:bg-gray-800
                       text-gray-700 dark:text-gray-200 text-sm font-medium
                       shadow-md transition duration-200
                       hover:border-[#4F2BED]
                       focus:ring-2 focus:ring-[#4F2BED] focus:outline-none"
                        >
                            <option value="ar">🇪🇬 {t("عربي")}</option>
                            <option value="en">🇬🇧 {t("English")}</option>
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            ▼
                        </span>
                    </div>
                    <Link
                        href={route('register')}
                        className="bg-primary px-5 py-2 rounded-lg font-semibold text-white hover:bg-primary-dark transition-colors"
                    >
                        {t("جرّب الآن")}
                    </Link>
                </div>
            </header>

            {/* قائمة الجوال المنبثقة */}
            <div className={`md:hidden fixed inset-0 z-40 transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* overlay */}
                <div
                    className="absolute inset-0 bg-black bg-opacity-50"
                    onClick={() => setIsMenuOpen(false)}
                ></div>

                {/* القائمة */}
                <div className="absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-black bg-opacity-95 backdrop-blur-sm p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-primary">القائمة</h2>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
                            aria-label="إغلاق القائمة"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="flex flex-col space-y-6">
                        <Link
                            href="/"
                            className="text-white hover:text-primary transition-colors py-3 text-lg border-b border-gray-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {t("الرئيسية")}
                        </Link>
                        <Link
                            href="#features"
                            className="text-white hover:text-primary transition-colors py-3 text-lg border-b border-gray-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {t("المميزات")}
                        </Link>
                        <Link
                            href="#plans"
                            className="text-white hover:text-primary transition-colors py-3 text-lg border-b border-gray-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {t("ماذا يوفر سيستمى")}
                        </Link>
                        <Link
                            href="#faq"
                            className="text-white hover:text-primary transition-colors py-3 text-lg border-b border-gray-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {t("الأسئلة")}
                        </Link>

                        <div className="pt-6 mt-6 border-t border-gray-800">
                            <Link
                                href={route('register')}
                                className="block w-full text-center bg-gradient-to-r from-[#4F2BED] to-[#2B6BED] px-5 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all duration-300 mb-4"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t("جرّب الآن")}
                            </Link>

                            <div className="text-center text-sm text-gray-400">
                                {t("© 2025 سيستمي - جميع الحقوق محفوظة")}
                            </div>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Hero Section */}
            <section className="text-center py-16 md:py-32 px-4 md:px-6 bg-gradient-to-r from-[#0a0f3c] to-black">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">{t("نظامك لإدارة المبيعات والإيجارات")}</h2>
                <p className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-10 text-gray-300">{t("منصة SaaS متكاملة تساعدك تدير شركتك بسهولة وكفاءة.")}</p>
                <Link
                    href={route('register')}
                    className="bg-primary px-6 py-3 md:px-8 md:py-4 rounded-xl text-base md:text-lg font-semibold text-white hover:bg-primary-dark transition-colors inline-block"
                >
                    {t("ابدأ الآن")}
                </Link>
            </section>

            {/* Features Section */}
            <section id="features" className="py-12 md:py-20 px-4 md:px-6 bg-[#111]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-[#1a1a1a] p-4 md:p-6 rounded-xl border border-gray-700 text-center fade-in">
                            <h3 className="text-lg md:text-xl font-semibold text-primary mb-2 md:mb-3">{t(feature.title)}</h3>
                            <p className="text-sm md:text-base text-gray-300">{t(feature.description)}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* What Sistemy Provides Section */}
            <section id="plans" className="py-12 md:py-20 px-4 md:px-6 bg-gradient-to-l from-[#0a0f3c] to-black">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-4 slide-in">{t("ماذا يوفر سيستمي لك؟")}</h2>
                    <p className="text-base md:text-xl text-center text-gray-300 mb-8 md:mb-16 slide-in">{t("منصة متكاملة بكل ما تحتاجه لإدارة أعمالك باحترافية وسهولة")}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                        {services.map((service, index) => (
                            <div key={index} className="bg-[#1a1a1a] p-4 md:p-8 rounded-2xl border border-[#4F2BED] hover:border-primary transition-all duration-300 service-card">
                                <div className="text-center mb-4 md:mb-6">
                                    <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-[#4F2BED] to-[#2B6BED] mb-2 md:mb-4">
                                        <span className="text-xl md:text-2xl">{service.icon}</span>
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-primary">{t(service.title)}</h3>
                                </div>
                                <ul className="space-y-2 md:space-y-4">
                                    {service.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start text-sm md:text-base">
                                            <span className="text-green-400 mt-1 ml-2">✓</span>
                                            <span className="text-gray-300">{t(feature)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-8 md:mt-16 slide-in">
                        <Link
                            href={route('register')}
                            className="bg-gradient-to-r from-[#4F2BED] to-[#2B6BED] px-6 py-3 md:px-8 md:py-4 rounded-xl text-base md:text-lg font-semibold text-white hover:opacity-90 transition-all duration-300 inline-block"
                        >
                            {t("اكتشف المزيد من المميزات")}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-12 md:py-20 px-4 md:px-6 bg-[#111] text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-16 slide-in">{t("ماذا يقول عملاؤنا")}</h2>
                <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-[#1a1a1a] p-4 md:p-8 rounded-xl border border-gray-700 fade-in">
                            <p className="text-base md:text-lg mb-3 md:mb-4 text-gray-300">"{t(testimonial.text)}"</p>
                            <strong className="text-primary">- {t(testimonial.author)}</strong>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-12 md:py-20 px-4 md:px-6 bg-[#0a0f3c]">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-16 slide-in">{t("الأسئلة الشائعة")}</h2>
                <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-[#1a1a1a] p-4 md:p-8 rounded-xl border border-gray-700 fade-in">
                            <h4 className="text-lg md:text-xl font-semibold text-primary mb-2 md:mb-3">{t(faq.question)}</h4>
                            <p className="text-sm md:text-base text-gray-300">{t(faq.answer)}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black py-6 md:py-8 text-center text-gray-400 px-4">
                <p className="text-sm md:text-base">{t("© 2025 سيستمي - جميع الحقوق محفوظة | تواصل معنا: info@sistemy.com")}</p>
            </footer>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .fade-in {
                    opacity: 0;
                    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
                }

                .fade-in.active {
                    opacity: 1;
                    animation: fadeIn 0.8s ease-out forwards;
                }

                .slide-in {
                    opacity: 0;
                    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                }

                .slide-in.active {
                    opacity: 1;
                    animation: slideIn 0.8s ease-out forwards;
                }

                .service-card {
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 30px rgba(79, 43, 237, 0.1);
                }

                .service-card:hover {
                    box-shadow: 0 15px 40px rgba(79, 43, 237, 0.2);
                    transform: translateY(-5px);
                }

                /* تحسينات إضافية للجوال */
                @media (max-width: 640px) {
                    .service-card {
                        margin-bottom: 1rem;
                    }

                    .service-card:hover {
                        transform: none;
                    }
                }
            `}</style>
        </div>
    );
}

const features = [
    {
        title: "إدارة العملاء",
        description: "CRM بسيط لتتبع العملاء والمدفوعات."
    },
    {
        title: "التقارير المالية",
        description: "احسب صافي الأرباح وولّد تقارير الضرائب."
    },
    {
        title: "إشعارات ذكية",
        description: "تذكير بالمدفوعات وتنبيهات مهمة لعملك."
    },
    {
        title: "لوحة تحكم سهلة",
        description: "واجهة بسيطة تناسب أي مستخدم."
    },
    {
        title: "إدارة المخزون",
        description: "تتبع المبيعات والإيجارات باحترافية."
    },
    {
        title: "تقارير متقدمة",
        description: "تقارير مفصلة مع رسوم بيانية لاتخاذ قرارات أفضل."
    }
];

const services = [
    {
        icon: "📊",
        title: "إدارة متكاملة",
        features: [
            "إدارة العملاء والموردين",
            "تتبع المبيعات والمشتريات",
            "إدارة الفواتير والمدفوعات",
            "تقارير مالية مفصلة"
        ]
    },
    {
        icon: "📦",
        title: "إدارة المخزون",
        features: [
            "تتبع حركة المخزون بدقة",
            "تنبيهات نفاذ المنتجات",
            "إدارة الفروع والمستودعات",
            "جرد المخزون آلياً"
        ]
    },
    {
        icon: "👥",
        title: "إدارة الفريق",
        features: [
            "إدارة الصلاحيات والمستخدمين",
            "توزيع المهام والمشاريع",
            "تتبع أداء الموظفين",
            "تقارير الإنتاجية",
            "دردشة داخلية لاعضاء الفريق",
            "توزيع المهام وارسال اشعارات للاعضاء بالمهام",
        ]
    },
    {
        icon: "📈",
        title: "التحليلات والتقارير",
        features: [
            "لوحات تحكم قابلة للتخصيص",
            "رسوم بيانية تفاعلية",
            "تقارير قابلة للتصدير",
        ]
    },
    {
        icon: "🔔",
        title: "التنبيهات والإشعارات",
        features: [
            "تنبيهات المدفوعات",
            "إشعارات بالمهام المستحقة",
            "تنبيهات المخزون",
            "إشعارات على البريد والواتساب"
        ]
    },
    {
        icon: "✨",
        title: "مميزات متقدمة",
        features: [
            "اتاحة API لربط السيستم بانظمة خارجية",
            "الربط بواتساب للاعمال وارسال رسائل للعملاء بضغطة زر",
            "تصدير البيانات والفواتير بصيغة PDF, Excel بضغطة زر"
        ]
    }
];

const testimonials = [
    {
        text: "سيستمي ساعدنا ننظم كل عمليات الإيجار والتحصيل بسهولة. فرق كبير في وقتنا ومجهودنا!",
        author: "شركة الريادة العقارية"
    },
    {
        text: "منصة احترافية وسهلة الاستخدام، والتقارير وفرتلنا رؤية واضحة للأرباح.",
        author: "شركة بلس للتسويق"
    }
];

const faqs = [
    {
        question: "هل يمكن تجربة النظام قبل الاشتراك؟",
        answer: "نعم، نوفر فترة تجربة مجانية لبعض العملاء المختارين."
    },
    {
        question: "هل النظام يدعم شركات مختلفة الأنشطة؟",
        answer: "بالتأكيد، سيستمي مرن ويدعم إدارة العقارات، المخازن، والمبيعات."
    }
];
