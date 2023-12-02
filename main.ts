import { Plugin, TFile, TFolder, normalizePath } from 'obsidian';
import { ObsidianNotepackSettings } from './interfaces';
import ObsidianNotepackSettingTab from 'setting-tab';
import { DEFAULT_SETTINGS } from './constants';

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
