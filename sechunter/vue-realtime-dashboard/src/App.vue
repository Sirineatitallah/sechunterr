<template>
  <div id="app">
    <h1>Real-Time Vulnerability Dashboard</h1>
    <Login v-if="!token" @login-success="handleLoginSuccess" />
    <div v-else>
      <VulnerabilityChart :token="token" />
      <TopVulnerabilities :token="token" />
      <button @click="logout">Logout</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import Login from './components/Login.vue';
import VulnerabilityChart from './components/VulnerabilityChart.vue';
import TopVulnerabilities from './components/TopVulnerabilities.vue';

export default {
  components: {
    Login,
    VulnerabilityChart,
    TopVulnerabilities
  },
  setup() {
    const token = ref(localStorage.getItem('authToken') || '');

    function handleLoginSuccess(newToken) {
      token.value = newToken;
      localStorage.setItem('authToken', newToken);
    }

    function logout() {
      token.value = '';
      localStorage.removeItem('authToken');
    }

    return {
      token,
      handleLoginSuccess,
      logout
    };
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  margin: 20px;
}
</style>
