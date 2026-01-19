<template>
  <tr :class="{ 'status-closed': trail.status === 'Chiuso' }">
    <td class="trail-name">{{ trail.name }}</td>
    <td>
      <span class="difficulty-badge" :class="difficultyClass(trail.difficulty)">{{ trail.difficulty }}</span>
    </td>
    <td>{{ trail.length_km }}</td>
    <td>
      <span class="status-badge" :class="statusClass(trail.status)">{{ trail.status }}</span>
    </td>
    <td class="actions">
      <button class="btn-secondary edit-btn" @click="$emit('edit', trail)">Modifica</button>
      <button class="btn-danger delete-btn" @click="$emit('delete', trail)">Elimina</button>
    </td>
  </tr>
</template>

<script>
export default {
  name: 'TrailItem',
  props: {
    trail: { type: Object, required: true },
    difficultyClass: { type: Function, default: () => '' },
    statusClass: { type: Function, default: () => '' }
  }
}
</script>