<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">₿</span>
          <div>
            <h1>MyFinanceManager</h1>
            <p class="subtitle">Dein persönlicher Finanzüberblick</p>
          </div>
        </div>
        <div class="balance-pill">
          <span class="balance-label">Saldo</span>
          <span class="balance-amount" :class="saldo >= 0 ? 'positive' : 'negative'">
            {{ formatCurrency(saldo) }}
          </span>
        </div>
      </div>
    </header>

    <main class="main-content">
      <TransactionList :transactions="transactions" />
    </main>
  </div>
</template>

<script>
import TransactionList from './components/TransactionList.vue'

export default {
  name: 'App',
  components: { TransactionList },
  data() {
    return {
      transactions: [
        { id: 1, description: 'Gehalt April',      amount: 2500.00, type: 'einnahme',  kategorie: 'Gehalt',       date: '2025-04-01' },
        { id: 2, description: 'Miete',              amount: 850.00,  type: 'ausgabe',   kategorie: 'Wohnen',       date: '2025-04-02' },
        { id: 3, description: 'REWE Einkauf',       amount: 87.45,   type: 'ausgabe',   kategorie: 'Lebensmittel', date: '2025-04-05' },
        { id: 4, description: 'Spotify',            amount: 10.99,   type: 'ausgabe',   kategorie: 'Unterhaltung', date: '2025-04-06' },
        { id: 5, description: 'Freelance Projekt',  amount: 600.00,  type: 'einnahme',  kategorie: 'Nebenjob',     date: '2025-04-10' },
        { id: 6, description: 'BVG Monatsticket',   amount: 86.00,   type: 'ausgabe',   kategorie: 'Transport',    date: '2025-04-11' },
        { id: 7, description: 'Netflix',            amount: 17.99,   type: 'ausgabe',   kategorie: 'Unterhaltung', date: '2025-04-12' },
        { id: 8, description: 'Restaurant Mitte',   amount: 42.50,   type: 'ausgabe',   kategorie: 'Essen',        date: '2025-04-15' },
        { id: 9, description: 'Steuererstattung',   amount: 320.00,  type: 'einnahme',  kategorie: 'Sonstiges',    date: '2025-04-18' },
        { id: 10, description: 'Fitnessstudio',     amount: 29.90,   type: 'ausgabe',   kategorie: 'Gesundheit',   date: '2025-04-20' },
      ]
    }
  },
  computed: {
    saldo() {
      return this.transactions.reduce((sum, t) => {
        return t.type === 'einnahme' ? sum + t.amount : sum - t.amount
      }, 0)
    }
  },
  methods: {
    formatCurrency(val) {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val)
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --bg: #0f0f13;
  --surface: #1a1a24;
  --surface2: #22222f;
  --border: #2e2e40;
  --text: #e8e8f0;
  --text-muted: #7070a0;
  --green: #00e5a0;
  --red: #ff5370;
  --accent: #7c6af7;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

.app-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 20px 32px;
}

.header-content {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-icon {
  font-size: 2rem;
  background: linear-gradient(135deg, var(--accent), var(--green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo h1 {
  font-family: 'DM Serif Display', serif;
  font-size: 1.5rem;
  color: var(--text);
}

.subtitle {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.balance-pill {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 20px;
}

.balance-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.balance-amount {
  font-family: 'DM Serif Display', serif;
  font-size: 1.4rem;
}

.balance-amount.positive { color: var(--green); }
.balance-amount.negative { color: var(--red); }

.main-content {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 32px;
}
</style>
