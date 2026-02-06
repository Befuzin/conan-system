# Conan System Developer Guide

## Architecture Overview

This system is built using Foundry VTT V12's modern architecture with the following structure:

### Core Files

```
conan-system/
├── system.json           # System manifest
├── template.json         # Data model definitions
├── scripts/
│   ├── conan.mjs        # Main initialization
│   ├── config.mjs       # Configuration constants
│   ├── documents/
│   │   ├── actor.mjs    # ConanActor class
│   │   └── item.mjs     # ConanItem class
│   └── sheets/
│       ├── actor-sheet.mjs  # ConanActorSheet (V12)
│       └── item-sheet.mjs   # ConanItemSheet (V12)
├── templates/
│   ├── actor/
│   │   ├── header.hbs
│   │   ├── stats.hbs
│   │   ├── combat.hbs
│   │   ├── skills.hbs
│   │   ├── equipment.hbs
│   │   ├── spells.hbs
│   │   └── biography.hbs
│   ├── item/
│   │   ├── header.hbs
│   │   ├── details.hbs
│   │   └── description.hbs
│   └── chat/
│       ├── stat-check.hbs
│       ├── attack-roll.hbs
│       └── damage-roll.hbs
├── styles/
│   └── conan.css
└── lang/
    └── en.json
```

## Key Features

### 1. Modern V12 Architecture

**ActorSheetV2 & ItemSheetV2**
- Uses the new application V2 system
- Modular PARTS system for templates
- Action-based event handling

```javascript
static DEFAULT_OPTIONS = {
  actions: {
    rollStat: this._onRollStat,
    rollAttack: this._onRollAttack,
    // ... more actions
  }
};
```

### 2. Data Model (template.json)

**Actor Types:**
- `character`: Player characters with full features
- `minion`: Simple enemies with threshold system
- `antagonist`: Powerful enemies with life points

**Item Types:**
- `weapon`: Combat weapons
- `armor`: Protective equipment
- `skill`: Character abilities
- `spell`: Sorcery
- `gear`: General equipment

### 3. Core Mechanics

**Stat System**
- Four stats: Might, Edge, Grit, Wits
- Each has a value (1-8) and die (d6-d12)
- Checks: roll stat die + stat value + modifiers

**Flex Die**
- Separate die that triggers on max roll
- Three uses: Gain Stamina, Auto-succeed, Massive Damage
- Players choose which benefit to take

**Stamina Points**
- Maximum equals Grit value
- Spend for tactical advantages
- Resets at start of each Tale

**Combat**
- Attack: stat die + stat value vs Defense
- Damage: weapon die + Might (for melee/thrown)
- AR reduces damage (minimum 1)

**Minions**
- Use Threshold instead of Life Points
- First hit wounds, second hit (or threshold damage) kills
- Simpler for GM to manage

### 4. Rolling System

All rolls follow this pattern:
1. Determine stat and build formula
2. Roll stat die
3. Roll flex die (if PC)
4. Check for critical failure (1 on stat die)
5. Check for flex trigger (max on flex die)
6. Render chat card with results

Example from actor.mjs:
```javascript
async rollStat(statKey, options = {}) {
  const stat = this.system.stats[statKey];
  const modifier = options.modifier ?? await this._promptForModifier();
  
  const formula = `${stat.die} + ${stat.value} + ${modifier}`;
  const roll = new Roll(formula, this.getRollData());
  await roll.evaluate();
  
  // Flex die for PCs
  const flexRoll = new Roll(this.system.flex.die);
  await flexRoll.evaluate();
  
  // Check for triggers...
}
```

### 5. Action Handlers

Using V12's action system:

**In Template:**
```html
<button data-action="rollStat" data-stat="might">Roll Might</button>
```

**In Sheet:**
```javascript
static async _onRollStat(event, target) {
  const stat = target.dataset.stat;
  await this.actor.rollStat(stat);
}
```

### 6. Handlebars Helpers

Custom helpers registered in conan.mjs:
- `add`, `subtract`, `multiply`, `divide`: Math operations
- `getMaxDie`: Extract max value from die string
- `lt`, `gt`: Comparisons
- `times`: Loop helper
- `numberFormat`: Format with sign
- `select`: Dropdown selection
- `concat`: String concatenation

### 7. Chat Cards

Each roll type has a dedicated template:
- `stat-check.hbs`: Stat checks
- `attack-roll.hbs`: Attack rolls
- `damage-roll.hbs`: Damage rolls

Cards show:
- Actor image and name
- Roll total and formula
- Flex die result
- Special effects (crit fail, flex trigger)
- Instructions for GM/players

## Extending the System

### Adding a New Skill

1. Add to character sheet template
2. Create skill item
3. Add action handler if needed

### Adding a New Mechanic

1. Update template.json with new data
2. Add logic to actor.mjs or item.mjs
3. Create UI in relevant template
4. Add action handler in sheet
5. Update CSS for styling

### Creating Compendium Content

Use Foundry's compendium system to create:
- Pre-made characters
- Weapon collections
- Spell libraries
- Monster stat blocks

## Testing Checklist

- [ ] Character creation works
- [ ] Stat rolling shows correct results
- [ ] Flex die triggers properly
- [ ] Stamina spending works
- [ ] Recovery system functions
- [ ] Attack rolls calculate correctly
- [ ] Damage rolls include proper bonuses
- [ ] Minion threshold system works
- [ ] Items can be created and equipped
- [ ] Spells can be cast
- [ ] Drag and drop works
- [ ] All tabs render correctly
- [ ] Chat cards display properly

## Common Issues

**Flex die not triggering:**
- Check that flexDie is being rolled
- Verify getMaxDie helper is working
- Ensure comparison uses parseInt

**Defense not calculating:**
- Check that base and bonus are numbers
- Verify prepareDerivedData is running
- Ensure template uses .total property

**Items not appearing:**
- Verify _prepareItems is called
- Check item type matches filter
- Ensure items are sorted

## Performance Tips

1. Use derived data for calculated values
2. Minimize DOM updates in _preparePartContext
3. Cache frequently used values
4. Use event delegation for item lists
5. Lazy load heavy content

## Future Enhancements

Potential additions:
- Active effects system
- Advanced combat tracker
- Wound system
- Corruption tracking
- Journey/exploration rules
- Compendium packs
- Token HUD integration
- Dice so nice integration

## Resources

- [Foundry V12 API](https://foundryvtt.com/api/)
- [ActorSheetV2 Documentation](https://foundryvtt.com/api/classes/foundry.applications.sheets.ActorSheetV2.html)
- [Handlebars Documentation](https://handlebarsjs.com/)
- Conan RPG Quickstart Rules

## Support

For questions or issues:
1. Check the README
2. Review this developer guide
3. Examine the code comments
4. Ask on Foundry Discord
