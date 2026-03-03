<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Menangani pendaftaran pengguna baru.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'sometimes|string|in:user,partner'
        ]);

        try {
            $user = DB::transaction(function () use ($request) {
                $role = $request->role ?? 'user';

                // Pembuatan profil otentikasi
                $newUser = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'role' => $role,
                ]);

                // Pembuatan entitas dompet khusus agen
                if ($role === 'partner') {
                    Wallet::create([
                        'user_id' => $newUser->id,
                        'balance' => 0.00
                    ]);
                }

                return $newUser;
            });

            // Pembangkitan token sesi Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Registrasi berhasil',
                'data' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ], 201);

        } catch (\Exception $e) {
            // Pencatatan galat absolut ke storage/logs/laravel.log
            Log::error('Registration Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat akun. Silakan periksa log sistem peladen.'
            ], 500);
        }
    }

    /**
     * Menangani proses otentikasi masuk.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kredensial yang Anda masukkan tidak valid.'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 200);
    }

    /**
     * Menangani proses keluar sistem dan pemusnahan token.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil keluar sistem'
        ], 200);
    }

    /**
     * Mengembalikan profil pengguna yang sedang aktif.
     */
    public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()
        ], 200);
    }
}
