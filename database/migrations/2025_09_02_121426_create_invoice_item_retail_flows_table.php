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
        Schema::create('invoice_item_retail_flows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoice_retail_flows')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('product_retail_flows')->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_item_retail_flows');
    }
};
