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
        Schema::table('invoice_item_retail_flows', function (Blueprint $table) {
            $table->bigInteger('quantity')->default(1)->change();
            $table->decimal('price', 20, 2)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoice_item_retail_flows', function (Blueprint $table) {
            //
        });
    }
};
