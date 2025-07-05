import { App, Vault, normalizePath, Notice } from "obsidian";
import { t } from "../lang/helpers";
import type {
	FetchSourceSetting,
	VikaIds,
	RecordFields,
	Record,
	DateFilterOption,
} from "./types";
import { DateFilterSuggester } from "./suggesters";

export class VikaFetcher {
	private apiKey: string;
	apiUrlRoot: string;
	dataBaseIDs: VikaIds;
	app: App;
	vault: Vault;

	constructor(private readonly fetchSource: FetchSourceSetting, app: App) {
		this.apiKey = fetchSource.apiKey;
		this.app = app;
		this.vault = app.vault;
		this.dataBaseIDs = this.extractVikaIds(fetchSource.url);
		this.apiUrlRoot = `https://vika.cn/fusion/v1/datasheets/`;
	}

	extractVikaIds(url: string): VikaIds {
		// Regular expression to match Vika URL pattern
		const regex =
			/https?:\/\/vika\.cn\/workbench\/(dst[^\/]+)\/(viw[^\/]+)/;
		const match = url.match(regex);

		if (!match) {
			return {
				tableId: "",
				viewId: "",
			};
		}

		return {
			tableId: match[1] || "",
			viewId: match[2] || "",
		};
	}

	makeApiUrl(vikaIds: VikaIds): string {
		return `${this.apiUrlRoot}${vikaIds.tableId}/records?fieldKey=name&viewId=${vikaIds.viewId}`;
	}

	async fetchData() {
		let fields = ["Title", "MD", "SubFolder", "UpdatedIn"];

		let dateFilterOption: DateFilterOption | null = null;
		let dateFilterFormula = "";
		const suggester = new DateFilterSuggester(this.app);
		dateFilterOption = await new Promise<DateFilterOption>((resolve) => {
			suggester.onChooseItem = (item: DateFilterOption) => {
				resolve(item);
				return item;
			};
			suggester.open();
		});
		if (dateFilterOption && dateFilterOption.value !== 99) {
			const formula = `{UpdatedIn} <= ${dateFilterOption.value}`;
			dateFilterFormula = `&filterByFormula=${encodeURIComponent(
				formula
			)}`;
		}
		let url = `${this.makeApiUrl(this.dataBaseIDs)}
			&${fields.map((f) => `fields%5B%5D=${encodeURIComponent(f)}`).join("&")}
			${dateFilterFormula}
			&offset=
		`;

		let records = await this.getAllRecordsFromTable(url);
		return records;
	}

	async createOrUpdateNotesInOBFromSourceTable(
		fetchSource: FetchSourceSetting
	): Promise<void> {
		const directoryRootPath = fetchSource.path;

		let notesToCreateOrUpdate: RecordFields[] = (
			await this.fetchData()
		).map((note: Record) => note.fields);

		console.dir(notesToCreateOrUpdate);

		new Notice(
			t("There are {{count}} files needed to be updated or created.", {
				count: notesToCreateOrUpdate.length.toString(),
			})
		);

		let configDirModified = 0;

		while (notesToCreateOrUpdate.length > 0) {
			let toDealNotes = notesToCreateOrUpdate.slice(0, 10);
			for (let note of toDealNotes) {
				let validFileName = this.convertToValidFileName(
					note.Title || ""
				);
				let folderPath =
					directoryRootPath +
					(note.SubFolder ? `/${note.SubFolder}` : "");
				await this.createPathIfNeeded(folderPath);
				const noteExtension =
					"Extension" in note ? note.Extension : "md";
				const notePath = `${folderPath}/${validFileName}.${noteExtension}`;
				const noteExists = await this.vault.adapter.exists(notePath);
				let noteContent = note.MD ? note.MD : "";
				if (!noteExists) {
					await this.vault.create(notePath, noteContent);
				} else if (noteExists && notePath.startsWith(".")) {
					await this.vault.adapter
						.write(notePath, noteContent)
						.catch((r: any) => {
							new Notice(
								t("Failed to write file: {{error}}", {
									error: r,
								})
							);
						});
					configDirModified++;
				} else {
					let file = this.app.vault.getFileByPath(notePath);
					if (file) {
						await this.vault.modify(file, noteContent);
						await new Promise((r) => setTimeout(r, 100)); // 等待元数据更新
					}
				}
			}

			notesToCreateOrUpdate = notesToCreateOrUpdate.slice(10);
			if (notesToCreateOrUpdate.length) {
				new Notice(
					t("There are {{count}} files needed to be processed.", {
						count: notesToCreateOrUpdate.length.toString(),
					})
				);
			} else {
				new Notice(t("All Finished."));
			}
		}
	}

	convertToValidFileName(fileName: string): string {
		return fileName.replace(/[\/|\\:'"()（）{}<>\.\*]/g, "-").trim();
	}

	async createPathIfNeeded(folderPath: string): Promise<void> {
		const directoryExists = await this.vault.adapter.exists(folderPath);
		if (!directoryExists) {
			await this.vault.createFolder(normalizePath(folderPath));
		}
	}

	async getAllRecordsFromTable(url: string): Promise<any> {
		let records: any[] = [];
		let offset = "";

		do {
			try {
				// 使用 fetch 替换 requestUrl
				const response = await fetch(url + offset, {
					method: "GET",
					headers: {
						Authorization: `Bearer ${this.apiKey}`,
					},
				});
				// fetch 返回的是 Response 对象，需要调用 .json() 获取数据
				const responseData = await response.json();
				// 为了兼容后续代码，将 responseData 包装成与 requestUrl 返回结构一致
				const responseObj = { json: responseData };

				const data = responseObj.json.data;
				records = records.concat(data.records);
				new Notice(
					t("Got {{count}} records", {
						count: records.length.toString(),
					})
				);

				offset = data.offset || "";
			} catch (error) {
				console.dir(error);
			}
		} while (offset !== "");

		return records;
	}
}
