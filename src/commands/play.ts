import * as vscode from "vscode";
import { GcoresNode } from "../explorer/GcoresNode";
import { gcoresTreeDataProvider } from "../explorer/GcoresTreeDataProvider";
import { getOneAudioData, downloadMusic } from "../api";
import { NATIVE, GCORES_DIR } from "../shared/shared";
import { parseMp3Link } from "./utils";
import { createWriteStream } from "fs";


export async function playAudio(node: GcoresNode): Promise<void> {
    const playingId: string = gcoresTreeDataProvider.playingId;
    const player: any = gcoresTreeDataProvider.player;
    if (!node.link) {
        const articleData = await getOneAudioData(node.id);
        node.linkData = parseMp3Link(articleData);
    }
    if (playingId !== node.id) {
        gcoresTreeDataProvider.playingId = node.id;
        NATIVE.playerEmpty(player);
        NATIVE.playerSetVolume(player, 85);
        const data = await downloadMusic(node.link);
        const tmpUri = vscode.Uri.joinPath(GCORES_DIR, playingId + ".mp3");
        if (data) {
            let len = 0;
            const onData = ({ length }: { length: number }) => {
              len += length;
              if (len > 256 * 1024) {
                data.removeListener("data", onData);
                NATIVE.playerLoad(player, tmpUri.fsPath);
              }
            };
            data.on("data", onData);
            data.once("error", (err) => {
              vscode.window.showErrorMessage(err.message);
            });
            const file = createWriteStream(tmpUri.fsPath);
            data.pipe(file);
          }
        NATIVE.playerPlay(player);
    } else {
        NATIVE.playerStop(player)
    }
}
