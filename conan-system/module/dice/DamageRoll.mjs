import FlexProcessor from "./FlexProcessor.mjs";

/**
 * Handle damage rolls
 */
export default class DamageRoll {
  
  /**
   * Roll weapon damage
   * @param {Actor} actor - The attacking actor
   * @param {Item} weapon - The weapon being used
   * @param {object} options - Damage options
   * @param {boolean} options.massiveDamage - Apply massive damage?
   * @param {number} options.modifier - Additional damage modifier
   * @param {Actor} options.target - Target actor (optional, for AR)
   * @returns {Promise<object>} Damage result data
   */
  static async roll(actor, weapon, options = {}) {
    const {
      massiveDamage = false,
      modifier = 0,
      target = null
    } = options;

    // Validate weapon
    if (weapon.type !== "weapon") {
      ui.notifications.error(game.i18n.localize("CONAN.Errors.NotAWeapon"));
      return null;
    }

    const weaponDamage = weapon.system.damage;
    const weaponType = weapon.system.weaponType;
    const addsMight = weapon.system.addsMightToDamage;

    // Build formula
    let formula = weaponDamage;
    
    // Add Might to melee/thrown
    if (addsMight) {
      const mightValue = actor.system.attributes?.might?.value || 0;
      if (mightValue > 0) {
        formula += ` + ${mightValue}`;
      }
    }

    // Add additional modifiers
    if (modifier !== 0) {
      formula += modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
    }

    // Create and evaluate roll
    const roll = await new Roll(formula).evaluate();
    const flexDie = actor.system.flexDie || "d10";

    // Check for Flex trigger
    const hasFlexTrigger = FlexProcessor.didTriggerFlex(roll, flexDie);

    // Calculate total damage
    let totalDamage = roll.total;

    // Apply massive damage if requested
    let massiveDamageBonus = 0;
    if (massiveDamage) {
      massiveDamageBonus = weapon.system.damageMax;
      totalDamage += massiveDamageBonus;
    }

    // Apply target's AR
    let arReduction = 0;
    let finalDamage = totalDamage;
    
    if (target) {
      arReduction = target.system.armor?.rating || 0;
      finalDamage = Math.max(1, totalDamage - arReduction); // Minimum 1 damage
    }

    // Build result data
    const resultData = {
      actor,
      weapon,
      target,
      roll,
      formula: roll.formula,
      rollTotal: roll.total,
      totalDamage,
      finalDamage,
      arReduction,
      massiveDamage,
      massiveDamageBonus,
      hasFlexTrigger,
      modifier,
      weaponDieMax: weapon.system.damageMax
    };

    // Create chat message
    await this._createChatMessage(resultData);

    return resultData;
  }

  /**
   * Create chat message for damage
   * @param {object} data - Damage result data
   * @returns {Promise<ChatMessage>}
   * @private
   */
  static async _createChatMessage(data) {
    const template = "systems/conan-system/templates/chat/damage-roll.hbs";
    const content = await renderTemplate(template, {
      ...data,
      weaponName: data.weapon.name,
      flexOptions: data.hasFlexTrigger 
        ? FlexProcessor.getFlexOptions("damage", { weaponDieMax: data.weaponDieMax })
        : null
    });

    const chatData = {
      speaker: ChatMessage.getSpeaker({ actor: data.actor }),
      flavor: game.i18n.format("CONAN.Chat.DamageTitle", { 
        weapon: data.weapon.name,
        massive: data.massiveDamage ? ` (${game.i18n.localize("CONAN.Massive")})` : ""
      }),
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      rolls: [data.roll],
      content,
      flags: {
        "conan-system": {
          rollType: "damage",
          weaponId: data.weapon.id,
          hasFlexTrigger: data.hasFlexTrigger,
          finalDamage: data.finalDamage,
          targetId: data.target?.id
        }
      }
    };

    return ChatMessage.create(chatData);
  }

  /**
   * Apply damage to target
   * @param {ChatMessage} message - The damage chat message
   * @returns {Promise<void>}
   */
  static async applyDamageFromMessage(message) {
    const flags = message.flags["conan-system"];
    if (!flags || flags.rollType !== "damage") return;

    const targetId = flags.targetId;
    if (!targetId) {
      ui.notifications.warn(game.i18n.localize("CONAN.Warnings.NoTarget"));
      return;
    }

    const target = game.actors.get(targetId);
    if (!target) return;

    const damage = flags.finalDamage;
    await target.takeDamage(damage);

    ui.notifications.info(
      game.i18n.format("CONAN.Notifications.DamageApplied", {
        damage,
        name: target.name
      })
    );
  }
}