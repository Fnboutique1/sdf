import { GraduationCap, ShieldCheck, Globe2, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import CTA from '@/sections/CTA';
import { courses } from '@/data/courses';

// Palette adapted from the provided design system (Academic Excellence).
// Note: the CTA red is kept as the site's established brand red (#D00000)
// instead of the design doc's literal tertiary hex, so buttons stay
// consistent with every other page (Courses, Home, etc).
const c = {
  primary: '#042415',
  primaryContainer: '#1b3a29',
  secondary: '#775a19',
  gold: '#fed488',
  surface: '#f8faf8',
  surfaceLow: '#f2f4f2',
  surfaceHighest: '#e1e3e1',
  onSurfaceVariant: '#424843',
  outlineVariant: '#c2c8c1',
  red: '#D00000',
};

const methodSteps = [
  { key: 'aboutpage.method1', num: '১' },
  { key: 'aboutpage.method2', num: '২' },
  { key: 'aboutpage.method3', num: '৩' },
];

const methodStepsFr = [
  { key: 'aboutpage.method1', num: '1' },
  { key: 'aboutpage.method2', num: '2' },
  { key: 'aboutpage.method3', num: '3' },
];

export default function AboutPage() {
  const { t, lang } = useLanguage();
  const steps = lang === 'bn' ? methodSteps : methodStepsFr;

  const pillars = [
    { key: 'aboutpage.pillar1', icon: GraduationCap, highlight: false },
    { key: 'aboutpage.pillar2', icon: ShieldCheck, highlight: true },
    { key: 'aboutpage.pillar3', icon: Globe2, highlight: false },
  ];

  const stats = [
    { num: t('about.stat1.num'), label: t('aboutpage.stats.students') },
    { num: String(courses.length), label: t('aboutpage.stats.categories') },
    { num: t('about.stat3.num'), label: t('aboutpage.stats.satisfaction') },
    { num: '24/7', label: t('aboutpage.stats.support') },
  ];

  return (
    <main style={{ backgroundColor: c.surface }}>
      {/* Hero */}
      <section
        className="relative flex items-center overflow-hidden"
        style={{
          backgroundColor: c.primary,
          paddingTop: 'calc(72px + 5rem)',
          paddingBottom: '5rem',
          minHeight: '520px',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&h=900&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.18,
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to top, ${c.primary}, ${c.primary}CC, transparent)` }}
        />
        <div className="relative w-full max-w-[900px] mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p
              className="text-xs font-semibold tracking-[0.15em] uppercase mb-4"
              style={{ color: c.gold }}
            >
              {t('aboutpage.hero.label')}
            </p>
            <h1
              className="font-display font-semibold text-white"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)', lineHeight: 1.15, letterSpacing: '-0.01em' }}
            >
              {t('aboutpage.hero.title1')}{' '}
              <span style={{ color: c.gold }}>{t('aboutpage.hero.title2')}</span>
            </h1>
            <p className="text-base sm:text-lg mt-6 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {t('aboutpage.hero.desc')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Pillars */}
      <section style={{ backgroundColor: c.surfaceLow, padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="font-display font-semibold" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', color: c.primary }}>
              {t('aboutpage.pillars.title')}
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-base" style={{ color: c.onSurfaceVariant }}>
              {t('aboutpage.pillars.desc')}
            </p>
            <div className="w-20 h-1 mx-auto mt-6 rounded-full" style={{ backgroundColor: c.gold }} />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`p-8 rounded-2xl transition-all duration-300 ${p.highlight ? 'md:scale-105 md:z-10' : 'shadow-sm hover:shadow-md'}`}
                  style={{
                    backgroundColor: p.highlight ? c.primary : '#ffffff',
                    border: p.highlight ? 'none' : `1px solid ${c.outlineVariant}66`,
                    boxShadow: p.highlight ? '0 12px 32px rgba(4,36,21,0.25)' : undefined,
                  }}
                >
                  <Icon size={36} style={{ color: p.highlight ? c.gold : c.secondary, marginBottom: '1.5rem' }} />
                  <h3
                    className="font-display font-semibold mb-3"
                    style={{ fontSize: '1.375rem', color: p.highlight ? '#ffffff' : c.primary }}
                  >
                    {t(`${p.key}.title`)}
                  </h3>
                  <p style={{ color: p.highlight ? 'rgba(255,255,255,0.85)' : c.onSurfaceVariant, lineHeight: 1.7 }}>
                    {t(`${p.key}.desc`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Teaching Methodology */}
      <section style={{ backgroundColor: c.surface, padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop"
                alt="FN Formation"
                className="w-full rounded-2xl shadow-xl object-cover"
                loading="lazy"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="order-1 lg:order-2 space-y-8"
            >
              <h2 className="font-display font-semibold" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: c.primary }}>
                {t('aboutpage.method.title')}
              </h2>
              <div className="space-y-6">
                {steps.map((s, i) => (
                  <div key={s.key} className="flex gap-4">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold"
                      style={{ backgroundColor: c.gold, color: c.primary }}
                    >
                      {s.num}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1" style={{ color: c.primary }}>
                        {t(`${s.key}.title`)}
                      </h4>
                      <p style={{ color: c.onSurfaceVariant, lineHeight: 1.7 }}>
                        {t(`${s.key}.desc`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ backgroundColor: c.surfaceHighest, padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users size={22} style={{ color: c.secondary }} />
            </div>
            <h2 className="font-display font-semibold" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', color: c.primary }}>
              {t('aboutpage.team.title')}
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-base" style={{ color: c.onSurfaceVariant }}>
              {t('aboutpage.team.desc')}
            </p>
            <div className="w-20 h-1 mx-auto mt-6 rounded-full" style={{ backgroundColor: c.gold }} />
          </motion.div>

          {/* Founder spotlight */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-12 bg-white p-6 sm:p-8 rounded-3xl shadow-lg"
            style={{ border: `1px solid ${c.outlineVariant}55` }}
          >
            <div className="lg:col-span-5 relative">
              <img
                src="team/fahim.jpg"
                alt="Mahmudur Rahman FAHIM"
                className="w-full aspect-square object-cover rounded-2xl shadow-lg"
                style={{ border: `4px solid ${c.surface}` }}
              />
              <div
                className="absolute bottom-4 -right-2 sm:-right-4 px-4 py-2.5 rounded-xl shadow-lg"
                style={{ backgroundColor: c.primary }}
              >
                <p className="font-bold text-white text-sm">{t('aboutpage.team.lead.badge')}</p>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-5">
              <h3 className="font-display font-semibold text-3xl sm:text-4xl" style={{ color: c.primary }}>
                Mahmudur Rahman FAHIM
              </h3>
              <p
                className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                style={{ backgroundColor: `${c.primaryContainer}22`, color: c.primaryContainer }}
              >
                CEO & Enseignant de DELF A1 - B2
              </p>
              <p className="italic leading-relaxed" style={{ color: c.onSurfaceVariant, fontSize: '1.05rem' }}>
                {t('aboutpage.team.lead.quote')}
              </p>
              <div className="pt-2 flex gap-10">
                <div>
                  <span className="block text-3xl font-bold" style={{ color: c.primary }}>{t('about.stat2.num')}</span>
                  <span className="text-xs uppercase tracking-widest font-bold" style={{ color: c.secondary }}>
                    {t('about.stat2.label')}
                  </span>
                </div>
                <div>
                  <span className="block text-3xl font-bold" style={{ color: c.primary }}>{t('about.stat1.num')}</span>
                  <span className="text-xs uppercase tracking-widest font-bold" style={{ color: c.secondary }}>
                    {t('about.stat1.label')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Other team members */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-3xl flex flex-col gap-5 items-start hover:shadow-xl transition-all duration-300"
              style={{ border: `1px solid ${c.outlineVariant}55` }}
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
                <img src="team/maruf.jpg" alt="Mahmudul Hasan MARUF" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-display font-semibold mb-1 text-xl" style={{ color: c.primary }}>Mahmudul Hasan MARUF</h4>
                <p className="font-bold text-xs mb-3 uppercase tracking-widest" style={{ color: c.secondary }}>
                  Administrateur & Enseignant de DELF A1 - A2
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-8 rounded-3xl flex flex-col gap-5 items-start hover:shadow-xl transition-all duration-300"
              style={{ border: `1px solid ${c.outlineVariant}55` }}
            >
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md font-display font-semibold text-2xl text-white"
                style={{ backgroundColor: c.primary }}
              >
                T
              </div>
              <div>
                <h4 className="font-display font-semibold mb-1 text-xl" style={{ color: c.primary }}>Taib UMAR</h4>
                <p className="font-bold text-xs mb-3 uppercase tracking-widest" style={{ color: c.secondary }}>
                  Marketing Manager & IT Manager
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section style={{ backgroundColor: c.primary, padding: 'clamp(3rem, 6vw, 4rem) 0' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <span className="font-display font-semibold block" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: c.gold }}>
                {s.num}
              </span>
              <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      <CTA />
    </main>
  );
}
