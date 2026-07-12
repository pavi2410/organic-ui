import { h, state, effect } from "organic-ui"

export function Metronome() {
  const [bpm, setBpm] = state(120)
  const [isPlaying, setIsPlaying] = state(false)
  const [beatCount, setBeatCount] = state(0)
  
  // Effect that manages the metronome interval
  // No need to manually track disposal - owner-based cleanup handles it
  effect(() => {
    if (!isPlaying()) {
      // No interval when stopped
      return
    }
    
    const currentBpm = bpm()
    const intervalMs = 60000 / currentBpm
    
    // Create audio context for beep sound
    const audioContext = new AudioContext()
    
    const playBeep = () => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = "sine"
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
      
      // Use updater function to increment count
      setBeatCount(count => count + 1)
    }
    
    // Play first beat immediately
    playBeep()
    
    // Set up interval for subsequent beats
    const id = setInterval(playBeep, intervalMs)
    
    // Cleanup: clear interval and close audio context when effect re-runs
    return () => {
      clearInterval(id)
      if (audioContext.state !== "closed") {
        audioContext.close()
      }
    }
  })
  
  return h.div({
    style: {
      padding: "20px",
      border: "2px solid #3b82f6",
      borderRadius: "8px",
      maxWidth: "400px"
    },
    children: [
      h.div({
        text: "Metronome",
        style: {
          fontSize: "20px",
          fontWeight: "bold",
          marginBottom: "16px",
          color: "#2c3e50"
        }
      }),
      
      // Beat indicator
      h.div({
        text: () => isPlaying() ? `♪ Beat ${beatCount()}` : "○ Stopped",
        style: () => ({
          fontSize: "32px",
          textAlign: "center",
          padding: "20px",
          marginBottom: "16px",
          borderRadius: "8px",
          transition: "background-color 0.1s",
          backgroundColor: isPlaying() ? "#dbeafe" : "#f3f4f6"
        })
      }),
      
      // BPM display
      h.p({
        text: () => `${bpm()} BPM`,
        style: {
          fontSize: "24px",
          fontWeight: "600",
          textAlign: "center",
          marginBottom: "12px",
          color: "#3b82f6"
        }
      }),
      
      // BPM slider
      h.input({
        type: "range",
        min: 40,
        max: 240,
        step: 1,
        value: bpm,
        onInput: (value) => setBpm(Number(value)),
        style: {
          width: "100%",
          marginBottom: "16px",
          cursor: "pointer"
        }
      }),
      
      // Play/Stop button
      h.button({
        text: () => isPlaying() ? "Stop" : "Start",
        onClick: () => {
          const wasPlaying = isPlaying()
          setIsPlaying(playing => !playing)
          if (wasPlaying) {
            setBeatCount(0)
          }
        },
        style: () => ({
          width: "100%",
          padding: "12px",
          backgroundColor: isPlaying() ? "#ef4444" : "#10b981",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "600"
        })
      })
    ]
  })
}
