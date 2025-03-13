<template>
  <div>
    <nuxt-link to="/"><- Back to sensors</nuxt-link>
    <h1>Sensor Data for {{ sensorDisplayName }}</h1>

    <!-- Active Toggle Control -->
    <div v-if="sensorData">
      <label for="activeToggle">Active:</label>
      <input
        type="checkbox"
        id="activeToggle"
        v-model="sensorForm.active"
        @change="submitActiveToggle"
      />
    </div>

    <!-- Time Range Filter Controls -->
    <div v-if="sensorData">
      <label>Filter by Time Range:</label>
      <button
        v-for="range in timeRanges"
        :key="range.label"
        :class="{ active: isActiveRange(range.value) }"
        @click="updateTimeRange(range.value)"
      >
        {{ range.label }}
      </button>
    </div>

    <!-- Display Errors or Chart -->
    <div v-if="error">
      <p>Error: {{ error.message }}</p>
    </div>
    <div v-else-if="sensorData">
      <TimeSeriesChart :records="sensorData.records" />
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>

    <!-- Form for updating sensor details -->
    <div v-if="sensorData">
      <h2>Edit Sensor Details</h2>
      <form @submit.prevent="submitForm">
        <div>
          <label for="name">Name:</label>
          <input id="name" v-model="sensorForm.name" type="text" />
        </div>
        <div>
          <label for="threshold_green">Threshold Green:</label>
          <input
            id="threshold_green"
            v-model.number="sensorForm.threshold_green"
            type="number"
            step="0.01"
          />
        </div>
        <div>
          <label for="threshold_yellow">Threshold Yellow:</label>
          <input
            id="threshold_yellow"
            v-model.number="sensorForm.threshold_yellow"
            type="number"
            step="0.01"
          />
        </div>
        <div>
          <label for="threshold_red">Threshold Red:</label>
          <input
            id="threshold_red"
            v-model.number="sensorForm.threshold_red"
            type="number"
            step="0.01"
          />
        </div>
        <div>
          <label for="description">Description:</label>
          <textarea id="description" v-model="sensorForm.description"></textarea>
        </div>
        <button type="submit">Update Sensor</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getSensorDetail, updateSensor } from '~/api.js'
import TimeSeriesChart from '~/components/TimeSeriesChart.vue'
import { format } from 'date-fns'

// Retrieve sensor id from the route
const route = useRoute();
const id = route.params.id

// Calculate the current time to build date ranges
const now = new Date()

// Define available time range options with start_date and end_date.
const timeRanges = [
  {
    label: 'Last Hour',
    value: {
      start_date: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      end_date: now.toISOString()
    }
  },
  {
    label: 'Last Day',
    value: {
      start_date: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      end_date: now.toISOString()
    }
  },
  {
    label: 'Last Month',
    value: {
      start_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: now.toISOString()
    }
  },
  {
    label: 'All Time',
    value: { start_date: null, end_date: null }
  }
]

// Reactive variable for the selected time range; default is All Time.
const selectedTimeRange = ref(timeRanges[3].value)

// Fetch sensor details (including time series records) filtered by time range.
const { data: sensorData, error, refresh } = await useAsyncData('sensorData', () =>
  getSensorDetail(id, selectedTimeRange.value)
)

// Watch for changes in selectedTimeRange to refresh the sensor data.
watch(selectedTimeRange, async () => {
  await refresh()
})

// Reactive object for form fields (including the active status)
const sensorForm = reactive({
  active: false,
  name: '',
  threshold_green: null,
  threshold_yellow: null,
  threshold_red: null,
  description: ''
})

// Initialize form values when sensorData is loaded.
watch(
  sensorData,
  (newVal) => {
    if (
      newVal &&
      newVal.records &&
      newVal.records.length > 0 &&
      newVal.records[0].sensor
    ) {
      const sensorDetail = newVal.records[0].sensor
      sensorForm.active = sensorDetail.active || false
      sensorForm.name = sensorDetail.name || ''
      sensorForm.threshold_green = sensorDetail.threshold_green || null
      sensorForm.threshold_yellow = sensorDetail.threshold_yellow || null
      sensorForm.threshold_red = sensorDetail.threshold_red || null
      sensorForm.description = sensorDetail.description || ''
    }
  },
  { immediate: true }
)

// Computed property to display the sensor's name (fallback to id if not available)
const sensorDisplayName = computed(() => {
  if (
    sensorData.value &&
    sensorData.value.records &&
    sensorData.value.records.length > 0 &&
    sensorData.value.records[0].sensor.name
  ) {
    return sensorData.value.records[0].sensor.name
  }
  return id
})

// Function to update the selected time range when a control is clicked.
function updateTimeRange(rangeValue) {
  selectedTimeRange.value = rangeValue
}

// Helper function to determine if a given time range is active.
function isActiveRange(rangeValue) {
  return JSON.stringify(selectedTimeRange.value) === JSON.stringify(rangeValue)
}

// Submit handler for updating sensor details (excluding the active toggle)
async function submitForm() {
  try {
    await updateSensor(id, {
      name: sensorForm.name,
      threshold_green: sensorForm.threshold_green,
      threshold_yellow: sensorForm.threshold_yellow,
      threshold_red: sensorForm.threshold_red,
      description: sensorForm.description
    })
    await refresh()
  } catch (err) {
    console.error('Error updating sensor:', err)
    alert('Error updating sensor')
  }
}

// Submit handler for updating the active toggle
async function submitActiveToggle() {
  try {
    await updateSensor(id, { active: sensorForm.active })
    await refresh()
  } catch (err) {
    console.error('Error updating active state:', err)
    alert('Error updating sensor active state')
  }
}
</script>

<style scoped>
button {
  margin-right: 8px;
  padding: 4px 8px;
  border: none;
  background-color: #eee;
  cursor: pointer;
}

button.active {
  font-weight: bold;
  background-color: #ccc;
}
</style>
