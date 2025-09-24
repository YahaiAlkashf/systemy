<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\User;
use App\Models\Event;
use App\Models\Task;
use App\Models\EventAttendance;
use Elibyy\TCPDF\TCPDF;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MemberController extends Controller
{
    public function index()
    {
        try {

            $members = Member::with(['cycle', 'user'])
                ->where('company_id', Auth::user()->company_id)
                ->get();

            return response()->json([
                'success' => true,
                'members' => $members
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|confirmed',
            'cycle_id' => 'nullable|exists:cycles,id',
            'role' => 'required|string|in:manager,member',
            'rating' => 'required|integer|min:0|max:5',
            'member_id' => 'nullable|unique:members,member_id',
            'add_members'=>'nullable'
        ], [
            'name.required' => 'الاسم مطلوب',
            'name.string' => 'الاسم يجب أن يكون نصًا',
            'name.max' => 'الاسم يجب ألا يزيد عن 255 حرفًا',

            'phone.required' => 'رقم الهاتف مطلوب',
            'phone.string' => 'رقم الهاتف يجب أن يكون نصًا',
            'phone.max' => 'رقم الهاتف يجب ألا يزيد عن 20 حرفًا',

            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني غير صالح',
            'email.unique' => 'البريد الإلكتروني مستخدم بالفعل',

            'password.required' => 'كلمة المرور مطلوبة',
            'password.confirmed' => 'تأكيد كلمة المرور غير مطابق',

            'cycle_id.exists' => 'الدورة المحددة غير موجودة',

            'role.required' => 'الدور مطلوب',
            'role.string' => 'الدور يجب أن يكون نصًا',
            'role.in' => 'الدور غير صالح',

            'rating.required' => 'التقييم مطلوب',
            'rating.integer' => 'التقييم يجب أن يكون رقمًا صحيحًا',
            'rating.min' => 'التقييم لا يمكن أن يكون أقل من 0',
            'rating.max' => 'التقييم لا يمكن أن يكون أكبر من 5',

            'member_id.unique' => 'رقم العضو مستخدم بالفعل',
        ]);


        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin',
            'company_id' => Auth::user()->company_id,
            'system_type' => 'clubs',
            'country' => Auth::user()->country,
            'subscription' => Auth::user()->subscription,
            'subscription_expires_at' => Auth::user()->subscription_expires_at,
            'trial_used' => Auth::user()->trial_used,
        ]);

        $member = Member::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'cycle_id' => $request->cycle_id,
            'role' => $request->role,
            'rating' => $request->rating,
            'user_id' => $user->id,
            'member_id' => $request->member_id,
            'company_id' => Auth::user()->company_id,
            'add_members' => $request->add_members ?? false
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة العضو بنجاح',
            'member' => $member->load('user')
        ]);
    }

    public function update(Request $request, Member $member)
    {


        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|unique:users,email,' . $member->user_id,
            'password' => 'nullable|confirmed',
            'cycle_id' => 'nullable|exists:cycles,id',
            'role' => 'required|string|in:manager,member',
            'rating' => 'required|integer|min:0|max:5',
            'add_members'=>'nullable',
            'member_id' => 'nullable|unique:members,member_id,' . $member->id
        ], [
            'name.required' => 'الاسم مطلوب',
            'name.string' => 'الاسم يجب أن يكون نصًا',
            'name.max' => 'الاسم يجب ألا يزيد عن 255 حرفًا',

            'phone.required' => 'رقم الهاتف مطلوب',
            'phone.string' => 'رقم الهاتف يجب أن يكون نصًا',
            'phone.max' => 'رقم الهاتف يجب ألا يزيد عن 20 حرفًا',

            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني غير صالح',
            'email.unique' => 'البريد الإلكتروني مستخدم بالفعل',

            'password.confirmed' => 'تأكيد كلمة المرور غير مطابق',

            'cycle_id.exists' => 'الدورة المحددة غير موجودة',

            'role.required' => 'الدور مطلوب',
            'role.string' => 'الدور يجب أن يكون نصًا',
            'role.in' => 'الدور غير صالح',

            'rating.required' => 'التقييم مطلوب',
            'rating.integer' => 'التقييم يجب أن يكون رقمًا صحيحًا',
            'rating.min' => 'التقييم لا يمكن أن يكون أقل من 0',
            'rating.max' => 'التقييم لا يمكن أن يكون أكبر من 5',

            'member_id.unique' => 'رقم العضو مستخدم بالفعل',
        ]);


        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($member->user_id);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => 'admin',
            'company_id' => Auth::user()->company_id,
            'system_type' => 'clubs',
            'country' => Auth::user()->country,
            'subscription' => Auth::user()->subscription,
        ];

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        $user->update($userData);

        $member->update([
            'name' => $request->name,
            'phone' => $request->phone,
            'cycle_id' => $request->cycle_id,
            'role' => $request->role,
            'rating' => $request->rating,
            'member_id' => $request->member_id,
           'add_members' => $request->add_members ?? false
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات العضو بنجاح',
            'member' => $member->load('user')
        ]);
    }

    public function destroy($id)
    {
        $member = Member::findOrFail($id);

        $user = User::findOrFail($member->user_id);
        if ($user->role == 'superadmin') {
            return response()->json(['error' => 'لا يمكن حذف هذا المستخدم'], 422);
        }
        $member->delete();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف العضو بنجاح'
        ]);
    }

    public function memberProfile()
    {
        $member = Member::where('user_id', Auth::user()->id)->with(['company','cycle'])->first();
        return response()->json([
            'member' => $member
        ]);
    }

    public function getMembersWithDetails()
    {
        try {
            $companyId = Auth::user()->company_id;

            $startOfMonth = now()->startOfMonth()->toDateString();
            $endOfMonth = now()->endOfMonth()->toDateString();

            $members = Member::with(['user', 'cycle'])
                ->where('company_id', $companyId)
                ->get();

            $attendanceCounts = EventAttendance::join('users', 'event_attendances.user_id', '=', 'users.id')
                ->join('members', 'users.id', '=', 'members.user_id')
                ->join('events', 'event_attendances.event_id', '=', 'events.id')
                ->where('members.company_id', $companyId)
                ->where('event_attendances.status', 'attending')
                ->whereBetween('events.date', [$startOfMonth, $endOfMonth])
                ->selectRaw('members.id as member_id, COUNT(*) as attending_count')
                ->groupBy('members.id')
                ->get()
                ->keyBy('member_id');

            $completedTasksCounts = Task::join('users', 'tasks.assigned_to', '=', 'users.id')
                ->join('members', 'users.id', '=', 'members.user_id')
                ->where('members.company_id', $companyId)
                ->where('tasks.status', 'completed')
                ->whereBetween('tasks.due_date', [$startOfMonth, $endOfMonth])
                ->selectRaw('members.id as member_id, COUNT(*) as completed_tasks_count')
                ->groupBy('members.id')
                ->get()
                ->keyBy('member_id');

            $members = $members->map(function ($member) use ($attendanceCounts, $completedTasksCounts) {
                $attendanceData = $attendanceCounts[$member->id] ?? null;
                $completedTasksData = $completedTasksCounts[$member->id] ?? null;

                $member->attended_events_count = $attendanceData->attending_count ?? 0;

                $member->completed_tasks_count = $completedTasksData->completed_tasks_count ?? 0;

                $member->total_score = $member->attended_events_count + $member->completed_tasks_count;

                return $member;
            });

            return response()->json([
                'success' => true,
                'members' => $members,
                'period' => 'شهر ' . now()->translatedFormat('F Y') // إضافة معلومات عن الفترة
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب بيانات الأعضاء',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getMemberAllEvents($id)
    {
        try {
            $member = Member::findOrFail($id);

            if ($member->company_id !== Auth::user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح بالوصول إلى بيانات هذا العضو'
                ], 403);
            }

            $events = Event::join('event_attendances', 'events.id', '=', 'event_attendances.event_id')
                ->where('event_attendances.user_id', $member->user_id)
                ->select('events.*', 'event_attendances.status as attendance_status')
                ->orderBy('events.date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'events' => $events
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب أحداث العضو'
            ], 500);
        }
    }


    public function getMemberAllTasks($id)
    {
        try {
            $member = Member::findOrFail($id);

            if ($member->company_id !== Auth::user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح بالوصول إلى بيانات هذا العضو'
                ], 403);
            }

            $tasks = Task::with(['assigner', 'assignee'])
                ->where('assigned_to', $member->user_id)
                ->where('company_id', $member->company_id)
                ->orderBy('due_date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'tasks' => $tasks
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب مهام العضو'
            ], 500);
        }
    }

    public function getMemberEvents($id)
    {
        try {
            $member = Member::findOrFail($id);

            if ($member->company_id !== Auth::user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح بالوصول إلى بيانات هذا العضو'
                ], 403);
            }

            $events = Event::join('event_attendances', 'events.id', '=', 'event_attendances.event_id')
                ->where('event_attendances.user_id', $member->user_id)
                ->where('event_attendances.status', 'attending') // فقط الحضور
                ->select('events.*', 'event_attendances.status as attendance_status')
                ->orderBy('events.date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'events' => $events
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب أحداث العضو'
            ], 500);
        }
    }


    public function getMemberTasks($id)
    {
        try {
            $member = Member::findOrFail($id);

            if ($member->company_id !== Auth::user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح بالوصول إلى بيانات هذا العضو'
                ], 403);
            }

            $tasks = Task::with(['assigner', 'assignee'])
                ->where('assigned_to', $member->user_id)
                ->where('company_id', $member->company_id)
                ->orderBy('due_date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'tasks' => $tasks
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب مهام العضو'
            ], 500);
        }
    }

       public function exportPDF(Request $request)
    {
        $sortBy = $request->get('sort_by', 'default');
        $search = $request->get('search', '');

        $members = $this->getFilteredMembers($sortBy, $search);

        $user = Auth::user();
        $pdf = new TCPDF('L', 'mm', 'A4', true, 'UTF-8', false);

        $pdf->SetCreator('System');
        $pdf->SetAuthor($user->name);
        $pdf->SetTitle('تقرير الأعضاء');
        $pdf->SetSubject('تقرير الأعضاء');

        $pdf->AddPage();
        $pdf->SetFont('dejavusans', '', 12);

        $html = '<h1 style="text-align:center; font-family:dejavusans;">تقرير الأعضاء</h1>';
        $html .= '<p style="text-align:center;">تاريخ التقرير: ' . date('Y-m-d') . '</p>';

        $html .= '<table dir="rtl" border="1" cellpadding="5" style="width:100%; border-collapse:collapse; direction:rtl; text-align:right; font-family:dejavusans;">';
        $html .= "<thead><tr>
                <th>#</th>
                <th>الاسم</th>
                <th>البريد الإلكتروني</th>
                <th>الدور</th>
                <th>رقم التليفون</th>
                <th>الرقم التعريفى (ID)</th>
                <th>الرتبة</th>
                <th>التقييم</th>
                <th>الأحداث الحاضرة</th>
                <th>المهام المكتملة</th>
                <th>المجموع الكلي</th>
                </tr></thead>";

        $html .= '<tbody>';

        foreach ($members as $index => $member) {
            $stars = '';
            for ($i = 1; $i <= 5; $i++) {
                $stars .= $i <= $member->rating ? '★' : '☆';
            }

            $html .= '<tr>
                    <td>' . ($index + 1) . '</td>
                    <td>' . $member->name . '</td>
                    <td>' . ($member->user->email ?? 'لا يوجد') . '</td>
                    <td>' . ($member->cycle->name ?? 'لا يوجد') . '</td>
                    <td>' . $member->phone . '</td>
                    <td>' . $member->member_id . '</td>
                    <td>' . $member->role . '</td>
                    <td>' . $stars . '</td>
                    <td>' . ($member->attended_events_count ?? 0) . '</td>
                    <td>' . ($member->completed_tasks_count ?? 0) . '</td>
                    <td>' . ($member->total_score ?? 0) . '</td>
                    </tr>';
        }

        $html .= '</tbody></table>';

        $pdf->writeHTML($html, true, false, true, false, '');

        $fileName = 'أعضاء_' . date('Y-m-d') . '.pdf';
        $pdf->Output($fileName, 'D');

        exit;
    }

    public function exportExcel(Request $request)
    {
        $sortBy = $request->get('sort_by', 'default');
        $search = $request->get('search', '');

        $members = $this->getFilteredMembers($sortBy, $search);

        $fileName = 'أعضاء_' . date('Y-m-d') . '.xlsx';

        $spreadsheet = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
            <Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\"
                    xmlns:x=\"urn:schemas-microsoft-com:office:excel\"
                    xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\"
                    xmlns:html=\"http://www.w3.org/TR/REC-html40\">
            <Worksheet ss:Name=\"الأعضاء\">
            <Table>
            <Row>
                <Cell><Data ss:Type=\"String\">#</Data></Cell>
                <Cell><Data ss:Type=\"String\">الاسم</Data></Cell>
                <Cell><Data ss:Type=\"String\">البريد الإلكتروني</Data></Cell>
                <Cell><Data ss:Type=\"String\">الدور</Data></Cell>
                <Cell><Data ss:Type=\"String\">رقم التليفون</Data></Cell>
                <Cell><Data ss:Type=\"String\">الرقم التعريفى (ID)</Data></Cell>
                <Cell><Data ss:Type=\"String\">الرتبة</Data></Cell>
                <Cell><Data ss:Type=\"String\">التقييم</Data></Cell>
                <Cell><Data ss:Type=\"String\">الأحداث الحاضرة</Data></Cell>
                <Cell><Data ss:Type=\"String\">المهام المكتملة</Data></Cell>
                <Cell><Data ss:Type=\"String\">المجموع الكلي</Data></Cell>
            </Row>";

        foreach ($members as $index => $member) {
            $stars = '';
            for ($i = 1; $i <= 5; $i++) {
                $stars .= $i <= $member->rating ? '★' : '☆';
            }

            $spreadsheet .= "
            <Row>
                <Cell><Data ss:Type=\"Number\">" . ($index + 1) . "</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$member->name}</Data></Cell>
                <Cell><Data ss:Type=\"String\">" . ($member->user->email ?? 'لا يوجد') . "</Data></Cell>
                <Cell><Data ss:Type=\"String\">" . ($member->cycle->name ?? 'لا يوجد') . "</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$member->phone}</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$member->member_id}</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$member->role}</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$stars}</Data></Cell>
                <Cell><Data ss:Type=\"Number\">" . ($member->attended_events_count ?? 0) . "</Data></Cell>
                <Cell><Data ss:Type=\"Number\">" . ($member->completed_tasks_count ?? 0) . "</Data></Cell>
                <Cell><Data ss:Type=\"Number\">" . ($member->total_score ?? 0) . "</Data></Cell>
            </Row>";
        }

        $spreadsheet .= "
            </Table>
            </Worksheet>
            </Workbook>";

        $headers = [
            'Content-Type' => 'application/vnd.ms-excel',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ];

        return response($spreadsheet, 200, $headers);
    }

    private function getFilteredMembers($sortBy, $search)
    {
        $companyId = Auth::user()->company_id;

        $startOfMonth = now()->startOfMonth()->toDateString();
        $endOfMonth = now()->endOfMonth()->toDateString();

        $members = Member::with(['user', 'cycle'])
            ->where('company_id', $companyId)
            ->where(function($query) use ($search) {
                $query->where('name', 'like', "%$search%")
                    ->orWhere('phone', 'like', "%$search%")
                    ->orWhere('role', 'like', "%$search%")
                    ->orWhere('member_id', 'like', "%$search%")
                    ->orWhereHas('user', function($q) use ($search) {
                        $q->where('email', 'like', "%$search%");
                    });
            })
            ->get();

        $attendanceCounts = EventAttendance::join('users', 'event_attendances.user_id', '=', 'users.id')
            ->join('members', 'users.id', '=', 'members.user_id')
            ->join('events', 'event_attendances.event_id', '=', 'events.id')
            ->where('members.company_id', $companyId)
            ->where('event_attendances.status', 'attending')
            ->whereBetween('events.date', [$startOfMonth, $endOfMonth])
            ->selectRaw('members.id as member_id, COUNT(*) as attending_count')
            ->groupBy('members.id')
            ->get()
            ->keyBy('member_id');

        $completedTasksCounts = Task::join('users', 'tasks.assigned_to', '=', 'users.id')
            ->join('members', 'users.id', '=', 'members.user_id')
            ->where('members.company_id', $companyId)
            ->where('tasks.status', 'completed')
            ->whereBetween('tasks.due_date', [$startOfMonth, $endOfMonth])
            ->selectRaw('members.id as member_id, COUNT(*) as completed_tasks_count')
            ->groupBy('members.id')
            ->get()
            ->keyBy('member_id');

        $members = $members->map(function ($member) use ($attendanceCounts, $completedTasksCounts) {
            $attendanceData = $attendanceCounts[$member->id] ?? null;
            $completedTasksData = $completedTasksCounts[$member->id] ?? null;

            $member->attended_events_count = $attendanceData->attending_count ?? 0;
            $member->completed_tasks_count = $completedTasksData->completed_tasks_count ?? 0;
            $member->total_score = $member->attended_events_count + $member->completed_tasks_count;

            return $member;
        });

        // تطبيق الترتيب
        switch ($sortBy) {
            case "completed_tasks":
                $members = $members->sortByDesc('completed_tasks_count');
                break;
            case "attended_events":
                $members = $members->sortByDesc('attended_events_count');
                break;
            case "total_score":
                $members = $members->sortByDesc('total_score');
                break;
            default:

                break;
        }

        return $members;
    }
}
