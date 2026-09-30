<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $email = strtolower((string) env('ADMIN_EMAIL', 'admin@busestransport.com'));
        if (! User::where('email', $email)->exists()) {
            $password = (string) env('ADMIN_PASSWORD', '');
            if (strlen($password) < 8) {
                throw new \RuntimeException('Set ADMIN_PASSWORD (at least 8 characters) in .env before seeding.');
            }
            User::create(['name' => 'Site Admin', 'email' => $email, 'password' => $password, 'role' => 'admin', 'active' => true]);
            $this->command?->info("Admin user created: $email");
        }

        $this->call(ContentSeeder::class);
    }
}
