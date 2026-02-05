import { rollStatCheck } from "../conan.mjs";

/**
 * Extend the basic ActorSheet
 */
export class ConanActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["conan", "sheet", "actor"],
      width: 720,
      height: 800,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
    });
  }

  /** @override */
  get template() {
    return `systems/conan-system/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /** @override */
  async getData() {
    const context = super.getData();

    // Use a safe clone of the actor data for further operations
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context for easier access
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items
    if (actorData.type === 'character') {
      this._prepareCharacterData(context);
      this._prepareItems(context);
    }

    // Prepare antagonist data
    if (actorData.type === 'antagonist') {
      this._prepareAntagonistData(context);
      this._prepareItems(context);
    }

    // Prepare minion data
    if (actorData.type === 'minion') {
      this._prepareMinionData(context);
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = this._prepareActiveEffects();

    // Add config data
    context.config = CONFIG.CONAN;

    return context;
  }

  /**
   * Organize and classify Items for Character sheets
   */
  _prepareCharacterData(context) {
    // Nothing specific for now
  }

  /**
   * Organize and classify Items for Antagonist sheets
   */
  _prepareAntagonistData(context) {
    // Nothing specific for now
  }

  /**
   * Organize and classify Items for Minion sheets
   */
  _prepareMinionData(context) {
    // Nothing specific for now
  }

  /**
   * Organize and classify Items for all sheets
   */
  _prepareItems(context) {
    // Initialize containers
    const weapons = [];
    const armor = [];
    const gear = [];
    const spells = [];
    const skills = [];
    const talents = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      
      // Append to appropriate array
      if (i.type === 'weapon') {
        weapons.push(i);
      }
      else if (i.type === 'armor') {
        armor.push(i);
      }
      else if (i.type === 'gear') {
        gear.push(i);
      }
      else if (i.type === 'spell') {
        spells.push(i);
      }
      else if (i.type === 'skill') {
        skills.push(i);
      }
      else if (i.type === 'talent') {
        talents.push(i);
      }
    }

    // Assign organized items to the context
    context.weapons = weapons;
    context.armor = armor;
    context.gear = gear;
    context.spells = spells;
    context.skills = skills;
    context.talents = talents;
  }

  /**
   * Prepare active effects for display
   */
  _prepareActiveEffects() {
    const categories = {
      temporary: {
        type: "temporary",
        label: game.i18n.localize("CONAN.Effects.Temporary"),
        effects: []
      },
      passive: {
        type: "passive",
        label: game.i18n.localize("CONAN.Effects.Passive"),
        effects: []
      },
      inactive: {
        type: "inactive",
        label: game.i18n.localize("CONAN.Effects.Inactive"),
        effects: []
      }
    };

    for (let e of this.actor.allApplicableEffects()) {
      if (e.disabled) categories.inactive.effects.push(e);
      else if (e.isTemporary) categories.temporary.effects.push(e);
      else categories.passive.effects.push(e);
    }

    return categories;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Edit Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Rollable stats
    html.find('.rollable.stat').click(this._onRollStat.bind(this));

    // Weapon attack rolls
    html.find('.weapon-attack').click(this._onWeaponAttack.bind(this));
    html.find('.weapon-damage').click(this._onWeaponDamage.bind(this));

    // Equip/unequip armor
    html.find('.item-toggle').click(this._onItemToggle.bind(this));

    // Use recovery
    html.find('.use-recovery').click(this._onUseRecovery.bind(this));

    // Drag events for macros
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = duplicate(header.dataset);
    const name = game.i18n.format("CONAN.ItemNew", { type: type.capitalize() });
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    delete itemData.system["type"];

    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls for stats
   */
  _onRollStat(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.stat) {
      rollStatCheck(this.actor, dataset.stat, 0);
    }
  }

  /**
   * Handle weapon attack rolls
   */
  async _onWeaponAttack(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const itemId = element.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);

    if (item) {
      // Check if shift is held for focused attack
      const focused = event.shiftKey;
      if (focused) {
        const hasStamina = await this.actor.spendStamina(2);
        if (!hasStamina) return;
      }
      await item.rollAttack(focused);
    }
  }

  /**
   * Handle weapon damage rolls
   */
  async _onWeaponDamage(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const itemId = element.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);

    if (item) {
      // Check if shift is held for massive damage
      const massive = event.shiftKey;
      await item.rollDamage(massive);
    }
  }

  /**
   * Handle toggling equipped state
   */
  async _onItemToggle(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const itemId = element.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);

    if (item) {
      await item.update({ 'system.equipped': !item.system.equipped });
    }
  }

  /**
   * Handle using a recovery
   */
  async _onUseRecovery(event) {
    event.preventDefault();
    await this.actor.useRecovery();
  }
}
