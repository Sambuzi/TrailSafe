<template>
  <div class="login-root">
    <div class="login-card">
      <div class="brand">
        <h1>TrailSafe</h1>
        <p>Esplora. Segnala. Proteggi.</p>
      </div>

      <h2>Accedi</h2>

      <form @submit.prevent="submit">
        <div class="field">
          <input v-model="form.email" type="email" required placeholder=" " />
          <label>Email</label>
        </div>

        <div class="field">
          <input v-model="form.password" type="password" required placeholder=" " />
          <label>Password</label>
        </div>

        <div class="actions">
          <button class="btn filled" type="submit">
            Entra come utente
          </button>
          <button class="btn tonal" type="button" @click="submit('admin')">
            Entra come Amministratore
          </button>
          <router-link class="btn outline" to="/register">Registrati</router-link>
        </div>
      </form>

      <p class="error" v-if="error">{{ error }}</p>

      <p class="hint">
        Non hai un account? <code>/api/auth/register</code>
      </p>
    </div>
    </div>
  </template>

  <script>
  export default {
    emits: ['login-success'],

    data() {
      return {
        form: { email: '', password: '' },
        error: null
      };
    },

    mounted() {
      // disable scrolling while on login page
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    },

    unmounted() {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    },

    methods: {
      async submit(role) {
        this.error = null;
        try {
          let res, body;
              if (role === 'admin') {
                // Use the email/password fields as admin identifier/password
                if (!this.form.email || !this.form.password) {
                  this.error = 'Inserisci email e password per l amministratore';
                  return;
                }
                res = await fetch('/api/auth/admin-login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ identifier: this.form.email, password: this.form.password })
                });
                body = await res.json();
              } else {
            res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(this.form)
            });
            body = await res.json();
          }

          if (!res.ok) {
            this.error = body.error || 'Login fallito';
            return;
          }

          // salva token+user e vai a pagina corretta
          try { localStorage.setItem('ts_user', JSON.stringify(body)); } catch {}
          if (role === 'admin') {
            this.$router && this.$router.push('/admin');
          } else {
            this.$router && this.$router.push('/home');
          }
          this.$emit('login-success', body);
        } catch (e) {
          this.error = 'Server non raggiungibile';
        }
      }
    }
  };
  </script>

  <style src="../css/Login.css" scoped></style>
