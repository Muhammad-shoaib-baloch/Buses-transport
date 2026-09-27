/* ============================================================
   Seed — real Buses Transport UAE content (from busestransport.com).
   Safe to re-run: content rows are upserted by slug, the admin user
   is only created when missing. Quote requests are never touched.
   ============================================================ */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

const CATEGORIES = [
  { slug: 'executive-cars', name: 'Executive Cars', order: 1 },
  { slug: 'family-vans', name: '7-Seater Family Vans', order: 2 },
  { slug: 'group-vans', name: 'Group Vans', order: 3 },
  { slug: 'buses', name: 'Buses & Coaches', order: 4 },
  { slug: 'luxury', name: 'Luxury & Sports Cars', order: 5 },
];

type V = {
  slug: string; name: string; cat: string; classLabel: string; seatsLabel: string; capacity: number;
  driver: 'chauffeur' | 'either'; tags: string[]; description: string; bestFor: string; images: string[];
  alt: string; featured?: number;
};

const SPRINTER = Array.from({ length: 12 }, (_, i) => `/images/fleet/sprinter/${i + 1}.jpg`);

const VEHICLES: V[] = [
  { slug: 'sedan', name: 'Sedan', cat: 'executive-cars', classLabel: 'Executive Car', seatsLabel: '4 seats', capacity: 4, driver: 'chauffeur',
    tags: ['Airport transfer', 'Private transfer', 'Business travel'],
    description: 'A comfortable executive sedan for airport pick-ups, business meetings and everyday point-to-point transfers across the UAE. Professional driver, on-time arrival, and a quiet, air-conditioned ride.',
    bestFor: 'Airport & private transfers', images: ['/images/fleet/executive-car.jpg'], alt: 'Black executive sedan', featured: 1 },
  { slug: 'v-class', name: 'Mercedes V-Class', cat: 'executive-cars', classLabel: 'Luxury MPV', seatsLabel: '6–7 seats', capacity: 7, driver: 'chauffeur',
    tags: ['VIP transfer', 'Family travel', 'Airport transfer'],
    description: 'Our flagship luxury MPV, built for VIP airport transfers, corporate travel and premium hotel-to-hotel journeys. Leather seating, generous legroom and a refined cabin for passengers who expect the best.',
    bestFor: 'VIP & family transfers', images: ['/images/fleet/v-class-real.jpg', '/images/fleet/v-class.jpg'], alt: 'Black Mercedes V-Class parked outside a Dubai hotel', featured: 2 },
  { slug: 'kia-carnival', name: 'Kia Carnival 7-Seater', cat: 'family-vans', classLabel: 'Family Van', seatsLabel: '7 seats', capacity: 7, driver: 'either',
    tags: ['Family travel', 'Airport transfer', 'City tours'],
    description: 'A spacious, comfortable van for families and small groups exploring Dubai and the wider UAE, with room for luggage and easy access for all passengers.',
    bestFor: 'Family & airport transfers', images: ['/images/fleet/carnival.jpg'], alt: 'Black seven-seat family van', featured: 4 },
  { slug: 'kia-sedona', name: 'Kia Sedona 7-Seater', cat: 'family-vans', classLabel: 'Family Van', seatsLabel: '7 seats', capacity: 7, driver: 'either',
    tags: ['Daily hire', 'Airport transfer', 'Private transfer'],
    description: 'A dependable 7-seater van offering a smooth, comfortable ride for families and groups, well suited to airport runs, day trips and daily hire.',
    bestFor: 'Daily private hire', images: [], alt: 'Kia Sedona 7-seater van' },
  { slug: 'mercedes-viano-vito', name: 'Mercedes Viano / Vito 7-Seater', cat: 'family-vans', classLabel: 'Family Van', seatsLabel: '7 seats', capacity: 7, driver: 'either',
    tags: ['Family travel', 'VIP transfer', 'Airport transfer'],
    description: 'A refined 7-seater Mercedes van combining family-friendly space with a more premium cabin finish — a comfortable choice for airport runs and private transfers.',
    bestFor: 'Family & premium transfers', images: [], alt: 'Mercedes Viano / Vito 7-seater van' },
  { slug: 'honda-odyssey', name: 'Honda Odyssey 7-Seater', cat: 'family-vans', classLabel: 'Family Van', seatsLabel: '7 seats', capacity: 7, driver: 'either',
    tags: ['Family travel', 'Daily hire', 'Airport transfer'],
    description: 'A smooth-riding 7-seater van well suited to family trips, airport transfers and daily hire around Dubai and the UAE.',
    bestFor: 'Family & daily hire', images: [], alt: 'Honda Odyssey 7-seater van' },
  { slug: 'toyota-previa', name: 'Toyota Previa 7-Seater', cat: 'family-vans', classLabel: 'Family Van', seatsLabel: '7 seats', capacity: 7, driver: 'either',
    tags: ['Family travel', 'Airport transfer', 'City tours'],
    description: 'A practical, spacious 7-seater van ideal for families and small groups, with easy access and a comfortable ride for city and airport trips.',
    bestFor: 'Family & city trips', images: [], alt: 'Toyota Previa 7-seater van' },
  { slug: 'hyundai-starex', name: 'Hyundai Starex 7-Seater', cat: 'family-vans', classLabel: 'Family Van', seatsLabel: '7 seats', capacity: 7, driver: 'either',
    tags: ['Family travel', 'Daily hire', 'Airport transfer'],
    description: 'A reliable 7-seater van offering a comfortable, no-fuss ride for families, small groups and daily hire across the UAE.',
    bestFor: 'Family & daily hire', images: [], alt: 'Hyundai Starex 7-seater van' },
  { slug: 'sprinter', name: 'Mercedes Sprinter', cat: 'group-vans', classLabel: 'Premium Van', seatsLabel: 'Up to 17 seats', capacity: 17, driver: 'chauffeur',
    tags: ['Group transfer', 'Corporate travel', 'City tours'],
    description: 'A premium van for mid-sized groups who still want a high standard of comfort — a popular choice for corporate teams, hotel guests and group tours.',
    bestFor: 'Groups & tours', images: SPRINTER, alt: 'Black Mercedes Sprinter with the passenger door open', featured: 5 },
  { slug: 'hiace', name: 'Toyota Hiace 13–15 Seater', cat: 'group-vans', classLabel: 'Group Van', seatsLabel: '13–15 seats', capacity: 15, driver: 'either',
    tags: ['Staff transport', 'Group tours', 'Airport transfer'],
    description: 'A reliable, practical van for larger groups — widely used for staff transportation, group airport transfers and multi-stop city tours across the UAE.',
    bestFor: 'Staff & group transport', images: ['/images/fleet/hiace.jpg'], alt: 'High-roof passenger van on the road', featured: 6 },
  { slug: 'coaster', name: 'Toyota Coaster 23–30 Seater', cat: 'buses', classLabel: 'Midsize Bus', seatsLabel: '23–30 seats', capacity: 30, driver: 'either',
    tags: ['City tours', 'Shuttle services', 'Staff transport'],
    description: 'A comfortable midsize bus for schools, companies and tour operators moving larger groups efficiently, with proper luggage space and easy boarding.',
    bestFor: 'Tours & shuttle services', images: ['/images/fleet/coaster.jpg'], alt: 'White Toyota Coaster midsize bus', featured: 7 },
  { slug: 'bus-35', name: '35-Seater Luxury Bus', cat: 'buses', classLabel: 'Luxury Coach', seatsLabel: '35 seats', capacity: 35, driver: 'chauffeur',
    tags: ['Corporate events', 'Large tours', 'Group travel'],
    description: 'A full-size luxury coach for large tour groups, conference delegates and corporate events, with reclining seats and a smooth, air-conditioned ride for longer journeys.',
    bestFor: 'Events & group travel', images: ['/images/fleet/bus-35.jpg'], alt: '35-seat luxury coach', featured: 8 },
  { slug: 'bus-50', name: '50-Seater Luxury Bus', cat: 'buses', classLabel: 'Luxury Coach', seatsLabel: '50 seats', capacity: 50, driver: 'chauffeur',
    tags: ['Large groups', 'Staff transport', 'Major events'],
    description: 'Our largest luxury coach, built for major events, staff transportation, exhibitions and large-scale group movement anywhere in the UAE, without compromising on comfort.',
    bestFor: 'Large groups & staff transport', images: ['/images/fleet/bus-50.jpg'], alt: '50-seat luxury coach', featured: 9 },
  { slug: 'bmw-luxury-sedan', name: 'BMW Luxury Sedan', cat: 'luxury', classLabel: 'Luxury Car', seatsLabel: '4 seats', capacity: 4, driver: 'either',
    tags: ['VIP transfer', 'Business travel', 'Self-drive available'],
    description: 'A premium BMW sedan for clients who want a distinguished ride for business travel, VIP transfers or special occasions, available with a chauffeur or as a self-drive hire.',
    bestFor: 'VIP & business transfers', images: [], alt: 'BMW luxury sedan' },
  { slug: 'range-rover', name: 'Range Rover', cat: 'luxury', classLabel: 'Luxury SUV', seatsLabel: '4–5 seats', capacity: 5, driver: 'either',
    tags: ['VIP transfer', 'Self-drive available', 'Special occasions'],
    description: 'A commanding luxury SUV for VIP transfers and special occasions, with a premium cabin and confident presence on the road — chauffeur-driven or self-drive.',
    bestFor: 'VIP transfers & special occasions', images: ['/images/fleet/range-rover.jpg'], alt: 'Black Range Rover on an open road', featured: 3 },
  { slug: 'land-cruiser', name: 'Toyota Land Cruiser', cat: 'luxury', classLabel: 'Luxury SUV', seatsLabel: '4–7 seats', capacity: 7, driver: 'either',
    tags: ['Family travel', 'Self-drive available', 'City & desert trips'],
    description: 'A spacious, dependable luxury SUV suited to family travel, desert and city trips alike, available with a driver or self-drive.',
    bestFor: 'Family & desert-ready travel', images: [], alt: 'Toyota Land Cruiser SUV' },
  { slug: 'mercedes-benz-luxury', name: 'Mercedes-Benz Luxury Car', cat: 'luxury', classLabel: 'Luxury Car', seatsLabel: '4 seats', capacity: 4, driver: 'either',
    tags: ['VIP transfer', 'Business travel', 'Self-drive available'],
    description: 'A top-tier Mercedes-Benz saloon for clients who expect first-class comfort, offered with a professional chauffeur or as a self-drive hire.',
    bestFor: 'VIP & executive transfers', images: [], alt: 'Mercedes-Benz luxury saloon' },
];

const FAQS = [
  { key: 'areas', q: 'What areas of the UAE do you cover?', a: 'Buses Transport UAE operates across Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, Umm Al Quwain and Al Ain, including all major airports and inter-emirate routes.' },
  { key: 'driver', q: 'Do you provide a driver with the vehicle?', a: 'Most bookings include a professional, licensed driver. Selected vehicles are also available without a driver for self-drive hire — let us know your preference when you request a quote.' },
  { key: 'price', q: 'How do I get a price for my booking?', a: 'Rates depend on the vehicle, trip duration, distance and date, and are always quoted in AED. Send us your trip details by WhatsApp, phone or our quote form and we will confirm a price before you book.' },
  { key: 'hours', q: 'Can I book a vehicle for just a few hours?', a: 'Yes, we offer hourly and daily rental in addition to point-to-point transfers, airport transfers and monthly rental for longer-term needs.' },
  { key: 'monthly', q: 'Do you offer monthly rentals for companies?', a: 'Yes. We work with companies and individuals on monthly rental agreements with a dedicated vehicle and driver, including staff and corporate transportation contracts.' },
  { key: 'advance', q: 'How far in advance should I book?', a: 'For standard transfers we recommend booking at least a few hours ahead where possible. For buses, events, tours and monthly contracts, earlier booking helps us confirm your preferred vehicle.' },
  { key: 'flight', q: 'Can you track my flight for airport pick-up?', a: 'Yes, we monitor your flight for airport transfers and adjust the pick-up time automatically for delays, so your driver is ready when you land.' },
  { key: 'largest', q: 'What is the largest group you can transport?', a: 'Our fleet ranges from a 1–3 passenger sedan up to a 50-seater luxury bus, so we can accommodate individual travellers up to large groups and events on a single booking or with multiple vehicles.' },
  { key: 'vip', q: 'Are your vehicles suitable for corporate and VIP guests?', a: 'Yes. Our Mercedes V-Class and Sprinter, along with our luxury coaches, are regularly used for VIP airport transfers, corporate delegations and hotel guest transport.' },
  { key: 'emirates', q: 'Do you travel between Emirates, not just within Dubai?', a: 'Yes, inter-emirate transportation is one of our core services — Dubai to Abu Dhabi, Sharjah, Ras Al Khaimah, Fujairah, Al Ain and beyond, for both individual trips and group transport.' },
  { key: 'contact', q: 'How do I contact Buses Transport UAE?', a: 'You can call or WhatsApp us any time, or send your trip details through the quote form on this website, and our team will respond promptly.' },
];

type S = {
  slug: string; name: string; icon: string; meta: string; blurb: string; heroTitle: string; heroSub: string;
  body: string; included: string[]; steps: [string, string][]; vehicles: string[]; faqs: string[]; seoDescription: string;
  seoTitle?: string; seoKeywords?: string;
};

const SERVICES: S[] = [
  { slug: 'airport-transfer', name: 'Airport Transfers', icon: 'i-plane', meta: 'DXB · DWC · AUH · SHJ',
    blurb: 'Meet-and-greet pick-ups and drop-offs at DXB, DWC, Abu Dhabi and Sharjah airports, with flight tracking included.',
    heroTitle: 'Airport transfers across the UAE',
    heroSub: 'Meet-and-greet pick-ups and drop-offs at Dubai International (DXB), Al Maktoum International (DWC), Abu Dhabi and Sharjah airports, with flight tracking included.',
    body: 'Landing at DXB, DWC, Abu Dhabi International or Sharjah Airport? Buses Transport UAE provides meet-and-greet airport transfers with a driver waiting at arrivals, and flight tracking so pick-up times adjust automatically if your flight is early or delayed.\n\nChoose a private Sedan for one or two travellers, a Mercedes V-Class for VIP arrivals, or a van or coach for group and staff arrivals — all with the same reliable, on-time service.',
    included: ['Flight tracking with automatic pick-up adjustment', 'Driver waiting at arrivals with a name board on request', 'Free waiting time allowance after landing', 'Available for departures and arrivals, 24 hours a day'],
    steps: [['Send flight details', 'Share your flight number, date and terminal.'], ['We track your flight', 'Pick-up time is adjusted automatically.'], ['Driver meets you', 'Your chauffeur waits at arrivals, ready to go.'], ['Direct to destination', 'A comfortable, direct ride to your hotel or office.']],
    vehicles: ['sedan', 'v-class', 'sprinter', 'hiace'], faqs: ['flight', 'areas', 'price', 'vip'],
    seoTitle: 'Airport Transfer Dubai — DXB, DWC, Abu Dhabi & Sharjah',
    seoDescription: 'Meet-and-greet airport pick-ups and drop-offs at DXB, DWC, Abu Dhabi and Sharjah airports. Serving Dubai, Abu Dhabi and across the UAE — call, WhatsApp or request a free quote in AED.' },
  { slug: 'hotel-to-hotel-transfer', name: 'Hotel-to-Hotel Transfers', icon: 'i-bag', meta: 'Door to door, lobby to lobby',
    blurb: 'Direct, comfortable transfers between hotels in Dubai and across the Emirates.',
    heroTitle: 'Hotel-to-hotel transfers in Dubai & the UAE',
    heroSub: 'Direct, comfortable transfers between hotels in Dubai, Abu Dhabi and across the Emirates, for guests, groups and event attendees.',
    body: 'Moving between hotels in Dubai, or travelling on to a property in another Emirate? Buses Transport UAE provides direct hotel-to-hotel transfers with a professional driver and a clean, comfortable vehicle.\n\nThis service is popular with hotel concierge teams, tour operators repositioning guests, and travellers moving between stays in Dubai, Abu Dhabi, Sharjah and beyond.',
    included: ['Direct, non-shared transfer between properties', 'Driver assists with luggage at pick-up and drop-off', 'Available for single guests through to full groups', 'Can be booked directly by hotels for recurring guest transfers'],
    steps: [['Share both hotels', 'Tell us the pick-up and drop-off properties and time.'], ['We confirm timing', 'A realistic pick-up time based on the route.'], ['Booking confirmed', 'Vehicle and driver reserved for your transfer.'], ['Smooth transfer', 'Direct travel from lobby to lobby.']],
    vehicles: ['v-class', 'kia-sedona', 'hiace'], faqs: ['areas', 'price', 'vip', 'advance'],
    seoDescription: 'Direct, comfortable transfers between hotels in Dubai and across the Emirates. Serving Dubai, Abu Dhabi and across the UAE — call, WhatsApp or request a free quote in AED.' },
  { slug: 'dinner-transfer', name: 'Dinner Transfers', icon: 'i-moon', meta: 'Evening & late night',
    blurb: 'Evening transfers to restaurants, desert dinners and events, with return pick-up arranged.',
    heroTitle: 'Evening & dinner transfers',
    heroSub: 'Evening transfers to restaurants, desert dinners and events across the UAE, with return pick-up arranged for the end of your evening.',
    body: 'Heading out for dinner, a desert evening or an event? Buses Transport UAE provides evening transfers with a driver who takes you there and returns for pick-up at an agreed time — no need to arrange your own way back.\n\nAvailable for couples, families and groups, in anything from a private Sedan to a van for a larger party.',
    included: ['Drop-off at your restaurant, venue or desert dinner site', 'Return pick-up arranged for your agreed time', 'Driver available to wait or return later in the evening', 'Suitable for couples, families and groups'],
    steps: [['Share venue & time', 'Tell us where you’re going and when.'], ['We confirm the plan', 'Drop-off and return pick-up time agreed.'], ['Enjoy your evening', 'Your driver drops you right at the venue.'], ['Return pick-up', 'Your driver is back at the agreed time.']],
    vehicles: ['sedan', 'v-class', 'kia-carnival'], faqs: ['price', 'advance', 'areas', 'vip'],
    seoDescription: 'Evening transfers to restaurants, desert dinners and events, with return pick-up arranged. Serving Dubai, Abu Dhabi and across the UAE — call, WhatsApp or request a free quote in AED.' },
  { slug: 'city-tours', name: 'City Tours', icon: 'i-pin', meta: 'Half day, full day & multi-day',
    blurb: 'Private, driver-guided tours of Dubai’s landmarks and the wider UAE, at your own pace.',
    heroTitle: 'Private city tours of Dubai & the UAE',
    heroSub: 'Driver-guided city tours of Dubai’s landmarks and the wider UAE, at your own pace, in a private vehicle sized for your group.',
    body: 'Explore Dubai and the UAE in a private vehicle with a professional driver, moving at your own pace between landmarks, souks, viewpoints and neighbourhoods — no fixed group tour timings.\n\nCity tours are available in any vehicle in our fleet, from a Sedan for a couple to a full coach for a large tour group, and can be booked by the half-day, full day or across multiple days.',
    included: ['Flexible itinerary built around what you want to see', 'Private vehicle — not shared with other travellers', 'Driver familiar with Dubai and UAE routes and traffic', 'Available for half-day, full-day and multi-day tours'],
    steps: [['Share your interests', 'Tell us what you’d like to see and for how long.'], ['We suggest a route', 'A realistic itinerary matched to your time and group.'], ['Confirm vehicle & price', 'Booking confirmed with your chosen vehicle.'], ['Tour at your pace', 'Your driver takes you between stops, on your schedule.']],
    vehicles: ['kia-carnival', 'sprinter', 'hiace'], faqs: ['price', 'advance', 'areas', 'largest'],
    seoDescription: "Private, driver-guided city tours of Dubai and the UAE's landmarks, at your own pace. Serving Dubai, Abu Dhabi and across the UAE — call, WhatsApp or request a free quote in AED." },
  { slug: 'shuttle-services', name: 'Shuttle Services', icon: 'i-route', meta: 'Fixed timetable routes',
    blurb: 'Recurring staff, guest and event shuttle routes with fixed schedules and dedicated vehicles.',
    heroTitle: 'Staff & guest shuttle services',
    heroSub: 'Recurring shuttle routes for staff, hotel guests and event attendees, with fixed schedules and dedicated vehicles across the UAE.',
    body: 'Buses Transport UAE runs scheduled shuttle services for companies moving staff between accommodation and the workplace, hotels shuttling guests, and events running attendees between venues.\n\nShuttle contracts are built around your schedule — fixed routes, fixed times, and a dedicated vehicle and driver assigned to your route for as long as you need it.',
    included: ['Fixed schedule built around your working or event hours', 'Dedicated vehicle and driver assigned to your route', 'Vans and buses from 7 to 50 seats available', 'Suited to daily, weekly or long-term contracts'],
    steps: [['Share your route', 'Pick-up points, drop-off points and timings.'], ['We plan the schedule', 'A shuttle plan matched to your headcount.'], ['Agree the contract', 'Daily, weekly or monthly terms confirmed.'], ['Shuttle runs on time', 'The same driver and vehicle, every scheduled trip.']],
    vehicles: ['hiace', 'coaster', 'bus-35'], faqs: ['monthly', 'largest', 'price', 'advance'],
    seoDescription: 'Recurring staff, guest and event shuttle routes with fixed schedules and dedicated vehicles. Serving Dubai, Abu Dhabi and across the UAE — call, WhatsApp or request a free quote in AED.' },
  { slug: 'car-rental', name: 'Car Rental', icon: 'i-car', meta: 'Hourly, daily or monthly',
    blurb: 'Executive sedans and luxury MPVs with a professional driver, by the hour, day or month.',
    heroTitle: 'Car rental Dubai with driver',
    heroSub: 'Executive sedans and luxury MPVs for car rental Dubai and across the UAE, with a professional driver included — self-drive available on selected vehicles.',
    body: 'Buses Transport UAE offers car rental Dubai with driver for business travel, airport transfers, meetings and everyday point-to-point trips across Dubai, Abu Dhabi and the wider UAE.\n\nChoose an executive Sedan for a private, direct ride, a Mercedes V-Class for a more spacious, VIP-standard journey, or a BMW, Range Rover, Land Cruiser or Mercedes-Benz luxury car for a premium self-drive or chauffeur-driven experience. Most cars are chauffeur-driven; selected vehicles are also available without a driver for self-drive hire. Rates are quoted in AED based on vehicle, duration and route — get a free quote for an exact price.',
    included: ['Professional, licensed chauffeur for the full booking (self-drive on request)', 'Clean, air-conditioned executive vehicle', 'Flexible booking by the hour, day or point-to-point trip', 'Available across Dubai, Abu Dhabi, Sharjah and beyond'],
    steps: [['Share your trip', 'Send your pick-up point, destination and time.'], ['Choose your car', 'Pick a Sedan or Mercedes V-Class based on your group size.'], ['Confirm & pay', 'We confirm the AED price and lock in your booking.'], ['Ride with us', 'Your driver meets you on time, ready to go.']],
    vehicles: ['sedan', 'v-class', 'bmw-luxury-sedan', 'range-rover'], faqs: ['driver', 'price', 'hours', 'monthly'],
    seoTitle: 'Car Rental Dubai With Driver',
    seoDescription: 'Executive sedans and luxury MPVs with a professional driver, by the hour, day or month. Serving Dubai, Abu Dhabi and across the UAE — call, WhatsApp or request a free quote in AED.' },
  { slug: 'bus-rental', name: 'Bus Rental', icon: 'i-bus', meta: '7 to 50 seats',
    blurb: 'Vans and coaches from 7 to 50 seats for groups, staff, schools and events across the UAE.',
    heroTitle: 'Bus rental Dubai — 7 to 50 seater coaches',
    heroSub: 'Van and luxury bus rental Dubai from 7 to 50 seats — including Toyota Hiace, Toyota Coaster, and 35 & 50 seater luxury buses — for staff transportation, tours, schools and events across the UAE.',
    body: 'From a 7-seater family van to a full 50-seater luxury bus rental Dubai, Buses Transport UAE rents vans and coaches for groups of any size across Dubai and the wider UAE, with a professional driver on every booking.\n\nOur bus rental service is used by companies running staff transportation, schools and tour operators moving groups, and event organisers who need multiple large vehicles on a fixed schedule. Toyota Hiace rental Dubai and Toyota Coaster rental Dubai are two of our most requested vehicles for mid-size groups.',
    included: ['Professional driver licensed for passenger transport', 'Vehicles from 7 to 50 seats, matched to your group size', 'Available for single trips, daily bus rental or monthly bus rental Dubai contracts', 'Luggage space and comfortable seating on every vehicle'],
    steps: [['Tell us group size', 'Share passenger numbers, route and dates.'], ['Get matched to a bus', 'We recommend the right vehicle, or several.'], ['Confirm the booking', 'AED price and schedule are confirmed in writing.'], ['Travel as a group', 'Your driver and bus arrive ready for departure.']],
    vehicles: ['kia-carnival', 'hiace', 'coaster', 'bus-35', 'bus-50'], faqs: ['largest', 'price', 'monthly', 'advance'],
    seoTitle: 'Bus Rental Dubai — 7 to 50 Seater Coaches',
    seoKeywords: 'bus rental Dubai, 50 seater bus rental Dubai, Toyota Hiace rental Dubai, Toyota Coaster rental Dubai, staff transportation UAE',
    seoDescription: 'Vans and coaches from 7 to 50 seats for groups, staff, schools and events across the UAE. Serving Dubai, Abu Dhabi and across the UAE — call, WhatsApp or request a free quote in AED.' },
  { slug: 'daily-rental', name: 'Daily Rental', icon: 'i-clock', meta: 'Vehicle & driver, full day',
    blurb: 'A vehicle and driver reserved for the full day — ideal for meetings, errands or a packed itinerary.',
    heroTitle: 'Daily car, van & bus rental',
    heroSub: 'A vehicle and driver reserved for the full day — ideal for meetings, errands, events or a packed itinerary across the UAE.',
    body: 'Daily rental gives you a vehicle and driver for the full day, so you can move between multiple stops — meetings, errands, sites or attractions — without booking separate trips.\n\nAvailable across the whole fleet, daily rental suits business travellers with a full schedule, families with a packed day of sightseeing, and companies needing a vehicle on standby.',
    included: ['Vehicle and driver reserved for a full working day', 'Multiple stops within your booked hours', 'Any vehicle in the fleet available for daily hire', 'Simple to extend into weekly or monthly rental'],
    steps: [['Share your day plan', 'Rough schedule, stops and preferred vehicle.'], ['We confirm hours', 'A day rate and hours are agreed upfront.'], ['Driver reports for duty', 'Your vehicle and driver start at your first stop.'], ['Full day covered', 'Move between stops without separate bookings.']],
    vehicles: ['sedan', 'v-class', 'kia-carnival', 'sprinter'], faqs: ['price', 'advance', 'monthly', 'areas'],
    seoDescription: 'A vehicle and driver for the full day — ideal for meetings, errands or a packed itinerary. Serving Dubai, Abu Dhabi and across the UAE — call, WhatsApp or request a free quote in AED.' },
  { slug: 'monthly-rental', name: 'Monthly Rental', icon: 'i-calendar', meta: 'Dedicated vehicle & driver',
    blurb: 'Long-term monthly hire with a dedicated vehicle and driver for companies and individuals.',
    heroTitle: 'Monthly rental for companies & individuals',
    heroSub: 'Long-term monthly hire with a dedicated vehicle and professional driver, for companies, families and individuals across the UAE.',
    body: 'For longer-term transport needs, Buses Transport UAE offers monthly rental with a dedicated vehicle and driver — a straightforward alternative to managing your own fleet or drivers.\n\nMonthly agreements are popular with companies covering executive transport or staff shuttles, and individuals or families who prefer a consistent driver and vehicle over an extended stay.',
    included: ['Dedicated vehicle assigned for the full month', 'Consistent, familiar driver for your account', 'Suited to executive transport, staff shuttles or family use', 'Terms tailored to your expected usage and schedule'],
    steps: [['Share your requirements', 'Vehicle type, expected usage and schedule.'], ['We propose terms', 'A monthly plan matched to your needs.'], ['Agree the contract', 'Terms confirmed before the month begins.'], ['Ongoing service', 'The same driver and vehicle, every day of the month.']],
    vehicles: ['sprinter', 'hiace', 'coaster'], faqs: ['monthly', 'largest', 'price', 'advance'],
    seoDescription: 'Long-term monthly hire with a dedicated vehicle and driver for companies and individuals. Serving Dubai, Abu Dhabi and across the UAE — call, WhatsApp or request a free quote in AED.' },
];

const AREAS = [
  { name: 'Dubai', code: 'DXB', note: 'Head office · DXB & DWC', badge: 'Head office', kind: 'emirate', isHub: true, mapKey: 'Dubai' },
  { name: 'Abu Dhabi', code: 'AUH', note: 'AUH airport · inter-emirate', badge: 'Covered', kind: 'emirate', mapKey: 'Abu Dhabi' },
  { name: 'Sharjah', code: 'SHJ', note: 'SHJ airport · transfers', badge: 'Covered', kind: 'emirate', mapKey: 'Sharjah' },
  { name: 'Ajman', code: 'AJM', note: 'Transfers & group transport', badge: 'Covered', kind: 'emirate', mapKey: 'Ajman' },
  { name: 'Umm Al Quwain', code: 'UAQ', note: 'Transfers & group transport', badge: 'Covered', kind: 'emirate', mapKey: 'Umm Al Quwain' },
  { name: 'Ras Al Khaimah', code: 'RAK', note: 'Inter-emirate routes', badge: 'Covered', kind: 'emirate', mapKey: 'Ras Al Khaimah' },
  { name: 'Fujairah', code: 'FUJ', note: 'Inter-emirate routes', badge: 'Covered', kind: 'emirate', mapKey: 'Fujairah' },
  { name: 'Al Ain', code: 'AAN', note: 'Inter-emirate routes', badge: 'Covered', kind: 'emirate', mapKey: 'Al Ain' },
  { name: 'Dubai International Airport', code: 'DXB', note: 'Terminals 1, 2 and 3', kind: 'airport' },
  { name: 'Al Maktoum International Airport', code: 'DWC', note: 'Dubai South', kind: 'airport' },
  { name: 'Abu Dhabi International Airport', code: 'AUH', note: 'Abu Dhabi', kind: 'airport' },
  { name: 'Sharjah International Airport', code: 'SHJ', note: 'Sharjah', kind: 'airport' },
  ...['Downtown Dubai', 'Dubai Marina', 'Business Bay', 'Palm Jumeirah', 'Jumeirah', 'Deira', 'Bur Dubai', 'Al Barsha'].map((name) => ({
    name, code: '', note: 'Dubai', kind: 'area',
  })),
];

const ROUTES = [
  { from: 'DXB Airport', to: 'Downtown Dubai', km: 15, mins: 20, note: 'Approx. via Airport Road' },
  { from: 'Dubai', to: 'Abu Dhabi', km: 140, mins: 90, note: 'Approx. via E11' },
  { from: 'Dubai Marina', to: 'Palm Jumeirah', km: 8, mins: 15, note: 'Approx.' },
  { from: 'DXB Airport', to: 'Dubai Marina', km: 40, mins: 35, note: 'Approx. via E11' },
  { from: 'Dubai', to: 'Sharjah', km: 30, mins: 35, note: 'Approx. traffic varies' },
  { from: 'Dubai', to: 'Al Ain', km: 160, mins: 110, note: 'Approx. via E66' },
  { from: 'Dubai', to: 'Ras Al Khaimah', km: 115, mins: 80, note: 'Approx. via E311' },
  { from: 'Dubai', to: 'Fujairah', km: 125, mins: 100, note: 'Approx. via E102' },
];

const POSTS = [
  {
    slug: 'airport-transfers-dubai-whats-included', title: 'Airport transfers in Dubai: what’s included when you book with us',
    category: 'Transfers', tags: 'airport transfer, DXB, DWC, flight tracking', theme: 'night', date: '2026-09-20',
    excerpt: 'Flight tracking, a driver waiting at arrivals and a vehicle sized to your group — here is exactly what an airport transfer with Buses Transport UAE covers.',
    body: `Landing at DXB, DWC, Abu Dhabi International or Sharjah Airport is the start of most trips we run. Here is what every airport transfer booking includes, and how to get the most out of it.

## What every airport transfer includes

- **Flight tracking** with automatic pick-up adjustment, so an early or delayed landing moves your pick-up time for you.
- A **driver waiting at arrivals**, with a name board on request.
- A **free waiting time allowance** after landing.
- Availability for **departures and arrivals, 24 hours a day**.

## Which vehicle to choose

| Group | Suggested vehicle |
|---|---|
| 1–2 travellers | Sedan |
| VIP arrivals, families | Mercedes V-Class (6–7 seats) |
| Mid-sized groups | Mercedes Sprinter (up to 17 seats) |
| Staff and group arrivals | Toyota Hiace (13–15 seats) or a coach |

## How it works

1. **Send flight details** — share your flight number, date and terminal.
2. **We track your flight** — the pick-up time is adjusted automatically.
3. **Driver meets you** — your chauffeur waits at arrivals, ready to go.
4. **Direct to destination** — a comfortable, direct ride to your hotel or office.

## Getting a price

Rates depend on the vehicle, trip duration, distance and date, and are always quoted in AED. Send your trip details by WhatsApp, phone or the quote form and we will confirm a price before you book.`,
  },
  {
    slug: 'choosing-the-right-vehicle-for-your-group', title: 'Choosing the right vehicle for your group: sedan to 50-seater',
    category: 'Fleet', tags: 'fleet, bus rental, van rental, group transport', theme: 'azure', date: '2026-09-13',
    excerpt: 'From a four-seat executive sedan to a 50-seat luxury coach — a quick guide to matching the vehicle to your headcount, luggage and trip.',
    body: `Our fleet covers every group size, from a private executive sedan to a 50-seat luxury coach. Choosing the right class up front keeps the trip comfortable and the price right.

## Fleet at a glance

| Vehicle | Capacity | Driver option | Best for |
|---|---|---|---|
| Sedan | 4 | Chauffeur-driven only | Airport & private transfers |
| Mercedes V-Class | 6–7 | Chauffeur-driven only | VIP & family transfers |
| Kia Carnival 7-Seater | 7 | With or without driver | Family & airport transfers |
| Mercedes Sprinter | Up to 17 | Chauffeur-driven only | Groups & tours |
| Toyota Hiace | 13–15 | With or without driver | Staff & group transport |
| Toyota Coaster | 23–30 | With or without driver | Tours & shuttle services |
| 35-Seater Luxury Bus | 35 | Chauffeur-driven only | Events & group travel |
| 50-Seater Luxury Bus | 50 | Chauffeur-driven only | Large groups & staff transport |

## Families and small groups

For up to seven passengers, a 7-seater family van — Kia Carnival, Kia Sedona, Mercedes Viano / Vito, Honda Odyssey, Toyota Previa or Hyundai Starex — gives you room for luggage and easy access for everyone.

## Corporate and VIP guests

The Mercedes V-Class and Sprinter, along with our luxury coaches, are regularly used for VIP airport transfers, corporate delegations and hotel guest transport.

## Large groups and events

Toyota Hiace and Toyota Coaster are our most requested vehicles for mid-size groups. For conferences, exhibitions and staff contracts, the 35 and 50-seater luxury buses move large groups in one go — or we combine several vehicles on a single booking.

## Self-drive

Vehicles marked **With or Without Driver** can be booked as a self-drive hire; vehicles marked **Chauffeur-Driven Only** always come with a professional driver.

Not sure which vehicle you need? Tell us your group size and we will recommend the right one.`,
  },
  {
    slug: 'daily-vs-monthly-rental-uae', title: 'Daily vs monthly rental in the UAE: which one suits you?',
    category: 'Rental', tags: 'daily rental, monthly rental, staff transport', theme: 'ember', date: '2026-09-06',
    excerpt: 'A full day with a driver on standby, or a dedicated vehicle for the whole month — how the two rental options differ and who each one is for.',
    body: `Both options give you a vehicle and a professional driver without booking separate trips. The difference is how long you need them.

## Daily rental

Daily rental gives you a vehicle and driver for the full day, so you can move between multiple stops — meetings, errands, sites or attractions — without booking separate trips.

- Vehicle and driver reserved for a full working day
- Multiple stops within your booked hours
- Any vehicle in the fleet available for daily hire
- Simple to extend into weekly or monthly rental

It suits business travellers with a full schedule, families with a packed day of sightseeing, and companies needing a vehicle on standby.

## Monthly rental

Monthly rental assigns a dedicated vehicle and a consistent driver to you for the full month — a straightforward alternative to managing your own fleet or drivers.

- Dedicated vehicle assigned for the full month
- Consistent, familiar driver for your account
- Suited to executive transport, staff shuttles or family use
- Terms tailored to your expected usage and schedule

## Which one to choose

> If you need transport for a day or two, book daily. If the same need repeats every working day, a monthly agreement is simpler.

Companies covering executive transport or staff shuttles usually move to monthly terms, while visitors and one-off events stay on daily hire. Either way, the price is confirmed in AED before you travel.`,
  },
];

async function main() {
  // --- admin user
  const email = (process.env.ADMIN_EMAIL || 'admin@busestransport.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const existing = await db.user.findUnique({ where: { email } });
  if (!existing) {
    if (!password) throw new Error('Set ADMIN_PASSWORD in .env before seeding.');
    await db.user.create({ data: { name: 'Site Admin', email, passwordHash: await bcrypt.hash(password, 12), role: 'admin' } });
    console.log(`Admin user created: ${email}`);
  }

  // --- fleet categories + vehicles
  const catIds: Record<string, number> = {};
  for (const c of CATEGORIES) {
    const row = await db.fleetCategory.upsert({ where: { slug: c.slug }, create: c, update: { name: c.name, order: c.order } });
    catIds[c.slug] = row.id;
  }
  for (const [i, v] of VEHICLES.entries()) {
    const data = {
      name: v.name, classLabel: v.classLabel, seatsLabel: v.seatsLabel, capacity: v.capacity, driverOption: v.driver,
      tags: v.tags.join(', '), description: v.description, bestFor: v.bestFor, images: JSON.stringify(v.images), alt: v.alt,
      order: v.featured ?? 20 + i, featured: !!v.featured, categoryId: catIds[v.cat], active: true,
    };
    await db.vehicle.upsert({ where: { slug: v.slug }, create: { slug: v.slug, ...data }, update: data });
  }

  // --- FAQs (matched by question text)
  const faqIds: Record<string, number> = {};
  for (const [i, f] of FAQS.entries()) {
    const found = await db.faq.findFirst({ where: { question: f.q } });
    const row = found
      ? await db.faq.update({ where: { id: found.id }, data: { answer: f.a, order: i + 1 } })
      : await db.faq.create({ data: { question: f.q, answer: f.a, order: i + 1, showOnHome: i < 6 } });
    faqIds[f.key] = row.id;
  }

  // --- services
  for (const [i, s] of SERVICES.entries()) {
    const data = {
      name: s.name, icon: s.icon, meta: s.meta, blurb: s.blurb, heroTitle: s.heroTitle, heroSub: s.heroSub, body: s.body,
      included: s.included.join('\n'), steps: JSON.stringify(s.steps.map(([t, b]) => ({ t, b }))), order: i + 1, active: true, featured: true,
      seoTitle: s.seoTitle ?? null, seoDescription: s.seoDescription, seoKeywords: s.seoKeywords ?? null,
      vehicles: { set: s.vehicles.map((slug) => ({ slug })) },
      faqs: { set: s.faqs.map((k) => ({ id: faqIds[k] })) },
    };
    const { vehicles, faqs, ...scalar } = data;
    await db.service.upsert({
      where: { slug: s.slug },
      create: { slug: s.slug, ...scalar, vehicles: { connect: vehicles.set }, faqs: { connect: faqs.set } },
      update: data,
    });
  }

  // --- coverage (replace wholesale; small reference tables)
  await db.area.deleteMany();
  await db.area.createMany({ data: AREAS.map((a, i) => ({ ...a, badge: a.badge ?? '', isHub: a.isHub ?? false, mapKey: a.mapKey ?? null, order: i + 1 })) });
  await db.route.deleteMany();
  await db.route.createMany({ data: ROUTES.map((r, i) => ({ ...r, order: i + 1, showInTicker: i < 6 })) });

  // --- blog posts (only created when missing, never overwritten)
  for (const p of POSTS) {
    const exists = await db.post.findUnique({ where: { slug: p.slug } });
    if (exists) continue;
    await db.post.create({
      data: {
        slug: p.slug, title: p.title, excerpt: p.excerpt, body: p.body, category: p.category, tags: p.tags, theme: p.theme,
        author: 'Buses Transport UAE', status: 'published', publishedAt: new Date(`${p.date}T09:00:00+04:00`),
        readMinutes: Math.max(1, Math.round(p.body.split(/\s+/).length / 200)),
      },
    });
  }

  // --- CMS pages
  const privacy = await db.page.findUnique({ where: { slug: 'privacy-policy' } });
  if (!privacy) {
    await db.page.create({
      data: {
        slug: 'privacy-policy', title: 'Privacy Policy', subtitle: 'How we handle the details you send us.', showInFooter: true, order: 1,
        body: `This page explains what information Buses Transport UAE collects through this website and how it is used.

## What we collect

When you request a quote or contact us, we collect the details you enter in the form — such as your name, phone or WhatsApp number, email address, pick-up and drop-off locations, travel date and any notes about your trip.

## How we use it

We use these details only to respond to your request, prepare an AED quote, confirm your booking and contact you about your trip. We do not sell your information.

## Analytics

If analytics or advertising tags are enabled on this website, they may set cookies to measure visits and improve our service.

## Contact

For any question about your data, or to ask us to delete it, contact us by phone, WhatsApp or email using the details on our [contact page](/contact).`,
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
