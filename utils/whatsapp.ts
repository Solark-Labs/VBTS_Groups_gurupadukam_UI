import { Booking, AparaBooking } from '../types';
import { BRAND_CONTACT } from '../constants';

/**
 * Generates a direct Google Maps directions URL for a booking.
 * Uses exact GPS coordinates if pinned, otherwise falls back to address search.
 */
export const getBookingMapDirectionsUrl = (booking: Pick<Booking, 'location' | 'address' | 'city' | 'pincode'>): string => {
  if (booking.location?.directionsUrl) {
    return booking.location.directionsUrl;
  }
  if (booking.location?.lat && booking.location?.lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${booking.location.lat},${booking.location.lng}`;
  }
  const fullAddr = [booking.address, booking.city, booking.pincode].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddr)}`;
};

/**
 * Builds the pre-filled WhatsApp message & wa.me link for the Purohit
 * so they receive all devotee & Google Maps navigation details hassle-free
 * prior to the scheduled ceremony time.
 */
export const buildPurohitWhatsAppUrl = (booking: Booking): string => {
  const targetPhone = (booking.purohitPhone || BRAND_CONTACT.phoneRaw).replace(/\D/g, '');
  const mapLink = getBookingMapDirectionsUrl(booking);
  const fullAddress = [booking.address, booking.city, booking.pincode].filter(Boolean).join(', ');

  const lines = [
    `🙏 *Namaste ${booking.purohitName} Garu!*`,
    `Here are your upcoming ceremony & navigation details from *Guru Padukam*:`,
    ``,
    `📌 *Booking ID:* ${booking.id}`,
    `🕉️ *Ritual / Occasion:* ${booking.occasion}`,
    `📅 *Scheduled Date:* ${booking.date}`,
    `⏰ *Muhurtham Time:* ${booking.time}`,
    ``,
    `👤 *Devotee Name:* ${booking.userName}`,
    `📞 *Devotee Phone:* +91 ${booking.userPhone}`,
    `🏠 *Ceremony Address:* ${fullAddress}`,
    ``,
    `📍 *Google Maps Navigation (1-Tap Directions):*`,
    `${mapLink}`,
    booking.notes ? `\n📝 *Special Notes / Gotram:* ${booking.notes}` : '',
    ``,
    `✅ *₹11 Token Confirmed.* Please call the devotee prior to departure for smooth coordination.`,
  ].filter(Boolean);

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
};

/**
 * Computes prior-to-scheduled-time dispatch status for a booking.
 */
export const getReminderWindowInfo = (dateStr: string, timeStr: string, hoursBefore = 2) => {
  if (!dateStr || !timeStr) {
    return { label: 'Prior Dispatch Scheduled', isDueNow: false, scheduledAtText: '2 hrs before ceremony' };
  }

  const ceremonyDate = new Date(`${dateStr}T${timeStr}:00`);
  if (isNaN(ceremonyDate.getTime())) {
    return { label: 'Prior Dispatch Scheduled', isDueNow: false, scheduledAtText: `${dateStr} ${timeStr}` };
  }

  const dispatchDate = new Date(ceremonyDate.getTime() - hoursBefore * 60 * 60 * 1000);
  const now = new Date();
  const diffMs = ceremonyDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  const formattedDispatch = dispatchDate.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (diffMs < 0) {
    return { label: 'Ceremony Time Passed', isDueNow: false, scheduledAtText: formattedDispatch };
  }
  if (diffHours <= hoursBefore + 1) {
    return { label: 'Dispatch Due Now (Prior to Muhurtham)', isDueNow: true, scheduledAtText: formattedDispatch };
  }
  return {
    label: `Auto-Dispatch ${hoursBefore}h Prior (${formattedDispatch})`,
    isDueNow: false,
    scheduledAtText: formattedDispatch,
  };
};

/**
 * Haversine distance in kilometers between two GPS coordinates.
 */
export const calculateDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

/**
 * Computes exact YYYY-MM-DD date 1 day prior to the scheduled ceremony date.
 * Example: 2026-12-20 -> 2026-12-19
 */
export const getOneDayPriorDate = (eventDateStr: string): string => {
  if (!eventDateStr) return '';
  const dt = new Date(`${eventDateStr}T00:00:00`);
  if (isNaN(dt.getTime())) return '';
  dt.setDate(dt.getDate() - 1);
  return dt.toISOString().split('T')[0];
};

/**
 * Evaluates whether the 1-day-prior organizer checklist dispatch is scheduled, due now, or past.
 */
export const getAparaPriorDispatchInfo = (eventDateStr: string) => {
  const priorDateStr = getOneDayPriorDate(eventDateStr);
  if (!priorDateStr) {
    return { priorDateStr: '', formattedPrior: '1 Day Prior', isDueNow: false };
  }
  const todayStr = new Date().toISOString().split('T')[0];
  const priorDt = new Date(`${priorDateStr}T00:00:00`);
  const formattedPrior = priorDt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const isDueNow = todayStr >= priorDateStr && todayStr <= eventDateStr;
  return { priorDateStr, formattedPrior, isDueNow };
};

/**
 * Builds the 1-day-prior WhatsApp checklist & navigation link for the Apara Peeta organizer
 * so they can cautiously prepare the exact purohit group, food items, and travel/venue setup.
 */
export const buildAparaOrganizerWhatsAppUrl = (booking: AparaBooking): string => {
  const targetPhone = (booking.peetaPhone || BRAND_CONTACT.phoneRaw).replace(/\D/g, '');
  const modeLabel =
    booking.ritualMode === 'online'
      ? 'Online (Video Sankalpam)'
      : booking.ritualMode === 'offline-home'
      ? 'Offline — Home Service'
      : 'Offline — At Peeta Venue';

  const mapLink =
    booking.ritualMode === 'offline-home'
      ? booking.location?.directionsUrl ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${booking.address}, ${booking.city} - ${booking.pincode}`)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.peetaAddress)}`;

  const foodLines =
    booking.foodPackage === 'with-food'
      ? [
          `🍽️ *Food Package:* With Traditional Bhojanam`,
          `👥 *Total Attendees:* ${booking.attendeeCount} Members`,
          `🍛 *Menu Type:* ${booking.foodMenuType || 'Standard Apara Menu'}`,
          booking.preferredItems ? `✨ *Preferred Items:* ${booking.preferredItems}` : '',
          booking.customizations ? `📝 *Customizations / Dietary Notes:* ${booking.customizations}` : '',
        ].filter(Boolean)
      : [
          `🍽️ *Food Package:* Without Food (Ritual Only)`,
          `👥 *Expected Family Attendees:* ${booking.attendeeCount} Members`,
        ];

  const lines = [
    `🙏 *Namaste ${booking.peetaName}!*`,
    `⚠️ *1-DAY PRIOR PREPARATION CHECKLIST (Guru Padukam Apara Seva)*`,
    ``,
    `📌 *Booking ID:* ${booking.id}`,
    `🕉️ *Ceremony:* ${booking.ceremonyType}`,
    `📅 *Event Date & Time:* ${booking.date} at ${booking.time}`,
    `🗓️ *1-Day Prior Alert Date:* ${booking.priorDispatchDate}`,
    ``,
    `🧭 *Ritual Mode:* ${modeLabel}`,
    `👥 *Purohit Requirement:* ${booking.purohitGroup}`,
    ...foodLines,
    ``,
    `👤 *Devotee Name:* ${booking.userName}`,
    `📞 *Devotee Phone:* +91 ${booking.userPhone}`,
    booking.ritualMode === 'offline-home'
      ? `🏠 *Devotee Home Address:* ${booking.address}, ${booking.city} - ${booking.pincode}`
      : booking.ritualMode === 'offline-venue'
      ? `🏛️ *Venue:* ${booking.peetaAddress} (Devotee visiting Peeta)`
      : `💻 *Mode:* Online Video Link coordination`,
    ``,
    `📍 *Google Maps Navigation:*`,
    `${mapLink}`,
    ``,
    `✅ *₹11 Token Confirmed on gurupadukam.com.* Please verify all items & purohit team 1 day in advance.`,
  ];

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
};
