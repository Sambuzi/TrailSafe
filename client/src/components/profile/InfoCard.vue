<template>
  <section class="card info-card">
    <h2 class="card-title">Informazioni</h2>
    <div class="info-grid">
      <div class="row"><span class="label">Nome</span><span class="value">{{ profile?.name || '—' }}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">{{ profile?.email || '—' }}</span></div>
      <div class="row"><span class="label">Ruolo</span><span class="value">{{ profile?.role || 'user' }}</span></div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'InfoCard',
  props: { profile: { type: Object, default: () => ({}) } }
}
</script>