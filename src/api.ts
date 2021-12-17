import axios, { AxiosError, AxiosResponse } from "axios";
import { Agent, globalAgent } from "https";
import * as Parser from "rss-parser";
import { Readable } from "stream";
import { window } from "vscode";
import { apiArticlesByAuthorTemplate, apiArticlesHotTemplate, apiArticlesOrNewsTemplate, apiArticleTagTemplate, apiAudiosOrNewsTemplate, apiAuthorInfoTemplate, apiBookmarkTemplate, apiSearchTemplate, apiSingleArticleTemplate, apiSingleAudioTemplate, apiSingleBookmarkTemplate, apitokenCheckTemplate, baseLimit, baseOffset, bookmarksApi, headers, IRand, loginApi, RecentType, votesApi } from "./shared/shared";

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

export async function getRecentArticlesData(limit: number = baseLimit, offset: number = baseOffset, token?: string | undefined): Promise<AxiosResponse<any>> {
  if (token) {
    headers["Authorization"] = "Token token=" + token;
  }
  const { data } = await axios
    .get(apiArticlesOrNewsTemplate(limit, offset), {
    headers})
    .catch(errorHandler);
  return data;
}

export async function getRecentNewsData(limit: number = baseLimit, offset: number = baseOffset, token?: string | undefined): Promise<AxiosResponse<any>> {
  if (token) {
    headers["Authorization"] = "Token token=" + token;
  }
  const { data } = await axios
    .get(apiArticlesOrNewsTemplate(limit, offset, RecentType.News), {
    headers})
    .catch(errorHandler);
  return data;
}

// TODO any to change type
export async function getArticlesDataByTag(mapping: Map<string, string>, tagName: string, limit: number, offset: number, token?: string | undefined): Promise<AxiosResponse<any>> {
  if (token) {
    headers["Authorization"] = "Token token=" + token;
  }
  let tagNum: string | undefined = mapping.get(tagName);
  if ( !tagNum ) {
    tagNum = "1";
  }
  const { data } = await axios
    .get(apiArticleTagTemplate(tagNum, limit, offset), {
    headers})
    .catch(errorHandler);
  return data;
}

export async function getArticlesDataByHot(mapping: Map<string, string>, hotName: string, limit: number, offset: number, token?: string | undefined): Promise<AxiosResponse<any>> {
  if (token) {
    headers["Authorization"] = "Token token=" + token;
  }
  let nameOfHot: string | undefined = mapping.get(hotName);
  if ( !nameOfHot ) {
    nameOfHot = "likes-count";
  }
  const { data } = await axios
    .get(apiArticlesHotTemplate(nameOfHot, limit, offset), {
    headers})
    .catch(errorHandler);
  return data;
}

export async function getArticlesDataByAuthor(mapping: Map<string, string>, authorName: string, limit: number, offset: number, token?: string | undefined): Promise<AxiosResponse<any>> {
  if (token) {
    headers["Authorization"] = "Token token=" + token;
  }
  let authorId: string | undefined = mapping.get(authorName);
  if ( !authorId ) {
    authorId = "3"; // 西蒙
  }
  const { data } = await axios
    .get(apiArticlesByAuthorTemplate(authorId, limit, offset), {
    headers})
    .catch(errorHandler);
  return data;
}

export async function getOneArticleData(arcicleId: string, token?: string | undefined): Promise<AxiosResponse<any>> {
  if (token) {
    headers["Authorization"] = "Token token=" + token;
  }
  const apiSingleArticle: string = apiSingleArticleTemplate(arcicleId);
  const { data } = await axios
    .get(apiSingleArticle, {
    headers})
    .catch(errorHandler);
  return data;
}

export async function getAuthorInfo(authorId: string): Promise<AxiosResponse<any>> {
  const apiAuthorInfo: string = apiAuthorInfoTemplate(authorId);
  const { data } = await axios
    .get(apiAuthorInfo, {
    headers})
    .catch(errorHandler);
  return data;
}

export async function getSearchInfo(queryString: string, limit: number = baseLimit, offset: number = baseOffset): Promise<AxiosResponse<any>> {
  const { data } = await axios
    .get(encodeURI(apiSearchTemplate(queryString, limit, offset)), {
    headers})
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
  const { data } = await axios
    .get(apiArticlesOrNewsTemplate(1, offset), {
  headers})
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
  const { data } = await axios
    .post(loginApi, payload, {headers})
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

export async function getArticlesDataByUserBookmark(userId: string, token: string, limit: number, offset: number): Promise<AxiosResponse<any>> {
  headers["Authorization"] = "Token token=" + token;
  const { data } = await axios
    .get(apiBookmarkTemplate(userId, limit, offset), {
      headers,
    })
    .catch(errorHandler);
  return data;
}

export async function addBookmarkById(userId: string, articleId: string, token: string): Promise<boolean> {
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
  // gcors return status seems 201 or 200 maybe others
  if (Math.floor(status / 100) === 2) {
    return true;
  }
  return false;
}

export async function getUserBookmarkInfo(userId: string, token: string): Promise<any> {
  headers["Authorization"] = "Token token=" + token;
  const { data } = await axios
    .get(apiBookmarkTemplate(userId), {
      headers,
    })
    .catch(errorHandler);
  return data;
}

export async function deleteBookmarkArticle(bookmarkId: string, token: string): Promise<boolean> {
  headers["Authorization"] = "Token token=" + token;
  const { status }: any = await axios
  .delete(apiSingleBookmarkTemplate(bookmarkId), {
    headers,
  })
  .catch(errorCheckHandler);
  // gcors return status seems 201 or 200 maybe others
  if (Math.floor(status / 100) === 2) {
    return true;
  }
  return false;
}

export async function addLikeById(userId: string, articleId: string, token: string, voteType: string = "articles"): Promise<boolean> {
  headers["Authorization"] = "Token token=" + token;
  const payload: any = {
      data: {
        type: "votes",
        attributes: { "vote-flag": true },
        relationships: {
          votable: {
            data: {
              type: voteType,
              id: articleId,
            },
          },
          voter: {
            data: {
              type: "users",
              id: userId,
            },
          },
        },
      },
  };
  const { status }: any = await axios
  .post(votesApi, payload, {
    headers,
  })
  .catch(errorCheckHandler);
  // gcors return status seems 201 or 200 maybe others
  if (Math.floor(status / 100) === 2) {
    return true;
  }
  return false;
}

export async function deleteLikeArticle(likeId: string, token: string): Promise<boolean> {
  headers["Authorization"] = "Token token=" + token;
  const { status }: any = await axios
  .delete(`${votesApi}/${likeId}`, {
    headers,
  })
  .catch(errorCheckHandler);
  // gcors return status seems 201 or 200 maybe others
  if (Math.floor(status / 100) === 2) {
    return true;
  }
  return false;
}

// audios apis add date 20210329
export async function getRecentAudiosData(limit: number = baseLimit, offset: number = baseOffset, token?: string | undefined): Promise<AxiosResponse<any>> {
  if (token) {
    headers["Authorization"] = "Token token=" + token;
  }
  const { data } = await axios
    .get(apiAudiosOrNewsTemplate(limit, offset), {
    headers})
    .catch(errorHandler);
  return data;
}

export async function getOneAudioData(audioId: string, token?: string | undefined): Promise<AxiosResponse<any>> {
  if (token) {
    headers["Authorization"] = "Token token=" + token;
  }
  const apiSingleArticle: string = apiSingleAudioTemplate(audioId);
  const { data } = await axios
    .get(apiSingleArticle, {
    headers})
    .catch(errorHandler);
  return data;
}

export async function downloadMusic(url: string): Promise<Readable | void> {
  try {
    globalAgent.options.rejectUnauthorized = false;
    const { data } = await axios.get<Readable>(url, {
      responseType: "stream",
      timeout: 8000,
      httpsAgent: new Agent({
        rejectUnauthorized: false,
      }),
    });
    return data;
  } catch (err) {
    window.showErrorMessage(err);
  }
  return;
}

// rss
export async function getRssData(url: string): Promise<any> {
  try {
    const parser: Parser = new Parser({
      customFields: {
        feed: ["otherTitle", "extendedDescription"],
        item: ["enclosure", "pubDate"],
      },
      requestOptions: {
        rejectUnauthorized: false,
      },
    });
    const feed: any = await parser.parseURL(url);
    return feed;
  } catch (err) {
    window.showInformationMessage(err.message);
    return;
  }
}
