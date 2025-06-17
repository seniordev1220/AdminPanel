const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('adminToken');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || 'An error occurred');
  }

  return response;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface UserUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
}

export interface ActivityLog {
  id: number;
  user_id?: number;
  activity_type: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
  ip_address: string;
  user_agent: string;
}

export interface ActivityQueryParams {
  skip?: number;
  limit?: number;
  activity_type?: string;
}

export interface UserQueryParams {
  skip?: number;
  limit?: number;
}

export interface UserCreate {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface Feature {
  description: string;
  included: boolean;
}

export interface PricePlan {
  id: number;
  name: string;
  monthly_price: string;
  annual_price: string;
  included_seats: number;
  additional_seat_price: string;
  features: Feature[];
  is_best_value: boolean;
  is_active: boolean;
  stripe_price_id_monthly: string;
  stripe_price_id_annual: string;
  created_at: string;
  updated_at: string;
}

export interface PricePlanCreate {
  name: string;
  monthly_price: string;
  annual_price: string;
  included_seats: number;
  additional_seat_price: string;
  features: Feature[];
  is_best_value: boolean;
  is_active: boolean;
  stripe_price_id_monthly?: string;
  stripe_price_id_annual?: string;
}

export interface PricePlanUpdate extends Partial<PricePlanCreate> {}

export const auth = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Invalid credentials' }));
      throw new Error(error.detail || 'Invalid credentials');
    }

    return response.json();
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await fetchWithAuth('/users/me');
    return response.json();
  },

  updateProfile: async (data: UserUpdate): Promise<UserProfile> => {
    const response = await fetchWithAuth('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await fetchWithAuth('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  },

  getUserById: async (userId: number): Promise<UserProfile> => {
    const response = await fetchWithAuth(`/users/${userId}`);
    return response.json();
  },
};

export const activities = {
  getMyActivities: async (params: ActivityQueryParams = {}): Promise<ActivityLog[]> => {
    const searchParams = new URLSearchParams();
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params.activity_type) searchParams.append('activity_type', params.activity_type);

    const response = await fetchWithAuth(`/activities/me?${searchParams.toString()}`);
    return response.json();
  },

  getRecentActivities: async (params: ActivityQueryParams = {}): Promise<ActivityLog[]> => {
    const searchParams = new URLSearchParams();
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params.activity_type) searchParams.append('activity_type', params.activity_type);

    const response = await fetchWithAuth(`/activities/recent?${searchParams.toString()}`);
    return response.json();
  },
};

export const users = {
  getAllUsers: async (params: UserQueryParams = {}): Promise<UserProfile[]> => {
    const searchParams = new URLSearchParams();
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());

    const response = await fetchWithAuth(`/users?${searchParams.toString()}`);
    return response.json();
  },

  createUser: async (userData: UserCreate): Promise<UserProfile> => {
    const response = await fetchWithAuth('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  deleteUser: async (userId: number): Promise<void> => {
    await fetchWithAuth(`/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

export const pricePlans = {
  getAllPlans: async (activeOnly: boolean = true): Promise<PricePlan[]> => {
    const searchParams = new URLSearchParams();
    searchParams.append('active_only', activeOnly.toString());
    const response = await fetchWithAuth(`/price-plans?${searchParams.toString()}`);
    return response.json();
  },

  getPlanById: async (planId: number): Promise<PricePlan> => {
    const response = await fetchWithAuth(`/price-plans/${planId}`);
    return response.json();
  },

  createPlan: async (planData: PricePlanCreate): Promise<PricePlan> => {
    // Format the data to match API expectations
    const formattedData = {
      ...planData,
      monthly_price: planData.monthly_price.toString(),
      annual_price: planData.annual_price.toString(),
      additional_seat_price: planData.additional_seat_price.toString(),
      features: planData.features.map(feature => ({
        description: feature.description,
        included: true // All features are included by default
      })).filter(f => f.description.trim() !== '') // Remove empty features
    };

    const response = await fetchWithAuth('/price-plans/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });

    // Log the response for debugging
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to create price plan: ${errorText}`);
    }

    return response.json();
  },

  updatePlan: async (planId: number, planData: PricePlanUpdate): Promise<PricePlan> => {
    const response = await fetchWithAuth(`/price-plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
    return response.json();
  },

  deletePlan: async (planId: number): Promise<void> => {
    await fetchWithAuth(`/price-plans/${planId}`, {
      method: 'DELETE',
    });
  },
};

export default { auth, users, activities, pricePlans }; 