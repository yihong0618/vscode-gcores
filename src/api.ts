import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { window } from "vscode";
import { baseLimit, baseOffset, RecentType } from "./shared";

const headers: any = {
  "Accept" :
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,zh-HK;q=0.7",
  "Cache-Control": "max-age=0",
  "Content-Type": "application/vnd.api+json",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
};

// TODO maybe move these to shared
type IApiBaseTemplateFunc = (limit?: number, offset?: number, isNews?: number) => string;
type IApiTagsOrUsersTemplateFunc = (num: string, limit?: number, offset?: number, isNews?: number) => string;
type IApiOneDataTemplateFunc = (authorId: string) => string;
type IRand = (min: number, max: number) => number;

const apiArticlesOrNewsTemplate: IApiBaseTemplateFunc = (limit: number = baseLimit, offset: number = baseOffset, isNews: number = RecentType.Article): string => `https://www.gcores.com/gapi/v1/articles?page[limit]=${limit}&page[offset]=${offset}&sort=-published-at&include=category,user&filter[is-news]=${isNews}&fields[articles]=title,desc,is-published,thumb,app-cover,cover,comments-count,likes-count,bookmarks-count,is-verified,published-at,option-is-official,option-is-focus-showcase,duration,category,user`;
const apiSingleArticleTemplate: IApiOneDataTemplateFunc = (articleId: string): string => `https://www.gcores.com/gapi/v1/articles/${articleId}?include=category,user,user.role,tags,entities,entries,similarities.user,similarities.djs,similarities.category,collections&preview=1`;
const apiArticleTagTemplate: IApiTagsOrUsersTemplateFunc = (tagNum: string, limit: number = baseLimit, offset: number = baseOffset, isNews: number = RecentType.Article): string => `https://www.gcores.com/gapi/v1/categories/${tagNum}/articles?page[limit]=${limit}&page[offset]=${offset}&sort=-published-at&include=category,user&filter[is-news]=${isNews}&fields[articles]=title,desc,is-published,thumb,app-cover,cover,comments-count,likes-count,bookmarks-count,is-verified,published-at,option-is-official,option-is-focus-showcase,duration,category,user`;
const apiArticlesByAuthorTemplate: IApiTagsOrUsersTemplateFunc = (authorId: string, limit: number = baseLimit, offset: number = baseOffset, isNews: number = RecentType.Article): string => `https://www.gcores.com/gapi/v1/users/${authorId}/articles?page[limit]=${limit}&page[offset]=0&sort=-published-at&include=category,user&filter[is-news]=${isNews}&fields[articles]=title,desc,is-published,thumb,app-cover,cover,comments-count,likes-count,bookmarks-count,is-verified,published-at,option-is-official,option-is-focus-showcase,duration,category,user`;
const apiAuthorInfoTemplate: IApiOneDataTemplateFunc = (authorId: string): string => `https://www.gcores.com/gapi/v1/users/${authorId}`;
const apiBookmarkTemplate: IApiTagsOrUsersTemplateFunc = (userId: string, limit: number = baseLimit, offset: number = baseOffset): string => `https://www.gcores.com/gapi/v1/users/${userId}/bookmarks?page[limit]=${limit}&page[offset]=${offset}&include=bookmarkable`;
const apitokenCheckTemplate: IApiTagsOrUsersTemplateFunc = (userId: string, limit: number = baseLimit, offset: number = baseOffset): string => `https://www.gcores.com/gapi/v1/users/${userId}/bookmarks?page[limit]=${limit}&page[offset]=${offset}`;

// TODO login releated apis
const loginApi: string = "https://www.gcores.com/gapi/v1/tokens/refresh";
const bookmarksApi: string = "https://www.gcores.com/gapi/v1/bookmarks";

const http: AxiosInstance = axios.create({
  headers,
});

function errorHandler(err: AxiosError): Promise<never> {
  const { response, config } = err;
  const data: any = (response as any).data;
  if (data) {
    const msg: string = data.errors[0].detail;
    window.showInformationMessage(msg);
    return Promise.reject(err);
  }
  window.showInformationMessage("Something wrong");
  return Promise.reject(err);
}

function errorCheckHandler(err: AxiosError): boolean {
  const { response, config } = err;
  const data: any = (response as any).data;
  if (data) {
    const msg: string = data.errors[0].detail;
    window.showInformationMessage(msg);
  }
  window.showInformationMessage("Something wrong");
  return false;
}

export async function getRecentArticlesData(): Promise<AxiosResponse<any>> {
  const { data } = await http
    .get(apiArticlesOrNewsTemplate(), {
    })
    .catch(errorHandler);
  return data;
}

export async function getRecentNewsData(): Promise<AxiosResponse<any>> {
  const { data } = await http
    .get(apiArticlesOrNewsTemplate(baseLimit, baseOffset, RecentType.News), {
    })
    .catch(errorHandler);
  return data;
}

// TODO any to change type
export async function getArticlesDataByTag(mapping: Map<string, string>, tagName: string): Promise<AxiosResponse<any>> {
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

export async function getArticlesDataByAuthor(mapping: Map<string, string>, authorName: string): Promise<AxiosResponse<any>> {
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

export async function getOneArticleData(arcicleId: string): Promise<AxiosResponse<any>> {
  const apiSingleArticle: string = apiSingleArticleTemplate(arcicleId);
  const { data } = await http
    .get(apiSingleArticle, {
    })
    .catch(errorHandler);
  return data;
}

export async function getAuthorInfo(authorId: string): Promise<AxiosResponse<any>> {
  const apiAuthorInfo: string = apiAuthorInfoTemplate(authorId);
  const { data } = await http
    .get(apiAuthorInfo, {
    })
    .catch(errorHandler);
  return data;
}

export async function getPickOneInfo(): Promise<AxiosResponse<any>> {
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

export async function login(username: string, password: string): Promise<AxiosResponse<any>> {
  const payload: any = {
    data: {
      provider: "identity",
      remember: true,
      username,
      password,
    },
  };
  const { data } = await http
    .post(loginApi, payload)
    .catch(errorHandler);
  return data;
}

export async function checkTokenWithApi(userId: string, token: string): Promise<any> {
  headers["Authorization"] = "Token token=" + token;
  const { status }: any = await axios
  .get(apitokenCheckTemplate(userId), {
    headers,
  })
  .catch(errorCheckHandler);
  if (status === 200) {
    return true;
  }
  return false;
}

export async function getArticlesDataByUserBookmark(userId: string, token: string): Promise<AxiosResponse<any>> {
  headers["Authorization"] = "Token token=" + token;
  const { data } = await axios
    .get(apiBookmarkTemplate(userId), {
      headers,
    })
    .catch(errorHandler);
  return data;
}

export async function addBookmarkById(userId: string, articleId: string, token: string): Promise<any> {
  headers["Authorization"] = "Token token=" + token;
  const payload: any = {
      data: {
        type: "bookmarks",
        relationships: {
          user: { data: {
            type: "users",
            id: userId,
          },
        },
        bookmarkable: {
          data: {
            type: "articles",
            id: articleId,
          },
        },
      },
    },
  };
  const { status }: any = await axios
  .post(bookmarksApi, payload, {
    headers,
  })
  .catch(errorCheckHandler);
  // gcors return seems 201 or 200
  if (Math.floor(status / 100) === 2) {
    return true;
  }
  return false;
}
