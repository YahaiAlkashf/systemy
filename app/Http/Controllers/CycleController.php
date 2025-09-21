<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Cycle;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class CycleController extends Controller
{
    public function index()
    {
        $cycles = Cycle::where('company_id', Auth::user()->company_id)->get();
        return response()->json([
            'success' => true,
            'cycles' => $cycles
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:cycles,name,NULL,id,company_id,' . Auth::user()->company_id
        ], [
            'name.required' => 'الاسم مطلوب',
            'name.string' => 'الاسم يجب أن يكون نصًا',
            'name.max' => 'الاسم يجب ألا يزيد عن 255 حرفًا',
            'name.unique' => 'هذا الاسم موجود بالفعل في شركتك',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $cycle = Cycle::create([
            'name' => $request->name,
            'company_id' => Auth::user()->company_id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الدور بنجاح',
        ]);
    }

    public function update(Request $request, $id)
    {
        $cycle=Cycle::findOrFail($id);
        if (Auth::user()->company_id !== $cycle->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح بتعديل هذا الدور'
            ], 403);
        }
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:cycles,name,' . $cycle->id . ',id,company_id,' . Auth::user()->company_id
        ], [
            'name.required' => 'الاسم مطلوب',
            'name.string' => 'الاسم يجب أن يكون نصًا',
            'name.max' => 'الاسم يجب ألا يزيد عن 255 حرفًا',
            'name.unique' => 'هذا الاسم موجود بالفعل في شركتك',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $cycle->update(['name' => $request->name]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الدور بنجاح',
            'role' => $cycle
        ]);
    }

    public function destroy($id)
    {
        $cycle=Cycle::findOrFail($id);
        if (Auth::user()->company_id !== $cycle->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح بحذف هذا الدور'
            ], 403);
        }

        $membersCount = Member::where('cycle_id', $cycle->id)
            ->where('company_id', Auth::user()->company_id)
            ->count();

        if ($membersCount > 0) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن حذف هذا الدور لأنه مستخدم من قبل بعض الأعضاء'
            ], 422);
        }

        $cycle->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الدور بنجاح'
        ]);
    }
}
