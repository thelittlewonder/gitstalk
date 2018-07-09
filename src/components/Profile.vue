<template>
  <div>
    <h1>User Profile</h1>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  data () {
    return {
      
    }
  },
  mounted: function() {
    console.log(this.$route.params.id);
  }
}
</script>

<style scoped>
</style>