<template>
  <div class="login-root">
    <div class="login-card">
      <div class="brand">
        <h1>TrailSafe</h1>
        <p>Creiamo il tuo account</p>
      </div>

      <h2>Registrati</h2>

      <form @submit.prevent="submit">
        <div class="field">
          <input v-model="form.name" type="text" required placeholder=" " />
          <label>Nome</label>
        </div>

        <div class="field">
          <input v-model="form.email" type="email" required placeholder=" " />
          <label>Email</label>
        </div>

        <div class="field">
          <input v-model="form.password" type="password" required placeholder=" " />
          <label>Password</label>
        </div>

        <div class="actions">
          <button class="btn filled" type="submit">Crea account</button>
          <router-link class="btn tonal" to="/login">Vai al login</router-link>
        </div>
      </form>

      <p class="error" v-if="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['login-success'],
  data() {
    return {
      form: { name: '', email: '', password: '' },
      error: null
    };
  },
  mounted() {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  },
  unmounted() {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  },
  methods: {
    async submit() {
      this.error = null;
      if (!this.form.email || !this.form.password) {
        this.error = 'Email e password richieste';
        return;
      }
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        });
        const body = await res.json();
        if (!res.ok) {
          this.error = body.error || 'Registrazione fallita';
          return;
        }
        try { localStorage.setItem('ts_user', JSON.stringify(body)); } catch {}
        this.$router && this.$router.push('/home');
        this.$emit('login-success', body);
      } catch (e) {
        this.error = 'Server non raggiungibile';
      }
    }
  }
};
</script>

<style src="../css/Login.css" scoped></style>
