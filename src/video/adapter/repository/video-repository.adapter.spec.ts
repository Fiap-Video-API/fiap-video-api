import { Test, TestingModule } from "@nestjs/testing";
import { VideoRepositoryAdapter } from "./video-repository.adapter"; // Ajuste o caminho conforme necessário
import { Repository } from "typeorm";
import { VideoEntity } from "./entity/video.entity"; // Ajuste o caminho conforme necessário
import { getRepositoryToken } from "@nestjs/typeorm";

describe("VideoRepositoryAdapter", () => {
  let videoRepositoryAdapter: VideoRepositoryAdapter;
  let mockRepository: Repository<VideoEntity>;

  beforeEach(async () => {
    mockRepository = {
      findOneBy: jest.fn(),
      save: jest.fn(),
      findBy: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: VideoRepositoryAdapter,
          useValue: new VideoRepositoryAdapter(mockRepository),
        },
        {
          provide: getRepositoryToken(VideoEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    videoRepositoryAdapter = module.get<VideoRepositoryAdapter>(VideoRepositoryAdapter);
  });

  describe("adquirirPorID", () => {
    it("Deve retornar o vídeo correto pelo ID", async () => {
      const videoMock = new VideoEntity();
      videoMock.id = "video-id";
      videoMock.idUsuario = "user123";
      videoMock.emailUsuario = "user@example.com";
      videoMock.status = "ativo";
      videoMock.pathVideo = "/videos/video.mp4";
      videoMock.pathZip = "/zips/video.zip";
      videoMock.dowload = true;

      (mockRepository.findOneBy as jest.Mock).mockResolvedValue(videoMock);

      const result = await videoRepositoryAdapter.adquirirPorID("video-id");

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: "video-id" });
      expect(result).toEqual(videoMock);
    });
  });

  describe("salvarVideo", () => {
    it("Deve salvar e retornar o vídeo", async () => {
      const videoMock = new VideoEntity();
      videoMock.id = "video-id";
      videoMock.idUsuario = "user123";
      videoMock.emailUsuario = "user@example.com";
      videoMock.status = "ativo";
      videoMock.pathVideo = "/videos/video.mp4";
      videoMock.pathZip = "/zips/video.zip";
      videoMock.dowload = true;

      (mockRepository.save as jest.Mock).mockResolvedValue(videoMock);

      const result = await videoRepositoryAdapter.salvarVideo(videoMock);

      expect(mockRepository.save).toHaveBeenCalledWith(videoMock);
      expect(result).toEqual(videoMock);
    });
  });

  describe("adquirirPorUsuario", () => {
    it("Deve retornar uma lista de vídeos pelo ID do usuário", async () => {
      const videoMock = new VideoEntity();
      videoMock.id = "video-id";
      videoMock.idUsuario = "user123";
      videoMock.emailUsuario = "user@example.com";
      videoMock.status = "ativo";
      videoMock.pathVideo = "/videos/video.mp4";
      videoMock.pathZip = "/zips/video.zip";
      videoMock.dowload = true;

      (mockRepository.findBy as jest.Mock).mockResolvedValue([videoMock]);

      const result = await videoRepositoryAdapter.adquirirPorUsuario("user123");

      expect(mockRepository.findBy).toHaveBeenCalledWith({ idUsuario: "user123" });
      expect(result).toEqual([videoMock]);
    });

    it("Deve retornar uma lista vazia se nenhum vídeo for encontrado", async () => {
      (mockRepository.findBy as jest.Mock).mockResolvedValue([]);

      const result = await videoRepositoryAdapter.adquirirPorUsuario("user456");

      expect(mockRepository.findBy).toHaveBeenCalledWith({ idUsuario: "user456" });
      expect(result).toEqual([]);
    });
  });
});
