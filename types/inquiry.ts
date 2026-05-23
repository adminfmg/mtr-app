export type InquiryFormType = 'trader' | 'broker' | 'ib_affiliate';
export type InquiryStatus = 'new' | 'read' | 'replied' | 'archived';

export interface Inquiry {
  uuid: string;
  form_type: InquiryFormType;
  name: string;
  email: string;
  phone_number: string | null;
  message: string | null;
  topic: string | null;
  website_url: string | null;
  ib_affiliate_type: string | null;
  status: InquiryStatus;
  created_at: string;
}
