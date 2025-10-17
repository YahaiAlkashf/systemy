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
                $table->decimal('paid_amount', 20, 2)->change();
                $table->decimal('total', 20, 2)->change();
                $table->decimal('total_profit', 20, 2)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('your', function (Blueprint $table) {
            //
        });
    }
};
