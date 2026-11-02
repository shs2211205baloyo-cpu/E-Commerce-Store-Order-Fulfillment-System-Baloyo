<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::create('orders', function (Blueprint $table) {
        $table->id();

        $table->foreignId('customer_id')
            ->constrained()
            ->restrictOnDelete();

        $table->text('shipping_address');
        $table->dateTime('order_date');
        $table->decimal('tax_amount', 12, 2)->default(0);
        $table->decimal('grand_total', 12, 2)->default(0);
        $table->string('order_status')->default('pending');

        $table->timestamps();
        $table->index(['order_status', 'order_date']);
    });
}

public function down(): void
{
    Schema::dropIfExists('orders');
}
};
