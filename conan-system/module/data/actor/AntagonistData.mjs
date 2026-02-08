import { SchemaField, NumberField, StringField, HTMLField } from "foundry";
import AttributesData from "./templates/AttributesData.mjs";
import DefensesData from "./templates/DefensesData.mjs";

export default class AntagonistData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      // Core attributes
      attributes: new SchemaField(AttributesData.defineSchema()),
      
      // Defenses
      defenses: new SchemaField(DefensesData.defineSchema()),
      
      // Life Points
      health: new SchemaField({
        value: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 10,
          label: "CONAN.Health.Value"
        }),
        max: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 10,
          label: "CONAN.Health.Max"
        })
      }),
      
      // Stamina (optional for NPCs)
      stamina: new SchemaField({
        value: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 0,
          label: "CONAN.Stamina.Value"
        }),
        max: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 0,
          label: "CONAN.Stamina.Max"
        })
      }),
      
      flexDie: new StringField({
        required: true,
        choices: ["d10", "d8", "d6"],
        initial: "d10",
        label: "CONAN.FlexDie"
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
    this._calculateDefenses();
    this._calculateArmorRating();
  }

  /**
   * Calculate defense values
   */
  _calculateDefenses() {
    for (const [key, defense] of Object.entries(this.defenses)) {
      const attrKey = defense.attribute;
      const attrValue = this.attributes[attrKey]?.value || 0;
      const calculatedValue = attrValue + defense.base;
      defense.value = Math.max(calculatedValue, 5);
    }
  }

  /**
   * Calculate armor rating
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