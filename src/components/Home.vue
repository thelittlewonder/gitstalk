<template>
  <div class="home">
    <form @submit.prevent="search()" class="search">
      <div class="brandlogo"/>
      <h3>Discover who's upto what...</h3>
      <div class="biatch">
        <div>github.com/</div>
        <input name="username" v-model="username" @keypress="toggle()" placeholder="Enter Github Username">
        <button type="submit">Search</button>
      </div>
      <button class="secondary" @click="getRandom()"><a>Randomise User?</a></button>
      <p v-if="showError" style="color:#FE5E44">Please enter a username</p>
    </form>
    <Foot></Foot>
  </div>
</template>

<script>
import Foot from "./Foot.vue";
export default {
  name: "Home",
  data() {
    return {
      username: "",
      showError: false,
      randomUsers: [
        "thelittlewonder",
        "tj",
        "hackerkid",
        "phobal",
        "rhysd",
        "himanshub16",
        "mixn",
        "mubaris",
        "invokesus",
        "shubham-padia",
        "CosmicCoder96"
      ]
    };
  },
  components: {
    Foot
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
    },
    getRandom: function() {
      let random = this.randomUsers[
        Math.floor(Math.random() * this.randomUsers.length)
      ];
      this.username = random;
      search();
    }
  }
};
</script>

<style scoped lang="scss">
</style>
