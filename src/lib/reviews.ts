import { supabase } from '@/lib/supabaseClient';

export interface CourseReviewRecord {
  id: string;
  student_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CoursePublicStats {
  studentsEnrolled: number;
  avgRating: number;
  reviewCount: number;
}

// Real, aggregate numbers only (no fake data): students enrolled comes from
// actual paid purchases, rating/review count comes from actual reviews.
export async function fetchCourseStats(courseId: string): Promise<CoursePublicStats> {
  const { data, error } = await supabase.rpc('get_course_public_stats', { p_course_id: courseId });
  if (error || !data || !data[0]) {
    return { studentsEnrolled: 0, avgRating: 0, reviewCount: 0 };
  }
  const row = data[0];
  return {
    studentsEnrolled: Number(row.students_enrolled) || 0,
    avgRating: Number(row.avg_rating) || 0,
    reviewCount: Number(row.review_count) || 0,
  };
}

// Real reviews only - returns [] when there are none (never fabricated).
export async function fetchCourseReviews(courseId: string): Promise<CourseReviewRecord[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, student_name, rating, comment, created_at')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as CourseReviewRecord[];
}

// A student can review a course only if they have a completed (paid)
// purchase for it. This mirrors the server-side RLS check, so the UI can
// guide them accurately before they try to submit.
export async function hasPaidPurchase(courseId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('purchases')
    .select('id')
    .eq('course_id', courseId)
    .eq('status', 'paid')
    .limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
}

export async function hasAlreadyReviewed(courseId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
}

export async function submitReview(params: {
  courseId: string;
  userId: string;
  studentName: string;
  rating: number;
  comment: string;
}): Promise<{ error: string | null }> {
  const { courseId, userId, studentName, rating, comment } = params;
  const { error } = await supabase.from('reviews').insert({
    course_id: courseId,
    user_id: userId,
    student_name: studentName.trim(),
    rating,
    comment: comment.trim(),
  });
  if (error) return { error: error.message };
  return { error: null };
}
