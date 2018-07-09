<template>
  <div>
    <h1>User Profile</h1>
    <div v-if="loading">
      Loading...
    </div>
    <div v-else>
      <div v-for="activity in result" :key="activity.id">
        {{activity.id}}
      </div>
      <div v-if="result.length===0">Username does not exists</div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "Profile",
  data() {
    return {
      result: [],
      loading: true,
      error: ""
    };
  },
  mounted: function() {
    let user = this.$route.params.id;
    axios
      .get("https://api.github.com/users/" + user + "/events")
      .then(result => {
        this.result = result.data;
        this.loading = false;
      })
      .catch(err => {
        this.error = err;
      });
  }
};
</script>

<style scoped>
</style>