@php
    $g = $s['general'];
    $c = $s['contact'];
    $socials = [['facebook', 'i-facebook', 'Facebook'], ['instagram', 'i-instagram', 'Instagram'], ['tiktok', 'i-tiktok', 'TikTok'], ['linkedin', 'i-linkedin', 'LinkedIn'], ['youtube', 'i-youtube', 'YouTube'], ['x', 'i-x', 'X'], ['googleReviews', 'i-google', 'Google reviews']];
    $socials = array_filter($socials, fn ($x) => ! empty($s['social'][$x[0]]));
    $company = [['About us', '/about'], ['Coverage', '/coverage']];
    if ($g['showBlogInNav']) $company[] = ['Blog', '/blog'];
    $company[] = ['FAQ', '/faq'];
    $company[] = ['Contact', '/contact'];
@endphp
<footer class="site-foot">
    <div class="wrap">
        <div class="foot-grid">
            <div class="foot-brand">
                @include('site.partials.brand')
                @if ($g['footerAbout'])<p class="foot-about">{{ $g['footerAbout'] }}</p>@endif
                @if ($g['footerLegal'])<p class="foot-lic">{{ $g['footerLegal'] }}</p>@endif
                @if ($socials)
                    <div class="social-row">
                        @foreach ($socials as [$k, $icon, $label])
                            <a href="{{ $s['social'][$k] }}" target="_blank" rel="noopener" aria-label="{{ $label }}" title="{{ $label }}">{!! ic($icon) !!}</a>
                        @endforeach
                    </div>
                @endif
            </div>
            <div class="foot-col"><h4>Services</h4><ul>
                @foreach ($chrome['services'] as $sv)<li><a href="/services/{{ $sv->slug }}">{{ $sv->name }}</a></li>@endforeach
            </ul></div>
            <div class="foot-col"><h4>Fleet</h4><ul>
                @foreach ($chrome['featured']->take(6) as $v)<li><a href="/fleet/{{ $v->slug }}">{{ $v->name }}</a></li>@endforeach
                <li><a href="/fleet">View full fleet</a></li>
            </ul></div>
            <div class="foot-col"><h4>Company</h4><ul>
                @foreach ($company as [$label, $href])<li><a href="{{ $href }}">{{ $label }}</a></li>@endforeach
            </ul></div>
            <div class="foot-col"><h4>Get in touch · 24/7</h4>
                <div class="foot-contact">
                    @foreach ($c['phones'] as $ph)<a class="fc" href="{{ tel_href($ph) }}">{!! ic('i-phone') !!}<span class="mono">{{ $ph }}</span></a>@endforeach
                    @if ($c['whatsapp'])<a class="fc" href="{{ wa_href($c['whatsapp'], $c['whatsappMessage']) }}" target="_blank" rel="noopener">{!! ic('i-whats') !!}<span class="mono">{{ $c['whatsapp'] }}</span></a>@endif
                    @foreach ($c['emails'] as $em)<a class="fc" href="mailto:{{ $em }}">{!! ic('i-mail') !!}<span style="overflow-wrap:anywhere">{{ $em }}</span></a>@endforeach
                    @if ($c['address'])<span class="fc">{!! ic('i-pin') !!}<span>{{ $c['address'] }}</span></span>@endif
                    @if ($c['hours'])<span class="fc">{!! ic('i-clock') !!}<span>{{ $c['hours'] }}</span></span>@endif
                </div>
            </div>
        </div>
        <div class="foot-bar">
            <span>{{ str_replace('{year}', date('Y'), $g['copyright']) }}</span>
            <nav>
                @foreach ($chrome['footerPages'] as $p)<a href="/{{ $p->slug }}">{{ $p->title }}</a>@endforeach
                <a href="/faq">FAQ</a>
                <a href="/contact">Contact</a>
            </nav>
        </div>
    </div>
</footer>
