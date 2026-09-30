<a class="svc reveal" data-d="{{ ($i ?? 0) % 4 }}" href="/services/{{ $sv->slug }}">
    <span class="svc-ico">{!! ic($sv->icon) !!}</span>
    <h3>{{ $sv->name }}</h3>
    <p>{{ $sv->blurb }}</p>
    <span class="svc-meta">{{ $sv->meta }}</span>
    <span class="svc-go">View Service {!! ic('i-arrow') !!}</span>
</a>
