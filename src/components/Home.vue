<template>
  <div class="home">
    <form @submit.prevent="search()" class="search">
      <img src="../assets/gitstalk.svg">
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
        "littlewonder",
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
  metaInfo: {
    title: "Gitstalk",
    titleTemplate: "%s - Gitstalk",
    meta: [
      {
        name: "keywords",
        content:
          "github, github analyser, gitstalk, git stalk, github analysis, github stats"
      },
      {
        name: "description",
        content:
          "Discover who's upto what on Github. Web-App to analyse Github users activity"
      },
      { name: "subject", content: "Discover who's upto what on Github" },
      { name: "author", content: "@thelittlewonder" },
      { name: "url", content: "http://gitstalk.herokuapp.com" },
      { name: "og:title", content: "Gitstalk" },
      { name: "og:site_name", content: "Gitstalk" },
      { name: "og:type", content: "website" },
      { name: "og:url", content: "http://gitstalk.herokuapp.com" },
      {
        name: "og:description",
        content:
          "Discover who's upto what on Github. Web-App to analyse Github users activity"
      },
      {
        name: "twitter:card",
        content:
          "Discover who's upto what on Github. Web-App to analyse Github users activity"
      },
      {
        name: "twitter:site",
        content: "http://gitstalk.herokuapp.com"
      },
      { name: "twitter:title", content: "Gitstalk" },
      {
        name: "twitter:description",
        content: "Discover who's upto what on Github"
      },
      { name: "twitter:creator", content: "@thelittlewonder" },
      { itemprop: "name", content: "Gitstalk" },
      {
        itemprop: "description",
        content:
          "Discover who's upto what on Github. Web-App to analyse Github users activity"
      }
    ]
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
$main: #5c75f6;
::-webkit-input-placeholder {
  color: #bbb;
  font-family: "Rubik";
}
.search {
  min-height: calc(100vh - 16px);
}
.home {
  max-width: 960px;
  text-align: center;
  margin: auto;
  position: absolute;
  top: 40%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
  img {
    margin-bottom: 0.75em;
    height: 40px;
  }
  h3 {
    margin-bottom: 4em;
    opacity: 0.5;
    font-size: 0.75em;
  }
}
.search {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .biatch {
    display: flex;
    flex-direction: row;
    align-items: center;
    input {
      margin-left: 0.25em;
    }
    button {
      padding: 0.6em 2em 0.5em 2em;
      cursor: pointer;
      background-color: $main;
      font-size: 1em;
      border-radius: 0 2px 2px 0;
      color: #fff;
      font-family: "Rubik";
      border: none;
      letter-spacing: 0.01em;
    }
  }
  input {
    min-width: 350px;
    display: block;
    background: #ffffff;
    border: 1px solid #f1f1f1;
    box-sizing: border-box;
    font-size: 1em;
    padding: 0.5em 0.75em;
    border-radius: 2px 0 0 2px;
    transition-property: all;
    transition-duration: 0.3s;
    transition-timing-function: ease-in-out;
    &:focus {
      outline: none;
      border: 1px solid $main;
    }
  }
  .secondary {
    margin-top: 1em;
    background: transparent;
    padding: 0.5em;
    cursor: pointer;
    font-size: 0.75em;
    border-radius: 2px;
    color: #aaa;
    font-family: "Rubik";
    border: none;
    letter-spacing: 0.01em;
    &:focus {
      outline: none;
    }
  }
}

@media screen and (max-width: 767px) {
  .biatch {
    flex-direction: column !important;
    div {
      display: none;
    }
    input {
      min-width: 320px !important;
    }
    button {
      border-radius: 2px;
      margin-top: 0.5em;
    }
  }
}
</style>
