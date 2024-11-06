export interface PluginSettingsBody {
    entityUid: string;
    tagUid: string;
    buttonLabel: string;
}

export interface PluginSettingsResponse {
    items: Array<PluginSettingsBody>;
}

export interface GetTagsByItemRequest {
    entityUid: string;
    tagUid: string;
    entityId: string;
}

export interface GetAllTagsRequest {
    tagUid: string;
}

export interface TagData {
    id: number;
    documentId: string;
    name: string;
}

export interface GetTagsByItemResult {
    selectedTags: TagData[];
    allTags: TagData[];
    errorMessage: string;
    maxLength?: number;
}

export interface GetAllTagsResult {
    allTags: TagData[];
    errorMessage: string;
    maxLength?: number;
}

export interface PluginCreateTagRequest {
    tagUid: string;
    value: string;
}

export interface PluginBatchCreateTagRequest {
    tagUid: string;
    values: string[];
}

export interface CreateTagResult {
    data: TagData | null;
    errorMessage: string;
}

export interface BatchCreateTagResult {
    data: Array<TagData>;
    errorMessage: string;
}

export interface ConnectDisconnectRequest {
    tagUid: string;
    origItems: Array<TagData>;
    selectedDocumentIds: string[];
}

export interface ConnectDisconnectItem {
    apiData: {
        documentId: string;
        id: number;
    },
    href: string;
    id: number;
    status: string;
    __temp_key__: string;
}

export interface ConnectDisconnectResponse {
    connect: ConnectDisconnectItem[];
    disconnect: ConnectDisconnectItem[];
    tagPluralName: string;
    errorMessage: string;
}