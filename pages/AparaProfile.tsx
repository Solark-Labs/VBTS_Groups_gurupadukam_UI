import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Star, MapPin, Users, Utensils, Video,
  Camera, Upload, ShieldCheck, CalendarCheck, Lock, ExternalLink
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

export const AparaProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { aparaPeetas, user, addAparaReview, uploadAparaPhoto, addToast } = useAppContext();

  const peeta = aparaPeetas.find(p => p.id === id);

  const [revRating, setRevRating] = useState(5);
  const [revCeremony, setRevCeremony] = useState(peeta?.services[0] || '');
  const [revComment, setRevComment] = useState('');

  if (!peeta) {
    return (
      <div className="min-h-screen bg-cream pt-32 px-6 text-center">
        <h1 className="font-serif text-2xl font-bold text-maroon mb-3">Apara Peeta Not Found</h1>
        <Link to="/apara" className="text-sm font-bold text-maroon underline">
          ← Back to Apara Peetas
        </Link>
      </div>
    );
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addToast('Please upload an image under 2 MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        uploadAparaPhoto(peeta.id, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revComment.trim()) return;
    addAparaReview(peeta.id, {
      userName: user?.name || 'Verified Devotee',
      rating: revRating,
      ceremonyType: revCeremony || peeta.services[0],
      comment: revComment.trim(),
    });
    setRevComment('');
    setRevRating(5);
  };

  const maskedPhone = `+${peeta.phone.slice(0, 2)} ${peeta.phone.slice(2, 7)} •••••`;

  return (
    <div className="min-h-screen bg-cream pt-[104px] pb-16 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Breadcrumb */}
        <Link
          to="/apara"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-maroon hover:underline"
        >
          <ArrowLeft size={14} /> Back to All Apara Peetas
        </Link>

        {/* Peeta Header Card */}
        <div className="bg-white border border-gold/25 rounded-sm p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="relative shrink-0">
              <img
                src={peeta.image}
                alt={peeta.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-gold/50 bg-cream shadow"
              />
              {peeta.verified && (
                <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle size={13} className="text-white" />
                </span>
              )}
            </div>
            <div className="space-y-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-maroon">{peeta.name}</h1>
              <p className="font-telugu text-sm text-text-lt">{peeta.nameTe} · Lead: {peeta.organizerName}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-text-md">
                <span className="inline-flex items-center gap-1 font-bold text-maroon bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  <Star size={12} className="text-gold fill-gold" /> {peeta.rating} ({peeta.reviewCount} reviews)
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} className="text-maroon" /> {peeta.address}
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${peeta.lat},${peeta.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-maroon hover:underline"
                >
                  View Venue on Google Maps <ExternalLink size={11} />
                </a>
              </div>
              <p className="text-sm text-text-md leading-relaxed pt-1">{peeta.bio}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {peeta.services.map(s => (
                  <span key={s} className="text-[11px] font-bold uppercase tracking-wider bg-maroon/5 text-maroon border border-maroon/15 px-2.5 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Book CTA Box */}
          <div className="w-full md:w-72 shrink-0 bg-ivory border border-gold/30 p-5 rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-maroon">
              <Lock size={13} /> Contact: {maskedPhone}
            </div>
            <p className="text-xs text-text-md leading-relaxed">
              Pay just ₹11 token for full <strong>Guru Padukam support</strong>, food customization up to 2 days prior, emergency team swap &amp; direct Peeta contact.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/apara?book=${peeta.id}`)}
              className="w-full py-3 bg-maroon text-gold-pale font-cinzel text-xs font-bold tracking-widest uppercase clip-btn hover:bg-maroon-md transition-colors flex items-center justify-center gap-2 shadow"
            >
              <CalendarCheck size={15} /> Book Peeta @ ₹11
            </button>
          </div>
        </div>

        {/* Capabilities Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gold/20 p-4 rounded-sm space-y-1.5">
            <div className="font-cinzel text-xs font-bold uppercase tracking-wider text-maroon flex items-center gap-1.5">
              <Users size={14} /> Purohit Group Options
            </div>
            <p className="text-xs text-text-md">{peeta.groupOptions.join(' · ')}</p>
          </div>
          <div className="bg-white border border-gold/20 p-4 rounded-sm space-y-1.5">
            <div className="font-cinzel text-xs font-bold uppercase tracking-wider text-maroon flex items-center gap-1.5">
              <Video size={14} /> Ritual Modes &amp; Venue
            </div>
            <p className="text-xs text-text-md">
              {[
                peeta.supportsOnline && 'Online Sankalpam',
                peeta.supportsHomeService && 'Offline Home Service',
                peeta.supportsVenueVisit && `Peeta Venue (Up to ${peeta.maxGuestsAtVenue} guests)`,
              ].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className="bg-white border border-gold/20 p-4 rounded-sm space-y-1.5">
            <div className="font-cinzel text-xs font-bold uppercase tracking-wider text-maroon flex items-center gap-1.5">
              <Utensils size={14} /> Bhojanam &amp; Customizations
            </div>
            <p className="text-xs text-text-md">{peeta.foodPresets.join(' · ')}</p>
          </div>
        </div>

        {/* Uploaded Photos Gallery */}
        <div className="bg-white border border-gold/25 rounded-sm p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-cinzel text-lg font-bold text-maroon flex items-center gap-2">
                <Camera size={18} /> Peeta Venue &amp; Ceremony Gallery
              </h2>
              <p className="text-xs text-text-lt">Photos uploaded by the Peeta Purohit / Organizer</p>
            </div>
            {(user?.role === 'purohit' || user?.role === 'admin') && (
              <label className="inline-flex items-center gap-1.5 bg-gold/20 border border-gold/40 text-maroon text-xs font-bold px-3.5 py-2 rounded-sm cursor-pointer hover:bg-gold/30 transition-colors">
                <Upload size={13} /> Upload Venue / Ceremony Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>

          {peeta.galleryImages && peeta.galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {peeta.galleryImages.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-sm overflow-hidden border border-gold/20 bg-cream">
                  <img src={img} alt={`Peeta ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-cream/60 border border-dashed border-gold/40 p-6 rounded-sm text-center space-y-2">
              <img src="/logo.png" alt="Guru Padukam" className="w-12 h-12 rounded-full mx-auto opacity-80 border border-gold/30" />
              <p className="text-xs text-text-md">
                No venue photos uploaded yet by {peeta.name}.
              </p>
            </div>
          )}
        </div>

        {/* All Reviews & Ratings */}
        <div className="bg-white border border-gold/25 rounded-sm p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-gold/15 pb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold font-serif text-maroon">{peeta.rating}</div>
              <div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} size={15} className={n <= Math.round(peeta.rating) ? 'text-gold fill-gold' : 'text-gray-300'} />
                  ))}
                </div>
                <div className="text-xs text-text-lt mt-0.5">{peeta.experienceYears}+ yrs Vedic Seva · {peeta.reviewCount} reviews</div>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
              <ShieldCheck size={14} /> Verified Apara Peeta
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-maroon">All Devotee Feedback</h3>
              {peeta.reviewsList.map(r => (
                <div key={r.id} className="bg-cream/50 border border-gold/15 p-3.5 rounded-sm space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-maroon">{r.userName}</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} size={11} className={n <= r.rating ? 'text-gold fill-gold' : 'text-gray-300'} />
                      ))}
                    </div>
                  </div>
                  <div className="text-[10px] text-text-lt uppercase tracking-wider">{r.ceremonyType} · {r.date}</div>
                  <p className="text-xs text-text-md leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleReviewSubmit} className="bg-ivory border border-gold/25 p-4 rounded-sm space-y-3 h-fit">
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-maroon">Rate &amp; Share Feedback</h3>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-text-md mr-1">Your Rating:</span>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" onClick={() => setRevRating(star)} className="hover:scale-110 transition-transform">
                    <Star size={20} className={star <= revRating ? 'text-gold fill-gold' : 'text-gray-300'} />
                  </button>
                ))}
              </div>
              <select
                value={revCeremony || peeta.services[0]}
                onChange={e => setRevCeremony(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gold/30 bg-white rounded-sm"
              >
                {peeta.services.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea
                rows={3}
                required
                value={revComment}
                onChange={e => setRevComment(e.target.value)}
                placeholder="Share your feedback on rituals, Bhojanam & 1-day-prior coordination…"
                className="w-full px-3 py-2 text-xs border border-gold/30 bg-white rounded-sm resize-none"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-maroon text-gold-pale font-cinzel text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-maroon-md"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
