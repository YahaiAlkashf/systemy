<?php

use App\Http\Middleware\SuperAdminMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\ForceHttpsMiddleware::class,
        ]);
        $middleware->alias([
            'SuperAdmin' => SuperAdminMiddleware::class,
            'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
            'plan' => \App\Http\Middleware\SupscriptionMiddleware::class,
            'manager'=>\App\Http\Middleware\ManegarMiddelware::class,
            'access-system'=>\App\Http\Middleware\SystemAccessMiddleware::class,
            'manageplanpage'=>\App\Http\Middleware\PlanMiddleware::class,
        ]);
        $middleware->trustProxies(at: '*');
        $middleware->trustProxies(
            headers: Request::HEADER_X_FORWARDED_FOR |
                Request::HEADER_X_FORWARDED_HOST |
                Request::HEADER_X_FORWARDED_PORT |
                Request::HEADER_X_FORWARDED_PROTO |
                Request::HEADER_X_FORWARDED_AWS_ELB
        );
    })->withSchedule(function (Illuminate\Console\Scheduling\Schedule $schedule) {
        $schedule->command('subscriptions:expire')->daily();
        $schedule->command('app:task-commands')->daily();
        $schedule->command('rents:remind')->dailyAt('09:00');
        $schedule->command('files:delete-old')->daily();
        $schedule->command('tasks:delete-old-files')->daily();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
