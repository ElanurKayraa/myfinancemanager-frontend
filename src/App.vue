<template>
  <div class="container">
    <h1> Mein Finance Manager</h1>

    <!-- Formular für neue Ausgabe -->
    <div class="formular">
      <h2>Neue Ausgabe hinzufügen</h2>
      <input v-model="neueAusgabe.titel" placeholder="Titel" />
      <input v-model.number="neueAusgabe.betrag" placeholder="Betrag" type="number" />
      <input v-model="neueAusgabe.kategorie" placeholder="Kategorie" />
      <input v-model="neueAusgabe.datum" type="date" />
      <button @click="ausgabeHinzufuegen">Hinzufügen</button>
    </div>

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

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Ausgabe {
  id: number
  titel: string
  betrag: number
  kategorie: string
  datum: string
}

const BASE_URL = 'https://myfinancemanager-backend-jjrd.onrender.com'

const ausgaben = ref<Ausgabe[]>([])
const loading = ref(true)
const fehler = ref<string | null>(null)

const neueAusgabe = ref({
  titel: '',
  betrag: 0,
  kategorie: '',
  datum: ''
})

onMounted(async () => {
  await ladeAusgaben()
})

async function ladeAusgaben() {
  try {
    loading.value = true
    const response = await fetch(`${BASE_URL}/ausgaben`)
    ausgaben.value = await response.json()
  } catch (e) {
    fehler.value = 'Fehler beim Laden der Daten.'
  } finally {
    loading.value = false
  }
}

async function ausgabeHinzufuegen() {
  try {
    await fetch(`${BASE_URL}/ausgaben`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(neueAusgabe.value)
    })
    neueAusgabe.value = { titel: '', betrag: 0, kategorie: '', datum: '' }
    await ladeAusgaben()
  } catch (e) {
    fehler.value = 'Fehler beim Hinzufügen.'
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
h1 { color: #2c3e50; margin-bottom: 20px; }
h2 { color: #2c3e50; margin-bottom: 15px; }
.formular {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}
.formular input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}
.formular button {
  padding: 10px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}
.formular button:hover { background: #34495e; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; }
th { background-color: #2c3e50; color: white; }
tr:hover { background-color: #f1f1f1; }
.fehler { color: red; }
</style>
