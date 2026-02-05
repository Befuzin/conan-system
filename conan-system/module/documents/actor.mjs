/**
 * Extend the base Actor document
 */
export class ConanActor extends Actor {

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
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags['conan-system'] || {};

    // Make separate methods for each Actor type to keep things organized
    this._prepareCharacterData(actorData);
    this._prepareAntagonistData(actorData);
    this._prepareMinionData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    const systemData = actorData.system;

    // Calculate defenses based on attributes
    this._calculateDefenses(systemData);

    // Calculate max Life Points: (Grit × 2) + baseLifePoints
    const gritValue = systemData.attributes.grit?.value || 1;
    const baseLifePoints = systemData.baseLifePoints || 26;
    systemData.health.max = (gritValue * 2) + baseLifePoints;

    // Set max stamina to Grit value
    systemData.stamina.max = gritValue;

    // Calculate encumbrance and armor
    this._calculateEncumbrance(actorData);
  }

  /**
   * Prepare Antagonist type specific data
   */
  _prepareAntagonistData(actorData) {
    if (actorData.type !== 'antagonist') return;

    const systemData = actorData.system;

    // Calculate defenses based on attributes
    this._calculateDefenses(systemData);

    // Calculate total armor rating
    let totalAR = 0;
    for (let item of actorData.items) {
      if (item.type === 'armor' && item.system.equipped) {
        totalAR += item.system.armorRating || 0;
      }
    }
    systemData.armor.rating = totalAR;
  }

  /**
   * Prepare Minion type specific data
   */
  _prepareMinionData(actorData) {
    if (actorData.type !== 'minion') return;

    const systemData = actorData.system;

    // Calculate total armor rating
    let totalAR = 0;
    for (let item of actorData.items) {
      if (item.type === 'armor' && item.system.equipped) {
        totalAR += item.system.armorRating || 0;
      }
    }
    systemData.armor.rating = totalAR;
  }

  /**
   * Calculate all defenses based on their linked attributes
   * Formula: Attribute + base (usually 2), with minimum value enforcement
   */
  _calculateDefenses(systemData) {
    if (!systemData.defenses) return;

    for (const [key, defense] of Object.entries(systemData.defenses)) {
      const attrKey = defense.attribute;
      if (attrKey && systemData.attributes?.[attrKey]) {
        const attrValue = systemData.attributes[attrKey].value || 0;
        const calculatedValue = attrValue + defense.base;
        
        // Apply minimum value if specified (default minimum is 5 for defenses)
        const minValue = defense.min !== undefined ? defense.min : 5;
        defense.value = Math.max(calculatedValue, minValue);
      } else {
        // Fallback if no attribute linked
        const minValue = defense.min !== undefined ? defense.min : 5;
        defense.value = Math.max(defense.base, minValue);
      }
    }
  }

  /**
   * Calculate encumbrance and armor rating
   */
  _calculateEncumbrance(actorData) {
    const systemData = actorData.system;
    const mightValue = systemData.attributes?.might?.value || 0;
    
    let slotsUsed = 0;
    let bundleItems = 0;
    let totalAR = 0;
    let equippedArmorEncumbrance = 0;

    // Count equipment slots and armor
    for (let item of actorData.items) {
      if (item.type === 'weapon') {
        slotsUsed += item.system.slotsUsed || 1;
      }
      else if (item.type === 'armor' && item.system.equipped) {
        totalAR += item.system.armorRating || 0;
        equippedArmorEncumbrance = item.system.encumbranceValue || 0;
      }
      else if (item.type === 'gear' && item.system.isBundle) {
        bundleItems += item.system.quantity || 0;
      }
    }

    // Update encumbrance tracking
    systemData.encumbrance.slots.used = slotsUsed;
    systemData.encumbrance.bundleItems = bundleItems;
    systemData.armor.rating = totalAR;

    // Determine if character is encumbered
    const slotsOver = slotsUsed > systemData.encumbrance.slots.max;
    const bundleOver = bundleItems > systemData.encumbrance.bundleMax;
    const armorTooHeavy = equippedArmorEncumbrance > mightValue;

    systemData.encumbrance.encumbered = slotsOver || bundleOver || armorTooHeavy;
  }

  /**
   * Override getRollData() to prepare roll data
   */
  getRollData() {
    const data = { ...super.getRollData() };

    // Copy attributes for easy access in formulas
    if (this.system.attributes) {
      data.attributes = foundry.utils.deepClone(this.system.attributes);
    }

    // Copy defenses for convenience
    if (this.system.defenses) {
      data.defenses = foundry.utils.deepClone(this.system.defenses);
    }

    return data;
  }

  /**
   * Handle taking damage
   */
  async takeDamage(amount) {
    const currentHealth = this.system.health.value;
    const newHealth = Math.max(currentHealth - amount, 0);
    
    await this.update({ 'system.health.value': newHealth });

    if (newHealth === 0 && this.type === 'character') {
      ui.notifications.warn(`${this.name} has been reduced to 0 Life Points! Make a Grit check (Difficulty 8) or die!`);
    }

    return newHealth;
  }

  /**
   * Handle healing
   */
  async heal(amount) {
    const currentHealth = this.system.health.value;
    const maxHealth = this.system.health.max;
    const newHealth = Math.min(currentHealth + amount, maxHealth);
    
    await this.update({ 'system.health.value': newHealth });
    return newHealth;
  }

  /**
   * Use a recovery
   */
  async useRecovery() {
    if (this.type !== 'character') {
      ui.notifications.warn("Only characters can use recoveries!");
      return;
    }

    const recoveries = this.system.recoveries.value;
    if (recoveries <= 0) {
      ui.notifications.warn("No recoveries remaining!");
      return;
    }

    const maxHealth = this.system.health.max;
    const healAmount = Math.floor(maxHealth * 0.5);
    const currentStamina = this.system.stamina.value;
    const maxStamina = this.system.stamina.max;

    await this.update({
      'system.recoveries.value': recoveries - 1,
      'system.stamina.value': Math.min(currentStamina + 1, maxStamina)
    });

    await this.heal(healAmount);

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `${this.name} uses a Recovery, regaining ${healAmount} Life Points and 1 Stamina Point!`
    });
  }

  /**
   * Spend stamina points
   */
  async spendStamina(amount) {
    const currentStamina = this.system.stamina.value;
    
    if (currentStamina < amount) {
      ui.notifications.warn("Not enough Stamina Points!");
      return false;
    }

    await this.update({ 'system.stamina.value': currentStamina - amount });
    return true;
  }

  /**
   * Gain stamina (from Flex)
   */
  async gainStamina(amount = 1) {
    const currentStamina = this.system.stamina.value;
    const maxStamina = this.system.stamina.max;
    const newStamina = Math.min(currentStamina + amount, maxStamina);
    
    await this.update({ 'system.stamina.value': newStamina });
    return newStamina;
  }
}
