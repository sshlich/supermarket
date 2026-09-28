// Appendix H: MAINT's lines and the Word in the Seam. {x} marks a blank the game fills in.

/** MAINT: lowercase, flat, never says "you". */
export const MAINT = {
  sweep: 'sweep complete. {n} units reclassified as debris. disposal requested.',
  clean: 'disposal complete. floor clean. thank you for keeping the accretion tidy.',
  schedule: 'accretion schedule advanced: {floor} +1 course. registered residents affected: 0.',
  stratum: 'new stratum registered: {name}. occupancy: 0. lighting: on.',
  silenced: 'choir resonance lost. {floor} acoustic profile: silent. this was not scheduled.',
  choirDead: 'biomass event {floor}: 80 units. source: choir. classification: pending.',
  tower: 'audit tower 7 reports noise. escalation pending.',
  hounds: 'glasshound density {floor}: {n}. predator control: none assigned.',
  residence: 'residence detected between -213 and -214. no permit on file. (logging.) (not actioning.) (yet.)',
  biomass: 'unregistered biomass detected: {n} units. logging. not actioning.',
  thermal: 'stratum {floor} thermal nominal. film coverage {film}%.',
  cold: 'stratum {floor} thermal: offline. film coverage {film}%. no ticket raised.',
  drained: 'stratum {floor} hydraulic state: drained. this is fine.',
  flooded: 'stratum {floor} hydraulic state: flooded. this is also fine.',
  buried: 'gap between -213 and -214 closed. residence records: none. nothing was lost.',
  audit: 'audit complete between -213 and -214. {n} unregistered units reclassified. stores itemised.',
  fragment: 'signature fragment presented. {n} of 7. access: {tier}. welcome, [NAME NOT FOUND].',
  lastLogin: 'it has been 11,408 years since the last authorised login.',
  hello: 'hello? (query malformed. discarding.)',
  hold: ['maintenance hold accepted. masons idle. productivity -100%. is this intended? y/n', 'n', 'understood.'],
  feed: '{floor} {species} {delta}% (48h)',
}

/** Rumours: villagers turning what they hear through the walls into hints. {who} is a living villager. */
export const RUMOURS = {
  claws: { who: 'Pell', text: '{who} heard claws in the Galleries.' },
  cold: { text: "The Galleries have gone cold. The film's gone grey." },
  drained: { who: 'Sabel', text: "The water in the Ducts went down in the night. {who} says there's a door under it." },
  flooded: { text: 'The Ducts are full again. You can hear the water from the stores.' },
  moved: { text: 'Something big moved {where}.' },
  silent: { text: "It's too quiet up past the Stair. The singing stopped." },
  warm: { who: 'Kett', text: '{who} swears the hatch was warm this morning. "Masons."' },
  // What the home levels sound like tonight, by how much lives there.
  galleries: { text: '{who} listened at the hatch. {band} in the Galleries.' },
  ducts: { text: '{who} put an ear to the floor. {band} in the Ducts.' },
  bands: {
    none: 'Nothing moves',
    few: 'A few things move',
    some: 'Things move, not many',
    many: 'Many things move',
    swarm: 'Something like a flood of bodies moves',
  } as Record<string, string>,
}
