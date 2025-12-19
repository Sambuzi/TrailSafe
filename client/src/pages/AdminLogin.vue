<template>
  <div>
    <p>Pagina admin rimossa. Reindirizzamento in corso...</p>
  </div>
</template>

<script>
export default {
  mounted() {
    // redirect to main login since admin login is integrated there
    this.$router && this.$router.replace('/login');
  }
};
</script>

<style scoped>
/* empty - admin page removed */
</style>
