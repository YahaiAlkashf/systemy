<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\Message;

class MessageController extends Controller
{
    public function index()
    {
        $companyId = Auth::user()->company_id;
        $messages = Message::with(['user', 'user.member', 'user.member.cycle'])
            ->where('company_id', $companyId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'messages' => $messages
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:1000'
        ], [
            'content.required' => 'المحتوى مطلوب',
            'content.string' => 'المحتوى يجب أن يكون نصًا',
            'content.max' => 'المحتوى يجب ألا يزيد عن 1000 حرف',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        $companyId = Auth::user()->company_id;

        $message = Message::create([
            'company_id' => $companyId,
            'user_id' => Auth::id(),
            'content' => $request->content
        ]);

        $message->load(['user', 'user.member', 'user.member.cycle']);

        return response()->json([
            'message' => 'تم إرسال الرسالة بنجاح',
            'newMessage' => $message
        ]);
    }
    public function destroy($id)
    {
       $user = Auth::user();
        $message=Message::findOrFail($id);
        if ($user->member->role !== 'manager'  && $user->company_id !== $message->company_id) {
            return response()->json([
                'message' => 'غير مصرح لك بحذف هذه الرسالة'
            ], 403);
        }
        $message->delete();

        return response()->json([
            'message' => 'تم حذف الرسالة بنجاح'
        ]);

    }

}
