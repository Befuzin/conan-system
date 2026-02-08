import { SchemaField, NumberField, StringField } from "foundry";
import AttributesData from "./templates/AttributesData.mjs";
import DefensesData from "./templates/DefensesData.mjs";

export default class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      // Core attributes
      attributes: new SchemaField(AttributesData.defineSchema()),
      
      // Defenses
      defenses: new SchemaField(DefensesData.defineSchema()),
      
      // Character-specific fields
      origin: new StringField({
        required: true,
        blank: true,
        initial: "",
        label: "CONAN.Character.Origin"
      }),
      
      baseLifePoints: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 26,
        label: "CONAN.Character.BaseLifePoints"
      }),
      
      // Resources
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
      
      stamina: new SchemaField({
        value: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 1,
          label: "CONAN.Stamina.Value"
        }),
        max: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 1,
          label: "CONAN.Stamina.Max"
        })
      }),
      
      recoveries: new SchemaField({
        value: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 2,
          label: "CONAN.Recoveries.Value"
        }),
        max: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 2,
          label: "CONAN.Recoveries.Max"
        })
      }),
      
      flexDie: new StringField({
        required: true,
        choices: ["d10", "d8", "d6"],
        initial: "d10",
        label: "CONAN.Character.FlexDie"
      }),
      
      // Armor
      armor: new SchemaField({
        rating: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 0,
          label: "CONAN.Armor.Rating"
        })
      }),
      
      // Encumbrance
      encumbrance: new SchemaField({
        slots: new SchemaField({
          used: new NumberField({
            required: true,
            integer: true,
            min: 0,
            initial: 0,
            label: "CONAN.Encumbrance.SlotsUsed"
          }),
          max: new NumberField({
            required: true,
            integer: true,
            min: 0,
            initial: 3,
            label: "CONAN.Encumbrance.SlotsMax"
          })
        }),
        bundleItems: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 0,
          label: "CONAN.Encumbrance.BundleItems"
        }),
        bundleMax: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 5,
          label: "CONAN.Encumbrance.BundleMax"
        }),
        encumbered: new foundry.data.fields.BooleanField({
          required: true,
          initial: false,
          label: "CONAN.Encumbrance.Encumbered"
        })
      }),
      
      // Biography
      biography: new foundry.data.fields.HTMLField({
        required: true,
        blank: true,
        label: "CONAN.Biography"
      })
    };
  }

  /**
   * Prepare derived data for Characters
   */
  prepareDerivedData() {
    this._calculateDefenses();
    this._calculateLifePoints();
    this._calculateStamina();
    this._calculateEncumbrance();
  }

  /**
   * Calculate defense values based on attributes
   * Formula: Attribute + base (usually 2), minimum 5
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
   * Calculate max Life Points: (Grit × 2) + baseLifePoints
   */
  _calculateLifePoints() {
    const gritValue = this.attributes.grit?.value || 1;
    this.health.max = (gritValue * 2) + this.baseLifePoints;
  }

  /**
   * Set max stamina to Grit value
   */
  _calculateStamina() {
    this.stamina.max = this.attributes.grit?.value || 1;
  }

  /**
   * Calculate encumbrance status
   */
  _calculateEncumbrance() {
    const mightValue = this.attributes.might?.value || 0;
    
    let slotsUsed = 0;
    let bundleItems = 0;
    let totalAR = 0;
    let equippedArmorEncumbrance = 0;

    // Count equipment from owned items
    for (const item of this.parent.items) {
      if (item.type === "weapon") {
        slotsUsed += item.system.slotsUsed || 1;
      } else if (item.type === "armor" && item.system.equipped) {
        totalAR += item.system.armorRating || 0;
        equippedArmorEncumbrance = item.system.encumbranceValue || 0;
      } else if (item.type === "gear" && item.system.isBundle) {
        bundleItems += item.system.quantity || 0;
      }
    }

    this.encumbrance.slots.used = slotsUsed;
    this.encumbrance.bundleItems = bundleItems;
    this.armor.rating = totalAR;

    // Determine encumbered status
    const slotsOver = slotsUsed > this.encumbrance.slots.max;
    const bundleOver = bundleItems > this.encumbrance.bundleMax;
    const armorTooHeavy = equippedArmorEncumbrance > mightValue;

    this.encumbrance.encumbered = slotsOver || bundleOver || armorTooHeavy;
  }
}