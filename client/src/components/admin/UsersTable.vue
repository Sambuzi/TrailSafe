<template>
  <div class="table-wrap">
    <table class="admin-table users-table">
      <thead>
        <tr><th>Nome</th><th>Email</th><th>Ruolo</th><th>Creato</th><th>Azioni</th></tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u._id">
          <td>{{ u.name || '—' }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.role }}</td>
          <td>{{ formatDate(u.createdAt) }}</td>
          <td class="actions-cell">
            <button class="btn icon" title="Modifica" @click="$emit('edit', u)">Modifica</button>
            <button class="btn icon danger" title="Elimina" @click="$emit('delete', u)">Elimina</button>
          </td>
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
