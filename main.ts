import { Plugin } from 'obsidian';
import { ObsidianNotepackSettings } from './src/interfaces';
import ObsidianNotepackSettingTab from 'src/setting-tab';
import ObsidianNotepackTemplates from 'src/templates';
import { DEFAULT_SETTINGS } from './src/constants';

export default class ObsidianNotepack extends Plugin {
	settings: ObsidianNotepackSettings;

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async onload() {
		await this.loadSettings();

		if (this.settings.enableTemplate) {
			new ObsidianNotepackTemplates(this);
		}

		this.addSettingTab(new ObsidianNotepackSettingTab(this.app, this));
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
