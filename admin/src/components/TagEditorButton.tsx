import React, { useRef } from "react";
import { useIntl } from "react-intl";
import { useLocation, useParams } from "react-router-dom"; //In react-router-dom v6 useHistory() is replaced by useNavigate().
import { unstable_useContentManagerContext as useContentManagerContext, useFetchClient } from '@strapi/strapi/admin';
import { Button, Box, Modal, Typography, Flex } from "@strapi/design-system";

import { PriceTag } from "@strapi/icons";
import { getTranslation as getTrad } from '../utils/getTranslation';
import { ConnectDisconnectRequest, ConnectDisconnectResponse, PluginSettingsResponse } from "../../../typings";
import EntityTagEditor, { EntityTagEditorRef } from "./EntityTagEditor";

interface TagEditorButtonProps {
	settings: PluginSettingsResponse;
}

const TagEditorButton = ({ settings }: TagEditorButtonProps) => {
	const { formatMessage } = useIntl();
	const { post } = useFetchClient();
	const { pathname } = useLocation();

	const [isModalOpen, setIsModalOpen] = React.useState(false);
	const entityTagEditorRef = useRef<EntityTagEditorRef>();

	const { isCreatingEntry, form } = useContentManagerContext();
	const { onChange } = form;

	const pathnameLower = pathname.toLowerCase();
	// if (isCreatingEntry || pathnameLower.endsWith("/create")) //isCreatingEntry can be false even though we're creating an entry
	// 	return null;

	let settingForEntity = settings.items.find(x => pathnameLower.includes(x.entityUid));
	if (!settingForEntity)
		return null;

	const { id } = useParams<{ id: string }>();
	const entityId = id?.toLowerCase() === "create" ? undefined : id;

	const handleSave = async () => {
		const selectedDocumentIds = entityTagEditorRef.current?.getSelectedItems();
		const origItems = entityTagEditorRef.current?.getOrigItems();

		if (!selectedDocumentIds || !origItems)
			return;

		const request: ConnectDisconnectRequest = {
			tagUid: settingForEntity.tagUid,
			origItems,
			selectedDocumentIds,
		}

		const { data } = await post<ConnectDisconnectResponse>(`/tag-editor/connect-disconnect-data`, request);
		onChange(data.tagPluralName, data);

		//note: __temp_key__ cannot be retrieved from 'form' for items to be removed, so we have to manually hide the labels / tags relations on article page
	}

	let buttonLabel = settingForEntity.buttonLabel;
	if (!buttonLabel)
		buttonLabel = formatMessage({
			id: "plugin.buttons.edit-tags",
			defaultMessage: "Edit Tags",
		});

	return (
		<>
			{(
				<Modal.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
					<Modal.Trigger>
						<Box style={{ width: '100%' }}>
							<Button style={{ width: '100%' }} variant="secondary" startIcon={<PriceTag />}>
								{buttonLabel}
							</Button>
						</Box>
					</Modal.Trigger>
					<Modal.Content style={{ width: '680px' }}>
						<Modal.Header>
							<Modal.Title>
								{formatMessage({ id: getTrad("plugin.modal.title") })}
							</Modal.Title>
						</Modal.Header>
						<form onSubmit={(event) => {
							setIsModalOpen(false);
							event.preventDefault();
						}}
						>
							<Modal.Body>
								<EntityTagEditor ref={entityTagEditorRef} settings={settingForEntity} entityId={entityId} />
							</Modal.Body>
							<Modal.Footer>
								<Modal.Close>
									<Button variant="tertiary">
										{formatMessage({ id: getTrad("plugin.buttons.close") })}
									</Button>
								</Modal.Close>
								<Button type="submit" variant="default" onClick={handleSave}>
									{formatMessage({ id: getTrad("plugin.buttons.save") })}
								</Button>
							</Modal.Footer>
						</form>
					</Modal.Content>
				</Modal.Root>
			)}
		</>
	);
}

export default TagEditorButton;