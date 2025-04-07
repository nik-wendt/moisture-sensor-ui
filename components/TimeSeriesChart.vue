<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'
// Import date adapter to enable time scale parsing
import 'chartjs-adapter-date-fns'

// Define props to accept the sensor records
const props = defineProps({
  records: {
    type: Array,
    required: true
  }
})

const chartCanvas = ref(null)
let chartInstance = null

const createChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Extract labels (timestamps) and data points (values)
  const labels = props.records.map(record => record.created_at)
  const dataPoints = props.records.map(record => record.value)

  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Sensor Value',
        data: dataPoints,
        borderWidth: 2,
        fill: true,
        borderColor: 'blue'
      }]
    },
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            tooltipFormat: 'PPpp',
            unit: 'minute', // base unit
          },
          ticks: {
            stepSize: 30, // show label every 30 minutes
            source: 'auto'
          },
          title: {
            display: false,
            text: 'Time'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Moisture Level'
          }
        }
      }
    }
  })
}

onMounted(() => {
  createChart()
})

watch(() => props.records, () => {
  createChart()
})
</script>
