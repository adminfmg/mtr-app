export interface IbAffiliate {
  id: number;
  broker_uuid: string | null;
  rank: number | null;
  ticker: string;
  name: string;
  type: string | null;
  regulation: string | null;
  cpa: string | null;
  rebate: string | null;
  rev_share: string | null;
  net_deposit: boolean;
  custom_hybrid: boolean;
  badge: string | null;
  categories: string[];
  is_published: boolean;
  deleted_at: string | null;
  created_at?: string;
  updated_at?: string;
}