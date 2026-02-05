export const CONAN = {};

/**
 * The set of stats used within the system
 * @type {Object}
 */
CONAN.stats = {
  "might": "CONAN.Stats.might",
  "edge": "CONAN.Stats.edge",
  "grit": "CONAN.Stats.grit",
  "wits": "CONAN.Stats.wits"
};

CONAN.statsAbbreviations = {
  "might": "CONAN.StatsAbbr.might",
  "edge": "CONAN.StatsAbbr.edge",
  "grit": "CONAN.StatsAbbr.grit",
  "wits": "CONAN.StatsAbbr.wits"
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
  "melee": "CONAN.WeaponTypes.melee",
  "ranged": "CONAN.WeaponTypes.ranged",
  "thrown": "CONAN.WeaponTypes.thrown"
};

/**
 * Range zones
 * @type {Object}
 */
CONAN.ranges = {
  "touch": "CONAN.Ranges.touch",
  "close": "CONAN.Ranges.close",
  "medium": "CONAN.Ranges.medium",
  "long": "CONAN.Ranges.long",
  "distant": "CONAN.Ranges.distant"
};

/**
 * Difficulty levels
 * @type {Object}
 */
CONAN.difficulties = {
  "easy": { label: "CONAN.Difficulties.easy", value: "4-6" },
  "moderate": { label: "CONAN.Difficulties.moderate", value: "7-9" },
  "tough": { label: "CONAN.Difficulties.tough", value: "10-12" },
  "legendary": { label: "CONAN.Difficulties.legendary", value: "13+" }
};

/**
 * Action types
 * @type {Object}
 */
CONAN.actionTypes = {
  "move": "CONAN.Actions.move",
  "manipulate": "CONAN.Actions.manipulate",
  "attack": "CONAN.Actions.attack",
  "focusedAttack": "CONAN.Actions.focusedAttack",
  "defend": "CONAN.Actions.defend",
  "castSpell": "CONAN.Actions.castSpell"
};
