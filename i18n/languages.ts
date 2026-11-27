export type LanguageCode = 'en' | 'te';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  region: string;
  greeting: string;
}

export const PAN_INDIA_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'English Interface', greeting: 'Namaste! 🙏' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'తెలుగు (100% అనువాదం)', greeting: 'నమస్కారం! 🙏' },
];

export type TranslationKeys = {
  // Nav & Common
  navHome: string;
  navServices: string;
  navPurohits: string;
  navApara: string;
  navMarketplace: string;
  navAbout: string;
  navBook11: string;
  navLogin: string;
  navLogout: string;
  navProfile: string;
  navAdmin: string;
  announcementToken: string;
  announcementEssentials: string;
  announcementSupport: string;

  // Home Hero & Sections
  heroPill: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDesc: string;
  heroSearchPlaceholder: string;
  heroFindPurohit: string;
  heroPopularRituals: string;
  heroCardTitle: string;
  heroCardSub: string;
  heroCardB1: string;
  heroCardB2: string;
  heroCardB3: string;
  heroCardB4: string;
  heroBookNowBtn: string;
  homeServicesEyebrow: string;
  homeServicesTitle: string;
  homeServicesSub: string;
  homeAvailBadge: string;
  homeAvailTitle: string;
  homeAvailSub: string;
  homeViewAllPurohits: string;
  homeEssentialsTitle: string;
  homeEssentialsSub: string;
  homeExploreEssentials: string;
  homeRitualsTitle: string;
  homeMktTitle: string;
  homeMktSub: string;
  homeShopMkt: string;
  homeTestimonialsTitle: string;
  homeCtaTitle: string;
  homeCtaSub: string;

  // Common Labels & Cards
  verified: string;
  experience: string;
  poojasDone: string;
  available: string;
  statusLabel: string;
  bookingTokenLabel: string;
  directQuote: string;
  bookPurohit: string;
  viewProfile: string;
  addToCart: string;
  quickView: string;

  // Marketplace
  mktBadge: string;
  mktTitle: string;
  mktDesc: string;
  mktSearchPlaceholder: string;
  mktShowing: string;
  mktItemsWord: string;
  mktSortLabel: string;
  mktSortFeatured: string;
  mktSortLowHigh: string;
  mktSortHighLow: string;
  mktNoProducts: string;
  mktViewAll: string;
  catAll: string;
  catEssentials: string;
  catReturnGifts: string;
  catPowder: string;
  catItems: string;
  catFlowers: string;
  catPrasad: string;
  catThread: string;
  catCombo: string;

  // Services
  svcBadge: string;
  svcTitle: string;
  svcDesc: string;
  svcBrowseByCat: string;
  svcNadaswaramTitle: string;

  // Purohits
  purTitle: string;
  purDesc: string;
  purSearchPlaceholder: string;
  purAvail: string;
  purAll: string;
  purAvailNow: string;
  purAvailToday: string;
  purScheduled: string;
  purRitual: string;
  purAllRituals: string;
  purReset: string;

  // Apara + Splash
  aparaBadge: string;
  aparaTitle: string;
  aparaDesc: string;
  aparaDetectGps: string;
  aparaFilterTitle: string;
  aparaCeremonyType: string;
  aparaAllCeremonies: string;
  aparaSplashTitle: string;
  aparaSplashSub: string;
  aparaSplashP1Title: string;
  aparaSplashP1Desc: string;
  aparaSplashP2Title: string;
  aparaSplashP2Desc: string;
  aparaSplashP3Title: string;
  aparaSplashP3Desc: string;
  aparaSplashCta: string;
  aparaHowItWorks: string;

  // About
  aboutBadge: string;
  aboutTitle: string;
  aboutDesc: string;
  aboutMission: string;
  aboutPromise: string;
  aboutExplore: string;

  // Track Order
  trackTitle: string;
  trackDesc: string;
  trackPlaceholder: string;
  trackBtn: string;

  // Footer
  footerDesc: string;
  footerServices: string;
  footerQuickLinks: string;
  footerPolicies: string;
  footerTrackOrder: string;
  footerPrivacy: string;
  footerTerms: string;
  footerShipping: string;
  footerReturns: string;

  // Profile & Bookings
  myProfile: string;
  profileSubtitle: string;
  tabPersonal: string;
  tabBookings: string;
  tabLanguage: string;
  tabAddress: string;
  tabSecurity: string;
  tabNotifications: string;
  saveChanges: string;
  uploadPhoto: string;
  changePhoto: string;
  preferredLanguage: string;
  languageDesc: string;
  myBookingsTitle: string;
  noBookingsYet: string;

  // Auth / Register
  createAccount: string;
  existingSignIn: string;
  registerSubtitle: string;
  loginSubtitle: string;
  completeRegistration: string;

  // PadukaAI
  aiTitle: string;
  aiSubtitle: string;
  aiTabChat: string;
  aiTabBook: string;
  aiTabIssue: string;
  aiPlaceholder: string;
  aiWelcome: string;
  aiLanguageLabel: string;
};

const EN: TranslationKeys = {
  navHome: 'Home',
  navServices: 'Services',
  navPurohits: 'Purohits',
  navApara: 'Apara',
  navMarketplace: 'Marketplace',
  navAbout: 'About',
  navBook11: 'Book @ ₹11',
  navLogin: 'Login',
  navLogout: 'Logout',
  navProfile: 'My Profile',
  navAdmin: 'Admin',
  announcementToken: 'Book Verified Purohits at Just ₹11 Token',
  announcementEssentials: 'Everyday Pooja Essentials in Minutes',
  announcementSupport: 'English & తెలుగు (Telugu) · Full Support & End-to-End Care',

  heroPill: 'Verified Purohits Available · Confirm @ Just ₹11',
  heroTitleLine1: 'Sit Back & Relax.',
  heroTitleLine2: 'We Orchestrate Every Sacred Ritual.',
  heroDesc:
    'Pay just a ₹11 token — our verified Purohits will contact you shortly, and Guru Padukam hand-holds every step of your ritual with doorstep essentials so you stay tension-free and enjoy with your family.',
  heroSearchPlaceholder: 'Search: Vehicle Pooja, House Warming, Bhoomi Pooja, Vratha…',
  heroFindPurohit: 'Find Purohit',
  heroPopularRituals: 'Popular Rituals',
  heroCardTitle: '₹11 Token Booking',
  heroCardSub: '100% Transparent · Direct Dakshina',
  heroCardB1: "Pay just ₹11 to lock in your purohit's date & time",
  heroCardB2: 'Negotiate ritual dakshina directly with the purohit',
  heroCardB3: 'Everyday pooja essentials delivered in minutes',
  heroCardB4: 'Curated return gifts & complete event supplies',
  heroBookNowBtn: 'Book Purohit Now →',
  homeServicesEyebrow: 'Comprehensive Services',
  homeServicesTitle: 'Everything For Your Sacred Ceremonies',
  homeServicesSub: 'Spend your auspicious day enjoying rituals with relatives — we arrange and deliver everything else.',
  homeAvailBadge: 'Immediate Availability',
  homeAvailTitle: 'Book Verified Purohits @ ₹11 Token',
  homeAvailSub: 'Pay ₹11 token to confirm booking slot · Negotiate ritual dakshina directly with the purohit',
  homeViewAllPurohits: 'View All Purohits',
  homeEssentialsTitle: 'Essentials & Return Gifts',
  homeEssentialsSub: 'Need flowers, camphor, or vehicle pooja items right now? Or return gifts for guests?',
  homeExploreEssentials: 'Explore Essentials',
  homeRitualsTitle: 'All Rituals Assisted',
  homeMktTitle: 'Order Pooja Items of Your Choice',
  homeMktSub: '100% organic powders, sacred threads & ritual kits delivered to your door',
  homeShopMkt: 'Shop Marketplace',
  homeTestimonialsTitle: 'Trusted by Families',
  homeCtaTitle: 'Enjoy Your Event. We Assist You.',
  homeCtaSub: 'Book purohits at ₹11, order pooja items & return gifts, or call +91 99497 30175.',

  verified: 'Verified',
  experience: 'Experience',
  poojasDone: 'Poojas Done',
  available: 'Available',
  statusLabel: 'Status',
  bookingTokenLabel: 'Booking Token',
  directQuote: '₹11 · Direct Quote',
  bookPurohit: 'Book Purohit',
  viewProfile: 'View Profile & Photos',
  addToCart: 'Add to Cart',
  quickView: 'Quick View',

  mktBadge: 'Everyday Essentials Delivered in Minutes · Custom Return Gifts',
  mktTitle: 'Pooja Marketplace',
  mktDesc: 'Order pooja items of your own choice, get everyday essentials in minutes, and stock up on return gifts so you can enjoy rituals with relatives.',
  mktSearchPlaceholder: 'Search camphor, flowers, vehicle pooja kit, return gifts…',
  mktShowing: 'Showing',
  mktItemsWord: 'sacred items',
  mktSortLabel: 'Sort:',
  mktSortFeatured: 'Featured',
  mktSortLowHigh: 'Price: Low to High',
  mktSortHighLow: 'Price: High to Low',
  mktNoProducts: 'No products found',
  mktViewAll: 'View All Products',
  catAll: 'All Items',
  catEssentials: 'Essentials (In Minutes)',
  catReturnGifts: 'Return Gifts',
  catPowder: 'Sacred Powders',
  catItems: 'Pooja Kits',
  catFlowers: 'Fresh Flowers',
  catPrasad: 'Prasad & Sweets',
  catThread: 'Sacred Threads',
  catCombo: 'Combo Kits',

  svcBadge: 'Complete Ecosystem',
  svcTitle: 'All Pooja Services Under One Roof',
  svcDesc: 'Sit at home, relax, and explore gurupadukam.com. Confirm purohits with ₹11, order pooja items & return gifts, and get everyday essentials in minutes.',
  svcBrowseByCat: 'Browse by Category',
  svcNadaswaramTitle: 'Nadaswaram Troupes',

  purTitle: 'Book a Verified Purohit',
  purDesc: 'Pay just a ₹11 token — our Purohits will contact you shortly, decide the auspicious Muhurtham based on Nakshatram, and Guru Padukam schedules reminders & doorstep essentials.',
  purSearchPlaceholder: 'Search: Vehicle Pooja, House Warming, Bhoomi Pooja, Vratha…',
  purAvail: 'Availability',
  purAll: 'All Purohits',
  purAvailNow: 'Available Now',
  purAvailToday: 'Available Today',
  purScheduled: 'Scheduled',
  purRitual: 'Ritual / Occasion',
  purAllRituals: 'All Rituals',
  purReset: 'Reset Filters',

  aparaBadge: 'Last Rites · Masikam · Abdikam · Samvatsarikam (Yearly Ceremonies)',
  aparaTitle: 'Apara Seva & Pitru Peetas',
  aparaDesc: 'For Last Rites, Yearly (Samvatsarikam), Mahalaya Paksha, Masikam & Homas — pay just a ₹11 token. Purohits will contact you shortly, and Guru Padukam hand-holds every step with 2-day prior food customization & emergency team swap guarantee.',
  aparaDetectGps: 'Detect My GPS for Nearest Peetas',
  aparaFilterTitle: 'Filter by Need & Distance',
  aparaCeremonyType: 'Ceremony Type',
  aparaAllCeremonies: 'All Apara Ceremonies',
  aparaSplashTitle: 'Guru Padukam Apara Seva',
  aparaSplashSub: 'Dignified end-to-end arrangements for Last Rites, Masikam, Abdikam & Samvatsarikam.',
  aparaSplashP1Title: 'Verified Veda Peetas & Groups',
  aparaSplashP1Desc: 'Choose 2, 3, or 5 experienced Purohits by GPS distance, photos & reviews.',
  aparaSplashP2Title: 'Online, Home or Peeta Venue + Bhojanam',
  aparaSplashP2Desc: 'Custom food (3/4 curries & pickles, sweets) editable 2 days prior + 1-day WhatsApp alert.',
  aparaSplashP3Title: '₹11 Token & Emergency Swap Guarantee',
  aparaSplashP3Desc: 'Unlock Peeta contact, doorstep essentials & instant team replacement on emergencies.',
  aparaSplashCta: 'Continue to Apara Peetas →',
  aparaHowItWorks: 'How Apara Works',

  aboutBadge: 'Our Story · Guru Padukam (Udyam Enterprise)',
  aboutTitle: 'Born from Devotion. Built for Every Family.',
  aboutDesc: 'Sit at home, relax, and explore gurupadukam.com. From finding the right purohit to delivering everyday essentials and return gifts — we assist you in every ritual.',
  aboutMission: 'Enjoy the Rituals. Leave the Hassle to Us.',
  aboutPromise: 'Why Choose Guru Padukam?',
  aboutExplore: 'Explore Guru Padukam',

  trackTitle: 'Booking & Order Tracker',
  trackDesc: 'Enter your Booking ID (BKG..., APR..., ORD...) or 10-Digit Mobile Number.',
  trackPlaceholder: 'Enter Booking ID / Order ID or 10-digit Mobile Number…',
  trackBtn: 'Track',

  footerDesc: 'Sit at home and relax — explore gurupadukam.com for verified purohits, everyday pooja essentials in minutes, return gifts & full event support.',
  footerServices: 'Our Services',
  footerQuickLinks: 'Quick Links',
  footerPolicies: 'Policies & Legal',
  footerTrackOrder: 'Track Order',
  footerPrivacy: 'Privacy Policy',
  footerTerms: 'Terms & Conditions',
  footerShipping: 'Shipping & Delivery',
  footerReturns: 'Refund & Cancellation Policy',

  myProfile: 'My Profile',
  profileSubtitle: 'Manage your account details, categorized bookings, wallet & language.',
  tabPersonal: 'Personal Info',
  tabBookings: 'My Bookings',
  tabLanguage: 'Language',
  tabAddress: 'Address',
  tabSecurity: 'Security',
  tabNotifications: 'Notifications',
  saveChanges: 'Save Changes',
  uploadPhoto: 'Upload Profile Photo',
  changePhoto: 'Change Photo',
  preferredLanguage: 'Preferred Language (English / తెలుగు)',
  languageDesc: 'Switch 100% of Guru Padukam & PadukaAI between English and Telugu.',
  myBookingsTitle: 'My Ritual Bookings & Orders',
  noBookingsYet: 'No bookings or orders found yet. Book a Purohit or Apara Seva at just ₹11 token!',

  createAccount: 'Create Account (Required)',
  existingSignIn: 'Existing Sign In',
  registerSubtitle: 'Register your devotee account with verified contact details & language',
  loginSubtitle: 'Sign in to manage your ritual bookings & orders',
  completeRegistration: 'Complete Registration & Continue',

  aiTitle: 'PadukaAI Concierge',
  aiSubtitle: 'English & తెలుగు · Book · Track · Support',
  aiTabChat: 'Ask AI',
  aiTabBook: 'Book Priest',
  aiTabIssue: 'Report Issue',
  aiPlaceholder: 'Ask PadukaAI in English or Telugu…',
  aiWelcome:
    'Namaste! 🙏 I am PadukaAI, your Guru Padukam assistant (100% fluent in English & తెలుగు). Pay just ₹11 token via Cashfree — book a priest, check Apara Seva, or report a delay anytime!',
  aiLanguageLabel: 'Language',
};

const TE: TranslationKeys = {
  navHome: 'హోమ్',
  navServices: 'సేవలు',
  navPurohits: 'పురోహితులు',
  navApara: 'అపర కర్మలు',
  navMarketplace: 'పూజా సామగ్రి',
  navAbout: 'మా గురించి',
  navBook11: '₹11 బుకింగ్',
  navLogin: 'లాగిన్',
  navLogout: 'లాగౌట్',
  navProfile: 'నా ప్రొఫైల్',
  navAdmin: 'అడ్మిన్',
  announcementToken: 'ధృవీకరించబడిన పురోహితులను కేవలం ₹11 టోకెన్‌తో బుక్ చేయండి',
  announcementEssentials: 'నిత్య పూజా సామగ్రి నిమిషాల్లో ఇంటి వద్దకు',
  announcementSupport: 'English & తెలుగు (100% పూర్తి సహాయం)',

  heroPill: 'ధృవీకరించబడిన పురోహితులు అందుబాటులో ఉన్నారు · ₹11 టోకెన్',
  heroTitleLine1: 'నిశ్చింతగా ఉండండి.',
  heroTitleLine2: 'ప్రతి పవిత్ర కార్యాన్ని మేము నిర్వహిస్తాము.',
  heroDesc:
    'కేవలం ₹11 టోకెన్ చెల్లించండి — మా పురోహితులు మిమ్మల్ని త్వరలో సంప్రదించి, నక్షత్రం ప్రకారం ముహూర్తం నిర్ణయిస్తారు. గురు పాదుకం ప్రతి అడుగులో పూజా సామగ్రితో మీకు తోడుగా ఉంటుంది.',
  heroSearchPlaceholder: 'వెతకండి: వాహన పూజ, గృహప్రవేశం, భూమి పూజ, వ్రతం…',
  heroFindPurohit: 'పురోహితుడిని వెతకండి',
  heroPopularRituals: 'ప్రముఖ పూజలు',
  heroCardTitle: '₹11 టోకెన్ బుకింగ్',
  heroCardSub: '100% పారదర్శకం · నేరుగా దక్షిణ',
  heroCardB1: 'పురోహితుడి తేదీ & సమయం నిర్ధారించడానికి కేవలం ₹11 చెల్లించండి',
  heroCardB2: 'పూజ దక్షిణను పురోహితుడితో నేరుగా మాట్లాడుకోండి',
  heroCardB3: 'నిత్య పూజా సామగ్రి నిమిషాల్లో ఇంటి వద్దకు',
  heroCardB4: 'రిటర్న్ గిఫ్ట్స్ & పూర్తి పూజా వస్తువులు',
  heroBookNowBtn: 'పురోహితుడిని బుక్ చేయండి →',
  homeServicesEyebrow: 'సంపూర్ణ సేవలు',
  homeServicesTitle: 'మీ ప్రతి పవిత్ర వేడుక కోసం అన్నీ ఒకే చోట',
  homeServicesSub: 'మీ బంధువులతో కలిసి పూజలను ఆనందించండి — మిగతావన్నీ మేము ఏర్పాటు చేస్తాము.',
  homeAvailBadge: 'తక్షణ లభ్యత',
  homeAvailTitle: '₹11 టోకెన్‌తో ధృవీకరించబడిన పురోహితులు',
  homeAvailSub: 'కేవలం ₹11 తో స్లాట్ నిర్ధారించండి · దక్షిణ నేరుగా పురోహితుడితో మాట్లాడుకోండి',
  homeViewAllPurohits: 'అందరు పురోహితులను చూడండి',
  homeEssentialsTitle: 'నిత్య అవసరాలు & రిటర్న్ గిఫ్ట్స్',
  homeEssentialsSub: 'పువ్వులు, కర్పూరం, వాహన పూజ కిట్ లేదా అతిథులకు రిటర్న్ గిఫ్ట్స్ కావాలా?',
  homeExploreEssentials: 'అవసరాలు చూడండి',
  homeRitualsTitle: 'అన్ని పూజలకు సహాయం',
  homeMktTitle: 'మీకు నచ్చిన పూజా సామగ్రి ఆర్డర్ చేయండి',
  homeMktSub: '100% స్వచ్ఛమైన పూజా చూర్ణాలు, పవిత్ర దారాలు & పూజా కిట్లు ఇంటి వద్దకు',
  homeShopMkt: 'మార్కెట్ చూడండి',
  homeTestimonialsTitle: 'కుటుంబాల నమ్మకం',
  homeCtaTitle: 'వేడుకను ఆనందించండి. మేము సహాయం చేస్తాము.',
  homeCtaSub: '₹11 తో పురోహితుడిని బుక్ చేయండి లేదా +91 99497 30175 కు కాల్ చేయండి.',

  verified: 'ధృవీకరించబడింది',
  experience: 'అనుభవం',
  poojasDone: 'చేసిన పూజలు',
  available: 'అందుబాటులో',
  statusLabel: 'స్థితి',
  bookingTokenLabel: 'బుకింగ్ టోకెన్',
  directQuote: '₹11 · నేరుగా మాట్లాడండి',
  bookPurohit: 'పురోహితుడిని బుక్ చేయండి',
  viewProfile: 'ప్రొఫైల్ & ఫోటోలు',
  addToCart: 'కార్ట్‌లో వేయండి',
  quickView: 'త్వరిత వీక్షణ',

  mktBadge: 'నిత్య పూజా సామగ్రి నిమిషాల్లో డెలివరీ · రిటర్న్ గిఫ్ట్స్',
  mktTitle: 'పూజా సామగ్రి మార్కెట్',
  mktDesc: 'మీకు కావలసిన పూజా వస్తువులు, నిత్య అవసరాలు నిమిషాల్లో పొందండి మరియు కుటుంబ వేడుకల కోసం రిటర్న్ గిఫ్ట్స్ ఆర్డర్ చేయండి.',
  mktSearchPlaceholder: 'కర్పూరం, పువ్వులు, వాహన పూజ కిట్, రిటర్న్ గిఫ్ట్స్ వెతకండి…',
  mktShowing: 'చూపిస్తున్నది:',
  mktItemsWord: 'పవిత్ర వస్తువులు',
  mktSortLabel: 'క్రమం:',
  mktSortFeatured: 'ప్రత్యేకమైనవి',
  mktSortLowHigh: 'ధర: తక్కువ నుండి ఎక్కువ',
  mktSortHighLow: 'ధర: ఎక్కువ నుండి తక్కువ',
  mktNoProducts: 'వస్తువులు కనుగొనబడలేదు',
  mktViewAll: 'అన్ని వస్తువులు చూడండి',
  catAll: 'అన్నీ',
  catEssentials: 'నిత్య అవసరాలు (నిమిషాల్లో)',
  catReturnGifts: 'రిటర్న్ గిఫ్ట్స్',
  catPowder: 'పవిత్ర చూర్ణాలు',
  catItems: 'పూజా కిట్లు',
  catFlowers: 'తాజా పూలు',
  catPrasad: 'ప్రసాదం & మిఠాయిలు',
  catThread: 'పవిత్ర దారాలు',
  catCombo: 'కాంబో కిట్లు',

  svcBadge: 'సంపూర్ణ పూజా వ్యవస్థ',
  svcTitle: 'అన్ని పూజా సేవలు ఒకే చోట',
  svcDesc: 'ఇంట్లో నిశ్చింతగా ఉండి gurupadukam.com ద్వారా ₹11 తో పురోహితుడిని బుక్ చేయండి, పూజా సామగ్రి & రిటర్న్ గిఫ్ట్స్ పొందండి.',
  svcBrowseByCat: 'వర్గాల వారీగా చూడండి',
  svcNadaswaramTitle: 'నాదస్వరం బృందాలు',

  purTitle: 'ధృవీకరించబడిన పురోహితుడిని బుక్ చేయండి',
  purDesc: 'కేవలం ₹11 టోకెన్ చెల్లించండి — పురోహితులు త్వరలో మిమ్మల్ని సంప్రదించి నక్షత్రం ప్రకారం ముహూర్తం ఖరారు చేస్తారు. ప్రతి దశలో గురు పాదుకం మీకు అండగా ఉంటుంది.',
  purSearchPlaceholder: 'వెతకండి: వాహన పూజ, గృహప్రవేశం, భూమి పూజ, వ్రతం…',
  purAvail: 'అందుబాటు',
  purAll: 'అందరు పురోహితులు',
  purAvailNow: 'ఇప్పుడు అందుబాటులో',
  purAvailToday: 'ఈరోజు అందుబాటులో',
  purScheduled: 'షెడ్యూల్డ్',
  purRitual: 'పూజ / కార్యక్రమం',
  purAllRituals: 'అన్ని పూజలు',
  purReset: 'ఫిల్టర్లు క్లియర్ చేయండి',

  aparaBadge: 'అంత్యక్రియలు · మాసికం · అబ్దికం · సంవత్సరీకం',
  aparaTitle: 'అపర సేవ & పితృ పీఠాలు',
  aparaDesc: 'అంత్యక్రియలు, సంవత్సరీకం, మహాలయ పక్షం, మాసికం & హోమాల కోసం కేవలం ₹11 టోకెన్‌తో బుక్ చేయండి. 2 రోజుల ముందు వరకు భోజన మార్పులు మరియు అత్యవసర టీమ్ మార్పిడి హామీ.',
  aparaDetectGps: 'దగ్గరలో ఉన్న పీఠాల కోసం నా GPS గుర్తించండి',
  aparaFilterTitle: 'అవసరం & దూరం వారీగా ఫిల్టర్',
  aparaCeremonyType: 'కర్మ రకం',
  aparaAllCeremonies: 'అన్ని అపర కర్మలు',
  aparaSplashTitle: 'గురు పాదుకం అపర సేవ',
  aparaSplashSub: 'అంత్యక్రియలు, మాసికం, అబ్దికం & సంవత్సరీకం కోసం గౌరవప్రదమైన పూర్తి ఏర్పాట్లు.',
  aparaSplashP1Title: 'ధృవీకరించబడిన వేద పీఠాలు',
  aparaSplashP1Desc: 'GPS దూరం, ఫోటోలు & రివ్యూల ద్వారా 2, 3 లేదా 5 పురోహితులను ఎంచుకోండి.',
  aparaSplashP2Title: 'ఆన్‌లైన్, ఇల్లు లేదా పీఠం + భోజనం',
  aparaSplashP2Desc: '2 రోజుల ముందు వరకు మెనూ మార్పులు + 1 రోజు ముందు WhatsApp అలర్ట్.',
  aparaSplashP3Title: '₹11 టోకెన్ & అత్యవసర మార్పిడి హామీ',
  aparaSplashP3Desc: 'పీఠం ఫోన్ నంబర్ పొందండి మరియు అత్యవసర పరిస్థితిలో తక్షణ టీమ్ మార్పిడి.',
  aparaSplashCta: 'అపర పీఠాలను చూడండి →',
  aparaHowItWorks: 'అపర సేవ వివరాలు',

  aboutBadge: 'మా కథ · గురు పాదుకం (ఉద్యమ్ సంస్థ)',
  aboutTitle: 'భక్తితో ప్రారంభమైంది. ప్రతి కుటుంబం కోసం.',
  aboutDesc: 'ఇంట్లో నిశ్చింతగా ఉండండి — పురోహితుల బుకింగ్ నుండి పూజా సామగ్రి, రిటర్న్ గిఫ్ట్స్ వరకు ప్రతి పూజలో మేము తోడుంటాము.',
  aboutMission: 'పూజలను ఆనందించండి. ఏర్పాట్లు మాకు వదిలేయండి.',
  aboutPromise: 'గురు పాదుకం ఎందుకు?',
  aboutExplore: 'గురు పాదుకం చూడండి',

  trackTitle: 'బుకింగ్ & ఆర్డర్ ట్రాకర్',
  trackDesc: 'మీ బుకింగ్ ID (BKG..., APR..., ORD...) లేదా 10-అంకెల మొబైల్ నంబర్ నమోదు చేయండి.',
  trackPlaceholder: 'బుకింగ్ ID / ఆర్డర్ ID లేదా 10-అంకెల మొబైల్ నంబర్…',
  trackBtn: 'ట్రాక్ చేయండి',

  footerDesc: 'ఇంట్లో నిశ్చింతగా ఉండండి — ధృవీకరించబడిన పురోహితులు, నిమిషాల్లో పూజా సామగ్రి, రిటర్న్ గిఫ్ట్స్ & పూర్తి సహాయం.',
  footerServices: 'మా సేవలు',
  footerQuickLinks: 'త్వరిత లింకులు',
  footerPolicies: 'విధానాలు & నియమాలు',
  footerTrackOrder: 'ఆర్డర్ ట్రాక్ చేయండి',
  footerPrivacy: 'గోప్యతా విధానం',
  footerTerms: 'నిబంధనలు & షరతులు',
  footerShipping: 'డెలివరీ విధానం',
  footerReturns: 'రద్దు & రీఫండ్ విధానం',

  myProfile: 'నా ప్రొఫైల్',
  profileSubtitle: 'మీ ఖాతా వివరాలు, వర్గీకరించిన బుకింగ్‌లు, వాలెట్ & భాషను నిర్వహించండి.',
  tabPersonal: 'వ్యక్తిగత వివరాలు',
  tabBookings: 'నా బుకింగ్‌లు',
  tabLanguage: 'భాష',
  tabAddress: 'చిరునామా',
  tabSecurity: 'భద్రత',
  tabNotifications: 'నోటిఫికేషన్లు',
  saveChanges: 'మార్పులు సేవ్ చేయండి',
  uploadPhoto: 'ప్రొఫైల్ ఫోటో అప్‌లోడ్',
  changePhoto: 'ఫోటో మార్చండి',
  preferredLanguage: 'ఇష్టమైన భాష (English / తెలుగు)',
  languageDesc: 'గురు పాదుకం వెబ్‌సైట్ మరియు PadukaAI ని పూర్తిగా తెలుగు లేదా ఇంగ్లీషులో మార్చండి.',
  myBookingsTitle: 'నా పూజా బుకింగ్‌లు & ఆర్డర్లు',
  noBookingsYet: 'ఇంకా బుకింగ్‌లు లేవు. ₹11 టోకెన్‌తో పురోహితుడిని బుక్ చేయండి!',

  createAccount: 'ఖాతా సృష్టించండి',
  existingSignIn: 'సైన్ ఇన్ చేయండి',
  registerSubtitle: 'ధృవీకరించబడిన వివరాలు & భాషతో మీ ఖాతాను నమోదు చేయండి',
  loginSubtitle: 'మీ పూజా బుకింగ్‌లు & ఆర్డర్లను నిర్వహించడానికి సైన్ ఇన్ చేయండి',
  completeRegistration: 'నమోదు పూర్తి చేయండి',

  aiTitle: 'PadukaAI సహాయకుడు',
  aiSubtitle: 'English & తెలుగు · బుకింగ్ · ట్రాక్ · సహాయం',
  aiTabChat: 'AI ని అడగండి',
  aiTabBook: 'పురోహిత్ బుక్',
  aiTabIssue: 'సమస్య నివేదించండి',
  aiPlaceholder: 'తెలుగు లేదా ఇంగ్లీషులో అడగండి…',
  aiWelcome:
    'నమస్కారం! 🙏 నేను PadukaAI, మీ గురు పాదుకం సహాయకుడిని (పూర్తిగా తెలుగు & ఇంగ్లీషులో). కేవలం ₹11 టోకెన్‌తో పురోహితుడిని బుక్ చేయండి లేదా ఏ సహాయమైనా అడగండి!',
  aiLanguageLabel: 'భాష',
};

const DYNAMIC_TE_MAP: Record<string, string> = {
  // Occasions & Specializations
  'Vehicle Pooja': 'వాహన పూజ',
  'House Warming': 'గృహప్రవేశం',
  'Bhoomi / Shop Pooja': 'భూమి / దుకాణ పూజ',
  'Satyanarayan Vratha': 'సత్యనారాయణ వ్రతం',
  'Satyanarayan Pooja': 'సత్యనారాయణ పూజ',
  'Navaratris': 'నవరాత్రి పూజలు',
  'Vratha': 'వ్రతం',
  'Vivah': 'వివాహం',
  'Upanayanam': 'ఉపనయనం',
  'Namakarana': 'నామకరణం',
  'Annaprasana': 'అన్నప్రాశన',
  'Aksharabhyasam': 'అక్షరాభ్యాసం',
  'Devi Pooja': 'దేవి పూజ',
  'Sundara Kanda': 'సుందరకాండ పారాయణం',
  'Navagraha Pooja': 'నవగ్రహ పూజ',
  'Vastu Shanti': 'వాస్తు శాంతి',
  'Yagnam': 'యజ్ఞం',
  'Homa / Havana': 'హోమం / హవనం',
  'Rudra Abhishekam': 'రుద్రాభిషేకం',
  'Available Now': 'ఇప్పుడు అందుబాటులో',
  'Available Today': 'ఈరోజు అందుబాటులో',
  'Scheduled': 'షెడ్యూల్డ్',

  // Service category badges & descriptions
  '₹11 Token Booking': '₹11 టోకెన్ బుకింగ్',
  'In Minutes': 'నిమిషాల్లో డెలివరీ',
  'Event Ready': 'వేడుకలకు సిద్ధం',
  'Doorstep Delivery': 'ఇంటి వద్దకు డెలివరీ',
  'Custom Quote': 'కస్టమ్ కోట్',
  'Freshly Prepared': 'తాజాగా తయారైనవి',
  'Most Requested': 'ఎక్కువగా కోరేది',
  'Express Slot': 'తక్షణ స్లాట్',
  'Festival Special': 'పండుగ ప్రత్యేక ప్యాకేజీ',
  'Complete Care': 'సంపూర్ణ సహాయం',
  'Book with ₹11 token & negotiate directly with purohit': '₹11 టోకెన్‌తో బుక్ చేసి పురోహితుడితో నేరుగా మాట్లాడండి',
  'Camphor, oil, flowers & vehicle pooja kits in minutes': 'కర్పూరం, దీపం నూనె, పూలు & వాహన పూజా కిట్లు నిమిషాల్లో',
  'Customised tambulam & gift hampers for your guests': 'అతిథుల కోసం అందమైన తాంబూలం & రిటర్న్ గిఫ్ట్ ప్యాకెట్లు',
  'Traditional music ensembles for auspicious events': 'శుభకార్యాల కోసం సంప్రదాయ నాదస్వరం బృందాలు',
  'Order pure organic pooja items of your choice': '100% స్వచ్ఛమైన పూజా వస్తువులను మీ ఇష్టానుసారం ఆర్డర్ చేయండి',
  'Fresh floral mandap & home entrance decoration': 'తాజా పూలతో మండపం & ఇంటి తోరణాల అలంకరణ',
  'Traditional vratham prasad & sweets delivered fresh': 'సంప్రదాయ వ్రత ప్రసాదం & మిఠాయిలు ఇంటి వద్దకే',
  'Capture every sacred moment with your relatives': 'మీ బంధువులతో జరిగే ప్రతి శుభ సందర్భాన్ని ఫోటోలు తీస్తారు',

  // Product Badges
  '✓ 100% Organic': '✓ 100% సహజసిద్ధం',
  'Fresh Batch': 'తాజా బ్యాచ్',
  'Temple Grade': 'దేవాలయ శ్రేణి',
  'Desi Cow Homa': 'దేశీ ఆవు హోమ భస్మం',
  'Handcrafted': 'చేతితో తయారైనది',
  'Best Seller': 'బెస్ట్ సెల్లర్',
  'Full Ritual Kit': 'సంపూర్ణ పూజా కిట్',
  '⚡ Fresh in Minutes': '⚡ నిమిషాల్లో తాజాగా',
  '✓ 100% Pure': '✓ 100% స్వచ్ఛమైనది',
  '⚡ In Minutes': '⚡ నిమిషాల్లో డెలివరీ',
  '⚡ Express Delivery': '⚡ ఎక్స్‌ప్రెస్ డెలివరీ',
};

export function localizeDynamic(text: string, lang: LanguageCode): string {
  if (lang !== 'te') return text;
  return DYNAMIC_TE_MAP[text] || text;
}

export function getTranslation(lang: LanguageCode, key: keyof TranslationKeys): string {
  if (lang === 'te') return TE[key] || EN[key];
  return EN[key];
}

export function getLanguageMeta(lang: LanguageCode): LanguageOption {
  return PAN_INDIA_LANGUAGES.find(l => l.code === lang) || PAN_INDIA_LANGUAGES[0];
}
