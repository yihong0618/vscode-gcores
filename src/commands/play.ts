import { createWriteStream } from "fs";
import * as vscode from "vscode";
import { downloadMusic, getOneAudioData } from "../api";
import { GcoresNode } from "../explorer/GcoresNode";
import { gcoresTreeDataProvider } from "../explorer/GcoresTreeDataProvider";
import { GCORES_DIR, NATIVE } from "../shared/shared";
import { parseMp3Link } from "./utils";

export async function playAudio(node: GcoresNode): Promise<void> {
    const playingId: string = gcoresTreeDataProvider.playingId;
    const player: any = gcoresTreeDataProvider.player;
    if (!node.link) {
        const articleData: any = await getOneAudioData(node.id);
        node.linkData = parseMp3Link(articleData);
    }
    if (playingId !== node.id) {
        gcoresTreeDataProvider.playingId = node.id;
        gcoresTreeDataProvider.isPlaying = true;
        NATIVE.playerEmpty(player);
        NATIVE.playerSetVolume(player, 85);
        const data: any = await downloadMusic(node.link);
        const tmpUri: vscode.Uri = vscode.Uri.joinPath(GCORES_DIR, playingId + ".mp3");
        if (data) {
            let len: number = 0;
            const onData: any = ({ length }: { length: number }) => {
              len += length;
              if (len > 256 * 1024) {
                data.removeListener("data", onData);
                NATIVE.playerLoad(player, tmpUri.fsPath);
              }
            };
            data.on("data", onData);
            data.once("error", (err: any) => {
              vscode.window.showErrorMessage(err.message);
            });
            const file: any = createWriteStream(tmpUri.fsPath);
            data.pipe(file);
          }
        NATIVE.playerPlay(player);
    } else {
        if ( gcoresTreeDataProvider.isPlaying ) {
          NATIVE.playerPause(player);
          gcoresTreeDataProvider.isPlaying = false;
        } else {
          NATIVE.playerPlay(player);
          gcoresTreeDataProvider.isPlaying = true;
        }
    }
    gcoresTreeDataProvider.refresh();
}
