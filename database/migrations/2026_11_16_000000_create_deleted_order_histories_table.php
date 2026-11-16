<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deleted_order_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('original_order_id');
            $table->string('customer_name');
            $table->dateTime('order_date');
            $table->string('order_status');
            $table->decimal('grand_total', 12, 2);
            $table->unsignedInteger('item_count');
            $table->timestamp('deleted_at');
            $table->index('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deleted_order_histories');
    }
};
