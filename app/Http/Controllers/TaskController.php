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

use function Termwind\ask;

class TaskController extends Controller
{

    private function sendEmail($user, $task)
    {
        Mail::to($user->email)->queue(new TaskAssignedMail($task, $user));
    }

    public function index(Request $request)
    {
        $user = Auth::user();

        $tasks = Task::with(['files', 'assigner', 'assignee'])
            ->where('company_id', $user->company_id)->orderBy('updated_at', 'desc')
            ->get();

        return response()->json(['tasks' => $tasks]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'description' => 'nullable|string',
            'assigned_to' => 'required|array',
            'assigned_to.*' => 'required|exists:users,id',
            'due_date' => 'required|date|after_or_equal:today',
            'files.*' => 'nullable|file',
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
        $arr = count($request->assigned_to);
        $countTasks = Task::where('company_id', Auth::user()->company_id)
         ->max('task_id');

        $newTaskId = $countTasks ? $countTasks + 1 : 1;
        $countTasks = Task::where('company_id', Auth::user()->company_id)->count();

        foreach ($request->assigned_to as $user_id) {
            $user = User::findOrFail($user_id);
            $assignedUser = User::findOrFail($user_id);
            if ($assignedUser->company_id !== Auth::user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن تعيين المهمة لمستخدم من شركة أخرى'
                ], 403);
            }

                $task = Task::create([
                    'title' => $request->title,
                    'description' => $request->description,
                    'assigned_to' => $user_id,
                    'assigned_by' => Auth::id(),
                    'due_date' => $request->due_date,
                    'status' => 'pending',
                    'company_id' => Auth::user()->company_id,
                    'task_id' => $newTaskId,
                ]);

            $user = User::find($user_id);

            if ($user && $user->email) {
                // Mail::to($user->email)->send(new TaskAssignedMail($task, $user));
               $this->sendEmail($user , $task);
            }
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
        }

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء المهمة بنجاح',
            'task'    => $task->load(['assignee', 'files'])
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $originalTask = Task::where('id', $id)
            ->where('company_id', Auth::user()->company_id)
            ->firstOrFail();



        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'description' => 'nullable|string',
            'assigned_to' => 'required|array',
            'assigned_to.*' => 'required|exists:users,id',
            'due_date' => 'required|date|after_or_equal:today',
            'files.*' => 'nullable|file',
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

        $arr = count($request->assigned_to);

        $taskIdToUse = $originalTask->task_id;
        if ($arr > 1 && !$originalTask->task_id) {
            $maxTaskId = Task::where('company_id', Auth::user()->company_id)->max('task_id');
            $taskIdToUse = $maxTaskId ? $maxTaskId + 1 : 1;
        }

        if ($originalTask->task_id) {
            $groupTasks = Task::where('task_id', $originalTask->task_id)
                ->where('company_id', Auth::user()->company_id)
                ->get();

            foreach ($groupTasks as $groupTask) {
                foreach ($groupTask->files as $file) {
                    Storage::disk('public')->delete($file->file_path);
                    $file->delete();
                }
                $groupTask->delete();
            }
        } else {
            foreach ($originalTask->files as $file) {
                Storage::disk('public')->delete($file->file_path);
                $file->delete();
            }
            $originalTask->delete();
        }

        $createdTasks = [];

        foreach ($request->assigned_to as $user_id) {
            $assignedUser = User::findOrFail($user_id);
            if ($assignedUser->company_id !== Auth::user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن تعيين المهمة لمستخدم من شركة أخرى'
                ], 403);
            }

            $taskData = [
                'title' => $request->title,
                'description' => $request->description,
                'assigned_to' => $user_id,
                'assigned_by' => Auth::id(),
                'due_date' => $request->due_date,
                'status' => 'pending',
                'company_id' => Auth::user()->company_id,
            ];


                $taskData['task_id'] = $taskIdToUse;


            $task = Task::create($taskData);
            $createdTasks[] = $task;

            $user = User::find($user_id);
            if ($user && $user->email) {
                // Mail::to($user->email)->send(new TaskAssignedMail($task, $user));
                $this->sendEmail($user , $task);
            }

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
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث المهمة بنجاح',
            'tasks' => $createdTasks
        ]);
    }

    public function destroy($id)
    {
        $task = Task::where('id', $id)
            ->where('company_id', Auth::user()->company_id)
            ->firstOrFail();



            $tasks=Task::where('company_id', Auth::user()->company_id)->where('task_id', $task->task_id)->get();
            foreach ($tasks as $task) {
                foreach ($task->files as $file) {
                 Storage::disk('public')->delete($file->file_path);
                $file->delete();
            }
            $task->delete();
        }
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


        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,pending,in_progress,completed,overdue'
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

    public function taskText(Request $request ,$id)
    {
            $validator = Validator::make($request->all(), [
                'task_text' => 'nullable',
                'task_file' => 'nullable|file'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors'  => $validator->errors()
                ], 422);
            }

            $task = Task::where('id', $id)
                ->where('company_id', Auth::user()->company_id)
                ->firstOrFail();


            if ($request->filled('task_text')) {
                $task->update(['task_text' => $request->task_text]);
            }

            if ($request->hasFile('task_file')) {
                $file = $request->file('task_file');
                $path = $file->store("tasks/{$task->id}", 'public');

                $task->update([
                    'task_file' => $path,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث المهمة بنجاح',
                'task'    => $task
            ]);
    }

}
