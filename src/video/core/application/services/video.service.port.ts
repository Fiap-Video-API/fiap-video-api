import { Video } from "../../domain/Video";

export abstract class IVideoService {
  abstract processarArquivo(file: Express.Multer.File): Promise<Video>;
  abstract registrarDownload(video: Video): Promise<Video>
}