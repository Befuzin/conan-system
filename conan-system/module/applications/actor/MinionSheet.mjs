import ConanActorSheet from "./ConanActorSheet.mjs";

/**
 * Minion-specific sheet
 */
export default class MinionSheet extends ConanActorSheet {

  /** @override */
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: [...super.DEFAULT_OPTIONS.classes, "minion"],
    position: {
      width: 520,
      height: 600
    }
  };

  /** @override */
  static PARTS = {
    header: {
      template: "systems/conan-system/templates/actor/minion-header.hbs"
    },
    tabs: {
      template: "systems/conan-system/templates/actor/parts/actor-tabs.hbs"
    },
    combat: {
      template: "systems/conan-system/templates/actor/parts/actor-combat.hbs"
    },
    notes: {
      template: "systems/conan-system/templates/actor/parts/actor-notes.hbs"
    }
  };

  /** @override */
  _getTabs() {
    return {
      combat: { 
        id: "combat", 
        group: "primary", 
        label: "CONAN.Tabs.Combat" 
      },
      notes: { 
        id: "notes", 
        group: "primary", 
        label: "CONAN.Tabs.Notes" 
      }
    };
  }
}