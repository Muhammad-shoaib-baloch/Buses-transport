@php $h = $s['home']; @endphp
<form class="quote-card js-quote" data-source="home-hero" novalidate>
    <div class="qc-head">
        <h3>{{ $h['quoteTitle'] }}</h3>
        @if ($h['quoteBadge'])<span class="chip">{!! ic('i-clock') !!} {{ $h['quoteBadge'] }}</span>@endif
    </div>
    @if ($h['quoteNote'])<p class="qc-note">{{ $h['quoteNote'] }}</p>@endif
    <div class="js-form-body">
        <div class="qc-tabs" role="tablist">
            <button class="qc-tab on" type="button" role="tab" aria-selected="true" data-qtab="transfer">Transfer</button>
            <button class="qc-tab" type="button" role="tab" aria-selected="false" data-qtab="hire">Daily hire</button>
        </div>
        <input type="hidden" name="service" value="Transfer">
        <div class="qc-grid">
            <div class="fld"><label for="qFrom">Pick-up</label><input id="qFrom" name="pickup" placeholder="DXB Terminal 3" autocomplete="off"></div>
            <div class="fld"><label for="qTo" id="qToLbl">Drop-off</label><input id="qTo" name="dropoff" placeholder="Dubai Marina" autocomplete="off"></div>
            <div class="fld"><label for="qDate">Date</label><input id="qDate" name="date" type="date"></div>
            <div class="fld"><label for="qTime">Time</label><input id="qTime" name="time" type="time"></div>
            <div class="fld fld-full"><label for="qVeh">Vehicle / passengers</label>
                <select id="qVeh" name="vehicle">
                    <option value="">Not sure — recommend one</option>
                    @foreach ($opts['vehicles'] as $o)<option value="{{ $o['label'] }}">{{ $o['label'] }}</option>@endforeach
                </select>
            </div>
            <div class="fld"><label for="qName">Full name <span class="req">*</span></label><input id="qName" name="name" placeholder="Your name" autocomplete="name" required></div>
            <div class="fld"><label for="qPhone">Phone / WhatsApp <span class="req">*</span></label><input id="qPhone" name="phone" type="tel" placeholder="+971 50 000 0000" autocomplete="tel" required></div>
            <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
        </div>
        <div class="qc-foot"><button class="btn btn-primary btn-block" type="submit">Get a quote {!! ic('i-arrow') !!}</button></div>
        <p class="form-err" hidden></p>
    </div>
</form>
