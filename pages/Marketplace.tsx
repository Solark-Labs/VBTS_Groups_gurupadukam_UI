import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, ShoppingBag, Zap } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { SplashOverlay } from '../components/SplashOverlay';
import { useAppContext } from '../contexts/AppContext';
import { Product } from '../types';

type CategoryFilter = 'all' | Product['category'];

const CATEGORY_TABS: { id: CategoryFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'All Items', icon: '✨' },
  { id: 'essentials', label: 'Essentials (In Minutes)', icon: '⚡' },
  { id: 'return-gifts', label: 'Return Gifts', icon: '🎁' },
  { id: 'powder', label: 'Sacred Powders', icon: '🌿' },
  { id: 'items', label: 'Pooja Kits', icon: '🪔' },
  { id: 'flowers', label: 'Fresh Flowers', icon: '🌸' },
  { id: 'prasad', label: 'Prasad & Sweets', icon: '🍮' },
  { id: 'thread', label: 'Sacred Threads', icon: '🧵' },
  { id: 'combo', label: 'Combo Kits', icon: '📦' },
];

export const Marketplace: React.FC = () => {
  const { products, addToCart, t, language } = useAppContext();

  const translatedTabs: { id: CategoryFilter; label: string; icon: string }[] = [
    { id: 'all', label: t('catAll'), icon: '✨' },
    { id: 'essentials', label: t('catEssentials'), icon: '⚡' },
    { id: 'return-gifts', label: t('catReturnGifts'), icon: '🎁' },
    { id: 'powder', label: t('catPowder'), icon: '🌿' },
    { id: 'items', label: t('catItems'), icon: '🪔' },
    { id: 'flowers', label: t('catFlowers'), icon: '🌸' },
    { id: 'prasad', label: t('catPrasad'), icon: '🍮' },
    { id: 'thread', label: t('catThread'), icon: '🧵' },
    { id: 'combo', label: t('catCombo'), icon: '📦' },
  ];
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = (searchParams.get('cat') as CategoryFilter) || 'all';

  const [filter, setFilter] = useState<CategoryFilter>(initialCat);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('gp_marketplace_splash_seen') !== '1';
    } catch {
      return false;
    }
  });
  const dismissSplash = () => {
    try {
      sessionStorage.setItem('gp_marketplace_splash_seen', '1');
    } catch {
      // Ignore storage error
    }
    setShowSplash(false);
  };
  const isTe = language === 'te';

  useEffect(() => {
    const paramCat = searchParams.get('cat') as CategoryFilter | null;
    if (paramCat) {
      setFilter(paramCat);
    }
  }, [searchParams]);

  const handleCategoryChange = (cat: CategoryFilter) => {
    setFilter(cat);
    if (cat === 'all') {
      searchParams.delete('cat');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ cat });
    }
  };

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = products.filter(p => {
      const matchCat = filter === 'all' || p.category === filter;
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.nameTe.includes(q) || p.desc.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, filter, search, sortBy]);

  return (
    <div className="min-h-screen bg-cream pt-[100px]">
      <SplashOverlay
        visible={showSplash}
        onDismiss={dismissSplash}
        eyebrow={isTe ? 'గురు పాదుకం · భాగస్వామి పూజా స్టోర్‌లు' : 'Guru Padukam · Partner Pooja Stores'}
        title={isTe ? 'నిమిషాల్లో పవిత్ర పూజా సామగ్రి' : 'Pure Samagri & Fresh Flowers'}
        subtitle={
          isTe
            ? 'స్థానిక భాగస్వామి పూజా స్టోర్‌ల ద్వారా నేరుగా మీ ఇంటి వద్దకు డెలివరీ — ప్రతి సమస్యలో మా బృందం మీ వెంటే.'
            : 'Fulfilled directly by verified local Pooja Stores — transparent merchant accountability with full Guru Padukam support.'
        }
        features={
          isTe
            ? [
                { icon: '🏪', title: 'స్టోర్ యజమాని ప్రత్యక్ష బాధ్యత', desc: 'పూజా సామగ్రి నాణ్యత & డెలివరీకి సంబంధిత భాగస్వామి స్టోర్ పూర్తి బాధ్యత వహిస్తుంది.' },
                { icon: '🔒', title: 'ఆర్డర్ ప్యాక్ అయిన తర్వాత రద్దు వీలు లేదు', desc: 'తాజా పుష్పాలు, ప్రసాదం & పూజా కిట్‌లు తక్షణమే ప్యాక్ చేయబడతాయి.' },
                { icon: '🤝', title: 'మీ తరపున వ్యాపారితో మేము మాట్లాడతాము', desc: 'ఏదైనా తేడా లేదా డ్యామేజ్ ఉంటే గురు పాదుకం బృందం నేరుగా స్టోర్‌తో మాట్లాడి సహాయం చేస్తుంది.' },
              ]
            : [
                { icon: '🏪', title: 'Direct Partner Store Fulfillment', desc: 'Local Pooja Store merchants hold sole responsibility for purity, packing, and delivery.' },
                { icon: '🔒', title: 'No Cancellation Once Packed', desc: 'Express flowers, sweets & samagri kits begin packing immediately upon merchant acceptance.' },
                { icon: '🤝', title: 'Guru Padukam Speaks to Stores For You', desc: 'If an item is damaged or missing, our team advocates directly with the store merchant.' },
              ]
        }
        ctaLabel={isTe ? 'పూజా సామగ్రి చూడండి →' : 'Browse Pooja Marketplace →'}
      />

      {/* HERO */}
      <section className="bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk py-14 px-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 opacity-5 pointer-events-none bg-contain bg-no-repeat bg-center" style={{ backgroundImage: "url('/logo.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-dk via-maroon-dk/85 to-maroon/60" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 border border-gold/30 bg-gold/10 px-4 py-1.5 rounded-full mb-4">
            <Zap size={13} className="text-gold" />
            <span className="font-cinzel text-[0.62rem] font-bold tracking-[0.2em] uppercase text-gold-lt">
              {t('mktBadge')}
            </span>
          </div>
          <h1 className="font-cinzelDeco text-[clamp(2rem,5vw,3.6rem)] font-bold text-cream mb-3 drop-shadow-xl">
            {t('mktTitle')}
          </h1>
          <p className="font-garamond text-xl text-cream/75 max-w-2xl mx-auto italic mb-7">
            {t('mktDesc')}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 max-w-2xl mx-auto">
            <div className="flex items-stretch flex-1 shadow-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-lt" size={16} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t('mktSearchPlaceholder')}
                  className="w-full pl-10 pr-4 py-3.5 bg-white/95 text-maroon-dk font-garamond focus:outline-none focus:ring-2 focus:ring-gold/60"
                />
              </div>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="bg-white/95 px-4 text-maroon hover:text-maroon-dk border-l border-gold/20"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowSplash(true)}
              className="px-4 py-3 border border-gold/40 bg-maroon-dk/70 text-gold-lt font-cinzel text-xs font-bold uppercase tracking-wider hover:bg-gold/20 transition-colors shrink-0"
            >
              ✦ {isTe ? 'స్టోర్ విధానం' : 'Store Policy Guide'}
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-8">
          {translatedTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleCategoryChange(tab.id)}
              className={`font-cinzel text-[0.65rem] font-bold tracking-widest uppercase px-4 py-2.5 border clip-btn transition-all flex items-center gap-2 ${
                filter === tab.id
                  ? 'bg-maroon text-gold-pale border-maroon shadow-md'
                  : 'bg-white text-text-md border-gold/25 hover:border-maroon/40 hover:text-maroon'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 pb-4 border-b border-gold/15">
          <p className="font-cinzel text-xs tracking-widest uppercase text-text-md">
            {t('mktShowing')} <strong className="text-maroon">{filteredProducts.length}</strong> {t('mktItemsWord')}
          </p>
          <div className="flex items-center gap-3">
            <label className="font-cinzel text-[0.65rem] tracking-widest uppercase text-text-lt">{t('mktSortLabel')}</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gold/30 bg-white font-cinzel text-xs text-maroon focus:outline-none focus:border-maroon rounded-sm"
            >
              <option value="featured">{t('mktSortFeatured')}</option>
              <option value="price-asc">{t('mktSortLowHigh')}</option>
              <option value="price-desc">{t('mktSortHighLow')}</option>
            </select>
          </div>
        </div>

        {/* Store Partner & Marketplace Policy Banner */}
        <div className="mb-8 bg-amber-50/80 border border-amber-200 rounded-md p-4 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <strong>
              {language === 'te' ? '🏪 భాగస్వామి పూజా స్టోర్ ఆర్డర్ సమాచారం:' : '🏪 Partner Pooja Store Orders & Cancellation Policy:'}
            </strong>{' '}
            {language === 'te'
              ? 'ఆర్డర్ నాణ్యత & డెలివరీకి సంబంధిత స్టోర్ యజమాని పూర్తిగా బాధ్యత వహిస్తారు (ఆర్డర్ సిద్ధమైన తర్వాత రద్దు వీలు లేదు). ఏదైనా సమస్య ఉంటే గురు పాదుకం బృందం మీ తరపున స్టోర్ యజమానితో మాట్లాడి పరిష్కారానికి సహాయం చేస్తుంది.'
              : 'Partner store owners are solely responsible for order preparation, quality & fulfillment (orders cannot be cancelled once accepted/packed). Should any issue occur, Guru Padukam’s Support Team speaks directly with the merchant on your behalf.'}
          </div>
          <a
            href="#/return-policy"
            className="text-maroon font-bold underline shrink-0"
          >
            {language === 'te' ? 'విధానం చదవండి →' : 'Read Refund Policy →'}
          </a>
        </div>

        {/* Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-white border border-gold/15 rounded-sm">
            <p className="font-cinzel text-lg text-maroon mb-2">{t('mktNoProducts')}</p>
            <p className="font-garamond text-text-md italic mb-6">{t('mktDesc')}</p>
            <button
              onClick={() => { handleCategoryChange('all'); setSearch(''); }}
              className="bg-maroon text-gold-pale font-cinzel text-xs tracking-widest uppercase px-6 py-2.5 clip-btn"
            >
              {t('mktViewAll')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-text-dk/80 backdrop-blur-sm animate-fade-in" onClick={() => setQuickViewProduct(null)}>
          <div className="relative w-full max-w-2xl bg-cream shadow-2xl rounded-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-gold/20" onClick={e => e.stopPropagation()}>
            <button onClick={() => setQuickViewProduct(null)} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 text-maroon flex items-center justify-center hover:bg-maroon hover:text-white transition-colors">
              <X size={16} />
            </button>
            <div className="bg-[#F5F2EB] aspect-square md:aspect-auto">
              <img src={quickViewProduct.image} alt={quickViewProduct.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 flex flex-col justify-between">
              <div>
                {quickViewProduct.badge && (
                  <span className="inline-block font-cinzel text-[0.55rem] font-bold tracking-[0.2em] uppercase px-2.5 py-1 bg-maroon/10 text-maroon border border-gold/20 mb-3">
                    {quickViewProduct.badge.text}
                  </span>
                )}
                <h2 className="font-cinzel text-xl font-bold text-maroon uppercase tracking-wide">{quickViewProduct.name}</h2>
                <p className="font-telugu text-sm text-text-md mt-1">{quickViewProduct.nameTe}</p>
                <div className="flex items-baseline gap-3 mt-4">
                  <span className="font-cinzel text-2xl font-bold text-maroon">₹{quickViewProduct.price}</span>
                  {quickViewProduct.origPrice > quickViewProduct.price && (
                    <span className="text-sm text-gray-400 line-through">₹{quickViewProduct.origPrice}</span>
                  )}
                  {quickViewProduct.discount && (
                    <span className="text-xs font-cinzel font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-sm">{quickViewProduct.discount}</span>
                  )}
                </div>
                <p className="font-garamond text-base text-text-dk leading-relaxed mt-4">{quickViewProduct.desc}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-gold/15">
                <button
                  onClick={() => { addToCart(quickViewProduct, 1); setQuickViewProduct(null); }}
                  disabled={quickViewProduct.stock === 0}
                  className="w-full py-3.5 bg-maroon text-gold-pale font-cinzel text-xs font-bold tracking-widest uppercase clip-btn hover:bg-maroon-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingBag size={16} /> {quickViewProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
