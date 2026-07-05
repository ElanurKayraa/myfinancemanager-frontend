<template>
  <div class="container">
    <h1>Mein Finance Manager</h1>

    <!-- Fehleranzeige, überall sichtbar -->
    <p v-if="fehler" class="fehler">{{ fehler }}</p>

    <!-- ================= LOGIN ================= -->
    <div v-if="step === 'login'" class="formular">
      <h2>Anmelden</h2>
      <input v-model="loginDaten.benutzername" placeholder="Benutzername" />
      <input v-model="loginDaten.passwort" placeholder="Passwort" type="password" />
      <button @click="anmelden">Anmelden</button>
      <p class="link" @click="step = 'register'">Noch kein Konto? Registrieren</p>
    </div>

    <!-- ================= REGISTRIEREN ================= -->
    <div v-else-if="step === 'register'" class="formular">
      <h2>Registrieren</h2>
      <input v-model="registerDaten.benutzername" placeholder="Benutzername" />
      <input v-model="registerDaten.passwort" placeholder="Passwort" type="password" />
      <button @click="registrieren">Registrieren</button>
      <p class="link" @click="step = 'login'">Schon ein Konto? Anmelden</p>
    </div>

    <!-- ================= PROFILE ================= -->
    <div v-else-if="step === 'profil'">
      <div class="formular">
        <h2>Neues Profil anlegen</h2>
        <input v-model="neuesProfilName" placeholder="Profilname, z.B. Girokonto" />
        <button @click="profilErstellen">Profil erstellen</button>
      </div>

      <div class="table-wrapper">
        <h2>Profil auswählen</h2>
        <p v-if="profile.length === 0" class="empty">Noch keine Profile vorhanden.</p>
        <ul class="profil-liste">
          <li v-for="profil in profile" :key="profil.id" @click="profilAuswaehlen(profil)">
            {{ profil.name }}
          </li>
        </ul>
      </div>

      <button class="abmelden" @click="abmelden">Abmelden</button>
    </div>

    <!-- ================= DASHBOARD ================= -->
    <div v-else-if="step === 'dashboard'">
      <p class="profil-info">
        Profil: <strong>{{ currentProfil?.name }}</strong>
        <span class="link" @click="profilWechseln">Profil wechseln</span>
      </p>

      <div class="formular">
        <h2>{{ bearbeitenId ? 'Ausgabe bearbeiten' : 'Neue Ausgabe hinzufügen' }}</h2>
        <input v-model="neueAusgabe.titel" placeholder="Titel" />
        <input v-model.number="neueAusgabe.betrag" placeholder="Betrag" type="number" />
        <select v-model="neueAusgabe.kategorie">
          <option disabled value="">Kategorie wählen</option>
          <option v-for="k in kategorien" :key="k" :value="k">{{ k }}</option>
        </select>
        <input v-model="neueAusgabe.datum" type="date" />
        <button @click="ausgabeSpeichern">{{ bearbeitenId ? 'Aktualisieren' : 'Hinzufügen' }}</button>
        <button v-if="bearbeitenId" class="abbrechen" @click="bearbeitenAbbrechen">Abbrechen</button>
      </div>

      <p v-if="loading">Daten werden geladen...</p>

      <table v-if="ausgaben.length > 0">
        <thead>
          <tr>
            <th>Titel</th>
            <th>Betrag</th>
            <th>Kategorie</th>
            <th>Datum</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ausgabe in ausgaben" :key="ausgabe.id">
            <td>{{ ausgabe.titel }}</td>
            <td>{{ ausgabe.betrag }} €</td>
            <td>{{ ausgabe.kategorie }}</td>
            <td>{{ ausgabe.datum }}</td>
            <td class="aktionen">
              <button class="bearbeiten" @click="ausgabeBearbeitenStarten(ausgabe)">Bearbeiten</button>
              <button class="loeschen" @click="ausgabeLoeschen(ausgabe.id)">Löschen</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else-if="!loading" class="empty">Noch keine Ausgaben für dieses Profil.</p>
    </div>
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
  profilId: number
}

interface Profil {
  id: number
  name: string
  benutzerId: number
}

interface Benutzer {
  id: number
  benutzername: string
}

const BASE_URL = 'https://myfinancemanager-backend-jjrd.onrender.com'

const kategorien = ['Lebensmittel', 'Miete', 'Transport', 'Freizeit', 'Gesundheit', 'Sonstiges']

const step = ref<'login' | 'register' | 'profil' | 'dashboard'>('login')
const fehler = ref<string | null>(null)
const loading = ref(false)

const benutzer = ref<Benutzer | null>(null)
const loginDaten = ref({ benutzername: '', passwort: '' })
const registerDaten = ref({ benutzername: '', passwort: '' })

const profile = ref<Profil[]>([])
const currentProfil = ref<Profil | null>(null)
const neuesProfilName = ref('')

const ausgaben = ref<Ausgabe[]>([])
const bearbeitenId = ref<number | null>(null)
const neueAusgabe = ref({ titel: '', betrag: 0, kategorie: '', datum: '' })

async function anmelden() {
  fehler.value = null
  try {
    const response = await fetch(`${BASE_URL}/benutzer/anmelden`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginDaten.value),
    })
    if (!response.ok) {
      const body = await response.json()
      fehler.value = body.fehler ?? 'Anmeldung fehlgeschlagen.'
      return
    }
    benutzer.value = await response.json()
    step.value = 'profil'
    await ladeProfile()
  } catch (e) {
    fehler.value = 'Fehler bei der Anmeldung.'
  }
}

async function registrieren() {
  fehler.value = null
  try {
    const response = await fetch(`${BASE_URL}/benutzer/registrieren`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerDaten.value),
    })
    if (!response.ok) {
      const body = await response.json()
      fehler.value = body.fehler ?? 'Registrierung fehlgeschlagen.'
      return
    }
    step.value = 'login'
    loginDaten.value = { ...registerDaten.value }
    registerDaten.value = { benutzername: '', passwort: '' }
  } catch (e) {
    fehler.value = 'Fehler bei der Registrierung.'
  }
}

function abmelden() {
  benutzer.value = null
  profile.value = []
  currentProfil.value = null
  ausgaben.value = []
  step.value = 'login'
}

async function ladeProfile() {
  if (!benutzer.value) return
  try {
    const response = await fetch(`${BASE_URL}/profile?benutzerId=${benutzer.value.id}`)
    profile.value = await response.json()
  } catch (e) {
    fehler.value = 'Fehler beim Laden der Profile.'
  }
}

async function profilErstellen() {
  if (!benutzer.value || !neuesProfilName.value.trim()) return
  fehler.value = null
  try {
    await fetch(`${BASE_URL}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: neuesProfilName.value, benutzerId: benutzer.value.id }),
    })
    neuesProfilName.value = ''
    await ladeProfile()
  } catch (e) {
    fehler.value = 'Fehler beim Erstellen des Profils.'
  }
}

function profilAuswaehlen(profil: Profil) {
  currentProfil.value = profil
  step.value = 'dashboard'
  ladeAusgaben()
}

function profilWechseln() {
  step.value = 'profil'
  currentProfil.value = null
  ausgaben.value = []
}

async function ladeAusgaben() {
  if (!currentProfil.value) return
  try {
    loading.value = true
    const response = await fetch(`${BASE_URL}/ausgaben?profilId=${currentProfil.value.id}`)
    ausgaben.value = await response.json()
  } catch (e) {
    fehler.value = 'Fehler beim Laden der Daten.'
  } finally {
    loading.value = false
  }
}

async function ausgabeSpeichern() {
  if (!currentProfil.value) return
  fehler.value = null
  try {
    const payload = { ...neueAusgabe.value, profilId: currentProfil.value.id }

    if (bearbeitenId.value) {
      await fetch(`${BASE_URL}/ausgaben/${bearbeitenId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch(`${BASE_URL}/ausgaben`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    bearbeitenAbbrechen()
    await ladeAusgaben()
  } catch (e) {
    fehler.value = 'Fehler beim Speichern der Ausgabe.'
  }
}

function ausgabeBearbeitenStarten(ausgabe: Ausgabe) {
  bearbeitenId.value = ausgabe.id
  neueAusgabe.value = {
    titel: ausgabe.titel,
    betrag: ausgabe.betrag,
    kategorie: ausgabe.kategorie,
    datum: ausgabe.datum,
  }
}

function bearbeitenAbbrechen() {
  bearbeitenId.value = null
  neueAusgabe.value = { titel: '', betrag: 0, kategorie: '', datum: '' }
}

async function ausgabeLoeschen(id: number) {
  if (!confirm('Diese Ausgabe wirklich löschen?')) return
  fehler.value = null
  try {
    await fetch(`${BASE_URL}/ausgaben/${id}`, { method: 'DELETE' })
    await ladeAusgaben()
  } catch (e) {
    fehler.value = 'Fehler beim Löschen der Ausgabe.'
  }
}

onMounted(() => {})
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
.formular input, .formular select {
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
.formular button.abbrechen { background: #999; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; }
th { background-color: #2c3e50; color: white; }
tr:hover { background-color: #f1f1f1; }
.fehler { color: red; margin-bottom: 15px; }
.link { color: #2c3e50; text-decoration: underline; cursor: pointer; font-size: 14px; margin-top: 5px; }
.table-wrapper { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
.profil-liste { list-style: none; padding: 0; margin: 0; }
.profil-liste li {
  padding: 12px 15px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
}
.profil-liste li:hover { background: #eef1f3; }
.profil-info { margin-bottom: 15px; font-size: 15px; }
.profil-info .link { margin-left: 15px; }
.abmelden { background: #999; color: white; border: none; padding: 8px 14px; border-radius: 5px; cursor: pointer; }
.aktionen { display: flex; gap: 8px; }
.aktionen button { padding: 6px 10px; border: none; border-radius: 5px; cursor: pointer; color: white; font-size: 13px; }
.aktionen .bearbeiten { background: #2c7be5; }
.aktionen .loeschen { background: #e02c2c; }
.empty { text-align: center; color: #888; padding: 20px; }
</style>
