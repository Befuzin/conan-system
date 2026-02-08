import StatCheck from "./StatCheck.mjs";
import AttackRoll from "./AttackRoll.mjs";
import DamageRoll from "./DamageRoll.mjs";
import FlexProcessor from "./FlexProcessor.mjs";

/**
 * Centralized roll service for the Conan system
 */
export default class ConanRolls {
  
  /**
   * Roll a stat check
   */
  static rollStatCheck(...args) {
    return StatCheck.roll(...args);
  }

  /**
   * Roll an attack
   */
  static rollAttack(...args) {
    return AttackRoll.roll(...args);
  }

  /**
   * Roll damage
   */
  static rollDamage(...args) {
    return DamageRoll.roll(...args);
  }

  /**
   * Get Flex options
   */
  static getFlexOptions(...args) {
    return FlexProcessor.getFlexOptions(...args);
  }

  /**
   * Apply Flex spend
   */
  static applyFlexSpend(...args) {
    return FlexProcessor.applyFlexSpend(...args);
  }
}