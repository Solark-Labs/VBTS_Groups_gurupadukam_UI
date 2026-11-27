import React from 'react';
import { Product } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { ShoppingBag, Eye } from 'lucide-react';
import { localizeDynamic } from '../i18n/languages';

interface Props {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<Props> = ({ product, onQuickView }) => {
  const { addToCart, language, t } = useAppContext();

  return (
    <div className="group cursor-pointer flex flex-col h-full relative">
      
      {/* Minimal Badge */}
      {product.badge && (
        <div className="absolute top-4 left-4 z-10 font-cinzel text-[0.55rem] font-bold tracking-[0.2em] uppercase px-3 py-1 bg-white/90 backdrop-blur-sm text-maroon border border-gold/20 shadow-sm">
          {localizeDynamic(product.badge.text, language)}
        </div>
      )}

      {/* Image Container */}
      <div className="w-full aspect-[4/5] overflow-hidden bg-[#F5F2EB] relative rounded-sm">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 mix-blend-multiply"
          loading="lazy"
        />
        
        {/* Action Overlay (visible on mobile/touch, hover-enhanced on desktop) */}
        <div className="absolute inset-x-0 bottom-0 md:inset-0 bg-gradient-to-t from-maroon-dk/70 via-maroon-dk/20 to-transparent md:bg-maroon-dk/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-3 p-3 md:p-0 md:backdrop-blur-[2px]">
          {onQuickView && (
            <button 
              type="button"
              aria-label={t('quickView')}
              onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-maroon flex items-center justify-center hover:bg-gold hover:text-white transition-colors shadow-lg md:transform md:translate-y-4 md:group-hover:translate-y-0 duration-500"
              title={t('quickView')}
            >
              <Eye size={18} />
            </button>
          )}
          <button 
            type="button"
            aria-label={t('addToCart')}
            onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
            disabled={product.stock === 0}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-maroon text-gold-pale flex items-center justify-center hover:bg-gold hover:text-white transition-colors shadow-lg md:transform md:translate-y-4 md:group-hover:translate-y-0 duration-500 delay-75 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('addToCart')}
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-5 flex flex-col flex-grow text-center">
        <div className="font-cinzel text-sm font-bold tracking-widest text-text-dk group-hover:text-maroon transition-colors uppercase">
          {language === 'te' && product.nameTe ? product.nameTe : product.name}
        </div>
        <div className="font-telugu text-[0.65rem] text-text-md mt-1.5 opacity-70">
          {language === 'te' ? product.name : product.nameTe}
        </div>
        
        <div className="mt-auto pt-4 flex items-center justify-center gap-3">
          <span className="font-cinzel text-base font-bold text-maroon">₹{product.price.toLocaleString('en-IN')}</span>
          {product.origPrice > product.price && (
            <span className="text-xs text-gray-400 line-through font-medium">₹{product.origPrice.toLocaleString('en-IN')}</span>
          )}
        </div>
        
        {product.stock < 10 && product.stock > 0 && (
          <div className="text-[0.6rem] text-red-500 font-bold mt-2 tracking-widest uppercase">
            {language === 'te' ? `కేవలం ${product.stock} మాత్రమే ఉన్నాయి` : `Only ${product.stock} left`}
          </div>
        )}
      </div>
    </div>
  );
};
