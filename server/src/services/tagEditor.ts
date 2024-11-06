import type { Core } from '@strapi/strapi';
import type * as StrapiTypes from '@strapi/types/dist';
import { CreateTagResult, GetTagsByItemResult, TagData, BatchCreateTagResult, ConnectDisconnectResponse, ConnectDisconnectItem, GetAllTagsResult } from '../../../typings';
import { AnyDocument } from '@strapi/types/dist/modules/documents';
import slugify from 'slugify';

type Settings = {
  mainField: string;
  defaultSortBy: string;
  defaultSortOrder: string;
};

type MaxLengthAttribute = StrapiTypes.Schema.Attribute.AnyAttribute & {
  maxLength: number | undefined | null;
}

const getUniqueSlug = async (tagUid: StrapiTypes.UID.CollectionType, name: string, maxLength = 32, num = 0) => {
  let input = `${name}`;
  if (num > 0) {
    input = `${name}-${num}`;
  }
  let slug = slugify(input, {
    lower: true
  });

  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
  }
  if (num > 0 && !slug.endsWith(num.toString())) {
    slug = slug.substring(0, maxLength - num.toString().length - 1);
    slug = `${slug}-${num}`;
  }

  const tag = await strapi.db.query(tagUid).findOne({
    where: { slug: slug }
  });

  if (!tag) {
    return slug;
  }
  else {
    return getUniqueSlug(tagUid, name, maxLength, num + 1);
  }
}

const makeId = (length: number) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({

  getWelcomeMessage() {
    return {
      body: 'Welcome to Strapi 🚀'
    };
  },

  async getTagsByItem(entityUid: StrapiTypes.UID.CollectionType, entityId: string, tagUid: StrapiTypes.UID.CollectionType) {
    let res: GetTagsByItemResult = {
      selectedTags: [],
      allTags: [],
      errorMessage: "",
    };

    try {
      const { findConfiguration } = strapi.plugin('content-manager').service('content-types');
      const { settings: tagSettings }: Record<string, Settings> = await findConfiguration(strapi.contentType(tagUid));
      const { mainField: tagMainField } = tagSettings; //mainField is 'name' in case of a label

      const tagModel = strapi.getModel(tagUid);
      const tagPluralName = tagModel.info.pluralName;

      const tagMainFieldAttributes: MaxLengthAttribute = tagModel.attributes[tagMainField] as MaxLengthAttribute;
      if (tagMainFieldAttributes) {
        res.maxLength = tagMainFieldAttributes.maxLength;
      }

      const allTags = await strapi.documents(tagUid).findMany({
        fields: [tagMainField],
        status: 'published',
      });
      allTags.forEach(tag => {
        res.allTags.push({
          id: tag.id,
          documentId: tag.documentId,
          name: tag[tagMainField]
        })
      })

      const populate = {
        [tagPluralName]: {
          fields: [tagMainField]
        }
      };

      const entity = await strapi.documents(entityUid).findOne(
        {
          documentId: entityId,
          populate,
        }
      );
      entity[tagPluralName].forEach((tag: AnyDocument) => {
        res.selectedTags.push({
          id: tag.id,
          documentId: tag.documentId,
          name: tag[tagMainField],
        });
      });
    }
    catch (error) {
      console.error(error);
      res.allTags = [];
      res.selectedTags = [];
      res.errorMessage = error;
    }
    return res;
  },

  async getAllTags(tagUid: StrapiTypes.UID.CollectionType) {
    let res: GetAllTagsResult = {
      allTags: [],
      errorMessage: "",
    };

    try {
      const { findConfiguration } = strapi.plugin('content-manager').service('content-types');
      const { settings: tagSettings }: Record<string, Settings> = await findConfiguration(strapi.contentType(tagUid));
      const { mainField: tagMainField } = tagSettings; //mainField is 'name' in case of a label

      const tagModel = strapi.getModel(tagUid);

      const tagMainFieldAttributes: MaxLengthAttribute = tagModel.attributes[tagMainField] as MaxLengthAttribute;
      if (tagMainFieldAttributes) {
        res.maxLength = tagMainFieldAttributes.maxLength;
      }

      const allTags = await strapi.documents(tagUid).findMany({
        fields: [tagMainField],
        status: 'published',
      });
      allTags.forEach(tag => {
        res.allTags.push({
          id: tag.id,
          documentId: tag.documentId,
          name: tag[tagMainField]
        })
      })
    }
    catch (error) {
      console.error(error);
      res.allTags = [];
      res.errorMessage = error;
    }
    return res;
  },

  async createTag(tagUid: StrapiTypes.UID.CollectionType, value: string) {
    let res: CreateTagResult = {
      data: null,
      errorMessage: "",
    };

    try {
      const { findConfiguration } = strapi.plugin('content-manager').service('content-types');
      const { settings: tagSettings }: Record<string, Settings> = await findConfiguration(strapi.contentType(tagUid));
      const { mainField: tagMainField } = tagSettings; //mainField is 'name' in case of a label

      const tagModel = strapi.getModel(tagUid);
      const tagMainFieldAttributes: MaxLengthAttribute = tagModel.attributes[tagMainField] as MaxLengthAttribute;
      const tagSlugAttributes: MaxLengthAttribute = tagModel.attributes.slug as MaxLengthAttribute;

      const createdTag = await this.internalCreateTag(tagUid, value, tagMainField,
        tagMainFieldAttributes, tagSlugAttributes
      );
      res.data = {
        id: createdTag.id,
        documentId: createdTag.documentId,
        name: createdTag[tagMainField],
      }
    }
    catch (error) {
      console.error(error);
      res.data = null;
      res.errorMessage = error;
    }
    return res;
  },

  async internalCreateTag(tagUid: StrapiTypes.UID.CollectionType, value: string, tagMainField: string,
    tagMainFieldAttributes: MaxLengthAttribute, tagSlugAttributes: MaxLengthAttribute) {
    const data: any = {};
    data[tagMainField] = value;

    if (tagMainFieldAttributes && tagMainFieldAttributes.maxLength) {
      data[tagMainField] = value.substring(0, tagMainFieldAttributes.maxLength);
    }

    if (tagSlugAttributes) {
      if (tagSlugAttributes.maxLength) {
        data.slug = await getUniqueSlug(tagUid, value, tagSlugAttributes.maxLength);
      } else
        data.slug = await getUniqueSlug(tagUid, value);
    }

    const createdTag = await strapi.documents(tagUid).create({ data });
    await strapi.documents(tagUid).publish({
      documentId: createdTag.documentId,
    });
    return createdTag;
  },

  async batchCreateTags(tagUid: StrapiTypes.UID.CollectionType, values: string[]) {
    let res: BatchCreateTagResult = {
      data: [],
      errorMessage: "",
    };

    try {
      const { findConfiguration } = strapi.plugin('content-manager').service('content-types');
      const { settings: tagSettings }: Record<string, Settings> = await findConfiguration(strapi.contentType(tagUid));
      const { mainField: tagMainField } = tagSettings; //mainField is 'name' in case of a label

      const tagModel = strapi.getModel(tagUid);
      const tagMainFieldAttributes: MaxLengthAttribute = tagModel.attributes[tagMainField] as MaxLengthAttribute;
      const tagSlugAttributes: MaxLengthAttribute = tagModel.attributes.slug as MaxLengthAttribute;

      await Promise.all(values.map(async (value) => {
        const createdTag = await this.internalCreateTag(tagUid, value, tagMainField,
          tagMainFieldAttributes, tagSlugAttributes
        );
        res.data.push({
          id: createdTag.id,
          documentId: createdTag.documentId,
          name: createdTag[tagMainField],
        })
      }))
    }
    catch (error) {
      console.error(error);
      res.data = [];
      res.errorMessage = error;
    }
    return res;
  },

  convertToConnectDisconnectItem(connectTag: AnyDocument, tagMainField: string, tagSingularName: string) {
    let connectItem: ConnectDisconnectItem = {
      id: connectTag.id,
      apiData: {
        id: connectTag.id,
        documentId: connectTag.documentId,
      },
      href: `../collection-types/api::${tagSingularName}.${tagSingularName}/${connectTag.documentId}?`,
      status: 'published',
      __temp_key__: makeId(20),
    };
    connectItem[tagMainField] = connectTag[tagMainField];
    connectItem[tagSingularName] = connectTag[tagMainField];
    return connectItem;
  },

  async getConnectDisconnectData(tagUid: StrapiTypes.UID.CollectionType, origItems: TagData[], selectedDocumentIds: string[]) {
    let res: ConnectDisconnectResponse = {
      connect: [],
      disconnect: [],
      tagPluralName: "",
      errorMessage: "",
    };

    try {
      const connectDocumentIds: string[] = [];
      const disconnectDocumentIds: string[] = [];

      origItems.forEach(origItem => {
        if (!selectedDocumentIds.includes(origItem.documentId)) {
          disconnectDocumentIds.push(origItem.documentId);
        }
      })

      selectedDocumentIds.forEach(selectedId => {
        if (!origItems.find(x => x.documentId === selectedId))
          connectDocumentIds.push(selectedId);
      })

      const { findConfiguration } = strapi.plugin('content-manager').service('content-types');
      const { settings: tagSettings }: Record<string, Settings> = await findConfiguration(strapi.contentType(tagUid));
      const { mainField: tagMainField } = tagSettings; //mainField is 'name' in case of a label

      const tagModel = strapi.getModel(tagUid);
      const tagSingularName = tagModel.info.singularName; //label
      res.tagPluralName = tagModel.info.pluralName;

      const connectFilters = {
        documentId: {
          $in: connectDocumentIds
        }
      };
      const connectTags = await strapi.documents(tagUid).findMany({
        fields: [tagMainField],
        filters: connectFilters,
        status: 'published'
      });

      connectTags.forEach(connectTag => {
        let connectItem: ConnectDisconnectItem = this.convertToConnectDisconnectItem(connectTag, tagMainField, tagSingularName);
        res.connect.push(connectItem)
      })

      const disconnectFilters = {
        documentId: {
          $in: disconnectDocumentIds
        }
      };
      const disconnectTags = await strapi.documents(tagUid).findMany({
        fields: [tagMainField],
        filters: disconnectFilters,
        status: 'published'
      });
      disconnectTags.forEach(disconnectTag => {
        let disconnectItem: ConnectDisconnectItem = this.convertToConnectDisconnectItem(disconnectTag, tagMainField, tagSingularName);
        res.disconnect.push(disconnectItem)
      })
    }
    catch (error) {
      console.error(error);
      res.connect = [];
      res.disconnect = [];
      res.errorMessage = error;
    }
    return res;
  },

});
