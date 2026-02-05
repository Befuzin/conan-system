/**
 * Extend the base Item document
 */
export class ConanItem extends Item {

  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /** @override */
  prepareDerivedData() {
    const itemData = this;
    const systemData = itemData.system;
    const flags = itemData.flags['conan-system'] || {};

    // Make separate methods for each Item type
    this._prepareWeaponData(itemData);
    this._prepareArmorData(itemData);
  }

  /**
   * Prepare Weapon type specific data
   */
  _prepareWeaponData(itemData) {
    if (itemData.type !== 'weapon') return;
    // Any weapon-specific calculations can go here
  }

  /**
   * Prepare Armor type specific data
   */
  _prepareArmorData(itemData) {
    if (itemData.type !== 'armor') return;
    // Any armor-specific calculations can go here
  }

  /**
   * Handle clickable rolls
   */
  async roll() {
    const item = this;

    // Basic template context for chat cards
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // If there's no roll data, send a chat message
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? ''
      });
    }
    // Otherwise, create a roll!
    else {
      const rollData = this.getRollData();
      const roll = new Roll(item.system.formula, rollData);
      
      await roll.evaluate();

      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });

      return roll;
    }
  }

  /**
   * Prepare a data object for roll formulas
   */
  getRollData() {
    if (!this.actor) return null;

    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /**
   * Handle weapon attack
   */
  async rollAttack(focused = false) {
    if (this.type !== 'weapon') return;
    if (!this.actor) {
      ui.notifications.warn("This weapon must be owned by an actor to make attacks!");
      return;
    }

    // Import the rollAttack function from conan.mjs
    const { rollAttack } = game.conan;
    return rollAttack(this.actor, this, focused);
  }

  /**
   * Handle weapon damage
   */
  async rollDamage(massiveDamage = false) {
    if (this.type !== 'weapon') return;
    if (!this.actor) {
      ui.notifications.warn("This weapon must be owned by an actor to roll damage!");
      return;
    }

    // Import the rollDamage function from conan.mjs
    const { rollDamage } = game.conan;
    return rollDamage(this.actor, this, massiveDamage);
  }
}
