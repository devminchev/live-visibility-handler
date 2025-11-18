import type {
  FunctionEventContext,
  FunctionEventHandler,
  FunctionTypeEnum,
  AppActionRequest,
} from '@contentful/node-apps-toolkit';
import { ClientOptions, createClient, PlainClientAPI } from 'contentful-management';

function initContentfulManagementClient(context: FunctionEventContext): PlainClientAPI {
  if (!context.cmaClientOptions) {
    throw new Error(
      'Contentful Management API client options are only provided for certain function types. To learn more about using the CMA within functions, see https://www.contentful.com/developers/docs/extensibility/app-framework/functions/#using-the-cma.'
    );
  }
  return createClient(context.cmaClientOptions as ClientOptions, {
    type: 'plain',
    defaults: {
      spaceId: context.spaceId,
      environmentId: context.environmentId,
    },
  });
};

export const handler: FunctionEventHandler<FunctionTypeEnum.AppActionCall> = async (
  event: AppActionRequest,
  context: FunctionEventContext
) => {
  const cma = initContentfulManagementClient(context);
  const { body: { entryIds } } = event;
  const locales = await cma.locale.getMany({ spaceId: context.spaceId, environmentId: context.environmentId });
  const defaultLocale: string = locales.items.find((l: any) => l.default === true)?.code || 'en-USsssss';
  try {
    // 1. Fetch or modify content with the CMA client
    const { items: entries } = await cma.entry.getMany({
      query: {
        content_type: 'siteGameV2',
        'sys.id[in]': entryIds
      }
    });

    // 2. Create or update entries
    for (const entry of entries) {
      entry.fields.liveHidden = {
        [defaultLocale]: false
      };
    };
    // Return your response data
    // This will be available in the App Action response

    await Promise.all(
      entries.map((e) => cma.entry.update({ entryId: e.sys.id }, e))
    );

    return {
      success: true,
      status: 200,
    };
  } catch (error) {
    console.log('errror :', error);
    return { success: false, error };
  };
};
