import { h, state, For } from "organic-ui"

interface BenchmarkResult {
  name: string
  organicUI: number
  vanillaJS: number
  ratio: number // organicUI / vanillaJS (lower is better)
  organicMemory: number // Memory used in KB
  vanillaMemory: number // Memory used in KB
  memoryRatio: number // organicMemory / vanillaMemory (lower is better)
}

interface MeasurementResult {
  duration: number
  memory: number // in KB
}

interface BenchmarkTest {
  id: string
  name: string
  description: string
  warmupIterations: number
  runIterations: number
  runOrganic: () => Promise<MeasurementResult>
  runVanilla: () => Promise<MeasurementResult>
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function formatRatio(ratio: number): string {
  if (!isFinite(ratio) || isNaN(ratio)) {
    return '-'
  }
  return `${ratio.toFixed(2)}x`
}

function getRatioColor(ratio: number): string {
  if (ratio < 1.1) return '#28a745' // Excellent (within 10% of vanilla)
  if (ratio < 1.3) return '#ffc107' // Good (within 30%)
  if (ratio < 1.5) return '#fd7e14' // Acceptable (within 50%)
  return '#dc3545' // Needs optimization
}

// Small epsilon value for measurements that are too fast to measure accurately
// Represents ~0.01ms (10 microseconds)
const EPSILON = 0.01

// Weights based on js-framework-benchmark methodology
// Using 1 / (90th percentile of slowdown factors)
const benchmarkWeights: Record<string, number> = {
  'Create 1,000 rows': 0.306,
  'Replace all rows': 0.283,
  'Partial update': 0.194,
  'Swap rows': 0.194,
  'Remove row': 0.194,
  'Create 10,000 rows': 0.306,
  'Append 1,000 to 10,000 rows': 0.194,
  'Clear 10,000 rows': 0.323
}

function calculateWeightedGeometricMean(results: BenchmarkResult[]): number {
  if (results.length === 0) return 0
  
  // Calculate WGM for Organic UI times
  let organicWeightedLogSum = 0
  let totalWeight = 0
  
  for (const result of results) {
    const weight = benchmarkWeights[result.name] || 0.2 // Default weight
    
    // Use epsilon for zero or negative measurements
    const time = result.organicUI <= 0 ? EPSILON : result.organicUI
    
    organicWeightedLogSum += weight * Math.log(time)
    totalWeight += weight
  }
  
  const organicWGM = Math.exp(organicWeightedLogSum / totalWeight)
  
  // Calculate WGM for Vanilla JS times
  let vanillaWeightedLogSum = 0
  
  for (const result of results) {
    const weight = benchmarkWeights[result.name] || 0.2
    
    // Use epsilon for zero or negative measurements
    const time = result.vanillaJS <= 0 ? EPSILON : result.vanillaJS
    
    vanillaWeightedLogSum += weight * Math.log(time)
  }
  
  const vanillaWGM = Math.exp(vanillaWeightedLogSum / totalWeight)
  
  // Calculate ratio
  const ratio = organicWGM / vanillaWGM
  
  // Handle edge cases
  if (!isFinite(ratio) || isNaN(ratio)) {
    return 0 // Return 0 for invalid ratios
  }
  
  return ratio
}

async function measure(fn: () => void, warmup: number, iterations: number): Promise<MeasurementResult> {
  // Warmup runs
  for (let i = 0; i < warmup; i++) {
    fn()
    // Small delay between warmup iterations
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  
  // Force GC if available
  if ((window as any).gc) {
    (window as any).gc()
  }
  
  await new Promise(resolve => setTimeout(resolve, 50))
  
  // Collect measurements from multiple iterations
  const durationMeasurements: number[] = []
  const memoryMeasurements: number[] = []
  
  for (let i = 0; i < iterations; i++) {
    // Force GC before each measurement if available
    if ((window as any).gc) {
      (window as any).gc()
    }
    
    await new Promise(resolve => setTimeout(resolve, 10))
    
    // Measure memory before
    const memoryBefore = (performance as any).memory?.usedJSHeapSize || 0
    
    const start = performance.now()
    fn()
    const end = performance.now()
    
    // Measure memory after
    const memoryAfter = (performance as any).memory?.usedJSHeapSize || 0
    const memoryUsed = Math.max(0, memoryAfter - memoryBefore) / 1024 // Convert to KB
    
    durationMeasurements.push(end - start)
    memoryMeasurements.push(memoryUsed)
  }
  
  // Return median values (following js-framework-benchmark spec)
  durationMeasurements.sort((a, b) => a - b)
  memoryMeasurements.sort((a, b) => a - b)
  
  const mid = Math.floor(durationMeasurements.length / 2)
  
  let duration: number
  let memory: number
  
  if (durationMeasurements.length % 2 === 0) {
    // Even number of measurements: average of two middle values
    duration = (durationMeasurements[mid - 1] + durationMeasurements[mid]) / 2
    memory = (memoryMeasurements[mid - 1] + memoryMeasurements[mid]) / 2
  } else {
    // Odd number of measurements: middle value
    duration = durationMeasurements[mid]
    memory = memoryMeasurements[mid]
  }
  
  return { duration, memory }
}

// Data for benchmarks
function buildData(count: number): Array<{ id: number; label: string }> {
  const adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"]
  const colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"]
  const nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"]
  const data: Array<{ id: number; label: string }> = []
  for (let i = 0; i < count; i++) {
    data.push({
      id: i + 1,
      label: `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${colours[Math.floor(Math.random() * colours.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`
    })
  }
  return data
}

export function Benchmarks() {
  const [results, setResults] = state<BenchmarkResult[]>([])
  const [running, setRunning] = state<string | null>(null)
  
  // Following js-framework-benchmark spec
  const benchmarks: BenchmarkTest[] = [
    {
      id: 'create-1000',
      name: 'Create 1,000 rows',
      description: 'Duration for creating 1,000 rows (10 warmup, median of 10 runs)',
      warmupIterations: 10,
      runIterations: 10,
      runOrganic: async () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        
        const result = await measure(() => {
          const [data] = state(buildData(1000))
          const list = For({
            each: data,
            children: (item) => h.div({ 
              text: () => `${item.id} - ${item.label}`
            })
          })
          const cleanup = list.mount(container)
          cleanup()
        }, 10, 10)
        
        document.body.removeChild(container)
        return result
      },
      runVanilla: async () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        
        const result = await measure(() => {
          const data = buildData(1000)
          container.innerHTML = ''
          data.forEach(item => {
            const el = document.createElement('div')
            el.textContent = `${item.id} - ${item.label}`
            container.appendChild(el)
          })
          container.innerHTML = ''
        }, 10, 10)
        
        document.body.removeChild(container)
        return result
      }
    },
    {
      id: 'replace-all',
      name: 'Replace all rows',
      description: 'Duration for replacing all 1,000 rows (15 warmup, median of 10 runs)',
      warmupIterations: 15,
      runIterations: 10,
      runOrganic: async () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        
        const [data, setData] = state(buildData(1000))
        const list = For({
          each: data,
          children: (item) => h.div({ text: () => `${item.id} - ${item.label}` })
        })
        const cleanup = list.mount(container)
        
        const result = await measure(() => {
          setData(buildData(1000))
        }, 15, 10)
        
        cleanup()
        document.body.removeChild(container)
        return result
      },
      runVanilla: async () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        
        let data = buildData(1000)
        const render = () => {
          container.innerHTML = ''
          data.forEach(item => {
            const el = document.createElement('div')
            el.textContent = `${item.id} - ${item.label}`
            container.appendChild(el)
          })
        }
        render()
        
        const result = await measure(() => {
          data = buildData(1000)
          render()
        }, 15, 10)
        
        document.body.removeChild(container)
        return result
      }
    },
    {
      id: 'partial-update',
      name: 'Partial update',
      description: 'Duration for updating every 10th row in 10,000 rows (15 warmup, median of 10 runs)',
      warmupIterations: 15,
      runIterations: 10,
      runOrganic: async () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        
        const [data, setData] = state(buildData(10000))
        const list = For({
          each: data,
          children: (item) => h.div({ text: () => `${item.id} - ${item.label}` })
        })
        const cleanup = list.mount(container)
        
        const result = await measure(() => {
          setData(prev => prev.map((item, idx) => 
            idx % 10 === 0 ? { ...item, label: item.label + ' !!!' } : item
          ))
        }, 15, 10)
        
        cleanup()
        document.body.removeChild(container)
        return result
      },
      runVanilla: async () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        
        let data = buildData(10000)
        const elements: HTMLDivElement[] = []
        data.forEach(item => {
          const el = document.createElement('div')
          el.textContent = `${item.id} - ${item.label}`
          container.appendChild(el)
          elements.push(el)
        })
        
        const result = await measure(() => {
          for (let i = 0; i < data.length; i += 10) {
            data[i].label += ' !!!'
            elements[i].textContent = `${data[i].id} - ${data[i].label}`
          }
        }, 15, 10)
        
        document.body.removeChild(container)
        return result
      }
    },
    {
      id: 'swap-rows',
      name: 'Swap rows',
      description: 'Duration for swapping 2 rows in a 1,000 row table (15 warmup, median of 10 runs)',
      warmupIterations: 15,
      runIterations: 10,
      runOrganic: async () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        
        const [data, setData] = state(buildData(1000))
        const list = For({
          each: data,
          children: (item) => h.div({ text: () => `${item.id} - ${item.label}` })
        })
        const cleanup = list.mount(container)
        
        const result = await measure(() => {
          setData(prev => {
            const arr = [...prev]
            if (arr.length > 998) {
              const tmp = arr[1]
              arr[1] = arr[998]
              arr[998] = tmp
            }
            return arr
          })
        }, 15, 10)
        
        cleanup()
        document.body.removeChild(container)
        return result
      },
      runVanilla: async () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        
        const data = buildData(1000)
        const elements: HTMLDivElement[] = []
        data.forEach(item => {
          const el = document.createElement('div')
          el.textContent = `${item.id} - ${item.label}`
          container.appendChild(el)
          elements.push(el)
        })
        
        const result = await measure(() => {
          if (data.length > 998) {
            const tmp = data[1]
            data[1] = data[998]
            data[998] = tmp
            
            elements[1].textContent = `${data[1].id} - ${data[1].label}`
            elements[998].textContent = `${data[998].id} - ${data[998].label}`
          }
        }, 15, 10)
        
        document.body.removeChild(container)
        return result
      }
    },
    {
      id: 'remove-row',
      name: 'Remove row',
      description: 'Duration for removing a row from a 1,000 row table (15 warmup, median of 10 runs)',
      warmupIterations: 15,
      runIterations: 10,
      runOrganic: async () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        
        const [data, setData] = state(buildData(1000))
        const list = For({
          each: data,
          children: (item) => h.div({ text: () => `${item.id} - ${item.label}` })
        })
        const cleanup = list.mount(container)
        
        const result = await measure(() => {
          setData(prev => prev.filter((_, idx) => idx !== 1))
        }, 15, 10)
        
        cleanup()
        document.body.removeChild(container)
        return result
      },
      runVanilla: async () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        
        let data = buildData(1000)
        const render = () => {
          container.innerHTML = ''
          data.forEach(item => {
            const el = document.createElement('div')
            el.textContent = `${item.id} - ${item.label}`
            container.appendChild(el)
          })
        }
        render()
        
        const result = await measure(() => {
          data = data.filter((_, idx) => idx !== 1)
          render()
        }, 15, 10)
        
        document.body.removeChild(container)
        return result
      }
    },
    {
      id: 'create-10000',
      name: 'Create 10,000 rows',
      description: 'Duration for creating 10,000 rows (5 warmup, median of 10 runs)',
      warmupIterations: 5,
      runIterations: 10,
      runOrganic: async () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        
        const result = await measure(() => {
          const [data] = state(buildData(10000))
          const list = For({
            each: data,
            children: (item) => h.div({ text: () => `${item.id} - ${item.label}` })
          })
          const cleanup = list.mount(container)
          cleanup()
        }, 5, 10)
        
        document.body.removeChild(container)
        return result
      },
      runVanilla: async () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        
        const result = await measure(() => {
          const data = buildData(10000)
          container.innerHTML = ''
          data.forEach(item => {
            const el = document.createElement('div')
            el.textContent = `${item.id} - ${item.label}`
            container.appendChild(el)
          })
          container.innerHTML = ''
        }, 5, 10)
        
        document.body.removeChild(container)
        return result
      }
    },
    {
      id: 'append-1000',
      name: 'Append 1,000 to 10,000 rows',
      description: 'Duration for appending 1,000 rows to a table of 10,000 rows (10 warmup, median of 10 runs)',
      warmupIterations: 10,
      runIterations: 10,
      runOrganic: async () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        
        const [data, setData] = state(buildData(10000))
        const list = For({
          each: data,
          children: (item) => h.div({ text: () => `${item.id} - ${item.label}` })
        })
        const cleanup = list.mount(container)
        
        const result = await measure(() => {
          setData(prev => [...prev, ...buildData(1000)])
        }, 10, 10)
        
        cleanup()
        document.body.removeChild(container)
        return result
      },
      runVanilla: async () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        
        let data = buildData(10000)
        data.forEach(item => {
          const el = document.createElement('div')
          el.textContent = `${item.id} - ${item.label}`
          container.appendChild(el)
        })
        
        const result = await measure(() => {
          const newData = buildData(1000)
          newData.forEach(item => {
            const el = document.createElement('div')
            el.textContent = `${item.id} - ${item.label}`
            container.appendChild(el)
          })
        }, 10, 10)
        
        document.body.removeChild(container)
        return result
      }
    },
    {
      id: 'clear-10000',
      name: 'Clear 10,000 rows',
      description: 'Duration to clear the table filled with 10,000 rows (10 warmup, median of 10 runs)',
      warmupIterations: 10,
      runIterations: 10,
      runOrganic: async () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        
        const [data, setData] = state(buildData(10000))
        const list = For({
          each: data,
          children: (item) => h.div({ text: () => `${item.id} - ${item.label}` })
        })
        const cleanup = list.mount(container)
        
        const result = await measure(() => {
          setData([])
        }, 10, 10)
        
        cleanup()
        document.body.removeChild(container)
        return result
      },
      runVanilla: async () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        
        const data = buildData(10000)
        data.forEach(item => {
          const el = document.createElement('div')
          el.textContent = `${item.id} - ${item.label}`
          container.appendChild(el)
        })
        
        const result = await measure(() => {
          container.innerHTML = ''
        }, 10, 10)
        
        document.body.removeChild(container)
        return result
      }
    }
  ]
  
  const runBenchmark = async (benchmark: BenchmarkTest) => {
    setRunning(benchmark.id)
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    try {
      const organicResult = await benchmark.runOrganic()
      const vanillaResult = await benchmark.runVanilla()
      
      // Calculate duration ratio with epsilon for zero measurements
      const organicTime = organicResult.duration <= 0 ? EPSILON : organicResult.duration
      const vanillaTime = vanillaResult.duration <= 0 ? EPSILON : vanillaResult.duration
      
      let ratio = organicTime / vanillaTime
      
      // Handle edge cases (shouldn't happen with epsilon, but just in case)
      if (!isFinite(ratio) || isNaN(ratio)) {
        ratio = 0
      }
      
      // Calculate memory ratio with epsilon for zero measurements
      const organicMem = organicResult.memory <= 0 ? EPSILON : organicResult.memory
      const vanillaMem = vanillaResult.memory <= 0 ? EPSILON : vanillaResult.memory
      
      let memoryRatio = organicMem / vanillaMem
      
      // Handle edge cases
      if (!isFinite(memoryRatio) || isNaN(memoryRatio)) {
        memoryRatio = 0
      }
      
      const result: BenchmarkResult = {
        name: benchmark.name,
        organicUI: organicResult.duration,
        vanillaJS: vanillaResult.duration,
        ratio,
        organicMemory: organicResult.memory,
        vanillaMemory: vanillaResult.memory,
        memoryRatio
      }
      
      setResults(prev => [...prev.filter(r => r.name !== result.name), result])
    } catch (error) {
      console.error('Benchmark error:', error)
    } finally {
      setRunning(null)
    }
  }
  
  const runAllBenchmarks = async () => {
    setResults([])
    for (const benchmark of benchmarks) {
      await runBenchmark(benchmark)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  
  return h.div({
    children: [
      // Header
      h.div({
        children: [
          h.div({
            text: "Performance Benchmarks",
            style: {
              fontSize: "32px",
              fontWeight: "bold",
              marginBottom: "10px",
              color: "#2c3e50"
            }
          }),
          h.div({
            text: "Following js-framework-benchmark specification",
            style: {
              fontSize: "16px",
              color: "#666",
              marginBottom: "30px"
            }
          })
        ]
      }),
      
      // Results Table
      h.div({
        children: [
          // Header with button
          h.div({
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px"
            },
            children: [
              h.div({
                text: "Benchmark Results",
                style: {
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#2c3e50"
                }
              }),
              h.div({
                style: {
                  display: "flex",
                  gap: "10px",
                  alignItems: "center"
                },
                children: [
                  h.div({
                    text: () => running() ? `Running: ${running()}` : results().length > 0 ? `✓ ${results().length}/${benchmarks.length} completed` : "",
                    style: {
                      color: "#666",
                      fontSize: "14px"
                    }
                  }),
                  h.button({
                    text: () => running() ? "Running..." : "Run All",
                    onClick: runAllBenchmarks,
                    style: () => ({
                      padding: "10px 20px",
                      background: running() ? "#6c757d" : "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: running() ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: "600"
                    })
                  })
                ]
              })
            ]
          }),
          h.div({
            style: {
              background: "white",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              overflow: "hidden"
            },
            children: [
              // Table header
              h.div({
                style: {
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr 100px",
                  gap: "10px",
                  padding: "15px",
                  background: "#f8f9fa",
                  fontWeight: "600",
                  fontSize: "14px",
                  color: "#2c3e50"
                },
                children: [
                  h.div({ text: "Benchmark" }),
                  h.div({ text: "Vanilla JS (ms)" }),
                  h.div({ text: "Organic UI (ms)" }),
                  h.div({ text: "Duration Ratio" }),
                  h.div({ text: "Vanilla JS (KB)" }),
                  h.div({ text: "Organic UI (KB)" }),
                  h.div({ text: "Memory Ratio" }),
                  h.div({ text: "Action" })
                ]
              }),
              // Table rows
              ...benchmarks.map(benchmark => {
                const result = () => results().find(r => r.name === benchmark.name)
                const isRunning = () => running() === benchmark.id
                
                return h.div({
                  style: {
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr 100px",
                    gap: "10px",
                    padding: "15px",
                    borderTop: "1px solid #e0e0e0",
                    fontSize: "14px",
                    alignItems: "center"
                  },
                  children: [
                    h.div({ 
                      text: benchmark.name,
                      style: { fontWeight: "500" }
                    }),
                    h.div({ 
                      text: () => result() ? formatNumber(result()!.vanillaJS) : "-",
                      style: () => ({
                        color: result() ? "#2c3e50" : "#ccc"
                      })
                    }),
                    h.div({ 
                      text: () => result() ? formatNumber(result()!.organicUI) : "-",
                      style: () => ({
                        color: result() ? "#2c3e50" : "#ccc"
                      })
                    }),
                    h.div({ 
                      text: () => result() ? formatRatio(result()!.ratio) : "-",
                      style: () => ({
                        fontWeight: "600",
                        color: result() ? getRatioColor(result()!.ratio) : "#ccc"
                      })
                    }),
                    h.div({ 
                      text: () => result() ? formatNumber(result()!.vanillaMemory) : "-",
                      style: () => ({
                        color: result() ? "#2c3e50" : "#ccc"
                      })
                    }),
                    h.div({ 
                      text: () => result() ? formatNumber(result()!.organicMemory) : "-",
                      style: () => ({
                        color: result() ? "#2c3e50" : "#ccc"
                      })
                    }),
                    h.div({ 
                      text: () => result() ? formatRatio(result()!.memoryRatio) : "-",
                      style: () => ({
                        fontWeight: "600",
                        color: result() ? getRatioColor(result()!.memoryRatio) : "#ccc"
                      })
                    }),
                    h.button({
                      text: () => isRunning() ? "..." : "Run",
                      onClick: () => runBenchmark(benchmark),
                      style: () => ({
                        padding: "6px 12px",
                        background: isRunning() ? "#6c757d" : "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isRunning() ? "not-allowed" : "pointer",
                        fontSize: "13px",
                        fontWeight: "500"
                      })
                    })
                  ]
                })
              }),
              // Footer rows - WGM calculations
              h.div({
                style: () => ({
                  display: results().length === benchmarks.length ? "grid" : "none",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr 100px",
                  gap: "10px",
                  padding: "15px",
                  borderTop: "2px solid #2c3e50",
                  fontSize: "14px",
                  alignItems: "center",
                  background: "#f8f9fa",
                  fontWeight: "600"
                }),
                children: [
                  h.div({ 
                    text: "Weighted Geometric Mean",
                    style: { fontWeight: "700", color: "#2c3e50" }
                  }),
                  h.div({ 
                    text: () => {
                      // Calculate WGM for Vanilla JS duration
                      let vanillaWeightedLogSum = 0
                      let totalWeight = 0
                      
                      for (const result of results()) {
                        const weight = benchmarkWeights[result.name] || 0.2
                        const time = result.vanillaJS <= 0 ? EPSILON : result.vanillaJS
                        vanillaWeightedLogSum += weight * Math.log(time)
                        totalWeight += weight
                      }
                      
                      const vanillaWGM = Math.exp(vanillaWeightedLogSum / totalWeight)
                      return formatNumber(vanillaWGM)
                    },
                    style: { color: "#2c3e50" }
                  }),
                  h.div({ 
                    text: () => {
                      // Calculate WGM for Organic UI duration
                      let organicWeightedLogSum = 0
                      let totalWeight = 0
                      
                      for (const result of results()) {
                        const weight = benchmarkWeights[result.name] || 0.2
                        const time = result.organicUI <= 0 ? EPSILON : result.organicUI
                        organicWeightedLogSum += weight * Math.log(time)
                        totalWeight += weight
                      }
                      
                      const organicWGM = Math.exp(organicWeightedLogSum / totalWeight)
                      return formatNumber(organicWGM)
                    },
                    style: { color: "#2c3e50" }
                  }),
                  h.div({ 
                    text: "-",
                    style: { color: "#999" }
                  }),
                  h.div({ 
                    text: () => {
                      // Calculate WGM for Vanilla JS memory
                      let vanillaWeightedLogSum = 0
                      let totalWeight = 0
                      
                      for (const result of results()) {
                        const weight = benchmarkWeights[result.name] || 0.2
                        const mem = result.vanillaMemory <= 0 ? EPSILON : result.vanillaMemory
                        vanillaWeightedLogSum += weight * Math.log(mem)
                        totalWeight += weight
                      }
                      
                      const vanillaWGM = Math.exp(vanillaWeightedLogSum / totalWeight)
                      return formatNumber(vanillaWGM)
                    },
                    style: { color: "#2c3e50" }
                  }),
                  h.div({ 
                    text: () => {
                      // Calculate WGM for Organic UI memory
                      let organicWeightedLogSum = 0
                      let totalWeight = 0
                      
                      for (const result of results()) {
                        const weight = benchmarkWeights[result.name] || 0.2
                        const mem = result.organicMemory <= 0 ? EPSILON : result.organicMemory
                        organicWeightedLogSum += weight * Math.log(mem)
                        totalWeight += weight
                      }
                      
                      const organicWGM = Math.exp(organicWeightedLogSum / totalWeight)
                      return formatNumber(organicWGM)
                    },
                    style: { color: "#2c3e50" }
                  }),
                  h.div({ 
                    text: "-",
                    style: { color: "#999" }
                  }),
                  h.div({ text: "" })
                ]
              }),
              h.div({
                style: () => ({
                  display: results().length === benchmarks.length ? "grid" : "none",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr 100px",
                  gap: "10px",
                  padding: "15px",
                  borderTop: "1px solid #dee2e6",
                  fontSize: "14px",
                  alignItems: "center",
                  background: "#f8f9fa",
                  fontWeight: "600"
                }),
                children: [
                  h.div({ 
                    text: "Relative WGM (Organic UI / Vanilla JS)",
                    style: { fontWeight: "700", color: "#2c3e50" }
                  }),
                  h.div({ 
                    text: "1.00x",
                    style: { color: "#28a745", fontWeight: "700" }
                  }),
                  h.div({ 
                    text: () => {
                      const score = calculateWeightedGeometricMean(results())
                      return formatRatio(score)
                    },
                    style: () => {
                      const score = calculateWeightedGeometricMean(results())
                      return {
                        fontWeight: "700",
                        color: getRatioColor(score)
                      }
                    }
                  }),
                  h.div({ 
                    text: () => {
                      const score = calculateWeightedGeometricMean(results())
                      return formatRatio(score)
                    },
                    style: () => {
                      const score = calculateWeightedGeometricMean(results())
                      return {
                        fontWeight: "700",
                        fontSize: "16px",
                        color: getRatioColor(score)
                      }
                    }
                  }),
                  h.div({ 
                    text: "1.00x",
                    style: { color: "#28a745", fontWeight: "700" }
                  }),
                  h.div({ 
                    text: () => {
                      // Calculate memory WGM ratio
                      let organicWeightedLogSum = 0
                      let vanillaWeightedLogSum = 0
                      let totalWeight = 0
                      
                      for (const result of results()) {
                        const weight = benchmarkWeights[result.name] || 0.2
                        const organicMem = result.organicMemory <= 0 ? EPSILON : result.organicMemory
                        const vanillaMem = result.vanillaMemory <= 0 ? EPSILON : result.vanillaMemory
                        
                        organicWeightedLogSum += weight * Math.log(organicMem)
                        vanillaWeightedLogSum += weight * Math.log(vanillaMem)
                        totalWeight += weight
                      }
                      
                      const organicWGM = Math.exp(organicWeightedLogSum / totalWeight)
                      const vanillaWGM = Math.exp(vanillaWeightedLogSum / totalWeight)
                      const ratio = organicWGM / vanillaWGM
                      
                      return formatRatio(ratio)
                    },
                    style: () => {
                      // Calculate memory WGM ratio for color
                      let organicWeightedLogSum = 0
                      let vanillaWeightedLogSum = 0
                      let totalWeight = 0
                      
                      for (const result of results()) {
                        const weight = benchmarkWeights[result.name] || 0.2
                        const organicMem = result.organicMemory <= 0 ? EPSILON : result.organicMemory
                        const vanillaMem = result.vanillaMemory <= 0 ? EPSILON : result.vanillaMemory
                        
                        organicWeightedLogSum += weight * Math.log(organicMem)
                        vanillaWeightedLogSum += weight * Math.log(vanillaMem)
                        totalWeight += weight
                      }
                      
                      const organicWGM = Math.exp(organicWeightedLogSum / totalWeight)
                      const vanillaWGM = Math.exp(vanillaWeightedLogSum / totalWeight)
                      const ratio = organicWGM / vanillaWGM
                      
                      return {
                        fontWeight: "700",
                        color: getRatioColor(ratio)
                      }
                    }
                  }),
                  h.div({ 
                    text: () => {
                      // Calculate memory WGM ratio
                      let organicWeightedLogSum = 0
                      let vanillaWeightedLogSum = 0
                      let totalWeight = 0
                      
                      for (const result of results()) {
                        const weight = benchmarkWeights[result.name] || 0.2
                        const organicMem = result.organicMemory <= 0 ? EPSILON : result.organicMemory
                        const vanillaMem = result.vanillaMemory <= 0 ? EPSILON : result.vanillaMemory
                        
                        organicWeightedLogSum += weight * Math.log(organicMem)
                        vanillaWeightedLogSum += weight * Math.log(vanillaMem)
                        totalWeight += weight
                      }
                      
                      const organicWGM = Math.exp(organicWeightedLogSum / totalWeight)
                      const vanillaWGM = Math.exp(vanillaWeightedLogSum / totalWeight)
                      const ratio = organicWGM / vanillaWGM
                      
                      return formatRatio(ratio)
                    },
                    style: () => {
                      // Calculate memory WGM ratio for color
                      let organicWeightedLogSum = 0
                      let vanillaWeightedLogSum = 0
                      let totalWeight = 0
                      
                      for (const result of results()) {
                        const weight = benchmarkWeights[result.name] || 0.2
                        const organicMem = result.organicMemory <= 0 ? EPSILON : result.organicMemory
                        const vanillaMem = result.vanillaMemory <= 0 ? EPSILON : result.vanillaMemory
                        
                        organicWeightedLogSum += weight * Math.log(organicMem)
                        vanillaWeightedLogSum += weight * Math.log(vanillaMem)
                        totalWeight += weight
                      }
                      
                      const organicWGM = Math.exp(organicWeightedLogSum / totalWeight)
                      const vanillaWGM = Math.exp(vanillaWeightedLogSum / totalWeight)
                      const ratio = organicWGM / vanillaWGM
                      
                      return {
                        fontWeight: "700",
                        fontSize: "16px",
                        color: getRatioColor(ratio)
                      }
                    }
                  }),
                  h.div({ text: "" })
                ]
              })
            ]
          }),
          
          // Average ratio
          h.div({
            style: () => ({
              display: results().length === benchmarks.length ? "block" : "none",
              marginTop: "20px",
              padding: "20px",
              background: "#f8f9fa",
              borderRadius: "8px",
              textAlign: "center"
            }),
            children: [
              h.div({
                text: "Average Performance Ratio",
                style: {
                  fontSize: "18px",
                  fontWeight: "600",
                  marginBottom: "10px",
                  color: "#2c3e50"
                }
              }),
              h.div({
                text: () => {
                  const score = calculateWeightedGeometricMean(results())
                  return formatRatio(score)
                },
                style: () => {
                  const score = calculateWeightedGeometricMean(results())
                  return {
                    fontSize: "36px",
                    fontWeight: "700",
                    color: getRatioColor(score)
                  }
                }
              }),
              h.div({
                text: () => {
                  const score = calculateWeightedGeometricMean(results())
                  if (score < 1.1) return "🎉 Excellent! Nearly as fast as vanilla JS"
                  if (score < 1.3) return "✅ Good performance overhead"
                  if (score < 1.5) return "⚠️ Acceptable, but room for improvement"
                  return "❌ Needs optimization"
                },
                style: {
                  fontSize: "14px",
                  color: "#666",
                  marginTop: "10px"
                }
              }),
              h.div({
                text: "Using weighted geometric mean (js-framework-benchmark methodology)",
                style: {
                  fontSize: "12px",
                  color: "#999",
                  marginTop: "8px",
                  fontStyle: "italic"
                }
              })
            ]
          })
        ]
      }),
      
      // About Section
      h.div({
        style: {
          marginTop: "40px",
          padding: "20px",
          background: "#f8f9fa",
          borderRadius: "8px"
        },
        children: [
          h.div({
            text: "📊 About These Benchmarks",
            style: {
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "15px",
              color: "#2c3e50"
            }
          }),
          h.div({
            text: "These benchmarks follow the official js-framework-benchmark specification used to compare all major JavaScript frameworks. Each test measures a specific DOM operation pattern and compares Organic UI's performance against vanilla JavaScript (the theoretical fastest implementation).",
            style: {
              fontSize: "14px",
              color: "#666",
              marginBottom: "20px",
              lineHeight: "1.6"
            }
          }),
          h.div({
            text: "Methodology",
            style: {
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "10px",
              color: "#2c3e50"
            }
          }),
          h.div({
            style: {
              fontSize: "14px",
              color: "#666",
              marginBottom: "20px",
              lineHeight: "1.6"
            },
            children: [
              h.div({ 
                text: "• Each test compares Organic UI against vanilla JavaScript",
                style: { marginBottom: "6px" }
              }),
              h.div({ 
                text: "• Ratio = Organic UI time / Vanilla JS time (lower is better)",
                style: { marginBottom: "6px" }
              }),
              h.div({ 
                text: "• Overall score uses weighted geometric mean (same as official js-framework-benchmark)",
                style: { marginBottom: "6px" }
              }),
              h.div({ 
                text: "• Color coding: Green (<1.1x) = Excellent, Yellow (<1.3x) = Good, Orange (<1.5x) = Acceptable",
                style: { marginBottom: "6px" }
              })
            ]
          }),
          h.div({
            text: "Framework Comparison (typical ratios)",
            style: {
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "10px",
              color: "#2c3e50"
            }
          }),
          h.div({
            style: {
              fontSize: "13px",
              color: "#666",
              fontFamily: "monospace",
              lineHeight: "1.8"
            },
            children: [
              h.div({ text: "• Vanilla JS: 1.00x (baseline)" }),
              h.div({ text: "• Solid: ~1.05x" }),
              h.div({ text: "• Organic UI: ~1.08x (target)" }),
              h.div({ text: "• Vue 3: ~1.15x" }),
              h.div({ text: "• Svelte: ~1.20x" }),
              h.div({ text: "• React: ~1.45x" })
            ]
          })
        ]
      })
    ]
  })
}
