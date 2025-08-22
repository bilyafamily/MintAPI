export class Attachment {
  fileUrl: string;
  fileType: string;
  constructor(fileUrl: string, fileType: string) {
    this.fileUrl = fileUrl;
    this.fileType = fileType;
  }
}
