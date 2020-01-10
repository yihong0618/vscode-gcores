import axios, { AxiosError, AxiosInstance } from "axios";
import * as vscode from "vscode";
import { window } from "vscode";
import { articleTagsMapping, authorNamesMapping } from "./shared"

const headers: object = {
  "Accept" :
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,zh-HK;q=0.7",
  "Cache-Control": "max-age=0",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
};

const apiArticlesOrNewsTemplate: any = (limit: number = 30, isNews: number = 0): string => `https://www.gcores.com/gapi/v1/articles?page[limit]=${limit}&page[offset]=0&sort=-published-at&include=category,user&filter[is-news]=${isNews}&fields[articles]=title,desc,is-published,thumb,app-cover,cover,comments-count,likes-count,bookmarks-count,is-verified,published-at,option-is-official,option-is-focus-showcase,duration,category,user`;
const apiSingleArticleTemplate: any = (articleId: string): string => `https://www.gcores.com/gapi/v1/articles/${articleId}?include=category,user,user.role,tags,entities,entries,similarities.user,similarities.djs,similarities.category,collections&preview=1`;
const apiArticleTagTemplate: any = (limit: number = 30, tagNum: string, isNews: number = 0): string => `https://www.gcores.com/gapi/v1/categories/${tagNum}/articles?page[limit]=${limit}&page[offset]=0&sort=-published-at&include=category,user&filter[is-news]=${isNews}&fields[articles]=title,desc,is-published,thumb,app-cover,cover,comments-count,likes-count,bookmarks-count,is-verified,published-at,option-is-official,option-is-focus-showcase,duration,category,user`
const apiArticlesByAuthorTemplate: any = (limit: number = 30, authorId: string, isNews: number = 0): string => `https://www.gcores.com/gapi/v1/users/${authorId}/articles?page[limit]=${limit}&page[offset]=0&sort=-published-at&include=category,user&filter[is-news]=${isNews}&fields[articles]=title,desc,is-published,thumb,app-cover,cover,comments-count,likes-count,bookmarks-count,is-verified,published-at,option-is-official,option-is-focus-showcase,duration,category,user`;

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
    .get(apiArticlesOrNewsTemplate(30, 1), {
    })
    .catch(errorHandler);
  return data;
}

export async function getArticlesDataByTag(tagName: string): Promise<any[]> {
  let tagNum: string | undefined = articleTagsMapping.get(tagName);
  if ( !tagNum ) {
    tagNum = "1";
  }
  const { data } = await http
    .get(apiArticleTagTemplate(30, tagNum, 0), {
    })
    .catch(errorHandler);
  return data;
}

export async function getArticlesDataByAuthor(authorName: string): Promise<any[]> {
  let authorId: string | undefined = authorNamesMapping.get(authorName);
  console.log(authorId);
  if ( !authorId ) {
    authorId = "3"; // 西蒙
  }
  const { data } = await http
    .get(apiArticlesByAuthorTemplate(30, authorId, 0), {
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
