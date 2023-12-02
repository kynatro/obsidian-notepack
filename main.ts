import { App, Plugin, PluginSettingTab, Setting, TFile, TFolder, TooltipOptions, normalizePath } from 'obsidian';

type ObsidianSettingType = 'text' | 'toggle';

interface ObsidianNotepackSettings {
	enableTemplate: boolean;
	templateFilename: string;
}

interface ObsidianNotepackSetting {
	default: string | boolean;
	desc: string;
	keyName: keyof ObsidianNotepackSettings;
	name: string;
	placeholder?: string;
	tooltip?: string;
	tooltipOptions?: TooltipOptions;
	type: ObsidianSettingType;
}

const PLUGIN_SETTINGS: Array<ObsidianNotepackSetting> = [
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

const DEFAULT_SETTINGS = PLUGIN_SETTINGS.reduce((obj, setting: ObsidianNotepackSetting) => ({
	...obj,
	[setting.keyName]: setting.default
}), {})

export default class ObsidianNotepack extends Plugin {
	settings: ObsidianNotepackSettings;

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async onload() {
		await this.loadSettings();

		this.app.workspace.onLayoutReady(() => {
			this.registerEvent(this.app.vault.on('create', this.handleCreateFile.bind(this)))
		});

		this.addSettingTab(new ObsidianNotepackSettingTab(this.app, this));
	}

	async getNearestTemplate(folder: TFolder): Promise<string | undefined> {
		const templatePath = await this.getNearestTemplatePath(folder);

		if (templatePath) {
			return this.app.vault.adapter.read(templatePath);
		}
	}

	async getNearestTemplatePath(folder: TFolder): Promise<string | undefined> {
		const templatePath = normalizePath([folder.path, this.settings.templateFilename].join('/'));

		if (await this.app.vault.adapter.exists(templatePath)) {
			return templatePath;
		} else {
			if (folder.parent) {
				return this.getNearestTemplatePath(folder.parent);
			}
		}
	}

	async handleCreateFile(file: TFile) {
		const { parent } = file;

		if (this.settings.enableTemplate) {
			if (parent) {
				const template = await this.getNearestTemplate(parent);

				if (template) {
					await file.vault.adapter.write(normalizePath(file.path), template);
				}
			}
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class ObsidianNotepackSettingTab extends PluginSettingTab {
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
