import { TooltipOptions } from "obsidian";

export type ObsidianSettingType = 'text' | 'toggle';

export interface ObsidianNotepackSettings {
	enableTemplate: boolean;
	templateFilename: string;
}

export interface ObsidianNotepackSetting {
	default: string | boolean;
	desc: string;
	keyName: keyof ObsidianNotepackSettings;
	name: string;
	placeholder?: string;
	tooltip?: string;
	tooltipOptions?: TooltipOptions;
	type: ObsidianSettingType;
}
