<?php

use App\Http\Controllers\RetailFlow\CustomerRetailFlowController;
use App\Http\Controllers\RetailFlow\InvoiceRetailFlowController;
use App\Http\Controllers\RetailFlow\ProductRetailFlowController;
use App\Http\Controllers\RetailFlow\UserManagementController;
use App\Http\Controllers\RentsController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\LibraryController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\CycleController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\FawryController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StripeController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\WhatsAppController;
use App\Models\CustomerRetailFlow;
use App\Models\Notification;
use App\Models\WhatsappMessage;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Application;
use App\Http\Controllers\PaymobController;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



Route::post('/login-token', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (!auth()->attempt($request->only('email', 'password'))) {
        return response()->json(['message' => 'Invalid login details'], 401);
    }

    $user = User::where('email', $request->email)->first();

    $token = $user->createToken('api-token')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user' => $user,
    ]);
});






Route::get('/', function () {
    return Inertia::render('Index');
});

 Route::middleware('auth:sanctum')->group(function () {

        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');



        //relatflow Routs

        Route::get('/retailFlow', function () {
            return Inertia::render('RetailFlow/index');
        })->middleware('auth');
        Route::get('/retailFlow/products', function () {
            return Inertia::render('RetailFlow/Products');
        });
        Route::get('/retailFlow/customers', function () {
            return Inertia::render('RetailFlow/Customers');
        });
        Route::get('/retailFlow/invoices', function () {
            return Inertia::render('RetailFlow/Invoices');
        });
        Route::get('/retailFlow/api_access', function () {
            return Inertia::render('RetailFlow/API_Access');
        });

        Route::get('/retailFlow/settings', function (Request $request) {
            return Inertia::render('RetailFlow/Settings', [
                'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
                'status' => session('status'),
            ]);
        });
        Route::get('/whatsapp', function () {
            return Inertia::render('RetailFlow/Whatsapp');
        });
        Route::get('/productretailFlow', [ProductRetailFlowController::class, 'index']);
        Route::post('/productretailFlow', [ProductRetailFlowController::class, 'store']);
        Route::post('/productretailFlow/{id}', [ProductRetailFlowController::class, 'update']);
        Route::delete('/productretailFlow/{id}', [ProductRetailFlowController::class, 'destroy']);

        Route::get('/customerretailFlow', [CustomerRetailFlowController::class, 'index']);
        Route::post('/customerretailFlow', [CustomerRetailFlowController::class, 'store']);
        Route::post('/customerretailFlow/{id}', [CustomerRetailFlowController::class, 'update']);
        Route::delete('/customerretailFlow/{id}', [CustomerRetailFlowController::class, 'destroy']);

        Route::get('/invoiceretailFlow', [InvoiceRetailFlowController::class, 'index']);
        Route::post('/invoiceretailFlow', [InvoiceRetailFlowController::class, 'store']);
        Route::post('/invoiceretailFlow/{id}', [InvoiceRetailFlowController::class, 'update']);
        Route::delete('/invoiceretailFlow/{id}', [InvoiceRetailFlowController::class, 'destroy']);

        // rents CRUD
        Route::get('/rentsretailFlow', [RentsController::class, 'index']);
        Route::post('/rentsretailFlow', [RentsController::class, 'store']);
        Route::post('/rentsretailFlow/{id}', [RentsController::class, 'update']);
        Route::delete('/rentsretailFlow/{id}', [RentsController::class, 'destroy']);

        Route::middleware('SuperAdmin')->group(function () {
            Route::get('retailflow/users', [UserManagementController::class, 'index']);
            Route::post('retailflow/users', [UserManagementController::class, 'store']);
            Route::delete('retailflow/users/{user}', [UserManagementController::class, 'destroy']);
        });
        Route::get('/notifications', function () {
            return  Notification::latest()->where("company_id", Auth::user()->company_id)->get();
        });

        Route::post('/notifications/read', function () {
            Notification::where('read', false)->update(['read' => true]);
            return response()->json(['message' => 'تمت قراءة الإشعار']);
        });

        //Export data pdf && Execl
        Route::get('/retailflow/export/products/pdf', [ProductRetailFlowController::class, 'exportPDF'])->name('export.products.pdf');
        Route::get('/retailflow/export/products/excel', [ProductRetailFlowController::class, 'exportExcel'])->name('export.products.excel');
        Route::get('/retailflow/export/customers/pdf', [CustomerRetailFlowController::class, 'exportPDF'])->name('export.customers.pdf');
        Route::get('/retailflow/export/customers/excel', [CustomerRetailFlowController::class, 'exportExcel'])->name('export.customers.excel');
        Route::get('/retailflow/export/invoices/pdf', [InvoiceRetailFlowController::class, 'exportInvoicesPDF'])->name('export.invoices.pdf');
        Route::get('/retailflow/export/invoices/excel', [InvoiceRetailFlowController::class, 'exportInvoicesExcel'])->name('export.invoices.excel');
        Route::get('/retailflow/export/invoice/{id}/pdf', [InvoiceRetailFlowController::class, 'exportInvoicePDF'])->name('export.invoice.pdf');

        Route::post('whatsapp/settings', [WhatsAppController::class, 'saveSettings'])->name('company.whatsapp.settings.save');
        Route::post('whatsapp/send', [WhatsAppController::class, 'sendMessage'])->name('company.whatsapp.send');
        Route::post('whatsapp/test', [WhatsAppController::class, 'testConnection'])->name('company.whatsapp.test');



        //Clubs Routs
        Route::get('/members', [MemberController::class, 'index']);
        Route::post('/members', [MemberController::class, 'store']);
        Route::post('/members/{member}', [MemberController::class, 'update']);
        Route::delete('/members/{member}', [MemberController::class, 'destroy']);
        Route::get('/member/profile', [MemberController::class, 'memberProfile']);
        Route::get('/members-with-details', [MemberController::class, 'getMembersWithDetails']);
        Route::get('/members/{id}/events', [MemberController::class, 'getMemberEvents']);
        Route::get('/members/{id}/tasks', [MemberController::class, 'getMemberTasks']);
        Route::get('/members/{id}/all-events', [MemberController::class, 'getMemberAllEvents']);
        Route::get('/members/{id}/all-tasks', [MemberController::class, 'getMemberAllTasks']);

        // routes for Roles in Clubs system
        Route::get('/cycles', [CycleController::class, 'index']);
        Route::post('/cycles', [CycleController::class, 'store']);
        Route::post('/cycles/{id}', [CycleController::class, 'update']);
        Route::delete('/cycles/{id}', [CycleController::class, 'destroy']);

        // routes for Tasks in Clubs system

        Route::get('/tasks', [TaskController::class, 'index']);
        Route::post('/tasks', [TaskController::class, 'store']);
        Route::post('/tasks/{id}', [TaskController::class, 'update']);
        Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
        Route::post('/tasks/{task}/status', [TaskController::class, 'updateStatus']);

        //Route for Events in Clubs system
        Route::get('/events', [EventController::class, 'index']);
        Route::post('/events', [EventController::class, 'store']);
        Route::post('/events/{id}', [EventController::class, 'update']);
        Route::delete('/events/{id}', [EventController::class, 'destroy']);
        Route::post('/events/{id}/status', [EventController::class, 'attendEvent']);

        Route::get('/library/folders', [LibraryController::class, 'getFolders']);
        Route::post('/library/folders', [LibraryController::class, 'createFolder']);
        Route::put('/library/folders/{id}', [LibraryController::class, 'updateFolder']);
        Route::delete('/library/folders/{id}', [LibraryController::class, 'deleteFolder']);

        // routes for files
        Route::get('/library/files', [LibraryController::class, 'getFolderFiles']);
        Route::get('/library/folders/{folderId}/files', [LibraryController::class, 'getFolderFiles']);
        Route::post('/library/files', [LibraryController::class, 'uploadFiles']);
        Route::get('/library/files/{id}/download', [LibraryController::class, 'downloadFile']);
        Route::delete('/library/files/{id}', [LibraryController::class, 'deleteFile']);

        // search
        Route::get('/library/search', [LibraryController::class, 'searchFiles']);


        // routes for announcements
        Route::get('/announcement', [AnnouncementController::class, 'index']);
        Route::post('/announcement', [AnnouncementController::class, 'store']);
        Route::delete('/announcement', [AnnouncementController::class, 'destroy']);

        // routes for messages
        Route::get('/messages', [MessageController::class, 'index']);
        Route::post('/messages', [MessageController::class, 'store']);
        Route::delete('/messages/{id}', [MessageController::class, 'destroy']);




        //Manager Routs

        Route::middleware(['manager'])->group(function () {


            Route::get('/admin', function () {
                return Inertia::render('admin/index');
            });
            Route::get('/admin/products', function () {
                return Inertia::render('admin/Products');
            });
            Route::get('/admin/customers', function () {
                return Inertia::render('admin/Customers');
            });
            Route::get('/admin/users', function () {
                return Inertia::render('admin/users');
            });
            Route::get('/admin/api_access', function () {
                return Inertia::render('admin/API_Access');
            });


            Route::get('/admin/settings', function (Request $request) {
                return Inertia::render('admin/Settings', [
                    'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
                    'status' => session('status'),
                ]);
            });


            Route::get('/admin/whatsapp', function () {
                return Inertia::render('admin/Whatsapp');
            });




            Route::get('/users', [AdminUserController::class, 'users']);
            Route::get('/customers', [AdminUserController::class, 'customers']);
            Route::post('/users', [AdminUserController::class, 'store'])->name("addUser");
            Route::post('/users/{id}', [AdminUserController::class, 'update'])->name("users.update");
            Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
            Route::post('/addSubscription/{id}', [AdminUserController::class, 'addSubscription'])->name('addSubscription');
        });

        Route::get('/api-tokens', function () {
            return Inertia::render('ApiTokens');
        })->middleware('auth');

    });



Route::post('/logout-token', function (Request $request) {
    $request->user()->currentAccessToken()->delete();
    return response()->json(['message' => 'Token revoked']);
});
