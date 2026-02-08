import { HandlebarsApplicationMixin } from "foundry";

/**
 * Base Item Sheet using ApplicationV2
 */
export default class ConanItemSheet extends HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["conan", "sheet", "item"],
    tag: "form",
    form: {
      handler: this.#onSubmitItemForm,
      submitOnChange: true
    },
    actions: {},
    position: {
      width: 520,
      height: 480
    },
    window: {
      resizable: true
    }
  };

  /** @override */
  static PARTS = {
    header: {
      template: "systems/conan-system/templates/item/parts/item-header.hbs"
    },
    tabs: {
      template: "systems/conan-system/templates/item/parts/item-tabs.hbs"
    },
    description: {
      template: "systems/conan-system/templates/item/parts/item-description.hbs"
    },
    attributes: {
      template: "systems/conan-system/templates/item/parts/item-attributes.hbs"
    }
  };

  /**
   * The Item document managed by this sheet
   * @type {ConanItem}
   */
  get item() {
    return this.document;
  }

  /** @override */
  get title() {
    return this.item.name;
  }

  /** @override */
  async _prepareContext(options) {
    const context = {
      item: this.item,
      system: this.item.system,
      fields: this.item.system.schema.fields,
      config: CONFIG.CONAN,
      tabs: this._getTabs(),
      isOwner: this.item.isOwner,
      isEditable: this.isEditable
    };

    return context;
  }

  /**
   * Define available tabs
   * @returns {object}
   * @private
   */
  _getTabs() {
    return {
      description: { 
        id: "description", 
        group: "primary", 
        label: "CONAN.Tabs.Description" 
      },
      attributes: { 
        id: "attributes", 
        group: "primary", 
        label: "CONAN.Tabs.Attributes" 
      }
    };
  }

  /**
   * Handle form submission
   * @param {SubmitEvent} event
   * @param {HTMLFormElement} form
   * @param {FormDataExtended} formData
   */
  static async #onSubmitItemForm(event, form, formData) {
    await this.document.update(formData.object);
  }
}