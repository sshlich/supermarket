# Probably Stolen 0.46D — unused, experimental and ghost content

Runtime dump: yes (PSDataDump). JSON for every section is in `data/unused/`. 'No code refs' means the id string appears nowhere outside its own registration and in no loot table; ids the game builds at runtime from parts can show up here, so treat each entry as a lead, not proof.

## Disabled loot-table entries

Present in a vanilla loot table but switched off (probability 0).

- `sup_keycard` in `accessCardTable`
- `sci_keycard` in `accessCardTable`

## Directories the game never loads

Directory classes are MonoBehaviours; these are attached to no GameObject and never named in code, so their entries never register.

| directory | entries | registered at runtime |
|---|---|---|
| CombatAbilityEffectInstantDirectory | 41 | False |
| CombatAbilityEffectPermanentDirectory | 5 | False |
| CombatAbilityEffectStandardDirectory | 55 | False |
| NpcCharacterItemDirectory | 22 | False |
| PlayerCharacterItemDirectory | 4 | False |
| StandardCombatAbilityDirectory | 44 | False |
| UnusedDirectory | 59 | False |

## Unreachable entries: dev/test only (4)

| id | directory | name | value | description |
|---|---|---|---|---|
| `cassette11` | MiscItemDirectory | Music Cassette -  | 35 | Music Cassette -  |
| `cassette12` | MiscItemDirectory | Music Cassette -  | 35 | Music Cassette -  |
| `cassette13` | MiscItemDirectory | Music Cassette -  | 35 | Music Cassette -  |
| `cassette14` | MiscItemDirectory | Music Cassette -  | 35 | Music Cassette -  |

## Unreachable entries: directory never loaded (218)

| id | directory | name | value | description |
|---|---|---|---|---|
| `bandage_stop_bleed` | CombatAbilityEffectInstantDirectory |  |  |  |
| `bandage_stop_light_bleed` | CombatAbilityEffectInstantDirectory |  |  |  |
| `baseball_bat_attack` | CombatAbilityEffectInstantDirectory |  |  |  |
| `blood_red_heal` | CombatAbilityEffectInstantDirectory |  |  |  |
| `blue_stim_heal` | CombatAbilityEffectInstantDirectory |  |  |  |
| `blunt_melee_stun` | CombatAbilityEffectInstantDirectory |  |  |  |
| `c4_breaching_damage` | CombatAbilityEffectInstantDirectory |  |  |  |
| `c4_damage` | CombatAbilityEffectInstantDirectory |  |  |  |
| `cleaver_attack` | CombatAbilityEffectInstantDirectory |  |  |  |
| `combat_knife_attack` | CombatAbilityEffectInstantDirectory |  |  |  |
| `combat_machete_attack` | CombatAbilityEffectInstantDirectory |  |  |  |
| `combat_scavenge` | CombatAbilityEffectInstantDirectory |  |  |  |
| `crowbar_attack` | CombatAbilityEffectInstantDirectory |  |  |  |
| `dev_damage_all` | CombatAbilityEffectInstantDirectory |  |  |  |
| `energy_hand_canon_charged` | CombatAbilityEffectInstantDirectory |  |  |  |
| `energy_hand_canon_normal` | CombatAbilityEffectInstantDirectory |  |  |  |
| `event_c4_effect` | CombatAbilityEffectInstantDirectory |  |  |  |
| `fireaxe_attack` | CombatAbilityEffectInstantDirectory |  |  |  |
| `fireaxe_big_attack` | CombatAbilityEffectInstantDirectory |  |  |  |
| `frag_damage` | CombatAbilityEffectInstantDirectory |  |  |  |
| `glock_attack` | CombatAbilityEffectInstantDirectory |  |  |  |
| `hatchet_attack` | CombatAbilityEffectInstantDirectory |  |  |  |
| `knife_attack` | CombatAbilityEffectInstantDirectory |  |  |  |
| `laser_autocanon_attack` | CombatAbilityEffectInstantDirectory |  |  |  |
| `lead_pipe_attack` | CombatAbilityEffectInstantDirectory |  |  |  |
| `mass_heal` | CombatAbilityEffectInstantDirectory |  |  |  |
| `medical_assist_stun_reduce` | CombatAbilityEffectInstantDirectory |  |  |  |
| `null` | CombatAbilityEffectInstantDirectory |  |  |  |
| `red_stim_heal` | CombatAbilityEffectInstantDirectory |  |  |  |
| `smelling_salt_stun_remove` | CombatAbilityEffectInstantDirectory |  |  |  |
| `stop_bleed` | CombatAbilityEffectInstantDirectory |  |  |  |
| `storm_effect` | CombatAbilityEffectInstantDirectory |  |  |  |
| `stun_baton_damage` | CombatAbilityEffectInstantDirectory |  |  |  |
| `ump_attack` | CombatAbilityEffectInstantDirectory |  |  |  |
| `wait` | CombatAbilityEffectInstantDirectory |  |  |  |
| `weapon_attack` | CombatAbilityEffectInstantDirectory |  |  |  |
| `white_stim_heal` | CombatAbilityEffectInstantDirectory |  |  |  |
| `xeno_consume_attack` | CombatAbilityEffectInstantDirectory |  |  |  |
| `xeno_consume_heal` | CombatAbilityEffectInstantDirectory |  |  |  |
| `xeno_laceration_attack` | CombatAbilityEffectInstantDirectory |  |  |  |
| `xeno_scratch_attack` | CombatAbilityEffectInstantDirectory |  |  |  |
| `dead` | CombatAbilityEffectPermanentDirectory |  |  |  |
| `dehydration` | CombatAbilityEffectPermanentDirectory |  |  |  |
| `extreme_dehydration` | CombatAbilityEffectPermanentDirectory |  |  |  |
| `thirsty` | CombatAbilityEffectPermanentDirectory |  |  |  |
| `well_hydrated` | CombatAbilityEffectPermanentDirectory |  |  |  |
| `aloe_vera_heal` | CombatAbilityEffectStandardDirectory |  |  |  |
| `antitoxin` | CombatAbilityEffectStandardDirectory |  |  |  |
| `berserk_effect` | CombatAbilityEffectStandardDirectory |  |  |  |
| `bicarsole_heal` | CombatAbilityEffectStandardDirectory |  |  |  |
| `bleed_heavy` | CombatAbilityEffectStandardDirectory |  |  |  |
| `bleed_light` | CombatAbilityEffectStandardDirectory |  |  |  |
| `blood_red_max_health` | CombatAbilityEffectStandardDirectory |  |  |  |
| `brace_dodge_buff` | CombatAbilityEffectStandardDirectory |  |  |  |
| `brace_priority_decrease` | CombatAbilityEffectStandardDirectory |  |  |  |
| `c4_breaching_stun` | CombatAbilityEffectStandardDirectory |  |  |  |
| `coagulent` | CombatAbilityEffectStandardDirectory |  |  |  |
| `combat_stim_acc_buff` | CombatAbilityEffectStandardDirectory |  |  |  |
| `combat_stim_cc_buff` | CombatAbilityEffectStandardDirectory |  |  |  |
| `diversion_priority_increase` | CombatAbilityEffectStandardDirectory |  |  |  |
| `fixalin_dodge` | CombatAbilityEffectStandardDirectory |  |  |  |
| `fixalin_speed` | CombatAbilityEffectStandardDirectory |  |  |  |
| `flashbang_stun` | CombatAbilityEffectStandardDirectory |  |  |  |
| `green_stim_heal` | CombatAbilityEffectStandardDirectory |  |  |  |
| `lifeweed_accuracy` | CombatAbilityEffectStandardDirectory |  |  |  |
| `lifeweed_heal` | CombatAbilityEffectStandardDirectory |  |  |  |
| `mark_dodge_debuff` | CombatAbilityEffectStandardDirectory |  |  |  |
| `mark_priority_increase` | CombatAbilityEffectStandardDirectory |  |  |  |
| `mirage_dodge` | CombatAbilityEffectStandardDirectory |  |  |  |
| `molotov_cocktail_burn` | CombatAbilityEffectStandardDirectory |  |  |  |
| `mushroom_death_resist` | CombatAbilityEffectStandardDirectory |  |  |  |
| `ocutol_acc` | CombatAbilityEffectStandardDirectory |  |  |  |
| `ocutol_critical` | CombatAbilityEffectStandardDirectory |  |  |  |
| `overwatch_effect` | CombatAbilityEffectStandardDirectory |  |  |  |
| `red_stim_bleed` | CombatAbilityEffectStandardDirectory |  |  |  |
| `retaliate_effect` | CombatAbilityEffectStandardDirectory |  |  |  |
| `smoke_accuracy` | CombatAbilityEffectStandardDirectory |  |  |  |
| `spa_acc` | CombatAbilityEffectStandardDirectory |  |  |  |
| `spa_cc` | CombatAbilityEffectStandardDirectory |  |  |  |
| `spa_dodge` | CombatAbilityEffectStandardDirectory |  |  |  |
| `spa_heal` | CombatAbilityEffectStandardDirectory |  |  |  |
| `spa_heal2` | CombatAbilityEffectStandardDirectory |  |  |  |
| `spa_max_hp` | CombatAbilityEffectStandardDirectory |  |  |  |
| `spotter_accuracy_buff` | CombatAbilityEffectStandardDirectory |  |  |  |
| `stun_baton_stun` | CombatAbilityEffectStandardDirectory |  |  |  |
| `take_aim_acc_buff` | CombatAbilityEffectStandardDirectory |  |  |  |
| `take_aim_crit_chance_buff` | CombatAbilityEffectStandardDirectory |  |  |  |
| `take_aim_dodge_debuff` | CombatAbilityEffectStandardDirectory |  |  |  |
| `take_aim_reaction_buff` | CombatAbilityEffectStandardDirectory |  |  |  |
| `taser_stun` | CombatAbilityEffectStandardDirectory |  |  |  |
| `taunt_effect` | CombatAbilityEffectStandardDirectory |  |  |  |
| `xeno_empower_effect` | CombatAbilityEffectStandardDirectory |  |  |  |
| `xeno_healing_spray_heal` | CombatAbilityEffectStandardDirectory |  |  |  |
| `xeno_irritant_acc_debuff` | CombatAbilityEffectStandardDirectory |  |  |  |
| `xeno_knockdown_stun` | CombatAbilityEffectStandardDirectory |  |  |  |
| `xeno_mark_dodge_debuff` | CombatAbilityEffectStandardDirectory |  |  |  |
| `xeno_mark_priority_increase` | CombatAbilityEffectStandardDirectory |  |  |  |
| `xeno_prey_acc_buff` | CombatAbilityEffectStandardDirectory |  |  |  |
| `xeno_prey_dodge_debuff` | CombatAbilityEffectStandardDirectory |  |  |  |
| `xeno_toxin_attack` | CombatAbilityEffectStandardDirectory |  |  |  |
| `xeno_warcry_acc_buff` | CombatAbilityEffectStandardDirectory |  |  |  |
| `deserter_combat_medic` | NpcCharacterItemDirectory |  |  |  |
| `deserter_marine` | NpcCharacterItemDirectory |  |  |  |
| `guard_marine` | NpcCharacterItemDirectory |  |  |  |
| `merchant` | NpcCharacterItemDirectory |  |  |  |
| `pirate_chief` | NpcCharacterItemDirectory |  |  |  |
| `pirate_rookie` | NpcCharacterItemDirectory |  |  |  |
| `pirate_veteran` | NpcCharacterItemDirectory |  |  |  |
| `raider_boss` | NpcCharacterItemDirectory |  |  |  |
| `raider_junker` | NpcCharacterItemDirectory |  |  |  |
| `raider_marine` | NpcCharacterItemDirectory |  |  |  |
| `raider_marine_overwatch` | NpcCharacterItemDirectory |  |  |  |
| `raider_marine_sadistic` | NpcCharacterItemDirectory |  |  |  |
| `raider_medic` | NpcCharacterItemDirectory |  |  |  |
| `raider_medic_murderous` | NpcCharacterItemDirectory |  |  |  |
| `raider_scav` | NpcCharacterItemDirectory |  |  |  |
| `raider_scav_murderous` | NpcCharacterItemDirectory |  |  |  |
| `raider_technician` | NpcCharacterItemDirectory |  |  |  |
| `raider_technician_murderous` | NpcCharacterItemDirectory |  |  |  |
| `xeno_brewer` | NpcCharacterItemDirectory |  |  |  |
| `xeno_drone` | NpcCharacterItemDirectory |  |  |  |
| `xeno_herald` | NpcCharacterItemDirectory |  |  |  |
| `xeno_hunter` | NpcCharacterItemDirectory |  |  |  |
| `albert` | PlayerCharacterItemDirectory |  |  |  |
| `benjamin` | PlayerCharacterItemDirectory |  |  |  |
| `charlotte` | PlayerCharacterItemDirectory |  |  |  |
| `daniel` | PlayerCharacterItemDirectory |  |  |  |
| `bandage_ability` | StandardCombatAbilityDirectory |  |  |  |
| `bicarsole_pill` | StandardCombatAbilityDirectory |  |  |  |
| `brace_ability` | StandardCombatAbilityDirectory |  |  |  |
| `combat_scav` | StandardCombatAbilityDirectory |  |  |  |
| `combat_stim` | StandardCombatAbilityDirectory |  |  |  |
| `dev_damage` | StandardCombatAbilityDirectory |  |  |  |
| `diversion_ability` | StandardCombatAbilityDirectory |  |  |  |
| `double_tap_attack` | StandardCombatAbilityDirectory |  |  |  |
| `experimental_injector_black` | StandardCombatAbilityDirectory |  |  |  |
| `experimental_injector_green` | StandardCombatAbilityDirectory |  |  |  |
| `experimental_injector_purple` | StandardCombatAbilityDirectory |  |  |  |
| `experimental_injector_red` | StandardCombatAbilityDirectory |  |  |  |
| `experimental_injector_white` | StandardCombatAbilityDirectory |  |  |  |
| `flashbang` | StandardCombatAbilityDirectory |  |  |  |
| `food` | StandardCombatAbilityDirectory |  |  |  |
| `frag_grenade` | StandardCombatAbilityDirectory |  |  |  |
| `glock_attack_ability` | StandardCombatAbilityDirectory |  |  |  |
| `glock_attack_ability2` | StandardCombatAbilityDirectory |  |  |  |
| `mark` | StandardCombatAbilityDirectory |  |  |  |
| `mark_ability` | StandardCombatAbilityDirectory |  |  |  |
| `medical_assist_ability` | StandardCombatAbilityDirectory |  |  |  |
| `medical_proficiency` | StandardCombatAbilityDirectory |  |  |  |
| `medical_proficiency_2` | StandardCombatAbilityDirectory |  |  |  |
| `mirage_generator` | StandardCombatAbilityDirectory |  | 100 |  |
| `mp9_attack_ability` | StandardCombatAbilityDirectory |  |  |  |
| `nothing` | StandardCombatAbilityDirectory |  |  |  |
| `overwatch` | StandardCombatAbilityDirectory |  |  |  |
| `retaliate` | StandardCombatAbilityDirectory |  |  |  |
| `spotter_ability` | StandardCombatAbilityDirectory |  |  |  |
| `stop_block_bleed` | StandardCombatAbilityDirectory |  |  |  |
| `take_aim_ability` | StandardCombatAbilityDirectory |  |  |  |
| `taser` | StandardCombatAbilityDirectory |  |  |  |
| `ump_attack_ability` | StandardCombatAbilityDirectory |  |  |  |
| `aloe_vera` | UnusedDirectory |  | 10 |  |
| `aloe_vera_gel` | UnusedDirectory |  | 7 |  |
| `ammo_box` | UnusedDirectory |  | 1 |  |
| `antique_grenade` | UnusedDirectory |  | 40 |  |
| `armor_titan10` | UnusedDirectory |  | 50 |  |
| `armor_titan10h` | UnusedDirectory |  | 90 |  |
| `armor_titan10l` | UnusedDirectory |  | 150 |  |
| `armor_titan10s` | UnusedDirectory |  | 120 |  |
| `armor_titan9` | UnusedDirectory |  | 100 |  |
| `backpack_large_modular` | UnusedDirectory |  | 280 |  |
| `backpack_medium_modular` | UnusedDirectory |  | 130 |  |
| `backpack_small_modular` | UnusedDirectory |  | 60 |  |
| `bicarsole_pill_bottle` | UnusedDirectory |  | 1 |  |
| `box_nail` | UnusedDirectory |  | 18 |  |
| `codebook` | UnusedDirectory |  | 0 |  |
| `exotic_fuel` | UnusedDirectory |  | 5 |  |
| `firstaid_box` | UnusedDirectory |  | 15 |  |
| `fixalin_pill_bottle` | UnusedDirectory |  | 1 |  |
| `heavy_handmade_pistol_s` | UnusedDirectory |  |  |  |
| `hemostatic_agent` | UnusedDirectory |  | 10 |  |
| `inspection_book` | UnusedDirectory |  | 0 |  |
| `large_storage_bay` | UnusedDirectory |  | 300 |  |
| `loan_contract` | UnusedDirectory |  | 0 |  |
| `lockpicks` | UnusedDirectory |  | 20 |  |
| `lootbox_large` | UnusedDirectory |  |  |  |
| `lootbox_medium` | UnusedDirectory |  |  |  |
| `lootbox_small` | UnusedDirectory |  |  |  |
| `molotov_cocktail` | UnusedDirectory |  | 35 |  |
| `ocutol_pill_bottle` | UnusedDirectory |  | 1 |  |
| `organ_heart` | UnusedDirectory |  | 300 |  |
| `organ_kidney` | UnusedDirectory |  | 1 |  |
| `organ_liver` | UnusedDirectory |  | 1 |  |
| `organ_lung` | UnusedDirectory |  | 1 |  |
| `organ_transport_container` | UnusedDirectory |  | 500 |  |
| `oxycodone_pill_bottle` | UnusedDirectory |  | 1 |  |
| `phagimycin_pill_bottle` | UnusedDirectory |  | 1 |  |
| `pill_bottle` | UnusedDirectory |  | 1 |  |
| `pouch_general` | UnusedDirectory |  | 30 |  |
| `pouch_general_large` | UnusedDirectory |  | 50 |  |
| `pouch_hydration` | UnusedDirectory |  | 85 |  |
| `pouch_injector` | UnusedDirectory |  | 25 |  |
| `pouch_injector_large` | UnusedDirectory |  | 25 |  |
| `pouch_injector_large_double` | UnusedDirectory |  | 25 |  |
| `pouch_medical` | UnusedDirectory |  | 40 |  |
| `revolver_long` | UnusedDirectory |  |  |  |
| `revolver_short` | UnusedDirectory |  |  |  |
| `revolver_short_tac` | UnusedDirectory |  |  |  |
| `safe` | UnusedDirectory |  | 225 |  |
| `sec_card` | UnusedDirectory |  | 0 |  |
| `spectral_analyser` | UnusedDirectory |  | 50 |  |
| `steel_sheet` | UnusedDirectory |  | 8 |  |
| `technician_backpack` | UnusedDirectory |  | 150 |  |
| `test_water` | UnusedDirectory |  |  |  |
| `test_water2` | UnusedDirectory |  |  |  |
| `test_water3` | UnusedDirectory |  |  |  |
| `trash_pile` | UnusedDirectory |  | 0 |  |
| `unlicensed_phagimycin_pill_bottle` | UnusedDirectory |  | 1 |  |
| `wrench_orange` | UnusedDirectory |  | 30 |  |

## Unreachable entries: no code refs (35)

| id | directory | name | value | description |
|---|---|---|---|---|
| `lottery_ticket_old` | AmenitiesItemDirectory | Old Lottery Ticket | 1 | A worthless ticket from the Lower Levels Lottery. No winning numbers, just faded hope. |
| `box_dispenser` | FurnitureItemDirectory | Box Dispenser | 250 |  |
| `test_gizmo` | FurnitureItemDirectory | Test Gizmo |  |  |
| `barrel` | GunModDirectory | Attachable Extended Barrel | 60 | A multi-caliber extended barrel that improve bullet velocity and accuracy. |
| `restricted_medical` | MaterialDirectory | Medical Supplies (Restricted) |  |  |
| `canister_mbs` | MiscItemDirectory | MBS Nerve Gas | 400 | A highly toxic chemical weapon designed to disrupt the nervous system. Symptoms include: Respiratory failure, Convulsions, Loss of bodily fu |
| `cassette10l` | MiscItemDirectory | Music Cassette -  | 35 | Music Cassette -  |
| `cassette11l` | MiscItemDirectory | Music Cassette -  | 35 | Music Cassette -  |
| `cassette12l` | MiscItemDirectory | Music Cassette -  | 35 | Music Cassette -  |
| `cassette13l` | MiscItemDirectory | Music Cassette -  | 35 | Music Cassette -  |
| `cassette14l` | MiscItemDirectory | Music Cassette -  | 35 | Music Cassette -  |
| `cassette1l` | MiscItemDirectory | Music Cassette -  | 35 | Music Cassette -  |
| `cassette2l` | MiscItemDirectory | Music Cassette -  | 35 | Music Cassette -  |
| `cassette3l` | MiscItemDirectory | Music Cassette -  | 35 | Music Cassette -  |
| `cassette4l` | MiscItemDirectory | Music Cassette -  | 35 | Music Cassette -  |
| `cassette5l` | MiscItemDirectory | Music Cassette -  | 35 | Music Cassette -  |
| `cassette6l` | MiscItemDirectory | Music Cassette -  | 35 | Music Cassette -  |
| `cassette7l` | MiscItemDirectory | Music Cassette -  | 35 | Music Cassette -  |
| `cassette8l` | MiscItemDirectory | Music Cassette -  | 35 | Music Cassette -  |
| `cassette9l` | MiscItemDirectory | Music Cassette -  | 35 | Music Cassette -  |
| `rev_codeword` | MiscItemDirectory | Codeword List |  | An inconspicuous slip of paper with a hastily written key for the code used by revolutionaries. |
| `sci_keycard` | MiscItemDirectory | Disposable Keycard (Research) | 100 | A single-use keycard for Research and Development. Can open locks that require Science Department access. |
| `blank_module` | ModuleDirectory | Blank Module | 60 | A blank module. With the right machine, this could rewrite this into something useful. |
| `node_small` | ModuleDirectory | Node (Small) | 50 | A specialized circuit that can provide or receive bonuses from adjacent Modules when installed in certain Machines. |
| `system_module_streamlining` | ModuleDirectory | Streamlining Module | 125 |  |
| `perk_annoying` | PerkDirectory | Annoying |  |  |
| `perk_center_mass_acc_buff` | PerkDirectory | Center Mass |  |  |
| `perk_center_mass_cc_debuff` | PerkDirectory | Center Mass |  |  |
| `perk_discret` | PerkDirectory | Inconspicuous |  |  |
| `perk_healthy` | PerkDirectory | Picture of Health |  |  |
| `perk_phagophobia` | PerkDirectory | Medical Phagophobia |  |  |
| `perk_sickly` | PerkDirectory | Poor Constitution |  |  |
| `perk_tenacious` | PerkDirectory | Tenacious |  |  |
| `perk_trypanophobia` | PerkDirectory | Trypanophobia |  |  |
| `sign_berry` | ToolDirectory | item_sign_berry_name | 100 |  |

## Experimental / test / old-named registry entries (17)

| id | directory | name | refs | in loot |
|---|---|---|---|---|
| `dev_damage` | StandardCombatAbilityDirectory |  | 0 |  |
| `dev_damage_all` | CombatAbilityEffectInstantDirectory |  | 1 |  |
| `experimental_injector_black` | StandardCombatAbilityDirectory |  | 0 |  |
| `experimental_injector_green` | StandardCombatAbilityDirectory |  | 0 |  |
| `experimental_injector_purple` | StandardCombatAbilityDirectory |  | 0 |  |
| `experimental_injector_red` | StandardCombatAbilityDirectory |  | 0 |  |
| `experimental_injector_white` | StandardCombatAbilityDirectory |  | 1 |  |
| `lottery_ticket_old` | AmenitiesItemDirectory | Old Lottery Ticket | 0 |  |
| `lou_old_orders` | MiscItemDirectory | Old Republic Orders | 2 |  |
| `sign_household` | ToolDirectory | Household Item Neon Sign | 5 |  |
| `sold_save_bag` | ContainerItemDirectory | Hidden Save Bag | 2 |  |
| `test_gizmo` | FurnitureItemDirectory | Test Gizmo | 0 |  |
| `test_water` | UnusedDirectory |  | 1 |  |
| `test_water2` | UnusedDirectory |  | 1 |  |
| `test_water3` | UnusedDirectory |  | 1 |  |
| `water_test_container` | AmenitiesItemDirectory | Water Testing Kit | 2 |  |
| `water_test_strip` | AmenitiesItemDirectory | Water Testing Strip | 2 |  |

## Cut content: factories nothing calls (67)

### `BarterOfferList.CreateBarterFoodTutorial`
> Barter for: {0}

### `EventListCosmetic.Example`
(no text)

### `EventListCosmetic.NewDepartementHead`
(no text)

### `EventListCosmetic.DepartementHeadMissing`
(no text)

### `EventListCosmetic.DepartementHeadFoundDead`
(no text)

### `EventListCosmetic.DepartementHeadAssasinated`
(no text)

### `EventListCosmetic.DepartementHeadFired`
(no text)

### `EventListThreat.StationBlockaded`
(no text)

### `EventListThreat.PirateRaid`
(no text)

### `EventListThreat.RepublicMarineArrived`
(no text)

### `FactionStatusList.SecurityCrackdown` — `security_crackdown`
> Security Crackdown

### `FactionStatusList.SecurityCheckpoint` — `security_checkpoint`
> Security Checkpoint

### `FactionStatusList.SecurityBudgetIncrease` — `security_budget_increase`
> Security Budget Increase

### `FactionStatusList.ReducedPatrol` — `reduced_patrol`
> Reduced Patrol

### `FactionStatusList.ExtraPatrol` — `extra_patrol`
> Extra Patrol

### `FactionStatusList.SurveillanceUpgrade` — `surveillance_upgrade`
> Surveillance Upgrade

### `FactionStatusList.EmergencyLockdown` — `emergency_lockdown`
> Emergency Lockdown

### `FactionStatusList.TacticalDeployment` — `tactical_deployment`
> ERT Deployment

### `ItemFeatureList.SupplierDiscount` — `supplierDiscount`
> Supplier Discount

### `ItemFeatureList.StampCounterfeit` — `realCounterfeit`
(no text)

### `ItemFeatureList.StampFakeCounterfeit` — `fakeCounterfeit`
(no text)

### `ItemFeatureList.ReplicaFeature` — `replica`
(no text)

### `ItemFeatureList.CreateModuleFeature` — `module_`
(no text)

### `OperationListUL.FoodDrive` — `ul_food_drive`
> Food Aid Distributed!
> Food Drive
> In a rare gesture of goodwill, Command has distributed rations and food packages across Lower Levels neighborhoods. The initiative eases ten

### `PhoneClientList.CreateTestClient`
> Unknown

### `PhoneClientList.CreateSecPhoneClient`
> Security Phone Operator

### `PhoneClientList.CreateCommissaryPhone`
> Commissary Automated Phone System

### `StartingPerkList.AllPerkDefinitionsWithMods`
(no text)

### `StoreClientDialogList.CreateOutOfBudgetDialogue`
> This is out of my budget.
> This is out of my budget, I got {0} Credits left.

### `StoreClientDialogList.SecurityOnShowLowLevelBad`
> Why would you show that to me?

### `StoreClientListInformation.CreateBeggerInformation` — `beggerInformation`
> Beggar
> Hello, I have information that might interest you
> But it's not for free
> All food market price will crash for a few days afterward
> Good choice
> Listen up,
> word on the street is that
> in 3 days, one of the large Nutrifruit farm is going to harvest.
> That's it, see you around.

### `StoreClientListProcurement.CreateNurseProcurementOffer` — `nurseProcurementOffer`
> Nurse
> Hello, my clinic is in need of blood supply.
> Can you supply 5 Blood Bags in 3 days?
> We are willing to pay 100 credits
> Good.
> See you in 3 days

### `StoreClientListProcurement.CreateMachinistProcurementOffer` — `machinistProcurementOffer`
> Machinist
> Hey there, I'm working on a project and need some supplies.
> Can you get 3 Metal Ingots in 4 days?
> I'll pay 
> Great, I'll be back.
> See you in 4 days.

### `StoreClientListStory.CreateOffDutyOfficerBeer` — `offDutyOfficerStoryBeer`
> Off Duty Officer
> Hey, got any beer?
> I got {0} Credits to spend.

### `StoreClientListStory.CreateLoanClerkEarly` — `loanClerk0`
> Loan Clerk
> Hello, I am from the First Bank on the Upper Levels
> I just want to let you know
> that your building has been listed for sale
> and we might be interested to help you buy it.
> The building is listed at 40000 Credits.
> But with our mortgage, you will be able to afford it sooner
> I will return to give you more detail
> once you have more cash on hand for the down payment.

### `StoreClientListStory.CreateLoanClerk` — `loanClerk1`
> Loan Clerk
> Hello, I am from the First Bank on the Upper Levels
> According to our research,
> you are running a successful business here
> and your landlord has listed your building for sale
> At 40000 Credits.
> We are ready to offer you a mortgage to assist you.
> If you are interested in buying your building.
> Here are the details.
> Take a look.
> Due to the risk of lending money in the Lower Levels
> we require 20% as down payment at 8000 Credits

### `StoreClientListStory.CreateLoanClerk2` — `loanClerk2`
> Loan Clerk
> Hello, I am the loan clerk from the First Bank
> we spoke last week.
> Are you now interested to buy your building
> and take out a mortgage with us?

### `StoreClientListSupplier.CreateThiefLuxurySeller`
(no text)

### `StoreClientListTier.GetRandomT1Client`
(no text)

### `StoreClientListTierWeapon.GetRandomT1WeaponClient`
(no text)

### `StoreClientListTierWeapon.GetRandomT2WeaponClient`
(no text)

### `StoreClientListTierWeapon.GetRandomT3WeaponClient`
(no text)

### `StoreClientListUnused.CreateBilly1` — `billy1`
> Billy
> Sorry, can't help.
> Go get a job.
> Hello, I am Billy
> Can you please spare some food?
> I don't have any money.
> I guess the economy is tough on small business too.
> Thank anyway.
> This is not a charity.
> Fine, I'll be back.
> Thank you!!
> Have a great day!!!

### `StoreClientListUnused.CreateBilly2` — `billy2`
> Billy
> Hello, I am back
> I am here to buy some equipments.
> it's for my new job!
> You got a job?
> It's in security.
> I need a flashlight
> and some kind of weapon.
> If you don't have any,
> I'll find it somewhere else.
> That's good.
> Deal.

### `StoreClientListUnused.CreateBilly3` — `billy3`
> Billy
> Hello, It's me, Billy!
> I got some stuffs for sale.
> Where did you get this?
> It's a bonus from work.
> You gonna take it or what?
> Deal.
> See you around!

### `StoreClientListUnused.CreateBillySecOfficier` — `billy3Officier`
> Security Officer
> Hello merchant.
> We are looking for a suspect,
> who robbed the Upper Level Medbay storage earlier.
> Have you seen anyone suspicious, selling meds?
> Deal.
> See you around!

### `StoreClientListUnused.CreateRevManifesto` — `revManifesto`
> Revolutionary
> Hello friend.
> Does your landlord raise your rent every week?
> You know that the clinics here barely have the essential medicine.
> While the Upper Levels are trying to extend their lifespan.
> We break our backs just to survive, yet somehow, it is never enough.
> This isn't bad luck. It's injustice.
> The MegaCorps are milking us dry.
> Station Command does nothing to help us.
> And Security? They uphold the law, which mean protecting the status quo.
> They have so much, yet they share so little.
> But there are more of us than there are of them. 

### `StoreClientListUnused.CreateAddictTrailer` — `addictGeneralTrailer`
> Addict
> Hey man, do you have anything to take the edge off?
> <i>*SPASM*</i>
> Oxymore, Dream dust, anything.
> I said I want to barter these for drugs
> Do you have some or not?!
> That's the stuff!

### `StoreClientListUnused.CreateTrailerShadyBuyer` — `shadyBuyerStory`
> Shady Buyer
> Hey man, do you have anything to take the edge off?
> <i>*SPASM*</i>
> Oxymore, Dream dust, anything.
> I said I want to barter these for drugs
> Do you have some or not?!
> Excellent

### `StoreClientListUnused.CreateDebugClient` — `debug_client`
> Debug Client
> Hello,

### `StoreClientListUnused.CreateDebugClient2` — `debug_client`
> Debug Client
> Hello,

### `StoreClientListUnused.CreateDebugStamp` — `debug_client`
> Debug Client
> Hello,

### `StoreClientListUnused.CreateButcherClient` — `butcher`
> Butcher

### `StoreClientListUnused.CreateTrailerCodewordClient` — `codewordClientTrailer`
> ???
> The true flower has bloom in the edge of the night.

### `StoreClientListUnused.CreateTrailerGunBuyer` — `gunBuyerTrader`
> Militiaman
> You got guns?
> I need them without serial numbers
> Sorry, Can't help you.

### `StoreClientListUnused.CreateTrailerChemist` — `trailerChemist`
> Lower Levels Chemist
> I just cooked up a new batch.
> You want some?

### `StoreClientListUnused.CreateTrailerWeaponSeller` — `trailerWeaponSeller`
> Lower Levels Dealer
> I got your message.

### `StoreClientListUnused.CreateTrailerCultist` — `cultistTrailer`
> Cultist
> <i>Greeting shopkeeper.</i>
> <i>We require more blood.</i>

### `StoreClientListUnused.CreateTrailerGreytide` — `greytide`
> Lower Levels Citizen
> How much I can get for these?

### `StoreClientListWater.GetRandomWaterSupplier`
(no text)

### `StoreClientUniqueList.GrandpaChengIntro` — `grandpa_cheng_intro`
> Grandpa Cheng
> Ah, new shop in the area. Good.
> Too many people, too few good shops.
> I am Grandpa Cheng, I also run a small store in The Sector.
> I am supposed to get a food shipment from my supplier yesterday,
> but they are late.
> Some of my customers cannot wait. Orphans. Old workers.
> So I would like to buy food from you that I will resell in my store.
> Same price as I always sell them.
> Which means... I will lose money today.
> I can't raise prices, or someone will starve.
> So you got any food?

### `StoreClientUniqueList.GrandpaChengReferral` — `grandpa_cheng_referral`
> Lower Level Citizen
> Hello, Grandpa Cheng sent me here.
> I am looking to buy some meds.
> Grandpa Cheng usually have some expired but still usable meds.
> And his prices are always fair.
> Sometime, he even sell them on credit for people who can't pay.
> Credit! In the Lower Levels! can you believe that?
> But he is out of stock right now.
> So he told me to come to you.

### `StoreClientUniqueList.GrandpaCheng2` — `grandpa_cheng_2`
> Grandpa Cheng
> Hello, it's me.
> My water purifier broke down last night.
> I've had it for many years, it's an old stubborn machine.
> Just like me, I guess.
> My supplier suggested I replace it with a new one.
> He also suggested I should not be the one maintaining it.
> I guess he is telling me to retire.
> I am tired, but my customers depend on me.
> Besides, It's not like I can afford it.
> Anyway, do you have any materials I can use to fix it?

### `StoreClientUniqueList.GrandpaCheng3` — `grandpa_cheng_3`
> Grandpa Cheng
> Hello, it's me. <i>*cough*</i>
> I got some stuff to sell.
> Sometimes people donate things to me, as a way to thank me I guess.
> Someone even left me Luxury Items in my trash can!
> Over time, I accumulated stuffs that won't interest my usual customers.
> Want to take a look? <i>*cough*</i>

### `StoreClientUniqueList.SawyerGrandpaCheng` — `sawyer_grandpa_cheng`
> Sawyer
> Hello, it's Sawyer.
> You know Grandpa Cheng right?
> The old man gave me food when I was a street urchin.
> I would starved if it wasn't for him.
> I heard he has been opening his store late
> and having less stock recently.
> To be honest, I am worried about him.
> Keep an eye on him, will you?

### `StoreClientUniqueList.GrandpaChengIll` — `grandpa_cheng_ill`
> Grandpa Cheng
> Hello, it's me. <i>*cough*</i>
> I got a favor to ask.
> I am diagnosed with an illness.
> It's possible to treat it, but the treatment might kill me at my age.
> So I have decided to forgo treatment.
> I am selling the store and donating my savings to Lower Levels charities.
> I would loved finding someone to take over my store,
> but I doubt anyone would want it with my margins.
> I got some leftover food items, Can you donate them to the food banks for me?

### `StoreClientUniqueList.WildGrandpaCheng` — `wild_grandpa_cheng`
> Joe Wild
> Hello there,
> I got some sad news.
> I believe you know Grandpa Cheng?
> He passed away last night in his sleep.
> He was a good man, a true pillar of the Lower Levels community.
> I got something for you to remember him by.

## Space / raid prototype leftovers (72 classes)

The game grew out of a space-trading prototype. `Space*Trigger` events are still instantiated by reflection (EventTriggerManager is in level1), but they only fire for `GameMaster.current.shipManager.nextPOI` states that need ShipScene/TurnManager, and no scene contains those, so they are dormant. Raid/combat runs only through RaidScene, which is not in any scene either.

| class | base | named by | in scene | first text |
|---|---|---|---|---|
| CombatAI | None | 5 | False |  |
| CombatAIHelper | None | 3 | False |  |
| CombatAbility | None | 13 | False |  |
| CombatAbilityDirectory | Directory<CombatAbility> | 2 | False |  |
| CombatAbilityEffect | TagSystem | 27 | False | DEFAULT EFFECT NAME |
| CombatAbilityEffectDirectory | Directory<CombatAbilityEffect> | 5 | False |  |
| CombatAbilityEffectInstantDirectory | CombatAbilityEffectDirectory | 0 | False |  |
| CombatAbilityEffectPermanentDirectory | CombatAbilityEffectDirectory | 0 | False |  |
| CombatAbilityEffectStandardDirectory | CombatAbilityEffectDirectory | 0 | False |  |
| CombatEndedUIController | MonoBehaviour | 0 | False |  |
| CombatEntity | None | 21 | False |  |
| CombatEntityBuilder | None | 0 | False |  |
| CombatEntityStat | None | 0 | False |  |
| CombatEvent | None | 2 | False |  |
| CombatEventHandler | None | 2 | False |  |
| CombatLog | None | 9 | False |  |
| CombatManager | None | 12 | False |  |
| CombatManagerMono | MonoBehaviour | 1 | False |  |
| CombatMaster | None | 1 | False |  |
| CombatParty | None | 2 | False |  |
| Expedition | None | 5 | False |  |
| ExpeditionAccident | None | 1 | False |  |
| ExpeditionData | None | 1 | False |  |
| ExpeditionHelper | None | 3 | False |  |
| ExpeditionLocation | None | 3 | False |  |
| ExpeditionLocationList | None | 1 | False | Dumping Grounds |
| ExpeditionPoi | None | 3 | False |  |
| ExpeditionPoiList | None | 1 | False | Worthless Junk Pile |
| OverworldPOI | None | 6 | False |  |
| OverworldSpace | OverworldPOI | 30 | False |  |
| OverworldStation | OverworldPOI | 8 | False | Trade Station |
| RaidAnimation | None | 0 | False |  |
| RaidManager | None | 3 | False |  |
| RaidScene | None | 3 | False |  |
| ShipHelper | None | 4 | False |  |
| ShipItemDirectory | ItemDirectory | 0 | True | Sok-27C |
| ShipManager | None | 4 | False |  |
| ShipScene | None | 3 | False |  |
| ShipSystemDirectory | ItemDirectory | 0 | True | Makeshift Storage Bay |
| SpaceAsteroidTrigger | EventTrigger | 0 | False | You have arrived to an large asteroid. |
| SpaceBanditTrigger | EventTrigger | 0 | False | You have arrived near a unmarked military transport ship. |
| SpaceBattleHelper | None | 5 | False |  |
| SpaceBattleTrigger | EventTrigger | 0 | False | You arrive in the middle of a massive space battle. Two fleets are attacking each other. |
| SpaceButcherTrigger | EventTrigger | 0 | False | You arrive near a cargo ship. You are immediatly contacted by a man wearing a stained apron and holding a butcher knife:  |
| SpaceCargoConvoyTrigger | EventTrigger | 0 | False | You arrive near a fleet of cargo ship. You can see ship of all kind and size. Some are armed and armored, other looks barely space worthy. |
| SpaceCargoPodTrigger | EventTrigger | 0 | False | You arrive near some cargo pod. For whatever reason they has been spaced and is drifting indefinetly. |
| SpaceDebrisFieldTrigger | EventTrigger | 0 | False | You have arrived at a large debris field, it seems to be the remains of a massive space battle. Sadly, most of the debris seems to be to sma |
| SpaceDistressSignalFakeTrigger | EventTrigger | 0 | False | You have arrived to the source of the distress signal, an heavily armed pirate ship.  |
| SpaceDistressSignalTrigger | EventTrigger | 0 | False | You have arrived to the source of the distress signal, a small stationary cargo ship.  |
| SpaceDrugShipTrigger | EventTrigger | 0 | False | You arrive at the location of the broadcast. An inconspicuous cargo ship is the origin of the broadcast. |
| SpaceExampleTrigger | EventTrigger | 0 | False |  |
| SpaceFuelTankerTrigger | EventTrigger | 0 | False | You arrive near a large tanker ship transporting exotic fuel. You are immediately contacted by the tanker's captain who seems eager. |
| SpaceGhostShipTrigger | EventTrigger | 0 | False | You have arrived at a small transport ship drifting aimlessly into the space. \r\n        The ship is not responding to your communication a |
| SpaceInvadersText | MonoBehaviour | 0 | True |  |
| SpaceMedicTrigger | EventTrigger | 0 | False | You arrive near a large white ship. |
| SpaceMerchantTrigger | EventTrigger | 0 | False | You arrive at a cargo ship. The captain contacts you and introduce themself as travelling merchant. They sell general supplies and are willi |
| SpaceMiningShipTrigger | EventTrigger | 0 | False | You arrive at a small mining ship. It is equipped with a set of mining drill and behind it a large cargo hold. |
| SpaceNavySupplyTrigger | EventTrigger | 0 | False | You have arrived at a lone autonomous supply ship with the Republic marking. |
| SpaceNutrifruitShopTrigger | EventTrigger | 0 | False | You have arrived at a lone autonomous merchant drone ship with pastel inc.'s logo. The onboard ship AI have contacted you and offer to brows |
| SpaceRefugeeTrigger | EventTrigger | 0 | False | You have arrived to a makeshift ship. They are a group of a spacers banding together trying to survive in the Subspace. |
| SpaceRepairShipTrigger | EventTrigger | 0 | False | You arrive at a large repair ship. Aboard this ship, they have trained personnel and specialised equipments to repair any ship back to worki |
| SpaceSalvageShipTrigger | EventTrigger | 0 | False | You arrive at a small mining ship. It is equipped with cranes and robotic cutters and behind it a large cargo hold. |
| SpaceScalperTrigger | EventTrigger | 0 | False | You arrive at a cargo ship. The captain contacts you and introduce themself as business man. They sell critially needed supplies at a premiu |
| SpaceSpaTrigger | EventTrigger | 0 | False | You have arrived at a leisure ship. \r\nYou are greeted over the comms by an over-friendly attendant whom inform you that they are operating |
| Station | None | 16 | False |  |
| StationFeature | TagSystem | 3 | False | Energy Farm |
| StationGeneration | None | 0 | False | Your dropship arrive to a Davre Food LTD Outpost Station, This station was originally build as a logistic hub to support the company's opera |
| StationMachinerieHelper | None | 1 | False |  |
| StationMachinery | ItemDirectory | 0 | True | Paying Water Fountain |
| TraderStationBlockadeTrigger | EventTrigger | 0 | False |  You have arrived at a space station. |
| TraderStationFreeportTrigger | EventTrigger | 0 | False |  You have arrived at a space station. |
| TraderStationInspectionTrigger | EventTrigger | 0 | False | You have arrived at a space station! |

## Dead classes (79)

`AdvButtonElement`, `AdvancedContentSizeFitter`, `AdvancedHorizontalLayoutGroup`, `AfterhourDebug`, `AnimationUtils`, `AppGemstoneHelper`, `AppNavHelper`, `BetaGenerator`, `BoxMullerGenerator`, `ColoredPixelElement`, `CombatAbilityEffectInstantDirectory`, `CombatAbilityEffectPermanentDirectory`, `CombatAbilityEffectStandardDirectory`, `CombatEndedUIController`, `CombatEntityBuilder`, `CombatEntityStat`, `ConstHelper`, `CorporateSheet`, `CultureBootstrap`, `CustomGameAction`, `DevConsoleStripper`, `DevMode`, `DirectoryCombatAbilityEffect`, `EmporiumScreen`, `EventListThreat`, `EventUnused`, `FactionStatusList`, `GunOrderDebug`, `GunmodPosition`, `HorizontalStackPixelElement`, `HumanCreature`, `IntExtensions`, `ItemCategory`, `ItemGameAction`, `ItemInsertRemoveBehaviour`, `ItemShapeModifier`, `LevelListLoot`, `LocSmartStringDebug`, `LocalObjectEnabler`, `LootDebug`, `MachineMeatCulture`, `MachineryProgressBar`, `MatterConstants`, `ModLog`, `NegociationHelper`, `NewsPaper`, `NpcCharacterItemDirectory`, `PaperDebugCommands`, `PlayerCharacterItemDirectory`, `RaidAnimation`, `SceneSwitcher`, `SchematicCorridor`, `ScratchMaskInit`, `ScrollElement`, `SelectableButtonElement`, `ServiceElement`, `SpriteAnimationManager`, `StandardCombatAbilityDirectory`, `StaticClass`, `StationGeneration`, `StoreClientItem`, `StoreClientListCommand`, `StoreClientListProcurement`, `StoreClientListUnused`, `StoreComputer`, `StoreDate`, `StoreDebugBell`, `StoreLamp`, `StoreNotebook`, `StorePhysical`, `StoreScale`, `StoreUISounds`, `StoryHelper`, `ThingConstants`, `ThingContainer`, `TutorialDebug`, `UIController`, `UnusedDirectory`, `WaterLiquidHelper`

## Orphan art (307 sprites, PNGs in `data/assets/sprites/orphan/`)

- **items/beer_case**: case_front, case, case_back
- **items/itematlas**: ally, nuts, stick_grenade, wrench, smoke_grenade_green
- **items/items_amenities**: lottery_teared
- **items/items_aquaculture**: items_aquaculture_1
- **items/items_broken_machine**: rm_wire_right_upper, rm_reinforced_panel, rm_wire_vertical_lower, rm_machine_medium, rm_screw_set, rm_machine_large, rm_wire_left_lower, broken_alarm_, broken_moisture_farm_, rm_card_swiper_lock, rm_component_background, rm_wire_horizontal, rm_access_panel, rm_background, rm_disarm2, rm_disarm4, rm_screw_base, rm_disarm3, rm_wire_horizontal_right, rm_access_panel_base, broken_furnace_, rm_access_panel_small, rm_card_swiper, rm_wire_right_lower, rm_wire_vertical_upper, rm_access_panel_base_small, rm_anti_tamper, rm_wire_horizontal_left, rm_structural_panel, rm_wire_vertical, rm_disarm1, rm_machine_small, rm_wire_left_upper
- **items/items_construction**: steel_sheet_rough_large
- **items/items_food**: small_water_bottle, peanut_butter_purple, peanut_butter, peanut_butter_orange, water_bottle, small_water_bottle_full, peanut_butter_red, peanut_butter_gray, water_bottle_full, large_water_bottle_full, soda_2l, nutrichips_old, items_food_burger, juice_pouch_old, items_food_bag_of_flour, peanut_butter_blue, water_jug_full, li_eat_snackbar_unpack, bread_loaf
- **items/items_furniture**: safes
- **items/items_husbandry**: rat_xxl_m, rat_xxl_f, rat_xxl_f_d, rat_xxl_m_d
- **items/items_hydroponic_plant**: items_hydroponic_plant_1, dna_disk_green_empty, dna_disk_blue_empty, dna_disk_red_empty, dna_disk_purple_empty, dna_disk_orange_empty, dna_disk_orange_full
- **items/items_medical**: injector_pure_white, healing_bandage, jar_empty, jar_orange, blue_serum, jar_green, jar_pink, medical_pouch, purple_serum, jar_blue
- **items/items_misc**: intel_yellow, intel_red, badge
- **items/items_mod**: rds_view, 10mm_mag_smg_box_view, 10mm_mag_high_view
- **items/items_organ**: example
- **items/items_sec**: handmade_smg
- **items/items_ship**: dumping_ground_pile, water_recycler_empty
- **items/items_sign**: water_off, items_sign_1
- **items/items_tool**: chemforge_r, sci_module, purifier_jug, chemforge_b
- **items/items_weapons_melee**: combat_machete_old, improvised_stunprod, improvised_stunprod_unloaded, fireaxe, improvised_spear, sandal_weapon, long_pipe, fireaxe_big
- **items/items_weapons_ranged_antique**: stanag_10_mod, stanag_20_mod, items_weapons_ranged_antique_2, items_weapons_ranged_antique_4, items_weapons_ranged_antique_3, items_weapons_ranged_antique_0, items_weapons_ranged_antique_1, stanag_30_mod, bullet_nato_556
- **items/water_container3**: normal_red_25, mini_red_50, 25ml_blue_75, large_blue_90, 100ml_blue_25, 25ml_red_75, large_blue_100, small_blue_10, small_red_50, mini_blue_100, large_dark_50, 25ml_dark_25, small_dark_25, large_dark_75, 25ml_dark_10, mini_dark_75, mini_red_100, 100ml_dark_100, normal_blue_25, normal_red_75, 100ml_dark_10, 50ml_red_25, mini_red_10, 50ml_dark_10, mini_dark_10, small_red_10, small_blue_75, 1ml_blue, mini_blue_50, small_blue_25, 50ml_red_100, 100ml_blue_75, normal_dark_50, small_dark_10, 100ml_blue_50, large_dark_10, 100ml_red_75, small_red_75, normal_red_10, 100ml_red_90, large_red_50, mini_blue_90, 50ml_blue_10, normal_dark_10, 25ml_red_10, mini_dark_25, normal_red_50, 100ml_red_100, 25ml_dark_50, 25ml_red_90, 100ml_dark_75, large_blue_10, 25ml_blue_100, mini_dark_100, small_dark_100, large_red_100, 25ml_blue_50, 100ml_blue_10, mini_blue_75, 50ml_blue_90, 25ml_blue_90, large_red_25, 1ml_dark, mini_red_75, 50ml_blue_50, large_blue_25, 50ml_red_50, 50ml_dark_90, 100ml_blue_100, large_dark_100, 100ml_blue_90, normal_blue_100, 50ml_dark_75, large_red_10, 100ml_red_10, 25ml_dark_75, mini_red_25, 25ml_blue_25, 50ml_blue_100, 1ml_red, normal_blue_10, large_dark_25, mini_red_90, small_dark_90, 25ml_red_25, 100ml_dark_90, 25ml_blue_10, normal_blue_90, 50ml_dark_100, normal_dark_25, large_blue_75, small_red_90, normal_blue_50, small_blue_90, normal_blue_75, 50ml_red_75, mini_dark_90, small_dark_75, mini_dark_50, normal_dark_90, 50ml_blue_75, small_blue_100, small_dark_50, large_red_75, 5ml_dark, normal_dark_100, mini_blue_25, large_red_90, 25ml_red_50, 50ml_dark_25, 50ml_blue_25, normal_dark_75, 50ml_red_90, 5ml_blue, large_dark_90, mini_blue_10, large_blue_50, small_red_25, 100ml_dark_25, normal_red_90, 25ml_red_100, small_blue_50, 50ml_dark_50, 25ml_dark_100, 50ml_red_10, normal_red_100, 5ml_red, 100ml_dark_50, small_red_100, 100ml_red_25, 25ml_dark_90, 100ml_red_50
- **items/water_container4**: xl_blue_90, pitcher_blue_90, pitcher_dark_100, pitcher_dark_25, xl_blue_50, xl_blue_75, xl_red_100, xl_dark_100, xl_red_50, pitcher_red_25, xl_dark_10, pitcher_dark_90, xl_dark_25, xl_blue_25, pitcher_red_90, pitcher_red_100, xl_red_90, xl_red_75, pitcher_red_50, pitcher_red_10, xl_dark_90, xl_blue_10, pitcher_blue_100, pitcher_red_75, xl_blue_100, pitcher_dark_10, xl_red_25, pitcher_dark_50, pitcher_blue_10, pitcher_dark_75, xl_dark_75, pitcher_blue_75, xl_red_10, xl_dark_50, pitcher_blue_50, pitcher_blue_25
- **window/background**: highlight_white
- **window/border-export**: border-export
- **window/borderold**: borderOld
- **window/elements_inner**: slider_button, light_cyan, dark_purple, dark_cyan, dark_red, dark_green, screen_dark, light_purple, dark_orange, light_red, light_yellow, dark_yellow, light_orange, light_green, screen_light, slider_background, playd
- **window/elements_outer**: border_outside_top_rounded_new

Sprites belonging to unused items: 97 in `data/assets/sprites/unused_items/`. Runtime-built variants (fill levels, sizes) are in `data/assets/sprites/orphan_variants/`.

## Unused audio (0)



## Strings never named in code (597)

UI/Hint/Tutorial/MainMenu keys are mostly bound by scene components, not code; Dialogue, ClientName, Item, PerkTable and NetworkUpgrade entries are the interesting ones. Full list in `data/unused/strings_not_in_code.json`.

### Dialogue (13)

- `sec_shoot_bad_calling`: I am calling this in!
- `sec_shoot_bad_radio`: <i>*Radio Chatters*</i>
- `sec_shoot_bad_grace_0`: Alright, looks like you got friends in high places.
- `sec_shoot_bad_grace_1`: We will let it slide for this time.
- `sec_shoot_bad_grace_2`: Remember, that gun is only for shooting Augs.
- `dialog_bargain_aug_accept_t1_1`: Sure, that works for me.
- `dialog_bargain_aug_accept_t1_2`: No problem, the price is fine.
- `dialog_bargain_aug_accept_t2_1`: Acceptable. The cost is not important.
- `dialog_bargain_aug_accept_t2_2`: That is fine. Funds are not a concern.
- `dialog_bargain_aug_accept_t3_1`: Price is irrelevant to the objective. Proceeding.
- `dialog_bargain_aug_accept_t3_2`: Cost parameters are not a limiting constraint. Confirmed.
- `dialog_bargain_aug_accept_t4_1`: Resource acquisition takes priority over price. This unit accepts.
- `dialog_bargain_aug_accept_t4_2`: Monetary value is meaningless. The transaction will complete.

### ClientName (2)

- `name_security_inspector_corpo`: Corporate Security Inspector
- `location_dumping_grounds`: Dumping Grounds

### Item (1)

- `item_sign_water_desc`: A neon sign that, when placed in the Display Case, will attract customers willing to sell Water.

### PhoneDialogue (1)

- `odin`: Odin Haraldsson

### Interactable (3)

- `vending_fountain_tooltip`: Water Vending Machine
- `vending_machine_tooltip`: Vending Machine
- `door_agoraphobia`: You can't leave the store due to your agoraphobia!

### NetworkUpgrade (1)

- `network_subtitle_Permit`: Permit

