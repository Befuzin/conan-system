/**
 * Centralized Flex die logic
 */
export default class FlexProcessor {
  
  /**
   * Check if a roll triggered a Flex
   * @param {Roll} roll - The Roll instance
   * @param {string} flexDie - Die notation (d10, d8, d6)
   * @returns {boolean}
   */
  static didTriggerFlex(roll, flexDie) {
    const maxValue = parseInt(flexDie.slice(1));
    const flexTerm = roll.terms.find(t => t.options?.flavor === "flex");
    
    if (!flexTerm) return false;
    
    const flexResults = flexTerm.results || [];
    return flexResults.some(r => r.result === maxValue);
  }

  /**
   * Get available Flex spend options based on roll type
   * @param {string} rollType - "check", "attack", "damage"
   * @param {object} rollData - Additional context
   * @returns {Array<object>} Available flex options
   */
  static getFlexOptions(rollType, rollData = {}) {
    const options = [
      {
        id: "stamina",
        label: "CONAN.Flex.GainStamina",
        description: "CONAN.Flex.GainStaminaDesc",
        available: true
      }
    ];

    // Success option (only for failed checks/attacks)
    if ((rollType === "check" || rollType === "attack") && rollData.failed) {
      options.push({
        id: "success",
        label: "CONAN.Flex.ForceSuccess",
        description: "CONAN.Flex.ForceSuccessDesc",
        available: true
      });
    }

    // Massive Damage option (only for damage rolls)
    if (rollType === "damage") {
      options.push({
        id: "massiveDamage",
        label: "CONAN.Flex.MassiveDamage",
        description: "CONAN.Flex.MassiveDamageDesc",
        available: true,
        bonus: rollData.weaponDieMax || 0
      });
    }

    return options;
  }

  /**
   * Apply a Flex spend effect
   * @param {string} flexType - "stamina", "success", "massiveDamage"
   * @param {Actor} actor - The actor spending the flex
   * @param {object} context - Additional context
   * @returns {Promise<object>} Result of the flex spend
   */
  static async applyFlexSpend(flexType, actor, context = {}) {
    const result = {
      type: flexType,
      applied: false,
      message: ""
    };

    switch (flexType) {
      case "stamina":
        await actor.gainStamina(1);
        result.applied = true;
        result.message = game.i18n.localize("CONAN.Flex.StaminaGained");
        break;

      case "success":
        // Handled by roll service - just mark it
        result.applied = true;
        result.message = game.i18n.localize("CONAN.Flex.SuccessForced");
        break;

      case "massiveDamage":
        // Additional damage added by roll service
        result.applied = true;
        result.bonus = context.weaponDieMax || 0;
        result.message = game.i18n.format("CONAN.Flex.MassiveDamageApplied", {
          bonus: result.bonus
        });
        break;
    }

    return result;
  }
}