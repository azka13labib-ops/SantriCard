<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SchoolClassController extends Controller
{
    public function index()
    {
        $classes = \App\Models\SchoolClass::all();
        // Group by group_name
        $grouped = $classes->groupBy('group_name')->map(function ($items, $key) {
            return [
                'group_name' => $key,
                'classes' => $items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'display_name' => $item->display_name
                    ];
                })->values()
            ];
        })->values();

        return response()->json($grouped);
    }
}
