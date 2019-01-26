<?php namespace App\Http\Controllers;

use App\Photo;

class PhotoDownloadController extends Controller {

    /**
     * Create photos matching given share id download response.
     *
     * @param  int|string $id
     * @return Response
     */
	public function download($id)
	{
        $photo = Photo::where('share_id', $id)->firstOrFail();

        $name      = $photo->name;
        $extension = pathinfo($photo->name, PATHINFO_EXTENSION);

        if ( ! $extension) {
        	$name .= '.'.$photo->extension;
        }

        return response()->download($photo->getAbsolutePath(), $name, ['Content-Type' => 'image/'.$photo->extension]);
	}
}
