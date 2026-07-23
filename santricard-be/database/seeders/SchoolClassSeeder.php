<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SchoolClassSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classes = [
            ['group_name' => 'Kelas VII', 'name' => 'VII-1', 'display_name' => '1'],
            ['group_name' => 'Kelas VII', 'name' => 'VII-2', 'display_name' => '2'],
            ['group_name' => 'Kelas VII', 'name' => 'VII-3', 'display_name' => '3'],
            
            ['group_name' => 'Kelas VIII', 'name' => 'VIII-1', 'display_name' => '1'],
            ['group_name' => 'Kelas VIII', 'name' => 'VIII-2', 'display_name' => '2'],
            ['group_name' => 'Kelas VIII', 'name' => 'VIII-3', 'display_name' => '3'],
            
            ['group_name' => 'Kelas IX', 'name' => 'IX-1', 'display_name' => '1'],
            ['group_name' => 'Kelas IX', 'name' => 'IX-2', 'display_name' => '2'],
            ['group_name' => 'Kelas IX', 'name' => 'IX-3', 'display_name' => '3'],
        ];

        foreach ($classes as $class) {
            \App\Models\SchoolClass::updateOrCreate(
                ['name' => $class['name']],
                $class
            );
        }
    }
}
