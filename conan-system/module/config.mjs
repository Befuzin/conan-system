/**
 * Conan RPG System Configuration
 */
export const CONAN = {};

/**
 * The set of stats used within the system
 * @type {Object}
 */
CONAN.stats = {
  "might": "CONAN.Stats.Might",
  "edge": "CONAN.Stats.Edge",
  "grit": "CONAN.Stats.Grit",
  "wits": "CONAN.Stats.Wits"
};

/**
 * Stat abbreviations
 * @type {Object}
 */
CONAN.statsAbbreviations = {
  "might": "CONAN.StatsAbbr.Might",
  "edge": "CONAN.StatsAbbr.Edge",
  "grit": "CONAN.StatsAbbr.Grit",
  "wits": "CONAN.StatsAbbr.Wits"
};

/**
 * Stat descriptions
 * @type {Object}
 */
CONAN.statDescriptions = {
  "might": "CONAN.StatsDesc.Might",
  "edge": "CONAN.StatsDesc.Edge",
  "grit": "CONAN.StatsDesc.Grit",
  "wits": "CONAN.StatsDesc.Wits"
};

/**
 * Die types for stats
 * @type {Object}
 */
CONAN.statDice = {
  "d6": "D6",
  "d8": "D8",
  "d10": "D10"
};

/**
 * Flex die types
 * @type {Object}
 */
CONAN.flexDice = {
  "d10": "D10",
  "d8": "D8",
  "d6": "D6"
};

/**
 * Weapon types
 * @type {Object}
 */
CONAN.weaponTypes = {
  "melee": "CONAN.WeaponTypes.Melee",
  "ranged": "CONAN.WeaponTypes.Ranged",
  "thrown": "CONAN.WeaponTypes.Thrown"
};

/**
 * Weapon type descriptions
 * @type {Object}
 */
CONAN.weaponTypeDescriptions = {
  "melee": "CONAN.WeaponTypesDesc.Melee",
  "ranged": "CONAN.WeaponTypesDesc.Ranged",
  "thrown": "CONAN.WeaponTypesDesc.Thrown"
};

/**
 * Armor types
 * @type {Object}
 */
CONAN.armorTypes = {
  "light": "CONAN.ArmorTypes.Light",
  "medium": "CONAN.ArmorTypes.Medium",
  "heavy": "CONAN.ArmorTypes.Heavy"
};

/**
 * Armor type descriptions
 * @type {Object}
 */
CONAN.armorTypeDescriptions = {
  "light": "CONAN.ArmorTypesDesc.Light",
  "medium": "CONAN.ArmorTypesDesc.Medium",
  "heavy": "CONAN.ArmorTypesDesc.Heavy"
};

/**
 * Range zones
 * @type {Object}
 */
CONAN.ranges = {
  "touch": "CONAN.Ranges.Touch",
  "close": "CONAN.Ranges.Close",
  "medium": "CONAN.Ranges.Medium",
  "long": "CONAN.Ranges.Long",
  "distant": "CONAN.Ranges.Distant"
};

/**
 * Range descriptions
 * @type {Object}
 */
CONAN.rangeDescriptions = {
  "touch": "CONAN.RangesDesc.Touch",
  "close": "CONAN.RangesDesc.Close",
  "medium": "CONAN.RangesDesc.Medium",
  "long": "CONAN.RangesDesc.Long",
  "distant": "CONAN.RangesDesc.Distant"
};

/**
 * Difficulty levels
 * @type {Object}
 */
CONAN.difficulties = {
  "easy": { 
    label: "CONAN.Difficulties.Easy", 
    value: "4-6",
    min: 4,
    max: 6
  },
  "moderate": { 
    label: "CONAN.Difficulties.Moderate", 
    value: "7-9",
    min: 7,
    max: 9
  },
  "tough": { 
    label: "CONAN.Difficulties.Tough", 
    value: "10-12",
    min: 10,
    max: 12
  },
  "legendary": { 
    label: "CONAN.Difficulties.Legendary", 
    value: "13+",
    min: 13,
    max: 999
  }
};

/**
 * Action types
 * @type {Object}
 */
CONAN.actionTypes = {
  "move": "CONAN.Actions.Move",
  "manipulate": "CONAN.Actions.Manipulate",
  "attack": "CONAN.Actions.Attack",
  "focusedAttack": "CONAN.Actions.FocusedAttack",
  "defend": "CONAN.Actions.Defend",
  "castSpell": "CONAN.Actions.CastSpell"
};

/**
 * Action descriptions
 * @type {Object}
 */
CONAN.actionDescriptions = {
  "move": "CONAN.ActionsDesc.Move",
  "manipulate": "CONAN.ActionsDesc.Manipulate",
  "attack": "CONAN.ActionsDesc.Attack",
  "focusedAttack": "CONAN.ActionsDesc.FocusedAttack",
  "defend": "CONAN.ActionsDesc.Defend",
  "castSpell": "CONAN.ActionsDesc.CastSpell"
};

/**
 * Conditions that can be applied to actors
 * @type {Object}
 */
CONAN.conditions = {
  poisoned: {
    label: "CONAN.Conditions.Poisoned",
    icon: "icons/svg/poison.svg",
    description: "CONAN.ConditionsDesc.Poisoned",
    changes: [
      {
        key: "system.modifier.checks",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: "-1"
      },
      {
        key: "system.modifier.attacks",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: "-1"
      }
    ]
  },
  
  prone: {
    label: "CONAN.Conditions.Prone",
    icon: "icons/svg/falling.svg",
    description: "CONAN.ConditionsDesc.Prone",
    changes: []
  },
  
  dead: {
    label: "CONAN.Conditions.Dead",
    icon: "icons/svg/skull.svg",
    description: "CONAN.ConditionsDesc.Dead",
    changes: []
  },

  encumbered: {
    label: "CONAN.Conditions.Encumbered",
    icon: "icons/svg/weight.svg",
    description: "CONAN.ConditionsDesc.Encumbered",
    changes: [
      {
        key: "system.modifier.movement",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: "-1"
      }
    ]
  },

  frightened: {
    label: "CONAN.Conditions.Frightened",
    icon: "icons/svg/terror.svg",
    description: "CONAN.ConditionsDesc.Frightened",
    changes: [
      {
        key: "system.modifier.checks",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: "-1"
      },
      {
        key: "system.modifier.attacks",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: "-1"
      }
    ]
  }
};

/**
 * Sorcery disciplines
 * @type {Object}
 */
CONAN.sorceryDisciplines = {
  "white": "CONAN.Disciplines.White",
  "black": "CONAN.Disciplines.Black",
  "demonic": "CONAN.Disciplines.Demonic",
  "necromantic": "CONAN.Disciplines.Necromantic",
  "elemental": "CONAN.Disciplines.Elemental"
};

/**
 * Origins (examples)
 * @type {Object}
 */
CONAN.origins = {
  "fromTheStreets": "CONAN.Origins.FromTheStreets",
  "fromTheHills": "CONAN.Origins.FromTheHills",
  "fromTheWilds": "CONAN.Origins.FromTheWilds",
  "fromTheNorth": "CONAN.Origins.FromTheNorth",
  "fromTheBloodOfJhebbalSag": "CONAN.Origins.FromTheBloodOfJhebbalSag"
};

/**
 * Item properties (weapon properties, armor qualities, etc.)
 * @type {Object}
 */
CONAN.weaponProperties = {
  "versatile": "CONAN.WeaponProperties.Versatile",
  "twoHanded": "CONAN.WeaponProperties.TwoHanded",
  "reach": "CONAN.WeaponProperties.Reach",
  "finesse": "CONAN.WeaponProperties.Finesse",
  "heavy": "CONAN.WeaponProperties.Heavy",
  "light": "CONAN.WeaponProperties.Light"
};

/**
 * Default icons for item types
 * @type {Object}
 */
CONAN.defaultIcons = {
  actor: {
    character: "systems/conan-system/assets/icons/character.svg",
    minion: "systems/conan-system/assets/icons/minion.svg",
    antagonist: "systems/conan-system/assets/icons/antagonist.svg"
  },
  item: {
    weapon: "systems/conan-system/assets/icons/weapon.svg",
    armor: "systems/conan-system/assets/icons/armor.svg",
    gear: "systems/conan-system/assets/icons/gear.svg",
    spell: "systems/conan-system/assets/icons/spell.svg",
    skill: "systems/conan-system/assets/icons/skill.svg",
    talent: "systems/conan-system/assets/icons/talent.svg"
  }
};

/**
 * ASCII art for console
 * @type {String}
 */
CONAN.ASCII = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ██████╗ ██████╗ ███╗   ██╗ █████╗ ███╗   ██╗              ║
║  ██╔════╝██╔═══██╗████╗  ██║██╔══██╗████╗  ██║              ║
║  ██║     ██║   ██║██╔██╗ ██║███████║██╔██╗ ██║              ║
║  ██║     ██║   ██║██║╚██╗██║██╔══██║██║╚██╗██║              ║
║  ╚██████╗╚██████╔╝██║ ╚████║██║  ██║██║ ╚████║              ║
║   ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═══╝              ║
║                                                               ║
║              THE HYBORIAN AGE ROLEPLAYING GAME                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`;