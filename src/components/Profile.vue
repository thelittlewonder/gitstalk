<template>
  <div>
    <h1>User Profile</h1>
    <div v-if="loading">
      Loading...
    </div>
    <div v-if="!showError&&!loading">
      <div>{{profile}}</div>
      <div v-for="activity in activities" :key="activity.id">
        {{activity.id}}
      </div>
      <div>{{getStars}}</div>
      <div>{{getForks}}</div>
      <div>{{getLanguages}}</div>
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
      repos: [],
      loading: true,
      showError: false
    };
  },
  mounted: function() {
    //get username from the route
    let user = this.$route.params.id;
    //make request to github API
    axios
      .all([
        axios.get("https://api.github.com/users/" + user),
        axios.get("https://api.github.com/users/" + user + "/events"),
        axios.get(
          "https://api.github.com/users/" + user + "/repos?per_page=100"
        )
      ])
      .then(
        axios.spread((profile, activity, repo) => {
          //hide loader
          this.loading = false;

          //set data
          this.profile = profile.data;
          this.activities = activity.data;
          this.repos = repo.data;
        })
      )
      .catch(err => {
        this.loading = false;
        console.log(err);
        this.showError = true;
      });
  },
  computed: {
    //get total stars
    getStars: function() {
      let totalStars = 0;
      this.repos.forEach(repo => {
        totalStars += repo.stargazers_count;
      });
      return totalStars;
    },
    //get total forks
    getForks: function() {
      let totalForks = 0;
      this.repos.forEach(repo => {
        totalForks += repo.forks_count;
      });
      return totalForks;
    },
    //get all the languages
    getLanguages: function() {
      let languages = [];
      this.repos.forEach(repo => {
        languages.push(repo.language);
      });
      return languages //remove repeating values
        .filter(function(elem, index, self) {
          return index == self.indexOf(elem);
        }) //remove null values
        .filter(Boolean);
    }
  }
};
</script>

<style scoped>
</style>