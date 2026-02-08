export default class ConanItem extends Item {

  /**
   * Augment basic item data with additional dynamic data
   */
  prepareData() {
    super.prepareData();
  }

  /**
   * Prepare derived data
   */
  prepareDerivedData() {
    super.prepareDerivedData();
  }

  /**
   * Prepare roll data for this item
   * @returns {object}
   */
  getRollData() {
    if (!this.actor) return null;

    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /* -------------------------------------------- */
  /*  Action Methods (Intent-Based)              */
  /* -------------------------------------------- */

  /**
   * Roll an attack with this weapon
   * @param {object} options - Attack options
   * @param {boolean} options.focused - Is this a focused attack?
   * @returns {Promise<ChatMessage|null>}
   */
  async rollAttack(options = {}) {
    if (this.type !== "weapon") {
      ui.notifications.warn("CONAN.Warnings.NotAWeapon", { localize: true });
      return null;
    }

    if (!this.actor) {
      ui.notifications.warn("CONAN.Warnings.NoOwner", { localize: true });
      return null;
    }

    // Delegate to centralized roll service
    const { rollAttack } = game.conan;
    return rollAttack(this.actor, this, options);
  }

  /**
   * Roll damage with this weapon
   * @param {object} options - Damage options
   * @param {boolean} options.massiveDamage - Apply massive damage?
   * @returns {Promise<ChatMessage|null>}
   */
  async rollDamage(options = {}) {
    if (this.type !== "weapon") {
      ui.notifications.warn("CONAN.Warnings.NotAWeapon", { localize: true });
      return null;
    }

    if (!this.actor) {
      ui.notifications.warn("CONAN.Warnings.NoOwner", { localize: true });
      return null;
    }

    // Delegate to centralized roll service
    const { rollDamage } = game.conan;
    return rollDamage(this.actor, this, options);
  }

  /**
   * Cast this spell
   * @param {object} options - Casting options
   * @returns {Promise<ChatMessage|null>}
   */
  async cast(options = {}) {
    if (this.type !== "spell") {
      ui.notifications.warn("CONAN.Warnings.NotASpell", { localize: true });
      return null;
    }

    if (!this.actor) {
      ui.notifications.warn("CONAN.Warnings.NoOwner", { localize: true });
      return null;
    }

    // Check if actor has enough resources
    const costType = options.costType || "stamina"; // or "lifePoints"
    const cost = this.system.cost;

    if (costType === "stamina") {
      if (this.actor.system.stamina.value < cost) {
        ui.notifications.warn("CONAN.Warnings.InsufficientStamina", { localize: true });
        return null;
      }
    } else if (costType === "lifePoints") {
      if (this.actor.system.health.value < cost) {
        ui.notifications.warn("CONAN.Warnings.InsufficientLifePoints", { localize: true });
        return null;
      }
    }

    // Delegate to centralized spell service
    const { castSpell } = game.conan;
    return castSpell(this.actor, this, options);
  }

  /**
   * Toggle equipped status (for armor)
   * @returns {Promise<ConanItem>}
   */
  async toggleEquipped() {
    if (this.type !== "armor") {
      ui.notifications.warn("CONAN.Warnings.NotArmor", { localize: true });
      return this;
    }

    // If equipping, unequip other armor of same type first
    if (!this.system.equipped && this.actor) {
      const otherArmor = this.actor.items.filter(i => 
        i.type === "armor" && 
        i.system.equipped && 
        i.id !== this.id
      );
      
      for (const armor of otherArmor) {
        await armor.update({ "system.equipped": false });
      }
    }

    return this.update({ "system.equipped": !this.system.equipped });
  }

  /**
   * Use one charge of a talent
   * @returns {Promise<ConanItem|null>}
   */
  async useTalent() {
    if (this.type !== "talent") {
      ui.notifications.warn("CONAN.Warnings.NotATalent", { localize: true });
      return null;
    }

    if (!this.system.hasUsesRemaining) {
      ui.notifications.warn("CONAN.Warnings.NoUsesRemaining", { localize: true });
      return null;
    }

    if (this.system.hasLimitedUses) {
      const newValue = Math.max(0, this.system.uses.value - 1);
      return this.update({ "system.uses.value": newValue });
    }

    return this;
  }

  /**
   * Restore talent uses to maximum
   * @returns {Promise<ConanItem>}
   */
  async restoreTalentUses() {
    if (this.type !== "talent") return this;
    
    if (this.system.hasLimitedUses) {
      return this.update({ "system.uses.value": this.system.uses.max });
    }

    return this;
  }
}