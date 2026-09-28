import '98.css'
import './style.css'

// Steps 0-3 are dawn, 4-7 day, 8-11 dusk (DESIGN section 5).
const PHASES = ['dawn', 'day', 'dusk']
const clock = (day: number, step: number) => `Day ${day} · ${PHASES[Math.floor(step / 4)]} · ${step}/12`

document.getElementById('app')!.innerHTML = `
  <main class="desktop"></main>
  <footer class="taskbar">
    <button class="start"><b>STRATA</b>/98</button>
    <div class="tray"><time>${clock(1, 0)}</time></div>
  </footer>`
