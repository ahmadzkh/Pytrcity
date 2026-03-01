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
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('customer_number', 12);
            $table->decimal('billing_amount', 12, 2);
            $table->decimal('admin_fee', 12, 2);
            $table->decimal('total_amount', 12, 2);
            $table->string('midtrans_snap_token')->nullable();
            $table->enum('payment_status', ['pending', 'paid', 'expired', 'failed'])->default('pending');
            $table->enum('ppob_status', ['pending', 'processing', 'success', 'failed'])->default('pending');
            $table->string('pln_receipt_ref')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
