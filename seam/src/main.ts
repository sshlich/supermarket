import '98.css'
import './style.css'
import { splash } from './view/aero.ts'
import './view/home.ts'
import './view/run.ts'
import './view/terminal.ts'
import './view/end.ts'
import './view/world.ts'
import { applySettings } from './view/settings.ts'
import { bindItems } from './view/items.ts'
import { prepareLook } from './view/look.ts'
import { boot } from './view/wm.ts'

// The Authority's splash while the reality layer is prepared (13.3-13.4); then the desktop.
const done = splash()
prepareLook().finally(() => {
  boot()
  bindItems()
  applySettings()
  void done()
})
