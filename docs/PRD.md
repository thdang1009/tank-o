# Product Requirements Document: Tank O

## 1. Introduction

**Tank O** is a top-down tank game focusing on diverse gameplay, a rich tank system, and high player interaction. The game aims to provide a quick and enjoyable experience for players looking for short bursts of entertainment, while also offering competitive modes for skill demonstration.

### Current Development Status (Updated: August 2025)
**Implementation Progress: ~65% Complete**

**✅ COMPLETED FEATURES:**
- Core gameplay mechanics with 9 fully functional tank classes
- Advanced skill system with 3 skills per tank (27 unique skills total)
- Solo/Training mode with AI enemies
- Professional Angular + Phaser architecture
- Basic multiplayer infrastructure
- High-quality visuals and sound system

**🚧 IN PROGRESS:**
- Real-time multiplayer synchronization
- Advanced game modes (Battle Royale, Team Deathmatch)
- Map system expansion

**📋 PLANNED:**
- Item collection and progression systems
- Social features and achievements  
- Creative mode tools
- Mobile platform support

---

## 2. Product Goals

* Provide a unique and engaging top-down tank game.
* Attract players through diverse gameplay (PvP, PvE, creative modes).
* Foster a sense of connection between players and their unique tanks.
* Ensure a smooth, low-latency gaming experience.
* Build an active and creative player community.

---

## 3. Core Game Modes

### 3.1. Multiplayer Modes 🚧 **IN PROGRESS**

**🔧 Current Status:** Basic multiplayer infrastructure exists with lobby system, but real-time synchronization needs completion.

* **Team Deathmatch (Chaos):** 📋 **PLANNED**
    * Multiple players engage in continuous combat.
    * Objective: Achieve the highest number of eliminations within a time limit.
* **Battle Royale:** 📋 **PLANNED**
    * Players compete to be the last one standing.
    * Playable area shrinks over time (zone mechanic).
* **Capture the Flag:** 📋 **PLANNED**
    * Objective: The team that captures the opponent's flag and returns it to their base the most times wins.
* **Team Up PvE (Adventure Mode):** 📋 **PLANNED**
    * Players cooperate to progress through pre-designed or randomly combined map segments.
    * Completing a segment can unlock a new tank type and save it to the session.
    * After each match, a summary board is displayed with options to share/create an account.
    * **Target Audience:** Players seeking quick entertainment, playing with friends.
* **Team Up PvP (5v5):** 📋 **PLANNED**
    * Two teams of five players directly compete on a map.

### 3.2. Single Player Modes ✅ **IMPLEMENTED**

* **Training/Solo Mode:** ✅ **WORKING**
    * Complete solo gameplay with AI enemies
    * All tank skills functional in practice environment
    * Map selection (Grass, Sand, Mixed terrains)
    * Enemy spawning and combat system
    * **Status:** Fully playable and polished

### 3.3. Creative Mode 📋 **PLANNED** (Future Expansion)

* **Map/Mission Creation:** Allow players to design their own maps and missions.
* **New Tank Creation:** Enable players to create new tank types with unique characteristics.
* **Community Sharing:** A platform for players to share and rate each other's creations.

---

## 4. Tank System

### 4.1. Tank Classes ✅ **IMPLEMENTED**

The game features 9 distinct tank types with unique abilities and playstyles:

**✅ CURRENT TANK ROSTER (All Fully Implemented):**

1. **Bruiser** (Tanker Role)
   - *High HP and defense. Excels at absorbing damage and protecting allies.*
   - **Skills:** Shield Wall, Shockwave Slam, Fortress Mode
   
2. **Damage Dealer** (DPS Role) 
   - *High attack and speed. Specializes in quickly eliminating enemies.*
   - **Skills:** Rapid Fire, Precision Shot, Bullet Storm
   
3. **Supporter** (Support Role)
   - *Healing and utility focus. Keeps team alive and provides buffs.*
   - **Skills:** Heal Pulse, Shield Boost, Mass Resurrection
   
4. **Versatile** (All-rounder Role)
   - *Balanced stats with adaptable playstyle for any situation.*
   - **Skills:** Adaptive Combat, Tactical Strike, Overcharge
   
5. **Mage** (Spell Caster Role)
   - *High spell power with devastating magical abilities.*
   - **Skills:** Fireball, Lightning Bolt, Meteor
   
6. **Spy** (Stealth Role) 
   - *Fast and sneaky with enhanced reconnaissance abilities.*
   - **Skills:** Cloak, Smoke Bomb, Assassination
   
7. **Demolition** (Heavy Artillery Role)
   - *Heavy artillery specialist with explosive ordnance.*
   - **Skills:** Carpet Bomb, Mine Field, Nuclear Strike
   
8. **Radar Scout** (Reconnaissance Role)
   - *Fast reconnaissance tank with enhanced detection capabilities.*
   - **Skills:** Radar Sweep, EMP Blast, Orbital Strike
   
9. **Ice Tank (Blizzard)** (Crowd Control Role)
   - *Master of ice magic with slowing attacks and area control abilities.*
   - **Skills:** Frost Nova, Ice Wall, Absolute Zero

**Role Categories:**
* **Damage Dealers:** Damage Dealer, Mage, Demolition, Spy
* **Supporters:** Supporter, Radar Scout  
* **Tankers:** Bruiser, Ice Tank (Blizzard)
* **All-rounders:** Versatile

### 4.2. Tank Stats ✅ **IMPLEMENTED**

Each tank has specific balanced stats optimized for their role:
* **HP (Health Points):** Amount of health a tank has (ranges: 80-120)
* **Def (Defense):** Ability to reduce incoming damage (ranges: 2-8) 
* **Atk (Attack Damage):** Damage dealt by basic attacks (ranges: 15-25)
* **Spell (Ability Power):** Damage dealt by skills (ranges: 3-9)
* **Speed:** Movement speed of the tank (ranges: 100-160)

**Example Stat Distributions:**
- **Bruiser:** HP:120, Def:8, Atk:15, Spell:3, Speed:100 (Tank focus)
- **Dealer:** HP:80, Def:2, Atk:25, Spell:5, Speed:140 (DPS focus)
- **Mage:** HP:90, Def:3, Atk:18, Spell:9, Speed:120 (Spell focus)

### 4.3. Skill System ✅ **IMPLEMENTED**

Each tank has a complete skill system:
* **Skill 1 (Q Key):** Primary active ability with cooldown (3-8 seconds)
* **Skill 2 (E Key):** Secondary active ability with cooldown (5-12 seconds)  
* **Ultimate (R Key):** Powerful ability with long cooldown (15-30 seconds)

**✅ CURRENT IMPLEMENTATION STATUS:**
- **27 Unique Skills:** All 9 tanks × 3 skills fully implemented
- **Visual Effects:** Particle systems, screen effects, tank transformations
- **Audio Integration:** Skill-specific sound effects and audio cues
- **UI Integration:** Cooldown timers, hover descriptions, activation indicators
- **Balance System:** Tested cooldowns and damage values

**Note:** Ultimate skills are currently usable anywhere (not restricted to boss rooms as originally planned)

**Examples of Tank Types and Skills:**

# Tank Types and Skills

## Existing Tank Examples

* **Supporter Tank:**
    * **Ultimate:** Revive 1 fallen teammate.
    * **Skill 1:** Area-of-effect heal within X tiles.
    * **Passive Skill:** Increases damage for teammates within X tiles.
* **Tanker Tank:**
    * **Skill 1:** Creates a shield blocking all damage from one direction (similar to Braum but larger).
    * **Skill 2:** Increases defensive stats.
    * **Ultimate:** (Currently TBD - *Idea: Invulnerable Fortress: Becomes completely invulnerable for a short duration, drawing all enemy aggro.*)
* **All-rounder Tank (Wind Vortex):**
    * **Skill 1:** Basic attacks replaced by wind vortexes that deal damage in a small area.
    * **Skill 2:** Gust: Unleashes a short-range burst of wind that pushes enemies back.
    * **Ultimate:** Cyclone Field: Creates a large, swirling vortex that pulls in and continuously damages enemies within its radius for a short period.
* **Mage Tank (Elementalist):**
    * *No ultimate skill.*
    * **Skill 1:** Fireball: Launches a projectile that explodes on impact, dealing fire damage.
    * **Skill 2:** Ice Shard: Fires a projectile that deals ice damage and briefly slows the target.
    * **Skill 3 (Primary Attack/Core Ability):** Water Jet: A continuous stream of water that deals consistent damage.
    * **Stats:** High Spell (e.g., 9*/10*).
* **Demolition Tank (Bomber):**
    * *Only 1 unique active skill.*
    * **Skill 1 (Unique):** Demolish: Deals extremely high damage to a single targeted area with no cooldown (but potentially a resource cost or long cast time).
    * **Passive:** Explosive Aftermath: Destroyed environmental objects or enemy tanks leave behind small explosive remnants.
    * **Ultimate:** Carpet Bomb: Calls down a series of devastating explosions across a wide linear path.
* **Spy Tank (Infiltrator):**
    * **Stats:** High speed, low damage.
    * **Skill 1:** Cloak: Briefly enters stealth, becoming invisible to enemies. Moving or attacking breaks stealth.
    * **Skill 2:** Smoke Bomb: Throws a smoke bomb that creates a cloud, obscuring vision for enemies and breaking projectile targeting.
    * **Ultimate:** Sabotage: Instantly teleports to a targeted enemy tank or boss, applying a debuff that temporarily reduces their attack and defense, then allows the Spy Tank to escape quickly.
* **Radar Scout Tank (Pathfinder):**
    * **Skill 1:** Scan Pulse: Emits a pulse that reveals hidden items, traps, and invisible tanks in a wide radius.
    * **Skill 2:** Recon Drone: Deploys a small, temporary drone that reveals a small area of the map, including enemy positions, for a short duration.
    * **Ultimate:** Global Intel: Provides a brief, real-time minimap overlay of all enemy tanks and objectives across the entire current map for all allies.
* **Ice Tank (Blizzard):**
    * **Passive:** All attacks or abilities apply a slow effect.
    * **Skill 1:** Frost Nova: Emits a burst of icy energy around the tank, damaging and heavily slowing all nearby enemies.
    * **Skill 2:** Ice Wall: Summons a destructible wall of ice that blocks movement and projectiles for a short time.
    * **Ultimate:** Absolute Zero: Creates a massive frozen zone that constantly damages and roots (stops movement completely) all enemies caught within it for a duration.

---

# Shaped Tank Ideas with Additional Concepts

Here are the previously brainstormed tanks, fleshed out with more details and three additional ideas for each type, providing a wider range of combat roles and playstyles.

---

## New Damage Dealer Tanks

* **Artillery Tank (The "Long Shot")**
    * **Concept:** Excels at long-range bombardment and area denial. Slow but devastating. Relies on prediction and positioning.
    * **Skill 1: Mortar Barrage:** Fires a volley of shells at a targeted area, dealing splash damage after a short delay. Effective for hitting clustered enemies or objectives.
    * **Skill 2: Incendiary Round:** Loads a special round that leaves a burning patch on impact, damaging enemies over time and creating a zone of control.
    * **Ultimate: Orbital Strike:** Calls down a massive, high-damage orbital strike on a large targeted area after a significant delay. Only usable in boss rooms to clear adds, heavily damage the boss, or force positional changes.
    * **New Ideas:**
        * **Siege Tank (The "Bulwark Blast"):** *Concept:* Trades mobility for extreme burst damage from a fixed position. Skill 1: **Anchor Down** (roots tank, greatly increases damage output and defense). Skill 2: **Concussive Blast** (fires a high-impact shell that stuns enemies in a small area). Ultimate: **Annihilation Protocol** (fires a single, incredibly powerful, slow-moving projectile that explodes on impact, dealing colossal damage in a wide radius).
        * **Chain Lightning Tank (The "Arc Discharge"):** *Concept:* Deals damage that chains between multiple enemies, excellent for groups. Skill 1: **Arc Shot** (basic attack arcs to up to 3 additional nearby enemies). Skill 2: **Overload Pulse** (emits a short-range pulse that applies a debuff, causing enemies to take increased damage from electrical attacks). Ultimate: **Thunderstorm** (creates a localized electrical storm that continuously damages and chains lightning between all enemies within a large area).
        * **Corrosion Tank (The "Acid Spitter"):** *Concept:* Applies debuffs that degrade enemy armor and deal damage over time. Skill 1: **Acid Stream** (fires a continuous stream of corrosive liquid that applies stacks of "Corroded" debuff, reducing enemy defense). Skill 2: **Toxic Cloud** (deploys a lingering cloud of toxic gas that damages and slows enemies who enter it). Ultimate: **Meltdown** (targets a single enemy or boss, rapidly applying massive stacks of "Corroded" and dealing heavy burst damage as their armor disintegrates).

* **Flamethrower Tank (The "Inferno")**
    * **Concept:** Close-range, sustained area damage with burning effects. Excels in confined spaces or against swarms of enemies.
    * **Skill 1: Napalm Spray:** Shoots a continuous cone of fire in front, dealing damage and applying a persistent burn effect.
    * **Skill 2: Fuel Burst:** Overloads its fuel lines, causing a short-range explosion around the tank, damaging and pushing back enemies, creating space.
    * **Ultimate: Firestorm:** Unleashes a torrent of fire that creates a large, persistent fiery zone around the tank for several seconds, dealing continuous damage to anything inside. Great for boss encounters with multiple close-range targets or for denying specific areas.
    * **New Ideas:**
        * **Sonic Tank (The "Resonator"):** *Concept:* Uses sound waves to damage enemies and manipulate their movement. Skill 1: **Shockwave Burst** (emits a directional cone of sound that damages and slightly pushes back enemies). Skill 2: **Vibration Pulse** (places a small field that causes enemies inside to move erratically or miss attacks). Ultimate: **Harmonic Collapse** (emits a high-frequency resonance that deals massive damage to all enemies in a large radius, with greater damage closer to the tank).
        * **Drill Tank (The "Tunnel Terror"):** *Concept:* Melee-oriented, able to quickly traverse terrain and disrupt enemy formations. Skill 1: **Burrow Charge** (briefly burrows underground, becoming untargetable and moving quickly, surfacing to damage enemies). Skill 2: **Rubble Toss** (flings a cluster of debris in a small arc, dealing damage and creating temporary rough terrain). Ultimate: **Earthquake Slam** (emerges from underground with a powerful slam, damaging and knocking up all nearby enemies, leaving a crater that slows movement).
        * **Bio-Toxin Tank (The "Plague Spreader"):** *Concept:* Inflicts debilitating poisons and debuffs on multiple enemies. Skill 1: **Toxic Goo** (fires a blob of goo that explodes, applying a stacking poison debuff over time to enemies in an area). Skill 2: **Spore Cloud** (releases a cloud of spores that blinds enemies, reducing their accuracy and vision range). Ultimate: **Epidemic Outbreak** (unleashes a potent airborne toxin, rapidly spreading a high-damage, long-duration poison to all enemies in a wide radius, which can then spread between affected enemies).

* **Sniper Tank (The "Marksman")**
    * **Concept:** High single-target damage from extreme range, but vulnerable up close. Requires precision and good line of sight.
    * **Skill 1: Piercing Shot:** Fires a high-velocity projectile that deals massive damage to the first enemy hit and minor damage to enemies in a line behind it.
    * **Skill 2: Optical Camouflage:** Briefly cloaks the tank, making it invisible and boosting its next basic attack's damage significantly. Breaking camouflage with an attack reveals the tank.
    * **Ultimate: Critical Lock-On:** Locks onto a single target, revealing its weak points and allowing the Sniper Tank to fire an unmissable, extremely high-damage shot that ignores a portion of the target's defense. Perfect for finishing off bosses or eliminating high-priority targets.
    * **New Ideas:**
        * **Brawler Tank (The "Iron Fist"):** *Concept:* Close-range, high single-target burst damage using powerful melee attacks. Skill 1: **Rocket Punch** (launches a powerful, short-range projectile that deals heavy damage and knocks back a single enemy). Skill 2: **Adrenaline Rush** (temporarily increases attack speed and movement speed for a short duration). Ultimate: **Berserker Rage** (enters a frenzied state, gaining massive damage and life steal from basic attacks for a duration, but becomes rooted or slowed).
        * **Laser Tank (The "Beamweaver"):** *Concept:* Deals continuous, focused damage in a straight line, capable of melting targets. Skill 1: **Precision Beam** (fires a narrow, continuous laser beam that deals damage to the first target hit). Skill 2: **Heat Sink Vent** (releases accumulated heat, damaging enemies in a cone behind the tank and reducing its own cooldowns). Ultimate: **Disintegration Ray** (channels a powerful, wide laser beam that sweeps across a large area, dealing extreme damage to all enemies caught in its path).
        * **Phase Tank (The "Ghost Striker"):** *Concept:* Deals damage by briefly becoming intangible, bypassing defenses and position. Skill 1: **Phase Shift** (becomes briefly intangible, moving through enemies and projectiles, dealing minor damage upon reappearing). Skill 2: **Shadow Strike** (dashes a short distance through an enemy, dealing damage and applying a temporary defense reduction). Ultimate: **Void Anomaly** (creates a temporary portal that allows the tank to fire basic attacks or skills from a safe distance through the portal, making it immune to damage for a short period).

---

## New Supporter Tanks

* **Repair Tank (The "Mechanic")**
    * **Concept:** Focuses on single-target, direct healing, and defensive buffs for allies.
    * **Skill 1: Rapid Repair:** Instantly restores a significant amount of HP to a single targeted allied tank.
    * **Skill 2: Overcharge Shield:** Places a temporary, strong shield on an allied tank that absorbs a large amount of damage, preventing bursts.
    * **Ultimate: Emergency Protocol:** Selects an area. All allied tanks within that area gain massive HP regeneration and damage reduction for a short duration. Crucial for surviving boss's burst phases or turning the tide of a team fight.
    * **New Ideas:**
        * **Buff Tank (The "Field Commander"):** *Concept:* Enhances allies' offensive capabilities and provides crowd control immunity. Skill 1: **Morale Boost** (grants a temporary increase to an allied tank's attack damage and attack speed). Skill 2: **Defiance Aura** (creates a small aura around the tank that grants allies within it temporary immunity to crowd control effects). Ultimate: **Strategic Relay** (selects a target ally; that ally's basic attacks and skills deal bonus damage and have reduced cooldowns for a duration, becoming a focal point of attack).
        * **Barrier Tank (The "Guardian"):** *Concept:* Creates impassable barriers and protective zones to control engagement range and shield allies. Skill 1: **Force Field Projector** (deploys a temporary, stationary force field that blocks all enemy projectiles). Skill 2: **Safeguard Drone** (sends out a drone that attaches to an ally, absorbing a small amount of damage for them before expiring). Ultimate: **Divine Wall** (summons a massive, impenetrable energy wall that spans across the map, blocking all movement and projectiles for a significant duration, splitting the battlefield).
        * **Resource Tank (The "Logistics Expert"):** *Concept:* Provides allies with resources, ammo, or short-term buffs. Skill 1: **Ammunition Drop** (drops a pack that instantly refills an ally's primary weapon ammo or grants bonus charges for certain skills). Skill 2: **Energy Surge** (restores a small amount of ultimate charge or skill cooldown for a targeted ally). Ultimate: **Supply Line** (creates a persistent link between the Logistics Expert and nearby allies, causing them to rapidly regenerate health, energy, and reduced cooldowns as long as they remain in range).

* **Disruption Tank (The "Saboteur")**
    * **Concept:** Debuffs enemies, controls the battlefield, and weakens boss mechanics or key targets.
    * **Skill 1: EMP Pulse:** Fires a pulse that briefly disables enemy skills (silence) or slows their attack speed in a small area, disrupting their offensive.
    * **Skill 2: Turret Jammer:** Places a small device that reduces the damage output or accuracy of nearby enemy turrets/minions, making areas safer to push.
    * **Ultimate: System Overload:** Targets the boss, significantly reducing its attack damage and defense for a duration, or temporarily disabling a boss mechanic (e.g., stopping a damaging aura, preventing a dangerous attack channel). This is crucial for mitigating boss threats.
    * **New Ideas:**
        * **Trap Tank (The "Ambush Master"):** *Concept:* Sets up hidden traps and mines to control enemy movement and initiate engagements. Skill 1: **Proximity Mine** (places a hidden mine that explodes when an enemy gets close, dealing damage and slowing). Skill 2: **Net Launcher** (fires a net that briefly roots a single enemy in place). Ultimate: **Minefield Deployment** (rapidly deploys a large field of mines in a targeted area, creating a hazardous zone for enemies, ideal for boss approach routes or chokepoints).
        * **Pacifier Tank (The "Tranquilizer"):** *Concept:* Focuses on crowd control and rendering enemies harmless without directly damaging them. Skill 1: **Sleep Dart** (fires a dart that puts a single enemy to sleep for a short duration, making them untargetable but waking them on damage). Skill 2: **Calm Aura** (emits an aura that disarms enemies within range, preventing them from using basic attacks for a brief period). Ultimate: **Mass Tranquilize** (releases a widespread gas that puts all non-boss enemies in a large area to sleep for an extended duration, allowing allies to focus on the boss or escape).
        * **Hex Tank (The "Curse Weaver"):** *Concept:* Applies powerful, long-lasting debuffs to enemies, making them vulnerable. Skill 1: **Weakening Curse** (curses a single enemy, reducing their overall damage output). Skill 2: **Vulnerability Hex** (applies a hex to an area, causing enemies within to take increased damage from all sources). Ultimate: **Doom Mark** (marks a single boss or powerful enemy, causing them to take massively increased damage from all sources for a short duration, making them extremely susceptible to burst damage from allies).

---

## New Tanker Tanks

* **Juggernaut Tank (The "Wall")**
    * **Concept:** Immobile but incredibly tough, designed to soak up massive damage and protect a specific area. Ideal for holding choke points or tanking boss hits.
    * **Skill 1: Entrench:** Roots the tank in place, drastically increasing its defense and regeneration but making it unable to move. Can be canceled to regain mobility.
    * **Skill 2: Taunt Protocol:** Forces all nearby enemies to attack the Juggernaut for a few seconds, drawing aggro away from squishier allies.
    * **Ultimate: Immovable Object:** Becomes completely invulnerable to all damage and crowd control for a short duration, allowing it to stand strong against powerful boss attacks, clear hazardous pathways for allies, or block projectiles.
    * **New Ideas:**
        * **Fortress Tank (The "Citadel"):** *Concept:* Creates temporary defensive structures for area control and cover. Skill 1: **Deployable Cover** (summons a small, destructible wall that provides cover and blocks projectiles). Skill 2: **Sentry Turret** (deploys a small, automated turret that attacks nearby enemies). Ultimate: **Defensive Bastion** (transforms into a stationary, highly fortified structure, gaining massive defense and providing a damage reduction aura to nearby allies, while firing a powerful primary weapon).
        * **Reflector Tank (The "Mirror Shield"):** *Concept:* Absorbs damage and redirects it back to attackers or uses it to empower itself. Skill 1: **Kinetic Absorption** (activates a shield that absorbs a percentage of incoming damage, storing it as energy). Skill 2: **Energy Discharge** (releases stored energy in a burst, dealing damage to nearby enemies based on absorbed damage). Ultimate: **Retribution Field** (creates a large field around the tank where a high percentage of all damage taken by allies within the field is redirected back to the attackers).
        * **Wrestler Tank (The "Grappler"):** *Concept:* Engages enemies in melee, grappling and repositioning them. Skill 1: **Grapple Hook** (fires a hook that pulls a single enemy to melee range, briefly stunning them). Skill 2: **Body Slam** (dashes forward a short distance, damaging and knocking down enemies in its path). Ultimate: **Pile Driver** (grapples a single target enemy or boss, lifts them up, and slams them into the ground, dealing massive damage and knocking up all enemies in a small radius around the impact point).

* **Spike Tank (The "Thorn")**
    * **Concept:** Damages enemies that attack it, and can create defensive barriers. Punishes aggressive enemies.
    * **Skill 1: Spiked Plating:** Activates a temporary buff that reflects a percentage of incoming damage back to attackers.
    * **Skill 2: Barricade Drop:** Deploys a small, destructible barrier that blocks projectiles and movement, creating temporary cover or chokepoints.
    * **Ultimate: Retribution Aura:** Emits a powerful aura for a duration, causing all enemies within range to take continuous damage and become slowed if they attack the Spike Tank. Good for punishing aggressive bosses or controlling a contested area.
    * **New Ideas:**
        * **Void Tank (The "Nullifier"):** *Concept:* Creates zones of anti-matter that negate enemy abilities and projectiles. Skill 1: **Null Field** (deploys a small, stationary field that absorbs enemy projectiles). Skill 2: **Ability Dampener** (fires a slow-moving projectile that creates a zone where enemy skill cooldowns are significantly increased). Ultimate: **Existential Rift** (opens a large, temporary rift that pulls enemies towards its center and prevents them from using any skills for its duration).
        * **Crystal Tank (The "Gemstone Guard"):** *Concept:* Generates crystalline structures for defense and crowd control. Skill 1: **Crystal Spikes** (summons sharp crystal spikes from the ground, damaging and briefly snaring enemies in a line). Skill 2: **Prismatic Shield** (activates a personal shield that absorbs damage and, upon breaking, explodes into damaging crystal shards). Ultimate: **Crystalline Aegis** (summons a massive, shimmering crystal that provides invulnerability to all allies hiding behind it for a short duration, but the crystal itself can be destroyed).
        * **Bio-Absorber Tank (The "Symbiote"):** *Concept:* Gains strength and healing by leeching from enemies or consuming fallen foes. Skill 1: **Life Drain** (sends out a short-range tendril that drains HP from a single enemy over time, healing the tank). Skill 2: **Bio-Barrier** (consumes a defeated enemy's remains to gain a temporary health shield). Ultimate: **Parasitic Overload** (attaches to a single boss or elite enemy, continuously draining their HP and granting the Tanker and nearby allies significant healing and a damage boost for the duration).

---

## New All-rounder Tanks

* **Harvester Tank (The "Scavenger")**
    * **Concept:** Gains strength by collecting resources or defeating enemies, becoming more powerful over time in a match. Encourages active engagement and resource management.
    * **Skill 1: Resource Vacuum:** Pulls all nearby dropped items or currency towards the tank, streamlining collection.
    * **Skill 2: Adaptive Plating:** Temporarily gains bonus defense based on the number of enemies recently defeated or items collected, rewarding aggression.
    * **Ultimate: Assimilate Core:** Consumes a defeated elite enemy or a large resource node (in boss room) to gain a massive, permanent (for that match) boost to all stats, making it a late-game powerhouse.
    * **New Ideas:**
        * **Transformer Tank (The "Chameleon"):** *Concept:* Can temporarily switch between two distinct forms, offering tactical flexibility. Skill 1: **Mode Shift: Assault** (transforms into a damage-focused mode, gaining bonus attack damage but reduced defense). Skill 2: **Mode Shift: Defense** (transforms into a defense-focused mode, gaining bonus defense and regeneration but reduced damage). Ultimate: **Apex Form** (transforms into a hybrid, highly empowered form, gaining bonuses to all stats and enhanced basic attacks for a duration).
        * **Orbital Control Tank (The "Satellite"):** *Concept:* Utilizes satellite-based abilities for both offense and support, controlling larger areas. Skill 1: **Targeting Beacon** (marks an enemy, causing them to take slightly increased damage from all sources for a short time). Skill 2: **Relay Boost** (designates an area; allies within gain a minor speed boost). Ultimate: **Global Scan & Strike** (reveals all enemies on the map for a short duration, then calls down a series of small, damaging bombardments across random enemy locations).
        * **Elemental Shifter Tank (The "Conduit"):** *Concept:* Can rapidly switch its elemental damage type and apply varied effects. Skill 1: **Shift Element: Fire** (changes basic attacks to fire damage, applying burn). Skill 2: **Shift Element: Ice** (changes basic attacks to ice damage, applying slow). Ultimate: **Elemental Burst** (unleashes a devastating explosion of all three elemental types (fire, ice, lightning), dealing massive damage and applying corresponding debuffs to all enemies in a large area).

* **Teleport Tank (The "Blink")**
    * **Concept:** High mobility and surprise attacks, but squishy. Excels at hit-and-run tactics and flanking.
    * **Skill 1: Short Warp:** Teleports the tank a short distance in the direction it's facing, useful for dodging or repositioning.
    * **Skill 2: Decoy Drop:** Leaves behind an illusionary copy of the tank that explodes after a few seconds or when destroyed, damaging nearby enemies, creating a distraction.
    * **Ultimate: Dimensional Rift:** Creates a rift that allows the tank and all nearby allies to instantly teleport to a targeted, visible location on the map (within limits). Perfect for flanking bosses, rapid redeployments in PvE/PvP, or emergency escapes.
    * **New Ideas:**
        * **Overdrive Tank (The "Velocity"):** *Concept:* Focuses on extreme bursts of speed and quick, impactful attacks. Skill 1: **Nitro Boost** (greatly increases movement speed for a short duration, leaving a damaging trail). Skill 2: **Momentum Strike** (dashes a short distance, dealing damage to enemies hit based on the tank's current speed). Ultimate: **Time Warp** (slows down time for all enemies in a large radius, while the tank moves at greatly increased speed, allowing for rapid attacks and repositioning).
        * **Blink Striker (The "Assassin"):** *Concept:* Utilizes rapid, short-range teleportation to engage and disengage quickly, focusing on single-target burst. Skill 1: **Phase Stab** (teleports a very short distance directly behind an enemy, dealing bonus damage to their rear armor). Skill 2: **Smoke Vanish** (instantly disappears in a puff of smoke, becoming untargetable and leaving behind an enemy-disorienting cloud). Ultimate: **Execution Warp** (rapidly teleports between multiple marked enemies, dealing high damage to each, prioritizing low-health targets, before returning to the starting position).
        * **Omni-Adapt Tank (The "Synthesizer"):** *Concept:* Can temporarily mimic the basic abilities of nearby allied or enemy tanks, offering unmatched versatility. Skill 1: **Mimic Ability** (targets a nearby tank, temporarily gaining access to their Skill 1). Skill 2: **Adaptive Shell** (gains a temporary bonus to its lowest stat based on the dominant tank class of nearby allies/enemies). Ultimate: **Paradigm Shift** (for a duration, gains access to the Skill 1 and Skill 2 of a nearby ally and a nearby enemy, allowing for complex tactical combinations).

---

## Unique/Niche Tanks

* **Gravity Tank (The "Vortex")**
    * **Concept:** Manipulates gravity to control enemy movement and projectiles, creating tactical zones.
    * **Skill 1: Gravitational Pull:** Creates a small field that pulls enemies towards its center, grouping them up for allies or pulling them off objectives.
    * **Skill 2: Anti-Gravity Field:** Creates a zone where enemy projectiles are significantly slowed or deflected, providing temporary defensive cover.
    * **Ultimate: Black Hole Singularity:** Creates a powerful singularity that violently pulls all enemies in a large radius towards its center, dealing massive damage and holding them in place for a short duration. Devastating in boss rooms with many smaller enemies or for setting up massive damage combos.
    * **New Ideas:**
        * **Time Manipulator Tank (The "Chronomancer"):** *Concept:* Alters the flow of time for enemies and allies. Skill 1: **Temporal Slow** (fires a projectile that creates a zone, slowing enemy movement and attack speed). Skill 2: **Haste Field** (creates a small zone that speeds up allied movement and skill cooldowns). Ultimate: **Rewind Cascade** (briefly rewinds all allies within a large area to their position and health from a few seconds ago, negating recent damage or repositioning errors).
        * **Illusion Tank (The "Phantom"):** *Concept:* Creates deceptive illusions and misdirection to confuse enemies. Skill 1: **Decoy Mirage** (creates a stationary, temporary illusion of the tank that draws enemy fire). Skill 2: **Vision Blur** (sends out a wave that briefly distorts the vision of enemies caught in it, causing them to see false targets or obscured paths). Ultimate: **Grand Illusion** (creates multiple moving illusions of the tank, each taking damage like the real tank, making it nearly impossible for enemies to target the real one for a short duration).
        * **Magnetic Tank (The "Polarizer"):** *Concept:* Manipulates magnetic forces to pull/push metal objects and disarm enemies. Skill 1: **Magnetic Pull** (emits a pulse that pulls metallic enemies or dropped items towards the tank). Skill 2: **EMP Disarm** (fires a projectile that disarms enemies, forcing them to drop their primary weapons for a short time). Ultimate: **Magnetic Flux** (creates a powerful magnetic field that continuously pulls enemies towards a central point while simultaneously pushing away incoming projectiles, creating a deadly vortex).

* **Swarm Tank (The "Hive")**
    * **Concept:** Summons smaller robotic drones to assist in combat, providing continuous pressure and distraction.
    * **Skill 1: Mini-Drone Deploy:** Deploys 2-3 small, weak drones that auto-attack nearby enemies. Drones have a limited lifespan.
    * **Skill 2: Drone Swarm:** Orders all active drones to focus fire on a single target, increasing their attack speed and coordinating damage.
    * **Ultimate: Replicating Drones:** Deploys a larger, more resilient drone that continuously spawns smaller attack drones for a duration. The ultimate drone can also self-destruct for large area damage upon expiring or being manually triggered.
    * **New Ideas:**
        * **Engineer Tank (The "Constructor"):** *Concept:* Deploys various automated turrets and defensive structures. Skill 1: **Auto-Turret Deploy** (places a small, stationary turret that fires at nearby enemies). Skill 2: **Barrier Emitter** (deploys a short-lived energy barrier that blocks projectiles). Ultimate: **Defensive Network** (deploys multiple powerful turrets and connects them with energy beams that damage enemies passing through, creating a fortified zone).
        * **Parasite Tank (The "Leech"):** *Concept:* Attaches to enemies, draining their health/resources and converting them into buffs for itself or allies. Skill 1: **Adhesive Mine** (launches a sticky mine that attaches to an enemy, draining a small amount of their health over time). Skill 2: **Resource Siphon** (targets a defeated enemy or resource node, rapidly extracting its essence to gain a temporary buff or heal). Ultimate: **Host Infestation** (attaches to a single boss or elite enemy, continuously draining its health and applying a stacking debuff, while empowering the Parasite Tank and nearby allies with bonuses based on the drained health).
        * **Artificer Tank (The "Inventor"):** *Concept:* Can dynamically combine and adapt its abilities by creating temporary, unique constructs. Skill 1: **Module Forge: Offense** (creates a temporary offensive module that enhances basic attacks). Skill 2: **Module Forge: Defense** (creates a temporary defensive module that provides a small shield). Ultimate: **Omni-Construct** (combines all active modules and a new special module into a powerful, temporary autonomous combat vehicle that fights alongside the Artificer, firing enhanced attacks and providing a defensive aura).

### 4.4. Tank Naming and Details

* Each tank will have a specific name closely related to its class and characteristics to help players easily visualize and feel connected.
* A detailed tank screen will display clear stats and skill descriptions for each tank.

### 4.5. In-Match Tank Progression System

* Each tank will only level up **within a single match**. The purpose is to minimize the gap between veteran and new players, focusing on individual skill.
* In-match upgrades will provide minor advantages; overall success depends on player skill.
* **TBD:** Specific mechanics of in-match upgrades.
---

## 4.6. Collection and Custom Tank System Mechanics

This system empowers players to personalize their tanks, offering strategic depth and unique gameplay experiences. It balances creative freedom with competitive fairness, ensuring that skill remains paramount.

---

### 4.6.1. Core Customization Components

Players will collect and apply various components to customize their tanks. Each component will belong to a specific category and have a **Point Cost** and one or more **Affinity Tags**.

* **Ability Slots (Up to 3):**
    * These slots allow players to equip active or passive skills that augment their tank's base capabilities.
    * Examples: `Rapid Reload` (passive, reduces cooldowns), `Emergency Boost` (active, short speed burst), `Armor Coating` (passive, temporary defense buff after taking damage).
    * Each ability has its own **Point Cost**.
* **Weapon Modifiers (1 Slot):**
    * These alter the tank's basic attack behavior, offering tactical variety.
    * Examples: `Piercing Rounds` (basic attacks ignore a portion of enemy defense), `Ricochet Shot` (basic attacks bounce to a nearby enemy), `Shrapnel Blast` (basic attacks deal minor splash damage).
    * Each modifier has a **Point Cost**.
* **Defensive Modules (1 Slot):**
    * These enhance a tank's survivability or crowd control resistance.
    * Examples: `Auto-Repair Field` (slow, continuous HP regen), `Reactive Shield` (brief shield upon taking heavy damage), `Stability Dampeners` (reduces duration of crowd control effects).
    * Each module has a **Point Cost**.
* **Utility Gadgets (1 Slot):**
    * These provide non-combat advantages or unique tactical options.
    * Examples: `Scavenger Drone` (automatically picks up nearby items), `Smoke Emitter` (drops a smoke screen behind the tank while moving), `Grappling Hook` (pulls the tank a short distance to terrain or an enemy).
    * Each gadget has a **Point Cost**.

---

### 4.6.2. Customization Points and Budget

* **Customization Budget:** Each player will have a fixed **Customization Point Budget** (e.g., 20 points, TBD based on balancing) available per tank loadout. This budget is allocated per match or per persistent loadout, preventing excessively strong builds.
* **Point Cost:** Every component (ability, weapon modifier, defensive module, utility gadget) has an assigned **Point Cost** reflecting its power, cooldown, and utility. More impactful components naturally cost more points.
* **Budget Enforcement:** The system strictly enforces the total Customization Points a player can spend. Players cannot exceed their budget, requiring strategic choices.

---

### 4.6.3. Affinity System: Rewarding Synergies, Preventing Overlaps

The **Affinity System** is a core mechanic for balancing customization, preventing overpowered "stacking," and encouraging diverse, thematic builds. Each component will have one or more **Affinity Tags** (e.g., `[Fire]`, `[Ice]`, `[Support]`, `[Defense]`, `[Mobility]`, `[Area_Control]`, `[Single_Target]`, `[Explosive]`, `[Stealth]`).

* **Affinity Bonuses (Positive Synergies):**
    * Equipping multiple components with the **same Affinity Tag** (e.g., two `[Fire]` abilities and a `[Fire]` weapon modifier) will grant a small, cumulative bonus to effects related to that Affinity.
    * **Tiered Bonuses:** These bonuses could be tiered. For example:
        * **2x `[Fire]` Affinity:** +5% Fire Damage.
        * **3x `[Fire]` Affinity:** +10% Fire Damage, -5% Fire Skill Cooldown.
        * **4x `[Fire]` Affinity:** +15% Fire Damage, -10% Fire Skill Cooldown, enemies hit by Fire skills suffer a minor damage-over-time burn.
    * This rewards players for building thematically cohesive and synergistic tank loadouts, making "elemental" or "role-focused" builds feel more potent.
* **Affinity Overload Penalties (Negative Stacking Prevention):**
    * Attempting to equip components that lead to an **excessive concentration of a single, powerful Affinity** beyond a certain threshold will incur a **Point Cost penalty** for subsequent components of that Affinity.
    * For example:
        * If a player selects a third `[High_Damage]` ability, its **Point Cost** might increase by 50%.
        * A fourth `[High_Damage]` component might cost double its usual points, or even become unavailable if the budget cannot cover it.
    * This dynamically increases the cost of hyper-specialized "glass cannon" or "invincible fortress" builds, forcing players to diversify or pay a significant premium in customization points. It prevents players from simply stacking the highest damage or defense components without trade-offs.
* **Class Affinity (Inherent Bias):**
    * Each base **Tank Class** (Damage Dealer, Supporter, Tanker, All-Rounder) has an **inherent, unchangeable Affinity bias**. This bias influences how efficiently they use certain components.
    * For example:
        * A **Tanker Class** might receive a **10-15% Point Cost discount** on `[Defense]`-tagged components, making it more efficient for them to build defensively. They are inherently better at utilizing defensive tools.
        * A **Supporter Class** might have a **5-10% increased effectiveness** for `[Support]` or `[Healing]` components, making their healing spells stronger or buffs last longer.
        * Conversely, equipping components that severely clash with a tank's base class affinity (e.g., a pure Damage Dealer trying to heavily invest in `[Support]` skills) might incur a **slight Point Cost penalty** (e.g., +10-20% cost for misaligned components) or provide reduced effectiveness for those skills (e.g., a healing spell on a Damage Dealer might heal for 80% of its normal value). This encourages players to complement their chosen tank's strengths rather than trying to negate them entirely.

---

### 4.6.4. Collection and Unlock System

* **Achievements:** Specific skills/components are unlocked by completing challenges, such as:
    * **Mastery Challenges:** Defeat X enemies with a specific tank, heal Y health, or absorb Z damage.
    * **Boss Takedowns:** Unlock unique components after defeating specific bosses or boss variations.
    * **Exploration Milestones:** Discover hidden areas or complete side objectives on maps.
* **Random Drops (Non-Monetary):** Components can drop as rewards after completing matches (PvE or PvP), from loot crates earned through gameplay (no real-money purchases for crates), or found as secrets on maps. Drop rates will be tuned to be fair and rewarding, not frustrating.
* **Blueprint Fragments:** Some rare or powerful components may require collecting multiple "blueprint fragments" from various sources (e.g., boss drops, rare event rewards) before they can be assembled and unlocked. This adds a longer-term progression goal.
* **Component Shards:** Duplicate components or less desired ones can be "dismantled" into Component Shards, which can then be used to craft specific desired components, offering a deterministic path for unlocks.

---

### 4.6.5. Tank Loadouts and Management

* **Loadout Slots:** Players will have multiple customizable loadout slots per tank, allowing them to save different builds for various game modes or tactical situations (e.g., a "PvE Boss DPS" build, a "PvP Control" build, an "Exploration" build).
* **Preview System:** A clear and intuitive UI will show the total points spent, remaining budget, and any active Affinity bonuses or penalties *in real-time* as players build their loadouts. This provides immediate feedback.
* **Sharing Loadouts:** Players can easily share their custom tank loadouts with friends or the community, fostering build discussions, theory-crafting, and meta-discovery. This can be done via unique share codes or direct in-game sharing.

---

### 4.6.6. Custom Match Challenges with Custom Tanks

The Customizable Tank System directly fuels new challenging gameplay modes, leveraging player creativity:

* **Solo Gauntlet/Challenges:** Players use their custom-built tanks to tackle specific solo objectives, timed runs, or unique boss encounters, competing on leaderboards for bragging rights and rewards.
* **Player-Created Custom Duels/Team Fights (1v1, 2v2, 3v3):** Players can create private rooms, set up custom match rules (e.g., specific map, no ultimate skills, higher point budget), and challenge others to face their unique tank builds. This promotes competitive innovation and allows players to truly test their creations against others in a controlled environment. Leaderboards for these custom challenges could also be implemented.

---

## 4.7. Customizable Skill/Ability System

To enhance player agency and strategic depth, Tank O will feature a customizable skill and ability system, allowing players to tailor their tanks beyond fixed archetypes.

* **Skill Unlocks:** A diverse list of individual skills and abilities (e.g., specific buffs, debuffs, small utility spells, unique basic attack modifiers) will be unlockable. These unlocks can occur through:
    * **Achievements:** Completing specific in-game challenges, milestones, or mastery tasks with different tank types.
    * **Random Drops (No Pay-to-Win):** Receiving skill components or full skills as random drops from completing matches, defeating bosses, or exploring maps. This ensures fair access without requiring real-money purchases.
* **Customization Points:** Players will have a limited pool of **Customization Points** (e.g., 10 or 20, exact value TBD) to allocate to their chosen skills and abilities. Each skill/ability will have a specific point cost, varying based on its power and utility.
* **Balance Restrictions:** The system will incorporate restrictions to prevent "super strong and over-point" combinations. This could include:
    * **Point Caps:** Strict enforcement of the total Customization Points a player can spend.
    * **Interdependency Rules:** Certain skills might have prerequisites or be mutually exclusive with others.
    * **Class-Specific Restrictions:** Some skills might only be equippable by certain tank classes (e.g., a powerful healing skill only available to Supporters).
    * **Automated Validation:** The game will automatically validate custom loadouts to ensure they adhere to balance rules before a match begins.
* **Custom Match Challenges:** This customization system will enable new challenge modes:
    * **Solo Challenges:** Players can use their custom-built tanks to tackle specific solo objectives or boss fights, competing for high scores.
    * **Player-Created Challenges:** Players can create custom match rooms (e.g., 1v1, 2v2, 3v3) and challenge others to face their unique tank builds. This fosters community interaction and competitive innovation.

---

## 5. Maps and Items

### 5.1. Maps 🚧 **PARTIAL**

* **Current Implementation:** 
    * Basic MapManager with 3 terrain types (Grass, Sand, Mixed)
    * Simple tile-based map generation with obstacle placement
    * World boundary collision detection
* **Missing Features:**
    * Pre-designed map segments and random combination
    * Dynamic obstacles and destructible environments
    * Boss rooms and special areas

### 5.2. Items 📋 **NOT IMPLEMENTED**

* **Planned Features:**
    * Collectable items scattered across maps
    * Equipment system for tanks and teammates  
    * Smart item suggestion system based on tank type
    * Social interaction through "public taunt" notifications for mismatched items
* **Current Status:** No item collection or equipment system exists

---

## 6. User Experience and Interface

### 6.1. User Interface 🚧 **PARTIAL**

* **✅ Implemented:**
    * Tank class selection screen with visual previews
    * In-game HUD with health, skills, cooldown timers
    * Main menu and scene navigation system
    * Skill hover descriptions and activation indicators
* **📋 Missing:**
    * Detailed tank stat screens
    * Post-match summary boards and damage statistics  
    * Room creation/lobby screens for multiplayer
    * Achievement and progression UI
    * Boss room notifications and entrance systems

### 6.2. Control System 🚧 **PARTIAL**

* **PC Controls:** ✅ **IMPLEMENTED**
    * **Movement:** WASD or Arrow Keys
    * **Skills:** Q (Skill 1), E (Skill 2), R (Ultimate)  
    * **Shooting:** Space bar for basic attacks
    * **Status:** Fully responsive and polished
* **Mobile Controls:** 📋 **NOT IMPLEMENTED**
    * Left-side movement joystick planned
    * Right-side skill buttons planned

### 6.3. Player Experience 🚧 **PARTIAL**

* **✅ Current Features:**
    * No login required - instant play capability
    * Smooth scene transitions and game flow
    * Intuitive tank selection process
* **📋 Missing Features:**
    * Account creation and social login integration
    * Lag/disconnection handling and reconnection systems
    * Boss room mechanics and waiting areas
    * Achievement notifications and reward systems

---

## 7. Graphics and Sound

* **Graphics:**
    * High-quality 3D or 2D graphics with beautiful special effects.
    * Diverse and detailed maps with varied environments.
* **Sound:**
    * Realistic sound effects for explosions, gunfire, and tank movement.
    * Appropriate background music to enhance drama and emotion.

---

## 8. Enhanced Experience Elements

* **Interactive Environment:** Allows destruction of structures, creating explosions, and using the environment for cover/attack.
* **Realistic Physics System:** Authentic physics effects for explosions, collisions, and tank movement. Physics can be used for unique tactics (pushing enemies back, destroying structures).
* **Random Events:** Bomb rains, sandstorms, special enemy appearances. Creates unique challenges and rewards.
* **Secrets and Hidden Rewards:** Hidden within maps, side quests, and hidden challenges to encourage exploration.

---

## 9. Backend and Technical System

### 9.1. Backend Requirements

* A backend is required to store player data, tank status, progress, achievements, etc.
* DDoS protection.
* Private source code.

### 9.2. Player Data Storage

* Utilize local storage with 2 layers of security:
    * **Decipherable Hash:** To decrypt data.
    * **Signature:** To ensure the data body hasn't been tampered with.
* No login required; each game session will save and use a hash in local storage.

### 9.3. Performance Handling

* Learn to handle bullet trajectories efficiently.
* Learn to handle many objects simultaneously in a practical manner.

### 9.4. Infrastructure

* The game will be hosted on the same domain as **dangtrinh.site/game/tank-o**.
* Nginx will be used for micro-frontend implementation of this section.
* **dangtrinh.site/game** will be a game list, starting with only one item: Tank O.

### 9.5. Donation System and Server Expansion

* Optimize and solicit server donations.
* Initial goal is to serve a maximum of 100 concurrent players.
* Display a message "Donate to expand server to 100x" with real-time donation status updates.
* New servers will be added immediately upon reaching X donation amount.
* Provide Momo phone number and bank account details for donations.
    * 
    * 

---

## 10. Achievement and Social System

* **Leveling System Replaced by Tank Mastery:** Each tank type will record the player's best performance.
* **Role-Based Evaluation:** Different evaluations based on tank roles (e.g., Tankers judged on damage absorption, Supporters on healing).
* **Personal Titles:** Players can choose which title to display on their personal profile.
* **Friend System:** Ability to add friends and see online teammates.

---

## 11. Unresolved Issues / To Be Determined

* How to prevent boss exploitation.
* Details of the in-match tank upgrade system.
* Specific PC control scheme design.
* Tanker's ultimate skill.