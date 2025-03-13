<template>
  <div>
    <button @click="toggleAutoRefresh">{{ autoRefresh ? 'Stop' : 'Start' }} Auto Refresh</button>
    <table border="1" cellpadding="10" cellspacing="0">
      <thead>
        <tr>
          <th>Sensor Name</th>
          <th>value</th>
          <th>Status</th>
          <th>Last Updated</th>
          <th>Active</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in records" :key="record.id">
          <td>
            <nuxt-link :to="`/sensor-data/${record.sensor_id}`">{{ record.name || record.sensor_id }}</nuxt-link>
          </td>
          <td>{{ record.value }}</td>
          <td>
            <div
              class="status-square"
              :style="getStatusClass(record.status)"
            ></div>
          </td>
          <td>{{formattedCreatedAt(record)}}</td>
          <td>{{ record.active }}</td>
        </tr>
      </tbody>
    </table>
    <div>
      <button :disabled="page === 1" @click="prevPage">Previous</button>
      <button :disabled="!hasNextPage" @click="nextPage">Next</button>
    </div>
  </div>
</template>

<script>
import {getSensorData} from "~/api.js";
import moment from "moment";

export default {
  data() {
    return {
      records: [],
      page: 1,
      page_size: 10,
      total: 0,
      selectedStatus: '',
      autoRefresh: true,
    };
  },
  computed: {
    hasNextPage() {
      return this.page * this.page_size < this.total;
    },
  },
  methods: {
    async fetchRecords() {
      const params = {
        page: this.page,
        page_size: this.page_size,
      };

      if (this.selectedStatus) {
        params.statuses = [this.selectedStatus];
      }

      try {
        const data = await getSensorData(params);
        this.records = data.records;
        this.total = data.total;
      } catch (error) {
        console.error('Error fetching records:', error);
      }
    },
    prevPage() {
      if (this.page > 1) {
        this.page--;
        this.fetchRecords();
      }
    },
    nextPage() {
      if (this.hasNextPage) {
        this.page++;
        this.fetchRecords();
      }
    },
    toggleAutoRefresh() {
      if (this.autoRefresh) {
        clearInterval(this.interval);
      } else {
        this.interval = setInterval(this.fetchRecords, 5000);
      }
      this.autoRefresh = !this.autoRefresh;
    },
    getStatusClass(status) {
      return {
        width: '20px',
        height: '20px',
        backgroundColor: status
      };
    },
    formattedCreatedAt(record) {
      return moment.utc(record.created_at).local().fromNow();
    }
  },
  mounted() {
    this.fetchRecords();
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
};
</script>

<style scoped>
table {
  margin-top: 20px;
  width: 100%;
  border-collapse: collapse;
}

th, td {
  text-align: left;
  padding: 8px;
}
</style>
