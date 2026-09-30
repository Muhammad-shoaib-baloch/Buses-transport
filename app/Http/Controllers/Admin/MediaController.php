<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Support\Markdown;
use App\Support\Uploader;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function index()
    {
        return view('admin.media', ['media' => Media::latest()->get()]);
    }

    public function list()
    {
        return response()->json(['ok' => true, 'media' => Media::latest()->take(500)->get()]);
    }

    public function upload(Request $r)
    {
        $files = $r->file('files', []);
        $files = is_array($files) ? $files : [$files];
        if (! $files) {
            return response()->json(['ok' => false, 'error' => 'No files received. The file may be larger than the server upload limit.'], 400);
        }
        $out = [];
        try {
            foreach ($files as $file) {
                $out[] = Uploader::store($file, (string) $r->input('alt', ''));
            }
        } catch (\RuntimeException $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 422);
        }

        return response()->json(['ok' => true, 'files' => $out]);
    }

    public function destroy(Media $media)
    {
        Uploader::delete($media);
        $media->delete();

        return back()->with('status', 'File deleted.');
    }

    /** Markdown preview for the editors — rendered by the same code as the website. */
    public function markdown(Request $r)
    {
        return response()->json(['html' => Markdown::render((string) $r->input('src', ''))]);
    }
}
