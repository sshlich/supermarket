import '98.css'
import './style.css'
import './view/home.ts'
import './view/run.ts'
import './view/terminal.ts'
import './view/end.ts'
import './view/world.ts'
import { bindItems } from './view/items.ts'
import { boot } from './view/wm.ts'

boot()
bindItems()
