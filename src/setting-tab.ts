import { App, PluginSettingTab, Setting } from 'obsidian';
import ObsidianNotepack from '../main';
import { ObsidianNotepackSetting } from './interfaces';
import { PLUGIN_SETTINGS } from './constants';

export default class ObsidianNotepackSettingTab extends PluginSettingTab {
	plugin: ObsidianNotepack;

	constructor(app: App, plugin: ObsidianNotepack) {
		super(app, plugin);

		this.plugin = plugin;
	}

	settingFactory(container: HTMLElement, config: ObsidianNotepackSetting) {
		const { desc, keyName, name, type } = config;
		const setting = new Setting(container)
			.setName(name)
			.setDesc(desc)

		switch (type) {
			case 'text':
				setting.addText(text => {
					if (config.placeholder) {
						text.setPlaceholder(config.placeholder)
					}

					text.setValue(this.plugin.settings[keyName].toString())
					text.onChange(async (value) => {
						this.plugin.settings = {
							...this.plugin.settings,
							[keyName]: value
						};
						await this.plugin.saveSettings();
					});
				})
			break;

			case 'toggle':
				setting.addToggle(toggle => {
					if (config.tooltip) {
						toggle.setTooltip(config.tooltip, config.tooltipOptions);
					}

					toggle.setValue(Boolean(this.plugin.settings[keyName]))
					toggle.onChange(async (value) => {
						this.plugin.settings = {
							...this.plugin.settings,
							[keyName]: value
						};
						await this.plugin.saveSettings();
					})
				})
			break;
		}
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		PLUGIN_SETTINGS.forEach(setting => this.settingFactory(containerEl, setting));
	}
}
