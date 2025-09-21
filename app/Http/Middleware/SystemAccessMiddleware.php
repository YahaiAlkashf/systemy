<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SystemAccessMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect('/login');
        }

        $user = Auth::user();
        $currentPath = $request->path();

        if ($user->system_type === 'manager') {
            return $next($request);
        }

        $allowedPaths = [
            'clubs' => [
                'clubs', 'clubs/*',
                'dashboard', 'profile'
            ],
            'retail' => ['retailFlow', 'retailFlow/*'],
            'services' => ['retailFlow', 'retailFlow/*'],
            'education' => ['retailFlow', 'retailFlow/*'],
            'realEstate' => ['retailFlow', 'retailFlow/*'],
            'delivery' => ['retailFlow', 'retailFlow/*'],
            'travels' => ['retailFlow', 'retailFlow/*'],
            'gym' => ['retailFlow', 'retailFlow/*'],
            'hotel' => ['retailFlow', 'retailFlow/*'],
        ];

        if (!isset($user->system_type) || !isset($allowedPaths[$user->system_type])) {
            return abort(403, 'نظام المستخدم غير معروف أو غير مصرح به');
        }

        $isAllowed = false;
        foreach ($allowedPaths[$user->system_type] as $allowedPath) {
            if ($this->pathMatches($currentPath, $allowedPath)) {
                $isAllowed = true;
                break;
            }
        }

        if (!$isAllowed) {
            return abort(403, 'غير مصرح لك بالدخول على هذا النظام');
        }

        return $next($request);
    }


    private function pathMatches(string $path, string $pattern): bool
    {
        if ($pattern === $path) {
            return true;
        }

        if (strpos($pattern, '*') !== false) {
            $pattern = preg_quote($pattern, '#');
            $pattern = str_replace('\*', '.*', $pattern);
            return (bool) preg_match('#^' . $pattern . '$#', $path);
        }

        return false;
    }
}
