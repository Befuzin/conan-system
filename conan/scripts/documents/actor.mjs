/**
 * Extend the base Actor document
 */
export class ConanActor extends Actor {
  /**
   * Augment the basic actor data with additional dynamic data
   */
  prepareData() {
    super.prepareData();
  }

  /**
   * Prepare derived data for the actor
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.conan || {};

    // Calculate derived values based on actor type
    this._prepareCharacterData(actorData);
    this._prepareMinionData(actorData);
    this._prepareAntagonistData(actorData);
  }

  /**
   * Prepare character-specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== "character") return;

    const systemData = actorData.system;

    // Set stamina max to Grit value
    systemData.stamina.max = systemData.stats.grit.value;

    // Calculate total defense values
    systemData.defense.physical.total = 
      systemData.defense.physical.base + systemData.defense.physical.bonus;
    systemData.defense.sorcery.total = 
      systemData.defense.sorcery.base + systemData.defense.sorcery.bonus;

    // Calculate initiative bonus from Edge
    systemData.initiative.total = systemData.stats.edge.value + systemData.initiative.bonus;
  }

  /**
   * Prepare minion-specific data
   */
  _prepareMinionData(actorData) {
    if (actorData.type !== "minion") return;

    const systemData = actorData.system;

    // Calculate total defense values
    systemData.defense.physical.total = 
      systemData.defense.physical.base + systemData.defense.physical.bonus;
    systemData.defense.sorcery.total = 
      systemData.defense.sorcery.base + systemData.defense.sorcery.bonus;
  }

  /**
   * Prepare antagonist-specific data
   */
  _prepareAntagonistData(actorData) {
    if (actorData.type !== "antagonist") return;

    const systemData = actorData.system;

    // Calculate total defense values
    systemData.defense.physical.total = 
      systemData.defense.physical.base + systemData.defense.physical.bonus;
    systemData.defense.sorcery.total = 
      systemData.defense.sorcery.base + systemData.defense.sorcery.bonus;
  }

  /**
   * Roll a stat check
   */
  async rollStat(statKey, options = {}) {
    const stat = this.system.stats[statKey];
    if (!stat) return;

    // Prompt for modifier (Rule of Three)
    const modifier = options.modifier ?? await this._promptForModifier();

    // Build formula
    const statDie = stat.die;
    const statValue = stat.value;
    const formula = `${statDie} + ${statValue} + ${modifier}`;

    // Roll stat check
    const roll = new Roll(formula, this.getRollData());
    await roll.evaluate();

    // Roll flex die (only for PCs)
    let flexRoll = null;
    let isFlex = false;
    if (this.type === "character") {
      const flexDie = this.system.flex.die;
      flexRoll = new Roll(flexDie);
      await flexRoll.evaluate();

      // Check if flex triggered
      const flexMax = parseInt(flexDie.substring(1));
      isFlex = flexRoll.total === flexMax;
    }

    // Check for critical failure (rolling a 1)
    const statRoll = roll.terms[0].results[0].result;
    const isCritFail = statRoll === 1;

    // Prepare chat data
    const chatData = {
      actor: this,
      stat: statKey,
      statLabel: CONFIG.CONAN.stats[statKey],
      total: roll.total,
      formula: formula,
      flexTotal: flexRoll?.total,
      isFlex: isFlex,
      isCritFail: isCritFail,
      difficulty: options.difficulty
    };

    // Render chat card
    const html = await renderTemplate(
      "systems/conan/templates/chat/stat-check.hbs",
      chatData
    );

    // Send to chat
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: html,
      flavor: `${CONFIG.CONAN.stats[statKey]} Check`
    });

    return roll;
  }

  /**
   * Prompt for modifier (Rule of Three)
   */
  async _promptForModifier() {
    return new Promise((resolve) => {
      new Dialog({
        title: "Check Modifier",
        content: `
          <form>
            <div class="form-group">
              <label>Modifier (Rule of Three):</label>
              <select name="modifier">
                <option value="-3">-3 (Severe Disadvantage)</option>
                <option value="-2">-2 (Disadvantage)</option>
                <option value="-1">-1 (Minor Disadvantage)</option>
                <option value="0" selected>0 (No Modifier)</option>
                <option value="1">+1 (Minor Advantage)</option>
                <option value="2">+2 (Advantage)</option>
                <option value="3">+3 (Major Advantage)</option>
              </select>
            </div>
          </form>
        `,
        buttons: {
          ok: {
            label: "Roll",
            callback: (html) => {
              const modifier = parseInt(html.find('[name="modifier"]').val());
              resolve(modifier);
            }
          }
        },
        default: "ok",
        close: () => resolve(0)
      }).render(true);
    });
  }

  /**
   * Apply damage to the actor
   */
  async applyDamage(damage, options = {}) {
    if (this.type === "minion") {
      return this._applyMinionDamage(damage);
    } else {
      return this._applyLifePointDamage(damage, options);
    }
  }

  /**
   * Apply damage to minion (threshold system)
   */
  async _applyMinionDamage(damage) {
    const threshold = this.system.threshold.value;
    const wasHit = this.system.isHit;

    if (damage >= threshold || (wasHit && damage >= 1)) {
      // Minion is killed
      ui.notifications.info(`${this.name} has been slain!`);
      
      // Mark token as defeated
      const token = this.token || this.getActiveTokens()[0];
      if (token) {
        await token.toggleCombatant();
        await token.toggleOverlay(CONFIG.controlIcons.defeated);
      }
    } else if (damage > 0) {
      // Mark as hit
      await this.update({ "system.isHit": true });
      ui.notifications.info(`${this.name} has been wounded!`);
    }
  }

  /**
   * Apply damage to life points (PCs and Antagonists)
   */
  async _applyLifePointDamage(damage, options = {}) {
    const currentLife = this.system.life.value;
    const newLife = Math.max(0, currentLife - damage);

    await this.update({ "system.life.value": newLife });

    if (newLife === 0 && this.type === "character") {
      // Character is down - needs Grit check
      ui.notifications.warn(`${this.name} has fallen! Make a Grit check (Difficulty 8) to survive!`);
    } else if (newLife === 0) {
      ui.notifications.info(`${this.name} has been defeated!`);
    }

    return newLife;
  }

  /**
   * Use a recovery (PCs only)
   */
  async useRecovery() {
    if (this.type !== "character") {
      ui.notifications.warn("Only player characters can use recoveries!");
      return;
    }

    const recoveries = this.system.recoveries;
    
    if (recoveries.value <= 0) {
      ui.notifications.warn("No recoveries remaining!");
      return;
    }

    // Calculate life gained (50% of max)
    const maxLife = this.system.life.max;
    const lifeGained = Math.ceil(maxLife * 0.5);
    const newLife = Math.min(
      this.system.life.value + lifeGained,
      maxLife
    );

    // Gain 1 stamina point
    const newStamina = this.system.stamina.value + 1;

    // Update actor
    await this.update({
      "system.life.value": newLife,
      "system.stamina.value": newStamina,
      "system.recoveries.value": recoveries.value - 1
    });

    // Send chat message
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `<div class="conan chat-card recovery">
        <h3>Recovery</h3>
        <p><strong>${this.name}</strong> takes a recovery!</p>
        <ul>
          <li>Regained ${lifeGained} Life Points</li>
          <li>Gained 1 Stamina Point</li>
          <li>${recoveries.value - 1} recoveries remaining</li>
        </ul>
      </div>`
    });

    ui.notifications.info(
      `Recovered ${lifeGained} Life Points and gained 1 Stamina Point!`
    );
  }

  /**
   * Get roll data for this actor
   */
  getRollData() {
    const data = super.getRollData();
    
    // Add stats to roll data
    if (this.system.stats) {
      for (let [key, stat] of Object.entries(this.system.stats)) {
        data[key] = stat.value;
      }
    }

    return data;
  }
}
