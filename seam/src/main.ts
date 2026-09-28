import '98.css'
import './style.css'
import './view/home.ts'
import './view/world.ts'
import { bindItems } from './view/items.ts'
import { boot } from './view/wm.ts'

boot()
bindItems()
