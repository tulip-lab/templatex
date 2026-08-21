<script setup lang="ts">
import { lockShortcuts, useNav } from '@slidev/client'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'

type SyncStatus = 'disabled' | 'connecting' | 'connected' | 'disconnected' | 'mismatch'

interface SyncMessage {
  type?: string
  protocolVersion?: number
  page?: number
  clicks?: number
  revision?: number
  deckRevision?: string | null
  audienceConnections?: number
}

const PROTOCOL_VERSION = 2
const SUPPORTED_PROTOCOLS = new Set([1, 2])
const MAX_CLICKS = 999_999
const AUDIENCE_CLASS = 'slide-sync-audience'
const BLOCKED_AUDIENCE_EVENTS = [
  'click',
  'dblclick',
  'pointerdown',
  'contextmenu',
  'wheel',
  'touchstart',
  'touchmove',
  'touchend',
] as const
const env = import.meta.env as Record<string, string | boolean | undefined>
const enabled = env.VITE_SLIDE_SYNC_ENABLED === 'true'
const deckRevision = String(env.VITE_DECK_REVISION || 'local')
const nav = useNav()
const status = shallowRef<SyncStatus>(enabled ? 'connecting' : 'disabled')
const authoritativePage = shallowRef<number | null>(null)
const authoritativeClicks = shallowRef(0)
const latestRevision = shallowRef(-1)
const applyingRemoteNavigation = shallowRef(false)
const audienceConnections = shallowRef(0)

let socket: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let reconnectAttempt = 0
let stopped = false
let unlockAudienceShortcuts: (() => void) | null = null

const role = computed(() => nav.isPresenter.value ? 'presenter' : 'audience')
const statusLabel = computed(() => {
  if (role.value === 'presenter' && status.value === 'connected') {
    const noun = audienceConnections.value === 1 ? 'viewer' : 'viewers'
    return `Sync connected · ${audienceConnections.value} ${noun} online`
  }
  return {
    disabled: 'Sync disabled',
    connecting: 'Sync connecting',
    connected: 'Sync connected',
    disconnected: 'Sync offline',
    mismatch: 'Deck version mismatch',
  }[status.value]
})

function endpoint() {
  const base = String(import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')
  const path = role.value === 'presenter' ? 'presenter-sync' : 'sync'
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${location.host}${base}${path}`
}

function send(message: Record<string, unknown>) {
  if (socket?.readyState === WebSocket.OPEN)
    socket.send(JSON.stringify({ ...message, protocolVersion: PROTOCOL_VERSION }))
}

function publishPresenterState() {
  send({
    type: 'presenter_hello',
    totalPages: nav.total.value,
    deckRevision,
  })
  publishPresenterNavigation()
}

function publishPresenterNavigation() {
  send({
    type: 'page',
    page: nav.currentPage.value,
    clicks: nav.clicks.value,
  })
}

async function applyAuthoritativeNavigation(page: number, clicks: number) {
  if (nav.currentPage.value === page && nav.clicks.value === clicks)
    return
  applyingRemoteNavigation.value = true
  try {
    await nav.go(page, clicks)
  }
  finally {
    applyingRemoteNavigation.value = false
  }
}

function handleAudienceMessage(data: SyncMessage) {
  if (!SUPPORTED_PROTOCOLS.has(data.protocolVersion || -1))
    return
  if (!['state', 'page'].includes(data.type || ''))
    return
  if (!Number.isSafeInteger(data.page) || (data.page || 0) < 1)
    return
  const clicks = data.clicks === undefined ? 0 : data.clicks
  if (!Number.isSafeInteger(clicks) || clicks < 0 || clicks > MAX_CLICKS)
    return
  if (!Number.isSafeInteger(data.revision) || (data.revision || -1) <= latestRevision.value)
    return
  if (data.deckRevision && data.deckRevision !== deckRevision) {
    stopped = true
    status.value = 'mismatch'
    socket?.close(1000, 'Deck version mismatch')
    return
  }

  latestRevision.value = data.revision as number
  authoritativePage.value = data.page as number
  authoritativeClicks.value = clicks
  void applyAuthoritativeNavigation(data.page as number, clicks)
}

function handlePresenterMessage(data: SyncMessage) {
  if (!SUPPORTED_PROTOCOLS.has(data.protocolVersion || -1))
    return
  if (!['state', 'presence'].includes(data.type || ''))
    return
  if (!Number.isSafeInteger(data.audienceConnections) || (data.audienceConnections || 0) < 0)
    return
  audienceConnections.value = data.audienceConnections as number
}

function blockAudienceInteraction(event: Event) {
  event.preventDefault()
  event.stopImmediatePropagation()
}

function enablePassiveAudience() {
  document.documentElement.classList.add(AUDIENCE_CLASS)
  unlockAudienceShortcuts = lockShortcuts()
  for (const eventName of BLOCKED_AUDIENCE_EVENTS)
    document.addEventListener(eventName, blockAudienceInteraction, { capture: true, passive: false })
}

function disablePassiveAudience() {
  document.documentElement.classList.remove(AUDIENCE_CLASS)
  unlockAudienceShortcuts?.()
  unlockAudienceShortcuts = null
  for (const eventName of BLOCKED_AUDIENCE_EVENTS)
    document.removeEventListener(eventName, blockAudienceInteraction, true)
}

function scheduleReconnect() {
  if (stopped || reconnectTimer)
    return
  status.value = 'disconnected'
  const delay = Math.min(10_000, 500 * 2 ** reconnectAttempt)
  reconnectAttempt += 1
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    connect()
  }, delay)
}

function connect() {
  if (!enabled || stopped)
    return
  status.value = 'connecting'
  try {
    socket = new WebSocket(endpoint())
  }
  catch {
    scheduleReconnect()
    return
  }

  socket.addEventListener('open', () => {
    reconnectAttempt = 0
    status.value = 'connected'
    if (role.value === 'presenter')
      publishPresenterState()
  })
  socket.addEventListener('message', (event) => {
    let data: SyncMessage
    try {
      data = JSON.parse(String(event.data))
    }
    catch {
      return
    }
    if (data.type === 'ended') {
      stopped = true
      location.reload()
      return
    }
    if (role.value === 'audience')
      handleAudienceMessage(data)
    else
      handlePresenterMessage(data)
  })
  socket.addEventListener('close', scheduleReconnect)
  socket.addEventListener('error', () => socket?.close())
}

watch([nav.currentPage, nav.clicks], () => {
  if (!enabled || applyingRemoteNavigation.value)
    return
  if (role.value === 'presenter') {
    publishPresenterNavigation()
    return
  }
  if (authoritativePage.value !== null
    && (nav.currentPage.value !== authoritativePage.value || nav.clicks.value !== authoritativeClicks.value)) {
    void applyAuthoritativeNavigation(authoritativePage.value, authoritativeClicks.value)
  }
})

onMounted(() => {
  if (enabled && role.value === 'audience')
    enablePassiveAudience()
  connect()
})
onBeforeUnmount(() => {
  stopped = true
  disablePassiveAudience()
  if (reconnectTimer)
    clearTimeout(reconnectTimer)
  socket?.close(1000, 'Component unmounted')
})
</script>

<template>
  <div
    v-if="enabled && (nav.isPresenter.value || status !== 'connected')"
    class="slide-sync-status"
    :class="`slide-sync-status--${status}`"
    role="status"
    :aria-label="statusLabel"
    :title="statusLabel"
  >
    <span aria-hidden="true" />
    {{ statusLabel }}
  </div>
</template>

<style scoped>
.slide-sync-status {
  position: fixed;
  top: 0.7rem;
  right: 0.7rem;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid rgb(17 24 39 / 22%);
  border-radius: 4px;
  padding: 0.28rem 0.48rem;
  background: rgb(255 255 255 / 92%);
  color: #374151;
  font: 600 0.58rem/1 system-ui, sans-serif;
  letter-spacing: 0;
  box-shadow: 0 2px 8px rgb(17 24 39 / 12%);
}

.slide-sync-status span {
  width: 0.45rem;
  height: 0.45rem;
  flex: 0 0 0.45rem;
  border-radius: 50%;
  background: #d97706;
}

.slide-sync-status--connected span {
  background: #059669;
}

.slide-sync-status--disconnected span,
.slide-sync-status--mismatch span {
  background: #dc2626;
}
</style>

<style>
html.slide-sync-audience #slide-container > :not(#slide-content) {
  display: none !important;
}

html.slide-sync-audience #slide-container {
  cursor: default !important;
}
</style>
