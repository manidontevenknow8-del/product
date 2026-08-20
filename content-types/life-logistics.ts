/** Life-logistics guide pages under /guides/{slug} */

export type LifeLogisticsCluster =
  | 'moving'
  | 'travel'
  | 'sitters'
  | 'multi-pet'
  | 'boarding'
  | 'custody-rehoming';

export type LifeLogisticsFactRow = {
  label: string;
  value: string;
};

export type LifeLogisticsList = {
  heading: string;
  items: string[];
};

export type LifeLogisticsSection = {
  heading: string;
  paragraphs: string[];
};

export type LifeLogisticsFaq = {
  question: string;
  answer: string;
};

export type LifeLogisticsPageRecord = {
  /** URL slug: /guides/{slug} */
  slug: string;
  cluster: LifeLogisticsCluster;
  h1: string;
  primary_keyword: string;
  meta_description: string;
  lead: string;
  data_rows: LifeLogisticsFactRow[];
  data_lists: LifeLogisticsList[];
  sections: LifeLogisticsSection[];
  faqs: LifeLogisticsFaq[];
};
