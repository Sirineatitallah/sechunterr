import { fetchMockCveData, CveData } from '../mock/mockCveService';

export class MockDataProvider {
  static async getTopVulnerabilities(): Promise<CveData[]> {
    const data = await fetchMockCveData();
    // For simplicity, return all mock data as top vulnerabilities
    return data;
  }

  static async getVulnerabilityScores(): Promise<number[]> {
    const data = await fetchMockCveData();
    // Map CVE base scores as vulnerability scores
    return data.map(item => item.cvss_v3_base_score);
  }
}
