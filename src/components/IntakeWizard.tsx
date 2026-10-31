'use client';

import React, { useState } from 'react';
import type {
  UserIntake,
  OccasionType,
  StylePreference,
  PriorityItem,
  Language,
} from '@/types';
import { PRIORITY_ITEMS } from '@/types';
import { formatIndianNumber, parseINR } from '@/lib/formatters';
import { AlertBanner } from '@/components/AlertBanner';

interface IntakeWizardProps {
  language: Language;
  onSubmit: (intake: UserIntake) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

const OCCASIONS: { value: OccasionType; labelEn: string; labelHi: string; icon: string }[] = [
  { value: 'wedding', labelEn: 'Wedding (शादी)', labelHi: 'विवाह / शादी', icon: '💍' },
  { value: 'engagement', labelEn: 'Engagement (सगाई)', labelHi: 'सगाई / रोका', icon: '✨' },
  { value: 'griha_pravesh', labelEn: 'Griha Pravesh', labelHi: 'गृह प्रवेश', icon: '🪔' },
  { value: 'birthday', labelEn: 'Milestone Birthday / Anniversary', labelHi: 'जन्मदिन / वर्षगांठ', icon: '🎂' },
  { value: 'other', labelEn: 'Other Family Celebration', labelHi: 'अन्य पारिवारिक समारोह', icon: '🎉' },
];

const STYLES: { value: StylePreference; labelEn: string; labelHi: string; descEn: string; descHi: string }[] = [
  {
    value: 'intimate',
    labelEn: 'Intimate & Minimalist',
    labelHi: 'सादगीपूर्ण एवं आत्मीय',
    descEn: 'Close family, emphasis on warmth and heartfelt hospitality over spectacle.',
    descHi: 'निकटतम पारिवारिक सदस्य, सादगी और व्यक्तिगत आतिथ्य पर विशेष ध्यान।',
  },
  {
    value: 'traditional',
    labelEn: 'Traditional & Authentic',
    labelHi: 'पारंपरिक एवं रीतियुक्त',
    descEn: 'Classic customs, focus on authentic cuisine, puja rituals, and rich decor.',
    descHi: 'वैदिक रीति-रिवाज, पारंपरिक खानपान और सांस्कृतिक सजावट।',
  },
  {
    value: 'grand',
    labelEn: 'Grand Celebration',
    labelHi: 'भव्य एवं उल्लासमय',
    descEn: 'Dazzling lighting, vibrant entertainment, cinematic photography, and vast guest list.',
    descHi: 'शानदार सजावट, जीवंत संगीत/डीजे, सिनेमैटिक वीडियोग्राफी और विस्तृत मेहमान सूची।',
  },
];

const PRIORITY_LABELS: Record<PriorityItem, { en: string; hi: string; icon: string }> = {
  food: { en: 'Food & Catering Quality', hi: 'खानपान एवं भोजन की गुणवत्ता', icon: '🍲' },
  venue: { en: 'Prime Venue & Ambience', hi: 'उत्तम विवाह स्थल एवं परिसर', icon: '🏛️' },
  decoration: { en: 'Floral & Thematic Decor', hi: 'फूल एवं थीम आधारित सजावट', icon: '🌸' },
  photography: { en: 'Photography & Cinematic Video', hi: 'फोटोग्राफी एवं वीडियो', icon: '📸' },
  guest_comfort: { en: 'Guest Hospitality & Stay', hi: 'मेहमानों का सत्कार एवं ठहराव', icon: '🛏️' },
  entertainment: { en: 'Music, DJ & Entertainment', hi: 'संगीत, डीजे एवं मनोरंजन', icon: '🎶' },
};

export function IntakeWizard({
  language,
  onSubmit,
  isLoading,
  error,
  onClearError,
}: IntakeWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [occasion, setOccasion] = useState<OccasionType>('wedding');
  const [style, setStyle] = useState<StylePreference>('traditional');
  const [budgetStr, setBudgetStr] = useState<string>('8,00,000');
  const [guestCount, setGuestCount] = useState<number>(200);
  const [city, setCity] = useState<string>('Lucknow');

  // Event date 4 months in future by default
  const defaultFutureDate = new Date();
  defaultFutureDate.setMonth(defaultFutureDate.getMonth() + 4);
  const [eventDate, setEventDate] = useState<string>(
    defaultFutureDate.toISOString().split('T')[0]
  );

  const [priorities, setPriorities] = useState<PriorityItem[]>([
    'food',
    'venue',
    'decoration',
    'photography',
    'guest_comfort',
    'entertainment',
  ]);

  const [mustHaves, setMustHaves] = useState<string>('');
  const [culturalNotes, setCulturalNotes] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Sample scenario loader: Pre-fills input fields ONLY (₹8 lakh, 200 guests, 4 months away)
  const handleLoadSample = () => {
    setOccasion('wedding');
    setStyle('traditional');
    setBudgetStr('8,00,000');
    setGuestCount(200);
    setCity('Jaipur');
    const fourMonths = new Date();
    fourMonths.setMonth(fourMonths.getMonth() + 4);
    setEventDate(fourMonths.toISOString().split('T')[0]);
    setPriorities(['food', 'venue', 'photography', 'decoration', 'guest_comfort', 'entertainment']);
    setMustHaves('Authentic Rajasthani Dal Baati counter, Drone coverage for Varmala');
    setCulturalNotes('Marwari wedding traditions with daytime Sangeet and evening Phere');
    setValidationErrors({});
    onClearError();
  };

  // Move priority up or down
  const movePriority = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= priorities.length) return;
    const copy = [...priorities];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);
    setPriorities(copy);
  };

  // Validate step before advancing
  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 2) {
      const budgetNum = parseINR(budgetStr);
      if (!budgetNum || budgetNum < 10000) {
        errs.budget = language === 'hi' ? 'बजट कम से कम ₹10,000 होना चाहिए' : 'Budget must be at least ₹10,000';
      } else if (budgetNum > 1000000000) {
        errs.budget = language === 'hi' ? 'बजट ₹100 करोड़ से अधिक नहीं हो सकता' : 'Budget cannot exceed ₹100 crore';
      }

      if (!guestCount || guestCount < 1 || guestCount > 5000) {
        errs.guests = language === 'hi' ? 'मेहमानों की संख्या 1 से 5,000 के बीच होनी चाहिए' : 'Guest count must be between 1 and 5,000';
      }

      if (!city.trim()) {
        errs.city = language === 'hi' ? 'शहर का नाम आवश्यक है' : 'City is required';
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const chosenDate = new Date(eventDate);
      if (isNaN(chosenDate.getTime()) || chosenDate < today) {
        errs.eventDate = language === 'hi' ? 'समारोह की तारीख आज या भविष्य की होनी चाहिए' : 'Event date must be today or in the future';
      }
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    const budgetNum = parseINR(budgetStr) || 800000;

    const intake: UserIntake = {
      occasion,
      style,
      budget: budgetNum,
      guestCount,
      city: city.trim(),
      eventDate,
      priorities,
      mustHaves: mustHaves.trim(),
      culturalNotes: culturalNotes.trim(),
      language,
    };

    await onSubmit(intake);
  };

  return (
    <div className="max-w-3xl mx-auto card p-6 sm:p-8 space-y-6">
      {/* Wizard Header with Quick Demo Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-saffron-700">
            {language === 'hi' ? 'चरण 4 में से ' + currentStep : `Step ${currentStep} of 4`}
          </span>
          <h2 className="text-2xl font-heading font-bold text-maroon-900">
            {currentStep === 1 && (language === 'hi' ? 'समारोह एवं आयोजन का स्वरूप' : 'Occasion & Celebration Style')}
            {currentStep === 2 && (language === 'hi' ? 'बजट, मेहमान एवं स्थान' : 'Budget, Guests & Location')}
            {currentStep === 3 && (language === 'hi' ? 'प्राथमिकता क्रम' : 'Set Spending Priorities')}
            {currentStep === 4 && (language === 'hi' ? 'विशेष आवश्यकताएं एवं सांस्कृतिक परंपराएं' : 'Must-Haves & Cultural Traditions')}
          </h2>
        </div>

        {/* Load Sample Scenario button */}
        <button
          type="button"
          onClick={handleLoadSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-maroon-900 bg-cream-100 hover:bg-cream-200 rounded-lg border border-cream-300 self-start sm:self-auto transition-colors"
          title="Pre-fills inputs with ₹8 Lakh, 200 Guests, Jaipur sample scenario"
        >
          <span>🎯</span>
          <span>{language === 'hi' ? 'नमूना परिदृश्य भरें' : 'Load Sample Scenario'}</span>
        </button>
      </div>

      {/* Progress Tracker Dots */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              step <= currentStep ? 'bg-maroon-900' : 'bg-cream-200'
            }`}
          />
        ))}
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <AlertBanner
          type="error"
          title={language === 'hi' ? 'योजना बनाने में त्रुटि' : 'Plan Generation Failed'}
          message={error}
          onRetry={handleNext}
          retryLabel={language === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}
        />
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="py-12 space-y-4 text-center" aria-live="polite">
          <div className="w-12 h-12 border-4 border-maroon-900 border-t-saffron-500 rounded-full animate-spin mx-auto" />
          <h3 className="font-heading font-semibold text-lg text-maroon-900">
            {language === 'hi'
              ? 'AI द्वारा वित्तीय योजना का निर्माण हो रहा है...'
              : 'Consulting AI Financial Guard...'}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {language === 'hi'
              ? 'हम आपके शहर की बाजार दरों, प्राथमिकताओं और बजट सुरक्षा के आधार पर सटीक प्रतिशत विभाजन तय कर रहे हैं।'
              : 'Analyzing local market standards, inflation safeguards, and your ranked priorities...'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Occasion & Style */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="label-text">
                  {language === 'hi' ? 'समारोह का प्रकार' : 'Occasion Type'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {OCCASIONS.map((occ) => (
                    <button
                      type="button"
                      key={occ.value}
                      onClick={() => setOccasion(occ.value)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        occasion === occ.value
                          ? 'border-maroon-900 bg-maroon-50/60 ring-1 ring-maroon-900'
                          : 'border-cream-300 hover:border-maroon-300 bg-white'
                      }`}
                    >
                      <span className="text-2xl">{occ.icon}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {language === 'hi' ? occ.labelHi : occ.labelEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-text">
                  {language === 'hi' ? 'आयोजन का स्वरूप एवं शैली' : 'Celebration Style'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {STYLES.map((st) => (
                    <button
                      type="button"
                      key={st.value}
                      onClick={() => setStyle(st.value)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        style === st.value
                          ? 'border-maroon-900 bg-maroon-50/60 ring-1 ring-maroon-900'
                          : 'border-cream-300 hover:border-maroon-300 bg-white'
                      }`}
                    >
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 mb-1">
                          {language === 'hi' ? st.labelHi : st.labelEn}
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {language === 'hi' ? st.descHi : st.descEn}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Budget, Guests, City, Date */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Total Budget */}
                <div>
                  <label htmlFor="budget-input" className="label-text">
                    {language === 'hi' ? 'कुल बजट (₹ भारतीय रुपये में)' : 'Total Budget (₹ INR)'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 font-semibold">
                      ₹
                    </span>
                    <input
                      id="budget-input"
                      type="text"
                      value={budgetStr}
                      onChange={(e) => {
                        const parsed = parseINR(e.target.value);
                        setBudgetStr(parsed !== null ? formatIndianNumber(parsed) : e.target.value);
                      }}
                      placeholder="8,00,000"
                      className="input-field pl-8"
                      required
                    />
                  </div>
                  {validationErrors.budget && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.budget}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">
                    {language === 'hi'
                      ? 'लक्षित दायरा: ₹2 लाख से ₹25 लाख'
                      : 'Target middle-class range: ₹2 Lakh to ₹25 Lakh'}
                  </p>
                </div>

                {/* Guest Count */}
                <div>
                  <label htmlFor="guest-input" className="label-text">
                    {language === 'hi' ? 'अपेक्षित मेहमान संख्या' : 'Guest Count'}
                  </label>
                  <input
                    id="guest-input"
                    type="number"
                    min="1"
                    max="5000"
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 0)}
                    placeholder="200"
                    className="input-field"
                    required
                  />
                  {validationErrors.guests && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.guests}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">
                    {language === 'hi'
                      ? 'भोजन एवं स्थान का मुख्य व्यय मेहमानों पर निर्भर करता है'
                      : 'Catering and venue scale directly with headcount'}
                  </p>
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city-input" className="label-text">
                    {language === 'hi' ? 'समारोह का शहर / स्थान' : 'Event City / Location'}
                  </label>
                  <input
                    id="city-input"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lucknow, Pune, Jaipur"
                    className="input-field"
                    required
                  />
                  {validationErrors.city && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.city}</p>
                  )}
                </div>

                {/* Event Date */}
                <div>
                  <label htmlFor="date-input" className="label-text">
                    {language === 'hi' ? 'समारोह की तारीख' : 'Event Date'}
                  </label>
                  <input
                    id="date-input"
                    type="date"
                    value={eventDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="input-field"
                    required
                  />
                  {validationErrors.eventDate && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.eventDate}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Priority Ranking */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  {language === 'hi'
                    ? 'अपनी प्राथमिकताओं को ऊपर या नीचे करके क्रमबद्ध करें। शीर्ष श्रेणियों को अधिक बजट आवंटित किया जाएगा।'
                    : 'Reorder categories by your personal priorities. Top-ranked items receive stronger financial defense.'}
                </p>

                <div className="space-y-2">
                  {priorities.map((item, idx) => (
                    <div
                      key={item}
                      className="flex items-center justify-between p-3 rounded-xl border border-cream-300 bg-white shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-maroon-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-lg">{PRIORITY_LABELS[item]?.icon}</span>
                        <span className="text-sm font-medium text-gray-800">
                          {language === 'hi' ? PRIORITY_LABELS[item]?.hi : PRIORITY_LABELS[item]?.en}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => movePriority(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-maroon-900 disabled:opacity-20"
                          aria-label={`Move ${item} up`}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => movePriority(idx, 'down')}
                          disabled={idx === priorities.length - 1}
                          className="p-1 text-gray-400 hover:text-maroon-900 disabled:opacity-20"
                          aria-label={`Move ${item} down`}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Must-Haves & Cultural Notes */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label htmlFor="musthaves-input" className="label-text">
                  {language === 'hi' ? 'अनिवार्य इच्छाएं (Must-Haves - वैकल्पिक)' : 'Must-Haves (Optional)'}
                </label>
                <textarea
                  id="musthaves-input"
                  rows={3}
                  value={mustHaves}
                  onChange={(e) => setMustHaves(e.target.value)}
                  maxLength={2000}
                  placeholder={
                    language === 'hi'
                      ? 'उदा. लाइव चाट काउंटर, ड्रोन वीडियोग्राफी, विशेष मंडप'
                      : 'e.g. Live chaat counter, Drone cinematography for varmala, separate AC hall for seniors'
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="cultural-input" className="label-text">
                  {language === 'hi' ? 'सांस्कृतिक एवं पारिवारिक परंपराएं (वैकल्पिक)' : 'Cultural Notes & Traditions (Optional)'}
                </label>
                <textarea
                  id="cultural-input"
                  rows={3}
                  value={culturalNotes}
                  onChange={(e) => setCulturalNotes(e.target.value)}
                  maxLength={2000}
                  placeholder={
                    language === 'hi'
                      ? 'उदा. मारवाड़ी, पंजाबी, दक्षिण भारतीय परंपराएं, पूजा की विशेष सामग्री'
                      : 'e.g. Traditional Marwari ceremonies, North-South fusion menu, evening Nikah'
                  }
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* Wizard Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-cream-200">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="btn-outline px-4 py-2 text-xs sm:text-sm"
              >
                {language === 'hi' ? '← पिछला' : '← Back'}
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary px-6 py-2.5 text-xs sm:text-sm"
              >
                {language === 'hi' ? 'अगला कदम →' : 'Next Step →'}
              </button>
            ) : (
              <button
                type="submit"
                className="btn-secondary px-8 py-3 text-sm font-semibold shadow-md hover:shadow-lg"
              >
                {language === 'hi' ? '✨ बजट योजना तैयार करें' : '✨ Generate AI Budget Plan'}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
