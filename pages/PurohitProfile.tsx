import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Star, MapPin, Languages, Award, Handshake,
  Camera, Upload, ShieldCheck, CalendarCheck, Share2, Copy, Check,
  Edit3, Sparkles, Clock, MessageCircle, ExternalLink, BadgeCheck
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { POOJA_OCCASIONS } from '../constants';

const COVER_GRADIENTS: Record<string, string> = {
  maroon: 'from-[#28060F] via-[#52101E] to-[#7A1B31]',
  saffron: 'from-[#5C2004] via-[#9E3D0B] to-[#C86D14]',
  temple: 'from-[#2D1B0E] via-[#5B3B1E] to-[#8C6239]',
  emerald: 'from-[#062C22] via-[#0F4C3A] to-[#1D6E55]',
};

export const PurohitProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { purohits, user, addPurohitReview, uploadPurohitPhoto, addToast } = useAppContext();

  const purohit = purohits.find(p => p.id === id);

  const [revRating, setRevRating] = useState(5);
  const [revOccasion, setRevOccasion] = useState(purohit?.specializations[0] || POOJA_OCCASIONS[0]);
  const [revComment, setRevComment] = useState('');
  const [copiedType, setCopiedType] = useState<'link' | 'insta' | null>(null);

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

  const shareUrl = `https://gurupadukam.com/#/purohits/${purohit.id}`;
  const isOwnerOrAdmin =
    user?.role === 'admin' ||
    (user?.role === 'purohit' &&
      (purohit.userId === user.id ||
        purohit.name.toLowerCase() === user.name.toLowerCase() ||
        (user.phone && purohit.phone?.includes(user.phone))));

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedType('link');
      addToast('Public profile link copied! Ready to paste on WhatsApp, Instagram or LinkedIn.', 'success');
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      addToast(shareUrl, 'info');
    }
  };

  const handleCopyInstagramBio = async () => {
    const bioText = `🙏 ${purohit.name} — Verified Vedic Scholar on Guru Padukam\n✨ ${purohit.headline || purohit.specializations.slice(0, 3).join(' · ')}\n📍 ${purohit.location} | ⭐ ${purohit.rating}/5 (${purohit.completedPoojas}+ Poojas)\n🪔 Book Directly @ ₹11 Token: ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(bioText);
      setCopiedType('insta');
      addToast('Instagram Bio & Link copied! Paste directly into your Instagram Bio or Story.', 'success');
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      addToast('Copy ready: ' + shareUrl, 'info');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${purohit.name} | Verified Vedic Purohit on Guru Padukam`,
          text: `${purohit.headline || purohit.bio} — Book directly with ₹11 token.`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to link copy if cancelled
      }
    }
    handleCopyLink();
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `🙏 Namaste! Book *${purohit.name}* (${purohit.experience}+ yrs experience, ${purohit.rating}★) for authentic Vedic rituals with a ₹11 confirmation token on Guru Padukam:\n${shareUrl}`
  )}`;

  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

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

  const coverGradient = COVER_GRADIENTS[purohit.coverTheme || 'maroon'] || COVER_GRADIENTS.maroon;
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
    <div className="min-h-screen bg-cream pt-[96px] pb-16 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-7">

        {/* Top Navigation + Owner Customize Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link
            to="/purohits"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-maroon hover:underline"
          >
            <ArrowLeft size={14} /> Back to Verified Purohits
          </Link>
          <div className="flex items-center gap-2">
            {isOwnerOrAdmin && (
              <Link
                to="/purohit-dashboard?tab=customize"
                className="inline-flex items-center gap-1.5 bg-maroon text-gold-pale text-xs font-bold px-3.5 py-2 rounded-md shadow hover:bg-maroon-md transition"
              >
                <Edit3 size={13} /> Customize My Public Page
              </Link>
            )}
            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex items-center gap-1.5 bg-white border border-gold/40 text-maroon text-xs font-bold px-3.5 py-2 rounded-md shadow-sm hover:bg-gold/10 transition"
            >
              <Share2 size={13} /> Share Profile
            </button>
          </div>
        </div>

        {/* LinkedIn / Instagram Creator-Style Hero Profile Card */}
        <div className="bg-white border border-gold/30 rounded-xl overflow-hidden shadow-md">
          {/* Customizable Banner */}
          <div className={`h-32 sm:h-40 bg-gradient-to-r ${coverGradient} relative px-6 py-4 flex items-start justify-between`}>
            <div className="inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-sm border border-gold/40 text-gold-lt text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              <BadgeCheck size={13} /> Guru Padukam Certified Scholar
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm ${
                purohit.availability === 'now'
                  ? 'bg-emerald-500 text-white'
                  : purohit.availability === 'today'
                  ? 'bg-amber-400 text-maroon-dk'
                  : 'bg-white/90 text-maroon'
              }`}
            >
              {purohit.availability === 'now'
                ? '● Available Now'
                : purohit.availability === 'today'
                ? `◐ Available Today${purohit.nextSlot ? ` · ${purohit.nextSlot}` : ''}`
                : `📅 By Schedule${purohit.nextSlot ? ` · ${purohit.nextSlot}` : ''}`}
            </span>
          </div>

          {/* Profile Body */}
          <div className="px-6 sm:px-8 pb-7">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 -mt-12 sm:-mt-14">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                <div className="relative shrink-0">
                  <img
                    src={purohit.image}
                    alt={purohit.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white bg-cream shadow-lg"
                  />
                  {purohit.verified && (
                    <span
                      title="Verified Scholar"
                      className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow"
                    >
                      <CheckCircle size={14} className="text-white" />
                    </span>
                  )}
                </div>

                <div className="space-y-1 pt-2 sm:pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-maroon leading-tight">{purohit.name}</h1>
                    {purohit.sampradaya && (
                      <span className="text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        {purohit.sampradaya}
                      </span>
                    )}
                  </div>
                  <p className="font-telugu text-sm text-text-lt">{purohit.nameTe}</p>
                  <p className="text-sm font-medium text-text-dk">
                    {purohit.headline || `Senior Vedic Purohit · ${purohit.specializations.slice(0, 3).join(' · ')}`}
                  </p>
                </div>
              </div>

              {/* Primary Booking CTA */}
              <div className="w-full lg:w-72 shrink-0 bg-ivory border border-gold/35 p-4 rounded-xl space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-maroon uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><Handshake size={14} className="text-gold-dk" /> Direct Dakshina</span>
                  <span className="bg-maroon text-gold-pale px-2 py-0.5 rounded text-[10px]">₹11 Token</span>
                </div>
                <p className="text-[11px] text-text-md leading-relaxed">
                  Reserve your Muhurtham for ₹11 via Cashfree. {purohit.name} calls to confirm Nakshatram &amp; samagri directly.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/purohits?book=${purohit.id}`)}
                  className="w-full py-2.5 bg-maroon text-gold-pale font-cinzel text-xs font-bold tracking-widest uppercase rounded-md hover:bg-maroon-md transition-colors flex items-center justify-center gap-2 shadow"
                >
                  <CalendarCheck size={15} /> Book Ceremony @ ₹11
                </button>
              </div>
            </div>

            {/* Social / Credential Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gold/15">
              <div className="bg-cream/80 border border-gold/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-maroon flex items-center justify-center gap-1">
                  <Star size={16} className="text-gold fill-gold" /> {purohit.rating}
                </div>
                <div className="text-[11px] text-text-lt">{purohit.reviews} Devotee Reviews</div>
              </div>
              <div className="bg-cream/80 border border-gold/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-maroon">{purohit.completedPoojas.toLocaleString()}+</div>
                <div className="text-[11px] text-text-lt">Rituals Performed</div>
              </div>
              <div className="bg-cream/80 border border-gold/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-maroon">{purohit.experience} Yrs</div>
                <div className="text-[11px] text-text-lt">Vedic Experience</div>
              </div>
              <div className="bg-cream/80 border border-gold/20 rounded-lg p-3 text-center">
                <div className="text-sm font-bold text-green-800 flex items-center justify-center gap-1 mt-0.5">
                  <ShieldCheck size={15} /> Verified ID
                </div>
                <div className="text-[11px] text-text-lt">₹1 Witness KYC Active</div>
              </div>
            </div>

            {/* Bio, Location, Languages & Social Share Strip */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h2 className="font-cinzel text-xs font-bold uppercase tracking-widest text-maroon mb-1.5">
                    About &amp; Vedic Standards
                  </h2>
                  <p className="text-sm text-text-md leading-relaxed">{purohit.bio}</p>
                  {purohit.customTagline && (
                    <p className="text-xs italic text-maroon mt-2 bg-amber-50/70 border-l-2 border-gold px-3 py-1.5">
                      “{purohit.customTagline}”
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-text-md pt-1">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <MapPin size={14} className="text-maroon" /> {purohit.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Languages size={14} className="text-maroon" /> {purohit.languages.join(', ')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Award size={14} className="text-gold-dk" /> Full Vidhi Vidhanam &amp; Punctual Arrival
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-maroon mb-2">
                    Click Any Ritual to Book Directly @ ₹11
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {purohit.specializations.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => navigate(`/purohits?book=${purohit.id}&occasion=${encodeURIComponent(s)}`)}
                        className="text-xs font-semibold bg-maroon/5 hover:bg-maroon hover:text-gold-pale text-maroon border border-maroon/20 px-3 py-1.5 rounded-full transition-colors"
                      >
                        {s} →
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instagram / LinkedIn / WhatsApp Share Card */}
              <div className="bg-cream/80 border border-gold/30 rounded-xl p-4 space-y-3 h-fit">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-maroon">
                  <Sparkles size={14} className="text-gold-dk" /> Share Scholar Profile
                </div>
                <p className="text-[11px] text-text-md">
                  Share this verified Guru Padukam link on Instagram Bio, LinkedIn Featured, or family WhatsApp groups.
                </p>
                <div className="flex items-center gap-1.5 bg-white border border-gold/30 rounded px-2.5 py-1.5 text-[11px] font-mono text-text-dk">
                  <span className="truncate flex-1">{shareUrl}</span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="shrink-0 text-maroon font-bold hover:underline flex items-center gap-1"
                  >
                    {copiedType === 'link' ? <Check size={13} className="text-green-700" /> : <Copy size={13} />}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyInstagramBio}
                    className="w-full py-2 px-3 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white text-xs font-bold rounded-md hover:opacity-95 flex items-center justify-center gap-1.5"
                  >
                    {copiedType === 'insta' ? <Check size={13} /> : <Copy size={13} />}
                    {copiedType === 'insta' ? 'Copied for Instagram Bio!' : 'Copy Instagram Bio + Link'}
                  </button>
                  <a
                    href={linkedInShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 bg-[#0A66C2] text-white text-xs font-bold rounded-md hover:opacity-95 flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={13} /> Share on LinkedIn
                  </a>
                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 bg-[#25D366] text-white text-xs font-bold rounded-md hover:opacity-95 flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle size={13} /> Share on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Clock, title: 'On-Time Muhurtham Guarantee', desc: 'Direct call post ₹11 booking to lock exact Nakshatram & auspicious window.' },
            { icon: ShieldCheck, title: 'Verified Identity & Witness KYC', desc: 'Backed by ₹1 Cashfree witness verification & venue ID readiness.' },
            { icon: Handshake, title: 'Transparent Direct Dakshina', desc: 'Zero hidden commission — settle Dakshina directly and honestly.' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="bg-white border border-gold/25 rounded-lg p-4 flex items-start gap-3 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-maroon/5 text-maroon flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-maroon">{item.title}</div>
                  <p className="text-[11px] text-text-md mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Uploaded Ceremony Photos Gallery */}
        <div className="bg-white border border-gold/25 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-cinzel text-lg font-bold text-maroon flex items-center gap-2">
                <Camera size={18} /> Ceremony Photos &amp; Gallery
              </h2>
              <p className="text-xs text-text-lt">Real ritual photos uploaded by the Purohit (stored on Firebase Cloud)</p>
            </div>
            {isOwnerOrAdmin && (
              <label className="inline-flex items-center gap-1.5 bg-gold/20 border border-gold/40 text-maroon text-xs font-bold px-3.5 py-2 rounded-md cursor-pointer hover:bg-gold/30 transition-colors">
                <Upload size={13} /> Upload Ceremony Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>

          {purohit.galleryImages && purohit.galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {purohit.galleryImages.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gold/20 bg-cream">
                  <img src={img} alt={`Ceremony ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-cream/60 border border-dashed border-gold/40 p-6 rounded-lg text-center space-y-2">
              <img src="/logo.png" alt="Guru Padukam" className="w-12 h-12 rounded-full mx-auto opacity-80 border border-gold/30" />
              <p className="text-xs text-text-md">
                No ceremony photos uploaded yet by {purohit.name}.
              </p>
            </div>
          )}
        </div>

        {/* All Reviews & Ratings */}
        <div className="bg-white border border-gold/25 rounded-xl p-6 shadow-sm space-y-5">
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
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                <ShieldCheck size={14} /> Verified Scholar · ₹1 Witness KYC
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-maroon bg-amber-50 border border-gold/40 px-3 py-1 rounded-full">
                ✓ Ready to Show ID at Venue
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Existing Reviews */}
            <div className="space-y-3">
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-maroon">Devotee Reviews</h3>
              {reviewsToShow.map(r => (
                <div key={r.id} className="bg-cream/50 border border-gold/15 p-3.5 rounded-lg space-y-1">
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
            <form onSubmit={handleReviewSubmit} className="bg-ivory border border-gold/25 p-4 rounded-lg space-y-3 h-fit">
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
                className="w-full px-3 py-2 text-xs border border-gold/30 bg-white rounded-md"
              >
                {purohit.specializations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea
                rows={3}
                required
                value={revComment}
                onChange={e => setRevComment(e.target.value)}
                placeholder="Share your experience with punctuality, rituals & Guru Padukam support…"
                className="w-full px-3 py-2 text-xs border border-gold/30 bg-white rounded-md resize-none"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-maroon text-gold-pale font-cinzel text-xs font-bold uppercase tracking-wider rounded-md hover:bg-maroon-md"
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
