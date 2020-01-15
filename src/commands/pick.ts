// TODO
import { getPickOneInfo } from "../api";
import { explorerNodeManager } from "../explorer/explorerNodeManager";
import { GcoresNode } from "../explorer/GcoresNode";
import { previewArticle } from "./show";

export async function pickArticle(): Promise<void> {
    const data: any = await getPickOneInfo();
    const node: GcoresNode = explorerNodeManager.parseToGcoresNode(data.data[0]);
    await previewArticle(node);
}
