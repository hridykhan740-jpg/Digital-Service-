export type ServiceType = 'facebook_verification' | 'website_dev' | 'app_dev' | 'sim_offer' | 'top_up';

export interface PlatformService {
  id: string; // matches ServiceType or unique ID
  title: string;
  description: string;
  icon: string; // Lucide icon name
  active: boolean;
  priceInfo?: string;
  adminOnly?: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  mobile: string;
  balance: number;
  role: 'user' | 'admin';
  createdAt: any;
}

export interface Submission {
  id?: string;
  userId: string;
  userEmail: string;
  serviceType: ServiceType;
  details: any;
  paymentScreenshot?: string;
  status: 'pending' | 'success' | 'rejected';
  createdAt: any;
}

export interface SimOffer {
  id?: string;
  operator: 'GP' | 'Robi' | 'Banglalink' | 'Airtel' | 'Robi/Airtel Family';
  type: 'Bundle' | 'Minute' | 'Internet';
  title: string;
  price: string;
  validity: string;
  description: string;
  active: boolean;
}

export const ADMIN_EMAILS = ["mhossenali740@gmail.com", "hridykhan740@gmail.com"];
export const ADMIN_EMAIL = ADMIN_EMAILS[0];
