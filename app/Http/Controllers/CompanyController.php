<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompanyController extends Controller
{
    public function update(Request $request){
        $validated = $request->validate([
            'name' => 'required',
            'logo'=>'nullable'
        ]);
        $company = Company::findOrFail(Auth::user()->company_id);

            if ($request->hasFile('logo')) {
                $logo = $request->file('logo')->store('companies_logo', 'public');
                $company->update(['logo' => $logo]);
            }
                $company->update(['company_name' => $request->name]);


    }
}
