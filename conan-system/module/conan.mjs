import ConanActor from "./documents/ConanActor.mjs";
import CharacterData from "./data/actor/CharacterData.mjs";
import MinionData from "./data/actor/MinionData.mjs";
import AntagonistData from "./data/actor/AntagonistData.mjs";
import ConanItem from "./documents/ConanItem.mjs";
import WeaponData from "./data/item/WeaponData.mjs";
import ArmorData from "./data/item/ArmorData.mjs";
import GearData from "./data/item/GearData.mjs";
import SpellData from "./data/item/SpellData.mjs";
import SkillData from "./data/item/SkillData.mjs";
import TalentData from "./data/item/TalentData.mjs";
import ConanRolls from "./dice/ConanRolls.mjs";
import FlexProcessor from "./dice/FlexProcessor.mjs";
import GritCheckHandler from "./chat/GritCheckHandler.mjs";
import ChatListeners from "./chat/ChatListeners.mjs";
import ArmorSheet from "./applications/item/ArmorSheet.mjs";
import GearSheet from "./applications/item/GearSheet.mjs";
import SpellSheet from "./applications/item/SpellSheet.mjs";
import SkillSheet from "./applications/item/SkillSheet.mjs";
import TalentSheet from "./applications/item/TalentSheet.mjs";

Hooks.once("init", () => {
  CONFIG.Actor.documentClass = ConanActor;
  CONFIG.Actor.dataModels = {
    character: CharacterData,
    minion: MinionData,
    antagonist: AntagonistData

    
  };
    CONFIG.Item.documentClass = ConanItem;
  CONFIG.Item.dataModels = {
    weapon: WeaponData,
    armor: ArmorData,
    gear: GearData,
    spell: SpellData,
    skill: SkillData,
    talent: TalentData
    
  };

  // Add roll services to global namespace
  game.conan = {
    ConanActor,
    ConanItem,
    rollStatCheck: ConanRolls.rollStatCheck.bind(ConanRolls),
    rollAttack: ConanRolls.rollAttack.bind(ConanRolls),
    rollDamage: ConanRolls.rollDamage.bind(ConanRolls),
    rolls: ConanRolls,
    flex: FlexProcessor
    
  };


    Items.registerSheet("conan-system", WeaponSheet, {
    types: ["weapon"],
    makeDefault: true,
    label: "CONAN.SheetLabels.Weapon"
  });
  
  Items.registerSheet("conan-system", ArmorSheet, {
    types: ["armor"],
    makeDefault: true,
    label: "CONAN.SheetLabels.Armor"
  });
  
  Items.registerSheet("conan-system", GearSheet, {
    types: ["gear"],
    makeDefault: true,
    label: "CONAN.SheetLabels.Gear"
  });
  
  Items.registerSheet("conan-system", SpellSheet, {
    types: ["spell"],
    makeDefault: true,
    label: "CONAN.SheetLabels.Spell"
  });
  
  Items.registerSheet("conan-system", SkillSheet, {
    types: ["skill"],
    makeDefault: true,
    label: "CONAN.SheetLabels.Skill"
  });
  
  Items.registerSheet("conan-system", TalentSheet, {
    types: ["talent"],
    makeDefault: true,
    label: "CONAN.SheetLabels.Talent"
  });

  
GritCheckHandler.init();
  ChatListeners.init();
  console.log("Conan | Roll services initialized");

  

  

});
