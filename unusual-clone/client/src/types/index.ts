export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Replacement {
  id?: string;
  selector: string;
  content: string;
}

export interface Source {
  id?: string;
  user_id: string;
  name: string;
  rule_type: 'referrer_contains' | 'url_param_equals';
  rule_value: string;
  param_name?: string;
  param_value?: string;
  replacements: Replacement[];
  priority: number;
  active: boolean;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
} 