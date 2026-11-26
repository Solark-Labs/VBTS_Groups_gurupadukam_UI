import { Product, Purohit, ServiceCategory, PoojaPackage, NadaswaramTroupe, AparaPeeta } from './types';

export const BRAND_CONTACT = {
  phoneDisplay: '+91 99497 30175',
  phoneRaw: '919949730175',
  email: 'care.gurupadukam@gmail.com',
  address: 'Madhuranagar, Gollagudem, Khammam – 507002',
  bookingTokenFee: 11,
};

export const OFFICIAL_LOGO = '/logo.png';

// ─── Products ─────────────────────────────────────────────────────────────────
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1', name: 'Organic Pasupu (Turmeric)', nameTe: 'పసుపు (పచ్చ పసుపు)',
    price: 149, origPrice: 199, discount: '25% off',
    image: OFFICIAL_LOGO,
    desc: 'Pure organic stone-ground turmeric powder with high natural curcumin. Free from lead chromate & artificial chemicals. Specially blessed for poojas, tilak & haldi.',
    category: 'powder', badge: { text: '✓ 100% Organic', type: 'org' }, stock: 50
  },
  {
    id: 'p2', name: 'Traditional Vedic Kumkum', nameTe: 'సింధూరం / కుంకుమ',
    price: 129, origPrice: 169, discount: '24% off',
    image: OFFICIAL_LOGO,
    desc: 'Sacred red kumkum made from pure turmeric, lime & essential natural herbs. Non-toxic, vibrant colour, traditional aroma for temple & home pooja.',
    category: 'powder', badge: { text: 'Fresh Batch', type: 'new' }, stock: 40
  },
  {
    id: 'p3', name: 'Mysore Gandham (Sandalwood)', nameTe: 'గంధం / చందనం',
    price: 249, origPrice: 320, discount: '22% off',
    image: OFFICIAL_LOGO,
    desc: 'Pure Mysore sandalwood paste & powder for deity abhishekam and sacred tilak. Cooling natural fragrance prepared according to Agamic traditions.',
    category: 'powder', badge: { text: 'Temple Grade', type: 'lim' }, stock: 25
  },
  {
    id: 'p4', name: 'Sacred Vibhuti (Holy Bhasmam)', nameTe: 'విభూతి (భస్మం)',
    price: 99, origPrice: 129, discount: '23% off',
    image: OFFICIAL_LOGO,
    desc: 'Prepared in traditional homa fires from indigenous desi cow dung with sacred herbal dravyams. Soft, fine, pure white texture with divine energy.',
    category: 'powder', badge: { text: 'Desi Cow Homa', type: 'org' }, stock: 100
  },
  {
    id: 'p5', name: 'Vedic Yagnopavitam (9 Strands)', nameTe: 'యజ్ఞోపవీతం (జంధ్యాలు)',
    price: 199, origPrice: 259, discount: '23% off',
    image: OFFICIAL_LOGO,
    desc: 'Pure handspun unbleached cotton sacred thread hand-tied with 9 sacred strands & Brahma knot. Ideal for Upanayanam and daily Brahmachari / Grihastha rituals.',
    category: 'thread', badge: { text: 'Handcrafted', type: 'new' }, stock: 60
  },
  {
    id: 'p6', name: 'Complete 5-in-1 Daily Pooja Kit', nameTe: 'సంపూర్ణ పూజా కిట్ (5-in-1)',
    price: 599, origPrice: 825, discount: 'Save ₹226',
    image: OFFICIAL_LOGO,
    desc: 'Complete sacred collection: Pasupu, Kumkum, Chandanam, Vibhuti, Akshatalu & Yagnopavitam packed in an auspicious gift presentation box.',
    category: 'combo', badge: { text: 'Best Seller', type: 'sale' }, stock: 35
  },
  {
    id: 'p7', name: 'Traditional Tambulam Return Gift Set', nameTe: 'తాంబూలం & బహుమతి సెట్',
    price: 149, origPrice: 199, discount: '25% off',
    image: OFFICIAL_LOGO,
    desc: 'Curated return gift hamper with coconut, pasupu-kumkum, betel leaves pouch, bangles & akshatalu. Focus on your guests — we handle the packaging!',
    category: 'return-gifts', badge: { text: 'Event Ready', type: 'sale' }, stock: 250
  },
  {
    id: 'p8', name: 'House Warming & Bhoomi Pooja Kit', nameTe: 'గృహ ప్రవేశ & భూమి పూజ కిట్',
    price: 899, origPrice: 1299, discount: 'Save ₹400',
    image: OFFICIAL_LOGO,
    desc: 'Complete ritual kit for House Warming, Bhoomi & Shop Pooja: copper kalasam, coconut, camphor, deepam oil, navadhanyalu, cotton wicks & agarbatti.',
    category: 'items', badge: { text: 'Full Ritual Kit', type: 'new' }, stock: 40
  },
  {
    id: 'p9', name: 'Fresh Jasmine & Marigold Garlands', nameTe: 'తాజా మల్లె & బంతిపూల మాలలు',
    price: 199, origPrice: 260, discount: '23% off',
    image: OFFICIAL_LOGO,
    desc: 'Farm-fresh jasmine, marigold & rose garlands tied fresh every morning for deity decoration, vehicle pooja & griha pravesh. Delivered in minutes.',
    category: 'flowers', badge: { text: '⚡ Fresh in Minutes', type: 'new' }, stock: 80, deliverySpeed: '15–30 mins'
  },
  {
    id: 'p10', name: 'Panakam & Vratham Prasad Kit', nameTe: 'పానకం & వ్రత ప్రసాదం కిట్',
    price: 349, origPrice: 450, discount: '22% off',
    image: OFFICIAL_LOGO,
    desc: 'Traditional Satyanarayan & Varalakshmi Vratham prasad kit: organic jaggery-pepper-dry ginger panakam blend, suji rava, cardamom & sacred serving cups.',
    category: 'prasad', badge: { text: '✓ 100% Pure', type: 'org' }, stock: 60
  },
  {
    id: 'p11', name: 'Daily Deepam Oil & Bhimseni Camphor', nameTe: 'నిత్య పూజ దీపం & కర్పూరం ప్యాక్',
    price: 119, origPrice: 160, discount: '25% off',
    image: OFFICIAL_LOGO,
    desc: 'Everyday essentials delivered in minutes: pure aromatic Bhimseni camphor, cold-pressed sesame deepam oil, handmade cotton wicks & chandan agarbatti.',
    category: 'essentials', badge: { text: '⚡ In Minutes', type: 'new' }, stock: 150, deliverySpeed: '15–30 mins'
  },
  {
    id: 'p12', name: 'Express Vehicle Pooja Kit', nameTe: 'వాహన పూజ కిట్',
    price: 179, origPrice: 240, discount: '25% off',
    image: OFFICIAL_LOGO,
    desc: 'Instant kit for new car, bike or commercial vehicle pooja: 4 fresh organic lemons, coconut, marigold garland, pasupu-kumkum, camphor & agarbatti.',
    category: 'essentials', badge: { text: '⚡ Express Delivery', type: 'sale' }, stock: 90, deliverySpeed: '15–30 mins'
  },
];

// ─── Purohits (All using Official Logo as verified emblem) ───────────────────
export const PUROHITS: Purohit[] = [
  {
    id: 'pr1',
    name: 'Brahmasri Subrahmanyam Sharma',
    nameTe: 'బ్రహ్మశ్రీ సుబ్రహ్మణ్యం శర్మ',
    image: OFFICIAL_LOGO,
    phone: '919949730175',
    specializations: ['House Warming', 'Bhoomi / Shop Pooja', 'Satyanarayan Vratha', 'Vehicle Pooja'],
    experience: 25,
    rating: 4.9,
    reviews: 342,
    availability: 'now',
    languages: ['Telugu', 'Sanskrit', 'Hindi'],
    location: 'Madhuranagar, Khammam',
    verified: true,
    completedPoojas: 1247,
    bio: 'Vedic scholar with 25+ years performing Griha Pravesh, Bhoomi Pooja, Vehicle Pooja & Vrathams with traditional precision.'
  },
  {
    id: 'pr2',
    name: 'Pandit Venkateswara Rao',
    nameTe: 'పండిత వెంకటేశ్వర రావు',
    image: OFFICIAL_LOGO,
    specializations: ['Vivah', 'Upanayanam', 'Namakarana', 'House Warming'],
    experience: 18,
    rating: 4.8,
    reviews: 218,
    availability: 'now',
    languages: ['Telugu', 'Sanskrit'],
    location: 'Gollagudem, Khammam',
    verified: true,
    completedPoojas: 892,
    bio: 'Specialist in life-cycle rituals (Samskaras) and auspicious home ceremonies. Transparent direct dakshina discussion.'
  },
  {
    id: 'pr3',
    name: 'Brahmasri Raghupati Bhatt',
    nameTe: 'బ్రహ్మశ్రీ రఘుపతి భట్టు',
    image: OFFICIAL_LOGO,
    specializations: ['Navaratris', 'Devi Pooja', 'Vratha', 'Sundara Kanda'],
    experience: 30,
    rating: 5.0,
    reviews: 489,
    availability: 'today',
    nextSlot: 'Today 3:00 PM',
    languages: ['Telugu', 'Sanskrit', 'Kannada'],
    location: 'Wyra Road, Khammam',
    verified: true,
    completedPoojas: 1893,
    bio: '30-year veteran renowned for Navaratri Kalasha Sthapana, Chandi Parayanam, and Satyanarayan Vratham.'
  },
  {
    id: 'pr4',
    name: 'Pandit Lakshmi Narasimha Rao',
    nameTe: 'పండిత లక్ష్మీ నరసింహ రావు',
    image: OFFICIAL_LOGO,
    specializations: ['Vehicle Pooja', 'Bhoomi / Shop Pooja', 'Navagraha Pooja', 'Vastu Shanti'],
    experience: 22,
    rating: 4.9,
    reviews: 376,
    availability: 'now',
    languages: ['Telugu', 'Sanskrit', 'Tamil'],
    location: 'Mamillagudem, Khammam',
    verified: true,
    completedPoojas: 1421,
    bio: 'Available immediately for Vehicle Pooja, Shop Openings, Bhoomi Pooja & Vastu Shanti across Khammam & nearby towns.'
  },
  {
    id: 'pr5',
    name: 'Brahmasri Govinda Sharma',
    nameTe: 'బ్రహ్మశ్రీ గోవింద శర్మ',
    image: OFFICIAL_LOGO,
    specializations: ['Yagnam', 'Homa / Havana', 'Rudra Abhishekam', 'Navaratris'],
    experience: 35,
    rating: 4.8,
    reviews: 203,
    availability: 'scheduled',
    nextSlot: 'Tomorrow 7:00 AM',
    languages: ['Telugu', 'Sanskrit'],
    location: 'Khammam & Bhadrachalam',
    verified: true,
    completedPoojas: 2100,
    bio: 'Master of Vedic fire rituals, Navaratri Homams, and Rudrabhishekam with a team of Vedic scholars.'
  },
  {
    id: 'pr6',
    name: 'Pandit Ramachandra Avadhani',
    nameTe: 'పండిత రామచంద్ర అవధాని',
    image: OFFICIAL_LOGO,
    specializations: ['Annaprasana', 'Aksharabhyasam', 'Namakarana', 'Vratha'],
    experience: 15,
    rating: 4.7,
    reviews: 165,
    availability: 'today',
    nextSlot: 'Today 5:00 PM',
    languages: ['Telugu', 'Sanskrit'],
    location: 'Mustafa Nagar, Khammam',
    verified: true,
    completedPoojas: 678,
    bio: 'Specializes in joyful family ceremonies, Vrathams, and children’s rituals with warm explanation of every mantra.'
  },
];

// ─── Service Categories ───────────────────────────────────────────────────────
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'sc1', name: 'Purohit Booking', nameTe: 'పురోహిత సేవలు',
    icon: '🙏', description: 'Book with ₹11 token & negotiate directly with purohit',
    providerCount: 150, badgeText: '₹11 Token Booking', route: '/purohits'
  },
  {
    id: 'sc2', name: 'Everyday Essentials', nameTe: 'నిత్య పూజ సామగ్రి',
    icon: '⚡', description: 'Camphor, oil, flowers & vehicle pooja kits in minutes',
    providerCount: 120, badgeText: 'In Minutes', route: '/marketplace?cat=essentials'
  },
  {
    id: 'sc3', name: 'Return Gifts', nameTe: 'రిటర్న్ గిఫ్ట్స్',
    icon: '🎁', description: 'Customised tambulam & gift hampers for your guests',
    providerCount: 80, badgeText: 'Event Ready', route: '/marketplace?cat=return-gifts'
  },
  {
    id: 'sc4', name: 'Nadaswaram Troupe', nameTe: 'నాదస్వరం బృందం',
    icon: '🎵', description: 'Traditional music ensembles for auspicious events',
    providerCount: 25, badgeText: '₹11 Token Booking', route: '/services?cat=nadaswaram'
  },
  {
    id: 'sc5', name: 'Pooja Marketplace', nameTe: 'పూజా స్టోర్',
    icon: '🪔', description: 'Order pure organic pooja items of your choice',
    providerCount: 500, badgeText: 'Doorstep Delivery', route: '/marketplace'
  },
  {
    id: 'sc6', name: 'Flower Decoration', nameTe: 'పుష్ప అలంకరణ',
    icon: '🌸', description: 'Fresh floral mandap & home entrance decoration',
    providerCount: 40, badgeText: 'Custom Quote', route: '/services?cat=decoration'
  },
  {
    id: 'sc7', name: 'Prasad & Sweets', nameTe: 'ప్రసాద్ & మిఠాయి',
    icon: '🍮', description: 'Traditional vratham prasad & sweets delivered fresh',
    providerCount: 50, badgeText: 'Freshly Prepared', route: '/marketplace?cat=prasad'
  },
  {
    id: 'sc8', name: 'Event Photography', nameTe: 'ఈవెంట్ ఫోటోగ్రఫీ',
    icon: '📸', description: 'Capture every sacred moment with your relatives',
    providerCount: 30, badgeText: 'Custom Quote', route: '/services?cat=photography'
  },
];

// ─── Pooja Packages (Using Official Logo) ────────────────────────────────────
export const POOJA_PACKAGES: PoojaPackage[] = [
  {
    id: 'pkg1',
    name: 'House Warming (Griha Pravesh)',
    nameTe: 'గృహ ప్రవేశ పూర్తి సహాయం',
    occasion: 'House Warming',
    includes: ['Verified Purohit (₹11 Token)', 'Full Pooja Items Kit', 'Fresh Flower Torans', 'Return Gift Hampers', 'Doorstep Delivery'],
    image: OFFICIAL_LOGO,
    badge: 'Most Requested',
    popular: true
  },
  {
    id: 'pkg2',
    name: 'Vehicle & Shop / Bhoomi Pooja',
    nameTe: 'వాహన & భూమి/దుకాణ పూజ',
    occasion: 'Bhoomi / Vehicle Pooja',
    includes: ['Instant Purohit Slot', 'Express Pooja Kit in Minutes', 'Fresh Garlands & Lemons', 'Direct Dakshina Negotiation'],
    image: OFFICIAL_LOGO,
    badge: 'Express Slot'
  },
  {
    id: 'pkg3',
    name: 'Navaratri & Vratha Assistance',
    nameTe: 'నవరాత్రి & వ్రత పూజలు',
    occasion: 'Navaratris & Vratha',
    includes: ['Experienced Vratha Purohit', 'Pasupu, Kumkum & Kalasam', 'Prasad & Panakam Kit', 'Custom Return Gifts for Guests'],
    image: OFFICIAL_LOGO,
    badge: 'Festival Special'
  },
  {
    id: 'pkg4',
    name: 'Grand Celebration & Return Gifts',
    nameTe: 'శుభకార్యాలు & రిటర్న్ గిఫ్ట్స్',
    occasion: 'Vivah / Upanayanam',
    includes: ['Senior Purohit + Team', 'Nadaswaram Troupe', 'Bulk Tambulam Return Gifts', 'Full Event Necessaries Delivered'],
    image: OFFICIAL_LOGO,
    badge: 'Complete Care',
    popular: true
  },
];

// ─── Nadaswaram Troupes (Using Official Logo) ─────────────────────────────────
export const NADASWARAM_TROUPES: NadaswaramTroupe[] = [
  {
    id: 'ns1', name: 'Sri Venkatesa Nadaswaram Troupe',
    members: 6, experience: 20, rating: 4.9, reviews: 187,
    availability: 'now', location: 'Khammam', image: OFFICIAL_LOGO
  },
  {
    id: 'ns2', name: 'Carnatic Mangala Vadyam Group',
    members: 8, experience: 15, rating: 4.8, reviews: 134,
    availability: 'today', location: 'Khammam & Wyra', image: OFFICIAL_LOGO
  },
  {
    id: 'ns3', name: 'Divine Nagaswaram Orchestra',
    members: 10, experience: 30, rating: 5.0, reviews: 312,
    availability: 'scheduled', location: 'Telangana & AP', image: OFFICIAL_LOGO
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
export const TESTIMONIALS = [
  {
    id: 't1', name: 'Priya Reddy', location: 'Madhuranagar, Khammam',
    occasion: 'House Warming', rating: 5,
    text: 'Paid just ₹11 to confirm the purohit and discussed dakshina directly. We enjoyed the house warming with our relatives while Guru Padukam delivered all items and return gifts!',
    avatar: 'PR'
  },
  {
    id: 't2', name: 'Ravi Kumar Sharma', location: 'Gollagudem, Khammam',
    occasion: 'Shop & Bhoomi Pooja', rating: 5,
    text: 'Booked a purohit sitting at home for our new shop pooja. Everything from camphor to nadaswaram was arranged seamlessly.',
    avatar: 'RK'
  },
  {
    id: 't3', name: 'Anjali Rao', location: 'Wyra Road, Khammam',
    occasion: 'Navaratri Vratham', rating: 5,
    text: 'The everyday essentials arrived in minutes! Return gift hampers were loved by all our guests. Truly stress-free rituals.',
    avatar: 'AR'
  },
  {
    id: 't4', name: 'Venkat Rao', location: 'Mamillagudem, Khammam',
    occasion: 'Vehicle Pooja', rating: 5,
    text: 'Ordered the vehicle pooja pack and booked a purohit immediately. Super fast, respectful, and no hidden fees.',
    avatar: 'VR'
  },
];

// ─── Pooja Occasions ──────────────────────────────────────────────────────────
export const POOJA_OCCASIONS = [
  'Vehicle Pooja',
  'House Warming',
  'Bhoomi / Shop Pooja',
  'Navaratris',
  'Vratha',
  'Satyanarayan Pooja',
  'Upanayanam',
  'Vivah',
  'Namakarana',
  'Annaprasana',
  'Homa / Havana',
  'Sundara Kanda',
];

// ─── Apara Ceremonies & Peetas ───────────────────────────────────────────────
export const APARA_CEREMONY_TYPES = [
  'Last Rites / Anthyeshti (1–13 Days)',
  'Masikam (Monthly Ceremony)',
  'Abdikam / Samvatsarikam (Yearly)',
  'Pinda Pradanam / Pitru Tharpanam',
  'Mahalaya Paksha Shraddham',
  'Tila Homam & Shanti Karma',
];

export const APARA_PEETAS: AparaPeeta[] = [
  {
    id: 'ap1',
    name: 'Sri Kashi Pitru Seva Peetam',
    nameTe: 'శ్రీ కాశీ పితృ సేవా పీఠం',
    image: OFFICIAL_LOGO,
    phone: '919949730175',
    organizerName: 'Brahmasri Viswanatha Sastry',
    address: 'Madhuranagar, Gollagudem Road, Khammam – 507002',
    city: 'Khammam',
    lat: 17.2518,
    lng: 80.1489,
    services: [
      'Last Rites / Anthyeshti (1–13 Days)',
      'Masikam (Monthly Ceremony)',
      'Abdikam / Samvatsarikam (Yearly)',
      'Pinda Pradanam / Pitru Tharpanam',
      'Mahalaya Paksha Shraddham',
    ],
    groupOptions: ['Single Purohit (1)', 'Group of 2 Purohits', 'Group of 3 Purohits', 'Group of 5 Vedic Pandits'],
    supportsOnline: true,
    supportsHomeService: true,
    supportsVenueVisit: true,
    supportsFoodPackage: true,
    foodPresets: [
      '3 Curries & 3 Pickles + Sweets & Hot',
      '4 Curries & 4 Pickles + Sweets & Hot',
      'Traditional Satvik Abdikam Feast (Custom)',
    ],
    maxGuestsAtVenue: 150,
    rating: 4.9,
    reviewCount: 284,
    experienceYears: 28,
    verified: true,
    bio: 'Dignified, compassionate Vedic Peetam with peaceful AC hall & traditional Bhojanam kitchen. Full support for Anthyeshti, Masikam & yearly Samvatsarikam.',
    reviewsList: [
      {
        id: 'ar1',
        userName: 'Srinivasa Rao K.',
        rating: 5,
        ceremonyType: 'Abdikam / Samvatsarikam (Yearly)',
        date: '2026-10-14',
        comment: 'Very serene Peetam. Group of 3 purohits conducted our father’s Samvatsarikam with utmost devotion, and the 4-curry Bhojanam for 40 guests was spotless.',
      },
      {
        id: 'ar2',
        userName: 'Padmavathi M.',
        rating: 5,
        ceremonyType: 'Masikam (Monthly Ceremony)',
        date: '2026-11-02',
        comment: 'The 1-day-prior WhatsApp checklist meant zero last-minute tension for our family. Highly respectful team.',
      },
    ],
  },
  {
    id: 'ap2',
    name: 'Sri Gayatri Apara Vaidika Peetam',
    nameTe: 'శ్రీ గాయత్రీ అపర వైదిక పీఠం',
    image: OFFICIAL_LOGO,
    phone: '919949730175',
    organizerName: 'Pandit Narasimha Murthy',
    address: 'Near Lakaram Tank Bund, Wyra Road, Khammam – 507001',
    city: 'Khammam',
    lat: 17.2431,
    lng: 80.1582,
    services: [
      'Last Rites / Anthyeshti (1–13 Days)',
      'Masikam (Monthly Ceremony)',
      'Abdikam / Samvatsarikam (Yearly)',
      'Tila Homam & Shanti Karma',
    ],
    groupOptions: ['Single Purohit (1)', 'Group of 2 Purohits', 'Group of 3 Purohits'],
    supportsOnline: true,
    supportsHomeService: true,
    supportsVenueVisit: true,
    supportsFoodPackage: true,
    foodPresets: [
      '3 Curries & 3 Pickles + Sweets & Hot',
      '4 Curries & 4 Pickles + Sweets & Hot',
    ],
    maxGuestsAtVenue: 100,
    rating: 4.8,
    reviewCount: 196,
    experienceYears: 22,
    verified: true,
    bio: 'Specialized in peaceful home service and tranquil riverside Peetam ceremonies, offering both ritual-only and customizable Bhojanam packages.',
    reviewsList: [
      {
        id: 'ar3',
        userName: 'Ramesh Babu G.',
        rating: 5,
        ceremonyType: 'Last Rites / Anthyeshti (1–13 Days)',
        date: '2026-09-28',
        comment: 'During a difficult time for our family, their Group of 3 Purohits handled every samagri item and ritual calmly at our home.',
      },
    ],
  },
  {
    id: 'ap3',
    name: 'Godavari Pitru Karunya Peetam',
    nameTe: 'గోదావరి పితృ కారుణ్య పీఠం',
    image: OFFICIAL_LOGO,
    phone: '919949730175',
    organizerName: 'Brahmasri Suryanarayana Sarma',
    address: 'Mamillagudem Main Road, Khammam – 507001',
    city: 'Khammam',
    lat: 17.2489,
    lng: 80.1394,
    services: [
      'Abdikam / Samvatsarikam (Yearly)',
      'Masikam (Monthly Ceremony)',
      'Pinda Pradanam / Pitru Tharpanam',
      'Mahalaya Paksha Shraddham',
    ],
    groupOptions: ['Single Purohit (1)', 'Group of 2 Purohits', 'Group of 3 Purohits'],
    supportsOnline: true,
    supportsHomeService: true,
    supportsVenueVisit: true,
    supportsFoodPackage: true,
    foodPresets: [
      '3 Curries & 3 Pickles + Sweets & Hot',
      '4 Curries & 4 Pickles + Sweets & Hot',
      'Custom Menu (No Onion/Garlic Satvik)',
    ],
    maxGuestsAtVenue: 80,
    rating: 4.9,
    reviewCount: 152,
    experienceYears: 19,
    verified: true,
    bio: 'Known for strict Agamic & Dharma Shastra adherence, customizable sweet/hot & curry menus, and live NRI online Sankalpam coordination.',
    reviewsList: [
      {
        id: 'ar4',
        userName: 'Lakshmi Narayana V.',
        rating: 5,
        ceremonyType: 'Pinda Pradanam / Pitru Tharpanam',
        date: '2026-10-21',
        comment: 'We joined via Online mode from the US while our relatives attended at the Peetam. Seamless coordination.',
      },
    ],
  },
  {
    id: 'ap4',
    name: 'Sri Rama Bhadrachala Pitru Peetam',
    nameTe: 'శ్రీ రామ భద్రాచల పితృ పీఠం',
    image: OFFICIAL_LOGO,
    phone: '919949730175',
    organizerName: 'Sri Venkata Ramana Charyulu',
    address: 'Temple Ghat Road, Bhadrachalam – 507111',
    city: 'Bhadrachalam',
    lat: 17.6688,
    lng: 80.8936,
    services: [
      'Last Rites / Anthyeshti (1–13 Days)',
      'Abdikam / Samvatsarikam (Yearly)',
      'Pinda Pradanam / Pitru Tharpanam',
      'Tila Homam & Shanti Karma',
    ],
    groupOptions: ['Group of 2 Purohits', 'Group of 3 Purohits', 'Group of 5 Vedic Pandits'],
    supportsOnline: true,
    supportsHomeService: false,
    supportsVenueVisit: true,
    supportsFoodPackage: true,
    foodPresets: [
      '3 Curries & 3 Pickles + Sweets & Hot',
      '4 Curries & 4 Pickles + Sweets & Hot',
    ],
    maxGuestsAtVenue: 200,
    rating: 5.0,
    reviewCount: 412,
    experienceYears: 35,
    verified: true,
    bio: 'Sacred Godavari-bank Peetam at Bhadrachalam offering serene river-ghat Pinda Pradanam, Tila Homam, and large family Abdikam dining hall.',
    reviewsList: [
      {
        id: 'ar5',
        userName: 'Anuradha Devi P.',
        rating: 5,
        ceremonyType: 'Abdikam / Samvatsarikam (Yearly)',
        date: '2026-11-10',
        comment: 'Visited their Bhadrachalam venue with 75 family members. Everything from river rituals to traditional feast was deeply peaceful.',
      },
    ],
  },
];
