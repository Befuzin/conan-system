/**
 * Extend the base Item document
 */
export class ConanItem extends Item {
  /**
   * Augment the basic item data with additional dynamic data
   */
  prepareData() {
    super.prepareData();
  }

  /**
   * Prepare derived data for the item
   */
  prepareDerivedData() {
    const itemData = this;
    const systemData = itemData.system;

    // Calculate derived values based on item type
    this._prepareWeaponData(itemData);
    this._prepareArmorData(itemData);
  }

  /**
   * Prepare weapon-specific data
   */
  _prepareWeaponData(itemData) {
    if (itemData.type !== "weapon") return;

    const systemData = itemData.system;
    
    // Determine attack stat based on weapon type
    systemData.attackStat = systemData.weaponType === "melee" || systemData.weaponType === "thrown" 
      ? "might" 
      : "edge";

    // Determine if damage adds might
    systemData.addsMight = systemData.weaponType === "melee" || systemData.weaponType === "thrown";
  }

  /**
   * Prepare armor-specific data
   */
  _prepareArmorData(itemData) {
    if (itemData.type !== "armor") return;

    const systemData = itemData.system;

    // Shield provides defense bonus instead of AR
    if (systemData.armorType === "shield") {
      systemData.ar = 0;
      systemData.defenseBonus = 1;
    }
  }

  /**
   * Roll an attack with this weapon
   */
  async rollAttack(options = {}) {
    if (this.type !== "weapon") {
      ui.notifications.warn("Only weapons can make attacks!");
      return;
    }

    const actor = this.actor;
    if (!actor) {
      ui.notifications.warn("This weapon must be on an actor to roll!");
      return;
    }

    const weaponData = this.system;
    const attackStat = weaponData.attackStat;
    const stat = actor.system.stats[attackStat];

    // Prompt for modifier
    const modifier = options.modifier ?? await actor._promptForModifier();

    // Build formula
    const formula = `${stat.die} + ${stat.value} + ${modifier}`;
    const roll = new Roll(formula, actor.getRollData());
    await roll.evaluate();

    // Roll flex die (only for PCs)
    let flexRoll = null;
    let isFlex = false;
    if (actor.type === "character") {
      const flexDie = actor.system.flex.die;
      flexRoll = new Roll(flexDie);
      await flexRoll.evaluate();

      const flexMax = parseInt(flexDie.substring(1));
      isFlex = flexRoll.total === flexMax;
    }

    // Check for critical failure
    const statRoll = roll.terms[0].results[0].result;
    const isCritFail = statRoll === 1;

    // Prepare chat data
    const chatData = {
      actor: actor,
      item: this,
      total: roll.total,
      formula: formula,
      flexTotal: flexRoll?.total,
      isFlex: isFlex,
      isCritFail: isCritFail,
      attackType: weaponData.weaponType,
      range: weaponData.range
    };

    // Render chat card
    const html = await renderTemplate(
      "systems/conan/templates/chat/attack-roll.hbs",
      chatData
    );

    // Send to chat
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      content: html,
      flavor: `${this.name} Attack`
    });

    return roll;
  }

  /**
   * Roll damage with this weapon
   */
  async rollDamage(options = {}) {
    if (this.type !== "weapon") {
      ui.notifications.warn("Only weapons can roll damage!");
      return;
    }

    const actor = this.actor;
    if (!actor) {
      ui.notifications.warn("This weapon must be on an actor to roll!");
      return;
    }

    const weaponData = this.system;
    
    // Build damage formula
    let formula = weaponData.damage.die;
    
    // Add Might for melee/thrown
    if (weaponData.addsMight) {
      formula += ` + ${actor.system.stats.might.value}`;
    }

    // Add weapon bonus
    if (weaponData.damage.bonus) {
      formula += ` + ${weaponData.damage.bonus}`;
    }

    // Add static damage
    if (weaponData.damage.static) {
      formula += ` + ${weaponData.damage.static}`;
    }

    const roll = new Roll(formula, actor.getRollData());
    await roll.evaluate();

    // Roll flex die (only for PCs)
    let flexRoll = null;
    let isFlex = false;
    let massiveDamage = 0;

    if (actor.type === "character") {
      const flexDie = actor.system.flex.die;
      flexRoll = new Roll(flexDie);
      await flexRoll.evaluate();

      const flexMax = parseInt(flexDie.substring(1));
      isFlex = flexRoll.total === flexMax;

      // Calculate potential massive damage
      if (isFlex) {
        const damageDie = weaponData.damage.die;
        const maxDamage = parseInt(damageDie.substring(1));
        massiveDamage = maxDamage;
      }
    }

    // Prepare chat data
    const chatData = {
      actor: actor,
      item: this,
      total: roll.total,
      formula: formula,
      flexTotal: flexRoll?.total,
      isFlex: isFlex,
      massiveDamage: massiveDamage,
      totalWithMassive: roll.total + massiveDamage
    };

    // Render chat card
    const html = await renderTemplate(
      "systems/conan/templates/chat/damage-roll.hbs",
      chatData
    );

    // Send to chat
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      content: html,
      flavor: `${this.name} Damage`
    });

    return roll;
  }

  /**
   * Cast this spell
   */
  async castSpell(options = {}) {
    if (this.type !== "spell") {
      ui.notifications.warn("Only spells can be cast!");
      return;
    }

    const actor = this.actor;
    if (!actor || actor.type !== "character") {
      ui.notifications.warn("Only player characters can cast spells!");
      return;
    }

    const spellData = this.system;

    // Check costs
    if (spellData.cost.life > 0 && actor.system.life.value < spellData.cost.life) {
      ui.notifications.warn("Not enough Life Points to cast this spell!");
      return;
    }

    if (spellData.cost.stamina > 0 && actor.system.stamina.value < spellData.cost.stamina) {
      ui.notifications.warn("Not enough Stamina Points to cast this spell!");
      return;
    }

    // Pay costs
    const updates = {};
    if (spellData.cost.life > 0) {
      updates["system.life.value"] = actor.system.life.value - spellData.cost.life;
    }
    if (spellData.cost.stamina > 0) {
      updates["system.stamina.value"] = actor.system.stamina.value - spellData.cost.stamina;
    }

    if (Object.keys(updates).length > 0) {
      await actor.update(updates);
    }

    // Send chat message
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      content: `<div class="conan chat-card spell-cast">
        <h3>${this.name}</h3>
        <p><strong>${actor.name}</strong> casts ${this.name}!</p>
        <p><em>${spellData.effect}</em></p>
        ${spellData.cost.life > 0 ? `<p>Cost: ${spellData.cost.life} Life Points</p>` : ''}
        ${spellData.cost.stamina > 0 ? `<p>Cost: ${spellData.cost.stamina} Stamina Points</p>` : ''}
      </div>`
    });

    ui.notifications.info(`Cast ${this.name}!`);
  }
}
