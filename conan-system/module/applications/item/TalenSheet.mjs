import ConanItemSheet from "./ConanItemSheet.mjs";

export default class TalentSheet extends ConanItemSheet {
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: [...super.DEFAULT_OPTIONS.classes, "talent"]
  };

  static PARTS = {
    ...super.PARTS,
    attributes: {
      template: "systems/conan-system/templates/item/talent-attributes.hbs"
    }
  };
}