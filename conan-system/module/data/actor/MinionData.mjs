import { SchemaField, NumberField, BooleanField, HTMLField } from "foundry";

export default class MinionData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      threshold: new SchemaField({
        value: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 5,
          label: "CONAN.Minion.Threshold"
        })
      }),
      
      hit: new BooleanField({
        required: true,
        initial: false,
        label: "CONAN.Minion.Hit"
      }),
      
      defenses: new SchemaField({
        physical: new SchemaField({
          value: new NumberField({
            required: true,
            integer: true,
            min: 0,
            initial: 5,
            label: "CONAN.Defense.Physical"
          })
        })
      }),
      
      armor: new SchemaField({
        rating: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 0,
          label: "CONAN.Armor.Rating"
        })
      }),
      
      biography: new HTMLField({
        required: true,
        blank: true,
        label: "CONAN.Biography"
      })
    };
  }

  prepareDerivedData() {
    this._calculateArmorRating();
  }

  /**
   * Calculate total armor rating from equipped items
   */
  _calculateArmorRating() {
    let totalAR = 0;
    for (const item of this.parent.items) {
      if (item.type === "armor" && item.system.equipped) {
        totalAR += item.system.armorRating || 0;
      }
    }
    this.armor.rating = totalAR;
  }
}