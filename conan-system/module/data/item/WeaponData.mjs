import { SchemaField, NumberField, StringField, ArrayField } from "foundry";

export default class WeaponData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      damage: new StringField({
        required: true,
        blank: false,
        initial: "1d6",
        label: "CONAN.Weapon.Damage",
        hint: "CONAN.Weapon.DamageHint"
      }),
      
      weaponType: new StringField({
        required: true,
        choices: ["melee", "ranged", "thrown"],
        initial: "melee",
        label: "CONAN.Weapon.Type"
      }),
      
      range: new StringField({
        required: true,
        choices: ["touch", "close", "medium", "long", "distant"],
        initial: "touch",
        label: "CONAN.Weapon.Range"
      }),
      
      properties: new ArrayField(
        new StringField({
          required: true,
          blank: false
        }), {
          required: true,
          initial: [],
          label: "CONAN.Weapon.Properties"
        }
      ),
      
      slotsUsed: new NumberField({
        required: true,
        nullable: false,
        min: 0,
        initial: 1,
        label: "CONAN.Weapon.SlotsUsed",
        hint: "CONAN.Weapon.SlotsUsedHint"
      }),
      
      description: new foundry.data.fields.HTMLField({
        required: true,
        blank: true,
        label: "CONAN.Description"
      })
    };
  }

  /**
   * Parse damage die notation to get maximum value
   * @returns {number} Maximum die value (e.g., 6 for "1d6")
   */
  get damageMax() {
    const match = this.damage?.match(/\d*d(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Get number of dice in damage formula
   * @returns {number} Number of dice (e.g., 2 for "2d6")
   */
  get damageDiceCount() {
    const match = this.damage?.match(/(\d*)d\d+/);
    return match ? (match[1] ? parseInt(match[1]) : 1) : 0;
  }

  /**
   * Parse damage die type
   * @returns {string} Die type (e.g., "d6")
   */
  get damageDieType() {
    const match = this.damage?.match(/\d*(d\d+)/);
    return match ? match[1] : "d6";
  }

  /**
   * Check if weapon adds Might to damage
   * @returns {boolean}
   */
  get addsMightToDamage() {
    return this.weaponType === "melee" || this.weaponType === "thrown";
  }

  /**
   * Get the attribute used for Attack rolls
   * @returns {string} "might" or "edge"
   */
  get attackAttribute() {
    return (this.weaponType === "ranged" || this.weaponType === "thrown") 
      ? "edge" 
      : "might";
  }
}