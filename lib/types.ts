export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'student'|'lpn'|'rn'|'md'|'pa'|'np'|'other'|null;
  discipline: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  author_id: string|null;
  title: string|null;
  type: 'video'|'text';
  content: string|null;
  video_url: string|null;
  created_at: string;
  tags: string[]|null;
  upvotes: number|null;
  hidden: boolean|null;
  profiles?: Profile;
  like_count?: number;
  comment_count?: number;
};

export type Note = {
  id: string;
  author_id: string|null;
  title: string;
  description: string|null;
  file_url: string;
  subject: string|null;
  created_at: string;
  upvotes: number|null;
  tags: string[]|null;
  hidden: boolean|null;
};

export type Resource = {
  id: string;
  title: string;
  link: string;
  category: string|null;
  rating: number|null;
  added_by: string|null;
  created_at: string;
  hidden: boolean|null;
  avg_rating?: number|null;
  review_count?: number|null;
};

export type Job = {
  id: string;
  company: string;
  title: string;
  location: string|null;
  url: string;
  posted_at: string;
  added_by: string|null;
  description: string|null;
  hidden: boolean|null;
};

export type Comment = {
  id: string;
  author_id: string|null;
  target_type: 'post'|'note'|'resource'|'job';
  target_id: string;
  body: string;
  created_at: string;
};

export type Like = {
  id: string;
  user_id: string;
  target_type: 'post'|'note'|'resource'|'job';
  target_id: string;
};

export type Follow = {
  follower_id: string;
  followee_id: string;
};

export type ResourceReview = {
  id: string;
  resource_id: string;
  user_id: string;
  rating: number;
  comment: string|null;
  created_at: string;
};

export type Report = {
  id: string;
  reporter_id: string|null;
  target_type: 'post'|'note'|'resource'|'job';
  target_id: string;
  reason: string|null;
  created_at: string;
  resolved: boolean|null;
};

export type Org = {
  id: string;
  name: string;
  website: string|null;
  logo_url: string|null;
  owner_id: string|null;
  created_at: string;
};
