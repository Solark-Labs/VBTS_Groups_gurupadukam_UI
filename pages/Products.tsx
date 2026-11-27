import React, { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { useAppContext } from '../contexts/AppContext';

export const Products: React.FC = () => {
  const { products } = useAppContext();
  const [filter, setFilter] = useState<'all' | 'powder' | 'thread' | 'combo'>('all');

  const filteredProducts = filter === 'all' ? products : products.filter(p => p.category === filter);

  return (
    <div className="min-h-screen bg-cream py-12 px-4 sm:px-8 pt-24">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-maroon tracking-widest uppercase">Divine Offerings</h1>
          <div className="font-telugu text-lg text-brown mt-2">మా పవిత్ర ఉత్పత్తులు</div>
          <div className="flex items-center justify-center gap-3 my-4 before:h-px before:w-16 before:bg-gradient-to-r before:from-transparent before:to-gold after:h-px after:w-16 after:bg-gradient-to-l after:from-transparent after:to-gold">
            <span className="text-gold text-xl">❁</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { id: 'all', label: 'All Products' },
            { id: 'powder', label: 'Sacred Powders' },
            { id: 'thread', label: 'Sacred Threads' },
            { id: 'combo', label: 'Combo Kits' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`font-cinzel text-xs tracking-widest uppercase px-5 py-2 border clip-btn transition-all ${
                filter === f.id 
                  ? 'bg-maroon text-gold-pale border-maroon' 
                  : 'bg-transparent text-text-md border-gold/30 hover:bg-maroon/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-text-md font-cinzel text-lg">
            No products found in this category.
          </div>
        )}

      </div>
    </div>
  );
};
