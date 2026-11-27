import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Star, MapPin, Languages, Award, Handshake,
  Camera, Upload, ShieldCheck, CalendarCheck
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { POOJA_OCCASIONS } from '../constants';

export const PurohitProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { purohits, user, addPurohitReview, uploadPurohitPhoto, addToast } = useAppContext();

  const purohit = purohits.find(p => p.id === id);

  const [revRating, setRevRating] = useState(5);
  const [revOccasion, setRevOccasion] = useState(purohit?.specializations[0] || POOJA_OCCASIONS[0]);
  const [revComment, setRevComment] = useState('');

  if (!purohit) {
    return (
      <div className="min-h-screen bg-cream pt-32 px-6 text-center">
        <h1 className="font-serif text-2xl font-bold text-maroon mb-3">Purohit Profile Not Found</h1>
        <Link to="/purohits" className="text-sm font-bold text-maroon underline">
          ← Back to All Purohits
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
        uploadPurohitPhoto(purohit.id, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revComment.trim()) return;
    addPurohitReview(purohit.id, {
      userName: user?.name || 'Verified Devotee',
      rating: revRating,
      ceremonyType: revOccasion,
      comment: revComment.trim(),
    });
    setRevComment('');
    setRevRating(5);
  };

  const reviewsToShow = purohit.reviewsList && purohit.reviewsList.length > 0
    ? purohit.reviewsList
    : [
        {
          id: 'default-1',
          userName: 'Srinivasulu R.',
          rating: 5,
          ceremonyType: purohit.specializations[0] || 'Vedic Pooja',
          date: '2026-10-18',
          comment: `${purohit.name} arrived right on time, explained every mantra clearly, and performed the ceremony with complete devotion. Guru Padukam arranged all essentials effortlessly.`,
        },
        {
          id: 'default-2',
          userName: 'Anitha Devi K.',
          rating: 5,
          ceremonyType: purohit.specializations[1] || 'Family Ritual',
          date: '2026-11-05',
          comment: 'Very polite, knowledgeable, and transparent dakshina discussion after paying the ₹11 token.',
        },
      ];

  return (
    <div className="min-h-screen bg-cream pt-[104px] pb-16 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Breadcrumb */}
        <Link
          to="/purohits"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-maroon hover:underline"
        >
          <ArrowLeft size={14} /> Back to Verified Purohits
        </Link>

        {/* Profile Header Card */}
        <div className="bg-white border border-gold/25 rounded-sm p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="relative shrink-0">
              <img
                src={purohit.image}
                alt={purohit.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-gold/50 bg-cream shadow"
              />
              {purohit.verified && (
                <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle size={13} className="text-white" />
                </span>
              )}
            </div>
            <div className="space-y-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-maroon">{purohit.name}</h1>
              <p className="font-telugu text-sm text-text-lt">{purohit.nameTe}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-text-md">
                <span className="inline-flex items-center gap-1 font-bold text-maroon bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  <Star size={12} className="text-gold fill-gold" /> {purohit.rating} ({purohit.reviews} reviews)
                </span>
                <span className="inline-flex items-center gap-1"><Award size={13} className="text-gold-dk" /> {purohit.experience} yrs exp</span>
                <span className="inline-flex items-center gap-1"><MapPin size={13} className="text-maroon" /> {purohit.location}</span>
                <span className="inline-flex items-center gap-1"><Languages size={13} className="text-maroon" /> {purohit.languages.join(', ')}</span>
              </div>
              <p className="text-sm text-text-md leading-relaxed pt-1">{purohit.bio}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {purohit.specializations.map(s => (
                  <span key={s} className="text-[11px] font-bold uppercase tracking-wider bg-maroon/5 text-maroon border border-maroon/15 px-2.5 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Book CTA Box */}
          <div className="w-full md:w-72 shrink-0 bg-ivory border border-gold/30 p-5 rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-maroon uppercase tracking-wider">
              <Handshake size={14} className="text-gold-dk" /> Direct Dakshina · ₹11 Token
            </div>
            <p className="text-xs text-text-md leading-relaxed">
              Pay just ₹11 to confirm — {purohit.name} will contact you shortly &amp; Guru Padukam supports every step.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/purohits?book=${purohit.id}`)}
              className="w-full py-3 bg-maroon text-gold-pale font-cinzel text-xs font-bold tracking-widest uppercase clip-btn hover:bg-maroon-md transition-colors flex items-center justify-center gap-2 shadow"
            >
              <CalendarCheck size={15} /> Book Now @ ₹11
            </button>
          </div>
        </div>

        {/* Uploaded Ceremony Photos Gallery */}
        <div className="bg-white border border-gold/25 rounded-sm p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-cinzel text-lg font-bold text-maroon flex items-center gap-2">
                <Camera size={18} /> Ceremony Photos &amp; Gallery
              </h2>
              <p className="text-xs text-text-lt">Real ritual photos uploaded by the Purohit</p>
            </div>
            {(user?.role === 'purohit' || user?.role === 'admin') && (
              <label className="inline-flex items-center gap-1.5 bg-gold/20 border border-gold/40 text-maroon text-xs font-bold px-3.5 py-2 rounded-sm cursor-pointer hover:bg-gold/30 transition-colors">
                <Upload size={13} /> Upload Ceremony Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>

          {purohit.galleryImages && purohit.galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {purohit.galleryImages.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-sm overflow-hidden border border-gold/20 bg-cream">
                  <img src={img} alt={`Ceremony ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-cream/60 border border-dashed border-gold/40 p-6 rounded-sm text-center space-y-2">
              <img src="/logo.png" alt="Guru Padukam" className="w-12 h-12 rounded-full mx-auto opacity-80 border border-gold/30" />
              <p className="text-xs text-text-md">
                No ceremony photos uploaded yet by {purohit.name}.
              </p>
            </div>
          )}
        </div>

        {/* All Reviews & Ratings */}
        <div className="bg-white border border-gold/25 rounded-sm p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-gold/15 pb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold font-serif text-maroon">{purohit.rating}</div>
              <div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} size={15} className={n <= Math.round(purohit.rating) ? 'text-gold fill-gold' : 'text-gray-300'} />
                  ))}
                </div>
                <div className="text-xs text-text-lt mt-0.5">{purohit.completedPoojas.toLocaleString()} completed poojas · {purohit.reviews} reviews</div>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
              <ShieldCheck size={14} /> Verified Vedic Scholar
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Existing Reviews */}
            <div className="space-y-3">
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-maroon">Devotee Reviews</h3>
              {reviewsToShow.map(r => (
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

            {/* Write a Review */}
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
                value={revOccasion}
                onChange={e => setRevOccasion(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gold/30 bg-white rounded-sm"
              >
                {purohit.specializations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea
                rows={3}
                required
                value={revComment}
                onChange={e => setRevComment(e.target.value)}
                placeholder="Share your experience with punctuality, rituals & Guru Padukam support…"
                className="w-full px-3 py-2 text-xs border border-gold/30 bg-white rounded-sm resize-none"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-maroon text-gold-pale font-cinzel text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-maroon-md"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
