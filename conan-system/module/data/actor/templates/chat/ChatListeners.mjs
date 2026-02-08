import FlexProcessor from "../dice/FlexProcessor.mjs";
import DamageRoll from "../dice/DamageRoll.mjs";

/**
 * Handle chat message interactions
 */
export default class ChatListeners {
  
  static init() {
    Hooks.on("renderChatMessage", this._onRenderChatMessage.bind(this));
  }

  /**
   * Add listeners to chat message HTML
   * @param {ChatMessage} message
   * @param {jQuery} html
   */
  static _onRenderChatMessage(message, html) {
    // Flex spend buttons
    html.find("[data-action='spendFlex']").on("click", (event) => {
      this._onSpendFlex(event, message);
    });

    // Apply damage button
    html.find("[data-action='applyDamage']").on("click", (event) => {
      this._onApplyDamage(event, message);
    });
  }

  /**
   * Handle flex spend button click
   * @param {Event} event
   * @param {ChatMessage} message
   */
  static async _onSpendFlex(event, message) {
    event.preventDefault();
    
    const button = event.currentTarget;
    const flexType = button.dataset.flexType;
    const actorId = message.speaker.actor;
    
    const actor = game.actors.get(actorId);
    if (!actor) return;

    const flags = message.flags["conan-system"];
    const context = {
      weaponDieMax: flags?.weaponDieMax
    };

    const result = await FlexProcessor.applyFlexSpend(flexType, actor, context);
    
    if (result.applied) {
      // Update chat message to show flex was spent
      const content = await this._updateChatContent(message, flexType, result);
      await message.update({ content });
      
      ui.notifications.info(result.message);
    }
  }

  /**
   * Handle apply damage button click
   * @param {Event} event
   * @param {ChatMessage} message
   */
  static async _onApplyDamage(event, message) {
    event.preventDefault();
    await DamageRoll.applyDamageFromMessage(message);
  }

  /**
   * Update chat message content after flex spend
   * @param {ChatMessage} message
   * @param {string} flexType
   * @param {object} result
   * @returns {Promise<string>}
   */
  static async _updateChatContent(message, flexType, result) {
    // Re-render template with flex spent flag
    const html = $(message.content);
    const flexOptions = html.find(".flex-options");
    
    flexOptions.html(`
      <div class="flex-spent">
        <i class="fas fa-check"></i>
        ${result.message}
      </div>
    `);
    
    return html.prop("outerHTML");
  }
}