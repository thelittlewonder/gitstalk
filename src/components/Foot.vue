<template>
    <footer>
      <p>Stalking? I call it Social Research</p>
      <a href="http://www.github.com/thelittlewonder/gitstalk">✏️ thelittlewonder/gitstalk</a>
    </footer>
</template>

<script>
export default {
  name: "Foot",
  data() {
    return {};
  }
};
</script>

<style scoped lang="scss">
footer {
  font-size: 0.75em;
  letter-spacing: 0.01em;
  text-align: center;
  p {
    color: #aaaaaa;
    margin-bottom: 0.5em;
  }
}
@media screen and (max-width: 767px) {
  footer {
    padding: 1.5em 0;
  }
}
@media screen and (min-width: 768px) {
  footer {
    padding-top: 3em;
  }
}
</style>
