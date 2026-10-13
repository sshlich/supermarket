# Drones in real life (reference, 2026-10-13)

What actually decides how a real multirotor drone flies, down to the small stuff, as raw material for the drone
constructor. Nothing here is decided. The last section proposes how to turn it into a few abstract stats.

Decided so far (the user, 2026-10-13): drones are built at a **workbench** from parts on an empty grid, onto a **frame** that
has stats of its own; every part adds weight; rotors have stats such as power draw; odd extras (a flashlight) are parts too;
maybe **two layers** (rotors above the bay). **Touching parts connect** (no cable laying). **Balance** (centre of weight vs
centre of thrust) is out: liked for realism, too complicated. The tower-as-one-axis problem is open; the game may shift.

## 1. The frame

- **Layout.** Tri, quad (X, H, +), hexa, octo, coaxial (two rotors stacked per arm, "X8"). More arms: more lift and a spare
  if one motor dies (a hexa can lose one and land; a quad cannot), but more weight, cost and draw.
- **Size.** Measured corner to corner (a 250 mm racer, a 1 m lifter). Arm length caps the propeller size. Size decides what
  it fits through and how much wind catches it.
- **Material.** Carbon fibre: stiff and light, but it **blocks radio** (antennas must stick out) and conducts (shorts if a
  wire rubs through). Aluminium: tougher, heavier, bends instead of snapping. Plastic or printed: cheap, flexes (wobble).
  Wood: light, cheap, soaks up water.
- **Stiffness.** A frame that flexes shakes, and the shaking reaches the sensors (see Brains). Stiff frames fly cleaner.
- **Vibration damping.** The controller sits on rubber or gel mounts; without them it gets confused by its own motors.
- **Drag.** Frontal area: a boxy bay is slow in forward flight and catches crosswinds.
- **Mount points.** Where things can bolt on; frames differ in how many and where (a frame with no top plate has no room
  for a light or antenna up high).
- **Guards and ducts.** A ring around each propeller: survives bumps into walls, safer near people, a duct even adds some
  thrust at low speed. Costs weight and catches wind.
- **Landing gear.** Tall legs keep the bay off the ground and allow a hanging load; skids or none save weight.

## 2. Motors, controllers, propellers

- **Motor size** (stator width x height, e.g. 2207): bigger means more torque for bigger propellers, more weight.
- **KV** (turns per minute per volt): high KV spins small propellers fast (quick, hungry); low KV turns big ones slowly
  (efficient, smooth, heavy lifting). The KV has to match the propeller and the battery voltage, or the motor overheats.
- **Heat.** Motors and speed controllers get hot under load. Too hot and the magnets weaken for good (less power from then on),
  the windings burn, the controller cuts out.
- **Bearings.** Wear makes noise, vibration and heat. A gritty bearing is a whine you can hear.
- **Speed controllers (ESCs)**, one per motor: a current limit (too small and they burn), how fast they respond, active
  braking (sharper control, more draw), and the occasional desync (a motor stutters, the drone flips).
- **Propeller diameter:** bigger is more efficient (moving a lot of air slowly costs less than a little air fast), but needs
  a bigger frame and reacts slower.
- **Pitch** (how far one turn would screw it forward): high pitch is fast in forward flight, low pitch is efficient hovering
  and climbing.
- **Blade count:** two blades are the most efficient; three or four give more thrust from the same diameter (fit a small
  frame), but draw more and are louder.
- **Material and balance:** stiff propellers hold their shape under load; a nicked or unbalanced one shakes the whole drone
  and is noisier. Propellers are consumables.
- **Tip speed** sets the noise: fast-spinning tips scream; slow big blades hum.
- **Spin direction:** half turn one way, half the other, or the drone spins on the spot. Turning (yaw) comes from speeding
  one pair up, which is weak on big slow propellers (a heavy lifter turns lazily).
- **Coaxial losses:** the lower propeller of a stacked pair works in the upper one's wash and gives about 20% less.
- **Thrust to weight:** under about 1.5 to 1 it barely flies and cannot fight a gust; 2 to 1 is the normal minimum for
  control; 3 to 5 is a nimble camera drone; racers run 8 to 15.
- **Hover throttle:** a good build hovers at about half throttle, leaving the other half for climbing and gusts.

## 3. Power

- **Chemistry:** LiPo (gives a lot of current at once, light, a fire risk, swells when abused, hates the cold); Li-ion cells
  (more energy per kilo, cannot give big bursts: fine for long cruising, bad for heavy lifting); LiFePO4 (safe, long-lived,
  heavy); old NiMH (heavy, forgiving). Fuel cells and tethers exist (a tether: unlimited time, short leash).
- **Capacity** (how much energy) and **voltage** (cells in series: more voltage, more power, more weight).
- **Discharge rating** (how much current it can give at once): a weak battery under big motors sags and overheats.
- **Sag.** Under load the voltage drops, and drops more as the battery empties and as it ages. The drone gets **weaker
  towards the end of a flight**: a climb that was easy at the start may fail at the end.
- **Cold:** a cold battery gives far less (half or worse below freezing). Pilots warm them in a pocket before flying.
- **Age:** every charge cycle wears a battery a little; the internal resistance rises, so it sags more.
- **The weight trap:** a bigger battery is heavier, so it needs more power to carry. Flight time rises with battery size,
  flattens, then falls. The sweet spot is usually a battery around a third to half of the take-off weight.
- **Reserve:** land with 20 to 30% left; draining a LiPo flat damages it. Store half full.
- **Hover draw:** about 100 to 200 W per kilo of drone for a typical build. Everything carried costs energy every second.
- **Wiring:** thin wire heats up and wastes power; thick wire weighs more. Connectors wear, loosen and get hot.
- **Electronics power:** controller, radio, lights, a cold box, a heater all draw from the same battery.
- **Charging:** fast charging wears batteries; swapping a charged pack is instant but needs spares.

## 4. Brains: flight control and finding the way

- **Controller:** runs the stabilising loop hundreds or thousands of times a second. Faster loops and better gyros mean
  steadier flight.
- **Gyro and accelerometer:** the core sense of balance. Vibration blinds them (the drone drifts or twitches).
- **Tuning:** the controller's settings (PID) fit one weight. A drone tuned for a heavy load is sluggish when empty; tuned
  empty, it wobbles or oscillates when loaded.
- **Barometer:** height from air pressure. Fooled by propeller wash, wind, and doors opening (pressure changes indoors).
- **Compass:** heading. Thrown off by steel structures, high-current wires inside the drone itself, and power lines. A bad
  compass makes the drone circle when it tries to hold still ("toilet-bowling").
- **GPS:** position, but only with open sky. Useless indoors, poor between tall buildings (signals bounce).
- **Optical flow:** a downward camera that tracks the ground moving. Needs **light and texture**: fails in the dark, over
  plain floors and **over water** (no texture, reflections).
- **Rangefinders:** sonar (fails on soft surfaces, confused by other sonar), lidar (fails on glass and water, which reflect
  it away), radar (works in fog and dark, heavy).
- **Cameras for seeing the way** (visual odometry, obstacle avoidance): need light; fog, rain and glare blind them.
- **Dead reckoning:** with no outside fix, the drone guesses from its own motion, and the guess drifts more every minute.
- **Autonomy:** waypoints, obstacle avoidance, mapping as it flies, landing on a marker. More autonomy means more sensors,
  more weight, more draw.
- **Failsafes:** what it does when something goes wrong (lost link, low battery): come home, land on the spot, hover.
- **Redundancy:** two gyros, two batteries, spare motors (hexa, octo).

## 5. The link: radio and identity

- **Control and telemetry radio:** frequency matters. Low frequencies reach further and through walls; high ones carry more
  data (video) but need a clear line.
- **Antennas:** type, placement and orientation; a carbon frame or the battery between antenna and pilot cuts the range.
- **Line of sight, reflections, interference:** walls, steel and other radios eat the signal.
- **Lag:** delay between command and response; bad for flying by hand in tight spaces.
- **Video link:** analogue (instant, fuzzy) or digital (clear, a little lag, cuts out abruptly).
- **Identity:** remote ID broadcasts who owns it; registration, licences, no-fly zones. Can be spoofed or jammed, and so can
  GPS.

## 6. Payload

- **Weight:** everything above costs more with every gram carried.
- **Where it hangs:** off-centre loads make some motors work harder (this is the balance we left out).
- **Hanging loads** on a winch or line swing like a pendulum and pull the drone around.
- **Liquids slosh**, which shifts weight in turns.
- **Fragile goods** suffer from vibration and hard landings.
- **Cold or warm goods** need an insulated box, or a powered one (draw).
- **Drag:** big boxy cargo slows forward flight and catches the wind.
- **Release:** land and drop, a hook, a winch (lower without landing), a parachute drop, a release servo.

## 7. Weather and surroundings

- **Steady wind:** headwind costs time and energy, tailwind gives them back. A drone cannot fly into a wind faster than
  its top speed; in practice about two thirds of it.
- **Gusts and turbulence:** need spare thrust and a quick controller. Worst near buildings, corners, and in shafts.
- **Near surfaces:** close to the ground the drone floats on its own wash (ground effect); near a ceiling it gets sucked up;
  near a wall it gets pushed; in a closed space its own wash comes back at it.
- **Updrafts and downdrafts:** vents, chimneys, heat rising, cold air sinking.
- **Thin air:** heat, height and humidity lower the air's density, and thrust drops with it (about 10% less on a hot day
  than a cold one).
- **Rain:** water shorts electronics unless sealed; wet propellers lose efficiency.
- **Ice:** a thin layer on the propellers kills lift fast. Deadly.
- **Fog and dust:** blind cameras and lidar; dust wears bearings.
- **Salt spray:** corrosion of contacts, motors and frame over time.
- **Cold and heat:** cold kills batteries; heat cooks motors and controllers.
- **Sealing against cooling:** a sealed body keeps water out and heat in. One or the other.
- **Light:** cameras and optical flow need it. Lights fix that, cost power and get the drone seen.
- **Obstacles:** thin wires are nearly invisible; nets; birds attack drones (gulls, birds of prey); people throw things.
- **Magnetic trouble:** steel and power lines confuse the compass.

## 8. Wear and upkeep (wear is out of the game for now; listed for completeness)

- Propellers chip, bearings wear, screws loosen in vibration (thread lock), connectors wear, frames crack, batteries age.
- Calibration: compass, accelerometer, speed controllers. A drone rebuilt with different parts needs re-tuning.
- Flight logs show what went wrong.

## 9. People and rules

- **Noise:** propeller tips and blade count; it annoys, and it gives the drone away.
- **Visibility:** size, colour, lights; radar sees big metal ones.
- **Law:** weight classes (250 g is a real legal line in many countries), registration, licences, airspace and no-fly
  zones, line-of-sight rules.
- **Cost and repair:** standard parts are cheap to replace; odd ones are not.

## 10. Trade-offs that could carry a game

- A bigger battery flies longer, until its own weight wins (the weight trap).
- Big slow propellers: efficient and quiet, but a big frame, lazy turning, catches wind.
- Small fast propellers: fit anywhere, agile, but hungry and loud.
- More blades: more thrust in less space, less efficient, louder.
- More arms: lift and a spare motor, but weight and draw.
- Carbon: light and stiff, but blocks radio (needs an antenna mast).
- Sealing against cooling.
- Lights: see the way, but drain power and get seen.
- Armour and guards: survive knocks, but weight and drag.
- Tuned heavy against tuned light: steady loaded or nimble empty, not both.
- Sensors for every condition (dark, water, fog, no sky): each one costs weight and draw.
- The end of the flight is the weakest part (sag, cold): what you can do on the way out, you may not manage on the way back.

## 11. Abstract stats: a proposal

The raw quantities above (watts, grams, KV) are unreadable. Two layers instead:

**Six attributes, drawn as a windrose** (a hexagon, small whole numbers 1 to 10, like D&D ability scores). Each comes from
the parts, and hovering one shows which parts feed it and by how much.

| Attribute | Means | Fed by |
|---|---|---|
| **Lift** | what it can carry | thrust minus its own weight |
| **Reach** | how long and far | energy against draw; cold and sag lower it |
| **Pace** | how fast | spare thrust, pitch, drag |
| **Poise** | steady in wind, sure in tight spaces | spare thrust, controller, stiff frame, size |
| **Wits** | finds its way with no signal, in the dark, past obstacles | sensors, lights, controller, memory |
| **Grit** | survives knocks, weather and hands | frame material, sealing, guards, armour, spare motors |

A seventh, **Hush** (noise and visibility), could replace one or join them.

Opposite corners are set to pull against each other (Lift against Pace, Reach against Grit, Wits against Hush), so no build is
round: the shape of the rose is the drone's character. A **hauler**, a **runner**, a **scout**, a **ghost**, a **mule** each
have a silhouette the player learns to recognise at a glance.

**Traits for the small stuff** (like D&D feats and flaws): the details in sections 1 to 9 that do not fit an attribute become
short named lines on parts and on the drone, shown in words, never as hidden numbers:
- "Tuned heavy: steady loaded, twitchy empty."
- "Carbon frame: weak radio" (unless an antenna mast is fitted).
- "Cold-shy cells: Reach -2 in the cold."
- "Sags late: Lift -1 for the last third of a trip."
- "Whiny bearing: Hush -1."
- "Blind over water" (optical flow), "Compass drifts near steel," "Spare motor: survives losing one."

**Checks:** a hazard on a trip calls for an attribute (a gusty stretch: Poise; a dark one: Wits; a long one: Reach) with a
difficulty; the drone rolls against it, and traits add or subtract. Outcomes in degrees (clean, scraped through, failed),
each naming the attribute or trait that decided it.

**The shift:** if drones have ability scores, traits and trips with checks, they become the characters. The fleet is the
party, the workbench is the character sheet, and the trips are the adventures. That is close to the old night-expedition
and "hirelings as plans" pitches in `IDEAS.md`, with drones in place of people.
