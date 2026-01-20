<template>
  <div class="info-row">
    <div class="m3-card admin-info-card">
      <h3>Informazioni Admin</h3>
      <div class="admin-info-grid">
        <div><strong>Nome</strong></div><div>{{ profile.name || '—' }}</div>
        <div><strong>Email</strong></div><div>{{ profile.email || '—' }}</div>
        <div><strong>Ruolo</strong></div><div>{{ profile.role || '—' }}</div>
        <div><strong>Ultimo aggiornamento</strong></div><div>{{ lastUpdated || '—' }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminInfoCard',
  props: {
    profile: { type: Object, required: true },
    lastUpdated: { type: String, default: '' }
  }
}
</script>
