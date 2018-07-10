<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import "reset-css";
export default {
  name: "App"
};
</script>

<style lang="scss">
html {
  font-family: "Rubik";
  background-color: #fdfdfd;
}
a {
  color: #5c75f6;
  text-decoration: none;
  @extend .expand;
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
</style>
