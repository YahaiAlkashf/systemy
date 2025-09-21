<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\Announcement;


class AnnouncementController extends Controller
{

    public function index()
    {
        $companyId = Auth::user()->company_id;
        $announcement = Announcement::where('company_id', $companyId)
            ->latest()
            ->first();

        return response()->json([
            'announcement' => $announcement ? $announcement->content : ''
        ]);
    }

    public function store(Request $request)
    {
          $validator = Validator::make($request->all(), [
            'content' => 'required|string'
        ],[
            'content.required'=>'الحقل مطلوب'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        $companyId = Auth::user()->company_id;

        Announcement::where('company_id', $companyId)->delete();

        $announcement = Announcement::create([
            'company_id' => $companyId,
            'user_id' => Auth::id(),
            'content' => $request->content
        ]);

        return response()->json([
            'message' => 'تم حفظ الإعلان بنجاح',
            'announcement' => $announcement
        ]);
    }

    public function destroy()
    {
        $companyId = Auth::user()->company_id;
        Announcement::where('company_id', $companyId)->delete();

        return response()->json([
            'message' => 'تم حذف الإعلان بنجاح'
        ]);
    }
}
