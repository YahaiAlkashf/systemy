import React, { useState } from "react";
import GenerateToken from "./Components/GenerateToken";
import AdminLayout from "./layout";

export default function API_Access() {
    const [token, setToken] = useState(null);

    const apiEndpoints = [
        // Members routes
        { method: "GET", url: "/api/members", desc: "Get all members" },
        { method: "POST", url: "/api/members", desc: "Add new member" },
        { method: "POST", url: "/api/members/{member}", desc: "Update member" },
        { method: "DELETE", url: "/api/members/{member}", desc: "Delete member" },
        { method: "GET", url: "/api/member/profile", desc: "Get member profile" },
        { method: "GET", url: "/api/members-with-details", desc: "Get members with details" },
        { method: "GET", url: "/api/members/{id}/events", desc: "Get member events" },
        { method: "GET", url: "/api/members/{id}/tasks", desc: "Get member tasks" },
        { method: "GET", url: "/api/members/{id}/all-events", desc: "Get all member events" },
        { method: "GET", url: "/api/members/{id}/all-tasks", desc: "Get all member tasks" },

        // Cycles routes
        { method: "GET", url: "/api/cycles", desc: "Get all cycles" },
        { method: "POST", url: "/api/cycles", desc: "Add new cycle" },
        { method: "POST", url: "/api/cycles/{id}", desc: "Update cycle" },
        { method: "DELETE", url: "/api/cycles/{id}", desc: "Delete cycle" },

        // Tasks routes
        { method: "GET", url: "/api/tasks", desc: "Get all tasks" },
        { method: "POST", url: "/api/tasks", desc: "Add new task" },
        { method: "POST", url: "/api/tasks/{id}", desc: "Update task" },
        { method: "DELETE", url: "/api/tasks/{id}", desc: "Delete task" },
        { method: "POST", url: "/api/tasks/{task}/status", desc: "Update task status" },

        // Events routes
        { method: "GET", url: "/api/events", desc: "Get all events" },
        { method: "POST", url: "/api/events", desc: "Add new event" },
        { method: "POST", url: "/api/events/{id}", desc: "Update event" },
        { method: "DELETE", url: "/api/events/{id}", desc: "Delete event" },
        { method: "POST", url: "/api/events/{id}/status", desc: "Attend event" },

        // Library folders routes
        { method: "GET", url: "/api/library/folders", desc: "Get all folders" },
        { method: "POST", url: "/api/library/folders", desc: "Create folder" },
        { method: "PUT", url: "/api/library/folders/{id}", desc: "Update folder" },
        { method: "DELETE", url: "/api/library/folders/{id}", desc: "Delete folder" },

        // Library files routes
        { method: "GET", url: "/api/library/files", desc: "Get all files" },
        { method: "GET", url: "/api/library/folders/{folderId}/files", desc: "Get folder files" },
        { method: "POST", url: "/api/library/files", desc: "Upload files" },
        { method: "GET", url: "/api/library/files/{id}/download", desc: "Download file" },
        { method: "DELETE", url: "/api/library/files/{id}", desc: "Delete file" },

        // Library search
        { method: "GET", url: "/api/library/search", desc: "Search files" },

        // Announcements routes
        { method: "GET", url: "/api/announcement", desc: "Get all announcements" },
        { method: "POST", url: "/api/announcement", desc: "Create announcement" },
        { method: "DELETE", url: "/api/announcement", desc: "Delete announcement" },

        // Messages routes
        { method: "GET", url: "/api/messages", desc: "Get all messages" },
        { method: "POST", url: "/api/messages", desc: "Send message" },
        { method: "DELETE", url: "/api/messages/{id}", desc: "Delete message" },
    ];

    return (
        <AdminLayout>
            <div className="p-6 max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">API Access</h1>

                <GenerateToken onTokenGenerated={setToken} />

                {token && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">Available API Endpoints</h2>
                        <p className="mb-6 text-gray-600">
                            Use your API Token in the <code className="bg-gray-100 px-2 py-1 rounded">Authorization: Bearer &lt;token&gt;</code> header.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {apiEndpoints.map((api, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center mb-2">
                                        <span className={`px-2 py-1 rounded text-sm font-semibold mr-2 ${
                                            api.method === "GET" ? "bg-blue-100 text-blue-800" :
                                            api.method === "POST" ? "bg-green-100 text-green-800" :
                                            api.method === "PUT" ? "bg-yellow-100 text-yellow-800" :
                                            api.method === "DELETE" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                                        }`}>
                                            {api.method}
                                        </span>
                                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                            {api.url}
                                        </code>
                                    </div>
                                    <div className="text-gray-700 mb-2">{api.desc}</div>
                                    <div className="text-xs text-gray-500">
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
