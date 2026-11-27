export type LanguageCode =
  | 'en'
  | 'hi'
  | 'te'
  | 'ta'
  | 'kn'
  | 'ml'
  | 'mr'
  | 'gu'
  | 'bn'
  | 'pa'
  | 'or'
  | 'as'
  | 'sa'
  | 'ur';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  region: string;
  greeting: string;
}

export const PAN_INDIA_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'Pan-India', greeting: 'Namaste! 🙏' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'North & Central India', greeting: 'नमस्ते! 🙏' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Telangana & Andhra Pradesh', greeting: 'నమస్కారం! 🙏' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Tamil Nadu & Puducherry', greeting: 'வணக்கம்! 🙏' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Karnataka', greeting: 'ನಮಸ್ಕಾರ! 🙏' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'Kerala', greeting: 'നമസ്കാരം! 🙏' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'Maharashtra & Goa', greeting: 'नमस्कार! 🙏' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Gujarat', greeting: 'નમસ્તે! 🙏' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'West Bengal & Tripura', greeting: 'নমস্কার! 🙏' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'Punjab & Chandigarh', greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! 🙏' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'Odisha', greeting: 'ନମସ୍କାର! 🙏' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', region: 'Assam & North-East', greeting: 'নমস্কাৰ! 🙏' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', region: 'Vedic Pan-India', greeting: 'प्रणम्य! 🙏' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', region: 'Pan-India', greeting: 'آداب! 🙏' },
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
  announcementSupport: 'Pan-India Multilingual Ritual & Event Assistance',

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
  purDesc: 'Pay just a ₹11 token — our Purohits will contact you shortly, and Guru Padukam hand-holds you at every step with doorstep ritual essentials so you stay tension-free with your family.',
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

  aboutBadge: 'Our Story · Pan-India Vedic Platform',
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
  footerReturns: 'Returns & Refunds',

  myProfile: 'My Profile',
  profileSubtitle: 'Manage your account details, bookings, photo, and Pan-India language preference.',
  tabPersonal: 'Personal Info',
  tabBookings: 'My Bookings',
  tabLanguage: 'Language',
  tabAddress: 'Address',
  tabSecurity: 'Security',
  tabNotifications: 'Notifications',
  saveChanges: 'Save Changes',
  uploadPhoto: 'Upload Profile Photo',
  changePhoto: 'Change Photo',
  preferredLanguage: 'Preferred Language (Pan-India)',
  languageDesc: 'Choose your preferred language for the website and PadukaAI Concierge across India.',
  myBookingsTitle: 'My Ritual Bookings & Orders',
  noBookingsYet: 'No bookings or orders found yet. Book a Purohit or Apara Seva at just ₹11 token!',

  createAccount: 'Create Account (Required)',
  existingSignIn: 'Existing Sign In',
  registerSubtitle: 'Register your devotee account with verified contact details & language',
  loginSubtitle: 'Sign in to manage your ritual bookings & orders',
  completeRegistration: 'Complete Registration & Continue',

  aiTitle: 'PadukaAI Concierge',
  aiSubtitle: 'Pan-India Multilingual · Book · Track · Report Delays',
  aiTabChat: 'Ask AI',
  aiTabBook: 'Book Priest',
  aiTabIssue: 'Report Issue',
  aiPlaceholder: 'Ask PadukaAI in any Indian language…',
  aiWelcome:
    'Namaste! 🙏 I am PadukaAI, your Pan-India Guru Padukam ritual concierge supporting 14 Indian languages. Pay just ₹11 token for full end-to-end support — ask me anything, book a priest, or report a delay.',
  aiLanguageLabel: 'AI Language',
};

export const TRANSLATIONS: Record<LanguageCode, Partial<TranslationKeys>> = {
  en: EN,
  te: {
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
    announcementSupport: 'పాన్-ఇండియా బహుభాషా పూజా సహాయం',

    heroPill: 'ధృవీకరించబడిన పురోహితులు అందుబాటులో ఉన్నారు · ₹11 టోకెన్',
    heroTitleLine1: 'నిశ్చింతగా ఉండండి.',
    heroTitleLine2: 'ప్రతి పవిత్ర కార్యాన్ని మేము నిర్వహిస్తాము.',
    heroDesc:
      'కేవలం ₹11 టోకెన్ చెల్లించండి — మా పురోహితులు మిమ్మల్ని త్వరలో సంప్రదిస్తారు మరియు గురు పాదుకం ప్రతి అడుగులో పూజా సామగ్రితో మీకు తోడుగా ఉంటుంది.',
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
    purDesc: 'కేవలం ₹11 టోకెన్ చెల్లించండి — పురోహితులు త్వరలో మిమ్మల్ని సంప్రదిస్తారు. ప్రతి దశలో గురు పాదుకం మీకు అండగా ఉంటుంది.',
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

    aboutBadge: 'మా కథ · పాన్-ఇండియా వైదిక వేదిక',
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
    footerReturns: 'రిటర్న్ & రిఫండ్',

    myProfile: 'నా ప్రొఫైల్',
    profileSubtitle: 'మీ ఖాతా వివరాలు, బుకింగ్‌లు, ఫోటో మరియు భాష ప్రాధాన్యతను నిర్వహించండి.',
    tabPersonal: 'వ్యక్తిగత వివరాలు',
    tabBookings: 'నా బుకింగ్‌లు',
    tabLanguage: 'భాష',
    tabAddress: 'చిరునామా',
    tabSecurity: 'భద్రత',
    tabNotifications: 'నోటిఫికేషన్లు',
    saveChanges: 'మార్పులు సేవ్ చేయండి',
    uploadPhoto: 'ప్రొఫైల్ ఫోటో అప్‌లోడ్',
    changePhoto: 'ఫోటో మార్చండి',
    preferredLanguage: 'ఇష్టమైన భాష (పాన్-ఇండియా)',
    languageDesc: 'వెబ్‌సైట్ మరియు PadukaAI కోసం మీకు ఇష్టమైన భారతీయ భాషను ఎంచుకోండి.',
    myBookingsTitle: 'నా పూజా బుకింగ్‌లు & ఆర్డర్లు',
    noBookingsYet: 'ఇంకా బుకింగ్‌లు లేవు. ₹11 టోకెన్‌తో పురోహితుడిని బుక్ చేయండి!',
    createAccount: 'ఖాతా సృష్టించండి',
    existingSignIn: 'సైన్ ఇన్ చేయండి',
    registerSubtitle: 'ధృవీకరించబడిన వివరాలు & భాషతో మీ ఖాతాను నమోదు చేయండి',
    loginSubtitle: 'మీ పూజా బుకింగ్‌లు & ఆర్డర్లను నిర్వహించడానికి సైన్ ఇన్ చేయండి',
    completeRegistration: 'నమోదు పూర్తి చేయండి',
    aiTitle: 'PadukaAI సహాయకుడు',
    aiSubtitle: '14 భారతీయ భాషలు · బుకింగ్ · ట్రాక్ · ఫిర్యాదు',
    aiTabChat: 'AI ని అడగండి',
    aiTabBook: 'పురోహిత్ బుక్',
    aiTabIssue: 'సమస్య నివేదించండి',
    aiPlaceholder: 'ఏ భారతీయ భాషలోనైనా అడగండి…',
    aiWelcome:
      'నమస్కారం! 🙏 నేను PadukaAI, మీ గురు పాదుకం పూజా సహాయకుడిని. 14 భారతీయ భాషల్లో సేవలు అందిస్తాను. కేవలం ₹11 టోకెన్‌తో పూర్తి సహాయం పొందండి.',
    aiLanguageLabel: 'AI భాష',
  },
  hi: {
    navHome: 'होम',
    navServices: 'सेवाएं',
    navPurohits: 'पुरोहित',
    navApara: 'अपरा कर्म',
    navMarketplace: 'पूजा सामग्री',
    navAbout: 'हमारे बारे में',
    navBook11: '₹11 बुकिंग',
    navLogin: 'लॉगिन',
    navLogout: 'लॉगआउट',
    navProfile: 'मेरी प्रोफ़ाइल',
    navAdmin: 'एडमिन',
    announcementToken: 'सत्यापित पुरोहित केवल ₹11 टोकन में बुक करें',
    announcementEssentials: 'दैनिक पूजा सामग्री मिनटों में घर पर',
    announcementSupport: 'अखिल भारतीय बहुभाषी पूजा सहायता',
    heroPill: 'सत्यापित पुरोहित उपलब्ध · केवल ₹11 में कन्फर्म करें',
    heroTitleLine1: 'निश्चिंत रहें।',
    heroTitleLine2: 'हम हर पवित्र अनुष्ठान की व्यवस्था करते हैं।',
    heroDesc:
      'केवल ₹11 टोकन दें — हमारे सत्यापित पुरोहित शीघ्र ही आपसे संपर्क करेंगे, और गुरु पादुकम हर कदम पर पूजा सामग्री के साथ आपका साथ देगा।',
    heroSearchPlaceholder: 'खोजें: वाहन पूजा, गृह प्रवेश, भूमि पूजा, व्रत…',
    heroFindPurohit: 'पुरोहित खोजें',
    heroPopularRituals: 'लोकप्रिय अनुष्ठान',
    heroCardTitle: '₹11 टोकन बुकिंग',
    heroCardSub: '100% पारदर्शी · सीधी दक्षिणा',
    heroBookNowBtn: 'पुरोहित बुक करें →',
    homeServicesTitle: 'आपके हर पवित्र अनुष्ठान के लिए संपूर्ण सेवाएं',
    homeAvailTitle: '₹11 टोकन पर सत्यापित पुरोहित बुक करें',
    homeViewAllPurohits: 'सभी पुरोहित देखें',
    homeEssentialsTitle: 'आवश्यक सामग्री और रिटर्न गिफ्ट्स',
    homeRitualsTitle: 'सभी अनुष्ठानों में सहायता',
    homeMktTitle: 'अपनी पसंद की पूजा सामग्री ऑर्डर करें',
    homeShopMkt: 'मार्केट देखें',
    homeTestimonialsTitle: 'परिवारों का विश्वास',
    homeCtaTitle: 'उत्सव का आनंद लें। सहायता हम करेंगे।',

    verified: 'सत्यापित',
    experience: 'अनुभव',
    poojasDone: 'संपन्न पूजाएं',
    available: 'उपलब्ध',
    statusLabel: 'स्थिति',
    bookingTokenLabel: 'बुकिंग टोकन',
    directQuote: '₹11 · सीधा संवाद',
    bookPurohit: 'पुरोहित बुक करें',
    viewProfile: 'प्रोफ़ाइल व फ़ोटो देखें',
    addToCart: 'कार्ट में जोड़ें',
    quickView: 'त्वरित देखें',

    mktBadge: 'दैनिक पूजा सामग्री मिनटों में · कस्टम रिटर्न गिफ्ट्स',
    mktTitle: 'पूजा सामग्री बाज़ार',
    mktDesc: 'अपनी पसंद की पूजा सामग्री, दैनिक आवश्यक वस्तुएं मिनटों में मंगवाएं और परिवार के साथ उत्सव मनाएं।',
    mktSearchPlaceholder: 'कपूर, फूल, वाहन पूजा किट, रिटर्न गिफ्ट्स खोजें…',
    mktShowing: 'दिखाया जा रहा है',
    mktItemsWord: 'पवित्र वस्तुएं',
    mktSortLabel: 'क्रम:',
    mktSortFeatured: 'विशेष',
    mktSortLowHigh: 'कीमत: कम से अधिक',
    mktSortHighLow: 'कीमत: अधिक से कम',
    mktNoProducts: 'कोई उत्पाद नहीं मिला',
    mktViewAll: 'सभी उत्पाद देखें',
    catAll: 'सभी वस्तुएं',
    catEssentials: 'दैनिक आवश्यकताएं',
    catReturnGifts: 'रिटर्न गिफ्ट्स',
    catPowder: 'पवित्र चूर्ण',
    catItems: 'पूजा किट',
    catFlowers: 'ताजे फूल',
    catPrasad: 'प्रसाद और मिठाई',
    catThread: 'पवित्र धागे',
    catCombo: 'कॉम्बो किट',

    svcBadge: 'संपूर्ण पूजा व्यवस्था',
    svcTitle: 'सभी पूजा सेवाएं एक ही छत के नीचे',
    svcDesc: 'घर बैठे ₹11 में पुरोहित बुक करें, पूजा सामग्री व रिटर्न गिफ्ट्स मंगवाएं।',
    svcBrowseByCat: 'श्रेणी के अनुसार देखें',
    svcNadaswaramTitle: 'नादस्वरम दल',

    purTitle: 'सत्यापित पुरोहित बुक करें',
    purDesc: 'केवल ₹11 टोकन दें — पुरोहित शीघ्र संपर्क करेंगे और गुरु पादुकम हर कदम पर आपका मार्गदर्शन करेगा।',
    purSearchPlaceholder: 'खोजें: वाहन पूजा, गृह प्रवेश, भूमि पूजा, व्रत…',
    purAvail: 'उपलब्धता',
    purAll: 'सभी पुरोहित',
    purAvailNow: 'अभी उपलब्ध',
    purAvailToday: 'आज उपलब्ध',
    purScheduled: 'निर्धारित',
    purRitual: 'पूजा / अवसर',
    purAllRituals: 'सभी अनुष्ठान',
    purReset: 'फ़िल्टर रीसेट करें',

    aparaBadge: 'अंतिम संस्कार · मासिकम · अब्दिकम · संवत्सरीकम',
    aparaTitle: 'अपरा सेवा और पितृ पीठ',
    aparaDesc: 'श्राद्ध, संवत्सरीकम, महालया पक्ष और होम के लिए केवल ₹11 टोकन में बुक करें। 2 दिन पहले तक भोजन बदलाव व आपातकालीन टीम बदलाव गारंटी।',
    aparaDetectGps: 'नजदीकी पीठ के लिए GPS का उपयोग करें',
    aparaFilterTitle: 'आवश्यकता और दूरी के अनुसार फ़िल्टर',
    aparaCeremonyType: 'कर्म प्रकार',
    aparaAllCeremonies: 'सभी अपरा कर्म',
    aparaSplashTitle: 'गुरु पादुकम अपरा सेवा',
    aparaSplashSub: 'अंतिम संस्कार, मासिकम, अब्दिकम और संवत्सरीकम की संपूर्ण व्यवस्था।',
    aparaSplashP1Title: 'सत्यापित वेद पीठ और समूह',
    aparaSplashP1Desc: 'GPS दूरी, फोटो और समीक्षाओं के आधार पर 2, 3 या 5 पुरोहित चुनें।',
    aparaSplashP2Title: 'ऑनलाइन, घर या पीठ स्थान + भोजन',
    aparaSplashP2Desc: '2 दिन पहले तक भोजन बदलाव और 1 दिन पहले WhatsApp रिमाइंडर।',
    aparaSplashP3Title: '₹11 टोकन और आपातकालीन बदलाव गारंटी',
    aparaSplashP3Desc: 'सीधा संपर्क प्राप्त करें, घर पर पूजा सामग्री व तुरंत टीम बदलाव।',
    aparaSplashCta: 'अपरा पीठ देखें →',
    aparaHowItWorks: 'अपरा सेवा विवरण',

    aboutBadge: 'हमारी कहानी · अखिल भारतीय वैदिक मंच',
    aboutTitle: 'भक्ति से जन्मा। हर परिवार के लिए निर्मित।',
    aboutDesc: 'घर बैठे निश्चिंत रहें — पुरोहित बुकिंग से लेकर पूजा सामग्री व रिटर्न गिफ्ट्स तक हम हर अनुष्ठान में आपके साथ हैं।',
    aboutMission: 'अनुष्ठान का आनंद लें। व्यवस्था हम पर छोड़ दें।',
    aboutPromise: 'गुरु पादुकम क्यों चुनें?',
    aboutExplore: 'गुरु पादुकम देखें',

    trackTitle: 'बुकिंग और ऑर्डर ट्रैकर',
    trackDesc: 'अपनी बुकिंग ID (BKG..., APR..., ORD...) या 10-अंकीय मोबाइल नंबर दर्ज करें।',
    trackPlaceholder: 'बुकिंग ID / ऑर्डर ID या 10-अंकीय मोबाइल नंबर दर्ज करें…',
    trackBtn: 'ट्रैक करें',

    footerDesc: 'घर बैठे निश्चिंत रहें — सत्यापित पुरोहित, मिनटों में पूजा सामग्री, रिटर्न गिफ्ट्स और पूर्ण सहायता।',
    footerServices: 'हमारी सेवाएं',
    footerQuickLinks: 'त्वरित लिंक',
    footerPolicies: 'नीतियां और नियम',
    footerTrackOrder: 'ऑर्डर ट्रैक करें',
    footerPrivacy: 'गोपनीयता नीति',
    footerTerms: 'नियम और शर्तें',
    footerShipping: 'शिपिंग और डिलीवरी',
    footerReturns: 'रिटर्न और रिफंड',

    myProfile: 'मेरी प्रोफ़ाइल',
    profileSubtitle: 'अपना विवरण, बुकिंग, फोटो और भाषा प्राथमिकता प्रबंधित करें।',
    tabPersonal: 'व्यक्तिगत जानकारी',
    tabBookings: 'मेरी बुकिंग',
    tabLanguage: 'भाषा',
    tabAddress: 'पता',
    tabSecurity: 'सुरक्षा',
    tabNotifications: 'सूचनाएं',
    saveChanges: 'बदलाव सहेजें',
    uploadPhoto: 'प्रोफ़ाइल फ़ोटो अपलोड करें',
    changePhoto: 'फ़ोटो बदलें',
    preferredLanguage: 'पसंदीदा भाषा (अखिल भारत)',
    languageDesc: 'वेबसाइट और PadukaAI के लिए अपनी पसंदीदा भारतीय भाषा चुनें।',
    myBookingsTitle: 'मेरी पूजा बुकिंग और ऑर्डर',
    noBookingsYet: 'अभी तक कोई बुकिंग नहीं मिली। केवल ₹11 टोकन में पुरोहित बुक करें!',
    createAccount: 'नया खाता बनाएं',
    existingSignIn: 'साइन इन करें',
    registerSubtitle: 'सत्यापित संपर्क विवरण और भाषा के साथ अपना खाता पंजीकृत करें',
    loginSubtitle: 'अपनी पूजा बुकिंग और ऑर्डर प्रबंधित करने के लिए साइन इन करें',
    completeRegistration: 'पंजीकरण पूरा करें',
    aiTitle: 'PadukaAI सहायक',
    aiSubtitle: '14 भारतीय भाषाएं · बुकिंग · ट्रैकिंग · सहायता',
    aiTabChat: 'AI से पूछें',
    aiTabBook: 'पुरोहित बुक करें',
    aiTabIssue: 'समस्या रिपोर्ट',
    aiPlaceholder: 'किसी भी भारतीय भाषा में पूछें…',
    aiWelcome:
      'नमस्ते! 🙏 मैं PadukaAI हूँ, आपका गुरु पादुकम अनुष्ठान सहायक। मैं 14 भारतीय भाषाओं में आपकी सहायता कर सकता हूँ। केवल ₹11 टोकन में पूरी पूजा सहायता पाएं।',
    aiLanguageLabel: 'AI भाषा',
  },
  ta: {
    navHome: 'முகப்பு',
    navServices: 'சேவைகள்',
    navPurohits: 'புரோகிதர்கள்',
    navApara: 'அபர கர்மா',
    navMarketplace: 'பூஜை பொருட்கள்',
    navAbout: 'எங்களைப் பற்றி',
    navBook11: '₹11 முன்பதிவு',
    navLogin: 'உள்நுழைக',
    navLogout: 'வெளியேறு',
    navProfile: 'என் சுயவிவரம்',
    navAdmin: 'நிர்வாகம்',
    announcementToken: 'சரிபார்க்கப்பட்ட புரோகிதர்களை ₹11 டோக்கனில் முன்பதிவு செய்யுங்கள்',
    announcementEssentials: 'பூஜை பொருட்கள் நிமிடங்களில் உங்கள் வீட்டிற்கு',
    announcementSupport: 'இந்தியா முழுவதும் பன்மொழி பூஜை உதவி',
    heroPill: 'சரிபார்க்கப்பட்ட புரோகிதர்கள் · ₹11 டோக்கன்',
    heroTitleLine1: 'கவலையின்றி இருங்கள்.',
    heroTitleLine2: 'ஒவ்வொரு புனித சடங்கையும் நாங்கள் நடத்துவோம்.',
    heroDesc: '₹11 டோக்கன் செலுத்துங்கள் — எங்கள் புரோகிதர்கள் உங்களைத் தொடர்பு கொள்வார்கள், மேலும் குரு பாதுகம் ஒவ்வொரு அடியிலும் பூஜை பொருட்களுடன் உதவும்.',
    heroSearchPlaceholder: 'தேடுங்கள்: வாகன பூஜை, கிரகப்பிரவேசம், பூமி பூஜை…',
    heroFindPurohit: 'புரோகிதரைத் தேடு',
    heroPopularRituals: 'பிரபல சடங்குகள்',
    homeServicesTitle: 'உங்கள் புனித சடங்குகளுக்கான அனைத்து சேவைகள்',
    homeAvailTitle: '₹11 டோக்கனில் புரோகிதர் முன்பதிவு',
    homeViewAllPurohits: 'அனைத்து புரோகிதர்கள்',
    homeEssentialsTitle: 'அத்தியாவசியங்கள் & ரிட்டர்ன் கிஃப்ட்ஸ்',
    homeMktTitle: 'பூஜை பொருட்களை ஆர்டர் செய்யுங்கள்',
    homeShopMkt: 'சந்தையைப் பார்க்கவும்',
    homeTestimonialsTitle: 'குடும்பங்களின் நம்பிக்கை',
    homeCtaTitle: 'நிகழ்வை மகிழ்ச்சியுடன் கொண்டாடுங்கள்.',
    verified: 'சரிபார்க்கப்பட்டது',
    experience: 'அனுபவம்',
    poojasDone: 'பூஜைகள்',
    available: 'கிடைக்கிறது',
    bookPurohit: 'புரோகிதர் பதிவு',
    viewProfile: 'சுயவிவரம் & புகைப்படங்கள்',
    addToCart: 'கார்ட்டில் சேர்',
    mktBadge: 'நிமிடங்களில் டெலிவரி · ரிட்டர்ன் கிஃப்ட்ஸ்',
    mktTitle: 'பூஜை பொருட்கள் சந்தை',
    mktDesc: 'உங்கள் விருப்பப்படி பூஜை பொருட்கள், அத்தியாவசியங்கள் மற்றும் ரிட்டர்ன் கிஃப்ட்ஸ் ஆர்டர் செய்யுங்கள்.',
    mktSearchPlaceholder: 'கற்பூரம், பூக்கள், பூஜை பொருட்கள் தேடுங்கள்…',
    catAll: 'அனைத்தும்',
    catEssentials: 'அத்தியாவசியங்கள்',
    catReturnGifts: 'ரிட்டர்ன் கிஃப்ட்ஸ்',
    catPowder: 'புனித பொடிகள்',
    catItems: 'பூஜை கிட்ஸ்',
    catFlowers: 'புதிய பூக்கள்',
    catPrasad: 'பிரசாதம் & இனிப்புகள்',
    catThread: 'புனித நூல்கள்',
    catCombo: 'காம்போ கிட்ஸ்',
    svcBadge: 'முழுமையான சேவை',
    svcTitle: 'அனைத்து பூஜை சேவைகளும் ஒரே இடத்தில்',
    svcDesc: '₹11 டோக்கன் மூலம் புரோகிதரை உறுதி செய்து, பூஜை பொருட்களைப் பெறுங்கள்.',
    svcBrowseByCat: 'பிரிவு வாரியாக பார்க்கவும்',
    purTitle: 'சரிபார்க்கப்பட்ட புரோகிதரை முன்பதிவு செய்யுங்கள்',
    purDesc: '₹11 டோக்கன் செலுத்துங்கள் — புரோகிதர் விரைவில் உங்களைத் தொடர்பு கொள்வார்.',
    aparaBadge: 'அந்திம சடங்குகள் · மாசிகம் · அப்திகம் · சம்வத்சரிகம்',
    aparaTitle: 'அபர சேவை & பித்ரு பீடங்கள்',
    aparaDesc: '₹11 டோக்கனில் முன்பதிவு செய்யுங்கள். 2 நாட்களுக்கு முன் உணவு மாற்றம் மற்றும் அவசர குழு மாற்றம் உறுதி.',
    aparaDetectGps: 'அருகிலுள்ள பீடங்களுக்கு GPS கண்டறியவும்',
    aparaSplashTitle: 'குரு பாதுகம் அபர சேவை',
    aparaSplashSub: 'அபர கர்மாக்கள், மாசிகம் மற்றும் அப்திகம் ஆகியவற்றிற்கு முழுமையான ஏற்பாடுகள்.',
    aparaSplashCta: 'அபர பீடங்களைப் பார்க்கவும் →',
    aboutTitle: 'பக்தியிலிருந்து பிறந்தது. ஒவ்வொரு குடும்பத்திற்கும்.',
    trackTitle: 'முன்பதிவு & ஆர்டர் டிராக்கர்',
    trackBtn: 'கண்காணிக்கவும்',
    footerServices: 'எங்கள் சேவைகள்',
    footerQuickLinks: 'விரைவு இணைப்புகள்',
    footerPolicies: 'கொள்கைகள் & விதிகள்',
    myProfile: 'என் சுயவிவரம்',
    tabPersonal: 'தனிப்பட்ட தகவல்',
    tabBookings: 'என் முன்பதிவுகள்',
    tabLanguage: 'மொழி',
    tabAddress: 'முகவரி',
    tabSecurity: 'பாதுகாப்பு',
    tabNotifications: 'அறிவிப்புகள்',
    saveChanges: 'சேமிக்கவும்',
    uploadPhoto: 'சுயவிவரப் படம் பதிவேற்றவும்',
    preferredLanguage: 'விருப்பமான மொழி',
    aiTitle: 'PadukaAI உதவியாளர்',
    aiTabChat: 'AI கேளுங்கள்',
    aiTabBook: 'புரோகிதர் பதிவு',
    aiTabIssue: 'புகார் அளிக்க',
    aiPlaceholder: 'எந்த இந்திய மொழியிலும் கேளுங்கள்…',
    aiWelcome: 'வணக்கம்! 🙏 நான் PadukaAI. 14 இந்திய மொழிகளில் உங்களுக்கு உதவத் தயாராக உள்ளேன்.',
  },
  kn: {
    navHome: 'ಮುಖಪುಟ',
    navServices: 'ಸೇವೆಗಳು',
    navPurohits: 'ಪುರೋಹಿತರು',
    navApara: 'ಅಪರ ಕರ್ಮ',
    navMarketplace: 'ಪೂಜಾ ಸಾಮಗ್ರಿ',
    navAbout: 'ನಮ್ಮ ಬಗ್ಗೆ',
    navBook11: '₹11 ಬುಕಿಂಗ್',
    navLogin: 'ಲಾಗಿನ್',
    navLogout: 'ಲಾಗ್ ಔಟ್',
    navProfile: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
    navAdmin: 'ನಿರ್ವಹಣೆ',
    announcementToken: 'ಪರಿಶೀಲಿಸಿದ ಪುರೋಹಿತರನ್ನು ಕೇವಲ ₹11 ಟೋಕನ್‌ನಲ್ಲಿ ಬುಕ್ ಮಾಡಿ',
    announcementEssentials: 'ನಿತ್ಯ ಪೂಜಾ ಸಾಮಗ್ರಿಗಳು ನಿಮಿಷಗಳಲ್ಲಿ ಮನೆ ಬಾಗಿಲಿಗೆ',
    announcementSupport: 'ಪ್ಯಾನ್-ಇಂಡಿಯಾ ಬಹುಭಾಷಾ ಪೂಜಾ ನೆರವು',
    heroTitleLine1: 'ನಿಶ್ಚಿಂತರಾಗಿರಿ.',
    heroTitleLine2: 'ಪ್ರತಿ ಪವಿತ್ರ ಪೂಜೆಯನ್ನು ನಾವು ನಿರ್ವಹಿಸುತ್ತೇವೆ.',
    heroDesc: 'ಕೇವಲ ₹11 ಟೋಕನ್ ಪಾವತಿಸಿ — ನಮ್ಮ ಪುರೋಹಿತರು ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತಾರೆ ಮತ್ತು ಗುರು ಪಾದುಕಂ ಪ್ರತಿ ಹಂತದಲ್ಲೂ ನೆರವಾಗುತ್ತದೆ.',
    heroFindPurohit: 'ಪುರೋಹಿತರನ್ನು ಹುಡುಕಿ',
    mktTitle: 'ಪೂಜಾ ಸಾಮಗ್ರಿ ಮಾರುಕಟ್ಟೆ',
    mktDesc: 'ಪೂಜಾ ವಸ್ತುಗಳು, ನಿತ್ಯ ಅವಶ್ಯಕತೆಗಳು ಮತ್ತು ರಿಟರ್ನ್ ಗಿಫ್ಟ್‌ಗಳನ್ನು ಆರ್ಡರ್ ಮಾಡಿ.',
    catAll: 'ಎಲ್ಲಾ ವಸ್ತುಗಳು',
    catEssentials: 'ಅವಶ್ಯಕತೆಗಳು',
    catReturnGifts: 'ರಿಟರ್ನ್ ಗಿಫ್ಟ್ಸ್',
    svcTitle: 'ಎಲ್ಲಾ ಪೂಜಾ ಸೇವೆಗಳು ಒಂದೇ ಸೂರಿನಡಿ',
    purTitle: 'ಪರಿಶೀಲಿಸಿದ ಪುರೋಹಿತರನ್ನು ಬುಕ್ ಮಾಡಿ',
    aparaTitle: 'ಅಪರ ಸೇವೆ ಮತ್ತು ಪಿತೃ ಪೀಠಗಳು',
    aparaSplashTitle: 'ಗುರು ಪಾದುಕಂ ಅಪರ ಸೇವೆ',
    aparaSplashCta: 'ಅಪರ ಪೀಠಗಳನ್ನು ನೋಡಿ →',
    trackTitle: 'ಬುಕಿಂಗ್ ಮತ್ತು ಆರ್ಡರ್ ಟ್ರ್ಯಾಕರ್',
    trackBtn: 'ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    myProfile: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
    tabPersonal: 'ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ',
    tabBookings: 'ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು',
    tabLanguage: 'ಭಾಷೆ',
    tabAddress: 'ವಿಳಾಸ',
    tabSecurity: 'ಭದ್ರತೆ',
    tabNotifications: 'ಸೂಚನೆಗಳು',
    saveChanges: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ',
    uploadPhoto: 'ಪ್ರೊಫೈಲ್ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    preferredLanguage: 'ಆದ್ಯತೆಯ ಭಾಷೆ',
    aiTitle: 'PadukaAI ಸಹಾಯಕ',
    aiTabChat: 'AI ಕೇಳಿ',
    aiTabBook: 'ಪುರೋಹಿತ ಬುಕ್',
    aiTabIssue: 'ಸಮಸ್ಯೆ ವರದಿ',
    aiWelcome: 'ನಮಸ್ಕಾರ! 🙏 ನಾನು PadukaAI. 14 ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.',
  },
  ml: {
    navHome: 'ഹോം',
    navServices: 'സേവനങ്ങൾ',
    navPurohits: 'പുരോഹിതർ',
    navApara: 'അപര കർമ്മം',
    navMarketplace: 'പൂജാ സാമഗ്രികൾ',
    navAbout: 'ഞങ്ങളെക്കുറിച്ച്',
    navBook11: '₹11 ബുക്കിംഗ്',
    navLogin: 'ലോഗിൻ',
    navLogout: 'ലോഗൗട്ട്',
    navProfile: 'എന്റെ പ്രൊഫൈൽ',
    announcementToken: '₹11 ടോക്കണിൽ പുരോഹിതരെ ബുക്ക് ചെയ്യൂ',
    heroTitleLine1: 'സമാധാനമായിരിക്കൂ.',
    heroTitleLine2: 'എല്ലാ പുണ്യകർമ്മങ്ങളും ഞങ്ങൾ ഒരുക്കാം.',
    heroDesc: '₹11 ടോക്കൺ നൽകൂ — ഞങ്ങളുടെ പുരോഹിതർ ഉടൻ ബന്ധപ്പെടും, ഗുരു പാദുകം എല്ലാ സഹായവും നൽകും.',
    heroFindPurohit: 'പുരോഹിതനെ കണ്ടെത്തുക',
    mktTitle: 'പൂജാ സാമഗ്രി വിപണി',
    catAll: 'എല്ലാം',
    svcTitle: 'എല്ലാ പൂജാ സേവനങ്ങളും ഒരിടത്ത്',
    purTitle: 'പുരോഹിതനെ ബുക്ക് ചെയ്യുക',
    aparaTitle: 'അപര സേവയും പിതൃ പീഠങ്ങളും',
    aparaSplashTitle: 'ഗുരു പാദുകം അപര സേവ',
    aparaSplashCta: 'അപര പീഠങ്ങൾ കാണുക →',
    trackTitle: 'ബുക്കിംഗ് & ഓർഡർ ട്രാക്കർ',
    myProfile: 'എന്റെ പ്രൊഫൈൽ',
    tabPersonal: 'വ്യക്തിഗത വിവരങ്ങൾ',
    tabBookings: 'എന്റെ ബുക്കിംഗുകൾ',
    tabLanguage: 'ഭാഷ',
    tabAddress: 'വിലാസം',
    tabSecurity: 'സുരക്ഷ',
    tabNotifications: 'അറിയിപ്പുകൾ',
    saveChanges: 'മാറ്റങ്ങൾ സേവ് ചെയ്യുക',
    uploadPhoto: 'പ്രൊഫൈൽ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക',
    preferredLanguage: 'ഇഷ്ടപ്പെട്ട ഭാഷ',
    aiTitle: 'PadukaAI സഹായി',
    aiWelcome: 'നമസ്കാരം! 🙏 ഞാൻ PadukaAI. 14 ഇന്ത്യൻ ഭാഷകളിൽ നിങ്ങളെ സഹായിക്കാം.',
  },
  mr: {
    navHome: 'मुख्यपृष्ठ',
    navServices: 'सेवा',
    navPurohits: 'पुरोहित',
    navApara: 'अपरा कर्म',
    navMarketplace: 'पूजा साहित्य',
    navAbout: 'आमच्याबद्दल',
    navBook11: '₹11 बुकिंग',
    navLogin: 'लॉगिन',
    navLogout: 'लॉगआउट',
    navProfile: 'माझे प्रोफाइल',
    announcementToken: 'केवळ ₹11 टोकनमध्ये सत्यापित पुरोहित बुक करा',
    heroTitleLine1: 'निश्चिंत राहा.',
    heroTitleLine2: 'प्रत्येक पवित्र विधीची आम्ही व्यवस्था करतो.',
    heroDesc: 'फक्त ₹11 टोकन भरा — आमचे पुरोहित लवकरच संपर्क साधतील आणि गुरु पादुकम सर्व साहित्य घरपोच देईल.',
    heroFindPurohit: 'पुरोहित शोधा',
    mktTitle: 'पूजा साहित्य बाजार',
    catAll: 'सर्व वस्तू',
    svcTitle: 'सर्व पूजा सेवा एकाच छताखाली',
    purTitle: 'सत्यापित पुरोहित बुक करा',
    aparaTitle: 'अपरा सेवा आणि पितृ पीठ',
    aparaSplashTitle: 'गुरु पादुकम अपरा सेवा',
    aparaSplashCta: 'अपरा पीठे पहा →',
    trackTitle: 'बुकिंग आणि ऑर्डर ट्रॅकर',
    myProfile: 'माझे प्रोफाइल',
    tabPersonal: 'वैयक्तिक माहिती',
    tabBookings: 'माझी बुकिंग्ज',
    tabLanguage: 'भाषा',
    tabAddress: 'पत्ता',
    tabSecurity: 'सुरक्षा',
    tabNotifications: 'सूचना',
    saveChanges: 'बदलाव जतन करा',
    uploadPhoto: 'प्रोफाइल फोटो अपलोड करा',
    preferredLanguage: 'पसंतीची भाषा',
    aiTitle: 'PadukaAI सहाय्यक',
    aiWelcome: 'नमस्कार! 🙏 मी PadukaAI आहे. मी १४ भारतीय भाषांमध्ये तुमची मदत करू शकतो.',
  },
  gu: {
    navHome: 'હોમ',
    navServices: 'સેવાઓ',
    navPurohits: 'પુરોહિતો',
    navApara: 'અપરા કર્મ',
    navMarketplace: 'પૂજા સામગ્રી',
    navAbout: 'અમારા વિશે',
    navBook11: '₹11 બુકિંગ',
    navLogin: 'લોગિન',
    navLogout: 'લોગઆઉટ',
    navProfile: 'મારી પ્રોફાઇલ',
    announcementToken: 'માત્ર ₹11 ટોકનમાં પ્રમાણિત પુરોહિત બુક કરો',
    heroTitleLine1: 'નિશ્ચિંત રહો.',
    heroTitleLine2: 'દરેક પવિત્ર વિધિની વ્યવસ્થા અમે કરીએ છીએ.',
    heroDesc: 'માત્ર ₹11 ટોકન ચૂકવો — અમારા પુરોહિતો ટૂંક સમયમાં તમારો સંપર્ક કરશે અને ગુરુ પાદુકમ દરેક પગલે મદદ કરશે.',
    heroFindPurohit: 'પુરોહિત શોધો',
    mktTitle: 'પૂજા સામગ્રી બજાર',
    catAll: 'બધી વસ્તુઓ',
    svcTitle: 'તમામ પૂજા સેવાઓ એક જ છત નીચે',
    purTitle: 'ચકાસાયેલ પુરોહિત બુક કરો',
    aparaTitle: 'અપરા સેવા અને પિતૃ પીઠ',
    aparaSplashTitle: 'ગુરુ પાદુકમ અપરા સેવા',
    aparaSplashCta: 'અપરા પીઠ જુઓ →',
    trackTitle: 'બુકિંગ અને ઓર્ડર ટ્રેકર',
    myProfile: 'મારી પ્રોફાઇલ',
    tabPersonal: 'વ્યક્તિગત માહિતી',
    tabBookings: 'મારી બુકિંગ્સ',
    tabLanguage: 'ભાષા',
    tabAddress: 'સરનામું',
    tabSecurity: 'સુરક્ષા',
    tabNotifications: 'સૂચનાઓ',
    saveChanges: 'ફેરફારો સાચવો',
    uploadPhoto: 'પ્રોફાઇલ ફોટો અપલોડ કરો',
    preferredLanguage: 'પસંદગીની ભાષા',
    aiTitle: 'PadukaAI સહાયક',
    aiWelcome: 'નમસ્તે! 🙏 હું PadukaAI છું. હું 14 ભારતીય ભાષાઓમાં મદદ કરી શકું છું.',
  },
  bn: {
    navHome: 'হোম',
    navServices: 'সেবাসমূহ',
    navPurohits: 'পুরোহিত',
    navApara: 'অপরা কর্ম',
    navMarketplace: 'পূজা সামগ্রী',
    navAbout: 'আমাদের সম্পর্কে',
    navBook11: '₹11 বুকিং',
    navLogin: 'লগইন',
    navLogout: 'লগআউট',
    navProfile: 'আমার প্রোফাইল',
    announcementToken: 'মাত্র ₹11 টোকেনে যাচাইকৃত পুরোহিত বুক করুন',
    heroTitleLine1: 'নিশ্চিন্ত থাকুন।',
    heroTitleLine2: 'প্রতিটি পবিত্র অনুষ্ঠান আমরাই পরিচালনা করি।',
    heroDesc: 'মাত্র ₹11 টোকেন দিন — আমাদের পুরোহিতরা শীঘ্রই যোগাযোগ করবেন এবং গুরু পাদুকম প্রতিটি ধাপে সাহায্য করবে।',
    heroFindPurohit: 'পুরোহিত খুঁজুন',
    mktTitle: 'পূজা সামগ্রী মার্কেটপ্লেস',
    catAll: 'সমস্ত সামগ্রী',
    svcTitle: 'সমস্ত পূজা সেবা এক ছাদের নিচে',
    purTitle: 'যাচাইকৃত পুরোহিত বুক করুন',
    aparaTitle: 'অপরা সেবা ও পিতৃ পীঠ',
    aparaSplashTitle: 'গুরু পাদুকম অপরা সেবা',
    aparaSplashCta: 'অপরা পীঠ দেখুন →',
    trackTitle: 'বুকিং ও অর্ডার ট্র্যাকার',
    myProfile: 'আমার প্রোফাইল',
    tabPersonal: 'ব্যক্তিগত তথ্য',
    tabBookings: 'আমার বুকিং',
    tabLanguage: 'ভাষা',
    tabAddress: 'ঠিকানা',
    tabSecurity: 'সুরক্ষা',
    tabNotifications: 'বিজ্ঞপ্তি',
    saveChanges: 'পরিবর্তন সংরক্ষণ করুন',
    uploadPhoto: 'প্রোফাইল ছবি আপলোড করুন',
    preferredLanguage: 'পছন্দের ভাষা',
    aiTitle: 'PadukaAI সহায়ক',
    aiWelcome: 'নমস্কার! 🙏 আমি PadukaAI। আমি ১৪টি ভারতীয় ভাষায় আপনাকে সাহায্য করতে পারি।',
  },
  pa: {
    navHome: 'ਮੁੱਖ ਪੰਨਾ',
    navServices: 'ਸੇਵਾਵਾਂ',
    navPurohits: 'ਪੁਰੋਹਿਤ',
    navApara: 'ਅਪਰਾ ਕਰਮ',
    navMarketplace: 'ਪੂਜਾ ਸਮੱਗਰੀ',
    navAbout: 'ਸਾਡੇ ਬਾਰੇ',
    navBook11: '₹11 ਬੁਕਿੰਗ',
    navLogin: 'ਲੌਗਇਨ',
    navLogout: 'ਲੌਗਆਉਟ',
    navProfile: 'ਮੇਰਾ ਪ੍ਰੋਫਾਈਲ',
    announcementToken: 'ਸਿਰਫ਼ ₹11 ਟੋਕਨ ਵਿੱਚ ਪ੍ਰਮਾਣਿਤ ਪੁਰੋਹਿਤ ਬੁੱਕ ਕਰੋ',
    heroTitleLine1: 'ਬੇਫ਼ਿਕਰ ਰਹੋ।',
    heroTitleLine2: 'ਅਸੀਂ ਹਰ ਪਵਿੱਤਰ ਰਸਮ ਦਾ ਪ੍ਰਬੰਧ ਕਰਦੇ ਹਾਂ।',
    heroDesc: 'ਸਿਰਫ਼ ₹11 ਟੋਕਨ ਦਿਓ — ਸਾਡੇ ਪੁਰੋਹਿਤ ਜਲਦੀ ਸੰਪਰਕ ਕਰਨਗੇ ਅਤੇ ਗੁਰੂ ਪਾਦੁਕਮ ਹਰ ਕਦਮ ਵਿੱਚ ਮਦਦ ਕਰੇਗਾ।',
    heroFindPurohit: 'ਪੁਰੋਹਿਤ ਲੱਭੋ',
    mktTitle: 'ਪੂਜਾ ਸਮੱਗਰੀ ਮਾਰਕੀਟ',
    catAll: 'ਸਾਰੀਆਂ ਵਸਤੂਆਂ',
    svcTitle: 'ਸਾਰੀਆਂ ਪੂਜਾ ਸੇਵਾਵਾਂ ਇੱਕ ਛੱਤ ਹੇਠ',
    purTitle: 'ਪ੍ਰਮਾਣਿਤ ਪੁਰੋਹਿਤ ਬੁੱਕ ਕਰੋ',
    aparaTitle: 'ਅਪਰਾ ਸੇਵਾ ਅਤੇ ਪਿਤਰ ਪੀਠ',
    aparaSplashTitle: 'ਗੁਰੂ ਪਾਦੁਕਮ ਅਪਰਾ ਸੇਵਾ',
    aparaSplashCta: 'ਅਪਰਾ ਪੀਠ ਦੇਖੋ →',
    trackTitle: 'ਬੁਕਿੰਗ ਅਤੇ ਆਰਡਰ ਟਰੈਕਰ',
    myProfile: 'ਮੇਰਾ ਪ੍ਰੋਫਾਈਲ',
    tabPersonal: 'ਨਿੱਜੀ ਜਾਣਕਾਰੀ',
    tabBookings: 'ਮੇਰੀਆਂ ਬੁਕਿੰਗਾਂ',
    tabLanguage: 'ਭਾਸ਼ਾ',
    tabAddress: 'ਪਤਾ',
    tabSecurity: 'ਸੁਰੱਖਿਆ',
    tabNotifications: 'ਸੂਚਨਾਵਾਂ',
    saveChanges: 'ਤਬਦੀਲੀਆਂ ਸੰਭਾਲੋ',
    uploadPhoto: 'ਪ੍ਰੋਫਾਈਲ ਫੋਟੋ ਅੱਪਲੋਡ ਕਰੋ',
    preferredLanguage: 'ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ',
    aiTitle: 'PadukaAI ਸਹਾਇਕ',
    aiWelcome: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! 🙏 ਮੈਂ PadukaAI ਹਾਂ, 14 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਲਈ ਤਿਆਰ ਹਾਂ।',
  },
  or: {
    navHome: 'ହୋମ୍',
    navServices: 'ସେବାଗୁଡ଼ିକ',
    navPurohits: 'ପୁରୋହିତ',
    navApara: 'ଅପରା କର୍ମ',
    navMarketplace: 'ପୂଜା ସାମଗ୍ରୀ',
    navAbout: 'ଆମ ବିଷୟରେ',
    navBook11: '₹11 ବୁକିଂ',
    navLogin: 'ଲଗଇନ୍',
    navLogout: 'ଲଗଆଉଟ୍',
    navProfile: 'ମୋ ପ୍ରୋଫାଇଲ୍',
    heroTitleLine1: 'ନିଶ୍ଚିନ୍ତ ରୁହନ୍ତୁ।',
    heroTitleLine2: 'ଆମେ ପ୍ରତ୍ୟେକ ପବିତ୍ର ପୂଜା ପରିଚାଳନା କରୁ।',
    heroDesc: 'କେବଳ ₹11 ଟୋକନ୍ ଦିଅନ୍ତୁ — ଆମର ପୁରୋହିତ ଶୀଘ୍ର ଯୋଗାଯୋଗ କରିବେ।',
    mktTitle: 'ପୂଜା ସାମଗ୍ରୀ ବଜାର',
    svcTitle: 'ସମସ୍ତ ପୂଜା ସେବା ଗୋଟିଏ ସ୍ଥାନରେ',
    purTitle: 'ପୁରୋହିତ ବୁକ୍ କରନ୍ତୁ',
    aparaTitle: 'ଅପରା ସେବା ଓ ପିତୃ ପୀଠ',
    aparaSplashTitle: 'ଗୁରୁ ପାଦୁକମ୍ ଅପରା ସେବା',
    aparaSplashCta: 'ଅପରା ପୀଠ ଦେଖନ୍ତୁ →',
    trackTitle: 'ବୁକିଂ ଓ ଅର୍ଡର ଟ୍ରାକର୍',
    myProfile: 'ମୋ ପ୍ରୋଫାଇଲ୍',
    tabPersonal: 'ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ',
    tabBookings: 'ମୋ ବୁକିଂ',
    tabLanguage: 'ଭାଷା',
    saveChanges: 'ସେଭ୍ କରନ୍ତୁ',
    aiTitle: 'PadukaAI ସହାୟକ',
    aiWelcome: 'ନମସ୍କାର! 🙏 ମୁଁ PadukaAI। 14ଟି ଭାରତୀୟ ଭାଷାରେ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିପାରିବି।',
  },
  as: {
    navHome: 'হোম',
    navServices: 'সেৱাসমূহ',
    navPurohits: 'পুৰোহিত',
    navApara: 'অপৰা কৰ্ম',
    navMarketplace: 'পূজা সামগ্ৰী',
    navAbout: 'আমাৰ বিষয়ে',
    navBook11: '₹11 বুকিং',
    navLogin: 'লগইন',
    navLogout: 'লগআউট',
    navProfile: 'মোৰ প্ৰফাইল',
    heroTitleLine1: 'নিশ্চিন্ত থাকক।',
    heroTitleLine2: 'আমি প্ৰতিটো পৱিত্ৰ পূজা পৰিচালনা কৰোঁ।',
    heroDesc: 'মাত্ৰ ₹11 টোকেন দিয়ক — আমাৰ পুৰোহিতসকলে শীঘ্ৰেই যোগাযোগ কৰিব।',
    mktTitle: 'পূজা সামগ্ৰী বজাৰ',
    svcTitle: 'সকলো পূজা সেৱা একেখন ছাদৰ তলত',
    purTitle: 'পুৰোহিত বুক কৰক',
    aparaTitle: 'অপৰা সেৱা আৰু পিতৃ পীঠ',
    aparaSplashTitle: 'গুৰু পাদুকম অপৰা সেৱা',
    aparaSplashCta: 'অপৰা পীঠ চাওক →',
    trackTitle: 'বুকিং আৰু অৰ্ডাৰ ট্ৰেকাৰ',
    myProfile: 'মোৰ প্ৰফাইল',
    tabPersonal: 'ব্যক্তিগত তথ্য',
    tabBookings: 'মোৰ বুকিং',
    tabLanguage: 'ভাষা',
    saveChanges: 'সংৰক্ষণ কৰক',
    aiTitle: 'PadukaAI সহায়ক',
    aiWelcome: 'নমস্কাৰ! 🙏 মই PadukaAI। ১৪টা ভাৰতীয় ভাষাত আপোনাক সহায় কৰিব পাৰোঁ।',
  },
  sa: {
    navHome: 'गृहम्',
    navServices: 'सेवाः',
    navPurohits: 'पुरोहिताः',
    navApara: 'अपरकर्म',
    navMarketplace: 'पूजासामग्री',
    navAbout: 'अस्माकं विषये',
    navBook11: '₹11 आरक्षणम्',
    navLogin: 'प्रवेशः',
    navLogout: 'निर्गमः',
    navProfile: 'मम विवरणम्',
    heroTitleLine1: 'निश्चिन्ताः भवन्तु।',
    heroTitleLine2: 'वयं सर्वं पवित्रं कर्म आयोजयामः।',
    heroDesc: 'केवलं ₹11 शुल्कं दत्त्वा पुरोहितान् आरक्षयन्तु — गुरुपादुकं सर्वत्र सहाय्यं करोति।',
    mktTitle: 'पूजासामग्री आपणः',
    svcTitle: 'सर्वाः पूजासेवाः एकस्मिन् स्थाने',
    purTitle: 'पुरोहितम् आरक्षयतु',
    aparaTitle: 'अपरसेवा पितृपीठानि च',
    aparaSplashTitle: 'गुरुपादुकम् अपरसेवा',
    aparaSplashCta: 'पीठानि पश्यतु →',
    trackTitle: 'आरक्षण-अनुसरणम्',
    myProfile: 'मम विवरणम्',
    tabPersonal: 'वैयक्तिकं विवरणम्',
    tabBookings: 'मम आरक्षणानि',
    tabLanguage: 'भाषा',
    saveChanges: 'रक्षतु',
    aiTitle: 'PadukaAI सहायकः',
    aiWelcome: 'प्रणम्य! 🙏 अहं PadukaAI अस्मि। चतुर्दश भारतीयभाषासु भवतां सहायतां करोमि।',
  },
  ur: {
    navHome: 'ہوم',
    navServices: 'خدمات',
    navPurohits: 'پروہت',
    navApara: 'اپرا کرم',
    navMarketplace: 'پوجا سامان',
    navAbout: 'ہمارے بارے میں',
    navBook11: '₹11 بکنگ',
    navLogin: 'لاگ ان',
    navLogout: 'لاگ آؤٹ',
    navProfile: 'میری پروفائل',
    heroTitleLine1: 'بے فکر رہیں۔',
    heroTitleLine2: 'ہم ہر مقدس رسم کا انتظام کرتے ہیں۔',
    heroDesc: 'صرف ₹11 ٹوکن ادا کریں — ہمارے پروہت جلد رابطہ کریں گے اور گرو پادوکم ہر قدم پر مدد کرے گا۔',
    mktTitle: 'پوجا سامان مارکیٹ',
    svcTitle: 'تمام پوجا خدمات ایک جگہ پر',
    purTitle: 'پروہت بک کریں',
    aparaTitle: 'اپرا سیوا اور پتر پیٹھ',
    aparaSplashTitle: 'گرو پادوکم اپرا سیوا',
    aparaSplashCta: 'اپرا پیٹھ دیکھیں →',
    trackTitle: 'بکنگ اور آرڈر ٹریکر',
    myProfile: 'میری پروفائل',
    tabPersonal: 'ذاتی معلومات',
    tabBookings: 'میری بکنگز',
    tabLanguage: 'زبان',
    saveChanges: 'محفوظ کریں',
    aiTitle: 'PadukaAI معاون',
    aiWelcome: 'آداب! 🙏 میں PadukaAI ہوں۔ میں 14 ہندوستانی زبانوں میں آپ کی مدد کر سکتا ہوں۔',
  },
};

export function getTranslation(lang: LanguageCode, key: keyof TranslationKeys): string {
  return TRANSLATIONS[lang]?.[key] || EN[key];
}

export function getLanguageMeta(lang: LanguageCode): LanguageOption {
  return PAN_INDIA_LANGUAGES.find(l => l.code === lang) || PAN_INDIA_LANGUAGES[0];
}
