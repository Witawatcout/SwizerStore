type SwizerLanguage = 'th' | 'en'

type TranslateJs = {
  execute?: () => void
  changeLanguage?: (language: string) => void
  selectLanguageTag?: {
    show?: boolean
  }
  service?: {
    use?: (name: string) => void
  }
  language?: {
    setLocal?: (language: string) => void
    setDefaultTo?: (language: string) => void
  }
  ignore?: {
    class?: string[]
    id?: string[]
  }
  listener?: {
    start?: () => void
    renderTaskFinish?: () => void
  }
}

type TranslateWindow = Window & {
  translate?: TranslateJs
  __swizerTranslate?: Record<string, unknown>
}

const SCRIPT_ID = 'swizer-translate-js-script'
const SCRIPT_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/translate.js/3.18.58/translate.js'
const STORAGE_KEY = 'swizer-language'
const LOCAL_LANGUAGE = 'thai'
const TARGET_LANGUAGE = 'english'

function loadTranslateJs() {
  const translateWindow = window as TranslateWindow

  if (translateWindow.translate) {
    return Promise.resolve(translateWindow.translate)
  }

  const existingScript = document.getElementById(SCRIPT_ID)

  if (existingScript) {
    return new Promise<TranslateJs>((resolve, reject) => {
      const startedAt = Date.now()
      const timer = window.setInterval(() => {
        if (translateWindow.translate) {
          window.clearInterval(timer)
          resolve(translateWindow.translate)
          return
        }

        if (Date.now() - startedAt > 8000) {
          window.clearInterval(timer)
          reject(new Error('translate.js did not initialize'))
        }
      }, 100)
    })
  }

  return new Promise<TranslateJs>((resolve, reject) => {
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => {
      if (translateWindow.translate) {
        resolve(translateWindow.translate)
        return
      }

      reject(new Error('translate.js is not available'))
    }
    script.onerror = () => reject(new Error('Cannot load translate.js'))
    document.head.appendChild(script)
  })
}

function configureTranslate(translate: TranslateJs) {
  translate.selectLanguageTag = translate.selectLanguageTag || {}
  translate.selectLanguageTag.show = false

  translate.ignore = translate.ignore || {}
  translate.ignore.class = Array.from(new Set([...(translate.ignore.class || []), 'notranslate']))
  translate.ignore.id = Array.from(new Set([...(translate.ignore.id || []), '__nuxt-devtools-container']))

  translate.language?.setLocal?.(LOCAL_LANGUAGE)
  translate.service?.use?.('client.edge')
  translate.listener?.start?.()
}

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const language = useState<SwizerLanguage>('swizer-translate-language', () => 'th')
  const loading = useState('swizer-translate-loading', () => false)
  const ready = useState('swizer-translate-ready', () => false)
  const error = useState<string | null>('swizer-translate-error', () => null)

  function syncDebugState(extra: Record<string, unknown> = {}) {
    const translateWindow = window as TranslateWindow

    translateWindow.__swizerTranslate = {
      language: language.value,
      loading: loading.value,
      ready: ready.value,
      error: error.value,
      hasTranslateJs: Boolean(translateWindow.translate),
      route: route.path,
      ...extra,
    }
  }

  async function initTranslate() {
    const translate = await loadTranslateJs()
    configureTranslate(translate)
    ready.value = true
    syncDebugState()
    return translate
  }

  async function setLanguage(nextLanguage: SwizerLanguage) {
    if (route.path.toLowerCase().startsWith('/admin')) return

    loading.value = true
    error.value = null
    syncDebugState({ requestedLanguage: nextLanguage })

    try {
      const translate = await initTranslate()
      const translateJsLanguage = nextLanguage === 'en' ? TARGET_LANGUAGE : LOCAL_LANGUAGE

      localStorage.setItem(STORAGE_KEY, nextLanguage)
      language.value = nextLanguage
      document.documentElement.lang = nextLanguage
      document.body.classList.toggle('swizer-is-translated', nextLanguage === 'en')

      translate.changeLanguage?.(translateJsLanguage)
      translate.execute?.()

      syncDebugState({ translateJsLanguage })
    } catch (translateError) {
      error.value = translateError instanceof Error ? translateError.message : 'Cannot translate this page'
      syncDebugState()
    } finally {
      window.setTimeout(() => {
        loading.value = false
        syncDebugState()
      }, 600)
    }
  }

  async function toggleLanguage() {
    await setLanguage(language.value === 'en' ? 'th' : 'en')
  }

  onNuxtReady(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEY)

    if (savedLanguage === 'en') {
      window.setTimeout(() => setLanguage('en'), 700)
    } else {
      syncDebugState()
    }
  })

  watch(
    () => route.fullPath,
    () => {
      if (language.value !== 'en') return

      window.setTimeout(() => setLanguage('en'), 800)
    },
  )

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
