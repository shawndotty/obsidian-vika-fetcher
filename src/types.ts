// 单个获取源设置项
export interface FetchSourceSetting {
	name: string;
	url: string;
	apiKey: string;
	path: string;
	id?: string;
	willExport: boolean;
}

// 插件整体设置
export interface ObDBFetcherSettings {
	fetchSources: FetchSourceSetting[];
}

export interface VikaIds {
	tableId: string;
	viewId: string;
}

export interface RecordFields {
	[key: string]: any;
	Title?: string;
	MD?: string;
	SubFolder?: string;
	UpdatedIn?: number;
}

export interface Record {
	fields: RecordFields;
}

export interface DateFilterOption {
	id: string;
	name: string;
	value: number;
}
