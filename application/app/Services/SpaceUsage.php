<?php namespace App\Services;

use Auth;
use Storage;
use Exception;

class SpaceUsage {

    public function __construct(Settings $settings)
    {
        $this->settings = $settings;
    }

    public function userIsOutOfSpace()
    {
        return $this->settings->get('maxUserSpace') <= $this->getSpaceUsed();
    }

    /**
     * Return amount of space user is currently using in bytes.
     *
     * @return int
     */
    public function getSpaceUsed()
    {
        $bytes = 0;

        try {
            $files = Storage::allFiles('uploads/'.Auth::user()->id);
        } catch(\Exception $e) {
            return $bytes;
        }

        foreach($files as $file) {
        	if (str_contains($file, 'original')) {
        		$bytes += Storage::size($file);
        	}
        }

        return $bytes;
    }

}