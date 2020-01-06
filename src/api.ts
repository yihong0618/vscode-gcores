import * as vscode from "vscode";
import axios, { AxiosInstance, AxiosError } from "axios";
import { window } from "vscode";

const headers: object = {
  "Accept" :
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,zh-HK;q=0.7",
  "Cache-Control": "max-age=0",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36"
};

const api1: string = "https://www.gcores.com/gapi/v1/articles?page[limit]=12&page[offset]=0&sort=-published-at&include=category,user&filter[is-news]=0&fields[articles]=title,desc,is-published,thumb,app-cover,cover,comments-count,likes-count,bookmarks-count,is-verified,published-at,option-is-official,option-is-focus-showcase,duration,category,user"

const http: AxiosInstance = axios.create({
  headers,
});

function errorHandler(err: AxiosError): Promise<never> {
  const { response, config } = err;
  const data: any = (response as any).data;
  if (data && data.msg) {
    const msg: string = data.msg;
    window.showErrorMessage(msg);
    console.error(`[${(config.method || "GET").toUpperCase()}]: ${config.url}`);
    console.error(config);
    return Promise.reject(err);
  }
  return Promise.reject(err);
}

export async function getGcoresData(): Promise<any[]> {
  const { data } = await http
    .get(api1, {
    })
    .catch(errorHandler);
  return data;
}