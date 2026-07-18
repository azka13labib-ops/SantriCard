<?php
require __DIR__.'/vendor/autoload.php';
\ = require_once __DIR__.'/bootstrap/app.php';
\ = \->make(Illuminate\Contracts\Console\Kernel::class);
\->bootstrap();

\ = App\Models\User::where('email', 'budisantoso@email.com')->first();
if(\) {
    \->perlu_setup_akun = true;
    \->save();
    echo "Parent updated successfully.";
} else {
    echo "Parent not found.";
}
