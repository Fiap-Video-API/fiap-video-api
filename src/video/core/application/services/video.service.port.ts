import { Video } from "../../domain/Video";

export abstract class IVideoService {
  abstract registrarUpload(file: Express.Multer.File, idUsuario: string, emailUsuario: string): Promise<Video>;
  abstract registrarDownload(video: Video): Promise<Video>;
  abstract retornoProcessamento(video: Video) : Promise<void>
}