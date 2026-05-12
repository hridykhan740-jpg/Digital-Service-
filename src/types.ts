export type ServiceType = 'facebook_verification' | 'website_dev' | 'app_dev' | 'sim_offer';

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

export const ADMIN_EMAIL = "hridykhan740@gmail.com";
