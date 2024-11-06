import type { Core } from '@strapi/strapi';
import { GetTagsByItemRequest, PluginCreateTagRequest, PluginBatchCreateTagRequest, ConnectDisconnectRequest, GetAllTagsRequest } from '../../../typings';

export default ({ strapi }: { strapi: Core.Strapi }) => ({

  async welcome(ctx) {
    const tagEditor = strapi.plugin("tag-editor").service("tagEditor");

    try {
      ctx.body = await tagEditor.getWelcomeMessage();
    }
    catch (err) {
      ctx.throw(500, err);
    }
  },

  async allTags(ctx) {
    const body: GetAllTagsRequest = ctx.request.body;
    if(!body.tagUid) {
      ctx.throw(400, 'tagUid is required');
    }

    const tagEditor = strapi.plugin("tag-editor").service("tagEditor");

    const items = await tagEditor.getAllTags(body.tagUid);
      ctx.type = 'application/json; charset=utf-8';
      ctx.send(items);
  },

  async tagsByItem(ctx) {
    const body: GetTagsByItemRequest = ctx.request.body;
    if(!body.entityUid) {
      ctx.throw(400, 'entityUid is required');
    }

    if(!body.tagUid) {
      ctx.throw(400, 'tagUid is required');
    }

    if(!body.entityId) {
      ctx.throw(400, 'entityId is required');
    }

    const tagEditor = strapi.plugin("tag-editor").service("tagEditor");

    const items = await tagEditor.getTagsByItem(body.entityUid, body.entityId, body.tagUid);
      ctx.type = 'application/json; charset=utf-8';
      ctx.send(items);
  },

  async createTag(ctx) {
    const body: PluginCreateTagRequest = ctx.request.body;

    if(!body.tagUid) {
      ctx.throw(400, 'tagUid is required');
    }

    if(!body.value) {
      ctx.throw(400, 'value is required');
    }

    const tagEditor = strapi.plugin("tag-editor").service("tagEditor");

    const items = await tagEditor.createTag(body.tagUid, body.value);
      ctx.type = 'application/json; charset=utf-8';
      ctx.send(items);
  },

  async batchCreateTags(ctx) {
    const body: PluginBatchCreateTagRequest = ctx.request.body;

    if(!body.tagUid) {
      ctx.throw(400, 'tagUid is required');
    }

    if(!body.values || body.values.length === 0) {
      ctx.throw(400, 'values are required');
    }

    const tagEditor = strapi.plugin("tag-editor").service("tagEditor");

    const items = await tagEditor.batchCreateTags(body.tagUid, body.values);
      ctx.type = 'application/json; charset=utf-8';
      ctx.send(items);
  },

  async getConnectDisconnectData(ctx) {
    const body: ConnectDisconnectRequest = ctx.request.body;

    if(!body.tagUid) {
      ctx.throw(400, 'tagUid is required');
    }

    if(!body.origItems) {
      ctx.throw(400, 'origItems are required');
    }

    if(!body.selectedDocumentIds) {
      ctx.throw(400, 'selectedDocumentIds are required');
    }

    const tagEditor = strapi.plugin("tag-editor").service("tagEditor");

    const items = await tagEditor.getConnectDisconnectData(body.tagUid, body.origItems, body.selectedDocumentIds);
      ctx.type = 'application/json; charset=utf-8';
      ctx.send(items);
  }

});
