import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase, supabaseConfigError } from './lib/supabase'
import './App.css'

const UI_TEXT = {
  en: {
    runtimeError: 'Runtime Error',
    runtimeTitle: 'The deployed app hit a client-side error.',
    runtimeBody: 'This is now shown on screen so the problem is visible instead of ending in a blank page.',
    unknownRuntimeError: 'Unknown runtime error',
    dashboard: 'Dashboard',
    pxiConfiguration: 'PXI Configuration',
    user: 'User',
    signOut: 'Sign Out',
    languageToggle: '中文',
    activeTools: 'Active tools',
    savedLayouts: 'Saved layouts',
    workspace: 'Workspace',
    availableTools: 'Available tools',
    dashboardTitle: 'All tools in one workspace.',
    dashboardBody: 'Start from PXI Configuration, reopen saved layouts, and leave room for the next tools that will be added here.',
    ready: 'Ready',
    yourSaves: 'Your Saves',
    pxiBuilderDesc: 'Select a chassis, enter the builder, and create or edit layouts.',
    savesDesc: 'Open saved chassis layouts, continue editing, or remove old versions.',
    placeholder: 'Placeholder',
    otherTool: 'Other Tool',
    otherToolDesc: 'This space is reserved for the next utility you want to add to the site.',
    futureModule: 'Future Module',
    futureModuleDesc: 'Leave this card empty for a later workflow, report page, or engineering helper.',
    updateLog: 'Update Log',
    recentChanges: 'Recent changes',
    userInterface: 'User Interface',
    accountOverview: 'Account overview for your PXI workspace.',
    accountOverviewBody: 'This page is reserved for your personal account information and later will hold saved configurations, recent exports, and profile-level settings.',
    signedInAccount: 'Signed-in account',
    savedConfigurations: 'Saved configurations',
    openSavedLayouts: 'Open saved layouts',
    profile: 'Profile',
    currentUser: 'Current user',
    email: 'Email',
    userId: 'User ID',
    status: 'Status',
    emailConfirmed: 'Email Confirmed',
    awaitingEmailConfirmation: 'Awaiting Email Confirmation',
    savedLayoutsCount: (count) => `${count} saved layout(s)`,
    settings: 'Settings',
    accountSettings: 'Account settings',
    newPassword: 'New Password',
    enterNewPassword: 'Enter a new password',
    confirmPassword: 'Confirm Password',
    enterNewPasswordAgain: 'Enter the new password again',
    updating: 'Updating...',
    changePassword: 'Change Password',
    yourSavesEyebrow: 'Your Saves',
    savesTitle: 'Open, edit, or remove saved PXI layouts.',
    savesBody: 'Choose a saved chassis configuration, reopen it in the builder, or return to PXI Configuration to create a new one.',
    totalSaves: 'Total saves',
    savedConfigurationsEyebrow: 'Saved Configurations',
    yourSavedChassis: 'Your saved chassis',
    loadingSavedConfigurations: 'Loading saved configurations...',
    noSavedConfigurations: 'No saved configurations yet.',
    updatedAt: (value) => `Updated ${value}`,
    open: 'Open',
    deleting: 'Deleting...',
    delete: 'Delete',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    welcomeBack: 'Welcome back',
    createYourAccount: 'Create your account',
    accessSaved: 'Use your email to access saved PXI configurations.',
    registerWithEmail: 'Register with email and password. Email confirmation is enabled.',
    password: 'Password',
    processing: 'Processing...',
    createAccount: 'Create Account',
    deploymentError: 'Deployment Error',
    deploymentTitle: 'Supabase environment variables are missing.',
    deploymentBody: 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment platform, then redeploy.',
    loadingAuthentication: 'Loading authentication...',
    chooseChassisTitle: 'Choose a chassis and start building.',
    chooseChassisBody: 'Select a PXI chassis, enter the builder, and save your layout to your account.',
    availableChassis: 'Available chassis',
    chassisEyebrow: 'Chassis',
    chooseAChassis: 'Choose a chassis',
    search: 'Search',
    searchChassis: 'Search chassis',
    imagePlaceholder: 'Image Placeholder',
    readyBadge: 'Ready',
    comingBadge: 'Coming',
    openBuilder: 'Open Builder',
    waitingForAssets: 'Waiting for assets',
    noMatchingChassis: 'No matching chassis found.',
    moduleLibrary: 'Module Library',
    builderTitle: 'Select modules and place them into the chassis.',
    builderBody: 'You can click a module, drag it into the chassis, or use the Add button to place it into the next empty slot.',
    searchModules: 'Search Modules',
    category: 'Category',
    browseByCategory: 'Browse by category',
    allCategories: 'All categories',
    categories: (count) => `${count} categories`,
    modulesCount: (count) => `${count} modules`,
    searchPXIeModules: 'Search PXIe modules',
    controller: 'Controller',
    modules: 'Modules',
    other: 'Other',
    add: 'Add',
    placeholderMeta: 'placeholder',
    selectedMeta: 'selected',
    availableMeta: 'available',
    noMatchingModules: 'No matching modules in this section.',
    chassisCanvas: 'Chassis Canvas',
    slotPreview: (label) => `${label} slot preview`,
    slots: (count) => `${count} slots`,
    dropEnabled: 'drop enabled',
    dragging: (key) => `dragging ${key}`,
    exportPng: 'Export PNG',
    fillFillers: 'Fill Empty Slots',
    exporting: 'Exporting...',
    hideAnchors: 'Hide Anchors',
    showAnchors: 'Show Anchors',
    configurationName: 'Configuration Name',
    enterNameForLayout: 'Enter a name for this layout',
    saving: 'Saving...',
    updateSave: 'Update Save',
    saveConfiguration: 'Save Configuration',
  },
  zh: {
    runtimeError: '运行错误',
    runtimeTitle: '部署后的应用出现了客户端错误。',
    runtimeBody: '现在会直接把错误显示在页面上，而不是只剩一片白屏。',
    unknownRuntimeError: '未知运行错误',
    dashboard: '总览',
    pxiConfiguration: 'PXI 配置',
    user: '用户',
    signOut: '退出登录',
    languageToggle: 'EN',
    activeTools: '已启用工具',
    savedLayouts: '已保存布局',
    workspace: '工作区',
    availableTools: '可用工具',
    dashboardTitle: '所有工具集中在一个工作区。',
    dashboardBody: '从 PXI Configuration 开始，继续编辑已保存布局，并为后续工具预留位置。',
    ready: '可用',
    yourSaves: '我的保存',
    pxiBuilderDesc: '选择机箱，进入编辑器，并创建或修改布局。',
    savesDesc: '打开已保存机箱布局，继续编辑，或删除旧版本。',
    placeholder: '占位',
    otherTool: '其他工具',
    otherToolDesc: '这里为你后续要加入的网站工具预留位置。',
    futureModule: '未来模块',
    futureModuleDesc: '这里可以留给后续流程、报表页面或工程辅助工具。',
    updateLog: '更新日志',
    recentChanges: '最近更新',
    userInterface: '用户界面',
    accountOverview: '查看你的 PXI 工作区账户信息。',
    accountOverviewBody: '这里用于展示你的个人账户信息，后续也会放入已保存配置、导出记录和账户设置。',
    signedInAccount: '当前登录账户',
    savedConfigurations: '已保存配置',
    openSavedLayouts: '打开已保存布局',
    profile: '个人资料',
    currentUser: '当前用户',
    email: '邮箱',
    userId: '用户 ID',
    status: '状态',
    emailConfirmed: '邮箱已验证',
    awaitingEmailConfirmation: '等待邮箱验证',
    savedLayoutsCount: (count) => `共保存 ${count} 个布局`,
    settings: '设置',
    accountSettings: '账户设置',
    newPassword: '新密码',
    enterNewPassword: '输入新密码',
    confirmPassword: '确认密码',
    enterNewPasswordAgain: '再次输入新密码',
    updating: '更新中...',
    changePassword: '修改密码',
    yourSavesEyebrow: '我的保存',
    savesTitle: '打开、编辑或删除已保存的 PXI 布局。',
    savesBody: '选择一套已保存机箱配置，重新进入 builder 编辑，或者返回 PXI Configuration 新建布局。',
    totalSaves: '保存总数',
    savedConfigurationsEyebrow: '已保存配置',
    yourSavedChassis: '你保存的机箱',
    loadingSavedConfigurations: '正在加载已保存配置...',
    noSavedConfigurations: '还没有保存任何配置。',
    updatedAt: (value) => `更新于 ${value}`,
    open: '打开',
    deleting: '删除中...',
    delete: '删除',
    signIn: '登录',
    signUp: '注册',
    welcomeBack: '欢迎回来',
    createYourAccount: '创建账户',
    accessSaved: '使用邮箱访问你已保存的 PXI 配置。',
    registerWithEmail: '使用邮箱和密码注册，当前已开启邮箱验证。',
    password: '密码',
    processing: '处理中...',
    createAccount: '创建账户',
    deploymentError: '部署错误',
    deploymentTitle: '缺少 Supabase 环境变量。',
    deploymentBody: '请在部署平台中添加 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY，然后重新部署。',
    loadingAuthentication: '正在加载认证状态...',
    chooseChassisTitle: '选择机箱并开始搭建。',
    chooseChassisBody: '选择 PXI 机箱，进入 builder，并将布局保存到你的账户。',
    availableChassis: '可用机箱',
    chassisEyebrow: '机箱',
    chooseAChassis: '选择机箱',
    search: '搜索',
    searchChassis: '搜索机箱',
    imagePlaceholder: '图片占位',
    readyBadge: '就绪',
    comingBadge: '即将支持',
    openBuilder: '进入 Builder',
    waitingForAssets: '等待素材上传',
    noMatchingChassis: '没有匹配的机箱。',
    moduleLibrary: '模块库',
    builderTitle: '选择模块并放入机箱。',
    builderBody: '你可以点击模块、拖入机箱，或用 Add 按钮自动放到下一个空槽位。',
    searchModules: '搜索模块',
    category: '分类',
    browseByCategory: '按分类浏览',
    allCategories: '全部分类',
    categories: (count) => `${count} 个分类`,
    modulesCount: (count) => `${count} 个模块`,
    searchPXIeModules: '搜索 PXIe 模块',
    controller: '控制器',
    modules: '模块',
    other: '其他',
    add: '添加',
    placeholderMeta: '占位',
    selectedMeta: '已选中',
    availableMeta: '可用',
    noMatchingModules: '这个分类里没有匹配模块。',
    chassisCanvas: '机箱画布',
    slotPreview: (label) => `${label} 槽位预览`,
    slots: (count) => `${count} 个槽位`,
    dropEnabled: '可拖放',
    dragging: (key) => `拖拽中 ${key}`,
    exportPng: '导出 PNG',
    fillFillers: '一键补齐挡板',
    exporting: '导出中...',
    hideAnchors: '隐藏锚点',
    showAnchors: '显示锚点',
    configurationName: '配置名称',
    enterNameForLayout: '输入这个布局的名称',
    saving: '保存中...',
    updateSave: '更新保存',
    saveConfiguration: '保存配置',
  },
}

const DEFAULT_MODULE_SOURCES = [
  { key: 'controller-8862', label: 'PXIe-8862', tmjPath: '/test/8862%20controller.tmj', tone: 'controller' },
  { key: 'module-4135', label: 'PXIe-4135', tmjPath: '/test/4135.tmj', tone: 'module' },
  { key: 'module-1487', label: 'PXIe-1487', tmjPath: '/test/1487.tmj', tone: 'module' },
  { key: 'module-5160', label: 'PXIe-5160', tmjPath: '/test/5160.tmj', tone: 'module' },
]

const FILLER_MODULE_SOURCE = {
  key: 'filler-panel',
  label: 'Filler',
  tone: 'filler',
  category: 'Accessories',
  imagePath: '/module-library/filler.png',
  hiddenInLibrary: true,
}

const ALLOWED_SIGNUP_DOMAINS = ['emerson.com', 'ni.com']

const CHASSIS_SOURCES = [
  {
    key: 'pxie-1071',
    label: 'PXIe-1071',
    status: 'available',
    note: 'Ready with slot anchors and preview image',
    image: 'PXIe-1071.png',
    tmjPath: '/chassis/PXIe-1071.tmj',
  },
  {
    key: 'pxie-1081',
    label: 'PXIe-1081',
    status: 'available',
    note: 'Ready with slot anchors and preview image',
    image: 'PXIe-1081.png',
    tmjPath: '/chassis/PXIe-1081.tmj',
  },
  {
    key: 'pxie-1084',
    label: 'PXIe-1084',
    status: 'available',
    note: 'Ready with slot anchors and preview image',
    image: 'PXIe-1084.png',
    tmjPath: '/chassis/PXIe-1084.tmj',
  },
  {
    key: 'pxie-1086dc',
    label: 'PXIe-1086DC',
    status: 'available',
    note: 'Ready with slot anchors and preview image',
    image: 'PXIe-1086DC.png',
    tmjPath: '/chassis/PXIe-1086DC.tmj',
  },
  {
    key: 'pxie-1088',
    label: 'PXIe-1088',
    status: 'available',
    note: 'Ready with slot anchors and preview image',
    image: 'PXIe-1088.png',
    tmjPath: '/chassis/PXIe-1088.tmj',
  },
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
    key: 'pxie-1071',
    label: 'PXIe-1071',
    status: 'available',
    note: 'Ready with slot anchors and preview image',
    image: 'PXIe-1071.png',
  },
  {
    key: 'pxie-1081',
    label: 'PXIe-1081',
    status: 'available',
    note: 'Ready with slot anchors and preview image',
    image: 'PXIe-1081.png',
  },
  {
    key: 'pxie-1084',
    label: 'PXIe-1084',
    status: 'available',
    note: 'Ready with slot anchors and preview image',
    image: 'PXIe-1084.png',
  },
  {
    key: 'pxie-1086dc',
    label: 'PXIe-1086DC',
    status: 'available',
    note: 'Ready with slot anchors and preview image',
    image: 'PXIe-1086DC.png',
  },
  {
    key: 'pxie-1088',
    label: 'PXIe-1088',
    status: 'available',
    note: 'Ready with slot anchors and preview image',
    image: 'PXIe-1088.png',
  },
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

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <main className="page-shell auth-shell">
          <section className="auth-panel auth-panel-loading">
            <div className="auth-card">
              <p className="eyebrow">Runtime Error</p>
              <h2>{UI_TEXT.en.runtimeTitle}</h2>
              <p className="hero-text">{UI_TEXT.en.runtimeBody}</p>
              <div className="auth-message auth-message-error">
                {this.state.error?.message || 'Unknown runtime error'}
              </div>
            </div>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

function getPasswordRules(password, lang = 'en') {
  return [
    { key: 'length', label: lang === 'zh' ? '至少 8 个字符' : 'At least 8 characters', passed: password.length >= 8 },
    { key: 'upper', label: lang === 'zh' ? '至少 1 个大写字母' : 'At least 1 uppercase letter', passed: /[A-Z]/.test(password) },
    { key: 'lower', label: lang === 'zh' ? '至少 1 个小写字母' : 'At least 1 lowercase letter', passed: /[a-z]/.test(password) },
    { key: 'number', label: lang === 'zh' ? '至少 1 个数字' : 'At least 1 number', passed: /\d/.test(password) },
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

function normalizeSectionKey(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section'
}

function formatModuleLabel(value) {
  return value
    .replace(/\.original/gi, '')
    .replace(/\(\d+\)/g, '')
    .replace(/_/g, ' ')
    .replace(/\b(\d+)ch\b/gi, '$1CH')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildImageCandidates(filename) {
  const file = basename(filename)
  return [
    `/chassis/${encodeURIComponent(file)}`,
    `/test/${encodeURIComponent(file)}`,
    `/地图原素材/${encodeURIComponent(file)}`,
  ]
}

function collapseNearbySlots(points, threshold = 40) {
  if (!points.length) {
    return []
  }

  const clusters = []

  points
    .slice()
    .sort((a, b) => a.x - b.x)
    .forEach((point) => {
      const currentCluster = clusters[clusters.length - 1]

      if (!currentCluster || Math.abs(point.x - currentCluster[currentCluster.length - 1].x) > threshold) {
        clusters.push([point])
        return
      }

      currentCluster.push(point)
    })

  return clusters.map((cluster) => {
    const x = cluster.reduce((sum, point) => sum + point.x, 0) / cluster.length
    const y = cluster.reduce((sum, point) => sum + point.y, 0) / cluster.length
    const primary = cluster[0]

    return {
      ...primary,
      x,
      y,
    }
  })
}

function createSyntheticImageMap(source, width, height) {
  return {
    layers: [
      {
        id: 1,
        name: 'anchors',
        type: 'objectgroup',
        visible: true,
        opacity: 1,
        x: 0,
        y: 0,
        objects: [
          {
            id: 1,
            name: 'anchor_top_right',
            type: 'anchor',
            point: true,
            visible: true,
            x: Math.max(0, width - 1),
            y: 0,
            width: 0,
            height: 0,
            rotation: 0,
          },
        ],
      },
      {
        id: 2,
        name: 'image',
        type: 'imagelayer',
        visible: true,
        opacity: 1,
        x: 0,
        y: 0,
        image: basename(source.imagePath),
        imagewidth: width,
        imageheight: height,
      },
    ],
  }
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

function GlobalHeading({ currentScreen, user, onNavigate, onSignOut, language, onToggleLanguage }) {
  const t = UI_TEXT[language]
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
          {t.dashboard}
        </button>
        <button
          type="button"
          className={`global-nav-item ${currentScreen === 'home' || currentScreen === 'builder' || currentScreen === 'saves' ? 'global-nav-item-active' : ''}`}
          onClick={() => {
            onNavigate('home')
          }}
        >
          {t.pxiConfiguration}
        </button>
        <button
          type="button"
          className={`global-nav-item ${currentScreen === 'feedback' ? 'global-nav-item-active' : ''}`}
          onClick={() => {
            onNavigate('feedback')
          }}
        >
          {language === 'zh' ? '留言板' : 'Feedback'}
        </button>
        <button
          type="button"
          className={`global-nav-item ${currentScreen === 'user' ? 'global-nav-item-active' : ''}`}
          onClick={() => {
            onNavigate('user')
          }}
        >
          {t.user}
        </button>
      </nav>

      {user ? (
        <div className="global-account">
          <button type="button" className="global-language-button" onClick={onToggleLanguage}>
            {t.languageToggle}
          </button>
          <span className="global-account-email">{user.email}</span>
          <button type="button" className="global-signout-button" onClick={onSignOut}>
            {t.signOut}
          </button>
        </div>
      ) : null}
    </header>
  )
}

function DashboardScreen({ savedConfigCount, onOpenConfiguration, onOpenSaves, onOpenFeedback, language }) {
  const t = UI_TEXT[language]
  return (
    <div className="app-screen home-shell">
      <section className="home-hero dashboard-hero">
        <div className="home-copy">
          <p className="eyebrow">{t.dashboard}</p>
          <h1>{t.dashboardTitle}</h1>
          <p className="hero-text">{t.dashboardBody}</p>
        </div>

        <div className="home-summary">
          <article className="summary-card">
            <strong>2</strong>
            <span>{t.activeTools}</span>
          </article>
          <article className="summary-card">
            <strong>{savedConfigCount}</strong>
            <span>{t.savedLayouts}</span>
          </article>
        </div>
      </section>

      <section className="home-grid">
        <article className="home-panel">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">{t.workspace}</p>
              <h2>{t.availableTools}</h2>
            </div>
          </div>

          <div className="dashboard-tool-grid">
            <button type="button" className="dashboard-tool-card dashboard-tool-card-active" onClick={onOpenConfiguration}>
              <span className="dashboard-tool-kicker">{t.ready}</span>
              <strong>{t.pxiConfiguration}</strong>
              <p>{t.pxiBuilderDesc}</p>
            </button>

            <button type="button" className="dashboard-tool-card dashboard-tool-card-active" onClick={onOpenSaves}>
              <span className="dashboard-tool-kicker">{t.ready}</span>
              <strong>{t.yourSaves}</strong>
              <p>{t.savesDesc}</p>
            </button>

            <button type="button" className="dashboard-tool-card dashboard-tool-card-active" onClick={onOpenFeedback}>
              <span className="dashboard-tool-kicker">{language === 'zh' ? '公开' : 'Public'}</span>
              <strong>{language === 'zh' ? '留言板' : 'Feedback Board'}</strong>
              <p>
                {language === 'zh'
                  ? '查看大家已经提交的建议和问题，并为已有反馈点赞。'
                  : 'Read public requests, avoid duplicates, and upvote existing feedback.'}
              </p>
            </button>

            <button
              type="button"
              className="dashboard-tool-card dashboard-tool-card-active"
              onClick={() => {
                onOpenConfiguration('anchor-preview')
              }}
            >
              <span className="dashboard-tool-kicker">{t.ready}</span>
              <strong>{language === 'zh' ? '锚点预览' : 'Anchor Preview'}</strong>
              <p>
                {language === 'zh'
                  ? '在真实网页里查看板卡右上角定位点的效果。'
                  : 'Inspect the top-right anchor marker on a real module image.'}
              </p>
            </button>

            <button
              type="button"
              className="dashboard-tool-card dashboard-tool-card-active"
              onClick={() => {
                onOpenConfiguration('library-check')
              }}
            >
              <span className="dashboard-tool-kicker">{language === 'zh' ? '诊断' : 'Diagnostics'}</span>
              <strong>{language === 'zh' ? '模块库自检' : 'Module Library Check'}</strong>
              <p>
                {language === 'zh'
                  ? '在真实部署环境里逐个检测 manifest、tmj 和图片资源。'
                  : 'Probe the manifest, tmj files, and images inside the real deployed app.'}
              </p>
            </button>

            <article className="dashboard-tool-card dashboard-tool-card-placeholder">
              <span className="dashboard-tool-kicker">{t.placeholder}</span>
              <strong>{t.otherTool}</strong>
              <p>{t.otherToolDesc}</p>
            </article>

            <article className="dashboard-tool-card dashboard-tool-card-placeholder">
              <span className="dashboard-tool-kicker">{t.placeholder}</span>
              <strong>{t.futureModule}</strong>
              <p>{t.futureModuleDesc}</p>
            </article>
          </div>
        </article>

        <article className="home-panel">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">{t.updateLog}</p>
              <h2>{t.recentChanges}</h2>
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

function probeImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    image.src = url
  })
}

function ModuleLibraryCheckScreen({ language, onBack }) {
  const [status, setStatus] = useState({
    loading: true,
    issues: [],
    checked: 0,
    total: 0,
    summary: '',
  })

  useEffect(() => {
    let cancelled = false

    async function runCheck() {
      const issues = []

      try {
        const manifestResponse = await fetch(`/module-library/manifest.json?ts=${Date.now()}`, { cache: 'no-store' })
        if (!manifestResponse.ok) {
          throw new Error('Failed to load manifest.json')
        }

        const manifest = await manifestResponse.json()
        if (!Array.isArray(manifest)) {
          throw new Error('manifest.json is not an array')
        }

        let checked = 0
        for (const entry of manifest) {
          try {
            const tmjResponse = await fetch(`${entry.tmjPath}?ts=${Date.now()}`, { cache: 'no-store' })
            if (!tmjResponse.ok) {
              throw new Error(`TMJ ${tmjResponse.status}`)
            }

            const tmj = await tmjResponse.json()
            const imageLayer = (tmj.layers || []).find((layer) => layer.type === 'imagelayer' && layer.image)
            if (!imageLayer?.image) {
              throw new Error('Missing imagelayer image')
            }

            await probeImage(entry.imagePath)
            const tmjImagePath = `${entry.tmjPath.split('/').slice(0, -1).join('/')}/${encodeURIComponent(imageLayer.image).replace(/%2F/g, '/')}`
            await probeImage(tmjImagePath)
          } catch (error) {
            issues.push({
              label: entry.label,
              category: entry.category,
              message: error instanceof Error ? error.message : 'Unknown error',
              tmjPath: entry.tmjPath,
              imagePath: entry.imagePath,
            })
          }

          checked += 1
          if (!cancelled) {
            setStatus({
              loading: true,
              issues: [...issues],
              checked,
              total: manifest.length,
              summary: '',
            })
          }
        }

        if (!cancelled) {
          setStatus({
            loading: false,
            issues,
            checked: manifest.length,
            total: manifest.length,
            summary: issues.length
              ? `${issues.length} module assets failed the runtime check.`
              : 'All module assets passed the runtime check.',
          })
        }
      } catch (error) {
        if (!cancelled) {
          setStatus({
            loading: false,
            issues: [],
            checked: 0,
            total: 0,
            summary: error instanceof Error ? error.message : 'Module library check failed.',
          })
        }
      }
    }

    runCheck()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="app-screen home-shell">
      <section className="home-hero preview-hero">
        <div className="home-copy">
          <p className="eyebrow">{language === 'zh' ? '线上自检' : 'Runtime Check'}</p>
          <h1>{language === 'zh' ? '逐个检测模块库资源。' : 'Probe the module library one asset at a time.'}</h1>
          <p className="hero-text">
            {language === 'zh'
              ? '这个页面会在当前部署环境里逐个请求 manifest、tmj 和图片，列出真正线上失败的文件。'
              : 'This page requests the manifest, tmj files, and images from the current deployment and lists the assets that actually fail online.'}
          </p>
        </div>

        <div className="home-summary">
          <article className="summary-card">
            <strong>{status.checked}</strong>
            <span>{language === 'zh' ? '已检测模块' : 'Checked modules'}</span>
          </article>
          <article className="summary-card">
            <strong>{status.issues.length}</strong>
            <span>{language === 'zh' ? '失败项' : 'Failures'}</span>
          </article>
          <button type="button" className="summary-card summary-card-button" onClick={onBack}>
            <strong>{language === 'zh' ? '返回' : 'Back'}</strong>
            <small>{language === 'zh' ? '回到 Dashboard' : 'Return to Dashboard'}</small>
          </button>
        </div>
      </section>

      <section className="home-grid preview-grid">
        <article className="home-panel preview-panel">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">{language === 'zh' ? '检测结果' : 'Results'}</p>
              <h2>{language === 'zh' ? '模块库线上状态' : 'Module library runtime status'}</h2>
            </div>
          </div>

          <div className="library-check-summary">
            <strong>{status.loading ? (language === 'zh' ? '检测中...' : 'Checking...') : status.summary}</strong>
            <span>
              {status.total
                ? `${status.checked} / ${status.total}`
                : language === 'zh'
                  ? '等待开始'
                  : 'Waiting to start'}
            </span>
          </div>

          <div className="library-check-list">
            {status.loading && !status.issues.length ? (
              <article className="saved-config-card">
                <strong>{language === 'zh' ? '正在扫描模块...' : 'Scanning modules...'}</strong>
                <span>{language === 'zh' ? '这会逐个请求所有 tmj 和图片资源。' : 'This requests each tmj and image asset one by one.'}</span>
              </article>
            ) : null}

            {!status.loading && !status.issues.length ? (
              <article className="saved-config-card">
                <strong>{language === 'zh' ? '没有发现线上资源错误。' : 'No runtime asset failures were found.'}</strong>
                <span>{language === 'zh' ? 'manifest、tmj 和图片在当前部署环境里都能打开。' : 'The manifest, tmj files, and images are all reachable in this deployment.'}</span>
              </article>
            ) : null}

            {status.issues.map((issue) => (
              <article key={`${issue.category}-${issue.label}`} className="saved-config-card library-check-card">
                <strong>{issue.label}</strong>
                <span>{issue.category}</span>
                <span>{issue.message}</span>
                <span>{issue.tmjPath}</span>
                <span>{issue.imagePath}</span>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

function AnchorPreviewScreen({ language, onBack }) {
  return (
    <div className="app-screen home-shell">
      <section className="home-hero preview-hero">
        <div className="home-copy">
          <p className="eyebrow">{language === 'zh' ? '锚点预览' : 'Anchor Preview'}</p>
          <h1>{language === 'zh' ? '在网页里查看右上角定位点。' : 'View the top-right anchor inside the web app.'}</h1>
          <p className="hero-text">
            {language === 'zh'
              ? '这张样例图已经按高度 843px 统一处理，红点圆心直接压在主体区域最右上角。'
              : 'This sample is normalized to 843px height, and the red marker center sits exactly on the subject top-right corner.'}
          </p>
        </div>

        <div className="home-summary">
          <article className="summary-card">
            <strong>843px</strong>
            <span>{language === 'zh' ? '统一高度' : 'Normalized height'}</span>
          </article>
          <article className="summary-card">
            <strong>TMJ</strong>
            <span>{language === 'zh' ? '已生成定位点文件' : 'Point exported to Tiled map'}</span>
          </article>
          <button type="button" className="summary-card summary-card-button" onClick={onBack}>
            <strong>{language === 'zh' ? '返回' : 'Back'}</strong>
            <small>{language === 'zh' ? '回到 Dashboard' : 'Return to Dashboard'}</small>
          </button>
        </div>
      </section>

      <section className="home-grid preview-grid">
        <article className="home-panel preview-panel">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">{language === 'zh' ? '样例板卡' : 'Sample module'}</p>
              <h2>PXIe-4135</h2>
            </div>
          </div>

          <div className="anchor-preview-stage">
            <img src="/anchor-preview/PXIe-4135.png" alt="PXIe-4135 anchor preview" className="anchor-preview-image" />
          </div>
        </article>

        <article className="home-panel preview-panel">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">{language === 'zh' ? '说明' : 'Notes'}</p>
              <h2>{language === 'zh' ? '当前预览规则' : 'Current preview rule'}</h2>
            </div>
          </div>

          <div className="anchor-preview-notes">
            <article className="saved-config-card">
              <strong>{language === 'zh' ? '定位方式' : 'Anchor logic'}</strong>
              <span>
                {language === 'zh'
                  ? '主体边界框最右上角，点的圆心直接压在该坐标上。'
                  : 'Use the subject bounding box top-right corner, with the dot center placed directly on that point.'}
              </span>
            </article>
            <article className="saved-config-card">
              <strong>{language === 'zh' ? '来源文件' : 'Source files'}</strong>
              <span>/anchor-preview/PXIe-4135.png</span>
            </article>
            <article className="saved-config-card">
              <strong>{language === 'zh' ? 'Tiled 文件' : 'Tiled file'}</strong>
              <span>/anchor-preview/PXIe-4135.tmj</span>
            </article>
          </div>
        </article>
      </section>
    </div>
  )
}

function UserScreen({
  language,
  user,
  savedConfigCount,
  isLoadingConfigCount,
  nextPassword,
  nextConfirmPassword,
  nextPasswordRules,
  showNextPassword,
  showNextConfirmPassword,
  passwordMessage,
  passwordError,
  passwordLoading,
  onNextPasswordChange,
  onNextConfirmPasswordChange,
  onToggleNextPasswordVisibility,
  onToggleNextConfirmPasswordVisibility,
  onPasswordSubmit,
  onOpenSaves,
  onOpenFeedback,
}) {
  const t = UI_TEXT[language]
  return (
    <div className="app-screen home-shell">
      <section className="home-hero user-hero">
        <div className="home-copy">
          <p className="eyebrow">{t.userInterface}</p>
          <h1>{t.accountOverview}</h1>
          <p className="hero-text">{t.accountOverviewBody}</p>
        </div>

        <div className="home-summary">
          <article className="summary-card">
            <strong>{user?.email ?? 'Unknown'}</strong>
            <span>{t.signedInAccount}</span>
          </article>
          <article className="summary-card">
            <strong>{isLoadingConfigCount ? '...' : savedConfigCount}</strong>
            <span>{t.savedConfigurations}</span>
          </article>
          <button type="button" className="summary-card summary-card-button" onClick={onOpenSaves}>
            <strong>{t.yourSaves}</strong>
            <small>{t.openSavedLayouts}</small>
          </button>
          <button type="button" className="summary-card summary-card-button" onClick={onOpenFeedback}>
            <strong>{language === 'zh' ? '留言板' : 'Feedback Board'}</strong>
            <small>{language === 'zh' ? '查看需求与问题反馈' : 'View requests and issue reports'}</small>
          </button>
        </div>
      </section>

      <section className="home-grid">
        <article className="home-panel">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">{t.profile}</p>
              <h2>{t.currentUser}</h2>
            </div>
          </div>

          <div className="user-card-grid">
            <article className="summary-card">
              <strong>{t.email}</strong>
              <span>{user?.email ?? 'Unknown'}</span>
            </article>
            <article className="summary-card">
              <strong>{t.userId}</strong>
              <span className="user-id-text">{user?.id ?? 'Unknown'}</span>
            </article>
            <article className="summary-card">
              <strong>{t.status}</strong>
              <span>{user?.email_confirmed_at ? t.emailConfirmed : t.awaitingEmailConfirmation}</span>
            </article>
            <article className="summary-card">
              <strong>{t.savedConfigurations}</strong>
              <span>{isLoadingConfigCount ? 'Loading...' : t.savedLayoutsCount(savedConfigCount)}</span>
            </article>
          </div>
        </article>

        <article className="home-panel">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">{t.settings}</p>
              <h2>{t.accountSettings}</h2>
            </div>
          </div>

          <form className="user-settings-form" onSubmit={onPasswordSubmit}>
            <label className="auth-field">
              <span>{t.newPassword}</span>
              <div className="auth-password-row">
                <input
                  className="auth-password-input"
                  type={showNextPassword ? 'text' : 'password'}
                  value={nextPassword}
                  onChange={(event) => {
                    onNextPasswordChange(event.target.value)
                  }}
                  minLength={8}
                  placeholder={t.enterNewPassword}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={onToggleNextPasswordVisibility}
                  aria-label={showNextPassword ? 'Hide new password' : 'Show new password'}
                  title={showNextPassword ? 'Hide new password' : 'Show new password'}
                >
                  <img
                    src={showNextPassword ? '/see/no%20see.png' : '/see/see.png'}
                    alt=""
                    className="auth-password-toggle-icon"
                    draggable={false}
                  />
                </button>
              </div>
            </label>

            <div className="auth-password-rules">
              {nextPasswordRules.map((rule) => (
                <div
                  key={rule.key}
                  className={`auth-password-rule ${rule.passed ? 'auth-password-rule-passed' : ''}`}
                >
                  <span>{rule.passed ? '✓' : '•'}</span>
                  <span>{rule.label}</span>
                </div>
              ))}
            </div>

            <label className="auth-field">
              <span>{t.confirmPassword}</span>
              <div className="auth-password-row">
                <input
                  className="auth-password-input"
                  type={showNextConfirmPassword ? 'text' : 'password'}
                  value={nextConfirmPassword}
                  onChange={(event) => {
                    onNextConfirmPasswordChange(event.target.value)
                  }}
                  minLength={8}
                  placeholder={t.enterNewPasswordAgain}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={onToggleNextConfirmPasswordVisibility}
                  aria-label={showNextConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  title={showNextConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  <img
                    src={showNextConfirmPassword ? '/see/no%20see.png' : '/see/see.png'}
                    alt=""
                    className="auth-password-toggle-icon"
                    draggable={false}
                  />
                </button>
              </div>
            </label>

            {passwordError ? <div className="auth-message auth-message-error">{passwordError}</div> : null}
            {passwordMessage ? <div className="auth-message auth-message-success">{passwordMessage}</div> : null}

            <button type="submit" className="auth-submit user-settings-submit" disabled={passwordLoading}>
              {passwordLoading ? t.updating : t.changePassword}
            </button>
          </form>
        </article>
      </section>
    </div>
  )
}

function FeedbackBoardScreen({
  language,
  feedbackItems,
  feedbackLoading,
  feedbackError,
  feedbackSubmitting,
  feedbackEntryType,
  feedbackTitle,
  feedbackMessage,
  feedbackCategory,
  feedbackPage,
  feedbackNotice,
  feedbackSubmitError,
  voteLoadingId,
  commentLoadingId,
  feedbackCommentDrafts,
  feedbackCommentError,
  user,
  onFeedbackEntryTypeChange,
  onFeedbackTitleChange,
  onFeedbackMessageChange,
  onFeedbackCategoryChange,
  onFeedbackPageChange,
  onFeedbackSubmit,
  onToggleVote,
  onFeedbackCommentDraftChange,
  onFeedbackCommentSubmit,
}) {
  const copy =
    language === 'zh'
      ? {
          eyebrow: '?? Ideas',
          title: '???????????????????',
          body: '????????????? ideas ? feedback board????? idea?? bug????????????????',
          total: '????',
          open: '???',
          formEyebrow: '????',
          formTitle: '???? idea ? feedback',
          listEyebrow: '????',
          listTitle: '?? ideas ? feedback',
          entryTypeLabel: '????',
          titleLabel: '??',
          messageLabel: '????',
          categoryLabel: '????????',
          pageLabel: '??',
          titlePlaceholder: '???? builder ???????',
          categoryPlaceholder: '???UI, export, workflow, idea, builder',
          messagePlaceholder: '??????????????????????????',
          submit: '??',
          submitting: '???...',
          noItems: '????????',
          loading: '????...',
          vote: '??',
          unvote: '????',
          status: '??',
          idea: 'Idea',
          bug: 'Bug',
          question: 'Question',
          other: 'Other',
          dashboard: 'Dashboard',
          builder: 'Builder',
          saves: 'Your Saves',
          user: 'User',
          comments: '??',
          addComment: '????',
          commentPlaceholder: '???????????...',
          commenting: '???...',
          postedAt: '????',
        }
      : {
          eyebrow: 'Public Ideas',
          title: 'Read existing ideas first, then share your own.',
          body: 'This board is for public ideas and feedback from every signed-in user. Share ideas, report bugs, and comment on what others have posted.',
          total: 'Total posts',
          open: 'Open items',
          formEyebrow: 'New Post',
          formTitle: 'Share an idea or feedback',
          listEyebrow: 'Public Board',
          listTitle: 'Current ideas and feedback',
          entryTypeLabel: 'Post type',
          titleLabel: 'Title',
          messageLabel: 'Details',
          categoryLabel: 'Category (free text)',
          pageLabel: 'Page',
          titlePlaceholder: 'Example: Add compatibility checks in the builder',
          categoryPlaceholder: 'Example: UI, export, workflow, idea, builder',
          messagePlaceholder: 'Describe the feature you want, the issue you hit, or the workflow you want improved.',
          submit: 'Publish',
          submitting: 'Publishing...',
          noItems: 'No posts have been published yet.',
          loading: 'Loading posts...',
          vote: 'Upvote',
          unvote: 'Remove vote',
          status: 'Status',
          idea: 'Idea',
          bug: 'Bug',
          question: 'Question',
          other: 'Other',
          dashboard: 'Dashboard',
          builder: 'Builder',
          saves: 'Your Saves',
          user: 'User',
          comments: 'Comments',
          addComment: 'Post comment',
          commentPlaceholder: 'Leave your thoughts on this post...',
          commenting: 'Posting...',
          postedAt: 'Posted',
        }

  const openCount = feedbackItems.filter((item) => item.status === 'open').length

  return (
    <div className="app-screen home-shell">
      <section className="home-hero dashboard-hero">
        <div className="home-copy">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="hero-text">{copy.body}</p>
        </div>

        <div className="home-summary">
          <article className="summary-card">
            <strong>{feedbackItems.length}</strong>
            <span>{copy.total}</span>
          </article>
          <article className="summary-card">
            <strong>{openCount}</strong>
            <span>{copy.open}</span>
          </article>
        </div>
      </section>

      <section className="home-grid">
        <article className="home-panel">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">{copy.formEyebrow}</p>
              <h2>{copy.formTitle}</h2>
            </div>
          </div>

          <form className="feedback-form" onSubmit={onFeedbackSubmit}>
            <label className="auth-field">
              <span>{copy.titleLabel}</span>
              <input
                type="text"
                value={feedbackTitle}
                onChange={(event) => onFeedbackTitleChange(event.target.value)}
                placeholder={copy.titlePlaceholder}
                maxLength={120}
                required
              />
            </label>

            <label className="auth-field">
              <span>{copy.messageLabel}</span>
              <textarea
                className="feedback-textarea"
                value={feedbackMessage}
                onChange={(event) => onFeedbackMessageChange(event.target.value)}
                placeholder={copy.messagePlaceholder}
                rows={6}
                required
              />
            </label>

            <div className="feedback-form-grid feedback-form-grid-ideas">
              <label className="auth-field">
                <span>{copy.entryTypeLabel}</span>
                <select value={feedbackEntryType} onChange={(event) => onFeedbackEntryTypeChange(event.target.value)}>
                  <option value="idea">{copy.idea}</option>
                  <option value="bug">{copy.bug}</option>
                  <option value="question">{copy.question}</option>
                  <option value="other">{copy.other}</option>
                </select>
              </label>

              <label className="auth-field">
                <span>{copy.categoryLabel}</span>
                <input
                  type="text"
                  value={feedbackCategory}
                  onChange={(event) => onFeedbackCategoryChange(event.target.value)}
                  placeholder={copy.categoryPlaceholder}
                  maxLength={80}
                />
              </label>

              {feedbackEntryType !== 'idea' ? (
                <label className="auth-field">
                  <span>{copy.pageLabel}</span>
                  <select value={feedbackPage} onChange={(event) => onFeedbackPageChange(event.target.value)}>
                    <option value="dashboard">{copy.dashboard}</option>
                    <option value="builder">{copy.builder}</option>
                    <option value="saves">{copy.saves}</option>
                    <option value="user">{copy.user}</option>
                  </select>
                </label>
              ) : null}
            </div>

            {feedbackSubmitError ? <div className="auth-message auth-message-error">{feedbackSubmitError}</div> : null}
            {feedbackNotice ? <div className="auth-message auth-message-success">{feedbackNotice}</div> : null}

            <button type="submit" className="auth-submit feedback-submit" disabled={feedbackSubmitting || !user}>
              {feedbackSubmitting ? copy.submitting : copy.submit}
            </button>
          </form>
        </article>

        <article className="home-panel">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">{copy.listEyebrow}</p>
              <h2>{copy.listTitle}</h2>
            </div>
          </div>

          {feedbackError ? <div className="auth-message auth-message-error">{feedbackError}</div> : null}

          <div className="feedback-list">
            {feedbackLoading ? (
              <div className="home-empty-state">{copy.loading}</div>
            ) : feedbackItems.length ? (
              feedbackItems.map((item) => (
                <article key={item.id} className="saved-config-card feedback-card">
                  <div className="feedback-card-copy">
                    <strong>{item.title}</strong>
                    <span>{item.message}</span>
                    <div className="feedback-meta-row">
                      <span>{item.entry_type || copy.idea}</span>
                      <span>{item.category || '-'}</span>
                      <span>{copy.status}: {item.status}</span>
                    </div>
                    <div className="feedback-meta-row">
                      {item.page ? <span>{item.page}</span> : null}
                      <span>{copy.postedAt}: {new Date(item.created_at).toLocaleString()}</span>
                    </div>
                    <div className="feedback-comments-block">
                      <strong className="feedback-comments-title">{copy.comments} ({item.comments?.length ?? 0})</strong>
                      <div className="feedback-comments-list">
                        {item.comments?.length ? (
                          item.comments.map((comment) => (
                            <article key={comment.id} className="feedback-comment-item">
                              <span>{comment.message}</span>
                              <small>{new Date(comment.created_at).toLocaleString()}</small>
                            </article>
                          ))
                        ) : (
                          <span className="feedback-comment-empty">-</span>
                        )}
                      </div>
                      <form className="feedback-comment-form" onSubmit={(event) => onFeedbackCommentSubmit(event, item.id)}>
                        <textarea
                          className="feedback-comment-textarea"
                          value={feedbackCommentDrafts[item.id] ?? ''}
                          onChange={(event) => onFeedbackCommentDraftChange(item.id, event.target.value)}
                          placeholder={copy.commentPlaceholder}
                          maxLength={240}
                          rows={3}
                        />
                        <button
                          type="submit"
                          className="summary-link-button feedback-comment-submit"
                          disabled={commentLoadingId === item.id || !user}
                        >
                          {commentLoadingId === item.id ? copy.commenting : copy.addComment}
                        </button>
                      </form>
                      {feedbackCommentError ? <div className="auth-message auth-message-error">{feedbackCommentError}</div> : null}
                    </div>
                  </div>
                  <div className="saved-config-actions">
                    <button
                      type="button"
                      className={`feedback-vote-button ${item.hasVoted ? 'feedback-vote-button-active' : ''}`}
                      disabled={voteLoadingId === item.id || !user}
                      onClick={() => onToggleVote(item)}
                      aria-label={item.hasVoted ? copy.unvote : copy.vote}
                      title={item.hasVoted ? copy.unvote : copy.vote}
                    >
                      <span className="feedback-vote-icon" aria-hidden="true">
                        {voteLoadingId === item.id ? (
                          '...'
                        ) : (
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.5 21a.75.75 0 0 1-.75-.75V12a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 .75.75v8.25a.75.75 0 0 1-.75.75H7.5Z" />
                            <path d="M12 21h5.156a2.25 2.25 0 0 0 2.163-1.627l1.18-4.127A2.25 2.25 0 0 0 18.337 12H15.75a.75.75 0 0 1-.75-.75V8.689c0-1.78-1.922-2.903-3.476-2.03a.75.75 0 0 0-.367.507l-.533 2.667a4.5 4.5 0 0 1-1.23 2.293l-.424.424A.75.75 0 0 0 8.75 13v6.75A1.5 1.5 0 0 0 10.25 21H12Z" />
                          </svg>
                        )}
                      </span>
                      <span className="feedback-vote-count">{item.voteCount}</span>
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="home-empty-state">{copy.noItems}</div>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}

function SavesScreen({
  language,
  savedConfigCount,
  savedConfigurations,
  savedConfigsError,
  isLoadingSavedConfigurations,
  deletingConfigId,
  onOpenConfiguration,
  onDeleteConfiguration,
  onBackToConfiguration,
}) {
  const t = UI_TEXT[language]
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
            />
            <p className="eyebrow">{t.yourSavesEyebrow}</p>
          </div>
          <h1>{t.savesTitle}</h1>
          <p className="hero-text">{t.savesBody}</p>
        </div>

        <div className="home-summary">
          <article className="summary-card">
            <strong>{isLoadingSavedConfigurations ? '...' : savedConfigCount}</strong>
            <span>{t.totalSaves}</span>
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
          />
          <div className="section-title-row">
            <div>
              <button
                type="button"
                className="topbar-home-button saves-back-button"
                onClick={onBackToConfiguration}
                aria-label="Back to PXI Configuration"
                title="Back to PXI Configuration"
              />
              <div>
              <p className="eyebrow">{t.savedConfigurationsEyebrow}</p>
              <h2>{t.yourSavedChassis}</h2>
              </div>
            </div>
          </div>

          {savedConfigsError ? <div className="auth-message auth-message-error">{savedConfigsError}</div> : null}

          <div className="saved-config-list">
            {isLoadingSavedConfigurations ? (
              <div className="home-empty-state">{t.loadingSavedConfigurations}</div>
            ) : savedConfigurations.length ? (
              savedConfigurations.map((configuration) => (
                <article key={configuration.id} className="saved-config-card">
                  <div>
                    <strong>{configuration.name}</strong>
                    <span>{configuration.chassis_key}</span>
                    <span>{t.updatedAt(new Date(configuration.updated_at).toLocaleString())}</span>
                  </div>
                  <div className="saved-config-actions">
                    <button
                      type="button"
                      className="slot-action"
                      onClick={() => {
                        onOpenConfiguration(configuration)
                      }}
                    >
                      {t.open}
                    </button>
                    <button
                      type="button"
                      className="slot-action slot-action-danger"
                      onClick={() => {
                        onDeleteConfiguration(configuration.id)
                      }}
                      disabled={deletingConfigId === configuration.id}
                    >
                      {deletingConfigId === configuration.id ? t.deleting : t.delete}
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="home-empty-state">{t.noSavedConfigurations}</div>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}

function AuthScreen({
  language,
  onToggleLanguage,
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
  const t = UI_TEXT[language]
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
            <div className="auth-topbar">
              <button type="button" className="global-language-button auth-language-button" onClick={onToggleLanguage}>
                {t.languageToggle}
              </button>
            </div>
            <div className="auth-mode-switch">
              <button
                type="button"
                className={`auth-mode-button ${authMode === 'sign-in' ? 'auth-mode-button-active' : ''}`}
                onClick={() => {
                  onModeChange('sign-in')
                }}
              >
                {t.signIn}
              </button>
              <button
                type="button"
                className={`auth-mode-button ${authMode === 'sign-up' ? 'auth-mode-button-active' : ''}`}
                onClick={() => {
                  onModeChange('sign-up')
                }}
              >
                {t.signUp}
              </button>
            </div>
            <h2>{authMode === 'sign-in' ? t.welcomeBack : t.createYourAccount}</h2>
            <p>{authMode === 'sign-in' ? t.accessSaved : t.registerWithEmail}</p>
          </div>

          <form className="auth-form" onSubmit={onSubmit}>
            <label className="auth-field">
              <span>{t.email}</span>
              <input type="email" value={email} onChange={(event) => onEmailChange(event.target.value)} required />
            </label>

            <label className="auth-field">
              <span>{t.password}</span>
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
                <span>{t.confirmPassword}</span>
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
              {authLoading ? t.processing : authMode === 'sign-in' ? t.signIn : t.createAccount}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

function App() {
  const [language, setLanguage] = useState('en')
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
  const [showNextPassword, setShowNextPassword] = useState(false)
  const [showNextConfirmPassword, setShowNextConfirmPassword] = useState(false)
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
  const [nextConfirmPassword, setNextConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [feedbackItems, setFeedbackItems] = useState([])
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')
  const [feedbackEntryType, setFeedbackEntryType] = useState('idea')
  const [feedbackTitle, setFeedbackTitle] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackCategory, setFeedbackCategory] = useState('')
  const [feedbackPage, setFeedbackPage] = useState('builder')
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackSubmitError, setFeedbackSubmitError] = useState('')
  const [feedbackNotice, setFeedbackNotice] = useState('')
  const [voteLoadingId, setVoteLoadingId] = useState(null)
  const [commentLoadingId, setCommentLoadingId] = useState(null)
  const [feedbackCommentDrafts, setFeedbackCommentDrafts] = useState({})
  const [feedbackCommentError, setFeedbackCommentError] = useState('')
  const [currentScreen, setCurrentScreen] = useState('home')
  const [selectedChassisKey, setSelectedChassisKey] = useState('pxie-1095')
  const [searchText, setSearchText] = useState('')
  const [dataState, setDataState] = useState({
    loading: true,
    error: '',
    warning: '',
    chassisMaps: {},
    moduleEntries: [],
  })
  const [draggedModuleKey, setDraggedModuleKey] = useState('')
  const [selectedModuleKey, setSelectedModuleKey] = useState('')
  const [moduleSearchText, setModuleSearchText] = useState('')
  const [selectedSectionKey, setSelectedSectionKey] = useState('')
  const [placedModules, setPlacedModules] = useState({})
  const [activeSlotId, setActiveSlotId] = useState(null)
  const [hoverSlotId, setHoverSlotId] = useState(null)
  const [contextSlotId, setContextSlotId] = useState(null)
  const [showSlotAnchors, setShowSlotAnchors] = useState(true)
  const [isExportingImage, setIsExportingImage] = useState(false)
  const [openLibrarySections, setOpenLibrarySections] = useState({})
  const moduleThumbRefs = useRef({})
  const contextTimerRef = useRef(null)
  const passwordRules = useMemo(() => getPasswordRules(password, language), [password, language])
  const nextPasswordRules = useMemo(() => getPasswordRules(nextPassword, language), [nextPassword, language])
  const t = UI_TEXT[language]

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true)
      return
    }

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
    if (!supabase) {
      setSavedConfigurations([])
      setSavedConfigCount(0)
      setIsLoadingSavedConfigurations(false)
      return
    }

    let cancelled = false

    async function loadMaps() {
      try {
        let moduleSources = [...DEFAULT_MODULE_SOURCES, FILLER_MODULE_SOURCE]

        try {
          const manifestResponse = await fetch('/module-library/manifest.json')
          if (manifestResponse.ok) {
            const manifest = await manifestResponse.json()
            if (Array.isArray(manifest) && manifest.length) {
              moduleSources = [...manifest, FILLER_MODULE_SOURCE]
            }
          }
        } catch {
          moduleSources = [...DEFAULT_MODULE_SOURCES, FILLER_MODULE_SOURCE]
        }

        const chassisResponses = await Promise.all(CHASSIS_SOURCES.map((source) => fetch(source.tmjPath)))
        const moduleResults = await Promise.allSettled(
          moduleSources.map(async (source) => {
            if (source.tmjPath) {
              const response = await fetch(source.tmjPath)
              if (!response.ok) {
                throw new Error(`Failed to load module map: ${source.label}`)
              }

              return {
                source,
                map: await response.json(),
              }
            }

            if (source.imagePath) {
              const dimensions = await new Promise((resolve, reject) => {
                const image = new Image()
                image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
                image.onerror = () => reject(new Error(`Failed to load image: ${source.imagePath}`))
                image.src = source.imagePath
              })

              return {
                source,
                map: createSyntheticImageMap(source, dimensions.width, dimensions.height),
              }
            }

            throw new Error(`Invalid module source: ${source.label}`)
          }),
        )

        const responses = [...chassisResponses]

        if (responses.some((response) => !response.ok)) {
          throw new Error('Failed to load tmj files')
        }

        const loadedMaps = await Promise.all(responses.map((response) => response.json()))
        const chassisMaps = Object.fromEntries(
          CHASSIS_SOURCES.map((source, index) => [source.key, loadedMaps[index]]),
        )

        const moduleEntries = moduleResults
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value)

        const failedModules = moduleResults
          .filter((result) => result.status === 'rejected')
          .map((result) => result.reason?.message)
          .filter(Boolean)

        if (!cancelled) {
          setDataState({
            loading: false,
            error: '',
            warning: failedModules.length ? failedModules[0] : '',
            chassisMaps,
            moduleEntries,
          })
        }
      } catch (error) {
        if (!cancelled) {
          setDataState({
            loading: false,
            error: error instanceof Error ? error.message : 'Load failed',
            warning: '',
            chassisMaps: {},
            moduleEntries: [],
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
    const slots = collapseNearbySlots(points.filter((point) => Math.abs(point.y - yLine) < 30))
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
    return dataState.moduleEntries
      .map(({ source, map }) => {
        const imageLayer = findImageLayer(map)
        const anchor = findObjectPoints(map)[0]

        if (!source || !imageLayer || !anchor) {
          return null
        }

        return {
          key: source.key,
          label: formatModuleLabel(source.label),
          tone: source.tone,
          category: source.category ?? (source.tone === 'controller' ? 'PXI Controller' : 'Modules'),
          hiddenInLibrary: Boolean(source.hiddenInLibrary),
          imageWidth: imageLayer.imagewidth,
          imageHeight: imageLayer.imageheight,
          imageCandidates: source.imagePath ? [source.imagePath] : buildImageCandidates(imageLayer.image),
          anchor,
        }
      })
      .filter(Boolean)
  }, [dataState.moduleEntries])

  const moduleLookup = useMemo(
    () => Object.fromEntries(moduleLibrary.map((module) => [module.key, module])),
    [moduleLibrary],
  )
  const visibleModuleCount = useMemo(
    () => moduleLibrary.filter((module) => !module.hiddenInLibrary).length,
    [moduleLibrary],
  )

  const baseModuleWidth = useMemo(() => {
    const widths = moduleLibrary
      .filter((module) => module.tone === 'module')
      .map((module) => module.imageWidth)
      .sort((a, b) => a - b)

    return widths[0] ?? 1
  }, [moduleLibrary])

  const moduleSpanLookup = useMemo(
    () =>
      Object.fromEntries(
        moduleLibrary.map((module) => [
          module.key,
          module.tone === 'module' ? Math.max(1, Math.round(module.imageWidth / baseModuleWidth)) : 1,
        ]),
      ),
    [baseModuleWidth, moduleLibrary],
  )

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
    const groupedSections = new Map()

    moduleLibrary.forEach((module) => {
      if (module.hiddenInLibrary) {
        return
      }

      const category = module.category || (module.tone === 'controller' ? 'PXI Controller' : 'Modules')
      if (!groupedSections.has(category)) {
        groupedSections.set(category, [])
      }
      groupedSections.get(category).push({ ...module, placeholder: false })
    })

    const sections = [...groupedSections.entries()]
      .sort((a, b) => {
        const aIsController = a[1][0]?.tone === 'controller'
        const bIsController = b[1][0]?.tone === 'controller'
        if (aIsController && !bIsController) {
          return -1
        }
        if (!aIsController && bIsController) {
          return 1
        }
        return a[0].localeCompare(b[0])
      })
      .map(([label, items]) => ({
        key: normalizeSectionKey(label),
        label,
        items: items.sort((a, b) => a.label.localeCompare(b.label)),
      }))

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

  useEffect(() => {
    if (!librarySections.length) {
      setSelectedSectionKey('')
      setOpenLibrarySections({})
      return
    }

    if (normalizedModuleSearch) {
      setOpenLibrarySections((current) => {
        const nextState = Object.fromEntries(
          librarySections.map((section) => [section.key, section.visibleCount > 0]),
        )
        const isSame =
          Object.keys(nextState).length === Object.keys(current).length &&
          Object.entries(nextState).every(([key, value]) => current[key] === value)

        return isSame ? current : nextState
      })
      return
    }

    const hasSelectedSection = librarySections.some((section) => section.key === selectedSectionKey)
    const nextSectionKey = hasSelectedSection ? selectedSectionKey : librarySections[0].key

    if (nextSectionKey !== selectedSectionKey) {
      setSelectedSectionKey(nextSectionKey)
    }

    setOpenLibrarySections((current) => {
      const nextState = Object.fromEntries(librarySections.map((section) => [section.key, section.key === nextSectionKey]))
      const isSame =
        Object.keys(nextState).length === Object.keys(current).length &&
        Object.entries(nextState).every(([key, value]) => current[key] === value)

      return isSame ? current : nextState
    })
  }, [librarySections, normalizedModuleSearch, selectedSectionKey])

  useEffect(() => {
    if (!moduleLibrary.length) {
      setSelectedModuleKey('')
      return
    }

    if (!moduleLibrary.some((item) => item.key === selectedModuleKey)) {
      setSelectedModuleKey(moduleLibrary.find((item) => item.tone === 'controller')?.key ?? moduleLibrary[0].key)
    }
  }, [moduleLibrary, selectedModuleKey])

  const visibleLibrarySections = useMemo(() => {
    if (normalizedModuleSearch) {
      return librarySections.filter((section) => section.visibleCount > 0)
    }

    if (!selectedSectionKey) {
      return librarySections
    }

    return librarySections.filter((section) => section.key === selectedSectionKey)
  }, [librarySections, normalizedModuleSearch, selectedSectionKey])

  const matchingModules = useMemo(
    () =>
      visibleLibrarySections.flatMap((section) =>
        section.visibleItems
          .filter((item) => !item.placeholder)
          .map((item) => ({
            ...item,
            sectionKey: section.key,
            sectionLabel: section.label,
          })),
      ),
    [visibleLibrarySections],
  )

  const firstSlotId = chassisModel?.slots?.[0]?.id ?? null
  const firstSlotModule = firstSlotId ? moduleLookup[placedModules[firstSlotId]] ?? null : null
  const hasLockedController = firstSlotModule?.tone === 'controller'
  const fillerModuleKey = moduleLibrary.find((module) => module.tone === 'filler')?.key ?? ''
  const fillerModule = fillerModuleKey ? moduleLookup[fillerModuleKey] ?? null : null

  const placedModuleList = useMemo(() => {
    if (!chassisModel) {
      return []
    }

    return chassisModel.slots
      .map((slot) => {
        const moduleKey = placedModules[slot.id]
        const module = moduleLookup[moduleKey]
        if (!module) {
          return null
        }

        return {
          slotId: slot.id,
          slotIndex: slot.index,
          label: module.label,
          tone: module.tone,
          span: moduleSpanLookup[moduleKey] ?? 1,
        }
      })
      .filter(Boolean)
  }, [chassisModel, moduleLookup, moduleSpanLookup, placedModules])

  const normalizePlacedModules = useCallback(
    (layout) => {
      if (!chassisModel?.slots?.length) {
        return layout
      }

      const sortedSlots = chassisModel.slots
      const firstSlot = sortedSlots[0]
      const nextLayout = {}
      const slotEntries = sortedSlots
        .map((slot) => ({ slot, moduleKey: layout[slot.id], module: moduleLookup[layout[slot.id]] }))
        .filter((entry) => entry.module)

      const controllerEntry =
        slotEntries.find((entry) => entry.slot.id === firstSlot.id && entry.module.tone === 'controller') ??
        slotEntries.find((entry) => entry.module.tone === 'controller') ??
        null

      if (controllerEntry) {
        nextLayout[firstSlot.id] = controllerEntry.moduleKey
      }

      const moduleKeys = slotEntries
        .filter((entry) => entry.module.tone !== 'controller')
        .sort((a, b) => a.slot.index - b.slot.index)
        .map((entry) => entry.moduleKey)

      let slotPointer = 1
      moduleKeys.forEach((moduleKey) => {
        const span = moduleSpanLookup[moduleKey] ?? 1
        const leadSlot = sortedSlots[slotPointer]

        if (!leadSlot) {
          return
        }

        nextLayout[leadSlot.id] = moduleKey
        slotPointer += span
      })

      return nextLayout
    },
    [chassisModel, moduleLookup, moduleSpanLookup],
  )

  const stripFillerModules = useCallback(
    (layout) =>
      Object.fromEntries(
        Object.entries(layout).filter(([, moduleKey]) => moduleLookup[moduleKey]?.tone !== 'filler'),
      ),
    [moduleLookup],
  )

  useEffect(() => {
    if (!chassisModel || !moduleLibrary.length || !Object.keys(placedModules).length) {
      return
    }

    const normalized = normalizePlacedModules(placedModules)
    const changed =
      Object.keys(normalized).length !== Object.keys(placedModules).length ||
      Object.entries(normalized).some(([slotId, moduleKey]) => placedModules[slotId] !== moduleKey)

    if (changed) {
      setPlacedModules(normalized)
    }
  }, [chassisModel, moduleLibrary, normalizePlacedModules, placedModules])

  const occupiedSlotMap = useMemo(() => {
    if (!chassisModel) {
      return {}
    }

    const occupied = {}

    chassisModel.slots.forEach((slot) => {
      const moduleKey = placedModules[slot.id]
      const span = moduleSpanLookup[moduleKey] ?? 1
      if (!moduleKey) {
        return
      }

      for (let offset = 0; offset < span; offset += 1) {
        const coveredSlot = chassisModel.slots[slot.index - 1 + offset]
        if (coveredSlot) {
          occupied[coveredSlot.id] = {
            moduleKey,
            leadSlotId: slot.id,
            lead: offset === 0,
          }
        }
      }
    })

    return occupied
  }, [chassisModel, moduleSpanLookup, placedModules])

  const emptyModuleSlotCount = useMemo(() => {
    if (!chassisModel || !hasLockedController) {
      return 0
    }

    return chassisModel.slots.slice(1).filter((slot) => !occupiedSlotMap[slot.id]).length
  }, [chassisModel, hasLockedController, occupiedSlotMap])

  const getAnchorSlotForModule = useCallback(
    (leadSlotId, moduleKey) => {
      if (!chassisModel) {
        return null
      }

      const leadSlot = chassisModel.slots.find((candidate) => candidate.id === Number(leadSlotId))
      if (!leadSlot) {
        return null
      }

      const span = moduleSpanLookup[moduleKey] ?? 1
      return chassisModel.slots[leadSlot.index - 1 + (span - 1)] ?? leadSlot
    },
    [chassisModel, moduleSpanLookup],
  )

  function findNextAvailableSlotForModule(moduleKey) {
    if (!chassisModel) {
      return null
    }

    const module = moduleLookup[moduleKey]
    if (!module) {
      return null
    }

    if (module.tone === 'controller') {
      return chassisModel.slots[0] ?? null
    }

    if (!hasLockedController) {
      return null
    }

    const span = moduleSpanLookup[moduleKey] ?? 1
    const candidates = chassisModel.slots.slice(1)

    return (
      candidates.find((slot) => {
        const startIndex = slot.index - 1
        const coveredSlots = chassisModel.slots.slice(startIndex, startIndex + span)
        return coveredSlots.length === span && coveredSlots.every((coveredSlot) => !occupiedSlotMap[coveredSlot.id])
      }) ?? null
    )
  }

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
    const getLayerIndex = (moduleTone, centerDistance) => {
      if (moduleTone === 'filler') {
        return 2
      }

      if (moduleTone === 'controller') {
        return 10 + Math.round(centerDistance)
      }

      return 20 + Math.round(centerDistance)
    }

    return Object.entries(placedModules)
      .map(([slotId, moduleKey]) => {
        const slot = chassisModel.slots.find((candidate) => candidate.id === Number(slotId))
        const anchorSlot = getAnchorSlotForModule(slotId, moduleKey)
        const module = moduleLibrary.find((candidate) => candidate.key === moduleKey)

        if (!slot || !anchorSlot || !module) {
          return null
        }

        const centerDistance = Math.abs(anchorSlot.x - chassisCenterX)

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
            left: `${((anchorSlot.x - module.anchor.x) / chassisModel.width) * 100}%`,
            top: `${((anchorSlot.y - module.anchor.y) / chassisModel.height) * 100}%`,
            zIndex: getLayerIndex(module.tone, centerDistance),
          },
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.style.zIndex - b.style.zIndex)
  }, [chassisModel, getAnchorSlotForModule, moduleLibrary, placedModules])

  const hoverPreview = useMemo(() => {
    if (!chassisModel || !hoverSlotId || !draggedModuleKey) {
      return null
    }

    const slot = chassisModel.slots.find((candidate) => candidate.id === hoverSlotId)
    const anchorSlot = getAnchorSlotForModule(hoverSlotId, draggedModuleKey)
    const module = moduleLibrary.find((candidate) => candidate.key === draggedModuleKey)

    if (!slot || !anchorSlot || !module) {
      return null
    }

    const centerDistance = Math.abs(anchorSlot.x - chassisModel.width / 2)
    const layerIndex =
      module.tone === 'filler'
        ? 2
        : module.tone === 'controller'
          ? 10 + Math.round(centerDistance)
          : 20 + Math.round(centerDistance)

    return {
      label: module.label,
      imageCandidates: module.imageCandidates,
      style: {
        width: `${(module.imageWidth / chassisModel.width) * 100}%`,
        height: `${(module.imageHeight / chassisModel.height) * 100}%`,
        left: `${((anchorSlot.x - module.anchor.x) / chassisModel.width) * 100}%`,
        top: `${((anchorSlot.y - module.anchor.y) / chassisModel.height) * 100}%`,
        zIndex: layerIndex,
      },
    }
  }, [chassisModel, draggedModuleKey, getAnchorSlotForModule, hoverSlotId, moduleLibrary])

  const selectedChassis =
    CHASSIS_OPTIONS.find((option) => option.key === selectedChassisKey) ?? CHASSIS_OPTIONS[0]

  async function refreshSavedConfigurations() {
    if (!supabase || !user) {
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

  const refreshFeedbackItems = useCallback(async () => {
    if (!supabase || !user) {
      setFeedbackItems([])
      setFeedbackError('')
      return
    }

    setFeedbackLoading(true)
    setFeedbackError('')

    const [
      { data: items, error: itemsError },
      { data: votes, error: votesError },
      { data: comments, error: commentsError },
    ] = await Promise.all([
      supabase.from('feedback_items').select('*').order('created_at', { ascending: false }),
      supabase.from('feedback_votes').select('feedback_id,user_id'),
      supabase.from('feedback_comments').select('*').order('created_at', { ascending: true }),
    ])

    if (itemsError || votesError || commentsError) {
      setFeedbackItems([])
      setFeedbackError(itemsError?.message || votesError?.message || commentsError?.message || 'Failed to load feedback')
      setFeedbackLoading(false)
      return
    }

    const voteCountMap = new Map()
    const votedByUser = new Set()
    const commentsByItem = new Map()

    ;(votes ?? []).forEach((vote) => {
      voteCountMap.set(vote.feedback_id, (voteCountMap.get(vote.feedback_id) ?? 0) + 1)
      if (vote.user_id === user.id) {
        votedByUser.add(vote.feedback_id)
      }
    })

    ;(comments ?? []).forEach((comment) => {
      const current = commentsByItem.get(comment.feedback_id) ?? []
      current.push(comment)
      commentsByItem.set(comment.feedback_id, current)
    })

    setFeedbackItems(
      (items ?? []).map((item) => ({
        ...item,
        voteCount: voteCountMap.get(item.id) ?? 0,
        hasVoted: votedByUser.has(item.id),
        comments: commentsByItem.get(item.id) ?? [],
      })),
    )
    setFeedbackLoading(false)
  }, [user])

  useEffect(() => {
    if (!supabase || !user) {
      setFeedbackItems([])
      setFeedbackLoading(false)
      setFeedbackError('')
      return
    }

    refreshFeedbackItems()
  }, [refreshFeedbackItems, user])

  async function handleAuthSubmit(event) {
    event.preventDefault()
    if (!supabase) {
      setAuthError(supabaseConfigError || 'Supabase is not configured.')
      return
    }
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

        const normalizedEmail = email.trim().toLowerCase()
        const emailDomain = normalizedEmail.split('@')[1] ?? ''
        if (!ALLOWED_SIGNUP_DOMAINS.includes(emailDomain)) {
          throw new Error('Only @emerson.com or @ni.com email addresses can sign up.')
        }

        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
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
    if (!supabase) {
      setAuthError(supabaseConfigError || 'Supabase is not configured.')
      return
    }

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
    setNextConfirmPassword('')
    setPasswordError('')
    setPasswordMessage('')
    setFeedbackItems([])
    setFeedbackError('')
    setFeedbackNotice('')
    setFeedbackSubmitError('')
    setFeedbackEntryType('idea')
    setFeedbackTitle('')
    setFeedbackMessage('')
    setFeedbackCategory('')
    setFeedbackCommentDrafts({})
    setFeedbackCommentError('')
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    if (!supabase) {
      setPasswordError(supabaseConfigError || 'Supabase is not configured.')
      return
    }
    setPasswordLoading(true)
    setPasswordError('')
    setPasswordMessage('')

    try {
      if (nextPasswordRules.some((rule) => !rule.passed)) {
        throw new Error('Password does not meet all required rules.')
      }

      if (nextPassword !== nextConfirmPassword) {
        throw new Error('Passwords do not match.')
      }

      const { error } = await supabase.auth.updateUser({
        password: nextPassword,
      })

      if (error) {
        throw error
      }

      setPasswordMessage('Password updated successfully.')
      setNextPassword('')
      setNextConfirmPassword('')
      setShowNextPassword(false)
      setShowNextConfirmPassword(false)
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  async function handleSaveConfiguration() {
    if (!supabase) {
      setSaveError(supabaseConfigError || 'Supabase is not configured.')
      setSaveMessage('')
      return
    }

    if (!user) {
      return
    }

    if (!hasLockedController) {
      setSaveError(
        language === 'zh'
          ? '请先在第 1 槽放入且只放入一个 controller，再保存配置。'
          : 'Place exactly one controller in Slot 1 before saving this configuration.',
      )
      setSaveMessage('')
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
    if (!supabase) {
      setSavedConfigsError(supabaseConfigError || 'Supabase is not configured.')
      return
    }

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

  async function handleFeedbackSubmit(event) {
    event.preventDefault()

    if (!supabase) {
      setFeedbackSubmitError(supabaseConfigError || 'Supabase is not configured.')
      return
    }

    if (!user) {
      return
    }

    const trimmedTitle = feedbackTitle.trim()
    const trimmedMessage = feedbackMessage.trim()

    if (!trimmedTitle || !trimmedMessage) {
      setFeedbackSubmitError('Please enter both a title and a message.')
      return
    }

    setFeedbackSubmitting(true)
    setFeedbackSubmitError('')
    setFeedbackNotice('')

    const { error } = await supabase.from('feedback_items').insert({
      user_id: user.id,
      user_email: user.email,
      entry_type: feedbackEntryType,
      title: trimmedTitle,
      message: trimmedMessage,
      category: feedbackCategory.trim(),
      page: feedbackEntryType === 'idea' ? null : feedbackPage,
      status: 'open',
    })

    if (error) {
      setFeedbackSubmitError(error.message)
    } else {
      setFeedbackEntryType('idea')
      setFeedbackTitle('')
      setFeedbackMessage('')
      setFeedbackCategory('')
      setFeedbackNotice(language === 'zh' ? '??????' : 'Post published.')
      await refreshFeedbackItems()
    }

    setFeedbackSubmitting(false)
  }

  function handleFeedbackCommentDraftChange(feedbackId, value) {
    setFeedbackCommentDrafts((current) => ({
      ...current,
      [feedbackId]: value,
    }))
  }

  async function handleFeedbackCommentSubmit(event, feedbackId) {
    event.preventDefault()

    if (!supabase) {
      setFeedbackCommentError(supabaseConfigError || 'Supabase is not configured.')
      return
    }

    if (!user) {
      return
    }

    const message = (feedbackCommentDrafts[feedbackId] ?? '').trim()

    if (!message) {
      setFeedbackCommentError(language === 'zh' ? '????????' : 'Please enter a comment.')
      return
    }

    setCommentLoadingId(feedbackId)
    setFeedbackCommentError('')

    const { error } = await supabase.from('feedback_comments').insert({
      feedback_id: feedbackId,
      user_id: user.id,
      user_email: user.email,
      message,
    })

    if (error) {
      setFeedbackCommentError(error.message)
    } else {
      setFeedbackCommentDrafts((current) => ({
        ...current,
        [feedbackId]: '',
      }))
      await refreshFeedbackItems()
    }

    setCommentLoadingId(null)
  }

  async function handleToggleFeedbackVote(item) {
    if (!supabase || !user) {
      return
    }

    setVoteLoadingId(item.id)
    setFeedbackError('')

    let error = null
    if (item.hasVoted) {
      const response = await supabase
        .from('feedback_votes')
        .delete()
        .eq('feedback_id', item.id)
        .eq('user_id', user.id)
      error = response.error
    } else {
      const response = await supabase.from('feedback_votes').insert({
        feedback_id: item.id,
        user_id: user.id,
      })
      error = response.error
    }

    if (error) {
      setFeedbackError(error.message)
    } else {
      await refreshFeedbackItems()
    }

    setVoteLoadingId(null)
  }

  function placeModuleAtSlot(slotId, moduleKey) {
    const module = moduleLookup[moduleKey]
    const firstSlot = chassisModel?.slots?.[0]

    if (!module || !firstSlot) {
      return
    }

    setPlacedModules((current) => {
      const baseLayout = module.tone === 'filler' ? current : stripFillerModules(current)

      if (module.tone === 'controller') {
        return normalizePlacedModules({
          ...baseLayout,
          [firstSlot.id]: moduleKey,
        })
      }

      if (!hasLockedController || slotId === firstSlot.id) {
        return baseLayout
      }

      return normalizePlacedModules({
        ...baseLayout,
        [slotId]: moduleKey,
      })
    })
    setActiveSlotId(module.tone === 'controller' ? firstSlot.id : slotId)
    setContextSlotId(null)
  }

  function removeModuleAtSlot(slotId) {
    setPlacedModules((current) => {
      const next = { ...current }
      delete next[slotId]
      return normalizePlacedModules(next)
    })
    setActiveSlotId((current) => (current === slotId ? null : current))
    setContextSlotId((current) => (current === slotId ? null : current))
  }

  function getAddTargetForSection(section) {
    const availableItems = (section.visibleItems ?? section.items).filter((item) => !item.placeholder)
    const targetItem =
      availableItems.find((item) => item.key === selectedModuleKey) ?? availableItems[0] ?? null

    if (!targetItem) {
      return { item: null, slot: null }
    }

    if (targetItem.tone !== 'controller' && !hasLockedController) {
      return { item: targetItem, slot: null }
    }

    return {
      item: targetItem,
      slot: findNextAvailableSlotForModule(targetItem.key),
    }
  }

  function handleAddFromSection(section) {
    const { item: targetItem, slot: nextEmptySlot } = getAddTargetForSection(section)

    if (!targetItem || !nextEmptySlot) {
      return
    }

    if (targetItem.tone !== 'controller' && !hasLockedController) {
      return
    }

    setSelectedModuleKey(targetItem.key)
    placeModuleAtSlot(nextEmptySlot.id, targetItem.key)
  }

  function handleAddModule(moduleKey) {
    const module = moduleLookup[moduleKey]
    const targetSlot = findNextAvailableSlotForModule(moduleKey)

    if (!module || !targetSlot) {
      return
    }

    if (module.tone !== 'controller' && !hasLockedController) {
      return
    }

    setSelectedModuleKey(moduleKey)
    placeModuleAtSlot(targetSlot.id, moduleKey)
  }

  function handleFillAllFillers() {
    if (!chassisModel || !fillerModule || !hasLockedController) {
      return
    }

    setPlacedModules((current) => {
      const baseLayout = normalizePlacedModules(stripFillerModules(current))
      const next = { ...baseLayout }
      const occupied = new Set()

      chassisModel.slots.forEach((slot) => {
        const moduleKey = next[slot.id]
        if (!moduleKey) {
          return
        }

        const span = moduleSpanLookup[moduleKey] ?? 1
        for (let offset = 0; offset < span; offset += 1) {
          const coveredSlot = chassisModel.slots[slot.index - 1 + offset]
          if (coveredSlot) {
            occupied.add(coveredSlot.id)
          }
        }
      })

      chassisModel.slots.slice(1).forEach((slot) => {
        if (!occupied.has(slot.id)) {
          next[slot.id] = fillerModule.key
          occupied.add(slot.id)
        }
      })

      return next
    })
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
    const module = moduleLookup[moduleKey]
    if (!moduleKey || !module) {
      return
    }

    const nearestSlot = findNearestSlot(event.clientX, event.clientY, event.currentTarget)

    if (nearestSlot?.slot) {
      const targetSlotId =
        module.tone === 'controller' ? firstSlotId : findNextAvailableSlotForModule(moduleKey)?.id ?? null

      if ((module.tone !== 'controller' && !hasLockedController) || targetSlotId == null) {
        setDraggedModuleKey('')
        setHoverSlotId(null)
        setContextSlotId(null)
        return
      }

      if (sourceSlotId) {
        setPlacedModules((current) => {
          const next = { ...current }
          delete next[Number(sourceSlotId)]
          next[targetSlotId] = moduleKey
          return normalizePlacedModules(next)
        })
        setActiveSlotId(targetSlotId)
      } else {
        placeModuleAtSlot(targetSlotId, moduleKey)
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
        const anchorSlot = getAnchorSlotForModule(moduleView.slotId, moduleView.moduleKey)
        const module = moduleLibrary.find((candidate) => candidate.key === moduleView.moduleKey)

        if (!slot || !anchorSlot || !module) {
          continue
        }

        const moduleImage = await loadImageFromCandidates(module.imageCandidates)
        context.drawImage(
          moduleImage,
          anchorSlot.x - module.anchor.x,
          anchorSlot.y - module.anchor.y,
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

  if (supabaseConfigError) {
    return (
      <main className="page-shell auth-shell">
        <section className="auth-panel auth-panel-loading">
          <div className="auth-card">
            <p className="eyebrow">{t.deploymentError}</p>
            <h2>{t.deploymentTitle}</h2>
            <p className="hero-text">
              {t.deploymentBody}
            </p>
            <div className="auth-message auth-message-error">{supabaseConfigError}</div>
          </div>
        </section>
      </main>
    )
  }

  if (!authReady) {
    return (
      <main className="page-shell auth-shell">
        <section className="auth-panel auth-panel-loading">
          <div className="auth-card">
            <h2>{t.loadingAuthentication}</h2>
          </div>
        </section>
      </main>
    )
  }

  if (!user) {
    return (
      <AuthScreen
        language={language}
        onToggleLanguage={() => {
          setLanguage((current) => (current === 'en' ? 'zh' : 'en'))
        }}
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
        <GlobalHeading
          currentScreen={currentScreen}
          user={user}
          onNavigate={setCurrentScreen}
          onSignOut={handleSignOut}
          language={language}
          onToggleLanguage={() => {
            setLanguage((current) => (current === 'en' ? 'zh' : 'en'))
          }}
        />
        <UserScreen
          language={language}
          user={user}
          savedConfigCount={savedConfigCount}
          isLoadingConfigCount={isLoadingSavedConfigurations}
          nextPassword={nextPassword}
          nextConfirmPassword={nextConfirmPassword}
          nextPasswordRules={nextPasswordRules}
          showNextPassword={showNextPassword}
          showNextConfirmPassword={showNextConfirmPassword}
          passwordMessage={passwordMessage}
          passwordError={passwordError}
          passwordLoading={passwordLoading}
          onNextPasswordChange={setNextPassword}
          onNextConfirmPasswordChange={setNextConfirmPassword}
          onToggleNextPasswordVisibility={() => {
            setShowNextPassword((current) => !current)
          }}
          onToggleNextConfirmPasswordVisibility={() => {
            setShowNextConfirmPassword((current) => !current)
          }}
          onPasswordSubmit={handlePasswordSubmit}
          onOpenSaves={() => {
            setCurrentScreen('saves')
          }}
          onOpenFeedback={() => {
            setCurrentScreen('feedback')
          }}
        />
      </main>
    )
  }

  if (currentScreen === 'dashboard') {
    return (
      <main className="page-shell home-shell">
        <GlobalHeading
          currentScreen={currentScreen}
          user={user}
          onNavigate={setCurrentScreen}
          onSignOut={handleSignOut}
          language={language}
          onToggleLanguage={() => {
            setLanguage((current) => (current === 'en' ? 'zh' : 'en'))
          }}
        />
        <DashboardScreen
          language={language}
          savedConfigCount={savedConfigCount}
          onOpenConfiguration={(targetScreen = 'home') => {
            setCurrentScreen(targetScreen)
          }}
          onOpenSaves={() => {
            setCurrentScreen('saves')
          }}
          onOpenFeedback={() => {
            setCurrentScreen('feedback')
          }}
        />
      </main>
    )
  }

  if (currentScreen === 'anchor-preview') {
    return (
      <main className="page-shell home-shell">
        <GlobalHeading
          currentScreen="dashboard"
          user={user}
          onNavigate={setCurrentScreen}
          onSignOut={handleSignOut}
          language={language}
          onToggleLanguage={() => {
            setLanguage((current) => (current === 'en' ? 'zh' : 'en'))
          }}
        />
        <AnchorPreviewScreen
          language={language}
          onBack={() => {
            setCurrentScreen('dashboard')
          }}
        />
      </main>
    )
  }

  if (currentScreen === 'library-check') {
    return (
      <main className="page-shell home-shell">
        <GlobalHeading
          currentScreen="dashboard"
          user={user}
          onNavigate={setCurrentScreen}
          onSignOut={handleSignOut}
          language={language}
          onToggleLanguage={() => {
            setLanguage((current) => (current === 'en' ? 'zh' : 'en'))
          }}
        />
        <ModuleLibraryCheckScreen
          language={language}
          onBack={() => {
            setCurrentScreen('dashboard')
          }}
        />
      </main>
    )
  }

  if (currentScreen === 'saves') {
    return (
      <main className="page-shell home-shell">
        <GlobalHeading
          currentScreen={currentScreen}
          user={user}
          onNavigate={setCurrentScreen}
          onSignOut={handleSignOut}
          language={language}
          onToggleLanguage={() => {
            setLanguage((current) => (current === 'en' ? 'zh' : 'en'))
          }}
        />
        <SavesScreen
          language={language}
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

  if (currentScreen === 'feedback') {
    return (
      <main className="page-shell home-shell">
        <GlobalHeading
          currentScreen="dashboard"
          user={user}
          onNavigate={setCurrentScreen}
          onSignOut={handleSignOut}
          language={language}
          onToggleLanguage={() => {
            setLanguage((current) => (current === 'en' ? 'zh' : 'en'))
          }}
        />
        <FeedbackBoardScreen
          language={language}
          feedbackItems={feedbackItems}
          feedbackLoading={feedbackLoading}
          feedbackError={feedbackError}
          feedbackSubmitting={feedbackSubmitting}
          feedbackEntryType={feedbackEntryType}
          feedbackTitle={feedbackTitle}
          feedbackMessage={feedbackMessage}
          feedbackCategory={feedbackCategory}
          feedbackPage={feedbackPage}
          feedbackNotice={feedbackNotice}
          feedbackSubmitError={feedbackSubmitError}
          voteLoadingId={voteLoadingId}
          commentLoadingId={commentLoadingId}
          feedbackCommentDrafts={feedbackCommentDrafts}
          feedbackCommentError={feedbackCommentError}
          user={user}
          onFeedbackEntryTypeChange={setFeedbackEntryType}
          onFeedbackTitleChange={setFeedbackTitle}
          onFeedbackMessageChange={setFeedbackMessage}
          onFeedbackCategoryChange={setFeedbackCategory}
          onFeedbackPageChange={setFeedbackPage}
          onFeedbackSubmit={handleFeedbackSubmit}
          onToggleVote={handleToggleFeedbackVote}
          onFeedbackCommentDraftChange={handleFeedbackCommentDraftChange}
          onFeedbackCommentSubmit={handleFeedbackCommentSubmit}
        />
      </main>
    )
  }

  if (currentScreen === 'home') {
    return (
      <main className="page-shell home-shell">
        <GlobalHeading
          currentScreen={currentScreen}
          user={user}
          onNavigate={setCurrentScreen}
          onSignOut={handleSignOut}
          language={language}
          onToggleLanguage={() => {
            setLanguage((current) => (current === 'en' ? 'zh' : 'en'))
          }}
        />

        <section className="home-hero">
          <div className="home-copy">
            <h1>{t.chooseChassisTitle}</h1>
            <p className="hero-text">{t.chooseChassisBody}</p>
          </div>

          <div className="home-summary">
            <article className="summary-card">
              <strong>{CHASSIS_OPTIONS.filter((item) => item.status === 'available').length}</strong>
              <span>{t.availableChassis}</span>
            </article>
            <button
              type="button"
              className="summary-card summary-card-button"
              onClick={() => {
                setCurrentScreen('saves')
              }}
            >
              <strong>{savedConfigCount}</strong>
              <span>{t.yourSaves}</span>
              <small>{t.openSavedLayouts}</small>
            </button>
          </div>
        </section>

        <section className="home-grid">
          <article className="home-panel">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">{t.chassisEyebrow}</p>
                <h2>{t.chooseAChassis}</h2>
              </div>
              <label className="home-search">
                <span className="home-search-label">{t.search}</span>
                <input
                  type="search"
                  className="home-search-input"
                  placeholder={t.searchChassis}
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
                          <span>{t.imagePlaceholder}</span>
                        </div>
                      )}
                    </div>

                    <div className="chassis-option-top">
                      <strong>{option.label}</strong>
                      <span className={`option-badge ${isAvailable ? 'option-badge-live' : ''}`}>
                        {isAvailable ? t.readyBadge : t.comingBadge}
                      </span>
                    </div>
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
                          {t.openBuilder}
                        </button>
                      ) : (
                        <span className="chassis-waiting-text">{t.waitingForAssets}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {!filteredChassisOptions.length ? (
              <div className="home-empty-state">{t.noMatchingChassis}</div>
            ) : null}
          </article>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell builder-shell">
      <GlobalHeading
        currentScreen={currentScreen}
        user={user}
        onNavigate={setCurrentScreen}
        onSignOut={handleSignOut}
        language={language}
        onToggleLanguage={() => {
          setLanguage((current) => (current === 'en' ? 'zh' : 'en'))
        }}
      />

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
              />
              <p className="eyebrow">{t.moduleLibrary}</p>
            </div>
            <h1>{t.builderTitle}</h1>
            <p className="hero-text">{t.builderBody}</p>
            <div className="builder-nav">
              <span className="builder-nav-label">{selectedChassis.label}</span>
            </div>
          </div>

          <label className="module-search">
            <span className="home-search-label">{t.searchModules}</span>
            <input
              type="search"
              className="home-search-input module-search-input"
              placeholder={t.searchPXIeModules}
              value={moduleSearchText}
              onChange={(event) => {
                setModuleSearchText(event.target.value)
              }}
            />
          </label>

          <div className="module-library-toolbar">
            <label className="module-category-select">
              <span className="home-search-label">{t.category}</span>
              <select
                className="home-search-input module-category-input"
                value={selectedSectionKey}
                onChange={(event) => {
                  const nextKey = event.target.value
                  setSelectedSectionKey(nextKey)
                  setOpenLibrarySections(
                    Object.fromEntries(librarySections.map((section) => [section.key, section.key === nextKey])),
                  )
                }}
              >
                {librarySections.map((section) => (
                  <option key={section.key} value={section.key}>
                    {section.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="module-library-stats">
              <span>{t.categories(librarySections.length)}</span>
              <span>{t.modulesCount(visibleModuleCount)}</span>
            </div>
          </div>

          {!hasLockedController ? (
            <div className="builder-rule-banner">
              {language === 'zh'
                ? '请先在第 1 槽放入且只放入一个 controller，之后才能继续添加其它板卡。'
                : 'Place exactly one controller in Slot 1 before adding any other modules.'}
            </div>
          ) : null}

          <div className="module-list">
            {normalizedModuleSearch ? (
              <section className="library-section library-search-results">
                <div className="library-section-header library-search-results-header">
                  <div className="library-search-summary">
                    <strong>{language === 'zh' ? '搜索结果' : 'Search results'}</strong>
                    <span>
                      {language === 'zh'
                        ? `共匹配 ${matchingModules.length} 个模块`
                        : `${matchingModules.length} matching module(s)`}
                    </span>
                  </div>
                </div>

                <div className="library-section-items library-search-items">
                  {matchingModules.length ? matchingModules.map((item) => {
                    const isSelected = selectedModuleKey === item.key
                    const isLocked = !hasLockedController && item.tone !== 'controller'
                    const addTargetSlot = findNextAvailableSlotForModule(item.key)

                    return (
                      <div
                        key={`${item.sectionKey}-${item.key}`}
                        className={`library-search-row ${isSelected ? 'library-search-row-selected' : ''}`}
                      >
                        <button
                          type="button"
                          className="library-item library-item-search"
                          draggable={!isLocked}
                          onClick={() => {
                            if (!isLocked) {
                              setSelectedModuleKey(item.key)
                            }
                          }}
                          onDragStart={(event) => {
                            if (isLocked) {
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
                            setDraggedModuleKey('')
                            setHoverSlotId(null)
                          }}
                        >
                          <span className="library-search-copy">
                            <strong className="library-item-label" title={item.label}>{item.label}</strong>
                            <span className="library-item-subtitle" title={item.sectionLabel}>{item.sectionLabel}</span>
                          </span>
                          <span className="library-item-meta">
                            {isLocked
                              ? language === 'zh'
                                ? '锁定'
                                : 'locked'
                              : isSelected
                                ? t.selectedMeta
                                : t.availableMeta}
                          </span>

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
                        </button>

                        <button
                          type="button"
                          className="library-section-add"
                          disabled={!addTargetSlot || isLocked}
                          onClick={() => {
                            handleAddModule(item.key)
                          }}
                        >
                          {t.add}
                        </button>
                      </div>
                    )
                  }) : (
                    <div className="library-empty-state">{t.noMatchingModules}</div>
                  )}
                </div>
              </section>
            ) : visibleLibrarySections.map((section) => (
              <section key={section.key} className="library-section">
                {(() => {
                  const { item: sectionTargetItem, slot: sectionTargetSlot } = getAddTargetForSection(section)

                  return (
                <div
                  className={`library-section-header ${
                    openLibrarySections[section.key] ? 'library-section-toggle-open' : ''
                  }`}
                >
                  <button
                    type="button"
                    className="library-section-toggle"
                    onClick={() => {
                      const nextOpen = !openLibrarySections[section.key]
                      setOpenLibrarySections(
                        Object.fromEntries(librarySections.map((item) => [item.key, item.key === section.key ? nextOpen : false])),
                      )
                    }}
                  >
                    <span className="library-section-title">
                      <span className="library-section-name" title={section.label}>{section.label}</span>
                      <span className="library-section-count">
                        {section.visibleCount}/{section.realItemCount || 0}
                      </span>
                    </span>
                        <span className="library-section-arrow">›</span>
                  </button>
                  <button
                    type="button"
                    className="library-section-add"
                    onClick={() => {
                      handleAddFromSection(section)
                    }}
                    disabled={!sectionTargetItem || !sectionTargetSlot}
                  >
                    {t.add}
                  </button>
                </div>
                  )
                })()}

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
                            if (!item.placeholder && (hasLockedController || item.tone === 'controller')) {
                              setSelectedModuleKey(item.key)
                            }
                          }}
                          onDragStart={(event) => {
                            if (item.placeholder || (!hasLockedController && item.tone !== 'controller')) {
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
                          <span className="library-item-label" title={item.label}>{item.label}</span>
                          <span className="library-item-meta">
                            {item.placeholder
                              ? t.placeholderMeta
                              : !hasLockedController && item.tone !== 'controller'
                                ? language === 'zh'
                                  ? '锁定'
                                  : 'locked'
                                : isSelected
                                  ? t.selectedMeta
                                  : t.availableMeta}
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
                      <div className="library-empty-state">{t.noMatchingModules}</div>
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
              <p className="eyebrow">{t.chassisCanvas}</p>
              <h2>{t.slotPreview(selectedChassis.label)}</h2>
            </div>
            <div className="canvas-badge-group">
              <span className="panel-badge">{t.slots(chassisModel?.slots.length ?? 0)}</span>
              <span className="panel-badge subtle-badge">
                {draggedModuleKey ? t.dragging(draggedModuleKey) : t.dropEnabled}
              </span>
              <button
                type="button"
                className="panel-badge badge-button"
                onClick={handleFillAllFillers}
                disabled={!fillerModule || !hasLockedController || emptyModuleSlotCount === 0}
              >
                {t.fillFillers}
              </button>
              <button
                type="button"
                className="panel-badge badge-button"
                onClick={handleExportImage}
                disabled={!chassisModel || isExportingImage}
              >
                {isExportingImage ? t.exporting : t.exportPng}
              </button>
              <button
                type="button"
                className="panel-badge badge-button"
                onClick={() => {
                  setShowSlotAnchors((current) => !current)
                }}
              >
                {showSlotAnchors ? t.hideAnchors : t.showAnchors}
              </button>
            </div>
          </div>

          <div className="builder-save-bar">
            <label className="builder-save-field">
              <span>{t.configurationName}</span>
              <input
                type="text"
                value={configurationName}
                onChange={(event) => {
                  setConfigurationName(event.target.value)
                  setSaveError('')
                  setSaveMessage('')
                }}
                placeholder={t.enterNameForLayout}
              />
            </label>

            <button
              type="button"
              className="auth-submit builder-save-button"
              onClick={handleSaveConfiguration}
              disabled={saveLoading}
            >
              {saveLoading ? t.saving : currentConfigurationId ? t.updateSave : t.saveConfiguration}
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
            {dataState.loading ? <div className="preview-empty">{language === 'zh' ? '正在加载 tmj 文件...' : 'Loading tmj files...'}</div> : null}
            {!dataState.loading && dataState.error ? (
              <div className="preview-empty">{language === 'zh' ? `加载 tmj 失败：${dataState.error}` : `Failed to load tmj: ${dataState.error}`}</div>
            ) : null}
            {!dataState.loading && !dataState.error && dataState.warning ? (
              <div className="builder-warning">
                {language === 'zh' ? `已跳过无法加载的模块：${dataState.warning}` : `Skipped a module that failed to load: ${dataState.warning}`}
              </div>
            ) : null}
            {!dataState.loading && !dataState.error && !chassisModel ? (
              <div className="preview-empty">{language === 'zh' ? '没有找到机箱图层或槽位锚点。' : 'No chassis image layer or slot anchors were found.'}</div>
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
                        const occupiedBy = occupiedSlotMap[slot.id]?.moduleKey

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
                              const selectedModule = moduleLookup[selectedModuleKey]
                              const targetSlot = findNextAvailableSlotForModule(selectedModuleKey)
                              if (
                                !occupiedBy &&
                                selectedModuleKey &&
                                selectedModule &&
                                (hasLockedController || selectedModule.tone === 'controller') &&
                                (slot.id !== firstSlotId || selectedModule.tone === 'controller') &&
                                targetSlot?.id === slot.id
                              ) {
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

          <div className="placed-modules-panel placed-modules-panel-canvas">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">{language === 'zh' ? '已放置模块' : 'Placed Modules'}</p>
                <h2>{language === 'zh' ? '当前配置' : 'Current layout'}</h2>
              </div>
            </div>

            {placedModuleList.length ? (
              <div className="placed-modules-list">
                {placedModuleList.map((item) => (
                  <article key={`${item.slotId}-${item.label}`} className="placed-module-row">
                    <div>
                      <strong>{item.label}</strong>
                      <span>
                        {language === 'zh'
                          ? `槽位 ${item.slotIndex}${item.tone === 'controller' ? ' · controller' : ''}${item.span > 1 ? ` · ${item.span} 格` : ''}`
                          : `Slot ${item.slotIndex}${item.tone === 'controller' ? ' · controller' : ''}${item.span > 1 ? ` · ${item.span} slots` : ''}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="placed-module-remove"
                      onClick={() => {
                        removeModuleAtSlot(item.slotId)
                      }}
                    >
                      {language === 'zh' ? '删除' : 'Remove'}
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="library-empty-state">
                {language === 'zh' ? '还没有放置任何模块。' : 'No modules placed yet.'}
              </div>
            )}
          </div>

        </section>
      </section>
    </main>
  )
}

export default function AppRoot() {
  return (
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  )
}
