/**
 * Extended Actor Document for Conan RPG
 */
export default class ConanActor extends Actor {

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Called before embedded items are prepared
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    // Type-specific prepareDerivedData is called automatically by DataModel
  }

  /** @override */
  getRollData() {
    const data = { ...super.getRollData() };

    // Copy attributes for formula access
    if (this.system.attributes) {
      data.attributes = foundry.utils.deepClone(this.system.attributes);
    }

    // Copy defenses
    if (this.system.defenses) {
      data.defenses = foundry.utils.deepClone(this.system.defenses);
    }

    return data;
  }

  /* -------------------------------------------- */
  /*  Resource Management                         */
  /* -------------------------------------------- */

  /**
   * Apply damage to this actor
   * @param {number} amount - Amount of damage to apply
   * @param {object} options - Damage options
   * @param {boolean} options.ignoreAR - Ignore armor rating?
   * @param {string} options.source - Source of damage (for chat)
   * @returns {Promise<object>} Result data
   */
  async takeDamage(amount, options = {}) {
    const {
      ignoreAR = false,
      source = null
    } = options;

    // Validate amount
    if (typeof amount !== "number" || amount < 0) {
      console.warn("Conan | Invalid damage amount:", amount);
      return null;
    }

    let finalDamage = amount;

    // Apply AR for Characters and Antagonists (not Minions)
    if (!ignoreAR && (this.type === "character" || this.type === "antagonist")) {
      const ar = this.system.armor?.rating || 0;
      finalDamage = Math.max(1, amount - ar); // Minimum 1 damage rule
    }

    // Handle damage based on actor type
    let result;
    
    if (this.type === "minion") {
      result = await this._handleMinionDamage(finalDamage);
    } else {
      result = await this._handleLifePointDamage(finalDamage);
    }

    // Create chat notification
    await this._createDamageNotification(finalDamage, result, source);

    return result;
  }

  /**
   * Handle damage for Minions (Threshold system)
   * @param {number} damage - Final damage amount
   * @returns {Promise<object>}
   * @private
   */
  async _handleMinionDamage(damage) {
    const threshold = this.system.threshold?.value || 0;
    const wasHit = this.system.hit || false;

    const result = {
      type: "minion",
      damage,
      threshold,
      wasHit,
      killed: false,
      marked: false
    };

    // Check if damage meets threshold (instant kill)
    if (damage >= threshold) {
      result.killed = true;
      await this.delete();
    } 
    // If already hit, any damage kills
    else if (wasHit) {
      result.killed = true;
      await this.delete();
    }
    // Otherwise, mark as hit
    else {
      result.marked = true;
      await this.update({ "system.hit": true });
    }

    return result;
  }

  /**
   * Handle Life Point damage for Characters/Antagonists
   * @param {number} damage - Final damage amount
   * @returns {Promise<object>}
   * @private
   */
  async _handleLifePointDamage(damage) {
    const currentHP = this.system.health.value;
    const newHP = Math.max(0, currentHP - damage);

    const result = {
      type: "lifePoints",
      damage,
      oldHP: currentHP,
      newHP,
      reduced: newHP === 0,
      died: false
    };

    await this.update({ "system.health.value": newHP });

    // Handle reduction to 0 LP for Characters
    if (newHP === 0 && this.type === "character") {
      result.requiresGritCheck = true;
      await this._handleCharacterReduction();
    }

    return result;
  }

  /**
   * Handle Character reduction to 0 LP
   * @returns {Promise<void>}
   * @private
   */
  async _handleCharacterReduction() {
    const content = await renderTemplate(
      "systems/conan-system/templates/chat/character-reduced.hbs",
      { actor: this }
    );

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content,
      flags: {
        "conan-system": {
          type: "characterReduced",
          actorId: this.id
        }
      }
    });

    ui.notifications.warn(
      game.i18n.format("CONAN.Notifications.CharacterReduced", {
        name: this.name
      })
    );
  }

  /**
   * Create chat notification for damage taken
   * @param {number} damage
   * @param {object} result
   * @param {string} source
   * @returns {Promise<ChatMessage>}
   * @private
   */
  async _createDamageNotification(damage, result, source) {
    const template = "systems/conan-system/templates/chat/damage-taken.hbs";
    const content = await renderTemplate(template, {
      actor: this,
      damage,
      result,
      source
    });

    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content,
      flags: {
        "conan-system": {
          type: "damageTaken",
          damage,
          result
        }
      }
    });
  }

  /**
   * Heal this actor
   * @param {number} amount - Amount to heal
   * @param {object} options - Healing options
   * @param {boolean} options.allowOverheal - Allow healing above max?
   * @param {string} options.source - Source of healing
   * @returns {Promise<object>}
   */
  async heal(amount, options = {}) {
    const {
      allowOverheal = false,
      source = null
    } = options;

    // Only Characters and Antagonists can be healed
    if (this.type === "minion") {
      ui.notifications.warn(game.i18n.localize("CONAN.Warnings.CannotHealMinion"));
      return null;
    }

    if (typeof amount !== "number" || amount < 0) {
      console.warn("Conan | Invalid heal amount:", amount);
      return null;
    }

    const currentHP = this.system.health.value;
    const maxHP = this.system.health.max;
    
    let newHP = currentHP + amount;
    if (!allowOverheal) {
      newHP = Math.min(newHP, maxHP);
    }

    const actualHealing = newHP - currentHP;

    await this.update({ "system.health.value": newHP });

    // Create chat notification
    await this._createHealingNotification(actualHealing, source);

    return {
      amount: actualHealing,
      oldHP: currentHP,
      newHP,
      maxHP,
      overheal: allowOverheal && newHP > maxHP
    };
  }

  /**
   * Create chat notification for healing
   * @param {number} amount
   * @param {string} source
   * @returns {Promise<ChatMessage>}
   * @private
   */
  async _createHealingNotification(amount, source) {
    const template = "systems/conan-system/templates/chat/healing.hbs";
    const content = await renderTemplate(template, {
      actor: this,
      amount,
      source
    });

    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content,
      flags: {
        "conan-system": {
          type: "healing",
          amount
        }
      }
    });
  }

  /**
   * Use a Recovery
   * @returns {Promise<object|null>}
   */
  async useRecovery() {
    // Only Characters have recoveries
    if (this.type !== "character") {
      ui.notifications.warn(game.i18n.localize("CONAN.Warnings.OnlyCharactersRecover"));
      return null;
    }

    const currentRecoveries = this.system.recoveries.value;
    
    if (currentRecoveries <= 0) {
      ui.notifications.warn(game.i18n.localize("CONAN.Warnings.NoRecoveriesRemaining"));
      return null;
    }

    const maxHP = this.system.health.max;
    const healAmount = Math.floor(maxHP * 0.5); // 50% of max LP

    const currentStamina = this.system.stamina.value;
    const maxStamina = this.system.stamina.max;
    const newStamina = Math.min(currentStamina + 1, maxStamina);

    // Update actor
    await this.update({
      "system.recoveries.value": currentRecoveries - 1,
      "system.stamina.value": newStamina
    });

    // Apply healing
    const healResult = await this.heal(healAmount, { 
      source: game.i18n.localize("CONAN.Recovery") 
    });

    // Create chat message
    await this._createRecoveryNotification(healAmount, newStamina - currentStamina);

    return {
      healAmount,
      staminaGained: newStamina - currentStamina,
      recoveriesRemaining: currentRecoveries - 1,
      healResult
    };
  }

  /**
   * Create chat notification for recovery use
   * @param {number} healing
   * @param {number} staminaGained
   * @returns {Promise<ChatMessage>}
   * @private
   */
  async _createRecoveryNotification(healing, staminaGained) {
    const template = "systems/conan-system/templates/chat/recovery.hbs";
    const content = await renderTemplate(template, {
      actor: this,
      healing,
      staminaGained
    });

    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content,
      flags: {
        "conan-system": {
          type: "recovery",
          healing,
          staminaGained
        }
      }
    });
  }

  /**
   * Spend Stamina Points
   * @param {number} amount - Amount to spend
   * @param {object} options - Spend options
   * @param {string} options.reason - Reason for spending (for chat)
   * @returns {Promise<boolean>} Success status
   */
  async spendStamina(amount, options = {}) {
    const { reason = null } = options;

    // Only Characters and Antagonists have stamina
    if (this.type === "minion") {
      return false;
    }

    if (typeof amount !== "number" || amount < 0) {
      console.warn("Conan | Invalid stamina spend amount:", amount);
      return false;
    }

    const currentStamina = this.system.stamina.value;

    if (currentStamina < amount) {
      ui.notifications.warn(game.i18n.localize("CONAN.Warnings.InsufficientStamina"));
      return false;
    }

    await this.update({ 
      "system.stamina.value": currentStamina - amount 
    });

    // Optional: Create chat notification
    if (reason) {
      await this._createStaminaNotification(-amount, reason);
    }

    return true;
  }

  /**
   * Gain Stamina Points
   * @param {number} amount - Amount to gain
   * @param {object} options - Gain options
   * @param {string} options.reason - Reason for gaining
   * @param {boolean} options.allowOvermax - Allow exceeding max?
   * @returns {Promise<number>} New stamina value
   */
  async gainStamina(amount = 1, options = {}) {
    const { 
      reason = null,
      allowOvermax = false 
    } = options;

    // Only Characters and Antagonists have stamina
    if (this.type === "minion") {
      return 0;
    }

    if (typeof amount !== "number" || amount < 0) {
      console.warn("Conan | Invalid stamina gain amount:", amount);
      return this.system.stamina.value;
    }

    const currentStamina = this.system.stamina.value;
    const maxStamina = this.system.stamina.max;
    
    let newStamina = currentStamina + amount;
    if (!allowOvermax) {
      newStamina = Math.min(newStamina, maxStamina);
    }

    await this.update({ "system.stamina.value": newStamina });

    // Optional: Create chat notification
    if (reason) {
      await this._createStaminaNotification(amount, reason);
    }

    return newStamina;
  }

  /**
   * Create chat notification for stamina changes
   * @param {number} amount - Positive for gain, negative for spend
   * @param {string} reason
   * @returns {Promise<ChatMessage>}
   * @private
   */
  async _createStaminaNotification(amount, reason) {
    const template = "systems/conan-system/templates/chat/stamina-change.hbs";
    const content = await renderTemplate(template, {
      actor: this,
      amount,
      reason,
      gained: amount > 0
    });

    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content,
      flags: {
        "conan-system": {
          type: "staminaChange",
          amount,
          reason
        }
      }
    });
  }

  /* -------------------------------------------- */
  /*  Combat Methods                              */
  /* -------------------------------------------- */

  /**
   * Roll a stat check for this actor
   * @param {string} stat - The stat to check
   * @param {object} options - Check options
   * @returns {Promise<object>}
   */
  async rollStatCheck(stat, options = {}) {
    const { rollStatCheck } = game.conan;
    return rollStatCheck(this, stat, options);
  }

  /**
   * Roll initiative for this actor
   * @param {object} options - Initiative options
   * @returns {Promise<object>}
   */
  async rollInitiative(options = {}) {
    // Don't roll Flex die for initiative
    const edgeAttr = this.system.attributes?.edge;
    if (!edgeAttr) {
      ui.notifications.error(game.i18n.localize("CONAN.Errors.NoEdge"));
      return null;
    }

    const formula = `1${edgeAttr.die} + ${edgeAttr.value}`;
    const roll = await new Roll(formula).evaluate();

    const initiativeValue = roll.total;

    // Create chat message
    const template = "systems/conan-system/templates/chat/initiative.hbs";
    const content = await renderTemplate(template, {
      actor: this,
      roll,
      formula,
      total: initiativeValue
    });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.localize("CONAN.Initiative"),
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      rolls: [roll],
      content,
      flags: {
        "conan-system": {
          type: "initiative",
          value: initiativeValue
        }
      }
    });

    return {
      roll,
      value: initiativeValue,
      formula
    };
  }

  /**
   * Apply a condition to this actor
   * @param {string} conditionId - Condition identifier
   * @param {object} options - Condition options
   * @returns {Promise<ActiveEffect|null>}
   */
  async applyCondition(conditionId, options = {}) {
    const condition = CONFIG.CONAN.conditions[conditionId];
    
    if (!condition) {
      console.warn(`Conan | Unknown condition: ${conditionId}`);
      return null;
    }

    const effectData = {
      name: game.i18n.localize(condition.label),
      icon: condition.icon,
      flags: {
        "conan-system": {
          conditionId
        }
      },
      changes: condition.changes || [],
      duration: options.duration || {}
    };

    return this.createEmbeddedDocuments("ActiveEffect", [effectData]);
  }

  /**
   * Remove a condition from this actor
   * @param {string} conditionId - Condition identifier
   * @returns {Promise<void>}
   */
  async removeCondition(conditionId) {
    const effect = this.effects.find(e => 
      e.flags["conan-system"]?.conditionId === conditionId
    );

    if (effect) {
      await effect.delete();
    }
  }

  /**
   * Check if actor has a condition
   * @param {string} conditionId - Condition identifier
   * @returns {boolean}
   */
  hasCondition(conditionId) {
    return this.effects.some(e => 
      e.flags["conan-system"]?.conditionId === conditionId
    );
  }

  /* -------------------------------------------- */
  /*  Helper Methods                              */
  /* -------------------------------------------- */

  /**
   * Check if actor can afford a cost
   * @param {object} cost - Cost definition
   * @param {number} cost.stamina - Stamina cost
   * @param {number} cost.lifePoints - Life Points cost
   * @returns {boolean}
   */
  canAfford(cost = {}) {
    const { stamina = 0, lifePoints = 0 } = cost;

    if (stamina > 0) {
      const currentStamina = this.system.stamina?.value || 0;
      if (currentStamina < stamina) return false;
    }

    if (lifePoints > 0) {
      const currentHP = this.system.health?.value || 0;
      if (currentHP < lifePoints) return false;
    }

    return true;
  }

  /**
   * Get current encumbrance status
   * @returns {boolean}
   */
  isEncumbered() {
    if (this.type !== "character") return false;
    return this.system.encumbrance?.encumbered || false;
  }

  /**
   * Get all modifiers that apply to a specific roll type
   * @param {string} rollType - "check", "attack", "damage", "defense"
   * @param {string} context - Additional context (stat name, weapon type, etc.)
   * @returns {Array<object>} Array of modifier objects
   */
  getModifiersFor(rollType, context = null) {
    const modifiers = [];

    // Encumbrance modifiers (Characters only)
    if (this.type === "character" && this.isEncumbered()) {
      if (rollType === "check" || rollType === "attack") {
        modifiers.push({
          label: "CONAN.Encumbered",
          value: -1,
          source: "encumbrance"
        });
      }
    }

    // Armor modifiers
    const equippedArmor = this.items.find(i => 
      i.type === "armor" && i.system.equipped
    );

    if (equippedArmor) {
      // Sorcery attack penalty
      if (rollType === "attack" && context === "sorcery") {
        const penalty = equippedArmor.system.sorceryModifier;
        if (penalty !== 0) {
          modifiers.push({
            label: equippedArmor.name,
            value: penalty,
            source: "armor"
          });
        }
      }

      // Stealth check penalty
      if (rollType === "check" && context === "stealth") {
        const penalty = equippedArmor.system.stealthModifier;
        if (penalty !== 0) {
          modifiers.push({
            label: equippedArmor.name,
            value: penalty,
            source: "armor"
          });
        }
      }
    }

    // Active Effect modifiers
    for (const effect of this.appliedEffects) {
      for (const change of effect.changes) {
        // Match change to roll type
        // This is a simplified example - expand based on your needs
        if (change.key.includes(rollType)) {
          modifiers.push({
            label: effect.name,
            value: parseInt(change.value) || 0,
            source: "effect"
          });
        }
      }
    }

    // Skill modifiers
    const relevantSkills = this.items.filter(i => 
      i.type === "skill" && 
      i.system.bonus !== 0
    );

    for (const skill of relevantSkills) {
      // Add logic to match skills to roll contexts
      // This is system-specific
      modifiers.push({
        label: skill.name,
        value: skill.system.bonus,
        source: "skill"
      });
    }

    return modifiers;
  }

  /**
   * Get total modifier value for a roll type
   * @param {string} rollType
   * @param {string} context
   * @returns {number}
   */
  getTotalModifier(rollType, context = null) {
    const modifiers = this.getModifiersFor(rollType, context);
    return modifiers.reduce((sum, mod) => sum + mod.value, 0);
  }

  /**
   * Reset resources to Tale start values
   * @returns {Promise<ConanActor>}
   */
  async resetForNewTale() {
    if (this.type !== "character") return this;

    const grit = this.system.attributes.grit.value;

    return this.update({
      "system.stamina.value": grit,
      "system.recoveries.value": this.system.recoveries.max
    });
  }

  /**
   * Perform a long rest (full recovery)
   * @returns {Promise<ConanActor>}
   */
  async longRest() {
    if (this.type !== "character") return this;

    const maxHP = this.system.health.max;
    const grit = this.system.attributes.grit.value;

    await this.update({
      "system.health.value": maxHP,
      "system.stamina.value": grit,
      "system.recoveries.value": this.system.recoveries.max
    });

    // Restore all talent uses
    const talents = this.items.filter(i => i.type === "talent");
    for (const talent of talents) {
      await talent.restoreTalentUses();
    }

    // Create chat notification
    const template = "systems/conan-system/templates/chat/long-rest.hbs";
    const content = await renderTemplate(template, { actor: this });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content,
      flags: {
        "conan-system": {
          type: "longRest"
        }
      }
    });

    return this;
  }
}