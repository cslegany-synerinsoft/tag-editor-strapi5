import type { Core } from '@strapi/strapi';
import { PluginSettingsBody, PluginSettingsResponse } from '../../../typings';

const getPluginStore = () => {
    return strapi.store({
        environment: '',
        type: 'plugin',
        name: 'tag-editor',
    });
};

const createDefaultConfig = async () => {
    const pluginStore = getPluginStore();

    const settingsList: Array<PluginSettingsBody> = [
        {
            entityUid: 'api::article.article',
            tagUid: 'api::label.label',
            buttonLabel: 'Edit Labels',
            tagsName: 'Labels',
        },
    ];
    const value: PluginSettingsResponse = {
        items: settingsList
    };
    await pluginStore.set({ key: 'settings', value });
    return pluginStore.get({ key: 'settings' });
};

export default ({ strapi }: { strapi: Core.Strapi }) => ({

    async getSettings() {
        const pluginStore = getPluginStore();
        let config = await pluginStore.get({ key: 'settings' }) as PluginSettingsResponse;
        if (!config || !config.items) {
            config = (await createDefaultConfig()) as PluginSettingsResponse;
        }
        return config;
    },

    async setSettings(settings) {
        const value = settings;
        const pluginStore = getPluginStore();

        await pluginStore.set({ key: 'settings', value });
        return pluginStore.get({ key: 'settings' });
    },

});