<template>
  <div>
    <button @click="toggleAutoRefresh">{{ autoRefresh ? 'Stop' : 'Start' }} Auto Refresh</button>
    <p/>
    Only Show Active:
    <input
        type="checkbox"
        id="activeToggle"
        v-model="active"
        @change="fetchRecords"
      />
    <table border="1" cellpadding="10" cellspacing="0">
      <thead>
        <tr>
          <th @click="setSort('name')" style="cursor: pointer;">
            Sensor Name{{ getSortIndicator('name') }}
          </th>
          <th @click="setSort('value')" style="cursor: pointer;">
            Value{{ getSortIndicator('value') }}
          </th>
          <th>Status</th>
          <th @click="setSort('created_at')" style="cursor: pointer;">
            Last Updated{{ getSortIndicator('created_at') }}
          </th>
          <th>Active</th>
        </tr>
      </thead>
      <tbody>
      <tr v-for="record in records" :key="record.id">
        <td>
          <nuxt-link :to="`/sensor-data/${record.sensor_id}`">
            {{ record.name || record.sensor_id }}
          </nuxt-link>
        </td>
        <td>{{ record.value }}</td>
        <td>
          <div
              class="status-square"
              :style="getStatusClass(record.status)"
          ></div>
        </td>
        <td>{{ formattedCreatedAt(record) }}</td>
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
      active: true,
      autoRefresh: false,
      sortField: '',    // new property to track which field to sort by
      sortOrder: 'asc', // new property to track the sort order (asc or desc)
      interval: null,
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
      if (this.active) {
        params.active = this.active;
      }

      if (this.selectedStatus) {
        params.statuses = [this.selectedStatus];
      }

      if (this.sortField) {
        params.sort_by = this.sortField;
        params.order = this.sortOrder;
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
    // Set or toggle sorting options based on the field clicked.
    setSort(field) {
      if (this.sortField === field) {
        // Toggle sort order if the same field is clicked again.
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        // Change sort field and reset order to ascending.
        this.sortField = field;
        this.sortOrder = 'asc';
      }
      // Reset to the first page whenever sorting changes.
      this.page = 1;
      this.fetchRecords();
    },
    // Return a visual indicator (arrow) if the column is currently sorted.
    getSortIndicator(field) {
      if (this.sortField === field) {
        return this.sortOrder === 'asc' ? ' ▲' : ' ▼';
      }
      return '';
    },
    getStatusClass(status) {
      return {
        width: '20px',
        height: '20px',
        backgroundColor: status,
      };
    },
    formattedCreatedAt(record) {
      return moment.utc(record.created_at).local().fromNow();
    },
  },
  mounted() {
    this.fetchRecords();
    if (this.autoRefresh) {
      this.interval = setInterval(this.fetchRecords, 5*60*1000);
    }
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
