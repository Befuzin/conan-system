const { api, sheets } = foundry.applications;

/**
 * Extend the basic ItemSheetV2
 * @extends {ItemSheetV2}
 */
export class ConanItemSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  #tabGroups = {};

  /** @override */
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(
    sheets.ItemSheetV2.DEFAULT_OPTIONS,
    {
      classes: ["conan", "item", "sheet"],
      position: {
        width: 520,
        height: 480,
      },
      sheetConfig: false,
      form: {
        submitOnChange: true,
      },
    }
  );

  /** @override */
  static PARTS = {
    header: {
      template: "systems/conan/templates/item/header.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    details: {
      template: "systems/conan/templates/item/details.hbs",
    },
    description: {
      template: "systems/conan/templates/item/description.hbs",
    },
  };

  /** @override */
  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["header", "tabs", "details", "description"];
  }

  /** @override */
  async _prepareContext(options) {
    const context = {
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      item: this.item,
      system: this.item.system,
      flags: this.item.flags,
      config: CONFIG.CONAN,
      tabs: this._getTabs(options.parts),
    };

    return context;
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case "details":
      case "description":
        context.tab = context.tabs[partId];
        
        if (partId === "description") {
          context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
            this.item.system.description,
            {
              secrets: this.document.isOwner,
              rollData: this.item.getRollData?.() || {},
              relativeTo: this.item,
            }
          );
        }
        break;
    }
    return context;
  }

  /**
   * Generate tab navigation
   */
  _getTabs(parts) {
    const tabGroup = "primary";
    if (!this.#tabGroups[tabGroup]) this.#tabGroups[tabGroup] = "details";
    
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: "",
        group: tabGroup,
        id: "",
        icon: "",
        label: "CONAN.Item.Tabs.",
      };
      
      switch (partId) {
        case "header":
        case "tabs":
          return tabs;
        case "details":
          tab.id = "details";
          tab.label += "Details";
          tab.icon = "fas fa-list";
          break;
        case "description":
          tab.id = "description";
          tab.label += "Description";
          tab.icon = "fas fa-book";
          break;
      }
      
      if (this.#tabGroups[tabGroup] === tab.id) tab.cssClass = "active";
      tabs[partId] = tab;
      return tabs;
    }, {});
  }
}
