export interface UserCreate {
  id: string;
  email: string;
}

export interface UserResponse {
  id: string;
  email: string;
  subscription_tier: string;
  generations_used: number;
  generations_limit: number;
  created_at: string;
}
