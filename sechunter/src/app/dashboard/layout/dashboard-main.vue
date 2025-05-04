<template>
  <div class="dashboard-main flex flex-col h-full p-4">
    <div class="flex flex-1">
      <!-- Instance Manager (Left) -->
      <section class="instance-manager w-1/4 p-2 border-r border-gray-300">
        <h2 class="text-lg font-bold mb-4">Instance Manager</h2>
        <button class="mb-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
          Agréger une instance
        </button>
        <ul>
          <li v-for="client in clients" :key="client.id" class="flex items-center cursor-pointer mb-2 hover:bg-gray-100 p-1 rounded">
            <span class="mr-2" :class="client.status === 'OK' ? 'text-green-500' : 'text-red-500'">
              {{ client.status === 'OK' ? '🟢' : '🔴' }}
            </span>
            {{ client.name }}
          </li>
        </ul>
      </section>

      <!-- Favorites / Quick Widgets (Right) -->
      <section class="favorites-widgets w-3/4 p-2">
        <h2 class="text-lg font-bold mb-4">Favoris / Widgets Rapides</h2>
        <div class="grid grid-cols-2 gap-4">
          <!-- Placeholder widgets -->
          <div class="widget bg-white p-4 rounded shadow">
            <h3 class="font-semibold mb-2">CTI - Threat Overview</h3>
            <div>Bar Chart Placeholder</div>
          </div>
          <div class="widget bg-white p-4 rounded shadow">
            <h3 class="font-semibold mb-2">VI - Top 5 Vulnerabilities</h3>
            <div>Table Placeholder</div>
          </div>
          <!-- Add more widgets as needed -->
        </div>
      </section>
    </div>

    <!-- Recent Memos (Bottom) -->
    <section class="recent-memos mt-4 p-2 border-t border-gray-300 bg-white rounded shadow">
      <h2 class="text-lg font-bold mb-2">Mémos Récentes</h2>
      <ul>
        <li v-for="memo in memos" :key="memo.id" class="mb-1">
          {{ memo.message }}
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
export default {
  name: 'DashboardMain',
  data() {
    return {
      clients: [
        { id: 1, name: 'Client A', status: 'OK' },
        { id: 2, name: 'Client B', status: 'Alert' },
        { id: 3, name: 'Client C', status: 'OK' }
      ],
      memos: [
        { id: 1, message: 'Nouveau scan CTI Lime6' },
        { id: 2, message: 'Scan ASM terminal #1HxDD' },
        { id: 3, message: 'Correctif déployé pour CVE-2023-XXXX' }
      ]
    };
  }
};
</script>

<style scoped>
.dashboard-main {
  height: 100%;
  background-color: #f9fafb;
}
</style>
