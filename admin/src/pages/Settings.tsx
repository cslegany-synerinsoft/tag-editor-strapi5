import React, { useEffect, useRef, useState } from 'react';
import { useFetchClient, useNotification } from '@strapi/strapi/admin';
import { PluginSettingsResponse, PluginSettingsBody } from '../../../typings';
import { useIntl } from 'react-intl';
import SettingsCardPage from '../components/SettingsCardPage';
import { getTranslation as getTrad } from '../utils/getTranslation';

const Settings = () => {
	const { formatMessage } = useIntl();

	const isMounted = useRef(true);
	const { get, post } = useFetchClient();

	const defaultSettingsBody: PluginSettingsBody[] = [];
	const [settings, setSettings] = useState<PluginSettingsBody[]>(defaultSettingsBody);
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const { toggleNotification } = useNotification();

	useEffect(() => {
		const fetchData = async () => {
			const { data } = await get<PluginSettingsResponse>(`/tag-editor/settings`);
			setSettings(data.items);
			setIsLoading(false);
		}
		fetchData();

		// unmount
		return () => {
			isMounted.current = false;
		};
	}, [])

	const onSubmit = async () => {
		if (!settings)
			return;

		setIsSaving(true);

		const res = await post(`/tag-editor/settings`, {
			items: settings
		});
		setSettings(res.data.items);
		setIsSaving(false);

		toggleNotification({
			type: 'success',
			message: formatMessage({
				id: getTrad('plugin.settings.updated'),
				defaultMessage: 'Settings successfully updated',
			}),
		});
	};

	const onAddCard = () => {
		if (!settings)
			return;

		const setting: PluginSettingsBody = {
			entityUid: '', tagUid: '',
		};
		const updatedSettings = settings.map(item => ({ ...item }))
		updatedSettings.push(setting);
		setSettings(updatedSettings);
	}

	const onRemoveCard = (index: number) => {
		const newArray = settings.filter((item, itemIndex) => itemIndex !== index);
		setSettings(newArray);
	}

	const updateItem = (index: number, fieldName: string, value: string) => {
		try {
			let updatedSettings = settings.map((setting, settingIndex) => {
				if (settingIndex === index) {
					const item = { ...setting };
					(item as any)[fieldName] = value;
					return item;
				}
				return setting;
			});
			setSettings(updatedSettings);
		} catch (e) {
			console.log(e);
		}
	}

	return (
		<SettingsCardPage isLoading={isLoading} isSaving={isSaving} settings={settings}
			onAddCard={onAddCard} onRemoveCard={onRemoveCard} onSubmit={onSubmit} updateItem={updateItem}>
		</SettingsCardPage>
	)
}

export default Settings;