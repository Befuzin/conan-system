/**
 * Configuration constants for Conan: The Hyborian Age
 */
export const CONAN = {
  /**
   * Stat names
   */
  stats: {
    might: "Might",
    edge: "Edge",
    grit: "Grit",
    wits: "Wits"
  },

  /**
   * Available stat dice
   */
  statDice: {
    d6: "D6",
    d8: "D8",
    d10: "D10",
    d12: "D12"
  },

  /**
   * Flex dice options
   */
  flexDice: {
    d10: "D10 (Standard)",
    d8: "D8 (Improved)",
    d6: "D6 (Best)"
  },

  /**
   * Weapon types and their characteristics
   */
  weaponTypes: {
    melee: "Melee",
    thrown: "Thrown",
    ranged: "Ranged"
  },

  /**
   * Range categories
   */
  ranges: {
    touch: "Touch",
    close: "Close",
    medium: "Medium",
    long: "Long",
    distant: "Distant"
  },

  /**
   * Range distances in move actions
   */
  rangeDistances: {
    touch: "Within arm's reach",
    close: "1 Move Action",
    medium: "2 Move Actions",
    long: "4 Move Actions",
    distant: "8+ Move Actions"
  },

  /**
   * Armor types
   */
  armorTypes: {
    light: "Light Armor",
    medium: "Medium Armor",
    shield: "Shield"
  },

  /**
   * Damage dice options
   */
  damageDice: {
    d4: "D4",
    d6: "D6",
    d8: "D8",
    d10: "D10",
    d12: "D12",
    d20: "D20"
  },

  /**
   * Check difficulties
   */
  difficulties: {
    mundane: { value: 0, label: "Mundane (No Roll)" },
    easy: { value: 5, label: "Easy (4-6)" },
    moderate: { value: 8, label: "Moderate (7-9)" },
    tough: { value: 11, label: "Tough (10-12)" },
    legendary: { value: 14, label: "Legendary (13+)" }
  },

  /**
   * Sorcery disciplines
   */
  disciplines: {
    white: "White Magic",
    black: "Black Magic",
    demonic: "Demonic",
    necromantic: "Necromantic",
    hypnotic: "Hypnotic"
  },

  /**
   * Origins
   */
  origins: {
    streets: "From the Streets",
    hills: "From the Hills",
    wilds: "From the Wilds",
    blood: "From the Blood of Jhebbal Sag",
    north: "From the North",
    civilized: "From Civilization",
    desert: "From the Desert",
    sea: "From the Sea",
    mountains: "From the Mountains",
    ruins: "From the Ruins"
  },

  /**
   * Stamina point uses
   */
  staminaUses: {
    move: { cost: 1, label: "Extra Move Action" },
    statBoost: { cost: 1, label: "+1 to Stat Die" },
    statBoost2: { cost: 2, label: "+2 to Stat Die" },
    damageBoost: { cost: 1, label: "+1D4 Damage" },
    damageBoost2: { cost: 2, label: "+2D4 Damage" },
    range: { cost: 1, label: "Increase Thrown Range" },
    massive: { cost: "final", label: "Massive Damage (Final Point)" }
  }
};
