import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Clock, PlayCircle, BookOpen, Award, ChevronLeft, ChevronDown, Star, Users, FileCheck2, GraduationCap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCourseBySlug } from '@/data/courses';
import { supabase } from '@/lib/supabaseClient';
import { fetchCourseStats, fetchCourseReviews, type CoursePublicStats, type CourseReviewRecord } from '@/lib/reviews';
import DemoVideoModal from '@/components/DemoVideoModal';
import OrderFormModal from '@/components/OrderFormModal';
import ReviewFormModal from '@/components/ReviewFormModal';

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(rating) ? '#F2A900' : 'none'}
          style={{ color: '#F2A900' }}
        />
      ))}
    </span>
  );
}

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const course = slug ? getCourseBySlug(slug) : undefined;

  const [demoOpen, setDemoOpen] = useState(false);
  const [whatsappFallbackOpen, setWhatsappFallbackOpen] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [openWeek, setOpenWeek] = useState<number | null>(1);

  // Real numbers only: students enrolled = actual paid purchases, rating
  // and reviews = actual reviews left by verified buyers. Starts at zero /
  // empty and is never filled with placeholder data.
  const [stats, setStats] = useState<CoursePublicStats>({ studentsEnrolled: 0, avgRating: 0, reviewCount: 0 });
  const [reviews, setReviews] = useState<CourseReviewRecord[]>([]);

  const courseId = course?.id;

  const loadReviewData = async () => {
    if (!courseId) return;
    const [statsResult, reviewsResult] = await Promise.all([
      fetchCourseStats(courseId),
      fetchCourseReviews(courseId),
    ]);
    setStats(statsResult);
    setReviews(reviewsResult);
  };

  useEffect(() => {
    loadReviewData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  if (!course) {
    return (
      <main className="section-light" style={{ paddingTop: 'calc(72px + 6rem)', paddingBottom: '6rem' }}>
        <div className="max-w-[600px] mx-auto text-center px-4">
          <p style={{ color: '#6B5B4F' }}>Cours introuvable.</p>
          <Link to="/courses" className="btn-primary mt-6 inline-flex">
            {t('coursedetail.back')}
          </Link>
        </div>
      </main>
    );
  }

  const courseName = t(`${course.key}.title`);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      // This calls a Supabase Edge Function ("create-checkout-session") that
      // must be deployed separately once Stripe keys are configured (see
      // supabase/functions/create-checkout-session in the project source).
      // It creates a Stripe Checkout Session server-side and returns its URL.
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          courseId: course.id,
          courseName,
          priceEur: course.price,
        },
      });

      if (error || !data?.url) throw new Error('checkout unavailable');
      window.location.href = data.url;
    } catch {
      // Stripe / edge function not deployed yet — graceful fallback to the
      // WhatsApp order form so students can still purchase manually.
      setWhatsappFallbackOpen(true);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <main>
      {/* Header */}
      <section className="section-dark" style={{ paddingTop: 'calc(72px + 3rem)', paddingBottom: '3rem' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1 text-sm mb-6 transition-opacity hover:opacity-80"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <ChevronLeft size={16} />
            {t('coursedetail.back')}
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider mb-4"
              style={{ backgroundColor: '#D00000', color: 'white' }}
            >
              {course.level}
            </span>
            <h1
              className="font-semibold mb-4"
              style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)', letterSpacing: '-0.01em', lineHeight: 1.2 }}
            >
              {courseName}
            </h1>
            <p className="text-base max-w-[640px]" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {t(`${course.key}.desc`)}
            </p>

            {/* Rating + enrolled — real numbers only, hidden until they exist */}
            <div className="flex flex-wrap items-center gap-2 mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {stats.reviewCount > 0 && (
                <>
                  <Stars rating={stats.avgRating} />
                  <span className="font-semibold">{stats.avgRating.toFixed(1)}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>({stats.reviewCount} {t('coursedetail.reviews')})</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
                </>
              )}
              <span className="flex items-center gap-1.5">
                <Users size={15} />
                {stats.studentsEnrolled} {t('coursedetail.enrolled')}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-5 mt-5 text-sm">
              {[
                { icon: Clock, label: course.duration },
                { icon: BookOpen, label: `${course.lessons} ${t('coursedetail.lessons')}` },
                { icon: Award, label: `${t('coursedetail.level')}: ${course.level}` },
              ].map(({ icon: Icon, label }, i) => (
                <span key={i} className="flex items-center gap-2 font-bold" style={{ color: 'white' }}>
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#D00000' }}
                  >
                    <Icon size={14} color="white" />
                  </span>
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="section-light" style={{ padding: 'clamp(3rem, 6vw, 5rem) 0' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-14 items-start">
            {/* Left column */}
            <div className="flex flex-col gap-12">
              {/* Preview video */}
              <div className="youtube-container w-full rounded-2xl overflow-hidden shadow-lg relative group cursor-pointer" style={{ aspectRatio: '16/9' }} onClick={() => setDemoOpen(true)}>
                <img src={course.image} alt={courseName} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                  <PlayCircle size={72} color="white" style={{ opacity: 0.9 }} />
                </div>
              </div>

              {/* Overview / Objective */}
              <div>
                <h2 className="font-display font-semibold mb-4" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#1A1A1A' }}>
                  {t('coursedetail.overview')}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: '#6B5B4F' }}>
                  {course.objective}
                </p>
              </div>

              {/* What you'll learn */}
              <div>
                <h2 className="font-display font-semibold mb-5" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#1A1A1A' }}>
                  {t('coursedetail.whatyoulearn')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[t('coursedetail.learn1'), t('coursedetail.learn2'), t('coursedetail.learn3'), t('coursedetail.learn4')].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check size={18} style={{ color: '#2D6A4F', flexShrink: 0, marginTop: 2 }} />
                      <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Curriculum */}
              <div>
                <h2 className="font-display font-semibold mb-2" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#1A1A1A' }}>
                  {t('coursedetail.curriculum')}
                </h2>
                <p className="text-sm mb-5" style={{ color: '#6B5B4F' }}>
                  {course.weeks.length} {t('coursedetail.weeks')} · {course.lessons} {t('coursedetail.lessons')}
                </p>
                <div className="flex flex-col gap-3">
                  {course.weeks.map((wk) => {
                    const isOpen = openWeek === wk.week;
                    return (
                      <div key={wk.week} className="card-light" style={{ padding: 0, overflow: 'hidden' }}>
                        <button
                          onClick={() => setOpenWeek(isOpen ? null : wk.week)}
                          className="w-full flex items-center justify-between gap-3 px-6 py-4 text-left"
                        >
                          <span className="text-sm font-bold" style={{ color: '#1A1A1A' }}>
                            {t('coursedetail.week')} {wk.week}
                          </span>
                          <span className="flex items-center gap-3">
                            <span className="text-xs" style={{ color: '#6B5B4F' }}>
                              {wk.classes.length} {t('coursedetail.classes')}
                            </span>
                            <ChevronDown
                              size={18}
                              style={{ color: '#6B5B4F', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                            />
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-5">
                            <ul className="flex flex-col gap-2 mb-3">
                              {wk.classes.map((cls, j) => (
                                <li key={j} className="flex items-center gap-2 text-sm" style={{ color: '#6B5B4F' }}>
                                  <PlayCircle size={14} style={{ color: '#2D6A4F', flexShrink: 0 }} />
                                  {cls}
                                </li>
                              ))}
                            </ul>
                            <p className="flex items-start gap-2 text-xs font-semibold mb-1.5" style={{ color: '#D00000' }}>
                              <FileCheck2 size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                              {wk.assignment}
                            </p>
                            <p className="flex items-start gap-2 text-xs font-semibold" style={{ color: '#1B4332' }}>
                              <Award size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                              {wk.exam}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Certificate demo — shown right at the bottom of Week 16 */}
                <div
                  className="mt-6 rounded-2xl p-6 sm:p-8"
                  style={{ backgroundColor: '#1B4332' }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap size={18} color="#F2A900" />
                    <span className="text-xs font-bold tracking-wider uppercase" style={{ color: '#F2A900' }}>
                      {t('coursedetail.certificate.demo.label')}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: 'white' }}>
                    {t('coursedetail.certificate.demo.title')}
                  </h3>
                  <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {t('coursedetail.certificate.demo.desc')}
                  </p>

                  {/*
                    Certificate mock-up — intentionally always in French,
                    matching FN Formation's real "Attestation de suivi de
                    formation" document, regardless of the site's display
                    language. This is a legal/administrative document, not
                    UI copy, so it isn't run through t().
                  */}
                  <div
                    className="relative rounded-xl mx-auto"
                    style={{
                      maxWidth: 640,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(27,67,50,0.15)',
                      padding: 'clamp(1.5rem, 4vw, 2.75rem)',
                    }}
                  >
                    <div className="flex flex-col items-center mb-6">
                      <GraduationCap size={26} style={{ color: '#1B4332' }} />
                      <span className="text-xs font-bold tracking-[0.2em] uppercase mt-1" style={{ color: '#1B4332' }}>
                        FN Formation
                      </span>
                      <span className="text-[10px] mt-0.5" style={{ color: '#6B5B4F' }}>
                        Apprenez le français et conduisez vers le succès
                      </span>
                    </div>

                    <h4
                      className="text-center font-display font-bold uppercase mb-5"
                      style={{ fontSize: 'clamp(1.1rem, 2.6vw, 1.5rem)', color: '#1A1A1A', letterSpacing: '0.02em' }}
                    >
                      Attestation de suivi de formation
                    </h4>

                    <p className="text-sm leading-relaxed mb-3" style={{ color: '#3A3A3A' }}>
                      En qualité de Président de l'organisme <strong>FN FORMATION</strong>, j'atteste, par la
                      présente, que <strong>Prénom Nom</strong>, né(e) le <strong>JJ/MM/AAAA</strong>, a suivi la
                      formation « <strong>{courseName}</strong> » d'une durée de 4 mois ({course.lessons} heures),
                      du <strong>JJ/MM/AAAA</strong> au <strong>JJ/MM/AAAA</strong>.
                    </p>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: '#3A3A3A' }}>
                      Cette formation visait à renforcer ses compétences en français en vue de l'examen
                      du {course.level}.
                    </p>

                    <p className="text-sm mb-1" style={{ color: '#3A3A3A' }}>
                      Fait pour faire valoir ce que de droit.
                    </p>
                    <p className="text-sm mb-8" style={{ color: '#3A3A3A' }}>
                      A Bobigny, le JJ/MM/AAAA
                    </p>

                    <div className="flex items-end justify-between gap-4 pt-4" style={{ borderTop: '1px solid rgba(27,67,50,0.15)' }}>
                      <div>
                        <p className="font-display italic text-sm mb-0.5" style={{ color: '#1A1A1A' }}>Mahmudur Rahman FAHIM</p>
                        <p className="text-[11px] font-semibold" style={{ color: '#6B5B4F' }}>Signature — CEO & Enseignant principal</p>
                      </div>
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#D00000' }}
                      >
                        <Award size={22} color="white" />
                      </div>
                    </div>

                    <span
                      className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(27,67,50,0.08)', color: '#1B4332' }}
                    >
                      {t('coursedetail.certificate.auto')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h2 className="font-display font-semibold mb-5" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#1A1A1A' }}>
                  {t('coursedetail.requirements')}
                </h2>
                <ul className="flex flex-col gap-2">
                  {[t('coursedetail.requirements.1'), t('coursedetail.requirements.2'), t('coursedetail.requirements.3')].map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm" style={{ color: '#6B5B4F' }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#D00000' }} />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructor */}
              <div className="card-light flex items-center gap-4">
                <img
                  src="team/fahim.jpg"
                  alt="Mahmudur Rahman FAHIM"
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6B5B4F' }}>
                    {t('coursedetail.instructor')}
                  </p>
                  <p className="text-base font-bold" style={{ color: '#1A1A1A' }}>Mahmudur Rahman FAHIM</p>
                  <p className="text-sm" style={{ color: '#6B5B4F' }}>CEO & Enseignant de DELF A1 - B2</p>
                </div>
              </div>

              {/* Reviews — real reviews only, blank/empty state when there are none yet */}
              <div>
                <h2 className="font-display font-semibold mb-2" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#1A1A1A' }}>
                  {t('coursedetail.reviews')}
                </h2>

                {stats.reviewCount > 0 ? (
                  <div className="flex items-center gap-2 mb-5">
                    <Stars rating={stats.avgRating} size={16} />
                    <span className="text-sm font-bold" style={{ color: '#1A1A1A' }}>{stats.avgRating.toFixed(1)}</span>
                    <span className="text-sm" style={{ color: '#6B5B4F' }}>({stats.reviewCount})</span>
                  </div>
                ) : (
                  <p className="text-sm mb-5" style={{ color: '#6B5B4F' }}>
                    {t('coursedetail.reviews.empty')}
                  </p>
                )}

                {reviews.length > 0 && (
                  <div className="flex flex-col gap-4 mb-5">
                    {reviews.map((review) => (
                      <div key={review.id} className="card-light">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold" style={{ color: '#1A1A1A' }}>{review.student_name}</p>
                          <Stars rating={review.rating} />
                        </div>
                        <span
                          className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mb-2"
                          style={{ backgroundColor: 'rgba(27,67,50,0.08)', color: '#1B4332' }}
                        >
                          {course.level}
                        </span>
                        <p className="text-sm" style={{ color: '#6B5B4F' }}>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setReviewFormOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase border-2 transition-all duration-300"
                  style={{ borderColor: '#1B4332', color: '#1B4332' }}
                >
                  <Star size={15} />
                  {t('coursedetail.reviews.share')}
                </button>
              </div>
            </div>

            {/* Right column - sticky purchase card */}
            <div className="lg:sticky" style={{ top: '100px' }}>
              <div className="card-light">
                <img src={course.image} alt={courseName} className="w-full rounded-xl mb-5 object-cover" style={{ aspectRatio: '16/10' }} loading="lazy" />
                <p className="font-display font-bold mb-1" style={{ fontSize: '2.5rem', color: '#D00000' }}>
                  €{course.price}
                </p>
                <div className="flex flex-wrap items-center gap-2 mb-4 text-xs" style={{ color: '#6B5B4F' }}>
                  {stats.reviewCount > 0 && (
                    <>
                      <Stars rating={stats.avgRating} size={13} />
                      <span className="font-semibold">{stats.avgRating.toFixed(1)}</span>
                      <span>·</span>
                    </>
                  )}
                  <Users size={13} />
                  <span>{stats.studentsEnrolled} {t('coursedetail.enrolled')}</span>
                </div>

                <button onClick={handleEnroll} disabled={enrolling} className="btn-primary w-full mb-3">
                  {enrolling ? '...' : t('coursedetail.enroll')}
                </button>
                <button
                  onClick={() => setDemoOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-semibold tracking-wider uppercase border-2 transition-all duration-300"
                  style={{ borderColor: '#1B4332', color: '#1B4332' }}
                >
                  <PlayCircle size={16} />
                  {t('coursedetail.demo')}
                </button>

                <div className="flex flex-col gap-2 mt-6 pt-6" style={{ borderTop: '1px solid rgba(27,67,50,0.12)' }}>
                  {[t('coursedetail.learn1'), t('coursedetail.learn2'), t('coursedetail.learn3'), t('coursedetail.learn4')].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs" style={{ color: '#6B5B4F' }}>
                      <Check size={14} style={{ color: '#2D6A4F', flexShrink: 0, marginTop: 1 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DemoVideoModal open={demoOpen} onClose={() => setDemoOpen(false)} videoId={course.demoVideoId} title={courseName} />
      <OrderFormModal
        open={whatsappFallbackOpen}
        onClose={() => setWhatsappFallbackOpen(false)}
        courseName={courseName}
      />
      <ReviewFormModal
        open={reviewFormOpen}
        onClose={() => setReviewFormOpen(false)}
        courseId={course.id}
        courseName={courseName}
        onSubmitted={loadReviewData}
      />
    </main>
  );
}
