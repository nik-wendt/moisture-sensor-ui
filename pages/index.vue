<template>
  <div id="app">
    <h1>Sensors</h1>
    <SensorDataList />
  </div>
</template>

<script>
import SensorDataList from "~/components/SensorDataList.vue";

export default {
  name: 'App',
  components: {
    SensorDataList,
  },
};
</script>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 20px;
  line-height: 1.6;
}
</style>