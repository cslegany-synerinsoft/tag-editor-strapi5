import React, { useState } from 'react';
import {
	Flex,
	Field,
	TextInput,
	Box,
} from '@strapi/design-system';
import { useIntl } from "react-intl";
import { getTranslation as getTrad } from '../utils/getTranslation';
import { Information } from '@strapi/icons';
import TooltipIconButton from './TooltipIconButton';

interface SettingsCardTextFieldProps {
	index: number,
	name: string;
	required: boolean;
	value: string;
	updateItem: (index: number, fieldName: string, value: string) => void,
}

const SettingsCardTextField = ({ index, name, required, value, updateItem }: SettingsCardTextFieldProps) => {
	const { formatMessage } = useIntl();
	const [hasError, setHasError] = useState(false);
	const tooltip = formatMessage({ id: getTrad(`plugin.settings.${name}.tooltip`) });

	const onItemChange = (newValue: string) => {
		setHasError(required && !newValue);
		updateItem(index, name, newValue);
	}

	const placeholder = formatMessage({ id: getTrad(`plugin.settings.${name}.placeholder`) });

	return (
		<Field.Root name={`field_${name}`} required={required}
			error={hasError ? formatMessage({ id: getTrad("plugin.settings.errors.required") }) : ""}
			hint={formatMessage({ id: getTrad(`plugin.settings.${name}.hint`) })}
		>
			<Field.Label>
				{formatMessage({ id: getTrad(`plugin.settings.${name}`) })}
			</Field.Label>
			<Flex size={12}>
				<TextInput
					name={name}
					placeholder={placeholder}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => onItemChange(e.target.value)}
					value={value}
				/>
				<Box marginLeft={2}>
					<TooltipIconButton label={tooltip} showBorder={true} variant='ghost'>
						<Information />
					</TooltipIconButton>
				</Box>
			</Flex>
			<Field.Hint />
			<Field.Error />
		</Field.Root>
	);
}

export default SettingsCardTextField;