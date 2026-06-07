export { runHealthRecordAutomation } from './automationEngine';
export type { AutomationEngineResult, AutomationEngineContext } from './automationEngine';
export {
  getMatchingAutomationRule,
  buildAutomatedReminderInput,
  automationRuleLabels,
  automationNoteTag,
  AUTOMATION_NOTE_PREFIX,
} from './automationRules';
export type { AutomationRuleId, AutomationRuleMatch } from './automationRules';
