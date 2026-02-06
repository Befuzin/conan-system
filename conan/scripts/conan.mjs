import { CONAN } from "./config.mjs";
import { ConanActor } from "./documents/actor.mjs";
import { ConanItem } from "./documents/item.mjs";
import { ConanActorSheet } from "./sheets/actor-sheet.mjs";
import { ConanItemSheet } from "./sheets/item-sheet.mjs";

/**
 * Initialize the Conan system
 */
Hooks.once("init", function() {
  console.log("Conan | Initializing Conan: The Hyborian Age system");

  // Add configuration to game global
  game.conan = {
    ConanActor,
    ConanItem,
    config: CONAN
  };

  // Make config accessible globally
  CONFIG.CONAN = CONAN;

  // Register document classes
  CONFIG.Actor.documentClass = ConanActor;
  CONFIG.Item.documentClass = ConanItem;

  // Register sheet classes - V13 method
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.BaseActor, "conan", ConanActorSheet, {
    types: ["character", "minion", "antagonist"],
    makeDefault: true,
    label: "CONAN.SheetLabels.Actor"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.BaseItem, "conan", ConanItemSheet, {
    types: ["weapon", "armor", "skill", "spell", "gear"],
    makeDefault: true,
    label: "CONAN.SheetLabels.Item"
  });

  // Register Handlebars helpers
  registerHandlebarsHelpers();

  console.log("Conan | System initialized");
});

/**
 * Register custom Handlebars helpers
 */
function registerHandlebarsHelpers() {
  // Add two numbers
  Handlebars.registerHelper("add", function(a, b) {
    return Number(a) + Number(b);
  });

  // Subtract two numbers
  Handlebars.registerHelper("subtract", function(a, b) {
    return Number(a) - Number(b);
  });

  // Multiply two numbers
  Handlebars.registerHelper("multiply", function(a, b) {
    return Number(a) * Number(b);
  });

  // Divide two numbers
  Handlebars.registerHelper("divide", function(a, b) {
    return Number(a) / Number(b);
  });

  // Get max value from die string (e.g., "d10" returns 10)
  Handlebars.registerHelper("getMaxDie", function(die) {
    return parseInt(die.substring(1));
  });

  // Check if value is less than threshold
  Handlebars.registerHelper("lt", function(a, b) {
    return a < b;
  });

  // Check if value is greater than threshold
  Handlebars.registerHelper("gt", function(a, b) {
    return a > b;
  });

  // Repeat a block n times
  Handlebars.registerHelper("times", function(n, block) {
    let result = "";
    for (let i = 0; i < n; ++i) {
      result += block.fn({ index: i, number: i + 1 });
    }
    return result;
  });

  // Format number with sign
  Handlebars.registerHelper("numberFormat", function(value, options) {
    const num = Number(value);
    if (options.hash.sign) {
      return num >= 0 ? `+${num}` : `${num}`;
    }
    return num;
  });

  // Select helper for dropdowns
  Handlebars.registerHelper("select", function(selected, options) {
    return options.fn(this)
      .replace(new RegExp(' value="' + selected + '"'), '$& selected="selected"')
      .replace(new RegExp('>' + selected + '</option>'), ' selected="selected"$&');
  });

  // Concatenate strings
  Handlebars.registerHelper("concat", function(...args) {
    args.pop(); // Remove Handlebars options
    return args.join("");
  });
}

/**
 * Ready hook - runs when game is ready
 */
Hooks.once("ready", function() {
  console.log("Conan | System ready");
});
