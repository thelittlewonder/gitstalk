<template>
  <div id="app">
    <transition name="fade">
      <router-view/>
    </transition>
  </div>
</template>

<script>
import "reset-css";
export default {
  name: "App"
};
</script>

<style lang="scss">
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
html {
  font-family: "Rubik";
  background-color: #fdfdfd;
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
