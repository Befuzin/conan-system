import ConanItemSheet from "./ConanItemSheet.mjs";

export default class ArmorSheet extends ConanItemSheet {
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: [...super.DEFAULT_OPTIONS.classes, "armor"]
  };

  static PARTS = {
    ...super.PARTS,
    attributes: {
      template: "systems/conan-system/templates/item/armor-attributes.hbs"
    }
  };
}