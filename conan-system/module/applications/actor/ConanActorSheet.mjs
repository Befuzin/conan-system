import { HandlebarsApplicationMixin } from "foundry";

/**
 * Base Actor Sheet using ApplicationV2
 */
export default class ConanActorSheet extends HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["conan", "sheet", "actor"],
    tag: "form",
    form: {
      handler: this.#onSubmitActorForm,
      submitOnChange: true
    },
    actions: {
      rollStat: this.#onRollStat,
      rollInitiative: this.#onRollInitiative,
      useRecovery: this.#onUseRecovery,
      longRest: this.#onLongRest,
      editItem: this.#onEditItem,
      deleteItem: this.#onDeleteItem,
      createItem: this.#onCreateItem,
      toggleEquipped: this.#onToggleEquipped,
      rollAttack: this.#onRollAttack,
      rollDamage: this.#onRollDamage,
      useTalent: this.#onUseTalent,
      castSpell: this.#onCastSpell
    },
    position: {
      width: 720,
      height: 800
    },
    window: {
      resizable: true
    }
  };

  /** @override */
  static PARTS = {
    header: {
      template: "systems/conan-system/templates/actor/parts/actor-header.hbs"
    },
    tabs: {
      template: "systems/conan-system/templates/actor/parts/actor-tabs.hbs"
    },
    combat: {
      template: "systems/conan-system/templates/actor/parts/actor-combat.hbs"
    },
    spells: {
      template: "systems/conan-system/templates/actor/parts/actor-spells.hbs"
    },
    skills: {
      template: "systems/conan-system/templates/actor/parts/actor-skills.hbs"
    },
    gear: {
      template: "systems/conan-system/templates/actor/parts/actor-gear.hbs"
    },
    notes: {
      template: "systems/conan-system/templates/actor/parts/actor-notes.hbs"
    }
  };

  /**
   * The Actor document managed by this sheet
   * @type {ConanActor}
   */
  get actor() {
    return this.document;
  }

  /** @override */
  get title() {
    return this.actor.name;
  }

  /** @override */
  async _prepareContext(options) {
    const context = {
      actor: this.actor,
      system: this.actor.system,
      fields: this.actor.system.schema.fields,
      config: CONFIG.CONAN,
      tabs: this._getTabs(),
      isOwner: this.actor.isOwner,
      isEditable: this.isEditable,
      cssClass: this.actor.type
    };

    return context;
  }

  /** @override */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);

    switch (partId) {
      case "combat":
        context.weapons = this._prepareWeapons();
        context.armor = this._prepareArmor();
        break;
      case "spells":
        context.spells = this._prepareSpells();
        break;
      case "skills":
        context.skills = this._prepareSkills();
        context.talents = this._prepareTalents();
        break;
      case "gear":
        context.gear = this._prepareGear();
        context.encumbrance = this._prepareEncumbrance();
        break;
    }

    return context;
  }

  /**
   * Prepare weapons for display
   * @returns {Array<object>}
   * @private
   */
  _prepareWeapons() {
    return this.actor.items
      .filter(i => i.type === "weapon")
      .map(weapon => ({
        id: weapon.id,
        name: weapon.name,
        img: weapon.img,
        damage: weapon.system.damage,
        range: weapon.system.range,
        weaponType: weapon.system.weaponType,
        properties: weapon.system.properties
      }));
  }

  /**
   * Prepare armor for display
   * @returns {Array<object>}
   * @private
   */
  _prepareArmor() {
    return this.actor.items
      .filter(i => i.type === "armor")
      .map(armor => ({
        id: armor.id,
        name: armor.name,
        img: armor.img,
        ar: armor.system.armorRating,
        type: armor.system.armorType,
        equipped: armor.system.equipped
      }));
  }

  /**
   * Prepare spells for display
   * @returns {Array<object>}
   * @private
   */
  _prepareSpells() {
    return this.actor.items
      .filter(i => i.type === "spell")
      .map(spell => ({
        id: spell.id,
        name: spell.name,
        img: spell.img,
        cost: spell.system.cost,
        range: spell.system.range
      }));
  }

  /**
   * Prepare skills for display
   * @returns {Array<object>}
   * @private
   */
  _prepareSkills() {
    return this.actor.items
      .filter(i => i.type === "skill")
      .map(skill => ({
        id: skill.id,
        name: skill.name,
        img: skill.img,
        attribute: skill.system.attribute,
        bonus: skill.system.bonus
      }));
  }

  /**
   * Prepare talents for display
   * @returns {Array<object>}
   * @private
   */
  _prepareTalents() {
    return this.actor.items
      .filter(i => i.type === "talent")
      .map(talent => ({
        id: talent.id,
        name: talent.name,
        img: talent.img,
        uses: talent.system.uses,
        hasLimitedUses: talent.system.hasLimitedUses
      }));
  }

  /**
   * Prepare gear for display
   * @returns {Array<object>}
   * @private
   */
  _prepareGear() {
    return this.actor.items
      .filter(i => i.type === "gear")
      .map(item => ({
        id: item.id,
        name: item.name,
        img: item.img,
        quantity: item.system.quantity,
        isBundle: item.system.isBundle
      }));
  }

  /**
   * Prepare encumbrance data
   * @returns {object}
   * @private
   */
  _prepareEncumbrance() {
    if (this.actor.type !== "character") return null;

    return {
      slots: this.actor.system.encumbrance.slots,
      bundleItems: this.actor.system.encumbrance.bundleItems,
      bundleMax: this.actor.system.encumbrance.bundleMax,
      encumbered: this.actor.system.encumbrance.encumbered
    };
  }

  /**
   * Define available tabs
   * @returns {object}
   * @private
   */
  _getTabs() {
    return {
      combat: { 
        id: "combat", 
        group: "primary", 
        label: "CONAN.Tabs.Combat" 
      },
      spells: { 
        id: "spells", 
        group: "primary", 
        label: "CONAN.Tabs.Spells" 
      },
      skills: { 
        id: "skills", 
        group: "primary", 
        label: "CONAN.Tabs.Skills" 
      },
      gear: { 
        id: "gear", 
        group: "primary", 
        label: "CONAN.Tabs.Gear" 
      },
      notes: { 
        id: "notes", 
        group: "primary", 
        label: "CONAN.Tabs.Notes" 
      }
    };
  }

  /* -------------------------------------------- */
  /*  Action Handlers                             */
  /* -------------------------------------------- */

  /**
   * Handle form submission
   * @param {SubmitEvent} event
   * @param {HTMLFormElement} form
   * @param {FormDataExtended} formData
   */
  static async #onSubmitActorForm(event, form, formData) {
    await this.document.update(formData.object);
  }

  /**
   * Roll a stat check
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onRollStat(event, target) {
    event.preventDefault();
    const stat = target.dataset.stat;
    await this.actor.rollStatCheck(stat);
  }

  /**
   * Roll initiative
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onRollInitiative(event, target) {
    event.preventDefault();
    await this.actor.rollInitiative();
  }

  /**
   * Use a recovery
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onUseRecovery(event, target) {
    event.preventDefault();
    await this.actor.useRecovery();
  }

  /**
   * Take a long rest
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onLongRest(event, target) {
    event.preventDefault();
    
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: game.i18n.localize("CONAN.LongRest") },
      content: `<p>${game.i18n.localize("CONAN.LongRestConfirm")}</p>`,
      rejectClose: false,
      modal: true
    });

    if (confirmed) {
      await this.actor.longRest();
    }
  }

  /**
   * Edit an item
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onEditItem(event, target) {
    event.preventDefault();
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) item.sheet.render(true);
  }

  /**
   * Delete an item
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onDeleteItem(event, target) {
    event.preventDefault();
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    const item = this.actor.items.get(itemId);
    
    if (item) {
      const confirmed = await foundry.applications.api.DialogV2.confirm({
        window: { title: game.i18n.localize("CONAN.DeleteItem") },
        content: `<p>${game.i18n.format("CONAN.DeleteItemConfirm", { 
          name: item.name 
        })}</p>`,
        rejectClose: false,
        modal: true
      });

      if (confirmed) {
        await item.delete();
      }
    }
  }

  /**
   * Create a new item
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onCreateItem(event, target) {
    event.preventDefault();
    const itemType = target.dataset.type;
    
    const itemData = {
      name: game.i18n.format("CONAN.NewItem", { 
        type: game.i18n.localize(`CONAN.ItemType.${itemType}`) 
      }),
      type: itemType
    };

    const created = await this.actor.createEmbeddedDocuments("Item", [itemData]);
    created[0]?.sheet.render(true);
  }

  /**
   * Toggle equipped status
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onToggleEquipped(event, target) {
    event.preventDefault();
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) await item.toggleEquipped();
  }

  /**
   * Roll a weapon attack
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onRollAttack(event, target) {
    event.preventDefault();
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    const item = this.actor.items.get(itemId);
    
    if (item) {
      const focused = event.shiftKey;
      await item.rollAttack({ focused });
    }
  }

  /**
   * Roll weapon damage
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onRollDamage(event, target) {
    event.preventDefault();
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    const item = this.actor.items.get(itemId);
    
    if (item) {
      const massiveDamage = event.shiftKey;
      await item.rollDamage({ massiveDamage });
    }
  }

  /**
   * Use a talent
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onUseTalent(event, target) {
    event.preventDefault();
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) await item.useTalent();
  }

  /**
   * Cast a spell
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onCastSpell(event, target) {
    event.preventDefault();
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) await item.cast();
  }
}