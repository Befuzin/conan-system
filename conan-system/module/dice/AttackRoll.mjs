import FlexProcessor from "./FlexProcessor.mjs";

/**
 * Handle attack rolls
 */
export default class AttackRoll {
  
  /**
   * Roll an attack
   * @param {Actor} actor - The attacking actor
   * @param {Item} weapon - The weapon being used
   * @param {object} options - Attack options
   * @param {boolean} options.focused - Is this a focused attack? (+2)
   * @param {number} options.modifier - Additional modifier
   * @param {Actor} options.target - Target actor (optional)
   * @returns {Promise<object>} Attack result data
   */
  static async roll(actor, weapon, options = {}) {
    const {
      focused = false,
      modifier = 0,
      target = null
    } = options;

    // Validate weapon
    if (weapon.type !== "weapon") {
      ui.notifications.error(game.i18n.localize("CONAN.Errors.NotAWeapon"));
      return null;
    }

    // Get weapon properties
    const weaponType = weapon.system.weaponType;
    const attackAttribute = weapon.system.attackAttribute; // "might" or "edge"

    // Get actor attributes
    const attribute = actor.system.attributes[attackAttribute];
    const statValue = attribute.value;
    const statDie = attribute.die;
    const flexDie = actor.system.flexDie || "d10";

    // Calculate modifiers
    let totalModifier = modifier;
    if (focused) totalModifier += 2;

    // Build formula
    const formula = `1${statDie} + ${statValue} + ${totalModifier} + 1${flexDie}[flex]`;
    
    // Create and evaluate roll
    const roll = await new Roll(formula).evaluate();

    // Check for automatic failure
    const statDieTerm = roll.terms[0];
    const autoFail = statDieTerm.results?.[0]?.result === 1;

    // Check for Flex trigger
    const hasFlexTrigger = FlexProcessor.didTriggerFlex(roll, flexDie);

    // Determine hit/miss
    let hit = null;
    let defense = null;
    
    if (target) {
      defense = weaponType === "sorcery" 
        ? target.system.defenses.sorcery.value
        : target.system.defenses.physical.value;
      
      hit = autoFail ? false : roll.total >= defense;
    }

    // Build result data
    const resultData = {
      actor,
      weapon,
      target,
      roll,
      formula: roll.formula,
      total: roll.total,
      defense,
      hit,
      autoFail,
      hasFlexTrigger,
      focused,
      modifier: totalModifier,
      weaponType,
      attackAttribute
    };

    // Create chat message
    await this._createChatMessage(resultData);

    return resultData;
  }

  /**
   * Create chat message for attack
   * @param {object} data - Attack result data
   * @returns {Promise<ChatMessage>}
   * @private
   */
  static async _createChatMessage(data) {
    const template = "systems/conan-system/templates/chat/attack-roll.hbs";
    const content = await renderTemplate(template, {
      ...data,
      weaponName: data.weapon.name,
      flexOptions: data.hasFlexTrigger 
        ? FlexProcessor.getFlexOptions("attack", { failed: data.hit === false })
        : null
    });

    const chatData = {
      speaker: ChatMessage.getSpeaker({ actor: data.actor }),
      flavor: game.i18n.format("CONAN.Chat.AttackTitle", { 
        weapon: data.weapon.name,
        focused: data.focused ? ` (${game.i18n.localize("CONAN.Focused")})` : ""
      }),
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      rolls: [data.roll],
      content,
      flags: {
        "conan-system": {
          rollType: "attack",
          weaponId: data.weapon.id,
          hasFlexTrigger: data.hasFlexTrigger,
          autoFail: data.autoFail,
          hit: data.hit
        }
      }
    };

    return ChatMessage.create(chatData);
  }
}