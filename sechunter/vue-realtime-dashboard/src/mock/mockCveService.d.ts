export function fetchMockCveData(): Promise<Array<{
  cve_id: string;
  description: string;
  published_date: string;
  last_modified_date: string;
  cvss_v3_base_score: number;
  cvss_v3_severity: string;
}>>;
