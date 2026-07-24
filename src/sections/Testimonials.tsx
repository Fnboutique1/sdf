import { useLanguage } from '@/contexts/LanguageContext';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const students = [
  'শাহাদাত — যাচাইকৃত রিভিউ',
  'Shahadat — Avis vérifié',
  'আম্বিয়া রুবেল — যাচাইকৃত রিভিউ',
  'Ambia Rubel — Avis vérifié',
  'হাফিজা আক্তার — DELF A2 উত্তীর্ণ',
  'Hafiza Akter — Réussi DELF A2',
  'আমিনা চৌধুরী — DELF A1 উত্তীর্ণ',
  'Amina Ch. — Réussi DELF A1',
  'আদনান হাবিব — যাচাইকৃত রিভিউ',
  'Adnan Habib — Avis vérifié',
];

// Real, verified student reviews (screenshots supplied directly by FN Formation).
// Each image is a self-contained review card, so it's shown as-is with no
// overlaid/duplicated text.
const reviews = [
  { name: 'Shahadat', image: '/reviews/review-shahadat.jpg' },
  { name: 'Ambia Rubel', image: '/reviews/review-ambia.jpg' },
  { name: 'Hafiza Akter', image: '/reviews/review-hafiza.jpg' },
  { name: 'Amina Ch. RICHY', image: '/reviews/review-amina.jpg' },
  { name: 'Adnan Habib', image: '/reviews/review-adnan.jpg' },
];

export default function Testimonials() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const row1 = [...students, ...students];
  const row2 = [...students.slice(5), ...students.slice(0, 5), ...students.slice(5), ...students.slice(0, 5)];

  return (
    <section
      ref={sectionRef}
      className="section-dark overflow-hidden"
      style={{ padding: 'clamp(4rem, 8vw, 8rem) 0 4rem' }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="font-display font-semibold text-center"
          style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
          }}
        >
          {t('trust.title')}
        </motion.h2>
      </div>

      {/* Marquee Row 1 - Left */}
      <div className="relative mb-6">
        <div className="flex animate-marquee-left whitespace-nowrap" style={{ width: 'max-content' }}>
          {row1.map((name, i) => (
            <span key={`r1-${i}`} className="flex items-center mx-6">
              <span className="text-sm font-semibold tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {name}
              </span>
              <span className="ml-6 text-[#D00000]">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Marquee Row 2 - Right */}
      <div className="relative mb-14">
        <div className="flex animate-marquee-right whitespace-nowrap" style={{ width: 'max-content' }}>
          {row2.map((name, i) => (
            <span key={`r2-${i}`} className="flex items-center mx-6">
              <span className="text-sm font-semibold tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {name}
              </span>
              <span className="ml-6 text-[#D00000]">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Auto-scrolling Review Cards (right to left) */}
      <div className="relative overflow-hidden">
        <div className="flex animate-marquee-left" style={{ width: 'max-content' }}>
          {[...reviews, ...reviews].map((review, i) => (
            <div
              key={`review-${i}`}
              className="mx-3 flex-shrink-0 rounded-2xl overflow-hidden"
              style={{
                width: '280px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <img
                src={review.image}
                alt={`Avis de ${review.name}`}
                className="w-full object-cover"
                style={{ aspectRatio: '1/1' }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
