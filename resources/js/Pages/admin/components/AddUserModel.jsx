import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import { useState, useRef, useEffect } from "react";
import { Search, UserPlus, Building, Dumbbell, Home, ShoppingCart, Heart, Film, Car, Coffee, BookOpen, ChevronDown, MapPin, UsersIcon } from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export default function AddUserModel({
    closeModal,
    mode = "add",
    customer = null,
    showAllCustomers
}) {
    const { app_url } = usePage().props;
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset, put } = useForm({
        name: customer?.name || "",
        email: customer?.email || "",
        password: "",
        password_confirmation: "",
        company_name: customer?.company?.company_name || "",
        phone: customer?.company?.phone || "",
        country: customer?.country || "EG",
        address: customer?.company?.address || "",
        logo: null,
        system_type: customer?.system_type || ""
    });

    const countries = [
        { code: "EG", name: t("مصر"), flag: "🇪🇬" },
        { code: "SA", name: t("السعودية"), flag: "🇸🇦" },
        { code: "AE", name: t("الإمارات"), flag: "🇦🇪" },
        { code: "QA", name: t("قطر"), flag: "🇶🇦" },
        { code: "KW", name: t("الكويت"), flag: "🇰🇼" },
        { code: "BH", name: t("البحرين"), flag: "🇧🇭" },
        { code: "OM", name: t("عمان"), flag: "🇴🇲" },
        { code: "JO", name: t("الأردن"), flag: "🇯🇴" },
        { code: "LB", name: t("لبنان"), flag: "🇱🇧" },
        { code: "SY", name: t("سوريا"), flag: "🇸🇾" },
        { code: "IQ", name: t("العراق"), flag: "🇮🇶" },
        { code: "PS", name: t("فلسطين"), flag: "🇵🇸" },
        { code: "YE", name: t("اليمن"), flag: "🇾🇪" },
        { code: "DZ", name: t("الجزائر"), flag: "🇩🇿" },
        { code: "MA", name: t("المغرب"), flag: "🇲🇦" },
        { code: "TN", name: t("تونس"), flag: "🇹🇳" },
        { code: "LY", name: t("ليبيا"), flag: "🇱🇾" },
        { code: "SD", name: t("السودان"), flag: "🇸🇩" },
        { code: "SO", name: t("الصومال"), flag: "🇸🇴" },
        { code: "US", name: t("الولايات المتحدة"), flag: "🇺🇸" },
        { code: "GB", name: t("المملكة المتحدة"), flag: "🇬🇧" },
        { code: "FR", name: t("فرنسا"), flag: "🇫🇷" },
        { code: "DE", name: t("ألمانيا"), flag: "🇩🇪" },
        { code: "CA", name: t("كندا"), flag: "🇨🇦" },
        { code: "AU", name: t("أستراليا"), flag: "🇦🇺" },
        { code: "TR", name: t("تركيا"), flag: "🇹🇷" },
        { code: "BR", name: t("البرازيل"), flag: "🇧🇷" },
        { code: "IN", name: t("الهند"), flag: "🇮🇳" },
        { code: "CN", name: t("الصين"), flag: "🇨🇳" },
        { code: "JP", name: t("اليابان"), flag: "🇯🇵" },
        { code: "RU", name: t("روسيا"), flag: "🇷🇺" },
        { code: "IT", name: t("إيطاليا"), flag: "🇮🇹" },
        { code: "ES", name: t("إسبانيا"), flag: "🇪🇸" },
        { code: "NL", name: t("هولندا"), flag: "🇳🇱" },
        { code: "SE", name: t("السويد"), flag: "🇸🇪" },
        { code: "NO", name: t("النرويج"), flag: "🇳🇴" },
        { code: "DK", name: t("الدنمارك"), flag: "🇩🇰" },
        { code: "FI", name: t("فنلندا"), flag: "🇫🇮" },
        { code: "CH", name: t("سويسرا"), flag: "🇨🇭" },
        { code: "BE", name: t("بلجيكا"), flag: "🇧🇪" },
        { code: "AT", name: t("النمسا"), flag: "🇦🇹" },
        { code: "GR", name: t("اليونان"), flag: "🇬🇷" },
        { code: "PT", name: t("البرتغال"), flag: "🇵🇹" },
        { code: "IE", name: t("أيرلندا"), flag: "🇮🇪" },
        { code: "PL", name: t("بولندا"), flag: "🇵🇱" },
        { code: "CZ", name: t("التشيك"), flag: "🇨🇿" },
        { code: "HU", name: t("المجر"), flag: "🇭🇺" },
    ];

    const allCategories = [
        { id: "gym", label: t("جيم / لياقة"), icon: <Dumbbell className="w-6 h-6" />, system_type:"gym"},
        { id: "real-estate", label: t("عقارات"), icon: <Home className="w-6 h-6" />, related: ["construction", "consultancy"], system_type:"realEstate" },
        { id: "restaurant", label: t("مطاعم / كافيهات"), icon: <Coffee className="w-6 h-6" />, system_type:"retail" },
        { id: "ecommerce", label: t("متجر إلكتروني"), icon: <ShoppingCart className="w-6 h-6" />, system_type:"retail" },
        { id: "salon", label: t("صالون / تجميل"), icon: <Heart className="w-6 h-6" />, system_type:"services" },
        { id: "events", label: t("تنظيم فعاليات"), icon: <Film className="w-6 h-6" />,system_type:"services" },
        { id: "auto", label: t("ميكانيكا وورش"), icon: <Car className="w-6 h-6" />,system_type:"services" },
        { id: "photography", label: t("تصوير فوتوغرافي"), icon: <UserPlus className="w-6 h-6" />,system_type:"retail" },
        { id: "education", label: t("تعليم وتدريب"), icon: <BookOpen className="w-6 h-6" />,system_type:"education" },
        { id: "hotel", label: t("فندق وإقامة"), icon: <Building className="w-6 h-6" />,system_type:"hotel" },
        { id: "bakery", label: t("مخبوزات"), icon: <Coffee className="w-6 h-6" />,system_type:"retail" },
        { id: "retail", label: t("تجزئة وبيع"), icon: <ShoppingCart className="w-6 h-6" />,system_type:"retail" },
        { id: "healthcare", label: t("رعاية صحية"), icon: <Heart className="w-6 h-6" />,system_type:"services" },
        { id: "logistics", label: t("لوجستيك وتوصيل"), icon: <Car className="w-6 h-6" />,system_type:"delivery" },
        { id: "construction", label: t("إستشارات/إنشاءات"), icon: <Building className="w-6 h-6" />, related: ["real-estate", "consultancy"],system_type:"services" },
        { id: "saas", label: t("SaaS وتطبيقات"), icon: <UserPlus className="w-6 h-6" />,system_type:"retail" },
        { id: "marketing", label: t("وكالة تسويق"), icon: <Film className="w-6 h-6" /> ,system_type:"services"},
        { id: "consultancy", label: t("استشارات"), icon: <UserPlus className="w-6 h-6" />, related: ["real-estate", "construction"],system_type:"services" },
        { id: "fashion", label: t("موضة وأزياء"), icon: <ShoppingCart className="w-6 h-6" />,system_type:"retail" },
        { id: "pharmacy", label: t("صيدلية"), icon: <Heart className="w-6 h-6" />,system_type:"retail" },
        { id: "supermarket", label: t("سوبرماركت"), icon: <ShoppingCart className="w-6 h-6" />,system_type:"retail" },
        { id: "sports", label: t("رياضة وبطولات"), icon: <Dumbbell className="w-6 h-6" />,system_type:"gym" },
        { id: "travel", label: t("سياحة وسفر"), icon: <Home className="w-6 h-6" />,system_type:"travels" },
        { id: "photostudio", label: t("استوديو تصوير"), icon: <UserPlus className="w-6 h-6" />,system_type:"retail" },
        { id: "delivery", label: t("توصيل"), icon: <Car className="w-6 h-6" />,system_type:"delivery" },
        { id: "cleaning", label: t("نظافة وخدمات"), icon: <Home className="w-6 h-6" />,system_type:"services" },
        { id: "agriculture", label: t("زراعة"), icon: <Heart className="w-6 h-6" />,system_type:"retail" },
        { id: "clubs", label: t("النوادى"), icon: <UsersIcon  className="w-6 h-6" />,system_type:"clubs" },
        { id: "finance", label: t("خدمات مالية"), icon: <Building className="w-6 h-6" /> ,system_type:"services"}, // غير من code إلى id
        { id: "jewelry", label: t("مجوهرات"), icon: <ShoppingCart className="w-6 h-6" /> ,system_type:"retail" }, // غير من code إلى id
    ];

    const [selected, setSelected] = useState(customer?.system_type ? [customer.system_type] : []);
    const [query, setQuery] = useState("");
    const [logoPreview, setLogoPreview] = useState(customer?.company?.logo ? `${app_url}/storage/${customer.company.logo}` : null);
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [countryQuery, setCountryQuery] = useState("");
    const countryDropdownRef = useRef(null);

    const filtered = allCategories.filter(c =>
        c.label.includes(query) || c.id.includes(query)
    );
    const filteredCountries = countries.filter(c =>
        c.name.includes(countryQuery) || c.code.includes(countryQuery)
    );

    useEffect(() => {
        function handleClickOutside(event) {
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
                setIsCountryDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    function toggleCat(id) {
        const category = allCategories.find(c => c.id === id);
        if (!category) return;

        if (selected.includes(id)) {
            setSelected(prev => prev.filter(x => x !== id));
        } else {
            if (category.related) {
                const groupIds = [id, ...(category.related || [])];
                setSelected(prev => {
                    const newSel = prev.filter(x => groupIds.includes(x));
                    return [...new Set([...newSel, id])];
                });
            } else {
                setSelected([id]);
            }
        }
    }

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("logo", file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

const submit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('company_name', data.company_name);
    formData.append('phone', data.phone);
    formData.append('address', data.address);
    formData.append('country', data.country);
    formData.append('system_type', data.system_type);

    if (mode === "add") {
        formData.append('password', data.password);
        formData.append('password_confirmation', data.password_confirmation);
    } else if (mode === "edit" && data.password) {
        formData.append('password', data.password);
        formData.append('password_confirmation', data.password_confirmation);
    }

    if (data.logo) {
        formData.append('logo', data.logo);
    }

    if (mode === "add") {
        post(route("addUser"), formData,{
            forceFormData: true,
            onSuccess: () => {
                reset("password", "password_confirmation");
                closeModal();
            },
        });
        //  onSuccess: () => {
            //     },
            closeModal();
            showAllCustomers();
    } else if (mode === "edit" && customer) {

        post(route("users.update", customer.id),formData ,{
            forceFormData: true,
            onSuccess: () => {
                closeModal();
            },
        });
        closeModal();
        showAllCustomers();
    }
};

    const selectedCountry = countries.find(c => c.code === data.country) || {};

    return (
        <div className="min-h-screen  bg-black bg-opacity-50 flex justify-end z-50 overflow-auto">
            <div className="w-full max-w-5xl bg-black/90 rounded-2xl shadow-2xl p-6 text-white">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {mode === "add" ? t("إضافة عميل جديد") : t("تعديل بيانات العميل")}
                    </h3>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="flex flex-col md:flex-row gap-6 mt-4">
                    {/* Left: Form */}
                    <div className="md:w-4/5">
                        <h2 className="text-2xl font-semibold mb-3 text-purple-400">
                            {mode === "add" ? t("تسجيل شركة جديدة") : t("تعديل بيانات الشركة")}
                        </h2>
                        <p className="text-sm text-gray-300 mb-6">
                            {mode === "add"
                                ? t("ابدأ بإنشاء حساب شركتك واختر نشاطك التجاري لتهيئة النظام لك.")
                                : t("قم بتعديل بيانات الشركة حسب الحاجة.")}
                        </p>

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <InputLabel htmlFor="name" value={t("الاسم")} />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full rounded-lg border border-purple-500 bg-black/40 p-3 text-white placeholder-gray-400"
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) => setData("name", e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="company_name" value={t("اسم الشركة")} />
                                <TextInput
                                    id="company_name"
                                    name="company_name"
                                    value={data.company_name}
                                    className="mt-1 block w-full rounded-lg border border-purple-500 bg-black/40 p-3 text-white placeholder-gray-400"
                                    autoComplete="organization"
                                    onChange={(e) => setData("company_name", e.target.value)}
                                    required
                                />
                                <InputError message={errors.company_name} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <InputLabel htmlFor="email" value={t("البريد الإلكتروني")} />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full rounded-lg border border-purple-500 bg-black/40 p-3 text-white placeholder-gray-400"
                                        autoComplete="username"
                                        onChange={(e) => setData("email", e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="phone" value={t("رقم الهاتف")} />
                                    <PhoneInput
                                        country={"eg"}
                                        value={data.phone}
                                        onChange={(phone) => setData("phone", phone)}
                                        inputClass="!w-full !h-11 !text-base !rounded-lg !border !border-purple-500 !bg-black/40 !text-white placeholder-gray-400 ps-12"
                                        buttonClass="!border-purple-500 !rounded-l-md !h-11 !bg-black/40 !pr-10"
                                        containerClass="w-full"
                                    />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="relative" ref={countryDropdownRef}>
                                    <InputLabel htmlFor="country" value={t("الدولة")} />
                                    <button
                                        type="button"
                                        className="mt-1  w-full rounded-lg border border-purple-500 bg-black/40 p-3 text-white text-right flex items-center justify-between"
                                        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {selectedCountry.flag && <span>{selectedCountry.flag}</span>}
                                            <span>{selectedCountry.name || t("اختر الدولة")}</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isCountryDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-purple-500 rounded-lg shadow-lg max-h-60 overflow-auto">
                                            <div className="p-2 border-b border-gray-700">
                                                <div className="flex items-center gap-2 px-2 py-1 bg-gray-900 rounded">
                                                    <Search className="w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder={t("ابحث عن دولة...")}
                                                        className="flex-1 bg-transparent text-white outline-none placeholder-gray-400"
                                                        value={countryQuery}
                                                        onChange={(e) => setCountryQuery(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="py-1">
                                                {filteredCountries.map(country => (
                                                    <button
                                                        type="button"
                                                        key={country.code}
                                                        className="w-full text-right px-4 py-2 flex items-center gap-2 hover:bg-purple-900/30"
                                                        onClick={() => {
                                                            setData("country", country.code);
                                                            setIsCountryDropdownOpen(false);
                                                            setCountryQuery("");
                                                        }}
                                                    >
                                                        <span className="text-xl">{country.flag}</span>
                                                        <span>{country.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <InputError message={errors.country} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="address" value={t("العنوان التفصيلي")} />
                                    <TextInput
                                        id="address"
                                        name="address"
                                        value={data.address}
                                        className="mt-1 block w-full rounded-lg border border-purple-500 bg-black/40 p-3 text-white placeholder-gray-400"
                                        autoComplete="street-address"
                                        onChange={(e) => setData("address", e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.address} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="logo" value={t("شعار الشركة")} />
                                <div className="flex items-center gap-3 mt-1">
                                    <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-purple-500 rounded-lg cursor-pointer bg-black/40 hover:bg-purple-900/20">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt={t("Logo preview")} className="w-full h-full object-contain rounded-lg" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <svg className="w-8 h-8 mb-3 text-purple-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                                </svg>
                                                <p className="mb-2 text-sm text-purple-500">{t("اضغط للرفع")}</p>
                                            </div>
                                        )}
                                        <input id="logo" type="file" className="hidden" onChange={handleLogoChange} />
                                    </label>
                                    <p className="text-xs text-gray-400">{t("اختر صورة مناسبة لشعار شركتك")}</p>
                                </div>
                                <InputError message={errors.logo} className="mt-2" />
                            </div>

                            {mode === "add" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel htmlFor="password" value={t("كلمة المرور")} />
                                        <TextInput
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            className="mt-1 block w-full rounded-lg border border-purple-500 bg-black/40 p-3 text-white placeholder-gray-400"
                                            autoComplete="new-password"
                                            onChange={(e) => setData("password", e.target.value)}
                                            required={mode === "add"}
                                        />
                                        <InputError message={errors.password} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="password_confirmation" value={t("تأكيد كلمة المرور")} />
                                        <TextInput
                                            id="password_confirmation"
                                            type="password"
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            className="mt-1 block w-full rounded-lg border border-purple-500 bg-black/40 p-3 text-white placeholder-gray-400"
                                            autoComplete="new-password"
                                            onChange={(e) => setData("password_confirmation", e.target.value)}
                                            required={mode === "add"}
                                        />
                                        <InputError message={errors.password_confirmation} className="mt-2" />
                                    </div>
                                </div>
                            )}

                            <div>
                                <InputLabel htmlFor="search" value={t("ابحث عن نشاط أو اختر من القائمة")} />
                                <div className="flex items-center gap-2 border border-purple-500 rounded-lg p-2 bg-black/40 mt-1">
                                    <Search className="w-5 h-5 text-purple-400" />
                                    <input
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        placeholder={t("ابحث عن نشاط (مثال: عقارات)")}
                                        className="flex-1 outline-none bg-transparent text-white placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <InputLabel value={t("اختر النشاط")} />
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-56 overflow-auto p-1 mt-1">
                                    {filtered.map(cat => (
                                        <button
                                            type="button"
                                            key={cat.id}
                                            onClick={() =>{ setData({...data, system_type:cat.system_type});toggleCat(cat.id)}}
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-shadow text-sm ${
                                                selected.includes(cat.id)
                                                    ? "bg-purple-600 border-purple-400 shadow text-white"
                                                    : "bg-black/60 border-gray-600 text-gray-300"
                                            }`}
                                        >
                                            <div className="w-10 h-10 bg-black/40 rounded-md flex items-center justify-center shadow-sm">{cat.icon}</div>
                                            <div className="flex-1 text-right">{cat.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div  className="flex items-center justify-between gap-3">
                                <PrimaryButton className="px-5 py-3 rounded-xl bg-purple-600 text-white font-medium shadow-md" disabled={processing}>
                                    {mode === "add" ? t("إنشاء حساب والانتقال") : t("تحديث البيانات")}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>

                    {/* Right: Visual / Benefits */}
                    <div className="md:w-1/2 bg-black/60 rounded-xl p-5 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-purple-400">{t("لماذا سيستمي؟")}</h3>
                            <ul className="list-disc pr-5 text-sm text-gray-300 space-y-2">
                                <li>{t("لوحة تحكم مخصصة لشغلك.")}</li>
                                <li>{t("تقارير مالية ومتابعة عملائك بسهولة.")}</li>
                                <li>{t("ربط بوابات دفع وإرسال فواتير أوتوماتيكياً.")}</li>
                            </ul>
                        </div>

                        <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2 text-purple-400">{t("الأنشطة المختارة الآن:")}</h4>
                            <div className="flex flex-wrap gap-2">
                                {selected.length === 0 ? (
                                    <span className="text-sm text-gray-400">{t("لم تختر أي نشاط بعد")}</span>
                                ) : (
                                    selected.map(s => (
                                        <span key={s} className="text-xs bg-purple-700 px-3 py-1 rounded-full">
                                            {allCategories.find(c => c.id === s)?.label || s}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
