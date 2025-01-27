export class Video {
  id: string | null;
  idUsuario: string;
  emailUsuario: string;
  status: string;
  pathVideo: string;
  pathZip: string | null;
  dowload: boolean;

  constructor(id?: string, idUsuario?: string, emailUsuario?: string, status?: string, pathVideo?: string, pathZip?: string, dowload?: boolean) {
    this.id = id || null;
    this.idUsuario = idUsuario || null;
    this.emailUsuario = emailUsuario || null;
    this.status = status || null;
    this.pathVideo = pathVideo || null;
    this.pathZip = pathZip || null;
    this.dowload = dowload || null;
  }
}