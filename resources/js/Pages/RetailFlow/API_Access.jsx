import React, { useState } from "react";
import GenerateToken from "./Components/GenerateToken";
import AdminLayout from "./layout";
export default function API_Access() {
    const [token, setToken] = useState(null);

    const apiEndpoints = [
        { method: "GET", url: "/api/productretailFlow", desc: "Get all products" },
        { method: "POST", url: "/api/productretailFlow", desc: "Add new product" },
        { method: "PUT", url: "/api/productretailFlow/{id}", desc: "Update product" },
        { method: "DELETE", url: "/api/productretailFlow/{id}", desc: "Delete product" },

        { method: "GET", url: "/api/customerretailFlow", desc: "Get all customers" },
        { method: "POST", url: "/api/customerretailFlow", desc: "Add new customer" },
        { method: "PUT", url: "/api/customerretailFlow/{id}", desc: "Update customer" },
        { method: "DELETE", url: "/api/customerretailFlow/{id}", desc: "Delete customer" },

        { method: "GET", url: "/api/invoiceretailFlow", desc: "Get all invoices" },
        { method: "POST", url: "/api/invoiceretailFlow", desc: "Add new invoice" },
        { method: "PUT", url: "/api/invoiceretailFlow/{id}", desc: "Update invoice" },
        { method: "DELETE", url: "/api/invoiceretailFlow/{id}", desc: "Delete invoice" },

        { method: "GET", url: "/api/retailflow/users", desc: "Get users (SuperAdmin only)" },
        { method: "POST", url: "/api/retailflow/users", desc: "Add user (SuperAdmin only)" },
        { method: "DELETE", url: "/api/retailflow/users/{user}", desc: "Delete user (SuperAdmin only)" },
    ];

    return (
        <AdminLayout>
        <div className="p-6 max-w-4xl mx-auto">
            <GenerateToken onTokenGenerated={setToken} />

            {token && (
                <div>
                    <h2 className="text-xl font-bold mb-4">API Endpoints</h2>
                    <p className="mb-4">
                        Use your API Token in the <code>Authorization: Bearer &lt;token&gt;</code> header.
                    </p>

                    <div className="space-y-3">
                        {apiEndpoints.map((api, index) => (
                            <div key={index} className="p-4 border rounded">
                                <div className="font-bold">{api.method} {api.url}</div>
                                <div className="text-gray-700">{api.desc}</div>
                                <div className="text-sm text-gray-500 mt-1">
                                    Example Header: <code>Authorization: Bearer {token}</code>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
        </AdminLayout>
    );
}
