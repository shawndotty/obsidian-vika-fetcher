import { Notice, Plugin } from "obsidian";
import { t } from "./lang/helpers";
import type { FetchSourceSetting, ObDBFetcherSettings } from "./src/types";
import { FetchSourceSettingsTab } from "./src/settings";
import { VikaFetcher } from "./src/VikaFetcher";

// 扩展 App 类型以包含 commands 属性
declare module "obsidian" {
	interface App {
		commands: {
			removeCommand(id: string): void;
		};
	}
}

// Remember to rename these classes and interfaces!

const DEFAULT_SETTINGS: ObDBFetcherSettings = {
	fetchSources: [
		{
			name: t("Untitled"),
			url: "https://vika.cn/workbench/dst...",
			apiKey: "",
			path: "",
			willExport: true,
		},
	],
};

export default class ObDBFetcher extends Plugin {
	settings: ObDBFetcherSettings;
	private commandIds: Set<string> = new Set(); // 跟踪已注册的命令ID

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new FetchSourceSettingsTab(this.app, this));
		// 初始注册命令
		this.registerFetchSourceCommands();
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);

		// 确保每个fetchSource都有唯一ID
		this.settings.fetchSources.forEach(
			(fetchSource: FetchSourceSetting) => {
				if (!fetchSource.id) {
					fetchSource.id = this.generateUniqueId();
				}
			}
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// 生成唯一ID（使用时间戳+随机数）
	generateUniqueId(): string {
		return `fetch-source-${Date.now()}-${Math.floor(
			Math.random() * 10000
		)}`;
	}

	// 注册所有获取源命令
	private registerFetchSourceCommands() {
		// 先移除所有旧命令
		this.unregisterAllCommands();

		this.settings.fetchSources.forEach(
			(fetchSource: FetchSourceSetting) => {
				const commandId = `open-${fetchSource.id}`;

				this.addCommand({
					id: commandId,
					name: t("Fetch {{name}}", { name: fetchSource.name }),
					callback: async () => {
						// 实际执行操作 - 这里示例为打开URL

						await new VikaFetcher(
							fetchSource,
							this.app
						).createOrUpdateNotesInOBFromSourceTable(fetchSource);

						new Notice(
							`${fetchSource.name} ${t("fetched successfully")}`
						);
					},
				});

				// 记录已注册的命令ID
				this.commandIds.add(commandId);
			}
		);
	}

	// 注销所有已注册的命令
	private unregisterAllCommands() {
		this.commandIds.forEach((id) => {
			this.app.commands.removeCommand(`${this.manifest.id}:${id}`);
		});
		this.commandIds.clear();
	}

	// 刷新命令（在设置更改后调用）
	public refreshCommands() {
		this.registerFetchSourceCommands();
	}
}
