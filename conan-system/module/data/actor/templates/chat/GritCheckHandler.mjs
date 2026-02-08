/**
 * Handle Grit checks when Characters reach 0 LP
 */
export default class GritCheckHandler {
  
  static init() {
    Hooks.on("renderChatMessage", this._onRenderChatMessage.bind(this));
  }

  static _onRenderChatMessage(message, html) {
    html.find("[data-action='rollGritCheck']").on("click", (event) => {
      this._onRollGritCheck(event);
    });
  }

  static async _onRollGritCheck(event) {
    event.preventDefault();
    
    const actorId = event.currentTarget.dataset.actorId;
    const actor = game.actors.get(actorId);
    
    if (!actor) return;

    const difficulty = 8;
    const result = await game.conan.rollStatCheck(actor, "grit", {
      difficulty,
      label: game.i18n.localize("CONAN.DeathSave")
    });

    if (result.success) {
      // Character survives
      await actor.update({ "system.health.value": 1 });
      
      ui.notifications.info(
        game.i18n.format("CONAN.Notifications.DeathSaveSuccess", {
          name: actor.name
        })
      );
    } else {
      // Character dies
      ui.notifications.error(
        game.i18n.format("CONAN.Notifications.DeathSaveFailure", {
          name: actor.name
        })
      );
      
      // Optional: Apply "Dead" effect or delete actor
      await actor.applyCondition("dead");
    }
  }
}