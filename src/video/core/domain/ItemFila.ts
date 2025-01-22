import { Video } from "./Video";

export class ItemFila {
  video: Video;
  originalMessage: any;

  constructor(video?: Video, originalMessage?: any) {
    this.video = video || null;
    this.originalMessage = originalMessage || null;
  }
}
