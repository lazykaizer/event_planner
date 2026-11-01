import type { VendorType } from '@/types';

export interface SampleQuoteItem {
  id: string;
  vendorType: VendorType;
  labelEn: string;
  labelHi: string;
  icon: string;
  guestCount: number;
  text: string;
}

export const SAMPLE_HINGLISH_QUOTES: SampleQuoteItem[] = [
  {
    id: 'caterer',
    vendorType: 'caterer',
    labelEn: 'Caterer (₹1,150/plate, 60% Adv)',
    labelHi: 'कैटरर (₹1,150/प्लेट, 60% एडवांस)',
    icon: '🍲',
    guestCount: 250,
    text: `Namaste Sharma ji, yeh catering ka estimate hai aapke 250 guests ke liye:

Menu per plate: Rs 1150/- (Pure Veg)
Includes:
- 4 Welcome drinks (Mocktails)
- 4 Starters (Paneer tikka, Hara bhara kabab, Crispy corn, Spring roll)
- Main course: 2 Paneer sabzi, Dal Makhani, Mix Veg, Pulao, assorted breads (Naan, Roti, Missi)
- Sweets: Gulab Jamun, Moong Dal Halwa, Ice Cream counter

Not included:
- Waitstaff bakhshish/tips (approx Rs 500 per boy)
- Drinking water jars extra
- Chaat counter will be extra Rs 150 per plate

Payment terms:
Advance 60% booking par dena hoga cash ya Sharma ji ke personal GPay par. 40% function shuru hone se 2 ghante pehle clear karna padega.
Cancellation par no refund.
Contract ki zaroorat nahi hai, hamara 15 saal ka vishwas hai.`,
  },
  {
    id: 'venue',
    vendorType: 'venue',
    labelEn: 'Venue ("Free Lawn" Offer)',
    labelHi: 'वेन्यू ("मुफ्त लॉन" ऑफर)',
    icon: '🏛️',
    guestCount: 300,
    text: `Respected Sir,
Heartiest congratulations for the wedding function!
Quote for Grand Shahi Palace Lawn for 300 pax:

Special Package:
- Venue Lawn is COMPLIMENTARY / FREE with catering!
- Per plate catering charge: Rs 1,450 + taxes
- Includes: Basic hall lighting, Round tables with white linen, 2 bride/groom green rooms.

Extras:
- Generator diesel charges: Rs 15,000 per 4 hours if government power cuts.
- Mandatory venue cleaning & sanitation fee: Rs 12,000.
- Outside DJ royalty/entry fee: Rs 8,000.
- AC timing strictly 7:00 PM to 11:30 PM. Overtime Rs 5,000/hour.

Advance: 50% advance for blocking date. 50% 1 week prior.
Strictly non-refundable deposit.`,
  },
  {
    id: 'decorator',
    vendorType: 'decorator',
    labelEn: 'Decorator (Floral Package)',
    labelHi: 'सजावट (फ्लोरल पैकेज)',
    icon: '🌸',
    guestCount: 250,
    text: `Hello Sir, Decor package estimate:
Total package cost: Rs 2,20,000.
Deliverables:
- Main gate floral arch (Hydrangea & Artificial orchid mix)
- Stage backdrop with golden sofa setup
- Mandap with floral pillars
- 10 walkway pillars with fairy lighting

Note: Fresh imported flowers extra as per mandi market rate on wedding day. Sound generator and truss structure extra Rs 25,000.
Advance: 70% advance on booking, balance on setup morning. Cash only accepted. No written invoice without 18% GST extra.`,
  },
  {
    id: 'photographer',
    vendorType: 'photographer',
    labelEn: 'Photographer (Photo + Drone)',
    labelHi: 'फोटोग्राफर (फोटो + ड्रोन)',
    icon: '📸',
    guestCount: 200,
    text: `Hello brother, photography and cinematic video package:
Total package: Rs 1,40,000 for 2 days (Sangeet + Wedding).
Includes:
- 2 Candid photographers
- 1 Traditional video cameraman
- Drone coverage for varmala (subject to weather & permissions)

Extra charges:
- Raw footage hard disk Rs 5,000 extra
- Outstation conveyance & hotel stay for 4 crew members by client
- Album printing: 40 pages included, extra sheet Rs 1,200 per sheet

Payment:
50% advance to block dates. 40% on wedding night before leaving venue. Balance 10% on album delivery.
Cash preferred. Cancellation non-refundable.`,
  },
];
