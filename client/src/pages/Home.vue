<template>
  <div class="home-container">

    <div class="home-actions" style="display:flex; justify-content:flex-end; gap:8px; margin-bottom:12px;">
      <button class="btn-primary" @click="openReportModal">Segnala un problema</button>
    </div>

    <!-- METEO -->
    <WeatherCard />

    <!-- SEZIONE INFERIORE -->
    <div class="bottom-grid">

      <!-- PERCORSI SALVATI -->
      <PopularTrails @open-trail="openTrail" />


  

      <!-- ANNUNCI -->
      <AnnouncementsList />

    </div>
  </div>

  <!-- Report modal -->
  <ReportModal v-model="showReportModal" @submitted="onReportSubmitted" />
</template>

<script>
import '../css/Home.css'
import WeatherCard from '../components/home/WeatherCard.vue'
import PopularTrails from '../components/home/PopularTrails.vue'
import AnnouncementsList from '../components/home/AnnouncementsList.vue'
import ReportModal from '../components/home/ReportModal.vue'

export default {
  name: 'Home',
  data() { return { showReportModal: false } },
  mounted() {},
  components: { WeatherCard, PopularTrails, AnnouncementsList, ReportModal },
  methods: {
    openTrail(id) { if (!id) return; this.$router.push(`/trail/${id}`); },
    openReportModal() { this.showReportModal = true },
    onReportSubmitted() { /* hook for future refreshes */ }
  }
}
</script>


