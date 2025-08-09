# Product Requirements Document: Tank O

## 1. Introduction

**Tank O** is a top-down tank game focusing on diverse gameplay, a rich tank system, and high player interaction. The game aims to provide a quick and enjoyable experience for players looking for short bursts of entertainment, while also offering competitive modes for skill demonstration.

---

## 2. Product Goals

* Provide a unique and engaging top-down tank game.
* Attract players through diverse gameplay (PvP, PvE, creative modes).
* Foster a sense of connection between players and their unique tanks.
* Ensure a smooth, low-latency gaming experience.
* Build an active and creative player community.

---

## 3. Core Game Modes

### 3.1. Multiplayer Modes

* **Team Deathmatch (Chaos):**
    * Multiple players engage in continuous combat.
    * Objective: Achieve the highest number of eliminations within a time limit.
* **Battle Royale:**
    * Players compete to be the last one standing.
    * Playable area shrinks over time (zone mechanic).
* **Capture the Flag:**
    * Objective: The team that captures the opponent's flag and returns it to their base the most times wins.
* **Team Up PvE (Adventure Mode):**
    * Players cooperate to progress through pre-designed or randomly combined map segments.
    * Completing a segment can unlock a new tank type and save it to the session.
    * After each match, a summary board is displayed with options to share/create an account.
    * **Target Audience:** Players seeking quick entertainment, playing with friends.
* **Team Up PvP (5v5):**
    * Two teams of five players directly compete on a map.

### 3.2. Single Player Modes

* **Training:**
    * Approximately 10 basic levels to help players familiarize themselves with shooting and skill mechanics of various tanks.
    * Option to add bots for practice.

### 3.3. Creative Mode (Future Expansion)

* **Map/Mission Creation:** Allow players to design their own maps and missions.
* **New Tank Creation:** Enable players to create new tank types with unique characteristics.
* **Community Sharing:** A platform for players to share and rate each other's creations.

---

## 4. Tank System

### 4.1. Tank Classes

The game will feature various tank types, categorized into 4 main classes:
* **Damage Dealer:** Specializes in inflicting high damage.
* **Supporter:** Assists teammates (healing, buffs).
* **Tanker:** Absorbs damage, protects teammates.
* **All-rounder:** Flexible, combining aspects of different roles.

### 4.2. Tank Stats

Each tank will have specific stats:
* **HP (Health Points):** Amount of health a tank has.
* **Def (Defense):** Ability to reduce incoming damage.
* **Atk (Attack Damage):** Damage dealt by basic attacks.
* **Spell (Ability Power):** Damage dealt by skills.
* **Speed:** Movement speed of the tank.

### 4.3. Skill System

Each tank will have:
* **2 Normal Skills (Skill 1, Skill 2):** With cooldown timers.
* **1 Ultimate Skill:** Usable only in boss rooms, and all skill cooldowns will be refreshed upon entering a boss room.

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

## New Tank Brainstorming Ideas

### New Damage Dealer Tanks

* **Artillery Tank (The "Long Shot")**
    * **Concept:** Excels at long-range bombardment and area denial. Slow but devastating.
    * **Skill 1: Mortar Barrage:** Fires a volley of shells at a targeted area, dealing splash damage after a short delay.
    * **Skill 2: Incendiary Round:** Loads a special round that leaves a burning patch on impact, damaging enemies over time.
    * **Ultimate: Orbital Strike:** Calls down a massive, high-damage orbital strike on a large targeted area after a significant delay. Only usable in boss rooms to clear adds or severely damage the boss.
* **Flamethrower Tank (The "Inferno")**
    * **Concept:** Close-range, sustained area damage with burning effects.
    * **Skill 1: Napalm Spray:** Shoots a continuous cone of fire in front, dealing damage and applying a burn.
    * **Skill 2: Fuel Burst:** Overloads its fuel lines, causing a short-range explosion around the tank, damaging and pushing back enemies.
    * **Ultimate: Firestorm:** Unleashes a torrent of fire that creates a large, persistent fiery zone around the tank for several seconds, dealing continuous damage to anything inside. Great for boss encounters with multiple close-range targets.
* **Sniper Tank (The "Marksman")**
    * **Concept:** High single-target damage from extreme range, but vulnerable up close. Requires precision.
    * **Skill 1: Piercing Shot:** Fires a high-velocity projectile that deals massive damage to the first enemy hit and minor damage to enemies in a line behind it.
    * **Skill 2: Optical Camouflage:** Briefly cloaks the tank, making it invisible and boosting its next basic attack's damage. Breaking camouflage with an attack reveals the tank.
    * **Ultimate: Critical Lock-On:** Locks onto a single target, revealing its weak points and allowing the Sniper Tank to fire an unmissable, extremely high-damage shot that ignores a portion of the target's defense. Perfect for finishing off bosses.

### New Supporter Tanks

* **Repair Tank (The "Mechanic")**
    * **Concept:** Focuses on single-target, direct healing, and defensive buffs.
    * **Skill 1: Rapid Repair:** Instantly restores a significant amount of HP to a single targeted allied tank.
    * **Skill 2: Overcharge Shield:** Places a temporary, strong shield on an allied tank that absorbs a large amount of damage.
    * **Ultimate: Emergency Protocol:** Selects an area. All allied tanks within that area gain massive HP regeneration and damage reduction for a short duration. Crucial for surviving boss's burst phases.
* **Disruption Tank (The "Saboteur")**
    * **Concept:** Debuffs enemies, controls the battlefield, and weakens boss mechanics.
    * **Skill 1: EMP Pulse:** Fires a pulse that briefly disables enemy skills (silence) or slows their attack speed in a small area.
    * **Skill 2: Turret Jammer:** Places a small device that reduces the damage output or accuracy of nearby enemy turrets/minions.
    * **Ultimate: System Overload:** Targets the boss, significantly reducing its attack damage and defense for a duration, or temporarily disabling a boss mechanic (e.g., stopping a damaging aura).

### New Tanker Tanks

* **Juggernaut Tank (The "Wall")**
    * **Concept:** Immobile but incredibly tough, designed to soak up massive damage and protect a specific area.
    * **Skill 1: Entrench:** Roots the tank in place, drastically increasing its defense but making it unable to move. Can be canceled.
    * **Skill 2: Taunt Protocol:** Forces all nearby enemies to attack the Juggernaut for a few seconds.
    * **Ultimate: Immovable Object:** Becomes completely invulnerable to all damage and crowd control for a short duration, allowing it to stand strong against powerful boss attacks or clear pathways for allies.
* **Spike Tank (The "Thorn")**
    * **Concept:** Damages enemies that attack it, and can create defensive barriers.
    * **Skill 1: Spiked Plating:** Activates a temporary buff that reflects a percentage of incoming damage back to attackers.
    * **Skill 2: Barricade Drop:** Deploys a small, destructible barrier that blocks projectiles and movement.
    * **Ultimate: Retribution Aura:** Emits a powerful aura for a duration, causing all enemies within range to take continuous damage and become slowed if they attack the Spike Tank. Good for punishing aggressive bosses.

### New All-rounder Tanks

* **Harvester Tank (The "Scavenger")**
    * **Concept:** Gains strength by collecting resources or defeating enemies, becoming more powerful over time in a match.
    * **Skill 1: Resource Vacuum:** Pulls all nearby dropped items or currency towards the tank.
    * **Skill 2: Adaptive Plating:** Temporarily gains bonus defense based on the number of enemies recently defeated or items collected.
    * **Ultimate: Assimilate Core:** Consumes a defeated elite enemy or a large resource node (in boss room) to gain a massive, permanent (for that match) boost to all stats.
* **Teleport Tank (The "Blink")**
    * **Concept:** High mobility and surprise attacks, but squishy.
    * **Skill 1: Short Warp:** Teleports the tank a short distance in the direction it's facing.
    * **Skill 2: Decoy Drop:** Leaves behind an illusionary copy of the tank that explodes after a few seconds or when destroyed, damaging nearby enemies.
    * **Ultimate: Dimensional Rift:** Creates a rift that allows the tank and all nearby allies to instantly teleport to a targeted, visible location on the map (within limits). Perfect for flanking bosses or rapid redeployments in PvE/PvP.

### Unique/Niche Tanks

* **Gravity Tank (The "Vortex")**
    * **Concept:** Manipulates gravity to control enemy movement and projectiles.
    * **Skill 1: Gravitational Pull:** Creates a small field that pulls enemies towards its center.
    * **Skill 2: Anti-Gravity Field:** Creates a zone where enemy projectiles are significantly slowed or deflected.
    * **Ultimate: Black Hole Singularity:** Creates a powerful singularity that violently pulls all enemies in a large radius towards its center, dealing massive damage and holding them in place for a short duration. Devastating in boss rooms with many smaller enemies or for setting up massive damage combos.
* **Swarm Tank (The "Hive")**
    * **Concept:** Summons smaller robotic drones to assist in combat.
    * **Skill 1: Mini-Drone Deploy:** Deploys 2-3 small, weak drones that auto-attack nearby enemies. Drones have a limited lifespan.
    * **Skill 2: Drone Swarm:** Orders all active drones to focus fire on a single target, increasing their attack speed.
    * **Ultimate: Replicating Drones:** Deploys a larger, more resilient drone that continuously spawns smaller attack drones for a duration. The ultimate drone can also self-destruct for large area damage.

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

## 5. Maps and Items

* **Maps:** Pre-designed or available as templates, with each match randomly combining these segments.
* **Items:**
    * Collectable items scattered across maps.
    * When collected, an option to equip it on oneself or a teammate.
    * The system will suggest which tank type should equip the item.
    * If a player insists on equipping an unsuitable item, a "public taunt" notification will appear.

---

## 6. User Experience and Interface

### 6.1. User Interface

* **Detailed Tank Screen:** Displays stats, skill descriptions.
* **Summary Board:** After a boss fight, displays damage dealt summary and commends top players, with sharing options.
* **Room Creation Screen:** Allows selection of game mode and displays rewards/unlocked tanks if "Team Up PvE" is chosen.
* **Notifications:** The boss room entrance is hidden; once found by a player, a notification will appear for everyone in the lobby.

### 6.2. Control System

* **Mobile:** Left-side movement joystick (similar to Wild Rift), right-side skill buttons.
* **PC:** (TBD) Needs a well-designed keybind layout.

### 6.3. Player Experience

* **No Immediate Login Required:** New players can click to play without creating an account.
* **Account Creation Incentive:** After completing a match and receiving rewards/upgrades, an option to create an account (1-click with Google/Facebook, possibly importing Facebook avatar) will appear, creating a sense of "loss" and encouraging registration.
* **Lag/Disconnection Handling:** If a player lags, the game will attempt to reconnect and reappear at an average position near teammates with their pre-lag status, avoiding a complete restart.
* **Boss Room Waiting Area:**
    * A "ready zone" near the boss room entrance (prominent but dangerous).
    * If all players enter the ready zone, the boss fight starts immediately.
    * Otherwise, a 50-second countdown begins. After the countdown, the system automatically teleports all players in the waiting area into the boss room.
    * Players who haven't entered will repeat the process.
    * Latecomers will spawn later, and the boss will regenerate some health if all preceding players have died.

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