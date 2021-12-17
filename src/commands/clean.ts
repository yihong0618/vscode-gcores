import { window, workspace} from "vscode";
import { GCORES_DIR } from "../shared/shared";

// some code from https://github.com/YXL76/cloudmusic-vscode
export function clean(): void {
      workspace.fs.delete(GCORES_DIR, {
        recursive: true,
        useTrash: false,
      });
      window.showInformationMessage("Clean cache success.");
}
