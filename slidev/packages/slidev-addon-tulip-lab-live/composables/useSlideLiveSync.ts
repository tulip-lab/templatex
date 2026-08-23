import { disableBuiltinSync, lockShortcuts, onDrawingUpdate, useDrawings, useNav } from '@slidev/client'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { sanitizeDrawingFragment } from '../utils/drawings'

export type SyncStatus = 'disabled' | 'connecting' | 'connected' | 'disconnected' | 'mismatch' | 'drawing-error'

interface SyncMessage {
  type?: string
  protocolVersion?: number
  page?: number
  clicks?: number
  drawing?: string
  revision?: number
  deckRevision?: string | null
  audienceConnections?: number
}

const PROTOCOL_VERSION = 3
const SUPPORTED_PROTOCOLS = new Set([1, 2, 3])
const MAX_CLICKS = 999_999
const DRAWING_THROTTLE_MS = 100
const AUDIENCE_CLASS = 'slide-sync-audience'
const ENABLED_CLASS = 'slide-sync-enabled'
const FULLSCREEN_QUERY = 'tulipPresenter'
const BLOCKED_AUDIENCE_EVENTS = [
  'click', 'dblclick', 'pointerdown', 'contextmenu', 'wheel',
  'touchstart', 'touchmove', 'touchend',
] as const

export function useSlideLiveSync() {
  const env = import.meta.env as Record<string, string | boolean | undefined>
  const enabled = env.VITE_SLIDE_SYNC_ENABLED === 'true'
  const deckRevision = String(env.VITE_DECK_REVISION || 'local')
  const nav = useNav()
  const { drauu, drawingState, isDrawing } = useDrawings()
  if (enabled)
    disableBuiltinSync()
  const status = shallowRef<SyncStatus>(enabled ? 'connecting' : 'disabled')
  const authoritativePage = shallowRef<number | null>(null)
  const authoritativeClicks = shallowRef(0)
  const latestRevision = shallowRef(-1)
  const applyingRemoteNavigation = shallowRef(false)
  const audienceConnections = shallowRef(0)

  let socket: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let drawingTimer: ReturnType<typeof setTimeout> | null = null
  let drawingApplyTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectAttempt = 0
  let stopped = false
  let unlockAudienceShortcuts: (() => void) | null = null
  let lastDrawingMessage = ''
  const pendingRemoteDrawings = new Map<number, string>()

  const isFullscreenPresenter = computed(() => !nav.isPresenter.value
    && nav.currentRoute.value.query[FULLSCREEN_QUERY] === 'fullscreen')
  const role = computed(() => nav.isPresenter.value || isFullscreenPresenter.value ? 'presenter' : 'audience')
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
      'drawing-error': 'Drawing is too complex to sync',
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

  function localDrawing(page = nav.currentPage.value) {
    return sanitizeDrawingFragment(drawingState[page] || '')
  }

  function publishDrawing(committed: boolean) {
    if (role.value !== 'presenter')
      return
    const page = nav.currentPage.value
    const drawing = localDrawing(page)
    if (drawing === null) {
      status.value = 'drawing-error'
      return
    }
    const fingerprint = `${page}:${committed ? '1' : '0'}:${drawing}`
    if (fingerprint === lastDrawingMessage)
      return
    lastDrawingMessage = fingerprint
    send({ type: 'drawing', page, drawing, committed })
  }

  function publishPresenterNavigation() {
    const drawing = localDrawing()
    send({
      type: 'page',
      page: nav.currentPage.value,
      clicks: nav.clicks.value,
      ...(drawing === null ? {} : { drawing }),
    })
  }

  function publishPresenterState() {
    send({ type: 'presenter_hello', totalPages: nav.total.value, deckRevision })
    publishPresenterNavigation()
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

  function drawingFromMessage(data: SyncMessage) {
    if (data.drawing === undefined)
      return undefined
    return sanitizeDrawingFragment(data.drawing)
  }

  function flushRemoteDrawings() {
    drawingApplyTimer = null
    if (!drauu.mounted) {
      drawingApplyTimer = setTimeout(flushRemoteDrawings, 16)
      return
    }
    if (!pendingRemoteDrawings.size)
      return
    onDrawingUpdate(Object.fromEntries(pendingRemoteDrawings))
    pendingRemoteDrawings.clear()
  }

  function applyRemoteDrawing(page: number, drawing: string) {
    pendingRemoteDrawings.set(page, drawing)
    if (!drawingApplyTimer)
      flushRemoteDrawings()
  }

  function validateAudienceRevision(data: SyncMessage) {
    if (!Number.isSafeInteger(data.revision) || (data.revision || -1) <= latestRevision.value)
      return false
    if (data.deckRevision && data.deckRevision !== deckRevision) {
      stopped = true
      status.value = 'mismatch'
      socket?.close(1000, 'Deck version mismatch')
      return false
    }
    latestRevision.value = data.revision as number
    return true
  }

  function handleAudienceMessage(data: SyncMessage) {
    if (!SUPPORTED_PROTOCOLS.has(data.protocolVersion || -1) || !validateAudienceRevision(data))
      return

    if (data.type === 'drawing') {
      if (!Number.isSafeInteger(data.page) || (data.page || 0) < 1)
        return
      const drawing = drawingFromMessage(data)
      if (drawing === null || drawing === undefined)
        return
      applyRemoteDrawing(data.page as number, drawing)
      return
    }

    if (!['state', 'page'].includes(data.type || ''))
      return
    if (!Number.isSafeInteger(data.page) || (data.page || 0) < 1)
      return
    const clicks = data.clicks === undefined ? 0 : data.clicks
    if (!Number.isSafeInteger(clicks) || clicks < 0 || clicks > MAX_CLICKS)
      return
    const drawing = drawingFromMessage(data)
    if (drawing === null)
      return
    if (drawing !== undefined)
      applyRemoteDrawing(data.page as number, drawing)

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
    if (unlockAudienceShortcuts)
      return
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
    let nextSocket: WebSocket
    try {
      nextSocket = new WebSocket(endpoint())
      socket = nextSocket
    }
    catch {
      scheduleReconnect()
      return
    }

    nextSocket.addEventListener('open', () => {
      if (socket !== nextSocket)
        return
      reconnectAttempt = 0
      status.value = 'connected'
      if (role.value === 'presenter')
        publishPresenterState()
    })
    nextSocket.addEventListener('message', (event) => {
      if (socket !== nextSocket)
        return
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
    nextSocket.addEventListener('close', () => {
      if (socket === nextSocket)
        scheduleReconnect()
    })
    nextSocket.addEventListener('error', () => nextSocket.close())
  }

  function reconnectForRole() {
    if (!enabled || stopped)
      return
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    const previous = socket
    socket = null
    previous?.close(1000, 'Role changed')
    latestRevision.value = -1
    lastDrawingMessage = ''
    connect()
  }

  async function enterPresenterFullscreen() {
    if (!enabled || !nav.isPresenter.value)
      return
    await document.documentElement.requestFullscreen?.().catch(() => {})
    await nav.router.replace({
      query: { ...nav.currentRoute.value.query, [FULLSCREEN_QUERY]: 'fullscreen' },
    })
    nav.exitPresenter()
  }

  async function returnToPresenter() {
    if (document.fullscreenElement)
      await document.exitFullscreen().catch(() => {})
    nav.enterPresenter()
  }

  async function clearFullscreenQuery() {
    if (!nav.isPresenter.value || nav.currentRoute.value.query[FULLSCREEN_QUERY] !== 'fullscreen')
      return
    const query = { ...nav.currentRoute.value.query }
    delete query[FULLSCREEN_QUERY]
    await nav.router.replace({ query })
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

  watch(() => drawingState[nav.currentPage.value] || '', () => {
    if (!enabled || role.value !== 'presenter')
      return
    if (drawingTimer)
      clearTimeout(drawingTimer)
    if (drawingApplyTimer)
      clearTimeout(drawingApplyTimer)
    if (!isDrawing.value) {
      publishDrawing(true)
      return
    }
    drawingTimer = setTimeout(() => {
      drawingTimer = null
      publishDrawing(false)
    }, DRAWING_THROTTLE_MS)
  })

  watch(isDrawing, (drawing, wasDrawing) => {
    if (!drawing && wasDrawing && role.value === 'presenter') {
      if (drawingTimer) {
        clearTimeout(drawingTimer)
        drawingTimer = null
      }
      publishDrawing(true)
    }
  })

  watch(role, (nextRole) => {
    if (nextRole === 'audience')
      enablePassiveAudience()
    else
      disablePassiveAudience()
    reconnectForRole()
  })

  watch(nav.isPresenter, async (presenter) => {
    if (!presenter || nav.currentRoute.value.query[FULLSCREEN_QUERY] !== 'fullscreen')
      return
    await nextTick()
    await clearFullscreenQuery()
  })

  onMounted(() => {
    if (!enabled)
      return
    // Slidev initializes some local channels after addon setup; close those too.
    disableBuiltinSync()
    document.documentElement.classList.add(ENABLED_CLASS)
    void clearFullscreenQuery()
    if (role.value === 'audience')
      enablePassiveAudience()
    connect()
  })

  onBeforeUnmount(() => {
    stopped = true
    document.documentElement.classList.remove(ENABLED_CLASS)
    disablePassiveAudience()
    if (reconnectTimer)
      clearTimeout(reconnectTimer)
    if (drawingTimer)
      clearTimeout(drawingTimer)
    socket?.close(1000, 'Component unmounted')
  })

  return {
    audienceConnections,
    enabled,
    enterPresenterFullscreen,
    isFullscreenPresenter,
    nav,
    returnToPresenter,
    role,
    status,
    statusLabel,
  }
}
