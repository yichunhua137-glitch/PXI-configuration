import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './lib/supabase'
import './App.css'

const MODULE_SOURCES = [
  { key: 'controller-8862', label: 'PXIe-8862', tmjPath: '/test/8862%20controller.tmj', tone: 'controller' },
  { key: 'module-4135', label: 'PXIe-4135', tmjPath: '/test/4135.tmj', tone: 'module' },
  { key: 'module-1487', label: 'PXIe-1487', tmjPath: '/test/1487.tmj', tone: 'module' },
  { key: 'module-5160', label: 'PXIe-5160', tmjPath: '/test/5160.tmj', tone: 'module' },
]

const CHASSIS_SOURCES = [
  {
    key: 'pxie-1095',
    label: 'PXIe-1095',
    status: 'available',
    note: 'Configured with tmj and drag-and-drop builder',
    image: 'PXIe-1095 1.png',
    tmjPath: '/test/1095.tmj',
  },
  {
    key: 'pxie-1092',
    label: 'PXIe-1092',
    status: 'available',
    note: 'Ready with slot anchors and preview image',
    image: 'PXIe-1092 1.png',
    tmjPath: '/test/1092.tmj',
  },
]

const CHASSIS_OPTIONS = [
  {
    key: 'pxie-1095',
    label: 'PXIe-1095',
    status: 'available',
    note: 'Configured with tmj and drag-and-drop builder',
    image: 'PXIe-1095 1.png',
  },
  {
    key: 'pxie-1092',
    label: 'PXIe-1092',
    status: 'available',
    note: 'Ready with slot anchors and preview image',
    image: 'PXIe-1092 1.png',
  },
  {
    key: 'placeholder-a',
    label: 'More Chassis',
    status: 'placeholder',
    note: 'Reserved for future chassis uploads',
  },
  {
    key: 'placeholder-b',
    label: 'Reserved',
    status: 'placeholder',
    note: 'Placeholder for additional PXI templates',
  },
]

const AUTH_QUOTES = [
  { text: 'To measure is to know.', author: 'Lord Kelvin' },
  { text: 'What gets measured gets managed.', author: 'Peter Drucker' },
  { text: 'Without data, you are just another person with an opinion.', author: 'W. Edwards Deming' },
  { text: 'Engineering is the art of directing the great sources of power in nature.', author: 'Thomas Tredgold' },
  { text: 'Every experiment is a question which science poses to nature.', author: 'Max Planck' },
]

const UPDATE_LOG_ITEMS = [
  {
    date: '2026-03-17',
    title: 'Supabase sign-in and saves',
    description: 'Added user authentication, saved configuration pages, and save/load flow for chassis layouts.',
  },
  {
    date: '2026-03-16',
    title: 'Dashboard and NI visual refresh',
    description: 'Introduced the dashboard view and updated the UI to a more square NI-style visual system.',
  },
  {
    date: '2026-03-15',
    title: 'Builder interaction update',
    description: 'Improved module drag and drop, section add actions, and the accordion-style module library.',
  },
]

function getPasswordRules(password) {
  return [
    { key: 'length', label: 'At least 8 characters', passed: password.length >= 8 },
    { key: 'upper', label: 'At least 1 uppercase letter', passed: /[A-Z]/.test(password) },
    { key: 'lower', label: 'At least 1 lowercase letter', passed: /[a-z]/.test(password) },
    { key: 'number', label: 'At least 1 number', passed: /\d/.test(password) },
  ]
}

function findImageLayer(map) {
  return map.layers?.find((layer) => layer.type === 'imagelayer') ?? null
}

function findObjectPoints(map) {
  const objectLayer = map.layers?.find((layer) => layer.type === 'objectgroup')
  return objectLayer?.objects?.filter((object) => object.point) ?? []
}

function basename(path) {
  return path.split('/').pop()
}

function buildImageCandidates(filename) {
  const file = basename(filename)
  return [`/test/${encodeURIComponent(file)}`, `/地图原素材/${encodeURIComponent(file)}`]
}

function loadImageFromCandidates(candidates) {
  return new Promise((resolve, reject) => {
    if (!candidates?.length) {
      reject(new Error('Missing asset'))
      return
    }

    let index = 0

    function tryLoad() {
      if (index >= candidates.length) {
        reject(new Error('Failed to load image'))
        return
      }

      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.onload = () => resolve(image)
      image.onerror = () => {
        index += 1
        tryLoad()
      }
      image.src = candidates[index]
    }

    tryLoad()
  })
}

function dominantY(points) {
  const buckets = new Map()

  points.forEach((point) => {
    const key = Math.round(point.y / 10) * 10
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  })

  return [...buckets.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0
}

function AssetImage({ candidates, alt, className, style, imageRef }) {
  const [index, setIndex] = useState(0)

  if (!candidates?.length || index >= candidates.length) {
    return (
      <div ref={imageRef} className={`missing-asset ${className ?? ''}`} style={style}>
        Missing Asset
      </div>
    )
  }

  return (
    <img
      ref={imageRef}
      className={className}
      src={candidates[index]}
      alt={alt}
      style={style}
      onError={() => {
        setIndex((current) => current + 1)
      }}
      draggable={false}
    />
  )
}

function GlobalHeading({ currentScreen, user, onNavigate, onSignOut }) {
  return (
    <header className="global-heading">
      <div className="global-brand">
        <img
          src="/nationalinstruments-logo.png"
          alt="National Instruments"
          className="global-brand-logo"
          draggable={false}
        />
        <span className="global-brand-name">Lab UI</span>
      </div>

      <nav className="global-nav" aria-label="Primary">
        <button
          type="button"
          className={`global-nav-item ${currentScreen === 'dashboard' ? 'global-nav-item-active' : ''}`}
          onClick={() => {
            onNavigate('dashboard')
          }}
        >
          Dashboard
        </button>
        <button
          type="button"
          className={`global-nav-item ${currentScreen === 'home' || currentScreen === 'builder' || currentScreen === 'saves' ? 'global-nav-item-active' : ''}`}
          onClick={() => {
            onNavigate('home')
          }}
        >
          PXI Configuration
        </button>
        <button
          type="button"
          className={`global-nav-item ${currentScreen === 'user' ? 'global-nav-item-active' : ''}`}
          onClick={() => {
            onNavigate('user')
          }}
        >
          User
        </button>
      </nav>

      {user ? (
        <div className="global-account">
          <span className="global-account-email">{user.email}</span>
          <button type="button" className="global-signout-button" onClick={onSignOut}>
            Sign Out
          </button>
        </div>
      ) : null}
    </header>
  )
}

function DashboardScreen({ savedConfigCount, onOpenConfiguration, onOpenSaves }) {
  return (
    <div className="app-screen home-shell">
      <section className="home-hero dashboard-hero">
        <div className="home-copy">
          <p className="eyebrow">Dashboard</p>
          <h1>All tools in one workspace.</h1>
          <p className="hero-text">
            Start from PXI Configuration, reopen saved layouts, and leave room for the next tools that will be added here.
          </p>
        </div>

        <div className="home-summary">
          <article className="summary-card">
            <strong>2</strong>
            <span>Active tools</span>
          </article>
          <article className="summary-card">
            <strong>{savedConfigCount}</strong>
            <span>Saved layouts</span>
          </article>
        </div>
      </section>

      <section className="home-grid">
        <article className="home-panel">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Workspace</p>
              <h2>Available tools</h2>
            </div>
          </div>

          <div className="dashboard-tool-grid">
            <button type="button" className="dashboard-tool-card dashboard-tool-card-active" onClick={onOpenConfiguration}>
              <span className="dashboard-tool-kicker">Ready</span>
              <strong>PXI Configuration</strong>
              <p>Select a chassis, enter the builder, and create or edit layouts.</p>
            </button>

            <button type="button" className="dashboard-tool-card dashboard-tool-card-active" onClick={onOpenSaves}>
              <span className="dashboard-tool-kicker">Ready</span>
              <strong>Your Saves</strong>
              <p>Open saved chassis layouts, continue editing, or remove old versions.</p>
            </button>

            <article className="dashboard-tool-card dashboard-tool-card-placeholder">
              <span className="dashboard-tool-kicker">Placeholder</span>
              <strong>Other Tool</strong>
              <p>This space is reserved for the next utility you want to add to the site.</p>
            </article>

            <article className="dashboard-tool-card dashboard-tool-card-placeholder">
              <span className="dashboard-tool-kicker">Placeholder</span>
              <strong>Future Module</strong>
              <p>Leave this card empty for a later workflow, report page, or engineering helper.</p>
            </article>
          </div>
        </article>

        <article className="home-panel">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Update Log</p>
              <h2>Recent changes</h2>
            </div>
          </div>

          <div className="update-log-list">
            {UPDATE_LOG_ITEMS.map((item) => (
              <article key={`${item.date}-${item.title}`} className="update-log-card">
                <span className="update-log-date">{item.date}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

function UserScreen({
  user,
  savedConfigCount,
  isLoadingConfigCount,
  nextPassword,
  passwordMessage,
  passwordError,
  passwordLoading,
  onNextPasswordChange,
  onPasswordSubmit,
  onOpenSaves,
}) {
  return (
    <div className="app-screen home-shell">
      <section className="home-hero user-hero">
        <div className="home-copy">
          <p className="eyebrow">User Interface</p>
          <h1>Account overview for your PXI workspace.</h1>
          <p className="hero-text">
            This page is reserved for your personal account information and later will hold saved configurations, recent exports, and profile-level settings.
          </p>
        </div>

        <div className="home-summary">
          <article className="summary-card">
            <strong>{user?.email ?? 'Unknown'}</strong>
            <span>Signed-in account</span>
          </article>
          <article className="summary-card">
            <strong>{isLoadingConfigCount ? '...' : savedConfigCount}</strong>
            <span>Saved configurations</span>
          </article>
          <button type="button" className="summary-card summary-card-button" onClick={onOpenSaves}>
            <strong>Your saves</strong>
            <small>Open saved layouts</small>
          </button>
        </div>
      </section>

      <section className="home-grid">
        <article className="home-panel">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Profile</p>
              <h2>Current user</h2>
            </div>
          </div>

          <div className="user-card-grid">
            <article className="summary-card">
              <strong>Email</strong>
              <span>{user?.email ?? 'Unknown'}</span>
            </article>
            <article className="summary-card">
              <strong>User ID</strong>
              <span className="user-id-text">{user?.id ?? 'Unknown'}</span>
            </article>
            <article className="summary-card">
              <strong>Status</strong>
              <span>{user?.email_confirmed_at ? 'Email Confirmed' : 'Awaiting Email Confirmation'}</span>
            </article>
            <article className="summary-card">
              <strong>Saved Configurations</strong>
              <span>{isLoadingConfigCount ? 'Loading...' : `${savedConfigCount} saved layout(s)`}</span>
            </article>
          </div>
        </article>

        <article className="home-panel">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Settings</p>
              <h2>Account settings</h2>
            </div>
          </div>

          <form className="user-settings-form" onSubmit={onPasswordSubmit}>
            <label className="auth-field">
              <span>New Password</span>
              <input
                type="password"
                value={nextPassword}
                onChange={(event) => {
                  onNextPasswordChange(event.target.value)
                }}
                minLength={6}
                placeholder="Enter a new password"
                required
              />
            </label>

            {passwordError ? <div className="auth-message auth-message-error">{passwordError}</div> : null}
            {passwordMessage ? <div className="auth-message auth-message-success">{passwordMessage}</div> : null}

            <button type="submit" className="auth-submit user-settings-submit" disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </article>
      </section>
    </div>
  )
}

function SavesScreen({
  savedConfigCount,
  savedConfigurations,
  savedConfigsError,
  isLoadingSavedConfigurations,
  deletingConfigId,
  onOpenConfiguration,
  onDeleteConfiguration,
  onBackToConfiguration,
}) {
  return (
    <div className="app-screen home-shell">
      <section className="home-hero saves-hero">
        <div className="home-copy">
          <div className="saves-hero-heading">
            <button
              type="button"
              className="topbar-home-button saves-back-button"
              onClick={onBackToConfiguration}
              aria-label="Back to PXI Configuration"
              title="Back to PXI Configuration"
            >
              ←
            </button>
            <p className="eyebrow">Your Saves</p>
          </div>
          <h1>Open, edit, or remove saved PXI layouts.</h1>
          <p className="hero-text">
            Choose a saved chassis configuration, reopen it in the builder, or return to PXI Configuration to create a new one.
          </p>
        </div>

        <div className="home-summary">
          <article className="summary-card">
            <strong>{isLoadingSavedConfigurations ? '...' : savedConfigCount}</strong>
            <span>Total saves</span>
          </article>
        </div>
      </section>

      <section className="home-grid">
        <article className="home-panel">
          <button
            type="button"
            className="topbar-home-button saves-back-button"
            onClick={onBackToConfiguration}
            aria-label="Back to PXI Configuration"
            title="Back to PXI Configuration"
          >
            ←
          </button>
          <div className="section-title-row">
            <div>
              <button
                type="button"
                className="topbar-home-button saves-back-button"
                onClick={onBackToConfiguration}
                aria-label="Back to PXI Configuration"
                title="Back to PXI Configuration"
              >
                ←
              </button>
              <div>
                <p className="eyebrow">Saved Configurations</p>
                <h2>Your saved chassis</h2>
              </div>
            </div>
          </div>

          {savedConfigsError ? <div className="auth-message auth-message-error">{savedConfigsError}</div> : null}

          <div className="saved-config-list">
            {isLoadingSavedConfigurations ? (
              <div className="home-empty-state">Loading saved configurations...</div>
            ) : savedConfigurations.length ? (
              savedConfigurations.map((configuration) => (
                <article key={configuration.id} className="saved-config-card">
                  <div>
                    <strong>{configuration.name}</strong>
                    <span>{configuration.chassis_key}</span>
                    <span>Updated {new Date(configuration.updated_at).toLocaleString()}</span>
                  </div>
                  <div className="saved-config-actions">
                    <button
                      type="button"
                      className="slot-action"
                      onClick={() => {
                        onOpenConfiguration(configuration)
                      }}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      className="slot-action slot-action-danger"
                      onClick={() => {
                        onDeleteConfiguration(configuration.id)
                      }}
                      disabled={deletingConfigId === configuration.id}
                    >
                      {deletingConfigId === configuration.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="home-empty-state">No saved configurations yet.</div>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}

function AuthScreen({
  logoTilt,
  authQuote,
  authMode,
  email,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  passwordRules,
  authError,
  authNotice,
  authLoading,
  onModeChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePasswordVisibility,
  onToggleConfirmPasswordVisibility,
  onSubmit,
  onLogoMove,
  onLogoLeave,
}) {
  return (
    <main className="page-shell auth-shell">
      <section className="auth-panel">
        <div className="auth-copy">
          <div
            className="auth-logo-card"
            style={{
              '--logo-rotate-x': `${logoTilt.x}deg`,
              '--logo-rotate-y': `${logoTilt.y}deg`,
            }}
            onMouseMove={onLogoMove}
            onMouseLeave={onLogoLeave}
          >
            <div className="auth-logo-stage">
              <img
                src="/nationalinstruments-logo.png"
                alt="National Instruments"
                className="auth-logo-image"
                draggable={false}
              />
            </div>
            <div className="auth-logo-glow" />
            <div className="auth-quote-list">
              <blockquote className="auth-quote-card">
                <p>“To measure is to know.”</p>
                <span>Lord Kelvin</span>
              </blockquote>
              <blockquote className="auth-quote-card">
                <p>“What gets measured gets managed.”</p>
                <span>Peter Drucker</span>
              </blockquote>
            </div>
            <div className="auth-quote-random">
              <p>{authQuote.text}</p>
              <span>{authQuote.author}</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-mode-switch">
              <button
                type="button"
                className={`auth-mode-button ${authMode === 'sign-in' ? 'auth-mode-button-active' : ''}`}
                onClick={() => {
                  onModeChange('sign-in')
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-mode-button ${authMode === 'sign-up' ? 'auth-mode-button-active' : ''}`}
                onClick={() => {
                  onModeChange('sign-up')
                }}
              >
                Sign Up
              </button>
            </div>
            <h2>{authMode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h2>
            <p>{authMode === 'sign-in' ? 'Use your email to access saved PXI configurations.' : 'Register with email and password. Email confirmation is enabled.'}</p>
          </div>

          <form className="auth-form" onSubmit={onSubmit}>
            <label className="auth-field">
              <span>Email</span>
              <input type="email" value={email} onChange={(event) => onEmailChange(event.target.value)} required />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <div className="auth-password-row">
                <input
                  className="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={onTogglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <img
                    src={showPassword ? '/see/no%20see.png' : '/see/see.png'}
                    alt=""
                    className="auth-password-toggle-icon"
                    draggable={false}
                  />
                </button>
              </div>
            </label>

            {authMode === 'sign-up' ? (
              <div className="auth-password-rules">
                {passwordRules.map((rule) => (
                  <div
                    key={rule.key}
                    className={`auth-password-rule ${rule.passed ? 'auth-password-rule-passed' : ''}`}
                  >
                    <span>{rule.passed ? '✓' : '•'}</span>
                    <span>{rule.label}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {authMode === 'sign-up' ? (
              <label className="auth-field">
                <span>Confirm Password</span>
                <div className="auth-password-row">
                  <input
                    className="auth-password-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => onConfirmPasswordChange(event.target.value)}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={onToggleConfirmPasswordVisibility}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    <img
                      src={showConfirmPassword ? '/see/no%20see.png' : '/see/see.png'}
                      alt=""
                      className="auth-password-toggle-icon"
                      draggable={false}
                    />
                  </button>
                </div>
              </label>
            ) : null}

            {authError ? <div className="auth-message auth-message-error">{authError}</div> : null}
            {authNotice ? <div className="auth-message auth-message-success">{authNotice}</div> : null}

            <button type="submit" className="auth-submit" disabled={authLoading}>
              {authLoading ? 'Processing...' : authMode === 'sign-in' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

function App() {
  const [logoTilt, setLogoTilt] = useState({ x: 0, y: 0 })
  const [authQuote] = useState(() => AUTH_QUOTES[Math.floor(Math.random() * AUTH_QUOTES.length)])
  const [authReady, setAuthReady] = useState(false)
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authNotice, setAuthNotice] = useState('')
  const [savedConfigurations, setSavedConfigurations] = useState([])
  const [savedConfigCount, setSavedConfigCount] = useState(0)
  const [isLoadingSavedConfigurations, setIsLoadingSavedConfigurations] = useState(false)
  const [savedConfigsError, setSavedConfigsError] = useState('')
  const [currentConfigurationId, setCurrentConfigurationId] = useState(null)
  const [configurationName, setConfigurationName] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [deletingConfigId, setDeletingConfigId] = useState(null)
  const [nextPassword, setNextPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [currentScreen, setCurrentScreen] = useState('home')
  const [selectedChassisKey, setSelectedChassisKey] = useState('pxie-1095')
  const [searchText, setSearchText] = useState('')
  const [dataState, setDataState] = useState({
    loading: true,
    error: '',
    chassisMaps: {},
    moduleMaps: [],
  })
  const [draggedModuleKey, setDraggedModuleKey] = useState('')
  const [selectedModuleKey, setSelectedModuleKey] = useState('controller-8862')
  const [moduleSearchText, setModuleSearchText] = useState('')
  const [placedModules, setPlacedModules] = useState({})
  const [activeSlotId, setActiveSlotId] = useState(null)
  const [hoverSlotId, setHoverSlotId] = useState(null)
  const [contextSlotId, setContextSlotId] = useState(null)
  const [showSlotAnchors, setShowSlotAnchors] = useState(true)
  const [isExportingImage, setIsExportingImage] = useState(false)
  const [openLibrarySections, setOpenLibrarySections] = useState({
    controller: false,
    module: false,
    other: false,
  })
  const moduleThumbRefs = useRef({})
  const contextTimerRef = useRef(null)
  const passwordRules = useMemo(() => getPasswordRules(password), [password])

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      const { data, error } = await supabase.auth.getUser()

      if (!mounted) {
        return
      }

      if (error) {
        setAuthError(error.message)
      } else {
        setUser(data.user ?? null)
      }

      setAuthReady(true)
    }

    loadSession()

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
      if (session?.user) {
        setCurrentScreen('home')
        setAuthError('')
      }
    })

    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadMaps() {
      try {
        const responses = await Promise.all([
          ...CHASSIS_SOURCES.map((source) => fetch(source.tmjPath)),
          ...MODULE_SOURCES.map((source) => fetch(source.tmjPath)),
        ])

        if (responses.some((response) => !response.ok)) {
          throw new Error('Failed to load tmj files')
        }

        const loadedMaps = await Promise.all(responses.map((response) => response.json()))
        const chassisMaps = Object.fromEntries(
          CHASSIS_SOURCES.map((source, index) => [source.key, loadedMaps[index]]),
        )
        const moduleMaps = loadedMaps.slice(CHASSIS_SOURCES.length)

        if (!cancelled) {
          setDataState({
            loading: false,
            error: '',
            chassisMaps,
            moduleMaps,
          })
        }
      } catch (error) {
        if (!cancelled) {
          setDataState({
            loading: false,
            error: error instanceof Error ? error.message : 'Load failed',
            chassisMaps: {},
            moduleMaps: [],
          })
        }
      }
    }

    loadMaps()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (contextTimerRef.current) {
      clearTimeout(contextTimerRef.current)
      contextTimerRef.current = null
    }

    if (contextSlotId !== null) {
      contextTimerRef.current = setTimeout(() => {
        setContextSlotId(null)
      }, 1800)
    }

    return () => {
      if (contextTimerRef.current) {
        clearTimeout(contextTimerRef.current)
        contextTimerRef.current = null
      }
    }
  }, [contextSlotId])

  useEffect(() => {
    setPlacedModules({})
    setActiveSlotId(null)
    setHoverSlotId(null)
    setContextSlotId(null)
  }, [selectedChassisKey])

  useEffect(() => {
    let cancelled = false

    async function loadSavedConfigurations() {
      if (!user) {
        setSavedConfigurations([])
        setSavedConfigCount(0)
        return
      }

      setIsLoadingSavedConfigurations(true)
      setSavedConfigsError('')

      const { data, error } = await supabase
        .from('pxi_configurations')
        .select('*')
        .order('updated_at', { ascending: false })

      if (!cancelled) {
        if (error) {
          setSavedConfigurations([])
          setSavedConfigCount(0)
          setSavedConfigsError(error.message)
        } else {
          setSavedConfigurations(data ?? [])
          setSavedConfigCount(data?.length ?? 0)
        }
        setIsLoadingSavedConfigurations(false)
      }
    }

    loadSavedConfigurations()

    return () => {
      cancelled = true
    }
  }, [user])

  const chassisModel = useMemo(() => {
    const selectedChassisMap = dataState.chassisMaps[selectedChassisKey]

    if (!selectedChassisMap) {
      return null
    }

    const imageLayer = findImageLayer(selectedChassisMap)
    const points = findObjectPoints(selectedChassisMap)

    if (!imageLayer || !points.length) {
      return null
    }

    const yLine = dominantY(points)
    const slots = points
      .filter((point) => Math.abs(point.y - yLine) < 30)
      .sort((a, b) => a.x - b.x)
      .map((point, index) => ({
        id: point.id,
        x: point.x,
        y: point.y,
        label: point.name || `slot_${index + 1}`,
        index: index + 1,
      }))

    return {
      width: selectedChassisMap.width * selectedChassisMap.tilewidth,
      height: selectedChassisMap.height * selectedChassisMap.tileheight,
      imageLayer,
      slots,
    }
  }, [dataState.chassisMaps, selectedChassisKey])

  const moduleLibrary = useMemo(() => {
    return dataState.moduleMaps
      .map((map, index) => {
        const source = MODULE_SOURCES[index]
        const imageLayer = findImageLayer(map)
        const anchor = findObjectPoints(map)[0]

        if (!source || !imageLayer || !anchor) {
          return null
        }

        return {
          key: source.key,
          label: source.label,
          tone: source.tone,
          imageWidth: imageLayer.imagewidth,
          imageHeight: imageLayer.imageheight,
          imageCandidates: buildImageCandidates(imageLayer.image),
          anchor,
        }
      })
      .filter(Boolean)
  }, [dataState.moduleMaps])

  const normalizedSearch = searchText.trim().toLowerCase()
  const normalizedModuleSearch = moduleSearchText.trim().toLowerCase()

  const filteredChassisOptions = useMemo(() => {
    if (!normalizedSearch) {
      return CHASSIS_OPTIONS
    }

    return CHASSIS_OPTIONS.filter((option) =>
      [option.label, option.note, option.status].some((value) =>
        value?.toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [normalizedSearch])

  const librarySections = useMemo(() => {
    const controllers = moduleLibrary.filter((module) => module.tone === 'controller')
    const modules = moduleLibrary.filter((module) => module.tone === 'module')

    const sections = [
      {
        key: 'controller',
        label: 'Controller',
        items: [
          ...controllers.map((item) => ({ ...item, placeholder: false })),
          { key: 'controller-placeholder-1', label: 'PXIe-8881', placeholder: true },
          { key: 'controller-placeholder-2', label: 'PXIe-8840', placeholder: true },
        ],
      },
      {
        key: 'module',
        label: 'Modules',
        items: [
          ...modules.map((item) => ({ ...item, placeholder: false })),
          { key: 'module-placeholder-1', label: 'PXIe-6363', placeholder: true },
          { key: 'module-placeholder-2', label: 'PXIe-6738', placeholder: true },
          { key: 'module-placeholder-3', label: 'PXIe-4499', placeholder: true },
        ],
      },
      {
        key: 'other',
        label: 'Other',
        items: [
          { key: 'other-placeholder-1', label: 'Reserved Item A', placeholder: true },
          { key: 'other-placeholder-2', label: 'Reserved Item B', placeholder: true },
        ],
      },
    ]

    return sections.map((section) => {
      const visibleItems = normalizedModuleSearch
        ? section.items.filter((item) => item.label.toLowerCase().includes(normalizedModuleSearch))
        : section.items

      return {
        ...section,
        visibleItems,
        visibleCount: visibleItems.filter((item) => !item.placeholder).length,
        realItemCount: section.items.filter((item) => !item.placeholder).length,
        placeholderCount: visibleItems.filter((item) => item.placeholder).length,
      }
    })
  }, [moduleLibrary, normalizedModuleSearch])

  const previewLayout = useMemo(() => {
    if (!chassisModel) {
      return null
    }

    const toPercent = (value, total) => `${(value / total) * 100}%`

    return {
      chassis: {
        width: toPercent(chassisModel.imageLayer.imagewidth, chassisModel.width),
        height: toPercent(chassisModel.imageLayer.imageheight, chassisModel.height),
        left: toPercent(chassisModel.imageLayer.offsetx ?? 0, chassisModel.width),
        top: toPercent(chassisModel.imageLayer.offsety ?? 0, chassisModel.height),
      },
      slots: chassisModel.slots.map((slot) => ({
        ...slot,
        left: toPercent(slot.x, chassisModel.width),
        top: toPercent(slot.y, chassisModel.height),
      })),
    }
  }, [chassisModel])

  const placedModuleViews = useMemo(() => {
    if (!chassisModel) {
      return []
    }

    const chassisCenterX = chassisModel.width / 2

    return Object.entries(placedModules)
      .map(([slotId, moduleKey]) => {
        const slot = chassisModel.slots.find((candidate) => candidate.id === Number(slotId))
        const module = moduleLibrary.find((candidate) => candidate.key === moduleKey)

        if (!slot || !module) {
          return null
        }

        const centerDistance = Math.abs(slot.x - chassisCenterX)

        return {
          slotId: slot.id,
          slotIndex: slot.index,
          moduleKey: module.key,
          label: module.label,
          tone: module.tone,
          imageCandidates: module.imageCandidates,
          style: {
            width: `${(module.imageWidth / chassisModel.width) * 100}%`,
            height: `${(module.imageHeight / chassisModel.height) * 100}%`,
            left: `${((slot.x - module.anchor.x) / chassisModel.width) * 100}%`,
            top: `${((slot.y - module.anchor.y) / chassisModel.height) * 100}%`,
            zIndex: 2 + Math.round(centerDistance),
          },
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.style.zIndex - b.style.zIndex)
  }, [chassisModel, moduleLibrary, placedModules])

  const hoverPreview = useMemo(() => {
    if (!chassisModel || !hoverSlotId || !draggedModuleKey) {
      return null
    }

    const slot = chassisModel.slots.find((candidate) => candidate.id === hoverSlotId)
    const module = moduleLibrary.find((candidate) => candidate.key === draggedModuleKey)

    if (!slot || !module) {
      return null
    }

    const centerDistance = Math.abs(slot.x - chassisModel.width / 2)

    return {
      label: module.label,
      imageCandidates: module.imageCandidates,
      style: {
        width: `${(module.imageWidth / chassisModel.width) * 100}%`,
        height: `${(module.imageHeight / chassisModel.height) * 100}%`,
        left: `${((slot.x - module.anchor.x) / chassisModel.width) * 100}%`,
        top: `${((slot.y - module.anchor.y) / chassisModel.height) * 100}%`,
        zIndex: 2 + Math.round(centerDistance),
      },
    }
  }, [chassisModel, draggedModuleKey, hoverSlotId, moduleLibrary])

  const selectedChassis =
    CHASSIS_OPTIONS.find((option) => option.key === selectedChassisKey) ?? CHASSIS_OPTIONS[0]

  async function refreshSavedConfigurations() {
    if (!user) {
      setSavedConfigurations([])
      setSavedConfigCount(0)
      return
    }

    setIsLoadingSavedConfigurations(true)
    setSavedConfigsError('')

    const { data, error } = await supabase
      .from('pxi_configurations')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      setSavedConfigurations([])
      setSavedConfigCount(0)
      setSavedConfigsError(error.message)
    } else {
      setSavedConfigurations(data ?? [])
      setSavedConfigCount(data?.length ?? 0)
    }

    setIsLoadingSavedConfigurations(false)
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    setAuthNotice('')

    try {
      if (authMode === 'sign-up') {
        if (passwordRules.some((rule) => !rule.passed)) {
          throw new Error('Password does not meet all required rules.')
        }

        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.')
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          throw error
        }

        setAuthNotice('Account created. Check your email and confirm before signing in.')
        setAuthMode('sign-in')
        setPassword('')
        setConfirmPassword('')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw error
        }

        setAuthNotice('')
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      setAuthError(error.message)
      return
    }

    setUser(null)
    setCurrentScreen('home')
    setPlacedModules({})
    setActiveSlotId(null)
    setHoverSlotId(null)
    setContextSlotId(null)
    setSavedConfigCount(0)
    setSavedConfigurations([])
    setSavedConfigsError('')
    setCurrentConfigurationId(null)
    setConfigurationName('')
    setSaveError('')
    setSaveMessage('')
    setNextPassword('')
    setPasswordError('')
    setPasswordMessage('')
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setPasswordLoading(true)
    setPasswordError('')
    setPasswordMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: nextPassword,
      })

      if (error) {
        throw error
      }

      setPasswordMessage('Password updated successfully.')
      setNextPassword('')
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  async function handleSaveConfiguration() {
    if (!user) {
      return
    }

    const trimmedName = configurationName.trim()

    if (!trimmedName) {
      setSaveError('Please enter a configuration name.')
      setSaveMessage('')
      return
    }

    setSaveLoading(true)
    setSaveError('')
    setSaveMessage('')

    const payload = {
      user_id: user.id,
      name: trimmedName,
      chassis_key: selectedChassisKey,
      placed_modules: placedModules,
      updated_at: new Date().toISOString(),
    }

    let error = null
    let data = null

    if (currentConfigurationId) {
      const response = await supabase
        .from('pxi_configurations')
        .update(payload)
        .eq('id', currentConfigurationId)
        .select()
        .single()

      error = response.error
      data = response.data
    } else {
      const response = await supabase
        .from('pxi_configurations')
        .insert(payload)
        .select()
        .single()

      error = response.error
      data = response.data
    }

    if (error) {
      setSaveError(error.message)
      setSaveMessage('')
    } else {
      setCurrentConfigurationId(data.id)
      setConfigurationName(data.name)
      setSaveMessage(currentConfigurationId ? 'Configuration updated.' : 'Configuration saved.')
      await refreshSavedConfigurations()
    }

    setSaveLoading(false)
  }

  function handleOpenConfiguration(configuration) {
    setCurrentConfigurationId(configuration.id)
    setConfigurationName(configuration.name)
    setSelectedChassisKey(configuration.chassis_key)
    setPlacedModules(configuration.placed_modules ?? {})
    setActiveSlotId(null)
    setHoverSlotId(null)
    setContextSlotId(null)
    setCurrentScreen('builder')
    setSaveError('')
    setSaveMessage('')
  }

  async function handleDeleteConfiguration(configurationId) {
    setDeletingConfigId(configurationId)
    setSavedConfigsError('')

    const { error } = await supabase
      .from('pxi_configurations')
      .delete()
      .eq('id', configurationId)

    if (error) {
      setSavedConfigsError(error.message)
    } else {
      if (currentConfigurationId === configurationId) {
        setCurrentConfigurationId(null)
        setConfigurationName('')
        setSaveMessage('')
      }
      await refreshSavedConfigurations()
    }

    setDeletingConfigId(null)
  }

  function placeModuleAtSlot(slotId, moduleKey) {
    setPlacedModules((current) => ({
      ...current,
      [slotId]: moduleKey,
    }))
    setActiveSlotId(slotId)
    setContextSlotId(null)
  }

  function removeModuleAtSlot(slotId) {
    setPlacedModules((current) => {
      const next = { ...current }
      delete next[slotId]
      return next
    })
    setActiveSlotId((current) => (current === slotId ? null : current))
    setContextSlotId((current) => (current === slotId ? null : current))
  }

  function findNextEmptySlot() {
    if (!chassisModel) {
      return null
    }

    return chassisModel.slots.find((slot) => !placedModules[slot.id]) ?? null
  }

  function handleAddFromSection(section) {
    const availableItems = (section.visibleItems ?? section.items).filter((item) => !item.placeholder)
    const targetItem =
      availableItems.find((item) => item.key === selectedModuleKey) ?? availableItems[0] ?? null
    const nextEmptySlot = findNextEmptySlot()

    if (!targetItem || !nextEmptySlot) {
      return
    }

    setSelectedModuleKey(targetItem.key)
    placeModuleAtSlot(nextEmptySlot.id, targetItem.key)
  }

  function findNearestSlot(clientX, clientY, container) {
    if (!chassisModel) {
      return null
    }

    const rect = container.getBoundingClientRect()
    const dropX = ((clientX - rect.left) / rect.width) * chassisModel.width
    const dropY = ((clientY - rect.top) / rect.height) * chassisModel.height

    return chassisModel.slots.reduce((closest, slot) => {
      const distance = Math.hypot(slot.x - dropX, slot.y - dropY)

      if (!closest || distance < closest.distance) {
        return { slot, distance }
      }

      return closest
    }, null)
  }

  function handleDrop(event) {
    event.preventDefault()

    if (!chassisModel) {
      return
    }

    const moduleKey = event.dataTransfer.getData('text/module-key') || selectedModuleKey
    const sourceSlotId = event.dataTransfer.getData('text/source-slot-id')
    if (!moduleKey) {
      return
    }

    const nearestSlot = findNearestSlot(event.clientX, event.clientY, event.currentTarget)

    if (nearestSlot?.slot) {
      placeModuleAtSlot(nearestSlot.slot.id, moduleKey)
      if (sourceSlotId && Number(sourceSlotId) !== nearestSlot.slot.id) {
        removeModuleAtSlot(Number(sourceSlotId))
      }
    }

    setDraggedModuleKey('')
    setHoverSlotId(null)
    setContextSlotId(null)
  }

  async function handleExportImage() {
    if (!chassisModel) {
      return
    }

    setIsExportingImage(true)

    try {
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(chassisModel.width)
      canvas.height = Math.round(chassisModel.height)
      const context = canvas.getContext('2d')

      if (!context) {
        throw new Error('Canvas unavailable')
      }

      const chassisImage = await loadImageFromCandidates(buildImageCandidates(chassisModel.imageLayer.image))
      context.drawImage(
        chassisImage,
        chassisModel.imageLayer.offsetx ?? 0,
        chassisModel.imageLayer.offsety ?? 0,
        chassisModel.imageLayer.imagewidth,
        chassisModel.imageLayer.imageheight,
      )

      for (const moduleView of placedModuleViews) {
        const slot = chassisModel.slots.find((candidate) => candidate.id === moduleView.slotId)
        const module = moduleLibrary.find((candidate) => candidate.key === moduleView.moduleKey)

        if (!slot || !module) {
          continue
        }

        const moduleImage = await loadImageFromCandidates(module.imageCandidates)
        context.drawImage(
          moduleImage,
          slot.x - module.anchor.x,
          slot.y - module.anchor.y,
          module.imageWidth,
          module.imageHeight,
        )
      }

      const link = document.createElement('a')
      link.download = `${selectedChassis.label}-${new Date().toISOString().slice(0, 10)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed'
      window.alert(`Export failed: ${message}`)
    } finally {
      setIsExportingImage(false)
    }
  }

  function handleLogoMove(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const offsetX = event.clientX - rect.left
    const offsetY = event.clientY - rect.top
    const rotateY = ((offsetX / rect.width) - 0.5) * 14
    const rotateX = (0.5 - (offsetY / rect.height)) * 14

    setLogoTilt({
      x: rotateX,
      y: rotateY,
    })
  }

  if (!authReady) {
    return (
      <main className="page-shell auth-shell">
        <section className="auth-panel auth-panel-loading">
          <div className="auth-card">
            <h2>Loading authentication...</h2>
          </div>
        </section>
      </main>
    )
  }

  if (!user) {
    return (
      <AuthScreen
        logoTilt={logoTilt}
        authQuote={authQuote}
        authMode={authMode}
        email={email}
        password={password}
        confirmPassword={confirmPassword}
        showPassword={showPassword}
        showConfirmPassword={showConfirmPassword}
        passwordRules={passwordRules}
        authError={authError}
        authNotice={authNotice}
        authLoading={authLoading}
        onModeChange={(mode) => {
          setAuthMode(mode)
          setAuthError('')
          setAuthNotice('')
          setPassword('')
          setConfirmPassword('')
          setShowPassword(false)
          setShowConfirmPassword(false)
        }}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onConfirmPasswordChange={setConfirmPassword}
        onTogglePasswordVisibility={() => {
          setShowPassword((current) => !current)
        }}
        onToggleConfirmPasswordVisibility={() => {
          setShowConfirmPassword((current) => !current)
        }}
        onSubmit={handleAuthSubmit}
        onLogoMove={handleLogoMove}
        onLogoLeave={() => {
          setLogoTilt({ x: 0, y: 0 })
        }}
      />
    )
  }

  if (currentScreen === 'user') {
    return (
      <main className="page-shell home-shell">
        <GlobalHeading currentScreen={currentScreen} user={user} onNavigate={setCurrentScreen} onSignOut={handleSignOut} />
        <UserScreen
          user={user}
          savedConfigCount={savedConfigCount}
          isLoadingConfigCount={isLoadingSavedConfigurations}
          nextPassword={nextPassword}
          passwordMessage={passwordMessage}
          passwordError={passwordError}
          passwordLoading={passwordLoading}
          onNextPasswordChange={setNextPassword}
          onPasswordSubmit={handlePasswordSubmit}
          onOpenSaves={() => {
            setCurrentScreen('saves')
          }}
        />
      </main>
    )
  }

  if (currentScreen === 'dashboard') {
    return (
      <main className="page-shell home-shell">
        <GlobalHeading currentScreen={currentScreen} user={user} onNavigate={setCurrentScreen} onSignOut={handleSignOut} />
        <DashboardScreen
          savedConfigCount={savedConfigCount}
          onOpenConfiguration={() => {
            setCurrentScreen('home')
          }}
          onOpenSaves={() => {
            setCurrentScreen('saves')
          }}
        />
      </main>
    )
  }

  if (currentScreen === 'saves') {
    return (
      <main className="page-shell home-shell">
        <GlobalHeading currentScreen={currentScreen} user={user} onNavigate={setCurrentScreen} onSignOut={handleSignOut} />
        <SavesScreen
          savedConfigCount={savedConfigCount}
          savedConfigurations={savedConfigurations}
          savedConfigsError={savedConfigsError}
          isLoadingSavedConfigurations={isLoadingSavedConfigurations}
          deletingConfigId={deletingConfigId}
          onOpenConfiguration={handleOpenConfiguration}
          onDeleteConfiguration={handleDeleteConfiguration}
          onBackToConfiguration={() => {
            setCurrentScreen('home')
          }}
        />
      </main>
    )
  }

  if (currentScreen === 'home') {
    return (
      <main className="page-shell home-shell">
        <GlobalHeading currentScreen={currentScreen} user={user} onNavigate={setCurrentScreen} onSignOut={handleSignOut} />

        <section className="home-hero">
          <div className="home-copy">
            <h1>Choose a chassis and start building.</h1>
            <p className="hero-text">
              Select a PXI chassis, enter the builder, and save your layout to your account.
            </p>
          </div>

          <div className="home-summary">
            <article className="summary-card">
              <strong>{CHASSIS_OPTIONS.filter((item) => item.status === 'available').length}</strong>
              <span>Available chassis</span>
            </article>
            <button
              type="button"
              className="summary-card summary-card-button"
              onClick={() => {
                setCurrentScreen('saves')
              }}
            >
              <strong>{savedConfigCount}</strong>
              <span>Your saves</span>
              <small>Open saved layouts</small>
            </button>
          </div>
        </section>

        <section className="home-grid">
          <article className="home-panel">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">Chassis</p>
                <h2>Choose a chassis</h2>
              </div>
              <label className="home-search">
                <span className="home-search-label">Search</span>
                <input
                  type="search"
                  className="home-search-input"
                  placeholder="Search chassis"
                  value={searchText}
                  onChange={(event) => {
                    setSearchText(event.target.value)
                  }}
                />
              </label>
            </div>

            <div className="chassis-card-grid">
              {filteredChassisOptions.map((option) => {
                const isActive = selectedChassisKey === option.key
                const isAvailable = option.status === 'available'

                return (
                  <button
                    key={option.key}
                    type="button"
                    className={`chassis-option ${isActive ? 'chassis-option-active' : ''} ${
                      isAvailable ? '' : 'chassis-option-placeholder'
                    }`}
                    onClick={() => {
                      setSelectedChassisKey(option.key)
                    }}
                  >
                    <div className="chassis-visual">
                      {option.image ? (
                        <AssetImage
                          candidates={buildImageCandidates(option.image)}
                          alt={option.label}
                          className="chassis-option-image"
                        />
                      ) : (
                        <div className="chassis-placeholder-visual">
                          <span>Image Placeholder</span>
                        </div>
                      )}
                    </div>

                    <div className="chassis-option-top">
                      <strong>{option.label}</strong>
                      <span className={`option-badge ${isAvailable ? 'option-badge-live' : ''}`}>
                        {isAvailable ? 'Ready' : 'Coming'}
                      </span>
                    </div>

                    <p>{option.note}</p>

                    <div className="chassis-option-actions">
                      {isAvailable ? (
                        <button
                          type="button"
                          className="chassis-enter-button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setSelectedChassisKey(option.key)
                            setCurrentConfigurationId(null)
                            setConfigurationName('')
                            setSaveError('')
                            setSaveMessage('')
                            setCurrentScreen('builder')
                          }}
                        >
                          Open Builder
                        </button>
                      ) : (
                        <span className="chassis-waiting-text">Waiting for assets</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {!filteredChassisOptions.length ? (
              <div className="home-empty-state">No matching chassis found.</div>
            ) : null}
          </article>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell builder-shell">
      <GlobalHeading currentScreen={currentScreen} user={user} onNavigate={setCurrentScreen} onSignOut={handleSignOut} />

      <section className="builder-layout">
        <aside className="module-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title-row">
              <button
                type="button"
                className="topbar-home-button sidebar-home-button"
                onClick={() => {
                  setCurrentScreen('home')
                }}
                aria-label="Back to Home"
                title="Back to Home"
              >
                ←
              </button>
              <p className="eyebrow">Module Library</p>
            </div>
            <h1>Select modules and place them into the chassis.</h1>
            <p className="hero-text">
              You can click a module, drag it into the chassis, or use the Add button to place it into the next empty slot.
            </p>
            <div className="builder-nav">
              <span className="builder-nav-label">{selectedChassis.label}</span>
            </div>
          </div>

          <label className="module-search">
            <span className="home-search-label">Search Modules</span>
            <input
              type="search"
              className="home-search-input module-search-input"
              placeholder="Search PXIe modules"
              value={moduleSearchText}
              onChange={(event) => {
                setModuleSearchText(event.target.value)
              }}
            />
          </label>

          <div className="module-list">
            {librarySections.map((section) => (
              <section key={section.key} className="library-section">
                <div
                  className={`library-section-header ${
                    openLibrarySections[section.key] ? 'library-section-toggle-open' : ''
                  }`}
                >
                  <button
                    type="button"
                    className="library-section-toggle"
                    onClick={() => {
                      setOpenLibrarySections((current) => ({
                        ...current,
                        [section.key]: !current[section.key],
                      }))
                    }}
                  >
                    <span className="library-section-title">
                      <span>{section.label}</span>
                      <span className="library-section-count">
                        {section.visibleCount}/{section.realItemCount || 0}
                      </span>
                    </span>
                    <span className="library-section-arrow">
                      {openLibrarySections[section.key] ? '-' : '+'}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="library-section-add"
                    onClick={() => {
                      handleAddFromSection(section)
                    }}
                    disabled={!section.visibleItems.some((item) => !item.placeholder) || !findNextEmptySlot()}
                  >
                    Add
                  </button>
                </div>

                {openLibrarySections[section.key] ? (
                  <div className="library-section-items">
                    {section.visibleItems.length ? section.visibleItems.map((item) => {
                      const isSelected = !item.placeholder && selectedModuleKey === item.key

                      return (
                        <button
                          key={item.key}
                          type="button"
                          className={`library-item ${isSelected ? 'library-item-selected' : ''} ${
                            item.placeholder ? 'library-item-placeholder' : ''
                          }`}
                          draggable={!item.placeholder}
                          onClick={() => {
                            if (!item.placeholder) {
                              setSelectedModuleKey(item.key)
                            }
                          }}
                          onDragStart={(event) => {
                            if (item.placeholder) {
                              event.preventDefault()
                              return
                            }

                            event.dataTransfer.setData('text/module-key', item.key)
                            const dragImage = moduleThumbRefs.current[item.key]
                            if (dragImage) {
                              event.dataTransfer.setDragImage(
                                dragImage,
                                dragImage.width / 2,
                                Math.min(dragImage.height / 3, 40),
                              )
                            }
                            setDraggedModuleKey(item.key)
                            setSelectedModuleKey(item.key)
                          }}
                          onDragEnd={() => {
                            if (!item.placeholder) {
                              setDraggedModuleKey('')
                              setHoverSlotId(null)
                            }
                          }}
                        >
                          <span className="library-item-label">{item.label}</span>
                          <span className="library-item-meta">
                            {item.placeholder ? 'placeholder' : isSelected ? 'selected' : 'available'}
                          </span>

                          {!item.placeholder ? (
                            <AssetImage
                              candidates={item.imageCandidates}
                              alt={item.label}
                              className="module-thumb-image-hidden"
                              imageRef={(node) => {
                                if (node) {
                                  moduleThumbRefs.current[item.key] = node
                                }
                              }}
                            />
                          ) : null}
                        </button>
                      )
                    }) : (
                      <div className="library-empty-state">No matching modules in this section.</div>
                    )}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        </aside>

        <section className="canvas-panel">
          <div className="canvas-header">
            <div>
              <p className="eyebrow">Chassis Canvas</p>
              <h2>{selectedChassis.label} slot preview</h2>
            </div>
            <div className="canvas-badge-group">
              <span className="panel-badge">{chassisModel?.slots.length ?? 0} slots</span>
              <span className="panel-badge subtle-badge">
                {draggedModuleKey ? `dragging ${draggedModuleKey}` : 'drop enabled'}
              </span>
              <button
                type="button"
                className="panel-badge badge-button"
                onClick={handleExportImage}
                disabled={!chassisModel || isExportingImage}
              >
                {isExportingImage ? 'Exporting...' : 'Export PNG'}
              </button>
              <button
                type="button"
                className="panel-badge badge-button"
                onClick={() => {
                  setShowSlotAnchors((current) => !current)
                }}
              >
                {showSlotAnchors ? 'Hide Anchors' : 'Show Anchors'}
              </button>
            </div>
          </div>

          <div className="builder-save-bar">
            <label className="builder-save-field">
              <span>Configuration Name</span>
              <input
                type="text"
                value={configurationName}
                onChange={(event) => {
                  setConfigurationName(event.target.value)
                  setSaveError('')
                  setSaveMessage('')
                }}
                placeholder="Enter a name for this layout"
              />
            </label>

            <button
              type="button"
              className="auth-submit builder-save-button"
              onClick={handleSaveConfiguration}
              disabled={saveLoading}
            >
              {saveLoading ? 'Saving...' : currentConfigurationId ? 'Update Save' : 'Save Configuration'}
            </button>
          </div>

          {saveError ? <div className="auth-message auth-message-error builder-save-message">{saveError}</div> : null}
          {saveMessage ? <div className="auth-message auth-message-success builder-save-message">{saveMessage}</div> : null}

          <div
            className="canvas-dropzone"
            onClick={() => {
              setContextSlotId(null)
            }}
            onDragOver={(event) => {
              event.preventDefault()
              const nearestSlot = findNearestSlot(event.clientX, event.clientY, event.currentTarget)
              setHoverSlotId(nearestSlot?.slot?.id ?? null)
            }}
            onDrop={handleDrop}
            onDragLeave={(event) => {
              if (event.currentTarget === event.target) {
                setHoverSlotId(null)
              }
            }}
          >
            {dataState.loading ? <div className="preview-empty">Loading tmj files...</div> : null}
            {!dataState.loading && dataState.error ? (
              <div className="preview-empty">Failed to load tmj: {dataState.error}</div>
            ) : null}
            {!dataState.loading && !dataState.error && !chassisModel ? (
              <div className="preview-empty">No chassis image layer or slot anchors were found.</div>
            ) : null}

            {chassisModel && previewLayout ? (
              <div
                className="tmj-stage builder-stage"
                style={{ aspectRatio: `${chassisModel.width} / ${chassisModel.height}` }}
              >
                <div className="tmj-canvas">
                  <AssetImage
                    candidates={buildImageCandidates(chassisModel.imageLayer.image)}
                    alt="PXI chassis"
                    className="tmj-image chassis-image"
                    style={previewLayout.chassis}
                  />

                  {placedModuleViews.map((module) => (
                    <div
                      key={`${module.slotId}-${module.moduleKey}`}
                      className="placed-module-hitbox"
                      style={module.style}
                      draggable
                      onClick={(event) => {
                        event.stopPropagation()
                        setActiveSlotId(module.slotId)
                        setContextSlotId(null)
                      }}
                      onContextMenu={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setActiveSlotId(module.slotId)
                        setContextSlotId(module.slotId)
                      }}
                      onDragStart={(event) => {
                        event.dataTransfer.setData('text/module-key', module.moduleKey)
                        event.dataTransfer.setData('text/source-slot-id', String(module.slotId))
                        const dragImage = moduleThumbRefs.current[module.moduleKey]
                        if (dragImage) {
                          event.dataTransfer.setDragImage(
                            dragImage,
                            dragImage.width / 2,
                            Math.min(dragImage.height / 3, 40),
                          )
                        }
                        setDraggedModuleKey(module.moduleKey)
                        setSelectedModuleKey(module.moduleKey)
                        setActiveSlotId(module.slotId)
                      }}
                      onDragEnd={() => {
                        setDraggedModuleKey('')
                        setHoverSlotId(null)
                      }}
                    >
                      <AssetImage
                        candidates={module.imageCandidates}
                        alt={module.label}
                        className="tmj-image placed-module-image"
                        style={{ width: '100%', height: '100%', left: 0, top: 0 }}
                      />
                      {contextSlotId === module.slotId ? (
                        <button
                          type="button"
                          className="module-delete-pop"
                          onClick={(event) => {
                            event.stopPropagation()
                            removeModuleAtSlot(module.slotId)
                          }}
                        >
                          x
                        </button>
                      ) : null}
                    </div>
                  ))}

                  {hoverPreview ? (
                    <AssetImage
                      candidates={hoverPreview.imageCandidates}
                      alt={hoverPreview.label}
                      className="tmj-image placed-module-image snap-preview-image"
                      style={hoverPreview.style}
                    />
                  ) : null}

                  {showSlotAnchors
                    ? previewLayout.slots.map((slot) => {
                        const occupiedBy = placedModules[slot.id]

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            className={`slot-anchor ${occupiedBy ? 'slot-anchor-filled' : ''} ${
                              activeSlotId === slot.id ? 'slot-anchor-active' : ''
                            } ${hoverSlotId === slot.id ? 'slot-anchor-hover' : ''} ${
                              hoverSlotId === slot.id && draggedModuleKey ? 'slot-anchor-magnet' : ''
                            }`}
                            style={{ left: slot.left, top: slot.top }}
                            title={`Slot ${slot.index}${occupiedBy ? `: ${occupiedBy}` : ''}`}
                            onClick={() => {
                              setActiveSlotId(slot.id)
                              if (!occupiedBy && selectedModuleKey) {
                                placeModuleAtSlot(slot.id, selectedModuleKey)
                              }
                            }}
                          >
                            <span>{slot.index}</span>
                          </button>
                        )
                      })
                    : null}
                </div>
              </div>
            ) : null}
          </div>

        </section>
      </section>
    </main>
  )
}

export default App
