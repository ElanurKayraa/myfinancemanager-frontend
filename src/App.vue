<template>
  <div class="container">
    <h1>💰 Mein Finance Manager</h1>

    <p v-if="loading">Daten werden geladen...</p>
    <p v-if="fehler" class="fehler">{{ fehler }}</p>

    <table v-if="ausgaben.length > 0">
      <thead>
        <tr>
          <th>Titel</th>
          <th>Betrag</th>
          <th>Kategorie</th>
          <th>Datum</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ausgabe in ausgaben" :key="ausgabe.id">
          <td>{{ ausgabe.titel }}</td>
          <td>{{ ausgabe.betrag }} €</td>
          <td>{{ ausgabe.kategorie }}</td>
          <td>{{ ausgabe.datum }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ausgaben: [],
      loading: true,
      fehler: null
    }
  },
  async mounted() {
    try {
      const response = await fetch('https://myfinancemanager-backend-f.onrender.com/ausgaben')
      this.ausgaben = await response.json()
    } catch (e) {
      this.fehler = 'Fehler beim Laden der Daten.'
    } finally {
      this.loading = false
    }
  }
}
</script>

<style>
body {
  font-family: Arial, sans-serif;
  background: #f4f4f4;
  margin: 0;
  padding: 0;
}

.container {
  max-width: 800px;
  margin: 40px auto;
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #2c3e50;
  color: white;
}

tr:hover {
  background-color: #f1f1f1;
}

.fehler {
  color: red;
}
</style>
