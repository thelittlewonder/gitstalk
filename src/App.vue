<template>
  <div id="app" class="light-theme">
    <transition name="fade">
      <router-view />
    </transition>
  </div>
</template>

<script>
import "reset-css";
export default {
  name: "App",
  metaInfo: {
    title: "Gitstalk",
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
      },
      {
        name: "theme-color",
        content: "#5c75f6"
      }
    ]
  },
  mounted: function() {
    let today = new Date()
    if (
      (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches) ||  today.getHours() >= 22 || (today.getHours() >= 0 && today.getHours() <=5)
    ) {
      document.body.style.backgroundColor = "#1a1c21";
        document.getElementById("app").className = "dark-theme";
        //favicon
        document.querySelector("link[rel='shortcut icon']").href =
          "./static/favicon-dark.png";
        document.querySelector("link[rel*='icon']").href =
          "./static/favicon-dark.png";
    }
  }
};
</script>

<style lang="scss">
.light-theme {
  @import "./css/themes/light";
  .profile {
    @import "./css/base-profile";
  }
  .home {
    @import "./css/base-home";
  }
}

.dark-theme {
  @import "./css/themes/dark";
  .profile {
    @import "./css/base-profile";
  }
  .home {
    @import "./css/base-home";
  }
}

.fade-enter-active,
.fade-leave-active {
  transition-property: opacity;
  transition-duration: 0.25s;
}

.fade-enter-active {
  transition-delay: 0.25s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
#app {
  font-family: "Rubik";
}
a {
  color: #5c75f6;
  text-decoration: none;
  @extend .expand;
}
.icon {
  vertical-align: text-top;
  margin-right: 0.6em;
}
.expand {
  position: relative;
  text-decoration: none;
  display: inline-block;
}
.expand:after {
  display: block;
  content: "";
  border-bottom: solid 2px #5c75f6;
  transform: scaleX(0);
  transition: transform 350ms ease-in-out;
  transform-origin: 100% 50%;
}
.expand:hover:after {
  transform: scaleX(1);
  transform-origin: 0 50%;
}
.spinner {
  width: 40px;
  height: 40px;
  margin: 100px auto;
  background-color: #5c75f6;
  border-radius: 100%;
  -webkit-animation: sk-scaleout 1s infinite ease-in-out;
  animation: sk-scaleout 1s infinite ease-in-out;
}
@-webkit-keyframes sk-scaleout {
  0% {
    -webkit-transform: scale(0);
  }
  100% {
    -webkit-transform: scale(1);
    opacity: 0;
  }
}

@keyframes sk-scaleout {
  0% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
    opacity: 0;
  }
}
</style>
