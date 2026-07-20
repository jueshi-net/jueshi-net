export type {
  ModuleDefinition,
  ModuleNavigation,
  ModuleAdminNavigation,
  ModuleRoute,
  NavigationArea,
} from "./types";
export {
  defineModule,
  registerModule,
  getModuleById,
  getEnabledModules,
  getAllModules,
  isModuleEnabled,
  getEnabledNavigation,
  getEnabledAdminNavigation,
  _resetModuleRegistry,
} from "./registry";
