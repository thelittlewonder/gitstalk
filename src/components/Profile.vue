<template>
  <div>
    <h1>User Profile</h1>
    <div v-if="loading">
      Loading...
    </div>
    <div v-else>
      <div v-if="!showError">{{profile}}</div>
      <div v-for="activity in activities" :key="activity.id">
        {{activity.id}}
      </div>
    </div>
    <div v-if="showError">Username does not exists</div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "Profile",
  data() {
    return {
      profile: [],
      activities: [],
      loading: true,
      showError: false
    };
  },
  mounted: function() {
    let user = this.$route.params.id;
    axios
      .get("https://api.github.com/users/" + user)
      .then(result => {
        this.profile = result.data;
        axios
          .get("https://api.github.com/users/" + user + "/events")
          .then(result => {
            this.activities = result.data;
            this.loading = false;
          });
      })
      .catch(err => {
        console.log(err);
        this.loading = false;
        this.showError = true;
      });
  }
};
</script>

<style scoped>
</style>