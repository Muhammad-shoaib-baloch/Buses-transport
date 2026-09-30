@extends('layouts.admin')
@section('title', 'Media library')

@section('content')
@php $size = fn ($b) => $b > 1048576 ? number_format($b / 1048576, 1).' MB' : max(1, round($b / 1024)).' KB'; @endphp
<x-admin.topbar title="Media library" sub="Upload photos, logos and documents — large photos are resized automatically" />
<div class="body">
    <div class="dropzone" data-dropzone>
        <p style="margin-bottom:12px">Drag photos here, or</p>
        <button class="btn btn-primary btn-sm" type="button" data-upload>{!! ic('i-upload') !!} Choose files</button>
        <p class="note" style="margin-top:10px">JPG, PNG, WebP, GIF, SVG, ICO or PDF · up to 12 MB each</p>
        <p class="form-msg err" hidden style="margin-top:8px"></p>
        <input type="file" hidden multiple accept="image/*,.ico,application/pdf" data-file>
    </div>
    <div class="card" data-manager>
        <div class="card-head">
            <h2>Files</h2><span class="hint">{{ $media->count() }} uploaded</span><span class="top-spacer"></span>
            <div class="search">{!! ic('i-search') !!}<input type="search" placeholder="Search files" data-search></div>
        </div>
        <div class="card-body">
            @if ($media->isEmpty())
                <div class="empty"><h3>No files yet</h3><p>Uploaded images can be used for the logo, vehicles, services, blog covers and pages.</p></div>
            @else
                <div class="media-grid">
                    @foreach ($media as $m)
                        <div class="media-item" data-text="{{ mb_strtolower($m->original_name.' '.$m->filename.' '.$m->alt) }}">
                            <a class="mi-img" href="{{ $m->url }}" target="_blank" rel="noopener">
                                @if (str_starts_with($m->mime, 'image/'))<img src="{{ $m->url }}" alt="{{ $m->alt }}" loading="lazy">@else{!! ic('i-doc') !!}@endif
                            </a>
                            <div class="mi-meta"><span title="{{ $m->original_name }}">{{ $m->original_name ?: $m->filename }}</span><span>{{ $size($m->size) }}</span></div>
                            <div class="mi-meta" style="padding-top:0">
                                <span>{{ $m->width ? $m->width.'×'.$m->height : explode('/', $m->mime)[1] ?? '' }}</span>
                                <span class="row" style="gap:4px">
                                    <button class="ibtn" type="button" title="Copy link" aria-label="Copy link" data-copy="{{ $m->url }}">{!! ic('i-copy') !!}</button>
                                    <form method="post" action="/admin/media/{{ $m->id }}" data-confirm="Delete {{ $m->original_name ?: $m->filename }}? Pages still using it will show a broken image.">@csrf @method('DELETE')
                                        <button class="ibtn danger" type="submit" title="Delete" aria-label="Delete">{!! ic('i-trash') !!}</button>
                                    </form>
                                </span>
                            </div>
                        </div>
                    @endforeach
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
