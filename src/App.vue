<template>
  <!-- ============ AUTH SCREENS (Login/Register) ============ -->
  <div v-if="step === 'login' || step === 'register'" class="auth-screen">
    <div class="auth-glow"></div>
    <div class="auth-card">
      <div class="brand mb-4">
        <i class="bi bi-wallet2"></i>
        <span>Finance Manager</span>
      </div>

      <div v-if="fehler" class="alert-custom mb-3">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ fehler }}
      </div>

      <template v-if="step === 'login'">
        <h1 class="auth-title">Willkommen zurück</h1>
        <p class="auth-sub">Melde dich an, um deine Finanzen im Blick zu behalten.</p>
        <label class="field-label">Benutzername</label>
        <input v-model="loginDaten.benutzername" class="field-input" placeholder="z.B. serda" />
        <label class="field-label">Passwort</label>
        <input v-model="loginDaten.passwort" class="field-input" type="password" placeholder="••••••••" />
        <button class="btn-primary-custom w-100 mt-2" @click="anmelden">Anmelden</button>
        <p class="auth-switch">Noch kein Konto? <a href="#" @click.prevent="step = 'register'">Registrieren</a></p>
      </template>

      <template v-else>
        <h1 class="auth-title">Konto erstellen</h1>
        <p class="auth-sub">Leg los und behalte Einnahmen &amp; Ausgaben im Griff.</p>
        <label class="field-label">Benutzername</label>
        <input v-model="registerDaten.benutzername" class="field-input" placeholder="Wähle einen Benutzernamen" />
        <label class="field-label">Passwort</label>
        <input v-model="registerDaten.passwort" class="field-input" type="password" placeholder="Sicheres Passwort" />
        <button class="btn-primary-custom w-100 mt-2" @click="registrieren">Registrieren</button>
        <p class="auth-switch">Schon ein Konto? <a href="#" @click.prevent="step = 'login'">Anmelden</a></p>
      </template>
    </div>
  </div>

  <!-- ============ APP SHELL (Profile / Dashboard) ============ -->
  <div v-else class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <i class="bi bi-wallet2"></i>
        <span>Finance Manager</span>
      </div>

      <div class="sidebar-user">
        <div class="avatar">{{ initialen }}</div>
        <div>
          <div class="user-name">{{ benutzer?.benutzername }}</div>
          <div class="user-tag">Angemeldet</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">Profile</div>
        <button
          v-for="profil in profile"
          :key="profil.id"
          class="nav-item"
          :class="{ active: currentProfil?.id === profil.id }"
          @click="profilAuswaehlen(profil)"
        >
          <i class="bi bi-folder2-open"></i>
          <span v-if="umbenennenId !== profil.id" class="flex-fill text-truncate">{{ profil.name }}</span>
          <input
            v-else
            v-model="umbenennenName"
            class="rename-input"
            @click.stop
            @keyup.enter="profilUmbenennenSpeichern(profil)"
          />
          <i v-if="umbenennenId !== profil.id" class="bi bi-pencil rename-icon" @click.stop="profilUmbenennenStarten(profil)"></i>
          <i v-else class="bi bi-check-lg rename-icon text-success" @click.stop="profilUmbenennenSpeichern(profil)"></i>
        </button>

        <div class="new-profil">
          <input v-model="neuesProfilName" class="rename-input flex-fill" placeholder="Neues Profil..." @keyup.enter="profilErstellen" />
          <button class="add-profil-btn" @click="profilErstellen"><i class="bi bi-plus-lg"></i></button>
        </div>
      </nav>

      <button class="logout-btn" @click="abmelden">
        <i class="bi bi-box-arrow-right"></i> Abmelden
      </button>
    </aside>

    <main class="main-area">
      <div v-if="fehler" class="alert-custom mb-3">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ fehler }}
      </div>

      <!-- No profile selected yet -->
      <div v-if="step === 'profil'" class="empty-state">
        <i class="bi bi-folder2-open"></i>
        <h2>Wähle ein Profil</h2>
        <p>Klick links auf ein bestehendes Profil oder leg ein neues an, um loszulegen.</p>
      </div>

      <!-- Dashboard -->
      <div v-else>
        <div class="main-header">
          <h1><i class="bi bi-folder2-open me-2"></i>{{ currentProfil?.name }}</h1>
        </div>

        <div class="balance-hero">
          <div class="balance-label">Saldo</div>
          <div class="balance-amount" :class="saldo >= 0 ? 'positive' : 'negative'">
            {{ saldo >= 0 ? '+' : '' }}{{ saldo.toFixed(2) }} €
          </div>
          <div class="balance-bar">
            <div class="balance-bar-fill" :style="{ width: anteilEinnahmen + '%' }"></div>
          </div>
          <div class="balance-legend">
            <span><i class="bi bi-circle-fill text-success"></i> Einnahmen: {{ summeEinnahmen.toFixed(2) }} €</span>
            <span><i class="bi bi-circle-fill text-danger"></i> Ausgaben: {{ summeAusgaben.toFixed(2) }} €</span>
          </div>
        </div>

        <div class="panel">
          <h2 class="panel-title">{{ bearbeitenId ? 'Eintrag bearbeiten' : 'Neuer Eintrag' }}</h2>

          <div class="type-toggle">
            <button
              class="type-btn expense"
              :class="{ active: neueAusgabe.typ === 'AUSGABE' }"
              @click="neueAusgabe.typ = 'AUSGABE'"
            >
              <i class="bi bi-dash-circle"></i> Ausgabe
            </button>
            <button
              class="type-btn income"
              :class="{ active: neueAusgabe.typ === 'EINNAHME' }"
              @click="neueAusgabe.typ = 'EINNAHME'"
            >
              <i class="bi bi-plus-circle"></i> Einnahme
            </button>
          </div>

          <div class="form-grid">
            <input v-model="neueAusgabe.titel" class="field-input" placeholder="Titel" />
            <input v-model.number="neueAusgabe.betrag" class="field-input mono" placeholder="Betrag" type="number" step="0.01" />
            <input v-model="neueAusgabe.datum" class="field-input" type="date" />
            <select v-model="neueAusgabe.kategorie" class="field-input">
              <option disabled value="">Kategorie wählen</option>
              <option v-for="k in kategorien" :key="k" :value="k">{{ k }}</option>
            </select>
          </div>

          <div class="d-flex gap-2 mt-3">
            <button class="btn-primary-custom flex-fill" @click="ausgabeSpeichern">
              {{ bearbeitenId ? 'Aktualisieren' : 'Hinzufügen' }}
            </button>
            <button v-if="bearbeitenId" class="btn-ghost" @click="bearbeitenAbbrechen">Abbrechen</button>
          </div>
        </div>

        <div v-if="loading" class="empty-state small">
          <div class="spinner-border spinner-border-sm"></div> Daten werden geladen...
        </div>

        <div v-else-if="ausgaben.length === 0" class="empty-state small">
          <i class="bi bi-inbox"></i>
          <p class="mb-0">Noch keine Einträge für dieses Profil.</p>
        </div>

        <div v-else class="panel p-0 overflow-hidden">
          <table class="data-table">
            <thead>
              <tr>
                <th>Titel</th>
                <th>Betrag</th>
                <th>Kategorie</th>
                <th>Datum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ausgabe in ausgaben" :key="ausgabe.id">
                <td>
                  <i class="bi me-2" :class="ausgabe.typ === 'EINNAHME' ? 'bi-plus-circle-fill text-success' : 'bi-dash-circle-fill text-danger'"></i>
                  {{ ausgabe.titel }}
                </td>
                <td class="mono fw-semibold" :class="ausgabe.typ === 'EINNAHME' ? 'text-success' : 'text-danger'">
                  {{ ausgabe.typ === 'EINNAHME' ? '+' : '-' }}{{ ausgabe.betrag.toFixed(2) }} €
                </td>
                <td><span class="cat-badge" :data-cat="ausgabe.kategorie">{{ ausgabe.kategorie }}</span></td>
                <td class="text-muted-custom">{{ ausgabe.datum }}</td>
                <td class="text-end">
                  <button class="icon-btn" @click="ausgabeBearbeitenStarten(ausgabe)"><i class="bi bi-pencil-fill"></i></button>
                  <button class="icon-btn danger" @click="ausgabeLoeschen(ausgabe.id)"><i class="bi bi-trash-fill"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
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

const initialen = computed(() => (benutzer.value?.benutzername ?? '?').slice(0, 2).toUpperCase())

const summeEinnahmen = computed(() =>
  ausgaben.value.filter(a => a.typ === 'EINNAHME').reduce((summe, a) => summe + a.betrag, 0)
)
const summeAusgaben = computed(() =>
  ausgaben.value.filter(a => a.typ !== 'EINNAHME').reduce((summe, a) => summe + a.betrag, 0)
)
const saldo = computed(() => summeEinnahmen.value - summeAusgaben.value)
const anteilEinnahmen = computed(() => {
  const gesamt = summeEinnahmen.value + summeAusgaben.value
  return gesamt === 0 ? 50 : Math.round((summeEinnahmen.value / gesamt) * 100)
})

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
:root {
  --bg: #0b1220;
  --surface: #141b2d;
  --surface-2: #1c2540;
  --border: rgba(255,255,255,0.08);
  --text: #e7ecf5;
  --text-muted: #8b96ad;
  --gold: #f2b84b;
  --gold-dim: rgba(242,184,75,0.15);
  --green: #34d399;
  --rose: #fb6f92;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', sans-serif;
}

h1, h2, .brand span { font-family: 'Space Grotesk', sans-serif; }
.mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }

/* ---------- Auth screens ---------- */
.auth-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 24px;
}
.auth-glow {
  position: absolute;
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(242,184,75,0.16) 0%, rgba(242,184,75,0) 70%);
  top: -200px;
  right: -150px;
  pointer-events: none;
}
.auth-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 36px 32px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
.auth-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 4px; }
.auth-sub { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px; }
.auth-switch { text-align: center; margin-top: 18px; font-size: 0.85rem; color: var(--text-muted); }
.auth-switch a { color: var(--gold); text-decoration: none; font-weight: 500; }
.auth-switch a:hover { text-decoration: underline; }

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 1.1rem;
}
.brand i { color: var(--gold); font-size: 1.3rem; }

.field-label { display: block; font-size: 0.78rem; color: var(--text-muted); margin: 14px 0 6px; }
.field-input {
  width: 100%;
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 11px 14px;
  border-radius: 9px;
  font-size: 0.92rem;
  font-family: inherit;
}
.field-input::placeholder { color: #5b6577; }
.field-input:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px var(--gold-dim);
}

.btn-primary-custom {
  background: var(--gold);
  color: #1a1305;
  border: none;
  padding: 12px 20px;
  border-radius: 9px;
  font-weight: 600;
  font-size: 0.92rem;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.btn-primary-custom:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(242,184,75,0.25); }
.btn-ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 12px 18px;
  border-radius: 9px;
  cursor: pointer;
}
.btn-ghost:hover { border-color: var(--text-muted); color: var(--text); }

.alert-custom {
  background: rgba(251,111,146,0.12);
  border: 1px solid rgba(251,111,146,0.3);
  color: #ffb3c4;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.88rem;
}

/* ---------- App shell ---------- */
.app-shell {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}
.sidebar {
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 24px 18px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--surface-2);
  border-radius: 10px;
}
.avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--gold-dim);
  color: var(--gold);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.8rem;
  flex-shrink: 0;
}
.user-name { font-size: 0.85rem; font-weight: 600; }
.user-tag { font-size: 0.72rem; color: var(--text-muted); }

.sidebar-nav { flex: 1; overflow-y: auto; }
.nav-section-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 10px;
}
.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.87rem;
  cursor: pointer;
  margin-bottom: 4px;
  text-align: left;
}
.nav-item:hover { background: var(--surface-2); color: var(--text); }
.nav-item.active { background: var(--gold-dim); color: var(--gold); }
.rename-icon { opacity: 0.6; }
.rename-icon:hover { opacity: 1; }
.rename-input {
  flex: 1;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 0.82rem;
  min-width: 0;
}
.new-profil { display: flex; gap: 6px; margin-top: 12px; }
.add-profil-btn {
  background: var(--gold-dim);
  color: var(--gold);
  border: none;
  border-radius: 6px;
  width: 32px;
  cursor: pointer;
}

.logout-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 10px;
  border-radius: 9px;
  cursor: pointer;
  font-size: 0.85rem;
}
.logout-btn:hover { color: var(--rose); border-color: var(--rose); }

.main-area { padding: 32px 40px; max-width: 900px; }
.main-header h1 { font-size: 1.4rem; margin-bottom: 20px; }

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 60px 20px;
}
.empty-state.small { padding: 30px 20px; }
.empty-state i { font-size: 2.2rem; display: block; margin-bottom: 10px; opacity: 0.5; }

.balance-hero {
  background: linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 26px 28px;
  margin-bottom: 24px;
}
.balance-label { color: var(--text-muted); font-size: 0.82rem; margin-bottom: 4px; }
.balance-amount { font-family: 'JetBrains Mono', monospace; font-size: 2.4rem; font-weight: 600; }
.balance-amount.positive { color: var(--green); }
.balance-amount.negative { color: var(--rose); }
.balance-bar {
  height: 8px;
  background: var(--rose);
  border-radius: 4px;
  overflow: hidden;
  margin: 16px 0 10px;
}
.balance-bar-fill { height: 100%; background: var(--green); }
.balance-legend { display: flex; gap: 20px; font-size: 0.8rem; color: var(--text-muted); }
.balance-legend i { font-size: 0.55rem; margin-right: 6px; }

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 20px;
}
.panel-title { font-size: 1rem; margin-bottom: 16px; }

.type-toggle { display: flex; gap: 10px; margin-bottom: 16px; }
.type-btn {
  flex: 1;
  padding: 10px;
  border-radius: 9px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.87rem;
}
.type-btn.expense.active { background: rgba(251,111,146,0.15); border-color: var(--rose); color: var(--rose); }
.type-btn.income.active { background: rgba(52,211,153,0.15); border-color: var(--green); color: var(--green); }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.data-table { width: 100%; border-collapse: collapse; }
.data-table thead th {
  text-align: left;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
}
.data-table tbody td {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  font-size: 0.88rem;
}
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: var(--surface-2); }
.text-muted-custom { color: var(--text-muted); }

.cat-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.74rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.icon-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  width: 32px; height: 32px;
  border-radius: 7px;
  margin-left: 6px;
  cursor: pointer;
}
.icon-btn:hover { color: var(--gold); border-color: var(--gold); }
.icon-btn.danger:hover { color: var(--rose); border-color: var(--rose); }

/* ---------- Mobile ---------- */
@media (max-width: 860px) {
  .app-shell { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
  .sidebar {
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    border-right: none;
    border-bottom: 1px solid var(--border);
    padding: 14px 16px;
    gap: 12px;
  }
  .sidebar-user { order: 2; }
  .sidebar-nav { order: 3; width: 100%; display: flex; overflow-x: auto; gap: 6px; }
  .sidebar-nav .nav-section-label { display: none; }
  .nav-item { width: auto; white-space: nowrap; }
  .new-profil { width: 200px; }
  .logout-btn { order: 1; margin-left: auto; padding: 8px 10px; }
  .main-area { padding: 20px 16px; }
  .form-grid { grid-template-columns: 1fr; }
  .balance-amount { font-size: 1.9rem; }
}
</style>
