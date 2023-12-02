import { normalizePath, TFile, TFolder } from 'obsidian';
import ObsidianNotepack from 'main';

export default class ObsidianNotepackTemplates {
	plugin: ObsidianNotepack;

	constructor(plugin: ObsidianNotepack) {
		this.plugin = plugin;

		this.plugin.app.workspace.onLayoutReady(() => {
			this.plugin.registerEvent(this.plugin.app.vault.on('create', this.handleCreateFile.bind(this)))
		});
	}

	async getNearestTemplate(folder: TFolder): Promise<string | undefined> {
		const templatePath = await this.getNearestTemplatePath(folder);

		if (templatePath) {
			return this.plugin.app.vault.adapter.read(templatePath);
		}
	}

	async getNearestTemplatePath(folder: TFolder): Promise<string | undefined> {
		const templatePath = normalizePath([folder.path, this.plugin.settings.templateFilename].join('/'));

		if (await this.plugin.app.vault.adapter.exists(templatePath)) {
			return templatePath;
		} else {
			if (folder.parent) {
				return this.getNearestTemplatePath(folder.parent);
			}
		}
	}

	async handleCreateFile(file: TFile) {
		const { parent } = file;

		if (this.plugin.settings.enableTemplate) {
			if (parent) {
				const template = await this.getNearestTemplate(parent);

				if (template) {
					await file.vault.adapter.write(normalizePath(file.path), template);
				}
			}
		}
	}
}
