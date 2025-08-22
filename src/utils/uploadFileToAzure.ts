import { BlobServiceClient } from '@azure/storage-blob';
import { randomUUID } from 'crypto';
import { Attachment } from '../types/attachment.type';

const getContentTypeFromExtension = (ext: string): string => {
  const typeMap: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return typeMap[ext] || `application/octet-stream`;
};

export const uploadFileToAzure = async (file: Express.Multer.File) => {
  try {
    const containerName = process.env.AZURE_CONTAINER_NAME;
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION as string,
    );
    const containerClient = blobServiceClient.getContainerClient(
      containerName as string,
    );

    // PROPERLY get file extension (handles multiple dots)
    const originalName = file.originalname;
    const lastDotIndex = originalName.lastIndexOf('.');

    const fileExtension =
      lastDotIndex > 0
        ? originalName.slice(lastDotIndex + 1).toLowerCase()
        : 'pdf';

    // Get content type (use mimetype if available, otherwise infer from extension)
    const mimeType = file.mimetype;
    const contentType = mimeType || getContentTypeFromExtension(fileExtension);

    const uniqueFilename = `${randomUUID()}.${fileExtension}`;

    const blobClient = containerClient.getBlockBlobClient(uniqueFilename);
    await blobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: contentType },
    });
    const fileUrl = blobClient.url;
    const newFile = new Attachment(fileUrl, fileExtension);

    return newFile;
  } catch (error) {
    console.log(error);
  }
};
