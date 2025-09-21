<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class ForceHttpsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (app()->environment('production') || $request->server->has('HTTPS')) {
            URL::forceScheme('https');
        }
        
        return $next($request);
    }
}