import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

export const NotFound: React.FC = () => {
  const { language } = useAppContext();
  const isTe = language === 'te';

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 pt-28 pb-16">
      <div className="max-w-lg w-full bg-white border border-gold/30 rounded-lg p-8 text-center shadow-md space-y-5">
        <div className="font-cinzel text-5xl font-bold text-maroon">404</div>
        <h1 className="font-serif text-2xl font-bold text-maroon">
          {isTe ? 'పేజీ కనుగొనబడలేదు' : 'Page Not Found'}
        </h1>
        <p className="text-sm text-text-md">
          {isTe
            ? 'మీరు వెతుకుతున్న పేజీ అందుబాటులో లేదు లేదా మార్చబడి ఉండవచ్చు.'
            : 'The page you are looking for does not exist or may have moved.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-maroon text-gold-pale px-5 py-2.5 text-xs font-cinzel font-bold uppercase tracking-wider rounded hover:bg-maroon-md transition-colors"
          >
            <Home size={15} /> {isTe ? 'హోమ్‌కు వెళ్ళండి' : 'Back to Home'}
          </Link>
          <Link
            to="/purohits"
            className="inline-flex items-center gap-2 border border-maroon text-maroon px-5 py-2.5 text-xs font-cinzel font-bold uppercase tracking-wider rounded hover:bg-maroon/5 transition-colors"
          >
            <Search size={15} /> {isTe ? 'పురోహితులను చూడండి' : 'Browse Purohits'}
          </Link>
        </div>
      </div>
    </div>
  );
};
