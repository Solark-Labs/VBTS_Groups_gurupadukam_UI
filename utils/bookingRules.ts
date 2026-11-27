import { Booking } from '../types';

export interface CancellationPolicyEvaluation {
  isMajorCeremony: boolean;
  isImmediate: boolean;
  isSameDay: boolean;
  daysBeforeCeremony: number;
  requiredPriorDays: number;
  canDevoteeSelfCancelOrSwap: boolean;
  ruleCode:
    | 'IMMEDIATE_NO_CANCEL'
    | 'SAME_DAY_PUROHIT_ONLY'
    | 'MAJOR_10_DAY_ALLOWED'
    | 'MAJOR_LOCKED'
    | 'PRE_EVENT_3_DAY_ALLOWED'
    | 'PRE_EVENT_LOCKED';
  summaryEn: string;
  summaryTe: string;
}

const MAJOR_CEREMONY_KEYWORDS = [
  'vivah',
  'marriage',
  'wedding',
  'house warming',
  'griha',
  'upanayanam',
  'yagnam',
  'vastu',
  'bhoomi',
];

export function isMajorCeremonyOccasion(occasion: string): boolean {
  const lower = (occasion || '').toLowerCase();
  return MAJOR_CEREMONY_KEYWORDS.some(k => lower.includes(k));
}

export function getDaysUntilCeremony(dateStr: string): number {
  if (!dateStr) return 999;
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return 999;
  const targetMidnight = new Date(parts[0], parts[1] - 1, parts[2]).getTime();
  return Math.round((targetMidnight - todayMidnight) / (1000 * 60 * 60 * 24));
}

export function getBookingCancellationPolicy(booking: Booking): CancellationPolicyEvaluation {
  const isImmediate = booking.bookingType === 'immediate';
  const isMajor = isMajorCeremonyOccasion(booking.occasion);
  const daysBefore = getDaysUntilCeremony(booking.date);
  const isSameDay = daysBefore <= 0;
  const requiredPriorDays = isMajor ? 10 : 3;

  if (isImmediate) {
    return {
      isMajorCeremony: isMajor,
      isImmediate: true,
      isSameDay,
      daysBeforeCeremony: daysBefore,
      requiredPriorDays: 0,
      canDevoteeSelfCancelOrSwap: false,
      ruleCode: 'IMMEDIATE_NO_CANCEL',
      summaryEn:
        'Immediate Purohit Booking: Priest committed live at this moment & location. Self-cancellation is not available; no refund applies.',
      summaryTe:
        'తక్షణ పురోహిత బుకింగ్: పురోహితుడు ప్రస్తుత సమయానికి అందుబాటులో ఉన్నారు కాబట్టి రద్దు చేసుకునే వీలు లేదు; రీఫండ్ ఉండదు.',
    };
  }

  if (isSameDay) {
    return {
      isMajorCeremony: isMajor,
      isImmediate: false,
      isSameDay: true,
      daysBeforeCeremony: daysBefore,
      requiredPriorDays,
      canDevoteeSelfCancelOrSwap: false,
      ruleCode: 'SAME_DAY_PUROHIT_ONLY',
      summaryEn:
        'Same-Day Ritual: Please call and speak directly with the Purohit. Only the Purohit holds authority to accept any change today.',
      summaryTe:
        'ఈరోజు జరిగే పూజ: దయచేసి నేరుగా పురోహితుడితో మాట్లాడండి. ఈరోజు మార్పు లేదా రద్దును పురోహితుడు మాత్రమే ఆమోదించగలరు.',
    };
  }

  if (isMajor) {
    if (daysBefore >= 10) {
      return {
        isMajorCeremony: true,
        isImmediate: false,
        isSameDay: false,
        daysBeforeCeremony: daysBefore,
        requiredPriorDays: 10,
        canDevoteeSelfCancelOrSwap: true,
        ruleCode: 'MAJOR_10_DAY_ALLOWED',
        summaryEn: `Major Ceremony (${daysBefore} days remaining): Eligible for Date Swap or Cancellation request (10+ days prior). Routes to both Purohit & Guru Padukam Admin.`,
        summaryTe: `పెద్ద వేడుక (${daysBefore} రోజులు ఉన్నాయి): 10+ రోజుల ముందు తేదీ మార్పు లేదా రద్దు అభ్యర్థన చేయవచ్చు (పురోహితుడు & అడ్మిన్ ఇద్దరికీ వెళ్తుంది).`,
      };
    }
    return {
      isMajorCeremony: true,
      isImmediate: false,
      isSameDay: false,
      daysBeforeCeremony: daysBefore,
      requiredPriorDays: 10,
      canDevoteeSelfCancelOrSwap: false,
      ruleCode: 'MAJOR_LOCKED',
      summaryEn: `Within ${daysBefore} day(s) of Major Ceremony (< 10 days): Purohit has blocked their calendar exclusively for you. No refund without Purohit mutual acknowledgment.`,
      summaryTe: `పెద్ద వేడుకకు ${daysBefore} రోజులు మాత్రమే ఉన్నాయి (< 10 రోజులు): పురోహితుడు క్యాలెండర్ బ్లాక్ చేశారు. సరైన కారణం & పురోహితుడి అనుమతి లేకుండా రీఫండ్ ఉండదు.`,
    };
  }

  if (daysBefore >= 3) {
    return {
      isMajorCeremony: false,
      isImmediate: false,
      isSameDay: false,
      daysBeforeCeremony: daysBefore,
      requiredPriorDays: 3,
      canDevoteeSelfCancelOrSwap: true,
      ruleCode: 'PRE_EVENT_3_DAY_ALLOWED',
      summaryEn: `Pre-Event Provision (${daysBefore} days remaining): Eligible to Swap Date or Request Cancellation (3+ days prior). Routes to Purohit & Admin.`,
      summaryTe: `పూజకు 3+ రోజుల ముందు (${daysBefore} రోజులు ఉన్నాయి): తేదీ మార్పు లేదా రద్దు అభ్యర్థన చేయవచ్చు (పురోహితుడు & అడ్మిన్ ఇద్దరికీ వెళ్తుంది).`,
    };
  }

  return {
    isMajorCeremony: false,
    isImmediate: false,
    isSameDay: false,
    daysBeforeCeremony: daysBefore,
    requiredPriorDays: 3,
    canDevoteeSelfCancelOrSwap: false,
    ruleCode: 'PRE_EVENT_LOCKED',
    summaryEn: `Within ${daysBefore} day(s) of Ritual (< 3 days): Calendar reserved for you. Contact Purohit directly; no refund if cancelled close to the ritual without a valid reason.`,
    summaryTe: `పూజకు ${daysBefore} రోజులు మాత్రమే ఉన్నాయి (< 3 రోజులు): పురోహితుడు క్యాలెండర్ బ్లాక్ చేశారు. సరైన కారణం లేకుండా రీఫండ్ ఉండదు; పురోహితుడితో మాట్లాడండి.`,
  };
}
