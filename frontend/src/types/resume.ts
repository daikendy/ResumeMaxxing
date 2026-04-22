/**
 * Unified Type System for ResumeMaxxing
 * Source of truth for all Resume, Job, and User data.
 */

export interface ResumeContent {
  contact: {
    name: string;
    email: string;
    phone?: string;
    github?: string;
    linkedin?: string;
    location?: string;
  };
  summary?: string;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    technologies?: string;
    bullets: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
    location?: string;
    gpa?: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    technologies?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
  }>;
  skills: string[];
}

export interface ResumeVersion {
  id: number;
  tracked_job_id: number;
  version_number: number;
  is_active: boolean;
  resume_content: ResumeContent;
  created_at: string;
  match_score?: number;
}

export interface MasterProfile {
  id: number;
  user_id: string;
  resume_data: ResumeContent;
}

export interface TrackedJob {
  id: number;
  company_name?: string;
  job_title: string;
  job_description: string;
  original_resume_id?: number;
  status: string;
  job_url?: string; // ⚡ Added
  target_score?: number;
  resume_versions?: ResumeVersion[];
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  subscription_tier: 'free' | 'premium_1' | 'premium_2';
  generations_used: number;
  generations_limit: number;
  referral_code: string;
  referred_by: string | null;
  bonus_quota: number;
}
