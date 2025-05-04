<template>
  <div class="top-vulnerabilities">
    <h2>Top Vulnerabilities</h2>
    <div class="filters">
      <label for="severityFilter">Filter by Severity:</label>
      <select id="severityFilter" v-model="selectedSeverity">
        <option value="">All</option>
        <option value="CRITICAL">Critical</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
        <option value="LOW">Low</option>
      </select>
    </div>
    <ul>
      <li v-for="vuln in filteredVulnerabilities" :key="vuln.cve_id">
        <strong>{{ vuln.cve_id }}</strong> - Severity: {{ vuln.cvss_v3_severity }}
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { MockDataProvider } from '../services/mockDataProvider';

export default {
  props: ['token'],
  setup(props) {
    const vulnerabilities = ref([]);
    const selectedSeverity = ref('');
    let socket = null;

    const filteredVulnerabilities = computed(() => {
      let filtered = vulnerabilities.value;
      if (selectedSeverity.value) {
        filtered = filtered.filter(v => v.cvss_v3_severity === selectedSeverity.value);
      }
      // Sort by severity order: CRITICAL > HIGH > MEDIUM > LOW
      const severityOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
      filtered.sort((a, b) => (severityOrder[a.cvss_v3_severity] || 5) - (severityOrder[b.cvss_v3_severity] || 5));
      return filtered;
    });

    async function fetchMockData() {
      vulnerabilities.value = await MockDataProvider.getTopVulnerabilities();
    }

    onMounted(() => {
      if (process.env.VUE_APP_USE_MOCK_DATA === 'true') {
        fetchMockData();
      } else {
        socket = new WebSocket(`ws://localhost:8080/ws/top-vulnerabilities?token=${props.token}`);
        socket.onmessage = event => {
          const data = JSON.parse(event.data);
          vulnerabilities.value = data.topVulnerabilities || [];
        };
        socket.onopen = () => {
          console.log('TopVulnerabilities WebSocket connected');
        };
        socket.onclose = () => {
          console.log('TopVulnerabilities WebSocket disconnected');
        };
        socket.onerror = error => {
          console.error('TopVulnerabilities WebSocket error:', error);
        };
      }
    });

    onBeforeUnmount(() => {
      if (socket) {
        socket.close();
      }
    });

    return {
      vulnerabilities,
      selectedSeverity,
      filteredVulnerabilities
    };
  }
};
</script>

<style scoped>
.top-vulnerabilities {
  max-width: 400px;
  margin: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.top-vulnerabilities h2 {
  margin-bottom: 10px;
}
.filters {
  margin-bottom: 10px;
}
.top-vulnerabilities ul {
  list-style: none;
  padding: 0;
}
.top-vulnerabilities li {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}
.top-vulnerabilities li:hover {
  background-color: #f0f0f0;
}
</style>
