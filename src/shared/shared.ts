import * as vscode from "vscode";
import * as TopBookmarks from "./top-bookmarks.json";
import * as topComments from "./top-comments.json";
import * as topLikes from "./top-likes.json";

// TODO format these
export const baseArticleUrl: string = "https://www.gcores.com/articles/";
export const baseAuthorUrl: string = "https://www.gcores.com/users/";
export const baseImgUrl: string = "https://image.gcores.com/";
export const baseLimit: number = 50;
export const baseOffset: number = 0;
export const baseQuickPicksNum: number = 10;

// add new Category here
export enum Category {
    Recent = "近期文章",
    News = "近期新闻",
    Tag = "分类文章",
    Author = "作者专题",
    Top = "最热排行",
    Bookmark = "我的收藏",
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
    authorId: string;
    likesCount: number;
    commentsCount: number;
    bookmarksCount: number;
    bookmarkId: string;
    createdAt: string;
}

export const defaultArticle: IArticle = {
    id: "",
    name: "",
    authorId: "",
    likesCount: 0,
    commentsCount: 0,
    bookmarksCount: 0,
    bookmarkId: "",
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

export const topNamesMapping: Map<string, any> = new Map([
    ["点赞TOP100", topLikes],
    ["收藏TOP100", TopBookmarks],
    ["评论TOP100", topComments],
]);

// context global values
export const globalStateGcoresAuthorKey: string = "gcores.authors";
export const globalStateGcoresUserKey: string = "gcores.user";
export const globalStateGcoresBossKey: string = "gcores.boss";
