import { Inject, Injectable } from "@nestjs/common";
import { IVideoRepository } from "src/video/core/application/repository/video-repository.port";
import { Repository } from "typeorm";
import { VideoEntity } from "./entity/video.entity";
import { Video } from "src/video/core/domain/Video";

@Injectable()
export class VideoRepositoryAdapter implements IVideoRepository {
  constructor(
    @Inject("VIDEO_REPOSITORY")
    private videoRepository: Repository<VideoEntity>
  ) {}

  async adquirirPorID(id: string): Promise<Video> {
    return await this.videoRepository.findOneBy({ id });
  }

  async salvarVideo(dadosVideo: Video): Promise<Video> {
    const video: VideoEntity = { ...dadosVideo };
    return await this.videoRepository.save(video);
  }

  async adquirirPorUsuario(idUsuario: string): Promise<Video[]> {
    return await this.videoRepository.findBy({ idUsuario });
  }
}