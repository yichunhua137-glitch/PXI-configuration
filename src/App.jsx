import { useEffect, useMemo, useRef, useState } from 'react'
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
    note: '当前已接入 tmj 和拖拽配置页',
    image: 'PXIe-1095 1.png',
    tmjPath: '/test/1095.tmj',
  },
  {
    key: 'pxie-1092',
    label: 'PXIe-1092',
    status: 'available',
    note: '已新增素材和槽位点，可直接进入配置',
    image: 'PXIe-1092 1.png',
    tmjPath: '/test/1092.tmj',
  },
]

const CHASSIS_OPTIONS = [
  {
    key: 'pxie-1095',
    label: 'PXIe-1095',
    status: 'available',
    note: '当前已接入 tmj 和拖拽配置页',
    image: 'PXIe-1095 1.png',
  },
  {
    key: 'pxie-1092',
    label: 'PXIe-1092',
    status: 'available',
    note: '已新增素材和槽位点，可直接进入配置',
    image: 'PXIe-1092 1.png',
  },
  {
    key: 'placeholder-a',
    label: 'More Chassis',
    status: 'placeholder',
    note: '后续上传机箱素材后接入',
  },
  {
    key: 'placeholder-b',
    label: 'Reserved',
    status: 'placeholder',
    note: '预留更多机箱模板入口',
  },
]

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
    return <div className={`missing-asset ${className}`} style={style}>素材缺失</div>
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

function App() {
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
  const [placedModules, setPlacedModules] = useState({})
  const [activeSlotId, setActiveSlotId] = useState(null)
  const [hoverSlotId, setHoverSlotId] = useState(null)
  const [contextSlotId, setContextSlotId] = useState(null)
  const [showSlotAnchors, setShowSlotAnchors] = useState(true)
  const moduleThumbRefs = useRef({})
  const contextTimerRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function loadMaps() {
      try {
        const responses = await Promise.all([
          ...CHASSIS_SOURCES.map((source) => fetch(source.tmjPath)),
          ...MODULE_SOURCES.map((source) => fetch(source.tmjPath)),
        ])

        if (responses.some((response) => !response.ok)) {
          throw new Error('tmj 文件读取失败')
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
            error: error instanceof Error ? error.message : '加载失败',
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

  const filteredModuleLibrary = useMemo(() => {
    if (!normalizedSearch) {
      return moduleLibrary
    }

    return moduleLibrary.filter((module) =>
      [module.label, module.tone].some((value) => value?.toLowerCase().includes(normalizedSearch)),
    )
  }, [moduleLibrary, normalizedSearch])

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

  const selectedChassis = CHASSIS_OPTIONS.find((option) => option.key === selectedChassisKey) ?? CHASSIS_OPTIONS[0]

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

  if (currentScreen === 'home') {
    return (
      <main className="page-shell home-shell">
        <section className="home-hero">
          <div className="home-copy">
            <p className="eyebrow">PXI Configuration Home</p>
            <h1>先选机箱，再进入板卡与控制器配置。</h1>
            <p className="hero-text">
              Home 页先做成入口界面。这里负责选择要配置的机箱，并提前看当前可用的控制器和板卡。
              你后面上传更多机箱素材后，我再把这些留白卡替换成真实模板。
            </p>
          </div>

          <div className="home-summary">
            <article className="summary-card">
              <strong>{CHASSIS_OPTIONS.filter((item) => item.status === 'available').length}</strong>
              <span>已接入机箱</span>
            </article>
            <article className="summary-card">
              <strong>{moduleLibrary.filter((item) => item.tone === 'controller').length}</strong>
              <span>控制器模板</span>
            </article>
            <article className="summary-card">
              <strong>{moduleLibrary.filter((item) => item.tone === 'module').length}</strong>
              <span>板卡模板</span>
            </article>
          </div>
        </section>

        <section className="home-grid">
          <article className="home-panel">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">Chassis</p>
                <h2>选择机箱</h2>
              </div>
              <label className="home-search">
                <span className="home-search-label">Search</span>
                <input
                  type="search"
                  className="home-search-input"
                  placeholder="搜索机箱、板卡、控制器"
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
                          <span>待上传机箱图片</span>
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
                            setCurrentScreen('builder')
                          }}
                        >
                          进入配置
                        </button>
                      ) : (
                        <span className="chassis-waiting-text">等待素材接入</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
            {!filteredChassisOptions.length ? (
              <div className="home-empty-state">没有匹配到机箱，换个关键词试试。</div>
            ) : null}
          </article>

          <article className="home-panel">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">Catalog</p>
                <h2>控制器与板卡</h2>
              </div>
            </div>

            <div className="catalog-grid">
              {filteredModuleLibrary.map((module) => (
                <article key={module.key} className="catalog-card">
                  <div className={`module-chip module-chip-${module.tone}`}>{module.label}</div>
                  <div className="catalog-thumb">
                    <AssetImage candidates={module.imageCandidates} alt={module.label} className="catalog-thumb-image" />
                  </div>
                  <span>{module.tone === 'controller' ? '控制器' : '板卡模块'}</span>
                </article>
              ))}
            </div>
            {!filteredModuleLibrary.length ? (
              <div className="home-empty-state">没有匹配到板卡或控制器。</div>
            ) : null}
          </article>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell builder-shell">
      <div className="page-topbar">
        <button
          type="button"
          className="topbar-home-button"
          onClick={() => {
            setCurrentScreen('home')
          }}
          aria-label="返回主界面"
          title="返回主界面"
        >
          ←
        </button>
      </div>

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
                aria-label="返回主界面"
                title="返回主界面"
              >
                ←
              </button>
              <p className="eyebrow">Module Library</p>
            </div>
            <h1>选择模块，然后拖进机箱槽位。</h1>
            <p className="hero-text">
              现在支持从左侧模块库拖放到右侧机箱。松手后会自动吸附到最近的槽位点。
            </p>
            <div className="builder-nav">
              <button
                type="button"
                className="back-home-button"
                onClick={() => {
                  setCurrentScreen('home')
                }}
              >
                返回 Home
              </button>
              <span className="builder-nav-label">{selectedChassis.label}</span>
            </div>
          </div>

          <div className="module-list">
            {moduleLibrary.map((module) => {
              const isSelected = selectedModuleKey === module.key

              return (
                <button
                  key={module.key}
                  type="button"
                  className={`module-tile ${isSelected ? 'module-tile-selected' : ''}`}
                  draggable
                  onClick={() => {
                    setSelectedModuleKey(module.key)
                  }}
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/module-key', module.key)
                    const dragImage = moduleThumbRefs.current[module.key]
                    if (dragImage) {
                      event.dataTransfer.setDragImage(
                        dragImage,
                        dragImage.width / 2,
                        Math.min(dragImage.height / 3, 40),
                      )
                    }
                    setDraggedModuleKey(module.key)
                    setSelectedModuleKey(module.key)
                  }}
                  onDragEnd={() => {
                    setDraggedModuleKey('')
                    setHoverSlotId(null)
                  }}
                >
                  <div className={`module-chip module-chip-${module.tone}`}>{module.label}</div>
                  <div className="module-thumb">
                    <AssetImage
                      candidates={module.imageCandidates}
                      alt={module.label}
                      className="module-thumb-image"
                      imageRef={(node) => {
                        if (node) {
                          moduleThumbRefs.current[module.key] = node
                        }
                      }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="canvas-panel">
          <div className="canvas-header">
            <div>
              <p className="eyebrow">Chassis Canvas</p>
              <h2>{selectedChassis.label} 槽位拖放预览</h2>
            </div>
            <div className="canvas-badge-group">
              <span className="panel-badge">{chassisModel?.slots.length ?? 0} slots</span>
              <span className="panel-badge subtle-badge">
                {draggedModuleKey ? `dragging ${draggedModuleKey}` : 'drop enabled'}
              </span>
              <button
                type="button"
                className="panel-badge badge-button"
                onClick={() => {
                  setShowSlotAnchors((current) => !current)
                }}
              >
                {showSlotAnchors ? '隐藏绿点' : '显示绿点'}
              </button>
            </div>
          </div>

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
            {dataState.loading ? <div className="preview-empty">正在读取 tmj 文件...</div> : null}
            {!dataState.loading && dataState.error ? (
              <div className="preview-empty">tmj 加载失败：{dataState.error}</div>
            ) : null}
            {!dataState.loading && !dataState.error && !chassisModel ? (
              <div className="preview-empty">未找到机箱图层或槽位点。</div>
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

          <div className="slot-summary">
            {chassisModel?.slots.map((slot) => (
              <article
                key={slot.id}
                className={`slot-summary-card ${activeSlotId === slot.id ? 'slot-summary-card-active' : ''}`}
              >
                <span>Slot {slot.index}</span>
                <strong>{placedModules[slot.id] ?? 'Empty'}</strong>
                <div className="slot-summary-actions">
                  <button
                    type="button"
                    className="slot-action"
                    onClick={() => {
                      setActiveSlotId(slot.id)
                      if (!placedModules[slot.id] && selectedModuleKey) {
                        placeModuleAtSlot(slot.id, selectedModuleKey)
                      }
                    }}
                  >
                    {placedModules[slot.id] ? '选中' : '放入'}
                  </button>
                  {placedModules[slot.id] ? (
                    <button
                      type="button"
                      className="slot-action slot-action-danger"
                      onClick={() => {
                        removeModuleAtSlot(slot.id)
                      }}
                    >
                      删除板卡
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
