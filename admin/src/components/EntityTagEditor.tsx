import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { Box, Typography } from "@strapi/design-system";
import { getTranslation as getTrad } from '../utils/getTranslation';
import { GetAllTagsRequest, GetAllTagsResult, GetTagsByItemRequest, GetTagsByItemResult, PluginSettingsBody, TagData } from "../../../typings";
import { useFetchClient } from "@strapi/strapi/admin";
import TagsSelect, { TagsSelectRef } from "./TagsSelect";

export interface EntityTagEditorRef {
	getSelectedItems: () => string[];
	getOrigItems: () => TagData[] | undefined;
}

interface EntityTagEditorProps {
	settings: PluginSettingsBody;
	entityId: string | undefined;
}

const EntityTagEditor = forwardRef<EntityTagEditorRef | undefined, EntityTagEditorProps>((props: EntityTagEditorProps, ref) => {
	const { settings, entityId } = props;
	const { formatMessage } = useIntl();
	const { post } = useFetchClient();

	const tagsSelectRef = useRef<TagsSelectRef>();

	useImperativeHandle(
		ref,
		() => {
			// the return object will pass to parent ref.current, so you can add anything what you want.
			return {
				getSelectedItems: () => tagsSelectRef.current?.getSelectedItems() ?? [],
				getOrigItems: () => tagsSelectRef.current?.getOrigItems() ?? [],
			}
		},
		[],
	);

	const [tagsByItem, setTagsByItem] = useState<GetTagsByItemResult | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const isMounted = useRef(true);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);

			if (!entityId) {
				const request: GetAllTagsRequest = {
					tagUid: settings.tagUid,
				};
				const { data } = await post<GetAllTagsResult>(`/tag-editor/all-tags`, request);
				data.allTags = data.allTags.sort((x, y) => (x.name.localeCompare(y.name)));
				const tagsByItemData: GetTagsByItemResult = {
					...data,
					selectedTags: [],
				};
				setTagsByItem(tagsByItemData);
			} else {
				const request: GetTagsByItemRequest = {
					entityUid: settings.entityUid,
					entityId,
					tagUid: settings.tagUid,
				};
				const { data } = await post<GetTagsByItemResult>(`/tag-editor/tags`, request);
				data.allTags = data.allTags.sort((x, y) => (x.name.localeCompare(y.name)));
				data.selectedTags = data.selectedTags.sort((x, y) => (x.name.localeCompare(y.name)));
				setTagsByItem(data);
			}

			setIsLoading(false);
		}
		fetchData();

		// unmount
		return () => {
			isMounted.current = false;
		};
	}, [])

	if (!tagsByItem || isLoading)
		return;

	return (
		<>
			<Box paddingBottom={2}>
				<Typography variant="omega">
					{formatMessage({ id: getTrad("plugin.modal.info") })}
				</Typography>
			</Box>
			<TagsSelect ref={tagsSelectRef} allLoadedTags={tagsByItem.allTags} selectedTags={tagsByItem.selectedTags}
				tagUid={settings.tagUid} maxLength={tagsByItem.maxLength} />
		</>
	)
})

export default EntityTagEditor;