<template>
  <div>
    <h1>Home</h1>
    <form @submit.prevent="search()">
      <label for="username">Enter Username</label>
    <input name="username" v-model="username" @keypress="toggle()">
    <button type="submit">Search</button>
    </form>
    <p v-if="showError">Please enter a username</p>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "Home",
  data() {
    return {
      username: "",
      showError: false
    };
  },
  methods: {
    search: function() {
      let user = this.username;
      if (user) {
        this.$router.push("/" + user);
      } else {
        this.showError = true;
      }
    },
    toggle: function() {
      this.showError = false;
    }
  }
};
</script>

<style scoped>
</style>
