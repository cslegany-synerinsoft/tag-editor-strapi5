import React from 'react';
import {
	Button,
	Grid,
} from '@strapi/design-system';
import { Page, Layouts } from '@strapi/strapi/admin';

import { Check, Plus } from '@strapi/icons';
import { useIntl } from 'react-intl';
import { getTranslation as getTrad } from '../utils/getTranslation';
import { PluginSettingsBody } from '../../../typings';
import SettingsCard from './SettingsCard';

interface SettingsCardPageProps {
	isLoading: boolean,
	isSaving: boolean,
	settings: PluginSettingsBody[],
	onSubmit: () => void,
	onAddCard: () => void,
	onRemoveCard: (index: number) => void,
	updateItem: (index: number, fieldName: string, value: string) => void,
}

const SettingsCardPage = (props: SettingsCardPageProps) => {
	const { isLoading, isSaving, settings, onAddCard, onRemoveCard, onSubmit, updateItem } = props;
	const { formatMessage } = useIntl();

	const checkFormErrors = () => {
		return settings.findIndex(x => !x.entityUid || !x.tagUid || !x.buttonLabel || !x.tagsName) !== -1;
	}

	const hasFormError = checkFormErrors();

	return (
		<>
			<Layouts.Header
				id="title"
				title={formatMessage({ id: getTrad("plugin.settings.title") })}
				subtitle={formatMessage({ id: getTrad("plugin.settings.subtitle") })}
				primaryAction={
					isLoading ? (<></>) : (
						<Button
							onClick={onSubmit}
							startIcon={<Check />}
							size="L"
							disabled={isSaving || hasFormError}
							loading={isSaving}
						>
							{formatMessage({ id: getTrad("plugin.settings.buttons.save") })}
						</Button>
					)
				}
				secondaryAction={
					isLoading ? (<></>) : (
						<Button
							onClick={onAddCard}
							startIcon={<Plus />}
							size="S"
							disabled={isSaving}
							loading={isSaving}
							variant="secondary"
						>
							{formatMessage({ id: getTrad("plugin.settings.buttons.add") })}
						</Button>
					)
				}
			>
			</Layouts.Header>
			<Layouts.Content>
				<Grid.Root gap={6}>
					{isLoading ? (
						<Page.Loading />
					) : (
						settings.map((setting, index) => {
							return (
								<SettingsCard key={index} setting={setting} index={index} {...props} />
							)
						})
					)}
				</Grid.Root>
			</Layouts.Content >
		</>
	)
}

export default SettingsCardPage;