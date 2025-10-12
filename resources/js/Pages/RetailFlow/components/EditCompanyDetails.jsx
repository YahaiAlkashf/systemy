import { useEffect, useState } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

export default function EditCompanyDetails() {
  const { auth } = usePage().props;
  const { t } = useTranslation();
  const { app_url } = usePage().props;
    const [message ,setMessage]=useState('');
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: auth.user.company.company_name,
    logo: null,
  });

  useEffect(()=>{
    const timer = setTimeout(() =>{
        setMessage('');
    },1000)
    return ()=> clearTimeout(timer)
  },[message]);
  const [preview, setPreview] = useState(`${app_url}/storage/${auth.user.company.logo}`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("logo", form.logo);

    try {
      const response = await axios.post("/company/edit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("تم التعديل بنجاح");
      console.log("تم التعديل بنجاح", response.data);
    } catch (error) {
      console.log(error);
      setErrors(error.response?.data?.errors || {});
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, logo: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="p-6 min-h-screen bg-white text-gray-900 dark:bg-black dark:text-gray-100 transition-colors duration-300">

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl shadow-md"
      >
         <h2 className="text-2xl font-bold mb-6 text-primary dark:text-primary-dark">
        {t("تعديل بيانات الشركة")}
      </h2>
        {message &&

            <div className="text-white bg-green-700 flex justify-center p-2 rounded-lg items-center">
                {message}
            </div>
        }
        {errors &&
          Object.entries(errors).map(([field, msgs], i) => (
            <div
              key={i}
              className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-2 rounded text-sm"
            >
              {Array.isArray(msgs)
                ? msgs.map((msg, j) => <p key={j}>{msg}</p>)
                : <p>{msgs}</p>}
            </div>
          ))}

        <input
          type="text"
          placeholder={t("الاسم")}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 w-full rounded-lg focus:ring-2 focus:ring-primary outline-none"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <div className="flex items-center gap-3 mt-1">

          <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-purple-500 rounded-lg cursor-pointer bg-black/40 hover:bg-purple-900/20">
            <img
              src={preview}
              alt="Logo preview"
              className="w-full h-full object-contain rounded-lg"
            />
          </label>


          <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-purple-500 rounded-lg cursor-pointer bg-black/40 hover:bg-purple-900/20">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-3 text-purple-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-purple-500">
                {t("اضغط للرفع")}
              </p>
            </div>
            <input
              id="logo"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleLogoChange}
            />
          </label>

          <p className="text-xs text-gray-400">
            {t("اختر صورة مناسبة لشعار شركتك")}
          </p>
        </div>

        <button className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg shadow-md transition-colors duration-300">
          {t("تعديل")}
        </button>
      </form>
    </div>
  );
}
