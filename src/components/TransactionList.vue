<template>
  <div class="transaction-list">

    <!-- Zusammenfassung -->
    <div class="summary-grid">
      <div class="summary-card income">
        <span class="summary-label">Einnahmen</span>
        <span class="summary-value">{{ formatCurrency(totalIncome) }}</span>
      </div>
      <div class="summary-card expense">
        <span class="summary-label">Ausgaben</span>
        <span class="summary-value">{{ formatCurrency(totalExpense) }}</span>
      </div>
      <div class="summary-card count">
        <span class="summary-label">Transaktionen</span>
        <span class="summary-value">{{ transactions.length }}</span>
      </div>
    </div>

    <!-- Tabelle -->
    <div class="table-wrapper">
      <div class="table-header">
        <h2>Transaktionen</h2>
      </div>

      <table>
        <thead>
          <tr>
            <th>Datum</th>
            <th>Beschreibung</th>
            <th>Kategorie</th>
            <th>Typ</th>
            <th class="right">Betrag</th>
          </tr>
        </thead>
        <tbody>
          <!-- v-for rendert jede Transaktion als Tabellenzeile -->
          <tr
            v-for="transaction in transactions"
            :key="transaction.id"
            :class="'row-' + transaction.type"
          >
            <td class="date">{{ formatDate(transaction.date) }}</td>
            <td class="description">{{ transaction.description }}</td>
            <td>
              <span class="badge" :class="'badge-' + transaction.kategorie.toLowerCase()">
                {{ transaction.kategorie }}
              </span>
            </td>
            <td>
              <span class="type-tag" :class="transaction.type">
                {{ transaction.type === 'einnahme' ? '↑ Einnahme' : '↓ Ausgabe' }}
              </span>
            </td>
            <td class="amount right" :class="transaction.type">
              {{ transaction.type === 'einnahme' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
            </td>
          </tr>
        </tbody>
      </table>

      <p v-if="transactions.length === 0" class="empty">
        Noch keine Transaktionen vorhanden.
      </p>
    </div>

  </div>
</template>

<script>
export default {
  name: 'TransactionList',
  props: {
    transactions: {
      type: Array,
      required: true
    }
  },
  computed: {
    totalIncome() {
      return this.transactions
        .filter(t => t.type === 'einnahme')
        .reduce((sum, t) => sum + t.amount, 0)
    },
    totalExpense() {
      return this.transactions
        .filter(t => t.type === 'ausgabe')
        .reduce((sum, t) => sum + t.amount, 0)
    }
  },
  methods: {
    formatCurrency(val) {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val)
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('de-DE', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Summary Cards */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.summary-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-card.income  { border-top: 3px solid var(--green); }
.summary-card.expense { border-top: 3px solid var(--red); }
.summary-card.count   { border-top: 3px solid var(--accent); }

.summary-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.summary-value {
  font-family: 'DM Serif Display', serif;
  font-size: 1.5rem;
  color: var(--text);
}

/* Table */
.table-wrapper {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
}

.table-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
}

.table-header h2 {
  font-family: 'DM Serif Display', serif;
  font-size: 1.1rem;
  font-weight: 400;
  color: var(--text);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  padding: 12px 20px;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: left;
  background: var(--surface2);
}

th.right, td.right { text-align: right; }

tbody tr {
  border-top: 1px solid var(--border);
  transition: background 0.15s;
}

tbody tr:hover { background: var(--surface2); }

td {
  padding: 14px 20px;
  font-size: 0.9rem;
  color: var(--text);
  vertical-align: middle;
}

td.date { color: var(--text-muted); font-size: 0.82rem; }

/* Badges */
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text-muted);
}

/* Typ Tags */
.type-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
}

.type-tag.einnahme {
  background: rgba(0, 229, 160, 0.1);
  color: var(--green);
}

.type-tag.ausgabe {
  background: rgba(255, 83, 112, 0.1);
  color: var(--red);
}

/* Betrag */
td.amount.einnahme { color: var(--green); font-weight: 600; }
td.amount.ausgabe  { color: var(--red);   font-weight: 600; }

.empty {
  text-align: center;
  color: var(--text-muted);
  padding: 40px;
}
</style>
