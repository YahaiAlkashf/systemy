<?php

namespace App\Http\Controllers;

use App\Mail\TaskAssignedMail;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $tasks = Task::with(['files','assigner','assignee'])
            ->where('company_id', $user->company_id)
            ->where(function($query) use ($user) {
                $query->where('assigned_to', $user->id)
                      ->orWhere('assigned_by', $user->id);
            })
            ->get();

        return response()->json(['tasks' => $tasks]);
    }

    public function store(Request $request)
    {
$validator = Validator::make($request->all(), [
    'title' => 'required|string|max:255',
    'description' => 'nullable|string',
    'assigned_to' => 'required|exists:users,id',
    'due_date' => 'required|date|after_or_equal:today',
    'files.*' => 'nullable|file|max:40960',
], [
    'title.required' => 'العنوان مطلوب',
    'title.string' => 'العنوان يجب أن يكون نصًا',
    'title.max' => 'العنوان يجب ألا يزيد عن 255 حرفًا',

    'description.string' => 'الوصف يجب أن يكون نصًا',

    'assigned_to.required' => 'يجب تحديد المسؤول',
    'assigned_to.exists' => 'المسؤول المحدد غير موجود',

    'due_date.required' => 'تاريخ الاستحقاق مطلوب',
    'due_date.date' => 'تاريخ الاستحقاق غير صالح',
    'due_date.after_or_equal' => 'تاريخ الاستحقاق يجب أن يكون اليوم أو بعده',

    'files.*.file' => 'يجب أن يكون العنصر ملفًا صالحًا',
    'files.*.max' => 'حجم الملف لا يجب أن يتجاوز 40 ميجابايت',
]);


        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $assignedUser = User::findOrFail($request->assigned_to);
        if ($assignedUser->company_id !== Auth::user()->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن تعيين المهمة لمستخدم من شركة أخرى'
            ], 403);
        }

        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'assigned_to' => $request->assigned_to,
            'assigned_by' => Auth::id(),
            'due_date' => $request->due_date,
            'status' => 'pending',
            'company_id' => Auth::user()->company_id,
        ]);

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store("tasks/{$task->id}", 'public');

                $task->files()->create([
                    'file_name'   => $file->getClientOriginalName(),
                    'file_path'   => $path,
                    'file_type'   => $file->getClientMimeType(),
                    'uploaded_by' => Auth::id(),
                ]);
            }
        }
        $user = User::find($request->assigned_to);

        if($user && $user->email){
            Mail::to($user->email)->send(new TaskAssignedMail($task,$user));
        }
        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء المهمة بنجاح',
            'task'    => $task->load(['assignee', 'files'])
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $task = Task::where('id', $id)
            ->where('company_id', Auth::user()->company_id)
            ->firstOrFail();

        if ($task->assigned_by !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح بتعديل هذه المهمة'
            ], 403);
        }

$validator = Validator::make($request->all(), [
    'title' => 'required|string|max:255',
    'description' => 'nullable|string',
    'assigned_to' => 'required|exists:users,id',
    'due_date' => 'required|date|after_or_equal:today',
    'files.*' => 'nullable|file|max:40960',
], [
    'title.required' => 'العنوان مطلوب',
    'title.string' => 'العنوان يجب أن يكون نصًا',
    'title.max' => 'العنوان يجب ألا يزيد عن 255 حرفًا',

    'description.string' => 'الوصف يجب أن يكون نصًا',

    'assigned_to.required' => 'يجب تحديد المسؤول',
    'assigned_to.exists' => 'المسؤول المحدد غير موجود',

    'due_date.required' => 'تاريخ الاستحقاق مطلوب',
    'due_date.date' => 'تاريخ الاستحقاق غير صالح',
    'due_date.after_or_equal' => 'تاريخ الاستحقاق يجب أن يكون اليوم أو بعده',

    'files.*.file' => 'يجب أن يكون العنصر ملفًا صالحًا',
    'files.*.max' => 'حجم الملف لا يجب أن يتجاوز 40 ميجابايت',
]);


        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $assignedUser = User::findOrFail($request->assigned_to);
        if ($assignedUser->company_id !== Auth::user()->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن تعيين المهمة لمستخدم من شركة أخرى'
            ], 403);
        }

        $task->update([
            'title' => $request->title,
            'description' => $request->description,
            'assigned_to' => $request->assigned_to,
            'due_date' => $request->due_date,
        ]);

        if ($request->hasFile('files')) {
            foreach ($task->files as $file) {
                Storage::disk('public')->delete($file->file_path);
                $file->delete();
            }

            foreach ($request->file('files') as $file) {
                $path = $file->store("tasks/{$task->id}", 'public');

                $task->files()->create([
                    'file_name'   => $file->getClientOriginalName(),
                    'file_path'   => $path,
                    'file_type'   => $file->getClientMimeType(),
                    'uploaded_by' => Auth::id(),
                ]);
            }
        }

        return response()->json([
            'message' => 'تم تحديث المهمة بنجاح',
            'task' => $task->load('assignee')
        ]);
    }

    public function destroy(Task $task)
    {
        if ($task->company_id !== Auth::user()->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح بحذف هذه المهمة'
            ], 403);
        }

        if ($task->assigned_by !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح بحذف هذه المهمة'
            ], 403);
        }

        foreach ($task->files as $file) {
            Storage::disk('public')->delete($file->file_path);
            $file->delete();
        }
        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف المهمة بنجاح'
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $task = Task::where('id', $id)
            ->where('company_id', Auth::user()->company_id)
            ->firstOrFail();

        if ($task->assigned_to !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح بتغيير حالة هذه المهمة'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,in_progress,completed,overdue'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $task->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث حالة المهمة بنجاح',
            'task' => $task
        ]);
    }
}
