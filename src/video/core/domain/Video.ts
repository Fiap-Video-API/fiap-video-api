export class Video {
  id: string;
  status: string;
  pathVideo: string;
  pathZip: string | null;

  constructor(id?: string, status?: string, pathVideo?: string, pathZip?: string) {
    this.id = id || null;
    this.status = status || null;
    this.pathVideo = pathVideo || null;
    this.pathZip = pathZip || null;
  }
}