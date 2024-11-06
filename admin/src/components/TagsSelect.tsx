import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import {
	Box,
	Field,
	MultiSelect,
	MultiSelectOption,
	TextInput,
	Typography,
} from '@strapi/design-system';
import { getTranslation as getTrad } from '../utils/getTranslation';
import { BatchCreateTagResult, CreateTagResult, PluginBatchCreateTagRequest, PluginCreateTagRequest, TagData } from '../../../typings';
import { useIntl } from 'react-intl';
import { useDebounce } from "use-debounce";
import { useFetchClient } from '@strapi/strapi/admin';

export interface TagsSelectRef {
	getSelectedItems: () => string[];
	getOrigItems: () => TagData[];
}

interface TagsSelectProps {
	selectedTags: TagData[];
	allLoadedTags: TagData[];
	tagUid: string;
	maxLength?: number;
}

const TagsSelect = forwardRef<TagsSelectRef | undefined, TagsSelectProps>((props: TagsSelectProps, ref) => {
	const { allLoadedTags, selectedTags, tagUid, maxLength } = props;

	const { formatMessage } = useIntl();
	const { post } = useFetchClient();

	const [selectedItems, setSelectedItems] = useState<string[]>([]);
	const [allTags, setAllTags] = useState<TagData[]>(allLoadedTags);
	const [inputValue, setInputValue] = useState<string>("");
	const [createdTags, setCreatedTags] = useState<string[]>([]);
	const [error, setError] = useState<string>("");

	const [debouncedInputValue] = useDebounce(inputValue, 50);

	useImperativeHandle(
		ref,
		() => {
			// the return object will pass to parent ref.current, so you can add anything what you want.
			return {
				getSelectedItems: () => selectedItems,
				getOrigItems: () => selectedTags,
			}
		},
		[selectedItems],
	);

	useEffect(() => {
		setSelectedItems(selectedTags.map((v) => v.documentId.toString()));
	}, [])

	const onInputChange = (value: string) => {
		setInputValue(value);
	}

	const trimTag = (tag: string) => {
		tag = tag.trim();
		if (maxLength)
			tag = tag.substring(0, maxLength);
		return tag;
	}

	useEffect(() => {
		const trimmedDebouncedInputValue = debouncedInputValue.trim();
		if (trimmedDebouncedInputValue.indexOf(",") === -1 || !trimmedDebouncedInputValue.endsWith(","))
			return;

		let tags = trimmedDebouncedInputValue.split(",");
		tags = tags.map(tag => trimTag(tag)).filter(Boolean);

		let tagsToAdd: string[] = [];
		tags.forEach(tag => {
			let needToAdd = true;
			if (createdTags.includes(tag))
				needToAdd = false;

			const existingTag = allTags.find(x => x.name.toLowerCase() === tag.toLowerCase());
			if (existingTag) {
				if (!selectedItems.includes(existingTag.documentId)) {
					const newSelectedItems = [...selectedItems];
					newSelectedItems.push(existingTag.documentId);
					setSelectedItems(newSelectedItems);
				}
				needToAdd = false;
			}

			if (needToAdd)
				tagsToAdd.push(tag);
		})

		const createTag = async (tag: string) => {
			const data: PluginCreateTagRequest = {
				tagUid,
				value: tag,
			}
			const queryRes = await post(`/tag-editor/create`, data);
			const res: CreateTagResult = queryRes.data;
			if (res.errorMessage) {
				setError(res.errorMessage);
				return;
			}

			const tagData = res.data;
			if (!tagData)
				return;

			const newCreatedTags = [...createdTags];
			newCreatedTags.push(tagData.name);
			setCreatedTags(newCreatedTags);

			let newAllTags = [...allTags];
			newAllTags.push(tagData);
			newAllTags = newAllTags.sort((x, y) => (x.name.localeCompare(y.name)));
			setAllTags(newAllTags);

			const newSelectedItems = [...selectedItems];
			newSelectedItems.push(tagData.documentId);
			setSelectedItems(newSelectedItems);
		}

		const createTags = async (tagsToAdd: string[]) => {
			const data: PluginBatchCreateTagRequest = {
				tagUid,
				values: tagsToAdd,
			}
			const queryRes = await post(`/tag-editor/batch-create`, data);
			const res: BatchCreateTagResult = queryRes.data;
			if (res.errorMessage) {
				setError(res.errorMessage);
				return;
			}

			const tagDatas = res.data;
			if (!tagDatas || tagDatas.length === 0)
				return;

			const newCreatedTags = [...createdTags];
			tagDatas.forEach(tagData => {
				newCreatedTags.push(tagData.name);
			});
			setCreatedTags(newCreatedTags);

			let newAllTags = [...allTags];
			tagDatas.forEach(tagData => {
				newAllTags.push(tagData);
			});
			newAllTags = newAllTags.sort((x, y) => (x.name.localeCompare(y.name)));
			setAllTags(newAllTags);

			const newSelectedItems = [...selectedItems];
			tagDatas.forEach(tagData => {
				newSelectedItems.push(tagData.documentId);
			});
			setSelectedItems(newSelectedItems);
		}

		if (tagsToAdd.length > 0) {
			if (tagsToAdd.length === 1)
				createTag(tagsToAdd[0]);
			else
				createTags(tagsToAdd);
		}
	}, [debouncedInputValue]);

	return (
		<>
			<Box paddingTop={2} paddingBottom={2}>
				<Field.Root
					error={error}
					hint={formatMessage({ id: getTrad("plugin.tagsInput.hint") })}
					name="tagsInput"
				>
					<Typography variant="pi">
						{formatMessage({ id: getTrad("plugin.tagsInput.label") })}
					</Typography>
					<TextInput
						placeholder={formatMessage({ id: getTrad("plugin.tagsInput.placeholder") })}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange(e.target.value)}
						value={inputValue}
						size="M"
						type="text"
					>
					</TextInput>
					<Field.Error />
					<Field.Hint />
				</Field.Root>
			</Box>
			<Box paddingTop={2} paddingBottom={2}>
				<Field.Root
					error={error}
					hint={formatMessage({ id: getTrad("plugin.selectedTags.hint") })}
					name="selectedTags"
					required
				>
					<Typography variant="pi">
						{formatMessage({ id: getTrad("plugin.selectedTags.label") })}
					</Typography>
					<MultiSelect
						onChange={(selectedValues: string[]) => {
							setSelectedItems(selectedValues);
						}}
						placeholder={formatMessage({ id: getTrad("plugin.selectedTags.placeholder") })}
						value={selectedItems}
						withTags
					>
						{allTags.map((tagData) => {
							return (
								<MultiSelectOption key={tagData.documentId} value={tagData.documentId}>
									{tagData.name}
								</MultiSelectOption>
							);
						})}
					</MultiSelect>
					<Field.Error />
					<Field.Hint />
				</Field.Root>
			</Box>

		</>
	);
})

export default TagsSelect