import { Video } from "../../domain/Video";

export abstract class IVideoRepository {
  abstract salvarVideo(Video: Video): Promise<Video>;
  abstract adquirirPorID(id: string): Promise<Video>;
}