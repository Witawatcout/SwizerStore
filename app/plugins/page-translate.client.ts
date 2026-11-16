type SwizerLanguage = 'th' | 'en' | 'zh'

type GoogleTranslateWindow = Window & {
  google?: {
    translate?: {
      TranslateElement?: new (
        options: {
          pageLanguage: string
          includedLanguages: string
          autoDisplay?: boolean
        },
        elementId: string,
      ) => unknown
    }
  }
  googleTranslateElementInit?: () => void
  __swizerTranslate?: Record<string, unknown>
}

const SCRIPT_ID = 'swizer-google-translate-script'
const SCRIPT_SRC = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
const CONTAINER_ID = 'google_translate_element'
const STORAGE_KEY = 'swizer-language'

const LANGUAGE_CONFIG: Record<SwizerLanguage, { googLang: string; htmlLang: string; translated: boolean }> = {
  th: { googLang: 'th', htmlLang: 'th', translated: false },
  en: { googLang: 'en', htmlLang: 'en', translated: true },
  zh: { googLang: 'zh-CN', htmlLang: 'zh-CN', translated: true },
}

function setGoogTransCookie(googLang: string | null) {
  if (!googLang || googLang === 'th') {
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    const host = window.location.hostname
    if (host.includes('.') && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${host}`
    }
    return
  }

  document.cookie = `googtrans=/th/${googLang}; path=/; SameSite=Lax`
}

function ensureContainer() {
  let container = document.getElementById(CONTAINER_ID)
  if (!container) {
    container = document.createElement('div')
    container.id = CONTAINER_ID
    container.className = 'notranslate'
    container.setAttribute('aria-hidden', 'true')
    container.style.display = 'none'
    document.body.appendChild(container)
  }
  return container
}

function waitForComboSelect(timeoutMs = 5000): Promise<HTMLSelectElement> {
  const existing = document.querySelector<HTMLSelectElement>(`#${CONTAINER_ID} select.goog-te-combo`)
  if (existing) return Promise.resolve(existing)

  return new Promise((resolve, reject) => {
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const select = document.querySelector<HTMLSelectElement>(`#${CONTAINER_ID} select.goog-te-combo`)
      if (select) {
        window.clearInterval(timer)
        resolve(select)
        return
      }
      if (Date.now() - startedAt > timeoutMs) {
        window.clearInterval(timer)
        reject(new Error('Google Translate selector did not initialize'))
      }
    }, 50)
  })
}

function restoreOriginalLanguageViaIframe(): boolean {
  const iframes = document.querySelectorAll<HTMLIFrameElement>(
    'iframe.VIpgJd-ZVi9od-ORHb-OEVmcd, iframe.goog-te-banner-frame',
  )

  for (const iframe of iframes) {
    try {
      const restoreBtn = iframe.contentDocument?.querySelector<HTMLElement>('[id$=".restore"]')
      if (restoreBtn) {
        restoreBtn.click()
        return true
      }
    } catch {
      // Ignore cross-origin iframe access if any
    }
  }

  return false
}

function waitForTranslationSettled(
  nextLanguage: SwizerLanguage,
  requireMutation = false,
  timeoutMs = 4000,
): Promise<void> {
  const expectsTranslated = LANGUAGE_CONFIG[nextLanguage].translated

  return new Promise((resolve) => {
    let settledTimer: number | null = null
    let maxTimer: number | null = null
    let observer: MutationObserver | null = null
    let sawMutation = !requireMutation

    const finish = () => {
      if (settledTimer !== null) window.clearTimeout(settledTimer)
      if (maxTimer !== null) window.clearTimeout(maxTimer)
      observer?.disconnect()
      resolve()
    }

    const isTargetStateReady = () => {
      if (!sawMutation) return false
      const htmlClasses = document.documentElement.classList
      const hasTranslatedClass = htmlClasses.contains('translated-ltr') || htmlClasses.contains('translated-rtl')
      return expectsTranslated ? hasTranslatedClass : !hasTranslatedClass
    }

    const scheduleSettle = () => {
      if (!isTargetStateReady()) return
      if (settledTimer !== null) window.clearTimeout(settledTimer)
      settledTimer = window.setTimeout(finish, 250)
    }

    observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.target !== document.documentElement)) {
        sawMutation = true
      }
      scheduleSettle()
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'lang'],
    })

    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    })

    maxTimer = window.setTimeout(finish, timeoutMs)
    scheduleSettle()
  })
}

function loadGoogleTranslate(): Promise<void> {
  const gWindow = window as GoogleTranslateWindow
  ensureContainer()

  if (document.querySelector(`#${CONTAINER_ID} select.goog-te-combo`)) {
    return Promise.resolve()
  }

  return new Promise<void>((resolve, reject) => {
    const initElement = () => {
      const TranslateElement = gWindow.google?.translate?.TranslateElement
      if (!TranslateElement) {
        reject(new Error('Google Translate is not available'))
        return
      }

      new TranslateElement(
        {
          pageLanguage: 'th',
          includedLanguages: 'th,en,zh-CN',
          autoDisplay: false,
        },
        CONTAINER_ID,
      )
      resolve()
    }

    if (gWindow.google?.translate?.TranslateElement) {
      initElement()
      return
    }

    gWindow.googleTranslateElementInit = initElement

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = SCRIPT_SRC
      script.async = true
      script.onerror = () => reject(new Error('Cannot load Google Translate'))
      document.head.appendChild(script)
    }
  })
}

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const language = useState<SwizerLanguage>('swizer-translate-language', () => 'th')
  const loading = useState('swizer-translate-loading', () => false)
  const ready = useState('swizer-translate-ready', () => false)
  const error = useState<string | null>('swizer-translate-error', () => null)

  let initPromise: Promise<void> | null = null

  function isAdminRoute() {
    return route.path.toLowerCase().startsWith('/admin')
  }

  function syncDebugState(extra: Record<string, unknown> = {}) {
    const gWindow = window as GoogleTranslateWindow

    gWindow.__swizerTranslate = {
      language: language.value,
      loading: loading.value,
      ready: ready.value,
      error: error.value,
      hasGoogleTranslate: Boolean(gWindow.google?.translate?.TranslateElement),
      route: route.path,
      ...extra,
    }
  }

  async function initTranslate() {
    if (!initPromise) {
      initPromise = loadGoogleTranslate()
        .then(async () => {
          await waitForComboSelect()
          ready.value = true
          syncDebugState()
        })
        .catch((err) => {
          initPromise = null
          throw err
        })
    }

    return initPromise
  }

  async function setLanguage(nextLanguage: SwizerLanguage) {
    if (isAdminRoute() || loading.value) return

    const previousLanguage = language.value
    loading.value = true
    error.value = null
    syncDebugState({ requestedLanguage: nextLanguage })

    try {
      const config = LANGUAGE_CONFIG[nextLanguage]

      localStorage.setItem(STORAGE_KEY, nextLanguage)
      language.value = nextLanguage
      document.documentElement.lang = config.htmlLang
      document.body.classList.toggle('swizer-is-translated', config.translated)
      setGoogTransCookie(config.googLang)

      if (nextLanguage === 'th' && !ready.value) {
        syncDebugState({ googLang: config.googLang })
        return
      }

      await initTranslate()
      const combo = await waitForComboSelect()

      if (nextLanguage === 'th') {
        const settledPromise = waitForTranslationSettled('th')
        const hasThaiOption = Array.from(combo.options).some((opt) => opt.value === 'th')

        if (!restoreOriginalLanguageViaIframe()) {
          if (hasThaiOption) {
            combo.value = 'th'
            combo.dispatchEvent(new Event('change', { bubbles: true }))
          } else {
            combo.value = ''
            combo.dispatchEvent(new Event('change', { bubbles: true }))
          }
        }

        await settledPromise

        const stillTranslated =
          document.documentElement.classList.contains('translated-ltr') ||
          document.documentElement.classList.contains('translated-rtl')
        if (stillTranslated) {
          setGoogTransCookie(null)
          window.location.reload()
          return
        }
      } else {
        const switchingBetweenTranslated = previousLanguage !== 'th' && previousLanguage !== nextLanguage
        const settledPromise = waitForTranslationSettled(nextLanguage, switchingBetweenTranslated)

        if (combo.value !== config.googLang) {
          combo.value = config.googLang
        }
        combo.dispatchEvent(new Event('change', { bubbles: true }))
        await settledPromise
      }

      syncDebugState({ googLang: config.googLang })
    } catch (translateError) {
      error.value = translateError instanceof Error ? translateError.message : 'Cannot translate this page'
      syncDebugState()
    } finally {
      loading.value = false
      syncDebugState()
    }
  }

  async function toggleLanguage() {
    const nextLanguage = language.value === 'th' ? 'en' : language.value === 'en' ? 'zh' : 'th'
    await setLanguage(nextLanguage)
  }

  onNuxtReady(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEY)

    if (savedLanguage === 'en' || savedLanguage === 'zh') {
      setGoogTransCookie(LANGUAGE_CONFIG[savedLanguage].googLang)
      setLanguage(savedLanguage)
    } else {
      syncDebugState()
      if (!isAdminRoute()) {
        initTranslate().catch(() => {})
      }
    }
  })

  return {
    provide: {
      swizerTranslate: {
        language,
        loading,
        ready,
        error,
        setLanguage,
        toggleLanguage,
      },
    },
  }
})
