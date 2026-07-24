import { useEffect, useState } from 'react';
import { X, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { hasAlreadyReviewed, hasPaidPurchase, submitReview } from '@/lib/reviews';

interface ReviewFormModalProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  onSubmitted: () => void;
}

type Status = 'checking' | 'not_logged_in' | 'not_purchased' | 'already_reviewed' | 'ready' | 'success' | 'error';

export default function ReviewFormModal({ open, onClose, courseId, courseName, onSubmitted }: ReviewFormModalProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>('checking');
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function checkEligibility() {
      setStatus('checking');
      if (!user) {
        setStatus('not_logged_in');
        return;
      }
      const [purchased, alreadyReviewed] = await Promise.all([
        hasPaidPurchase(courseId),
        hasAlreadyReviewed(courseId, user.id),
      ]);
      if (cancelled) return;
      if (alreadyReviewed) {
        setStatus('already_reviewed');
      } else if (!purchased) {
        setStatus('not_purchased');
      } else {
        setName(user.user_metadata?.full_name ?? '');
        setStatus('ready');
      }
    }

    checkEligibility();
    return () => {
      cancelled = true;
    };
  }, [open, user, courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim() || !comment.trim()) return;
    setSubmitting(true);
    const { error } = await submitReview({ courseId, userId: user.id, studentName: name, rating, comment });
    setSubmitting(false);
    if (error) {
      setStatus('error');
      return;
    }
    setStatus('success');
    onSubmitted();
  };

  const handleClose = () => {
    onClose();
    setComment('');
    setRating(5);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-[440px] rounded-2xl p-6 sm:p-8 relative"
            style={{ backgroundColor: '#FAF7F2' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-full transition-colors"
              style={{ color: '#6B5B4F' }}
              aria-label="Fermer"
            >
              <X size={22} />
            </button>

            <h3 className="font-display font-semibold mb-1" style={{ fontSize: '1.5rem', color: '#1A1A1A' }}>
              {t('review.form.title')}
            </h3>
            <p className="text-sm mb-6" style={{ color: '#6B5B4F' }}>
              {courseName}
            </p>

            {status === 'checking' && (
              <p className="text-sm" style={{ color: '#6B5B4F' }}>
                ...
              </p>
            )}

            {status === 'not_logged_in' && (
              <div>
                <p className="text-sm mb-5" style={{ color: '#6B5B4F' }}>
                  {t('review.form.needlogin')}
                </p>
                <Link to="/connection" className="btn-primary w-full inline-flex justify-center" onClick={handleClose}>
                  {t('review.form.loginbtn')}
                </Link>
              </div>
            )}

            {status === 'not_purchased' && (
              <p className="text-sm" style={{ color: '#6B5B4F' }}>
                {t('review.form.needpurchase')}
              </p>
            )}

            {status === 'already_reviewed' && (
              <p className="text-sm" style={{ color: '#6B5B4F' }}>
                {t('review.form.alreadyreviewed')}
              </p>
            )}

            {status === 'error' && (
              <p className="text-sm" style={{ color: '#D00000' }}>
                {t('review.form.error')}
              </p>
            )}

            {status === 'success' && (
              <p className="text-sm font-semibold" style={{ color: '#1B4332' }}>
                {t('review.form.success')}
              </p>
            )}

            {status === 'ready' && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#1A1A1A' }}>
                    {t('form.name')}
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2"
                    style={{ borderColor: 'rgba(27,67,50,0.2)', backgroundColor: 'white' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#1A1A1A' }}>
                    {t('review.form.rating')}
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        type="button"
                        key={i}
                        onMouseEnter={() => setHoverRating(i)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(i)}
                        aria-label={`${i} star`}
                      >
                        <Star size={26} fill={i <= (hoverRating || rating) ? '#F2A900' : 'none'} style={{ color: '#F2A900' }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#1A1A1A' }}>
                    {t('review.form.comment')}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 resize-none"
                    style={{ borderColor: 'rgba(27,67,50,0.2)', backgroundColor: 'white' }}
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
                  {submitting ? '...' : t('review.form.submit')}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
