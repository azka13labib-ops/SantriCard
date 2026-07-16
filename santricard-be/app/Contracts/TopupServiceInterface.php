<?php

namespace App\Contracts;

use App\Models\User;

interface TopupServiceInterface
{
    /**
     * Process a top-up request.
     *
     * @param string $siswaId
     * @param array $data
     * @param User $user
     * @param \Illuminate\Http\UploadedFile|null $file
     * @return array
     */
    public function processTopup(string $siswaId, array $data, User $user, $file): array;

    /**
     * Verify a pending top-up.
     *
     * @param string $topupId
     * @param string $status
     * @param User $adminUser
     * @return \App\Models\Topup
     */
    public function verifyTopup(string $topupId, string $status, User $adminUser);
}
