import { useState, useEffect } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });
    const { app_url } = usePage().props;
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${app_url}/retailflow/users`);
            setUsers(response.data.users);
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
        }
    };
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await axios.post("/retailflow/users", form);
        fetchUsers();
        setForm({ name: "", email: "", password: ""});
        setErrors({});
    } catch (error) {
        if (error.response && error.response.status === 422) {
            setErrors(error.response.data.errors);
        }
    }
};


    const deleteUser = async (id) => {
        await axios.delete(`/retailflow/users/${id}`);
        fetchUsers();
    };

    return (
        <div className="p-6 min-h-screen bg-white text-gray-900 dark:bg-black dark:text-gray-100 transition-colors duration-300">
            <h2 className="text-2xl font-bold mb-6 text-primary dark:text-primary-dark">
                ادارة المستخدمين
            </h2>

            <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl shadow-md"
            >
                {errors &&
                    Object.entries(errors).map(([field, msgs], i) => (
                        <div
                            key={i}
                            className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-2 rounded text-sm"
                        >
                            {Array.isArray(msgs) ? (
                                msgs.map((msg, j) => <p key={j}>{msg}</p>)
                            ) : (
                                <p>{msgs}</p>
                            )}
                        </div>
                    ))}

                <input
                    type="text"
                    placeholder="الاسم"
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 w-full rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <input
                    type="email"
                    placeholder="الايميل"
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 w-full rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

                <input
                    type="password"
                    placeholder="كلمة المرور"
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 w-full rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />



                <button className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg shadow-md transition-colors duration-300">
                    اضافة مستخدم
                </button>
            </form>


            <h3 className="text-xl font-semibold mt-10 mb-4">
                قائمة المستخدمين
            </h3>
            <ul className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-md divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((u) => (
                    <li
                        key={u.id}
                        className="flex justify-between items-center p-3"
                    >
                        <span>
                            {u.name} -{" "}
                            <span className="text-primary">{u.role}</span>
                        </span>
                        <button
                            className="text-red-500 dark:text-red-400 hover:underline"
                            onClick={() => deleteUser(u.id)}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
