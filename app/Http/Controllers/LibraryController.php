<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Folder;
use App\Models\File;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class LibraryController extends Controller
{
    public function getFolders()
    {
        $folders = Folder::where('company_id', Auth::user()->company_id)->withCount('files')->get();
        return response()->json([
            'folders' => $folders
        ], 200);
    }

    public function createFolder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:folders,id'
        ], [
            'name.required' => 'الاسم مطلوب',
            'name.string' => 'الاسم يجب أن يكون نصًا',
            'name.max' => 'الاسم يجب ألا يزيد عن 255 حرفًا',

            'parent_id.exists' => 'المجلد الأب غير موجود'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $folder = Folder::create([
            'name' => $request->name,
            'company_id' => Auth::user()->company_id,
            'parent_id' => $request->parent_id
        ]);

        return response()->json([
            'message' => 'تم إنشاء المجلد بنجاح',
            'folder' => $folder
        ], 201);
    }

    public function updateFolder(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255'
        ], [
            'name.required' => 'الاسم مطلوب',
            'name.string' => 'الاسم يجب أن يكون نصًا',
            'name.max' => 'الاسم يجب ألا يزيد عن 255 حرفًا',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $folder = Folder::where('company_id', Auth::user()->company_id)
            ->findOrFail($id);

        $folder->update([
            'name' => $request->name
        ]);

        return response()->json([
            'message' => 'تم تحديث المجلد بنجاح',
            'folder' => $folder
        ], 200);
    }


    public function deleteFolder($id)
    {
        $folder = Folder::where('company_id', Auth::user()->company_id)
            ->with('files')
            ->findOrFail($id);


        foreach ($folder->files as $file) {
            Storage::delete('public/' . $file->path);
            $file->delete();
        }

        $folder->delete();

        return response()->json([
            'message' => 'تم حذف المجلد وجميع محتوياته بنجاح'
        ], 200);
    }

    public function getFolderFiles($folderId = null)
    {
        $query = File::where('company_id', Auth::user()->company_id)
            ->with('uploadedBy');

        if ($folderId) {
            $query->where('folder_id', $folderId);
        } else {
            $query->whereNull('folder_id');
        }

        $files = $query->get();

        return response()->json([
            'files' => $files
        ], 200);
    }


    public function uploadFiles(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'files' => 'required|array',
            'files.*' => 'file|max:40960',
            'folder_id' => 'nullable|exists:folders,id'
        ], [
            'files.required' => 'الملفات مطلوبة',
            'files.array' => 'الملفات يجب أن تكون على شكل مصفوفة',
            'files.*.file' => 'يجب أن يكون العنصر ملفًا صالحًا',
            'files.*.max' => 'حجم الملف لا يجب أن يتجاوز 40 ميجابايت',
            'folder_id.exists' => 'المجلد المحدد غير موجود',
        ]);


        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $uploadedFiles = [];

        foreach ($request->file('files') as $file) {
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();


            $cleanName = preg_replace('/[^a-zA-Z0-9_\-\s\.]/', '_', $originalName);
            $fileName = time() . '_' . $cleanName;

            $folderPath = $request->folder_id ? "library/{$request->folder_id}" : "library";


            if (!Storage::exists('public/' . $folderPath)) {
                Storage::makeDirectory('public/' . $folderPath);
            }

            $path = $file->storeAs($folderPath, $fileName, 'public');

            $uploadedFile = File::create([
                'name' => $originalName,
                'path' => $path,
                'size' => $file->getSize(),
                'extension' => $extension,
                'folder_id' => $request->folder_id,
                'company_id' => Auth::user()->company_id,
                'uploaded_by' => Auth::id(),
            ]);

            $uploadedFiles[] = $uploadedFile;
        }

        return response()->json([
            'message' => 'تم رفع الملفات بنجاح',
            'files' => $uploadedFiles
        ], 201);
    }

    public function downloadFile($id)
    {
        $file = File::where('company_id', Auth::user()->company_id)
            ->findOrFail($id);

        $storedFileName = basename($file->path);
        $directory = dirname($file->path);

        $filePath = storage_path('app/public/' . $file->path);

        if (!file_exists($filePath)) {
            $filesInDirectory = Storage::files('public/' . $directory);

            foreach ($filesInDirectory as $storedFile) {
                if (strpos($storedFile, $storedFileName) !== false) {
                    $filePath = storage_path('app/' . $storedFile);
                    break;
                }
            }

            if (!file_exists($filePath)) {
                return response()->json([
                    'message' => 'الملف غير موجود'
                ], 404);
            }
        }

        $headers = [
            'Content-Type' => 'application/octet-stream',
            'Content-Disposition' => 'attachment; filename="' . $file->name . '"',
        ];

        return response()->download($filePath, $file->name, $headers);
    }

    public function deleteFile($id)
    {
        $file = File::where('company_id', Auth::user()->company_id)
            ->findOrFail($id);

        Storage::delete('public/' . $file->path);

        $file->delete();

        return response()->json([
            'message' => 'تم حذف الملف بنجاح'
        ], 200);
    }

    public function searchFiles(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:2'
        ], [
            'query.required' => 'حقل البحث مطلوب',
            'query.string' => 'حقل البحث يجب أن يكون نصًا',
            'query.min' => 'حقل البحث يجب أن يكون على الأقل حرفين',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $files = File::where('company_id', Auth::user()->company_id)
            ->where('name', 'like', '%' . $request->query . '%')
            ->get();

        return response()->json([
            'files' => $files
        ], 200);
    }
}
