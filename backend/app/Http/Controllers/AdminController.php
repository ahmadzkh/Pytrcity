<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function getDashboardStats(Request $request)
    {
        $totalRevenue = Transaction::where('payment_status', 'paid')->sum('total_amount');
        $successfulTransactions = Transaction::where('payment_status', 'paid')->count();
        $totalUsers = User::where('role', 'user')->count();

        $recentTransactions = Transaction::with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($trx) {
                return [
                    'id' => $trx->order_id,
                    'user' => $trx->user->name ?? 'Anonim',
                    'customer_number' => $trx->customer_number,
                    'amount' => $trx->total_amount,
                    'status' => $trx->payment_status,
                    'date' => $trx->created_at->format('Y-m-d H:i')
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'revenue' => $totalRevenue,
                    'success_count' => $successfulTransactions,
                    'user_count' => $totalUsers
                ],
                'recent_transactions' => $recentTransactions
            ]
        ], 200);
    }
}
