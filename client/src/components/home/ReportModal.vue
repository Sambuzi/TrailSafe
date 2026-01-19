<template>
  <div v-if="modelValue" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <h2>Segnala un problema</h2>

      <form @submit.prevent="submit">
        <div class="form-group"><label>Nome luogo (opzionale)</label><input v-model="form.placeName" placeholder="Es. Sentiero XYZ" /></div>

        <div class="form-group">
          <label>Seleziona percorso (opzionale)</label>
          <select v-model="form.trail" @change="onTrailSelect">
            <option value="">-- Nessuno --</option>
            <option v-for="t in trails" :key="t._id" :value="t._id">{{ t.name }}</option>
          </select>
        </div>

        <div class="form-group"><label>Messaggio</label><textarea v-model="form.text" required rows="4" placeholder="Descrivi il problema..."></textarea></div>

        <div class="form-group">
          <label>Gravità</label>
          <select v-model="form.severity"><option value="low">Bassa</option><option value="medium">Media</option><option value="high">Alta</option></select>
          <small class="muted">La gravità aiuterà gli amministratori a prioritizzare la segnalazione.</small>
        </div>

        <div class="form-group"><label>Foto (opzionale)</label><input type="file" accept="image/*" @change="onFileChange" /><div v-if="form.imagePreview" style="margin-top:8px;"><img :src="form.imagePreview" style="max-width:200px; max-height:120px; object-fit:cover;"/></div></div>

        <div class="form-group">
          <label>Posizione</label>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <button type="button" class="btn" @click="fillLocation">Usa la mia posizione</button>
            <button type="button" class="btn" v-if="selectedTrail" @click="showMapPicker = !showMapPicker">Scegli sulla mappa</button>
            <div style="display:flex;gap:8px;align-items:center;"><input v-model.number="form.location.lat" placeholder="Latitudine" style="width:140px;" /><input v-model.number="form.location.lng" placeholder="Longitudine" style="width:140px;" /></div>
            <div class="muted">{{ (form.location && form.location.lat !== null && form.location.lng !== null) ? (form.location.lat.toFixed(4) + ', ' + form.location.lng.toFixed(4)) : 'Nessuna posizione' }}</div>
          </div>
          <small class="muted">Prima seleziona un percorso per poterlo visualizzare sulla mappa; poi puoi cliccare sul percorso o usare la tua posizione.</small>
        </div>

        <div v-if="showMapPicker && selectedTrail" class="form-group"><label>Scegli posizione sulla mappa</label><ReportMapPicker :trail="selectedTrail" :initialLocation="form.location" @location-selected="onMapLocationSelected" ref="picker" /></div>

        <div class="form-actions" style="margin-top:12px; display:flex; gap:8px; justify-content:flex-end;"><button type="button" class="btn-secondary" @click="close">Annulla</button><button type="submit" class="btn-primary">Invia</button></div>
      </form>
    </div>
  </div>
</template>

<script>
import ReportMapPicker from '../ReportMapPicker.vue'

export default {
  name: 'ReportModal',
  components: { ReportMapPicker },
  props: {
    modelValue: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'submitted'],
  data() {
    return {
      trails: [],
      loadingTrails: false,
      selectedTrail: null,
      showMapPicker: false,
      form: {
        placeName: '',
        trail: '',
        text: '',
        severity: 'low',
        location: { lat: null, lng: null },
        imageBase64: null,
        imagePreview: null
      }
    }
  },
  computed: {
    hasLocation() {
      return this.form.location && this.form.location.lat !== null && this.form.location.lng !== null
    }
  },
  watch: {
    modelValue(val) {
      if (val) this.opened()
      else this.closed()
    }
  },
  methods: {
    async opened() {
      this.loadingTrails = true
      this.selectedTrail = null
      try {
        const res = await fetch('/api/trails/popular')
        this.trails = res.ok ? await res.json() : []
      } catch (e) {
        this.trails = []
      } finally {
        this.loadingTrails = false
        document.body.classList.add('modal-open')
        document.body.style.overflow = 'hidden'
      }
    },

    closed() {
      document.body.classList.remove('modal-open')
      document.body.style.overflow = ''
    },

    close() {
      this.$emit('update:modelValue', false)
    },

    onMapLocationSelected(loc) {
      this.form.location = { lat: loc.lat, lng: loc.lng }
    },

    onFileChange(e) {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        this.form.imageBase64 = reader.result
        this.form.imagePreview = reader.result
      }
      reader.readAsDataURL(file)
    },

    fillLocation() {
      if (!navigator.geolocation) return alert('Geolocalizzazione non supportata')
      navigator.geolocation.getCurrentPosition(
        (pos) => { this.form.location = { lat: pos.coords.latitude, lng: pos.coords.longitude } },
        () => alert('Impossibile ottenere posizione')
      )
    },

    async onTrailSelect() {
      const id = this.form.trail
      if (!id) {
        this.selectedTrail = null
        this.showMapPicker = false
        return
      }
      try {
        const res = await fetch(`/api/trails/${id}`)
        if (!res.ok) {
          this.selectedTrail = null
          this.showMapPicker = false
          return
        }
        this.selectedTrail = await res.json()
        this.showMapPicker = true
      } catch (e) {
        this.selectedTrail = null
        this.showMapPicker = false
      }
    },

    getAuthHeader() {
      try {
        const raw = localStorage.getItem('ts_user')
        if (!raw) return {}
        const parsed = JSON.parse(raw)
        if (!parsed || !parsed.token) return {}
        return { Authorization: `Bearer ${parsed.token}` }
      } catch (e) {
        return {}
      }
    },

    async submit() {
      if (!this.form.text) return alert('Inserisci il testo della segnalazione')
      try {
        const payload = {
          trail: this.form.trail || undefined,
          text: this.form.text,
          severity: this.form.severity,
          location: this.form.location,
          imageBase64: this.form.imageBase64
        }

        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
          body: JSON.stringify(payload)
        })

        if (!res.ok) {
          const body = await res.json().catch(() => null)
          alert((body && (body.error || body.message)) || 'Invio fallito')
          return
        }

        alert('Segnalazione inviata')
        this.$emit('submitted')
        this.close()
      } catch (e) {
        alert('Server non raggiungibile')
      }
    }
  }
}
</script>