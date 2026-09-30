@php
    $compact = $compact ?? false;
    $src = $source ?? 'contact';
    $id = preg_replace('/[^a-z0-9]/i', '-', $src);
    $initialService = $initialService ?? '';
    $initialVehicle = $initialVehicle ?? '';
@endphp
<form class="form-grid js-quote" data-source="{{ $src }}" novalidate>
    <div class="js-form-body" style="display:contents">
        <div class="fld"><label for="{{ $id }}-name">Full name <span class="req">*</span></label><input id="{{ $id }}-name" name="name" placeholder="Your name" autocomplete="name" required></div>
        <div class="fld"><label for="{{ $id }}-phone">Phone / WhatsApp <span class="req">*</span></label><input id="{{ $id }}-phone" name="phone" type="tel" placeholder="+971 50 000 0000" autocomplete="tel" required></div>
        @unless ($compact)
            <div class="fld"><label for="{{ $id }}-email">Email</label><input id="{{ $id }}-email" name="email" type="email" placeholder="you@company.ae" autocomplete="email"></div>
            <div class="fld"><label for="{{ $id }}-company">Company</label><input id="{{ $id }}-company" name="company" placeholder="Optional" autocomplete="organization"></div>
        @endunless
        <div class="fld"><label for="{{ $id }}-service">Service needed</label>
            <select id="{{ $id }}-service" name="service">
                <option value="">Select a service</option>
                @foreach ($opts['services'] as $o)<option value="{{ $o['label'] }}" @selected($o['label'] === $initialService)>{{ $o['label'] }}</option>@endforeach
            </select>
        </div>
        <div class="fld"><label for="{{ $id }}-vehicle">Preferred vehicle</label>
            <select id="{{ $id }}-vehicle" name="vehicle">
                <option value="">Not sure — recommend one</option>
                @foreach ($opts['vehicles'] as $o)<option value="{{ $o['label'] }}" @selected($o['label'] === $initialVehicle)>{{ $o['label'] }}</option>@endforeach
            </select>
        </div>
        <div class="fld"><label for="{{ $id }}-pickup">Pick-up location</label><input id="{{ $id }}-pickup" name="pickup" placeholder="DXB Terminal 3"></div>
        <div class="fld"><label for="{{ $id }}-dropoff">Drop-off location</label><input id="{{ $id }}-dropoff" name="dropoff" placeholder="Dubai Marina"></div>
        <div class="fld"><label for="{{ $id }}-date">Date</label><input id="{{ $id }}-date" name="date" type="date"></div>
        <div class="fld"><label for="{{ $id }}-time">Time</label><input id="{{ $id }}-time" name="time" type="time"></div>
        <div class="fld"><label for="{{ $id }}-pax">Passengers</label><input id="{{ $id }}-pax" name="passengers" inputmode="numeric" placeholder="e.g. 12"></div>
        <div class="fld"><label for="{{ $id }}-driver">With / without driver</label>
            <select id="{{ $id }}-driver" name="driverOption"><option>With a professional driver</option><option>Without a driver (self-drive, selected vehicles)</option></select>
        </div>
        @unless ($compact)
            <div class="fld fld-full"><label for="{{ $id }}-msg">Additional details</label><textarea id="{{ $id }}-msg" name="message" placeholder="Flight number, luggage, return trip, number of days…"></textarea></div>
        @endunless
        <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
        <div class="fld fld-full">
            <button class="btn btn-primary btn-lg btn-block" type="submit">Send request {!! ic('i-arrow') !!}</button>
            <p class="form-err" hidden></p>
            <p class="note js-note" style="margin-top:10px">We reply with an AED price by phone or WhatsApp. No fixed online prices, no hidden charges.</p>
        </div>
    </div>
</form>
