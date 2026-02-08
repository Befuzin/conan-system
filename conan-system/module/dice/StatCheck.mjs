import FlexProcessor from "./FlexProcessor.mjs";

/**
 * Handle stat checks (ability checks)
 */
export default class StatCheck {
  
  /**
   * Roll a stat check
   * @param {Actor} actor - The actor making the check
   * @param {string} stat - The stat being checked (might, edge, grit, wits)
   * @param {object} options - Roll options
   * @param {number} options.modifier - Additional modifier
   * @param {number} options.difficulty - Target difficulty (optional)
   * @param {string} options.label - Custom label for the roll
   * @returns {Promise<object>} Roll result data
   */
  static async roll(actor, stat, options = {}) {
    const {
      modifier = 0,
      difficulty = null,
      label = null
    } = options;

    // Validate stat
    const attributes = actor.system.attributes;
    if (!attributes || !attributes[stat]) {
      ui.notifications.error(game.i18n.format("CONAN.Errors.InvalidStat", { stat }));
      return null;
    }

    const attribute = attributes[stat];
    const statValue = attribute.value;
    const statDie = attribute.die;
    const flexDie = actor.system.flexDie || "d10";

    // Build formula: 1{statDie} + statValue + modifier + 1{flexDie}[flex]
    const formula = `1${statDie} + ${statValue} + ${modifier} + 1${flexDie}[flex]`;
    
    // Create and evaluate roll
    const roll = await new Roll(formula).evaluate();

    // Check for automatic failure (1 on stat die)
    const statDieTerm = roll.terms[0];
    const autoFail = statDieTerm.results?.[0]?.result === 1;

    // Check for Flex trigger
    const hasFlexTrigger = FlexProcessor.didTriggerFlex(roll, flexDie);

    // Determine success
    let success = null;
    if (difficulty !== null) {
      success = autoFail ? false : roll.total >= difficulty;
    }

    // Build result data
    const resultData = {
      actor,
      stat,
      roll,
      formula: roll.formula,
      total: roll.total,
      difficulty,
      success,
      autoFail,
      hasFlexTrigger,
      modifier,
      label: label || game.i18n.localize(`CONAN.Stats.${stat}`)
    };

    // Create chat message
    await this._createChatMessage(resultData);

    return resultData;
  }

  /**
   * Create chat message for stat check
   * @param {object} data - Roll result data
   * @returns {Promise<ChatMessage>}
   * @private
   */
  static async _createChatMessage(data) {
    const template = "systems/conan-system/templates/chat/stat-check.hbs";
    const content = await renderTemplate(template, {
      ...data,
      flexOptions: data.hasFlexTrigger 
        ? FlexProcessor.getFlexOptions("check", { failed: !data.success })
        : null
    });

    const chatData = {
      speaker: ChatMessage.getSpeaker({ actor: data.actor }),
      flavor: game.i18n.format("CONAN.Chat.StatCheckTitle", { stat: data.label }),
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      rolls: [data.roll],
      content,
      flags: {
        "conan-system": {
          rollType: "statCheck",
          stat: data.stat,
          hasFlexTrigger: data.hasFlexTrigger,
          autoFail: data.autoFail
        }
      }
    };

    return ChatMessage.create(chatData);
  }
}