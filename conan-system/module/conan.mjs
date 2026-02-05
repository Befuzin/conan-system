/**
 * Conan RPG System for Foundry VTT
 * Author: Your Name
 * Software License: MIT
 */

// Import document classes
import { ConanActor } from "./documents/actor.mjs";
import { ConanItem } from "./documents/item.mjs";

// Import sheet classes
import { ConanActorSheet } from "./sheets/actor-sheet.mjs";
import { ConanItemSheet } from "./sheets/item-sheet.mjs";

// Import helper/utility classes and constants
import { CONAN } from "./helpers/config.mjs";
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { registerHandlebarsHelpers } from "./helpers/handlebars.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {
  console.log('Conan | Initializing Conan RPG System');

  // Add utility classes to the global game object
  game.conan = {
    ConanActor,
    ConanItem,
    rollStatCheck,
    rollAttack,
    rollDamage
  };

  // Add custom constants for configuration
  CONFIG.CONAN = CONAN;

  // Define custom Document classes
  CONFIG.Actor.documentClass = ConanActor;
  CONFIG.Item.documentClass = ConanItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("conan", ConanActorSheet, { 
    makeDefault: true,
    label: "CONAN.SheetLabels.Actor"
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("conan", ConanItemSheet, { 
    makeDefault: true,
    label: "CONAN.SheetLabels.Item"
  });

  // Preload Handlebars templates
  await preloadHandlebarsTemplates();

  // Register Handlebars helpers
  registerHandlebarsHelpers();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', async function() {
  console.log('Conan | System ready');
});

/* -------------------------------------------- */
/*  Dice Rolling Functions                      */
/* -------------------------------------------- */

/**
 * Roll a stat check
 * @param {Object} actor - The actor making the check
 * @param {String} stat - The stat being checked (might, edge, grit, wits)
 * @param {Number} modifier - Additional modifier to the roll
 */
export async function rollStatCheck(actor, stat, modifier = 0) {
  const attributes = actor.system.attributes;
  if (!attributes || !attributes[stat]) {
    ui.notifications.error(`Invalid attribute: ${stat}`);
    return;
  }

  const attribute = attributes[stat];
  const statValue = attribute.value;
  const statDie = attribute.die;
  const flexDie = actor.system.flexDie || 'd10';
  
  const formula = `1${statDie} + ${statValue} + ${modifier} + 1${flexDie}[flex]`;
  
  const roll = await new Roll(formula).evaluate();
  
  // Check for Flex (max value on flex die)
  const flexDieResult = roll.terms.find(t => t.options?.flavor === 'flex');
  const flexRolls = flexDieResult?.results || [];
  const hasFlexTrigger = flexRolls.some(r => r.result === parseInt(flexDie.slice(1)));
  
  // Check for automatic failure (1 on stat die)
  const statDieRoll = roll.terms[0];
  const autoFail = statDieRoll.results?.[0]?.result === 1;
  
  const chatData = {
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${game.i18n.localize(`CONAN.Stats.${stat}`)} Check`,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    rolls: [roll],
    content: await renderTemplate('systems/conan-system/templates/chat/stat-check.hbs', {
      formula: roll.formula,
      total: roll.total,
      hasFlexTrigger,
      autoFail,
      stat: game.i18n.localize(`CONAN.Stats.${stat}`)
    })
  };
  
  ChatMessage.create(chatData);
  
  return roll;
}

/**
 * Roll an attack
 * @param {Object} actor - The attacking actor
 * @param {Object} weapon - The weapon item being used
 * @param {Boolean} focused - Whether this is a focused attack
 */
export async function rollAttack(actor, weapon, focused = false) {
  const weaponType = weapon.system.weaponType;
  const stat = (weaponType === 'ranged' || weaponType === 'thrown') ? 'edge' : 'might';
  const modifier = focused ? 2 : 0;
  
  const attributes = actor.system.attributes;
  if (!attributes || !attributes[stat]) {
    ui.notifications.error(`Invalid attribute: ${stat}`);
    return;
  }

  const attribute = attributes[stat];
  const statValue = attribute.value;
  const statDie = attribute.die;
  const flexDie = actor.system.flexDie || 'd10';
  
  const formula = `1${statDie} + ${statValue} + ${modifier} + 1${flexDie}[flex]`;
  
  const roll = await new Roll(formula).evaluate();
  
  // Check for Flex
  const flexDieResult = roll.terms.find(t => t.options?.flavor === 'flex');
  const flexRolls = flexDieResult?.results || [];
  const hasFlexTrigger = flexRolls.some(r => r.result === parseInt(flexDie.slice(1)));
  
  // Check for automatic failure
  const statDieRoll = roll.terms[0];
  const autoFail = statDieRoll.results?.[0]?.result === 1;
  
  const chatData = {
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${weapon.name} Attack${focused ? ' (Focused)' : ''}`,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    rolls: [roll],
    content: await renderTemplate('systems/conan-system/templates/chat/attack-roll.hbs', {
      formula: roll.formula,
      total: roll.total,
      hasFlexTrigger,
      autoFail,
      weaponName: weapon.name,
      focused
    })
  };
  
  ChatMessage.create(chatData);
  
  return roll;
}

/**
 * Roll damage
 * @param {Object} actor - The attacking actor
 * @param {Object} weapon - The weapon item being used
 * @param {Boolean} massiveDamage - Whether to add massive damage from Flex
 */
export async function rollDamage(actor, weapon, massiveDamage = false) {
  const weaponDamage = weapon.system.damage;
  const weaponType = weapon.system.weaponType;
  
  // Add Might to melee and thrown weapon damage
  const addMight = (weaponType === 'melee' || weaponType === 'thrown');
  const mightValue = addMight ? (actor.system.attributes?.might?.value || 0) : 0;
  
  let formula = weaponDamage;
  if (mightValue > 0) {
    formula += ` + ${mightValue}`;
  }
  
  const roll = await new Roll(formula).evaluate();
  let total = roll.total;
  
  // Add massive damage if Flex was spent
  if (massiveDamage) {
    const maxDie = parseInt(weaponDamage.match(/\d*d(\d+)/)?.[1] || 6);
    total += maxDie;
  }
  
  const chatData = {
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${weapon.name} Damage${massiveDamage ? ' (Massive)' : ''}`,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    rolls: [roll],
    content: await renderTemplate('systems/conan-system/templates/chat/damage-roll.hbs', {
      formula: roll.formula,
      total: total,
      massiveDamage,
      weaponName: weapon.name
    })
  };
  
  ChatMessage.create(chatData);
  
  return { roll, total };
}
