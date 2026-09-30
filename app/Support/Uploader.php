<?php

namespace App\Support;

use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

/**
 * Stores admin uploads in public/uploads/YYYY/MM. Big photos are resized to
 * max 2400px with GD (when available) and metadata is stripped.
 */
class Uploader
{
    public const MAX_BYTES = 12 * 1024 * 1024;

    public const ALLOWED = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
        'image/svg+xml' => 'svg',
        'image/x-icon' => 'ico',
        'image/vnd.microsoft.icon' => 'ico',
        'application/pdf' => 'pdf',
    ];

    public static function root(): string
    {
        return public_path('uploads');
    }

    /** @throws \RuntimeException with a user-friendly message */
    public static function store(UploadedFile $file, string $alt = ''): Media
    {
        if (! $file->isValid()) {
            throw new \RuntimeException($file->getClientOriginalName().': upload failed ('.$file->getErrorMessage().').');
        }
        if ($file->getSize() > self::MAX_BYTES) {
            throw new \RuntimeException($file->getClientOriginalName().' is larger than 12 MB.');
        }
        $mime = (string) $file->getMimeType(); // detected from the file contents
        $orig = $file->getClientOriginalName();
        if ($mime === 'image/svg' || ($mime === 'text/xml' || $mime === 'text/plain') && str_ends_with(strtolower($orig), '.svg')) {
            $mime = 'image/svg+xml';
        }
        $ext = self::ALLOWED[$mime] ?? null;
        if (! $ext) {
            throw new \RuntimeException($orig.': only images (JPG, PNG, WebP, GIF, SVG, ICO) and PDF are allowed.');
        }

        $bytes = file_get_contents($file->getRealPath());
        $width = $height = null;

        if ($ext === 'svg') {
            if (preg_match('/<script|on\w+\s*=|javascript:/i', $bytes)) {
                throw new \RuntimeException($orig.': SVG files with scripts are not allowed.');
            }
        } elseif (in_array($ext, ['jpg', 'png', 'webp', 'gif'], true)) {
            $info = @getimagesizefromstring($bytes);
            if (! $info) {
                throw new \RuntimeException($orig.' is not a valid image.');
            }
            [$width, $height] = $info;
            if (in_array($ext, ['jpg', 'png', 'webp'], true) && function_exists('imagecreatefromstring')) {
                [$bytes, $width, $height] = self::optimise($bytes, $ext, $width, $height);
            }
        }

        $sub = date('Y/m');
        $dir = self::root().DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $sub);
        if (! is_dir($dir) && ! @mkdir($dir, 0755, true) && ! is_dir($dir)) {
            throw new \RuntimeException('Could not create the uploads folder. Check folder permissions.');
        }
        $base = Str::limit(Str::slug(pathinfo($orig, PATHINFO_FILENAME)) ?: 'file', 50, '');
        $name = $base.'-'.Str::lower(Str::random(6)).'.'.$ext;
        file_put_contents($dir.DIRECTORY_SEPARATOR.$name, $bytes);

        return Media::create([
            'url' => '/uploads/'.$sub.'/'.$name,
            'filename' => $name,
            'original_name' => Str::limit($orig, 190, ''),
            'mime' => $mime === 'image/vnd.microsoft.icon' ? 'image/x-icon' : $mime,
            'size' => strlen($bytes),
            'width' => $width,
            'height' => $height,
            'alt' => Str::limit($alt, 190, ''),
        ]);
    }

    /** Resize to max 2400px and re-encode (drops EXIF, fixes orientation for JPEG). */
    private static function optimise(string $bytes, string $ext, int $w, int $h): array
    {
        $img = @imagecreatefromstring($bytes);
        if (! $img) {
            return [$bytes, $w, $h];
        }
        if ($ext === 'jpg' && function_exists('exif_read_data')) {
            $exif = @exif_read_data('data://image/jpeg;base64,'.base64_encode($bytes));
            $rot = ['3' => 180, '6' => -90, '8' => 90][(string) ($exif['Orientation'] ?? '')] ?? 0;
            if ($rot) {
                $img = imagerotate($img, $rot, 0);
                [$w, $h] = [imagesx($img), imagesy($img)];
            }
        }
        $max = 2400;
        if ($w > $max || $h > $max) {
            $scale = min($max / $w, $max / $h);
            $nw = (int) round($w * $scale);
            $nh = (int) round($h * $scale);
            $dst = imagecreatetruecolor($nw, $nh);
            if ($ext !== 'jpg') {
                imagealphablending($dst, false);
                imagesavealpha($dst, true);
            }
            imagecopyresampled($dst, $img, 0, 0, 0, 0, $nw, $nh, $w, $h);
            imagedestroy($img);
            $img = $dst;
            [$w, $h] = [$nw, $nh];
        } elseif ($ext !== 'jpg') {
            imagesavealpha($img, true);
        }
        ob_start();
        match ($ext) {
            'png' => imagepng($img, null, 9),
            'webp' => imagewebp($img, null, 84),
            default => imagejpeg($img, null, 84),
        };
        $out = ob_get_clean();
        imagedestroy($img);

        return [$out !== false && $out !== '' ? $out : $bytes, $w, $h];
    }

    public static function delete(Media $m): void
    {
        $rel = ltrim(str_replace('/uploads/', '', $m->url), '/');
        $full = realpath(self::root().DIRECTORY_SEPARATOR.$rel);
        $root = realpath(self::root());
        if ($full && $root && str_starts_with($full, $root.DIRECTORY_SEPARATOR) && is_file($full)) {
            @unlink($full);
        }
    }
}
