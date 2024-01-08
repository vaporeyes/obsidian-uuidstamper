import {
	moment,
	App,
	ButtonComponent,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TextComponent,
} from "obsidian";

import { v4 as uuidv4 } from "uuid";

// Remember to rename these classes and interfaces!

interface UUIDStamperPluginSettings {
	uuidFormat: string;
	lastFormat: string;
	newLine: boolean;
}

const DEFAULT_SETTINGS: UUIDStamperPluginSettings = {
	uuidFormat: "long",
	lastFormat: "",
	newLine: false,
};

const logThreshold = 9;
const logger = (logString: string, logLevel = 0): void => {
	if (logLevel <= logThreshold) console.log("UUIDStamper: " + logString);
};
const version = "0.1.0";

export default class UUIDStamperPlugin extends Plugin {
	settings: UUIDStamperPluginSettings;

	async onload() {
		logger("Loading Plugin v" + version, 1);
		logger("Loading Settings... ", 5);
		await this.loadSettings();
		logger("  Done loading settings.", 5);

		this.addSettingTab(new UUIDStamperSettingTab(this.app, this));


		this.addCommand({
			id: "obsidian-fast-uuid-stamp",
			name: "Insert preconfigured UUID stamp",
			editorCallback: (editor) => {
				const uuidStamp = uuidv4();
				if (this.settings.newLine) {
					editor.replaceSelection(uuidStamp + "\n");
					logger("new line", 9);
				} else {
					editor.replaceSelection(uuidStamp);
					logger("no new line", 9);
				}
			},
		});

		this.addCommand({
			id: "obsidian-fast-template-header",
			name: "Insert a template header",
			editorCallback: (editor: Editor) => {
				const now = new Date();
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				const title = view!.file!.basename;
				const stamp = moment(now).format("X");
				const timestampString = stamp.toString();
				const uuidStamp = uuidv4();
				const textToInsert = `---\ncreated: ${timestampString}\ndesc:\nid: ${uuidStamp}\ntitle: ${title}\nupdated: ${stamp}\n---\n`;
				editor.replaceSelection(textToInsert);
			},
		});

// ---
// category: mexican
// cookingtime: 2 min
// id: 995ea82f-5750-4204-91d3-4051749945b6
// ingredients:
// - - masa, corn
//   - 124 g
// - - water
//   - 1 c
// - - salt
//   - 1 tsp
// portions: 1
// preparationtime: 30 min
// recipe: tortillas
// servingsize: 100 g
// tags:
// - recipe
// - food
// - mexican
// totaltime: 32 min
// ---

		this.addCommand({
			id: "obsidian-fast-cooking-template-header",
			name: "Insert a cooking note header",
			editorCallback: (editor: Editor) => {
				const now = new Date();
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				const title = view!.file!.basename;
				const stamp = moment(now).format("X");
				const timestampString = stamp.toString();
				const uuidStamp = uuidv4();
				const textToInsert = `---\ncreated: ${timestampString}\ncategory:\ncookingtime:\nid: ${uuidStamp}\ntitle: ${title}\ningredients:\nportions:\npreparationtime:\nrecipe: ${title}\nservingsize:\ntags:\ntotaltime:\n---\n`;
				editor.replaceSelection(textToInsert);
			},
		});

		this.addCommand({
			id: "obsidian-fast-short-uuid-stamp",
			name: "Insert short preconfigured UUID stamp",
			editorCallback: (editor) => {
				const uuidStamp = uuidv4().slice(0, 8);
				if (this.settings.newLine) {
					editor.replaceSelection(uuidStamp + "\n");
					logger("new line", 9);
				} else {
					editor.replaceSelection(uuidStamp);
					logger("no new line", 9);
				}
			},
		});

		this.addCommand({
			id: "obsidian-fast-zettel-stamp",
			name: "Insert preconfigured zettelkasten id",
			editorCallback: (editor) => {
				const now = new Date();
				const stamp = moment(now).format("YYYYMMDDHHmmss");
				if (this.settings.newLine) {
					editor.replaceSelection(stamp + "\n");
					logger("new line", 9);
				} else {
					editor.replaceSelection(stamp);
					logger("no new line", 9);
				}
			},
		});
	}

	onunload() {
		logger("Bye!", 9);
	}

	async loadSettings() {
		logger("Loading Settings...", 5);
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
		logger("  - UUIDFormat: " + this.settings.uuidFormat, 6);
	}

	async saveSettings() {
		logger("Saving Settings...", 5);
		await this.saveData(this.settings);
		logger("  Done.");
	}
}

class UUIDStamperModal extends Modal {
	constructor(
		app: App,
		editor: Editor,
		settings: UUIDStamperPluginSettings,
		plugin: Plugin
	) {
		super(app);
		this.editor = editor;
		this.settings = settings;
		this.plugin = plugin;
	}

	settings: UUIDStamperPluginSettings;
	editor: Editor;
	plugin: Plugin;

	onOpen() {
		const { contentEl, editor, modalEl } = this;
		const rowClass = "row";
		const divClass = "div";
		const _this = this;
		const doStamp = (): void => {
			const stampFormat = formatComponent.getValue();
			// const uuidStamp = moment(now).format(stampFormat);
			const uuidStamp = uuidv4();
			if (_this.settings.newLine) {
				editor.replaceSelection(uuidStamp + "\n");
				logger("new line", 9);
			} else {
				editor.replaceSelection(uuidStamp);
				logger("no new line", 9);
			}

			// Save entered stamp format to settings
			_this.settings.lastFormat = stampFormat;
			_this.plugin.saveData(_this.settings);
			_this.close();

			editor.scrollIntoView({
				from: editor.getCursor(),
				to: editor.getCursor(),
			});
		};

		modalEl.addClass("uuidtamper-modal");

		// Create label and text field
		const containerEl = document.createElement(divClass);
		containerEl.addClass(rowClass);

		const targetEl = document.createElement(divClass);
		targetEl.addClass("input-wrapper");

		const labelEl = document.createElement(divClass);
		labelEl.addClass("input-label");
		labelEl.setText("Format string:");

		const formatComponent = new TextComponent(targetEl);
		formatComponent.setPlaceholder(
			"e.g. 8a6e0804-2bd0-4672-b79d-d97027f9071a"
		);
		formatComponent.setValue(this.settings.lastFormat);

		// Add listener for <Enter> key
		formatComponent.inputEl.addEventListener("keypress", (keypressed) => {
			if (keypressed.key === "Enter") doStamp();
		});

		// Create Button
		const buttonContainerEl = document.createElement(divClass);
		buttonContainerEl.addClass(rowClass);

		const submitButtonTarget = document.createElement(divClass);
		submitButtonTarget.addClass("button-wrapper");

		const submitButtonComponent = new ButtonComponent(submitButtonTarget);
		submitButtonComponent.setButtonText("Insert UUID");
		submitButtonComponent.setCta();
		submitButtonComponent.onClick(doStamp);
		// submitButtonComponent.buttonEl.addEventListener('click', (e) => doStamp)

		// Add components to layout
		containerEl.appendChild(labelEl);
		containerEl.appendChild(targetEl);
		buttonContainerEl.appendChild(submitButtonTarget);

		contentEl.append(containerEl);
		contentEl.append(buttonContainerEl);

		submitButtonComponent.buttonEl.focus();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class UUIDStamperSettingTab extends PluginSettingTab {
	plugin: UUIDStamperPlugin;

	constructor(app: App, plugin: UUIDStamperPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("UUID Stamp Template")
			.setDesc("Template String for inserting a UUID stamp")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.uuidFormat)
					.onChange(async (value) => {
						logger("Settings update - UUID Stamp: " + value, 5);
						this.plugin.settings.uuidFormat = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Insert line break")
			.setDesc("Add a line break after the UUID stamp")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.newLine)
					.onChange(async (value) => {
						logger(
							"Settings update - Insert Line Break: " + value,
							5
						);
						this.plugin.settings.newLine = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
