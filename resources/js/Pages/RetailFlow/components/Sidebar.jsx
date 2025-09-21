import React from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    HomeIcon,
    UserGroupIcon,
    BookOpenIcon,
    ClipboardDocumentListIcon,
    AcademicCapIcon,
    Bars3Icon,
    TagIcon,
    ShoppingBagIcon,
    ReceiptPercentIcon,
    Cog6ToothIcon,
    LinkIcon,
    ChatBubbleLeftIcon,
    HomeModernIcon,
    BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import { CreditCardIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Sidebar({ isOpen, setIsOpen }) {
    const { url } = usePage();
    const sidebarWidth = isOpen ? "w-56" : "w-20";
    const { auth } = usePage().props;
    const { t } = useTranslation();

    let navItems = []
    if(auth.user.subscription==='vip'){
    if(auth.user.system_type === "realEstate" ) {

         navItems = [
        { name: t("لوحة التحكم"), icon: HomeIcon, path: "/retailFlow" },
        {
            name: auth.user.system_type === "delivery" ? t("السائقين") : t("العملاء"),
            icon: UserGroupIcon,
            path: "/retailFlow/customers",
        },
        {
            name:
                auth.user.system_type === "services"
                    ? t("الخدمات")
                    : auth.user.system_type === "education"
                    ? t("الدورات")
                    : auth.user.system_type === "realEstate"
                    ? t("العقارات")
                    : auth.user.system_type === "delivery"
                    ? t("الطلبات")
                    : auth.user.system_type === "travels"
                    ? t("الرحلات")
                    : t("المنتجات"),
            icon: BuildingOfficeIcon ,
            path: "/retailFlow/products",
        },
        {
            name: t("الفواتير"),
            icon: ReceiptPercentIcon,
            path: "/retailFlow/invoices",
        },
        {
                name: t("الايجارات"),
                icon: HomeModernIcon,
                path: "/retailFlow/rents",
            },
        {
            name: t("الربط بنظام خارجى"),
            icon: LinkIcon,
            path: "/retailFlow/api_access",
        },
        { name: t("الربط بواتساب"), icon: ChatBubbleLeftIcon, path: "/retailFlow/whatsapp" },

        {
            name: t("الاعدادات"),
            icon: Cog6ToothIcon,
            path: "/retailFlow/settings",
        },
    ];
    }else if(auth.user.system_type === "hotel"){
        navItems = [
        { name: t("لوحة التحكم"), icon: HomeIcon, path: "/retailFlow" },
        {
            name: auth.user.system_type === "delivery" ? t("السائقين") : t("العملاء"),
            icon: UserGroupIcon,
            path: "/retailFlow/customers",
        },
        {
                name: t("الايجارات"),
                icon: HomeModernIcon,
                path: "/retailFlow/rents",
            },
        {
            name: t("الربط بنظام خارجى"),
            icon: LinkIcon,
            path: "/retailFlow/api_access",
        },
        { name: t("الربط بواتساب"), icon: ChatBubbleLeftIcon, path: "/retailFlow/whatsapp" },

        {
            name: t("الاعدادات"),
            icon: Cog6ToothIcon,
            path: "/retailFlow/settings",
        },
    ];
    }else if(auth.user.system_type === "gym"){
         navItems = [
        { name: t("لوحة التحكم"), icon: HomeIcon, path: "/retailFlow" },
        {
            name: auth.user.system_type === "delivery" ? t("السائقين") : t("العملاء"),
            icon: UserGroupIcon,
            path: "/retailFlow/customers",
        },
        {
            name:
                auth.user.system_type === "services"
                    ? t("الخدمات")
                    : auth.user.system_type === "education"
                    ? t("الدورات")
                    : auth.user.system_type === "realEstate"
                    ? t("العقارات")
                    : auth.user.system_type === "delivery"
                    ? t("الطلبات")
                    : auth.user.system_type === "travels"
                    ? t("الرحلات")
                    : t("المنتجات"),
            icon: ShoppingBagIcon ,
            path: "/retailFlow/products",
        },
        {
            name: t("الفواتير"),
            icon: ReceiptPercentIcon,
            path: "/retailFlow/invoices",
        },
        {
                name: t("الاشتراكات"),
                icon: CreditCardIcon,
                path: "/retailFlow/rents",
            },
        {
            name: t("الربط بنظام خارجى"),
            icon: LinkIcon,
            path: "/retailFlow/api_access",
        },
        { name: t("الربط بواتساب"), icon: ChatBubbleLeftIcon, path: "/retailFlow/whatsapp" },

        {
            name: t("الاعدادات"),
            icon: Cog6ToothIcon,
            path: "/retailFlow/settings",
        },
    ];
    }else{
        navItems = [
        { name: t("لوحة التحكم"), icon: HomeIcon, path: "/retailFlow" },
        {
            name: auth.user.system_type === "delivery" ? t("السائقين") : t("العملاء"),
            icon: UserGroupIcon,
            path: "/retailFlow/customers",
        },
        {
            name:
                auth.user.system_type === "services"
                    ? t("الخدمات")
                    : auth.user.system_type === "education"
                    ? t("الدورات")
                    : auth.user.system_type === "realEstate"
                    ? t("العقارات")
                    : auth.user.system_type === "delivery"
                    ? t("الطلبات")
                    : auth.user.system_type === "travels"
                    ? t("الرحلات")
                    : t("المنتجات"),
            icon: ShoppingBagIcon,
            path: "/retailFlow/products",
        },
        {
            name: t("الفواتير"),
            icon: ReceiptPercentIcon,
            path: "/retailFlow/invoices",
        },
        {
            name: t("الربط بنظام خارجى"),
            icon: LinkIcon,
            path: "/retailFlow/api_access",
        },
        { name: t("الربط بواتساب"), icon: ChatBubbleLeftIcon, path: "/retailFlow/whatsapp" },
        {
            name: t("الاعدادات"),
            icon: Cog6ToothIcon,
            path: "/retailFlow/settings",
        },
    ];
    }
    }else {
    if(auth.user.system_type === "realEstate" ) {
         navItems = [
        { name: t("لوحة التحكم"), icon: HomeIcon, path: "/retailFlow" },
        {
            name: auth.user.system_type === "delivery" ? t("السائقين") : t("العملاء"),
            icon: UserGroupIcon,
            path: "/retailFlow/customers",
        },
        {
            name:
                auth.user.system_type === "services"
                    ? t("الخدمات")
                    : auth.user.system_type === "education"
                    ? t("الدورات")
                    : auth.user.system_type === "realEstate"
                    ? t("العقارات")
                    : auth.user.system_type === "delivery"
                    ? t("الطلبات")
                    : auth.user.system_type === "travels"
                    ? t("الرحلات")
                    : t("المنتجات"),
            icon: BuildingOfficeIcon ,
            path: "/retailFlow/products",
        },
        {
            name: t("الفواتير"),
            icon: ReceiptPercentIcon,
            path: "/retailFlow/invoices",
        },
        {
                name: t("الايجارات"),
                icon: HomeModernIcon,
                path: "/retailFlow/rents",
            },

        {
            name: t("الاعدادات"),
            icon: Cog6ToothIcon,
            path: "/retailFlow/settings",
        },
    ];
    }else if(auth.user.system_type === "hotel"){
        navItems = [
        { name: t("لوحة التحكم"), icon: HomeIcon, path: "/retailFlow" },
        {
            name: auth.user.system_type === "delivery" ? t("السائقين") : t("العملاء"),
            icon: UserGroupIcon,
            path: "/retailFlow/customers",
        },
        {
                name: t("الايجارات"),
                icon: HomeModernIcon,
                path: "/retailFlow/rents",
            },

        {
            name: t("الاعدادات"),
            icon: Cog6ToothIcon,
            path: "/retailFlow/settings",
        },
    ];
    }else if(auth.user.system_type === "gym"){
         navItems = [
        { name: t("لوحة التحكم"), icon: HomeIcon, path: "/retailFlow" },
        {
            name: auth.user.system_type === "delivery" ? t("السائقين") : t("العملاء"),
            icon: UserGroupIcon,
            path: "/retailFlow/customers",
        },
        {
            name:
                auth.user.system_type === "services"
                    ? t("الخدمات")
                    : auth.user.system_type === "education"
                    ? t("الدورات")
                    : auth.user.system_type === "realEstate"
                    ? t("العقارات")
                    : auth.user.system_type === "delivery"
                    ? t("الطلبات")
                    : auth.user.system_type === "travels"
                    ? t("الرحلات")
                    : t("المنتجات"),
            icon: ShoppingBagIcon ,
            path: "/retailFlow/products",
        },
        {
            name: t("الفواتير"),
            icon: ReceiptPercentIcon,
            path: "/retailFlow/invoices",
        },
        {
                name: t("الاشتراكات"),
                icon: CreditCardIcon,
                path: "/retailFlow/rents",
            },
        {
            name: t("الاعدادات"),
            icon: Cog6ToothIcon,
            path: "/retailFlow/settings",
        },
    ];
    }else{
        navItems = [
        { name: t("لوحة التحكم"), icon: HomeIcon, path: "/retailFlow" },
        {
            name: auth.user.system_type === "delivery" ? t("السائقين") : t("العملاء"),
            icon: UserGroupIcon,
            path: "/retailFlow/customers",
        },
        {
            name:
                auth.user.system_type === "services"
                    ? t("الخدمات")
                    : auth.user.system_type === "education"
                    ? t("الدورات")
                    : auth.user.system_type === "realEstate"
                    ? t("العقارات")
                    : auth.user.system_type === "delivery"
                    ? t("الطلبات")
                    : auth.user.system_type === "travels"
                    ? t("الرحلات")
                    : t("المنتجات"),
            icon: ShoppingBagIcon,
            path: "/retailFlow/products",
        },
        {
            name: t("الفواتير"),
            icon: ReceiptPercentIcon,
            path: "/retailFlow/invoices",
        },
        {
            name: t("الاعدادات"),
            icon: Cog6ToothIcon,
            path: "/retailFlow/settings",
        },
                      ];
    }
    }

    return (
        <div
            className={`fixed top-0 right-0 h-full z-40 flex flex-col
        bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${sidebarWidth} ${
                isOpen ? "block" : "hidden sm:block"
            }`}
        >
            <div
                className={`flex items-center ${
                    isOpen ? "justify-between" : "justify-center"
                }
        px-4 py-4 border-b border-gray-200 dark:border-gray-700`}
            >
                <span
                    className={`text-xl font-bold text-gray-800 dark:text-gray-200 transition-all duration-300
          ${isOpen ? "opacity-100" : "opacity-0 hidden"}`}
                >
                    {t("لوحة التحكم")}
                </span>
                <button
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={t("تبديل الشريط الجانبي")}
                >
                    <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                </button>
            </div>

            <nav className="flex-1 flex flex-col gap-2 mt-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = url === item.path;
                    return (
                        <div key={item.name} className="relative group">
                            <Link
                                href={item.path}
                                className={`flex items-center gap-4 px-4 py-3 mx-2 rounded-lg transition-all duration-200
                ${
                    isActive
                        ? "bg-primary text-white"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                } ${isOpen ? "" : "justify-center"}`}
                            >
                                <Icon className="h-6 w-6 flex-shrink-0" />
                                <span
                                    className={`text-base font-medium transition-all duration-200
                ${isOpen ? "opacity-100" : "opacity-0 hidden"}`}
                                >
                                    {item.name}
                                </span>
                            </Link>

                            {!isOpen && (
                                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3
                                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                    transition-all duration-300 z-50">
                                    <div className="bg-gray-900 text-white text-sm font-medium py-2 px-3
                                        rounded-lg shadow-lg whitespace-nowrap relative">
                                        {item.name}
                                        <div className="absolute top-1/2 -right-1 -translate-y-1/2
                                            w-2 h-2 bg-gray-900 rotate-45"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </div>
    );
}
