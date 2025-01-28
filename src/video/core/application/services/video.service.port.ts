import { Video } from "../../domain/Video";

export abstract class IVideoService {
  abstract registrarUpload(file: Express.Multer.File, idUsuario: string, emailUsuario: string): Promise<Video>;
  abstract registrarDownload(id: string, idUsuario: string): Promise<Video>;
  abstract retornoProcessamento(video: Video) : Promise<void>;
  abstract adquirirStatusPorUsuario(idUsuario: string) : Promise<Video[]>
  abstract adquirirStatusPorVideo(idVideo: string, idUsuario: string) : Promise<Video>
}