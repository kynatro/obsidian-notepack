import { ObsidianNotepackSetting } from './interfaces';

export const PLUGIN_SETTINGS: Array<ObsidianNotepackSetting> = [
	{
		desc: 'Enable automatic templates to be applied to new files. Finds the closest file matching the "Template filename" option and pre-populates the new file with the template file\'s contents.',
		name: 'Enable templates',
		keyName: 'enableTemplate',
		type: 'toggle',
		default: true
	},
	{
		desc: 'File name to search for in folders and use as a template',
		name: 'Template filename',
		keyName: 'templateFilename',
		placeholder: 'Enter a filename',
		type: 'text',
		default: '.template'
	}
]

export const DEFAULT_SETTINGS = PLUGIN_SETTINGS.reduce((obj, setting: ObsidianNotepackSetting) => ({
	...obj,
	[setting.keyName]: setting.default
}), {})
