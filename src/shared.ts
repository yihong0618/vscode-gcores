
export const baseArticleUrl: string = "https://www.gcores.com/articles/";
export const baseAuthorUrl: string = "https://www.gcores.com/users/";
export const baseImgUrl: string = "https://image.gcores.com/";
export const baseLimit: number = 50;
export const baseOffset: number = 0;

// add new Category here
export enum Category {
    Recent = "近期文章",
    News = "近期新闻",
    Tag = "分类文章",
    Author = "作者专题",
    Bookmark = "我的收藏",
}

export enum RecentType {
    News = 1,
    Article = 0,
}

export interface IArticle {
    id: string;
    name: string;
    authorId: string;
    likesCount: number;
    commentsCount: number;
    bookmarksCount: number;
    createdAt: string;
}

export const defaultArticle: IArticle = {
    id: "",
    name: "",
    authorId: "",
    likesCount: 0,
    commentsCount: 0,
    bookmarksCount: 0,
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
    ["Dagou", "91206"],
    ["这样重这样轻", "31418"],
    ["白广大", "21635"],
    ["Nadya", "13701"],
    ["四十二", "20803"],
    ["Ryoma", "21327"],
    ["大巴车司机", "28214"],
    ["ARNwing", "15368"],
    ["NJBK", "12865"],
    ["Hardy", "385"],
]);

export const globalStateGcoresAuthorKey: string = "gcores.authors";
export const globalStateGcoresUserKey: string = "gcores.user";
