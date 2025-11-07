import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export default function MemberModal({
    title,
    member,
    setMember,
    handleSave,
    closeModal,
    errors,
    roles,
    cycles,
    handlePermissionChange,
    handleRoleChange,
    isEdit = false
}) {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
            <div className="bg-white dark:bg-gray-800 overflow-y-auto h-full shadow-2xl max-w-md w-full p-6 space-y-4 animate-slide-in-right">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {title}
                    </h3>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("الاسم")}
                    </label>
                    <input
                        type="text"
                        value={member.name}
                        onChange={(e) => setMember({ ...member, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 focus:scale-[1.02]"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("البريد الإلكتروني")}
                    </label>
                    <input
                        type="text"
                        value={member.email}
                        onChange={(e) => setMember({ ...member, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 focus:scale-[1.02]"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
                </div>

                {!isEdit && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t("كلمة المرور")}
                            </label>
                            <input
                                type="text"
                                value={member.password}
                                onChange={(e) => setMember({ ...member, password: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 focus:scale-[1.02]"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t("تأكيد كلمة المرور")}
                            </label>
                            <input
                                type="text"
                                value={member.password_confirmation}
                                onChange={(e) => setMember({ ...member, password_confirmation: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 focus:scale-[1.02]"
                            />
                        </div>
                    </>
                )}

                {isEdit && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t("كلمة المرور الجديدة (اتركها فارغة إذا لم ترد التغيير)")}
                            </label>
                            <input
                                type="password"
                                value={member.password}
                                onChange={(e) => setMember({ ...member, password: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 focus:scale-[1.02]"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t("تأكيد كلمة المرور الجديدة")}
                            </label>
                            <input
                                type="password"
                                value={member.password_confirmation}
                                onChange={(e) => setMember({ ...member, password_confirmation: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 focus:scale-[1.02]"
                            />
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("رقم التليفون")}
                    </label>
                    <input
                        type="text"
                        value={member.phone}
                        onChange={(e) => setMember({ ...member, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 focus:scale-[1.02]"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone[0]}</p>}
                </div>

                {/* <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       {t("الرقم التعريفى (id)")}
                    </label>
                    <input
                        type="text"
                        value={member.member_id}
                        onChange={(e) => setMember({ ...member, member_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 focus:scale-[1.02]"
                    />
                    {errors.member_id && <p className="text-red-500 text-xs mt-1">{errors.member_id[0]}</p>}
                </div> */}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t(" القسم ")}
                    </label>
                    <select
                        value={member.cycle_id || ""}
                        onChange={(e) => setMember({ ...member, cycle_id: e.target.value })}
                        className="w-full px-8 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 focus:scale-[1.02]"
                    >
                        <option value=""> {t("اختر القسم ")} </option>
                        {cycles.map((cycle) => (
                            <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                        ))}
                    </select>
                    {errors.cycle_id && <p className="text-red-500 text-xs mt-1">{errors.cycle_id[0]}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       {t("المسمى الوظيفي")}
                    </label>
                    <input
                        type="text"
                        value={member.jop_title}
                        onChange={(e) => setMember({ ...member, jop_title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 focus:scale-[1.02]"
                    />
                    {errors.jop_title && <p className="text-red-500 text-xs mt-1">{errors.jop_title[0]}</p>}
                </div>
                <div className="flex gap-2 mt-2" dir='rtl'>
                    <input
                            type="checkbox"
                            checked={member.add_members}
                            onChange={(e) => setMember({ ...member, add_members: e.target.checked ? 1 : 0})}
                            value={member.add_members}
                            className=" transition-all duration-300 hover:scale-[1.02]"
                    />
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("العضو يستطيع اضافة اعضاء اخرين")}
                    </label>

                </div>
                <div className="flex gap-2 mt-2" dir='rtl'>
                    <input
                            type="checkbox"
                            checked={member.add_tasks}
                            onChange={(e) => setMember({ ...member, add_tasks: e.target.checked ? 1 : 0})}
                            value={member.add_tasks}
                            className=" transition-all duration-300 hover:scale-[1.02]"
                    />
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("العضو يستطيع  اعطاء مهام للأخرين")}
                    </label>

                </div>
                <div className="flex gap-2 mt-2" dir='rtl'>
                    <input
                            type="checkbox"
                            checked={member.add_events}
                            onChange={(e) => setMember({ ...member, add_events: e.target.checked ? 1 : 0})}
                            value={member.add_events}
                            className=" transition-all duration-300 hover:scale-[1.02]"
                    />
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("العضو يستطيع اضافة انشطة ")}
                    </label>

                </div>
                <div className="flex gap-2 mt-2" dir='rtl'>
                    <input
                            type="checkbox"
                            checked={member.add_library}
                            onChange={(e) => setMember({ ...member, add_library: e.target.checked ? 1 : 0})}
                            value={member.add_library}
                            className=" transition-all duration-300 hover:scale-[1.02]"
                    />
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("العضو يستطيع اضافة ملفات فى المكتبة ")}
                    </label>

                </div>
                <div className="flex gap-2 mt-2" dir='rtl'>
                    <input
                            type="checkbox"
                            checked={member.add_advertisement}
                            onChange={(e) => setMember({ ...member, add_advertisement: e.target.checked ? 1 : 0})}
                            value={member.add_advertisement}
                            className=" transition-all duration-300 hover:scale-[1.02]"
                    />
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("العضو يستطيع التعديل فى لوحة الاعلانات")}
                    </label>

                </div>
                <div className="flex gap-2 mt-2" dir='rtl'>
                    <input
                            type="checkbox"
                            checked={member.delete_messege}
                            onChange={(e) => setMember({ ...member, delete_messege: e.target.checked ? 1 : 0})}
                            value={member.delete_messege}
                            className=" transition-all duration-300 hover:scale-[1.02]"
                    />
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("العضو يستطيع  حذف رسائل ")}
                    </label>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("التقييم")}
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min="0"
                            max="5"
                            value={member.rating}
                            onChange={(e) => setMember({ ...member, rating: parseInt(e.target.value) })}
                            className="w-full transition-all duration-300 hover:scale-[1.02]"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{member.rating}</span>
                    </div>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-100 text-red-700 p-2 rounded mb-1 text-sm animate-shake">
                        {Object.values(errors).flat().map((error, index) => (
                            <p key={index}>{error}</p>
                        ))}
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <button
                        onClick={closeModal}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        {t("إلغاء")}
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        {t("حفظ")}
                    </button>
                </div>
            </div>
        </div>
    );
}
