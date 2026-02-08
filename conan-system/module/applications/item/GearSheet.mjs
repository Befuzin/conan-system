import ConanItemSheet from "./ConanItemSheet.mjs";

export default class GearSheet extends ConanItemSheet {
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: [...super.DEFAULT_OPTIONS.classes, "gear"]
  };

  static PARTS = {
    ...super.PARTS,
    attributes: {
      template: "systems/conan-system/templates/item/gear-attributes.hbs"
    }
  };
}