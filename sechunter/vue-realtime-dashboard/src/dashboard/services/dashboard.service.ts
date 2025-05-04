import { fetchMockCveData } from '../../mock/mockCveService';

export class DashboardService {
  static getMockCveData() {
    return fetchMockCveData();
  }
