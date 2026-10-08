export type ExpenseCategory = 'housing'|'food'|'transport'|'academic'|'social'|'health'|'wants'|'utilities'|'other';
export type Category = 'planning'|'daily-needs'|'academic'|'transport'|'social'|'health-emergency'|'temptation'|'income'|'campus-life';
export type MoneyDelta = number | {budgetRate:number};
export interface Choice {id:string;label:string;helper:string;cashDelta:MoneyDelta;savingsDelta?:MoneyDelta;stats?:{wellbeing?:number;productivity?:number;discipline?:number};needResolution?:number;expenseCategory?:ExpenseCategory;tags?:string[];feedback:string}
export interface GameEvent {id:string;dayWindow:[number,number];category:Category;also?:Category[];title:string;body:string;illustrationKey:string;scene:string;location:string;weight:number;needWeight?:number;prerequisites?:string[];excludes?:string[];choices:Choice[]}
export interface ScheduledEvent {id:string;day:number}
export interface HistoryEntry {eventId:string;choiceId:string;label:string;day:number;cashDelta:number;savingsDelta:number;wellbeingDelta:number;productivityDelta:number;disciplineDelta:number;expense:number;income:number;expenseCategory?:ExpenseCategory;needResolution?:number;needWeight?:number;tags:string[];feedback:string}
export interface GameState {name:string;initialBudget:number;balance:number;savings:number;wellbeing:number;productivity:number;discipline:number;queue:ScheduledEvent[];index:number;seed:number;history:HistoryEntry[]}
