/**
 * Extend the basic ItemSheet
 */
export class ConanItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["conan", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/conan-system/templates/item";
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /** @override */
  async getData() {
    const context = super.getData();

    // Use a safe clone of the item data for further operations
    const itemData = this.item.toObject(false);

    // Retrieve the roll data for TinyMCE editors
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the item's system data to context for easier access
    context.system = itemData.system;
    context.flags = itemData.flags;

    // Add config data
    context.config = CONFIG.CONAN;

    // Prepare type-specific data
    if (itemData.type === 'weapon') {
      this._prepareWeaponData(context);
    }

    return context;
  }

  /**
   * Prepare weapon-specific data
   */
  _prepareWeaponData(context) {
    // Add any weapon-specific preparations here
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers for clickable elements
    html.find('.rollable').click(this._onRoll.bind(this));
  }

  /**
   * Handle clickable rolls
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        this.item.roll();
      }
    }

    // Handle rolls that supply the formula
    if (dataset.roll) {
      let label = dataset.label ? `[${this.item.type}] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.item.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }
}
