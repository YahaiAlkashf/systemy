<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('invoice_retail_flows', function (Blueprint $table) {
        $table->foreignId('customer_id')->nullable()->constrained('customer_retail_flows')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoice_retail_flows', function (Blueprint $table) {
            //
        });
    }
};
