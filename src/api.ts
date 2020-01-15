import axios, { AxiosError, AxiosInstance } from "axios";
import { window } from "vscode";
import { baseLimit, baseOffset } from "./shared";

const headers: object = {
  "Accept" :
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,zh-HK;q=0.7",
  "Cache-Control": "max-age=0",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
};

type IApiBaseTemplateFunc = (limit?: number, offset?: number, isNews?: number) => string;
type IApiTagsOrAuthorsTemplateFunc = (num: string, limit?: number, offset?: number, isNews?: number) => string;
type IApiOneDataTemplateFunc = (authorId: string) => string;
type IRand = (min: number, max: number) => number;

const apiArticlesOrNewsTemplate: IApiBaseTemplateFunc = (limit: number = baseLimit, offset: number = baseOffset, isNews: number = 0): string => `https://www.gcores.com/gapi/v1/articles?page[limit]=${limit}&page[offset]=${offset}&sort=-published-at&include=category,user&filter[is-news]=${isNews}&fields[articles]=title,desc,is-published,thumb,app-cover,cover,comments-count,likes-count,bookmarks-count,is-verified,published-at,option-is-official,option-is-focus-showcase,duration,category,user`;
const apiSingleArticleTemplate: IApiOneDataTemplateFunc = (articleId: string): string => `https://www.gcores.com/gapi/v1/articles/${articleId}?include=category,user,user.role,tags,entities,entries,similarities.user,similarities.djs,similarities.category,collections&preview=1`;
const apiArticleTagTemplate: IApiTagsOrAuthorsTemplateFunc = (tagNum: string, limit: number = baseLimit, offset: number = baseOffset, isNews: number = 0): string => `https://www.gcores.com/gapi/v1/categories/${tagNum}/articles?page[limit]=${limit}&page[offset]=${offset}&sort=-published-at&include=category,user&filter[is-news]=${isNews}&fields[articles]=title,desc,is-published,thumb,app-cover,cover,comments-count,likes-count,bookmarks-count,is-verified,published-at,option-is-official,option-is-focus-showcase,duration,category,user`;
const apiArticlesByAuthorTemplate: IApiTagsOrAuthorsTemplateFunc = (authorId: string, limit: number = baseLimit, offset: number = baseOffset, isNews: number = 0): string => `https://www.gcores.com/gapi/v1/users/${authorId}/articles?page[limit]=${limit}&page[offset]=0&sort=-published-at&include=category,user&filter[is-news]=${isNews}&fields[articles]=title,desc,is-published,thumb,app-cover,cover,comments-count,likes-count,bookmarks-count,is-verified,published-at,option-is-official,option-is-focus-showcase,duration,category,user`;
const apiAuthorInfotemplate: IApiOneDataTemplateFunc = (authorId: string): string => `https://www.gcores.com/gapi/v1/users/${authorId}`;

const http: AxiosInstance = axios.create({
  headers,
});

function errorHandler(err: AxiosError): Promise<never> {
  const { response, config } = err;
  const data: any = (response as any).data;
  if (data && data.msg) {
    const msg: string = data.msg;
    window.showErrorMessage(msg);
    return Promise.reject(err);
  }
  return Promise.reject(err);
}

export async function getRecentArticlesData(): Promise<any[]> {
  const { data } = await http
    .get(apiArticlesOrNewsTemplate(), {
    })
    .catch(errorHandler);
  return data;
}

export async function getRecentNewsData(): Promise<any[]> {
  const { data } = await http
    .get(apiArticlesOrNewsTemplate(baseLimit, 1), {
    })
    .catch(errorHandler);
  return data;
}

// TODO any to change type
export async function getArticlesDataByTag(mapping: any, tagName: string): Promise<any[]> {
  let tagNum: string | undefined = mapping.get(tagName);
  if ( !tagNum ) {
    tagNum = "1";
  }
  const { data } = await http
    .get(apiArticleTagTemplate(tagNum), {
    })
    .catch(errorHandler);
  return data;
}

export async function getArticlesDataByAuthor(mapping: any, authorName: string): Promise<any[]> {
  let authorId: string | undefined = mapping.get(authorName);
  if ( !authorId ) {
    authorId = "3"; // 西蒙
  }
  const { data } = await http
    .get(apiArticlesByAuthorTemplate(authorId), {
    })
    .catch(errorHandler);
  return data;
}

export async function getOneArticleData(arcicleId: string): Promise<any[]> {
  const apiSingleArticle: string = apiSingleArticleTemplate(arcicleId);
  const { data } = await http
    .get(apiSingleArticle, {
    })
    .catch(errorHandler);
  return data;
}

export async function getAuthorInfo(authorId: string): Promise<any> {
  const apiAuthorInfo: string = apiAuthorInfotemplate(authorId);
  const { data } = await http
    .get(apiAuthorInfo, {
    })
    .catch(errorHandler);
  return data;
}

export async function getPickOneInfo(): Promise<any> {
  const pickData: any = await getRecentArticlesData();
  const totalNum: number = parseInt(pickData.meta["record-count"], 10);
  const rand: IRand = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };
  const offset: number = rand(1, totalNum - baseLimit);
  const { data } = await http
    .get(apiArticlesOrNewsTemplate(1, offset), {
  })
  .catch(errorHandler);
  return data;
}
