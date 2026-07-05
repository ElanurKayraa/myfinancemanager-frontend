<template>
  <div class="page">
    <nav class="navbar navbar-dark app-navbar mb-4">
      <div class="container">
        <span class="navbar-brand fw-bold">
          <i class="bi bi-wallet2 me-2"></i>Mein Finance Manager
        </span>
        <span v-if="benutzer && step !== 'login' && step !== 'register'" class="text-white-50 small">
          {{ benutzer.benutzername }}
          <button class="btn btn-sm btn-outline-light ms-3" @click="abmelden">
            <i class="bi bi-box-arrow-right me-1"></i>Abmelden
          </button>
        </span>
      </div>
    </nav>

    <div class="container" style="max-width: 680px;">
      <div v-if="fehler" class="alert alert-danger d-flex align-items-center" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ fehler }}
      </div>

      <!-- ================= LOGIN ================= -->
      <div v-if="step === 'login'" class="card shadow-sm border-0">
        <div class="card-body p-4">
          <h2 class="card-title mb-4 fw-semibold">Anmelden</h2>
          <div class="mb-3">
            <label class="form-label">Benutzername</label>
            <input v-model="loginDaten.benutzername" class="form-control" placeholder="z.B. serda" />
          </div>
          <div class="mb-4">
            <label class="form-label">Passwort</label>
            <input v-model="loginDaten.passwort" class="form-control" type="password" placeholder="••••••••" />
          </div>
          <button class="btn btn-primary w-100 mb-3" @click="anmelden">
            <i class="bi bi-box-arrow-in-right me-1"></i>Anmelden
          </button>
          <p class="text-center mb-0 small">
            Noch kein Konto?
            <a href="#" class="link-primary" @click.prevent="step = 'register'">Registrieren</a>
          </p>
        </div>
      </div>

      <!-- ================= REGISTRIEREN ================= -->
      <div v-else-if="step === 'register'" class="card shadow-sm border-0">
        <div class="card-body p-4">
          <h2 class="card-title mb-4 fw-semibold">Registrieren</h2>
          <div class="mb-3">
            <label class="form-label">Benutzername</label>
            <input v-model="registerDaten.benutzername" class="form-control" placeholder="Wähle einen Benutzernamen" />
          </div>
          <div class="mb-4">
            <label class="form-label">Passwort</label>
            <input v-model="registerDaten.passwort" class="form-control" type="password" placeholder="Mindestens ein sicheres Passwort" />
          </div>
          <button class="btn btn-primary w-100 mb-3" @click="registrieren">
            <i class="bi bi-person-plus-fill me-1"></i>Registrieren
          </button>
          <p class="text-center mb-0 small">
            Schon ein Konto?
            <a href="#" class="link-primary" @click.prevent="step = 'login'">Anmelden</a>
          </p>
        </div>
      </div>

      <!-- ================= PROFILE ================= -->
      <div v-else-if="step === 'profil'">
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-body p-4">
            <h2 class="card-title mb-3 fw-semibold">Neues Profil anlegen</h2>
            <div class="input-group">
              <input v-model="neuesProfilName" class="form-control" placeholder="z.B. Girokonto, Urlaubskasse" />
              <button class="btn btn-primary" @click="profilErstellen">
                <i class="bi bi-plus-lg me-1"></i>Erstellen
              </button>
            </div>
          </div>
        </div>

        <h2 class="fw-semibold mb-3 fs-5 text-secondary">Profil auswählen</h2>
        <p v-if="profile.length === 0" class="text-muted">Noch keine Profile vorhanden.</p>
        <div class="list-group shadow-sm">
          <div
            v-for="profil in profile"
            :key="profil.id"
            class="list-group-item d-flex justify-content-between align-items-center py-3"
          >
            <template v-if="umbenennenId === profil.id">
              <input v-model="umbenennenName" class="form-control form-control-sm me-2" @keyup.enter="profilUmbenennenSpeichern(profil)" />
              <div class="d-flex gap-1">
                <button class="btn btn-sm btn-success" @click="profilUmbenennenSpeichern(profil)">
                  <i class="bi bi-check-lg"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" @click="umbenennenId = null">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </template>
            <template v-else>
              <span class="flex-fill" role="button" @click="profilAuswaehlen(profil)">
                <i class="bi bi-folder2-open me-2 text-primary"></i>{{ profil.name }}
              </span>
              <button class="btn btn-sm btn-outline-secondary me-1" @click="profilUmbenennenStarten(profil)">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <i class="bi bi-chevron-right text-muted" role="button" @click="profilAuswaehlen(profil)"></i>
            </template>
          </div>
        </div>
      </div>

      <!-- ================= DASHBOARD ================= -->
      <div v-else-if="step === 'dashboard'">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="fw-semibold fs-5 mb-0">
            <i class="bi bi-folder2-open me-2 text-primary"></i>{{ currentProfil?.name }}
          </h2>
          <button class="btn btn-sm btn-outline-secondary" @click="profilWechseln">
            <i class="bi bi-arrow-left-right me-1"></i>Profil wechseln
          </button>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-4">
            <div class="card border-0 shadow-sm text-center py-2">
              <div class="text-muted small">Einnahmen</div>
              <div class="fw-bold text-success">+{{ summeEinnahmen.toFixed(2) }} €</div>
            </div>
          </div>
          <div class="col-4">
            <div class="card border-0 shadow-sm text-center py-2">
              <div class="text-muted small">Ausgaben</div>
              <div class="fw-bold text-danger">-{{ summeAusgaben.toFixed(2) }} €</div>
            </div>
          </div>
          <div class="col-4">
            <div class="card border-0 shadow-sm text-center py-2">
              <div class="text-muted small">Saldo</div>
              <div class="fw-bold" :class="saldo >= 0 ? 'text-success' : 'text-danger'">{{ saldo.toFixed(2) }} €</div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm border-0 mb-4">
          <div class="card-body p-4">
            <h2 class="card-title mb-3 fw-semibold fs-5">
              {{ bearbeitenId ? 'Eintrag bearbeiten' : 'Neuen Eintrag hinzufügen' }}
            </h2>

            <div class="btn-group w-100 mb-3" role="group">
              <input type="radio" class="btn-check" id="typAusgabe" value="AUSGABE" v-model="neueAusgabe.typ" />
              <label class="btn btn-outline-danger" for="typAusgabe"><i class="bi bi-dash-circle me-1"></i>Ausgabe</label>

              <input type="radio" class="btn-check" id="typEinnahme" value="EINNAHME" v-model="neueAusgabe.typ" />
              <label class="btn btn-outline-success" for="typEinnahme"><i class="bi bi-plus-circle me-1"></i>Einnahme</label>
            </div>

            <div class="row g-2">
              <div class="col-12 col-sm-6">
                <input v-model="neueAusgabe.titel" class="form-control" placeholder="Titel" />
              </div>
              <div class="col-6 col-sm-3">
                <input v-model.number="neueAusgabe.betrag" class="form-control" placeholder="Betrag" type="number" step="0.01" />
              </div>
              <div class="col-6 col-sm-3">
                <input v-model="neueAusgabe.datum" class="form-control" type="date" />
              </div>
              <div class="col-12">
                <select v-model="neueAusgabe.kategorie" class="form-select">
                  <option disabled value="">Kategorie wählen</option>
                  <option v-for="k in kategorien" :key="k" :value="k">{{ k }}</option>
                </select>
              </div>
              <div class="col-12 d-flex gap-2 mt-2">
                <button class="btn btn-primary flex-fill" @click="ausgabeSpeichern">
                  <i class="bi" :class="bearbeitenId ? 'bi-check-lg' : 'bi-plus-lg'"></i>
                  {{ bearbeitenId ? ' Aktualisieren' : ' Hinzufügen' }}
                </button>
                <button v-if="bearbeitenId" class="btn btn-outline-secondary" @click="bearbeitenAbbrechen">
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="loading" class="text-center text-muted py-4">
          <div class="spinner-border spinner-border-sm me-2"></div>Daten werden geladen...
        </div>

        <div v-else-if="ausgaben.length === 0" class="text-center text-muted py-5">
          <i class="bi bi-inbox fs-1 d-block mb-2"></i>
          Noch keine Einträge für dieses Profil.
        </div>

        <div v-else class="card shadow-sm border-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Titel</th>
                  <th>Betrag</th>
                  <th>Kategorie</th>
                  <th>Datum</th>
                  <th class="text-end">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ausgabe in ausgaben" :key="ausgabe.id">
                  <td>
                    <i class="bi me-1" :class="ausgabe.typ === 'EINNAHME' ? 'bi-plus-circle-fill text-success' : 'bi-dash-circle-fill text-danger'"></i>
                    {{ ausgabe.titel }}
                  </td>
                  <td class="fw-semibold" :class="ausgabe.typ === 'EINNAHME' ? 'text-success' : 'text-danger'">
                    {{ ausgabe.typ === 'EINNAHME' ? '+' : '-' }}{{ ausgabe.betrag.toFixed(2) }} €
                  </td>
                  <td><span class="badge rounded-pill" :class="badgeKlasse(ausgabe.kategorie)">{{ ausgabe.kategorie }}</span></td>
                  <td class="text-muted">{{ ausgabe.datum }}</td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-1" @click="ausgabeBearbeitenStarten(ausgabe)">
                      <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="ausgabeLoeschen(ausgabe.id)">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Ausgabe {
  id: number
  titel: string
  betrag: number
  kategorie: string
  datum: string
  profilId: number
  typ: 'AUSGABE' | 'EINNAHME'
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

const kategorien = ['Lebensmittel', 'Miete', 'Transport', 'Freizeit', 'Gesundheit', 'Gehalt', 'Sonstiges']

const kategorieFarben: Record<string, string> = {
  Lebensmittel: 'text-bg-success',
  Miete: 'text-bg-primary',
  Transport: 'text-bg-warning',
  Freizeit: 'text-bg-info',
  Gesundheit: 'text-bg-danger',
  Gehalt: 'text-bg-success',
  Sonstiges: 'text-bg-secondary',
}

function badgeKlasse(kategorie: string) {
  return kategorieFarben[kategorie] ?? 'text-bg-secondary'
}

const step = ref<'login' | 'register' | 'profil' | 'dashboard'>('login')
const fehler = ref<string | null>(null)
const loading = ref(false)

const benutzer = ref<Benutzer | null>(null)
const loginDaten = ref({ benutzername: '', passwort: '' })
const registerDaten = ref({ benutzername: '', passwort: '' })

const profile = ref<Profil[]>([])
const currentProfil = ref<Profil | null>(null)
const neuesProfilName = ref('')
const umbenennenId = ref<number | null>(null)
const umbenennenName = ref('')

const ausgaben = ref<Ausgabe[]>([])
const bearbeitenId = ref<number | null>(null)
const neueAusgabe = ref({ titel: '', betrag: 0, kategorie: '', datum: '', typ: 'AUSGABE' as 'AUSGABE' | 'EINNAHME' })

const summeEinnahmen = computed(() =>
  ausgaben.value.filter(a => a.typ === 'EINNAHME').reduce((summe, a) => summe + a.betrag, 0)
)
const summeAusgaben = computed(() =>
  ausgaben.value.filter(a => a.typ !== 'EINNAHME').reduce((summe, a) => summe + a.betrag, 0)
)
const saldo = computed(() => summeEinnahmen.value - summeAusgaben.value)

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

function profilUmbenennenStarten(profil: Profil) {
  umbenennenId.value = profil.id
  umbenennenName.value = profil.name
}

async function profilUmbenennenSpeichern(profil: Profil) {
  if (!umbenennenName.value.trim()) return
  fehler.value = null
  try {
    await fetch(`${BASE_URL}/profile/${profil.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: umbenennenName.value, benutzerId: profil.benutzerId }),
    })
    umbenennenId.value = null
    await ladeProfile()
  } catch (e) {
    fehler.value = 'Fehler beim Umbenennen des Profils.'
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
    fehler.value = 'Fehler beim Speichern des Eintrags.'
  }
}

function ausgabeBearbeitenStarten(ausgabe: Ausgabe) {
  bearbeitenId.value = ausgabe.id
  neueAusgabe.value = {
    titel: ausgabe.titel,
    betrag: ausgabe.betrag,
    kategorie: ausgabe.kategorie,
    datum: ausgabe.datum,
    typ: ausgabe.typ,
  }
}

function bearbeitenAbbrechen() {
  bearbeitenId.value = null
  neueAusgabe.value = { titel: '', betrag: 0, kategorie: '', datum: '', typ: 'AUSGABE' }
}

async function ausgabeLoeschen(id: number) {
  if (!confirm('Diesen Eintrag wirklich löschen?')) return
  fehler.value = null
  try {
    await fetch(`${BASE_URL}/ausgaben/${id}`, { method: 'DELETE' })
    await ladeAusgaben()
  } catch (e) {
    fehler.value = 'Fehler beim Löschen des Eintrags.'
  }
}
</script>

<style>
body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #eef2f7 0%, #e4ebf3 100%);
  min-height: 100vh;
}
.page {
  min-height: 100vh;
  padding-bottom: 60px;
}
.app-navbar {
  background: linear-gradient(90deg, #1e293b 0%, #334155 100%);
  padding: 1rem 0;
}
.card {
  border-radius: 14px;
}
.form-control:focus, .form-select:focus {
  border-color: #334155;
  box-shadow: 0 0 0 0.2rem rgba(51, 65, 85, 0.15);
}
.btn-primary {
  background-color: #334155;
  border-color: #334155;
}
.btn-primary:hover {
  background-color: #1e293b;
  border-color: #1e293b;
}
.list-group-item:hover {
  background-color: #f1f5f9;
}
</style>
