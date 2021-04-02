import { homedir, platform } from "os";
import { resolve } from "path";
import * as vscode from "vscode";

// TODO format these
export const baseArticleUrl: string = "https://www.gcores.com/articles/";
export const baseAuthorUrl: string = "https://www.gcores.com/users/";
export const baseImgUrl: string = "https://image.gcores.com/";
export const baseLimit: number = 50;
export const baseOffset: number = 0;
export const baseQuickPicksNum: number = 10;
export const webviewTitleSlice: number = 20;

// add new Category here
export enum Category {
    Recent = "近期文章",
    News = "近期新闻",
    Tag = "分类文章",
    Author = "作者专题",
    Top = "最热排行",
    Bookmark = "我的收藏",
    Audios = "近期电台",
}

export enum RecentType {
    News = 1,
    Article = 0,
}

export interface IQuickItemEx<T> extends vscode.QuickPickItem {
    value: T;
}

export interface IArticle {
    id: string;
    name: string;
    type: string;
    authorId: string;
    likesCount: number;
    commentsCount: number;
    bookmarksCount: number;
    bookmarkId: string;
    likeId: string;
    createdAt: string;
}

export const defaultArticle: IArticle = {
    id: "",
    name: "",
    type: "",
    authorId: "",
    likesCount: 0,
    commentsCount: 0,
    bookmarksCount: 0,
    bookmarkId: "",
    likeId: "",
    createdAt: "",
};

// add new tag here
export const articleTagsMapping: Map<string, string> = new Map([
    ["知识挖掘机", "20"],
    ["安利大帝", "18"],
    ["玩出花儿来", "27"],
    ["视觉动物", "42"],
    ["故事烩", "35"],
    ["太屎了", "19"],
    ["聊聊产业", "28"],
    ["人物", "41"],
    ["活着", "29"],
    ["GSENSE", "15"],
    ["红游睹思", "21"],
    ["有感而发", "56"],
    ["出来混靠它了", "31"],
    ["创作笔记", "55"],
    ["吉考思工业", "59"],
    ["显摆显摆", "58"],
    ["出去走走", "61"],
]);

// add new author here
export const authorNamesMapping: Map<string, string> = new Map([
    ["西蒙", "3"],
    ["Hardy", "385"],
    ["NJBK", "12865"],
    ["Nadya", "13701"],
    ["ARNwing", "15368"],
    ["四十二", "20803"],
    ["Ryoma", "21327"],
    ["白广大", "21635"],
    ["大巴车司机", "28214"],
    ["这样重这样轻", "31418"],
    ["Dagou", "91206"],
]);

export const topNamesMapping: Map<string, string> = new Map([
    ["点赞排行", "-likes-count"],
    ["收藏排行", "-bookmarks-count"],
    ["评论排行", "-comments-count"],
]);

// context global values
export const globalStateGcoresAuthorKey: string = "gcores.authors";
export const globalStateGcoresUserKey: string = "gcores.user";
export const globalStateGcoresBossKey: string = "gcores.boss";

// api related
export const headers: any = {
    "Accept" :
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,zh-HK;q=0.7",
    "Cache-Control": "max-age=0",
    "Content-Type": "application/vnd.api+json",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
  };

type IApiBaseTemplateFunc = (limit?: number, offset?: number, isNews?: number) => string;
type IApiBaseHotTemplateFunc = (hotName: string, limit?: number, offset?: number) => string;
type IApiTagsOrUsersTemplateFunc = (num: string, limit?: number, offset?: number, isNews?: number) => string;
type IApiOneDataTemplateFunc = (authorId: string) => string;
type IApiSearchTemplateFunc = (queryString: string, limit?: number, offset?: number) => string;
export type IRand = (min: number, max: number) => number;

export const apiArticlesOrNewsTemplate: IApiBaseTemplateFunc = (limit: number = baseLimit, offset: number = baseOffset, isNews: number = RecentType.Article): string => `https://www.gcores.com/gapi/v1/articles?page[limit]=${limit}&page[offset]=${offset}&sort=-published-at&include=category,user&filter[is-news]=${isNews}&fields[articles]=title,desc,is-published,thumb,app-cover,cover,comments-count,likes-count,bookmarks-count,is-verified,published-at,option-is-official,option-is-focus-showcase,duration,category,user`;
export const apiArticlesHotTemplate: IApiBaseHotTemplateFunc = (hotName: string, limit: number = baseLimit, offset: number = baseOffset): string => `https://www.gcores.com/gapi/v1/articles?page[limit]=${limit}&page[offset]=${offset}&sort=${hotName}&include=category,user&fields[articles]=title,desc,is-published,thumb,app-cover,cover,comments-count,likes-count,bookmarks-count,is-verified,published-at,option-is-official,option-is-focus-showcase,duration,category,user`;
export const apiSingleArticleTemplate: IApiOneDataTemplateFunc = (articleId: string): string => `https://www.gcores.com/gapi/v1/articles/${articleId}?include=category,user,user.role,tags,entities,entries,similarities.user,similarities.djs,similarities.category,collections&preview=1`;
export const apiArticleTagTemplate: IApiTagsOrUsersTemplateFunc = (tagNum: string, limit: number = baseLimit, offset: number = baseOffset, isNews: number = RecentType.Article): string => `https://www.gcores.com/gapi/v1/categories/${tagNum}/articles?page[limit]=${limit}&page[offset]=${offset}&sort=-published-at&include=category,user&filter[is-news]=${isNews}&fields[articles]=title,desc,is-published,thumb,app-cover,cover,comments-count,likes-count,bookmarks-count,is-verified,published-at,option-is-official,option-is-focus-showcase,duration,category,user`;
export const apiArticlesByAuthorTemplate: IApiTagsOrUsersTemplateFunc = (authorId: string, limit: number = baseLimit, offset: number = baseOffset, isNews: number = RecentType.Article): string => `https://www.gcores.com/gapi/v1/users/${authorId}/articles?page[limit]=${limit}&page[offset]=${offset}&sort=-published-at&include=category,user&filter[is-news]=${isNews}&fields[articles]=title,desc,is-published,thumb,app-cover,cover,comments-count,likes-count,bookmarks-count,is-verified,published-at,option-is-official,option-is-focus-showcase,duration,category,user`;
export const apiAuthorInfoTemplate: IApiOneDataTemplateFunc = (authorId: string): string => `https://www.gcores.com/gapi/v1/users/${authorId}`;
export const apiBookmarkTemplate: IApiTagsOrUsersTemplateFunc = (userId: string, limit: number = baseLimit, offset: number = baseOffset): string => `https://www.gcores.com/gapi/v1/users/${userId}/bookmarks?page[limit]=${limit}&page[offset]=${offset}&include=bookmarkable`;
export const apiSingleBookmarkTemplate: (bookmarkId: string) => string = (bookmarkId: string): string => `https://www.gcores.com/gapi/v1/bookmarks/${bookmarkId}`;
export const apitokenCheckTemplate: IApiTagsOrUsersTemplateFunc = (userId: string, limit: number = baseLimit, offset: number = baseOffset): string => `https://www.gcores.com/gapi/v1/users/${userId}/bookmarks?page[limit]=${limit}&page[offset]=${offset}`;
export const apiSearchTemplate: IApiSearchTemplateFunc = (queryString: string, limit?: number, offset?: number): string => `https://www.gcores.com/gapi/v1/search?page[limit]=${limit}&page[offset]=${offset}&include=user,djs,category&type=articles&query=${queryString}&order-by=score`;

// audios
export const audioBaseMp3Url: string = "http://alioss.gcores.com/uploads/audio/";
export const apiAudiosOrNewsTemplate: IApiBaseTemplateFunc = (limit: number = baseLimit, offset: number = baseOffset): string => `https://www.gcores.com/gapi/v1/radios?page[limit]=${limit}&page[offset]=${offset}&sort=-published-at&include=category,user&filter[list-all]=0&fields[radios]=title,desc,is-published,thumb,app-cover,cover,comments-count,likes-count,bookmarks-count,is-verified,published-at,option-is-official,option-is-focus-showcase,duration,category,user`;
export const apiSingleAudioTemplate: IApiOneDataTemplateFunc = (audioId: string): string => `https://www.gcores.com/gapi/v1/radios/${audioId}?include=category,user,media,djs,albums.album-bundles,user.role,tags,entities,entries,similarities.user,similarities.djs,similarities.category,collections,operational-events.giveaways.winners,operational-events.public-candidates&preview=1`;

// TODO login releated apis
export const loginApi: string = "https://www.gcores.com/gapi/v1/tokens/refresh";
export const bookmarksApi: string = "https://www.gcores.com/gapi/v1/bookmarks";
export const votesApi: string = "https://www.gcores.com/gapi/v1/votes";

// rust
export type NativePlayer = unknown;
export interface INativeModule {
    startKeyboardEvent(callback: (res: number) => void): void;

    kuwoCrypt(msg: string): Buffer;

    playerEmpty(player: NativePlayer): boolean;
    playerLoad(player: NativePlayer, url: string): boolean;
    playerNew(): NativePlayer;
    playerPause(player: NativePlayer): void;
    playerPlay(player: NativePlayer): boolean;
    playerPosition(player: NativePlayer): number;
    playerSetVolume(player: NativePlayer, level: number): void;
    playerStop(player: NativePlayer): void;
}

export const PLATFORM: string = platform();
export const HOME_DIR = vscode.Uri.file(homedir());
export const GCORES_DIR = vscode.Uri.joinPath(HOME_DIR, ".gcores");

// tslint:disable-next-line
export const NATIVE: any = require(
  resolve(__dirname, "..", "..", "build", `${PLATFORM}.node`),
) as INativeModule;
