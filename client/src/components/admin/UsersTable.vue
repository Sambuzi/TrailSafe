<template>
  <div class="table-wrap">
    <table class="admin-table users-table">
      <thead>
        <tr><th>Nome</th><th>Email</th><th>Ruolo</th><th>Creato</th></tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u._id">
          <td>
            <div class="user-name">{{ u.name || '—' }}</div>
            <div class="user-actions">
              <button class="btn small icon-btn edit" title="Modifica" aria-label="Modifica" @click="$emit('edit', u)">
              <!-- Edit / pen icon  -->
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.41l-2.34-2.34a1.003 1.003 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <button class="btn small icon-btn delete" title="Elimina" aria-label="Elimina" @click="$emit('delete', u)">
              <!-- Delete / trash icon -->
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
            </div>
          </td>
          <td>{{ u.email }}</td>
          <td>{{ u.role }}</td>
          <td>{{ formatDate(u.createdAt) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'UsersTable',
  props: { users: { type: Array, default: () => [] } },
  methods: {
    formatDate(d) { if (!d) return ''; return new Date(d).toLocaleString() }
  }
}
</script>
