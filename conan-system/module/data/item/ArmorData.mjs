import { NumberField, StringField, BooleanField, HTMLField } from "foundry";

export default class ArmorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      armorRating: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0,
        label: "CONAN.Armor.Rating"
      }),
      
      armorType: new StringField({
        required: true,
        choices: ["light", "medium", "heavy"],
        initial: "light",
        label: "CONAN.Armor.Type"
      }),
      
      encumbranceValue: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0,
        label: "CONAN.Armor.Encumbrance",
        hint: "CONAN.Armor.EncumbranceHint"
      }),
      
      equipped: new BooleanField({
        required: true,
        initial: false,
        label: "CONAN.Armor.Equipped"
      }),
      
      description: new HTMLField({
        required: true,
        blank: true,
        label: "CONAN.Description"
      })
    };
  }

  /**
   * Get stipulations based on armor type
   * @returns {Array<string>} Localization keys for stipulations
   */
  get stipulations() {
    const stips = [];
    
    switch (this.armorType) {
      case "light":
        stips.push("CONAN.Armor.Stipulation.LightSorcery");
        stips.push("CONAN.Armor.Stipulation.LightStealth");
        break;
      case "medium":
        stips.push("CONAN.Armor.Stipulation.MediumSorcery");
        stips.push("CONAN.Armor.Stipulation.MediumStealth");
        stips.push("CONAN.Armor.Stipulation.MediumMovement");
        break;
      case "heavy":
        // Heavy armor stipulations if needed
        break;
    }
    
    return stips;
  }

  /**
   * Get sorcery attack modifier
   * @returns {number}
   */
  get sorceryModifier() {
    switch (this.armorType) {
      case "light": return -1;
      case "medium": return -2;
      default: return 0;
    }
  }

  /**
   * Get stealth check modifier
   * @returns {number}
   */
  get stealthModifier() {
    switch (this.armorType) {
      case "light": return -1;
      case "medium": return -2;
      default: return 0;
    }
  }
}