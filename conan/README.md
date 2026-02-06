# Conan: The Hyborian Age - Foundry VTT System

A complete implementation of the Conan: The Hyborian Age tabletop roleplaying game for Foundry Virtual Tabletop.

## Features

### Character Types
- **Player Characters**: Full featured characters with stats, skills, spells, and equipment
- **Minions**: Simple enemies with threshold-based damage system
- **Antagonists**: Powerful foes with life points and special abilities

### Core Mechanics
- **Four Stats**: Might, Edge, Grit, and Wits with configurable dice
- **Flex Die System**: Triggers special effects on maximum rolls
  - Gain Stamina
  - Auto-succeed on failures
  - Massive Damage on damage rolls
- **Stamina Points**: Spend for tactical advantages
- **Life Points & Recovery**: Track health and use recoveries to heal
- **Defense System**: Physical and Sorcery defenses with bonuses
- **Winds of Fate**: Rolling a 1 always fails (unless modified)

### Combat
- **Attack Rolls**: Melee, Ranged, and Thrown weapons
- **Damage Rolls**: Weapon damage with Might bonuses for melee/thrown
- **Armor Rating**: Reduces incoming damage
- **Minion Thresholds**: One-hit kills or wound system
- **Initiative**: Edge-based initiative with bonuses

### Items
- **Weapons**: Multiple types with range, damage, and properties
- **Armor**: Light, Medium, and Shields with AR and stipulations
- **Skills**: Character abilities with stamina costs
- **Spells**: Sorcery with disciplines, costs, and effects
- **Gear**: Equipment and supplies

### Modern Foundry V12 Features
- Built on ActorSheetV2 and ItemSheetV2
- Action-based button handling
- Modular template system
- Handlebars helpers for calculations
- Drag-and-drop item management
- Rich text editors for descriptions

## Installation

1. In Foundry VTT, go to the "Game Systems" tab
2. Click "Install System"
3. Paste the manifest URL: [Your manifest URL here]
4. Click "Install"

## Usage

### Creating Characters
1. Create a new Actor
2. Choose "Character" type
3. Set stats and dice values
4. Add weapons, armor, skills, and spells
5. Configure origin and bonuses

### Rolling Checks
- Click any stat name to roll a check
- Choose modifiers using the Rule of Three (-3 to +3)
- Flex die rolls automatically
- Results show in chat with success/failure

### Combat
- Roll attacks from weapons
- Roll damage after successful hits
- Apply damage using the damage control button
- Track stamina and life points

### Stamina Usage
- Extra Move Action: 1 Stamina
- +1 to Stat Die: 1 Stamina (+2 for 2 Stamina)
- +1D4 Damage: 1 Stamina (+2D4 for 2 Stamina)
- Increase Range: 1 Stamina
- Massive Damage: Final Stamina Point

## Credits

Based on "Conan: The Hyborian Age" by Monolith Board Games
System implementation for Foundry VTT

## License

This system is provided as-is for use with Foundry Virtual Tabletop.
Conan and related materials are property of their respective owners.

## Version

1.0.0 - Initial Release

## Compatibility

- Foundry VTT Version 12.331+
- Tested on Foundry V12

## Support

For issues, suggestions, or contributions, please visit [your repository URL]
