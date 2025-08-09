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

* **Supporter Tank:**
    * **Ultimate:** Revive 1 fallen teammate.
    * **Skill 1:** Area-of-effect heal within X tiles.
    * **Passive Skill:** Increases damage for teammates within X tiles.
* **Tanker Tank:**
    * **Skill 1:** Creates a shield blocking all damage from one direction (similar to Braum but larger).
    * **Skill 2:** Increases defensive stats.
    * **(Ultimate currently TBD)**
* **All-rounder Tank:**
    * Basic attacks replaced by wind vortexes.
* **Mage Tank:**
    * No ultimate skill.
    * **Skill 1, 2, 3:** Deal medium damage with fire, water, and ice respectively.
    * **Stats:** High Spell (e.g., 9*/10*).
* **Demolition Tank:**
    * Only 1 unique skill: "Demolish," dealing extremely high damage to a single area, but with no cooldown.
* **Spy Tank:**
    * **Stats:** High speed, low damage.
    * **Skill:** Related to invisibility/stealth.
* **Radar Scout Tank:**
    * Ability to detect items and reveal invisible tanks.
* **Ice Tank:**
    * All attacks or abilities apply a slow effect.

### 4.4. Tank Naming and Details

* Each tank will have a specific name closely related to its class and characteristics to help players easily visualize and feel connected.
* A detailed tank screen will display clear stats and skill descriptions for each tank.

### 4.5. In-Match Tank Progression System

* Each tank will only level up **within a single match**. The purpose is to minimize the gap between veteran and new players, focusing on individual skill.
* In-match upgrades will provide minor advantages; overall success depends on player skill.
* **TBD:** Specific mechanics of in-match upgrades.

---

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