<template>
  <div class="table-container">
    <table class="admin-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Difficoltà</th>
          <th>Lunghezza (km)</th>
          <th>Stato</th>
          <th>Azioni</th>
        </tr>
      </thead>
      <tbody>
        <TrailItem v-for="trail in trails" :key="trail._id" :trail="trail" :difficultyClass="difficultyClass" :statusClass="statusClass" @edit="$emit('edit', $event)" @delete="$emit('delete', $event)" />
        <tr v-if="!trails || trails.length === 0">
          <td colspan="5" class="empty">Nessun percorso trovato.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import TrailItem from './TrailItem.vue'

export default {
  name: 'TrailsList',
  components: { TrailItem },
  props: {
    trails: { type: Array, default: () => [] },
    difficultyClass: { type: Function, default: () => () => '' },
    statusClass: { type: Function, default: () => () => '' }
  }
}
</script>
