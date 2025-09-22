import React, { useState, useEffect } from "react";


export default function (){

    return(
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            {t("ارسال ")}
                        </h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {t("سيتم حذف العضو")} <span className="font-bold">{selectedMember.name}</span> {t("بشكل دائم.")}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={closeModal} className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg">
                                {t("إلغاء")}
                            </button>
                            <button onClick={handleDeleteConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg">
                                {t("حذف")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

    );
}
