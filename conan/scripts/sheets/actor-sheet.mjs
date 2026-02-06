const { api, sheets } = foundry.applications;

/**
 * Extend the basic ActorSheetV2 with Conan-specific functionality
 * @extends {ActorSheetV2}
 */
export class ConanActorSheet extends api.HandlebarsApplicationMixin(
  sheets.ActorSheetV2
) {
  constructor(options = {}) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
  }

  #tabGroups = {};
  #dragDrop;

  /** @override */
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(
    sheets.ActorSheetV2.DEFAULT_OPTIONS,
    {
      classes: ["conan", "actor", "sheet"],
      position: {
        width: 720,
        height: 800,
      },
      sheetConfig: false,
      actions: {
        onEditImage: this._onEditImage,
        viewDoc: this._viewDoc,
        createDoc: this._createDoc,
        deleteDoc: this._deleteDoc,
        toggleEquip: this._onToggleEquip,
        rollStat: this._onRollStat,
        rollAttack: this._onRollAttack,
        rollDamage: this._onRollDamage,
        adjustStamina: this._onAdjustStamina,
        adjustBonus: this._onAdjustBonus,
        useRecovery: this._onUseRecovery,
        castSpell: this._onCastSpell,
        applyDamage: this._onApplyDamage,
      },
      dragDrop: [{ dragSelector: "[data-drag]", dropSelector: null }],
      form: {
        submitOnChange: true,
      },
    }
  );

  /** @override */
  static PARTS = {
    header: {
      template: "systems/conan/templates/actor/header.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    stats: {
      template: "systems/conan/templates/actor/stats.hbs",
    },
    combat: {
      template: "systems/conan/templates/actor/combat.hbs",
    },
    skills: {
      template: "systems/conan/templates/actor/skills.hbs",
    },
    equipment: {
      template: "systems/conan/templates/actor/equipment.hbs",
    },
    spells: {
      template: "systems/conan/templates/actor/spells.hbs",
    },
    biography: {
      template: "systems/conan/templates/actor/biography.hbs",
    },
  };

  /** @override */
  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    
    // Not all parts always render
    options.parts = ["header", "tabs"];
    
    // Don't show the other tabs if only limited view
    if (this.document.limited) return;
    
    // Control which parts show based on document type
    switch (this.document.type) {
      case "character":
        options.parts.push("stats", "combat", "skills", "equipment", "spells", "biography");
        break;
      case "minion":
        options.parts.push("stats", "combat", "equipment");
        break;
      case "antagonist":
        options.parts.push("stats", "combat", "skills", "equipment", "spells");
        break;
    }
  }

  /** @override */
  async _prepareContext(options) {
    const context = {
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      actor: this.actor,
      system: this.actor.system,
      flags: this.actor.flags,
      config: CONFIG.CONAN,
      tabs: this._getTabs(options.parts),
    };

    // Prepare items
    this._prepareItems(context);

    return context;
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case "stats":
      case "combat":
      case "skills":
      case "equipment":
      case "spells":
        context.tab = context.tabs[partId];
        break;
      case "biography":
        context.tab = context.tabs[partId];
        // Enrich biography
        context.enrichedBiography = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
          this.actor.system.biography,
          {
            secrets: this.document.isOwner,
            rollData: this.actor.getRollData(),
            relativeTo: this.actor,
          }
        );
        break;
    }
    return context;
  }

  /**
   * Generate tab navigation
   */
  _getTabs(parts) {
    const tabGroup = "primary";
    if (!this.#tabGroups[tabGroup]) this.#tabGroups[tabGroup] = "stats";
    
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: "",
        group: tabGroup,
        id: "",
        icon: "",
        label: "CONAN.Actor.Tabs.",
      };
      
      switch (partId) {
        case "header":
        case "tabs":
          return tabs;
        case "stats":
          tab.id = "stats";
          tab.label += "Stats";
          tab.icon = "fas fa-dice-d20";
          break;
        case "combat":
          tab.id = "combat";
          tab.label += "Combat";
          tab.icon = "fas fa-crossed-swords";
          break;
        case "skills":
          tab.id = "skills";
          tab.label += "Skills";
          tab.icon = "fas fa-list";
          break;
        case "equipment":
          tab.id = "equipment";
          tab.label += "Equipment";
          tab.icon = "fas fa-suitcase";
          break;
        case "spells":
          tab.id = "spells";
          tab.label += "Spells";
          tab.icon = "fas fa-magic";
          break;
        case "biography":
          tab.id = "biography";
          tab.label += "Biography";
          tab.icon = "fas fa-book";
          break;
      }
      
      if (this.#tabGroups[tabGroup] === tab.id) tab.cssClass = "active";
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  /**
   * Organize items for display
   */
  _prepareItems(context) {
    const weapons = [];
    const armor = [];
    const skills = [];
    const spells = [];
    const gear = [];

    for (let item of this.document.items) {
      switch (item.type) {
        case "weapon":
          weapons.push(item);
          break;
        case "armor":
          armor.push(item);
          break;
        case "skill":
          skills.push(item);
          break;
        case "spell":
          spells.push(item);
          break;
        case "gear":
          gear.push(item);
          break;
      }
    }

    context.weapons = weapons.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.armor = armor.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.skills = skills.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.spells = spells.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.gear = gear.sort((a, b) => (a.sort || 0) - (b.sort || 0));

    // Calculate equipped armor
    context.equippedArmor = armor.filter(a => a.system.equipped);
    context.totalAR = context.equippedArmor.reduce((sum, a) => sum + (a.system.ar || 0), 0);
    context.totalDefenseBonus = context.equippedArmor.reduce((sum, a) => sum + (a.system.defenseBonus || 0), 0);
  }

  /** @override */
  _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element));
    this.#disableOverrides();
  }

  /******************
   * ACTION HANDLERS
   ******************/

  /**
   * Handle editing image
   */
  static async _onEditImage(event, target) {
    const attr = target.dataset.edit;
    const current = foundry.utils.getProperty(this.document, attr);
    const { img } =
      this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ?? {};
    
    const fp = new FilePicker({
      current,
      type: "image",
      redirectToRoot: img ? [img] : [],
      callback: (path) => {
        this.document.update({ [attr]: path });
      },
      top: this.position.top + 40,
      left: this.position.left + 10,
    });
    return fp.browse();
  }

  /**
   * View embedded document
   */
  static async _viewDoc(event, target) {
    const doc = this._getEmbeddedDocument(target);
    doc.sheet.render(true);
  }

  /**
   * Delete embedded document
   */
  static async _deleteDoc(event, target) {
    const doc = this._getEmbeddedDocument(target);
    await doc.delete();
  }

  /**
   * Create embedded document
   */
  static async _createDoc(event, target) {
    const docCls = getDocumentClass(target.dataset.documentClass);
    const docData = {
      name: docCls.defaultName({
        type: target.dataset.type,
        parent: this.actor,
      }),
    };
    
    for (const [dataKey, value] of Object.entries(target.dataset)) {
      if (["action", "documentClass"].includes(dataKey)) continue;
      foundry.utils.setProperty(docData, dataKey, value);
    }

    await docCls.create(docData, { parent: this.actor });
  }

  /**
   * Toggle equipment
   */
  static async _onToggleEquip(event, target) {
    event.preventDefault();
    const li = target.closest("[data-item-id]");
    const item = this.actor.items.get(li.dataset.itemId);
    if (!item) return ui.notifications.warn("Item not found.");

    const equipped = item.system.equipped ?? false;
    await item.update({ "system.equipped": !equipped });

    ui.notifications.info(`${item.name} ${!equipped ? "equipped" : "unequipped"}.`);
  }

  /**
   * Roll a stat check
   */
  static async _onRollStat(event, target) {
    event.preventDefault();
    const stat = target.dataset.stat;
    const difficulty = target.dataset.difficulty 
      ? parseInt(target.dataset.difficulty) 
      : null;

    await this.actor.rollStat(stat, { difficulty });
  }

  /**
   * Roll an attack
   */
  static async _onRollAttack(event, target) {
    event.preventDefault();
    const li = target.closest("[data-item-id]");
    const item = this.actor.items.get(li?.dataset.itemId);
    
    if (!item) return ui.notifications.warn("Weapon not found.");
    
    await item.rollAttack();
  }

  /**
   * Roll damage
   */
  static async _onRollDamage(event, target) {
    event.preventDefault();
    const li = target.closest("[data-item-id]");
    const item = this.actor.items.get(li?.dataset.itemId);
    
    if (!item) return ui.notifications.warn("Weapon not found.");
    
    await item.rollDamage();
  }

  /**
   * Adjust stamina
   */
  static async _onAdjustStamina(event, target) {
    event.preventDefault();
    const delta = parseInt(target.dataset.delta);
    const current = this.actor.system.stamina.value;
    const max = this.actor.system.stats.grit.value;
    
    const newValue = Math.clamped(current + delta, 0, max);
    
    await this.actor.update({ "system.stamina.value": newValue });
  }

  /**
   * Adjust defense bonus
   */
  static async _onAdjustBonus(event, target) {
    event.preventDefault();
    const delta = parseInt(target.dataset.delta);
    const field = target.dataset.field;
    
    const currentBonus = foundry.utils.getProperty(
      this.actor.system,
      `${field}.bonus`
    );
    
    await this.actor.update({
      [`system.${field}.bonus`]: currentBonus + delta
    });
  }

  /**
   * Use recovery
   */
  static async _onUseRecovery(event, target) {
    event.preventDefault();
    await this.actor.useRecovery();
  }

  /**
   * Cast spell
   */
  static async _onCastSpell(event, target) {
    event.preventDefault();
    const li = target.closest("[data-item-id]");
    const item = this.actor.items.get(li?.dataset.itemId);
    
    if (!item) return ui.notifications.warn("Spell not found.");
    
    await item.castSpell();
  }

  /**
   * Apply damage
   */
  static async _onApplyDamage(event, target) {
    event.preventDefault();
    
    // Prompt for damage amount
    new Dialog({
      title: "Apply Damage",
      content: `
        <form>
          <div class="form-group">
            <label>Damage Amount:</label>
            <input type="number" name="damage" value="0" min="0"/>
          </div>
        </form>
      `,
      buttons: {
        apply: {
          label: "Apply",
          callback: async (html) => {
            const damage = parseInt(html.find('[name="damage"]').val());
            await this.actor.applyDamage(damage);
          }
        },
        cancel: {
          label: "Cancel"
        }
      },
      default: "apply"
    }).render(true);
  }

  /**
   * Get embedded document
   */
  _getEmbeddedDocument(target) {
    const docRow = target.closest("li[data-document-class]");
    if (docRow.dataset.documentClass === "Item") {
      return this.actor.items.get(docRow.dataset.itemId);
    }
  }

  /******************
   * DRAG AND DROP
   ******************/

  _canDragStart(selector) {
    return this.isEditable;
  }

  _canDragDrop(selector) {
    return this.isEditable;
  }

  _onDragStart(event) {
    const docRow = event.currentTarget.closest("li");
    if ("link" in event.target.dataset) return;

    let dragData = this._getEmbeddedDocument(docRow)?.toDragData();
    if (!dragData) return;

    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  _onDragOver(event) {}

  async _onDrop(event) {
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
    const actor = this.actor;
    const allowed = Hooks.call("dropActorSheetData", actor, this, data);
    if (allowed === false) return;

    switch (data.type) {
      case "Item":
        return this._onDropItem(event, data);
    }
  }

  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.implementation.fromDropData(data);

    if (this.actor.uuid === item.parent?.uuid) {
      return this._onSortItem(event, item);
    }

    return this._onDropItemCreate(item, event);
  }

  async _onDropItemCreate(itemData, event) {
    itemData = itemData instanceof Array ? itemData : [itemData];
    return this.actor.createEmbeddedDocuments("Item", itemData);
  }

  _onSortItem(event, item) {
    const items = this.actor.items;
    const dropTarget = event.target.closest("[data-item-id]");
    if (!dropTarget) return;
    const target = items.get(dropTarget.dataset.itemId);

    if (item.id === target.id) return;

    const siblings = [];
    for (let el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.itemId;
      if (siblingId && siblingId !== item.id) {
        siblings.push(items.get(el.dataset.itemId));
      }
    }

    const sortUpdates = SortingHelpers.performIntegerSort(item, {
      target,
      siblings,
    });
    const updateData = sortUpdates.map((u) => {
      const update = u.update;
      update._id = u.target._id;
      return update;
    });

    return this.actor.updateEmbeddedDocuments("Item", updateData);
  }

  get dragDrop() {
    return this.#dragDrop;
  }

  #dragDrop;

  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new foundry.applications.ux.DragDrop.implementation(d);
    });
  }

  #disableOverrides() {
    const flatOverrides = foundry.utils.flattenObject(this.actor.overrides);
    for (const override of Object.keys(flatOverrides)) {
      const input = this.element.querySelector(`[name="${override}"]`);
      if (input) {
        input.disabled = true;
      }
    }
  }
}
