export interface NewsMedia {
  id: number;

  mediaAssetId: number;

  mediaRole: string;

  displayOrder: number;

  provider: string;

  assetType: string;

  publicId: string;

  fileUrl: string;

  thumbnailUrl: string | null;

  originalFileName: string | null;

  mimeType: string | null;

  fileExtension: string | null;

  fileSizeBytes: number | null;

  width: number | null;

  height: number | null;

  altText: string | null;

  caption: string | null;
}

export interface NewsMediaManagerProps {
  newsId: number;

  media: NewsMedia[];

  onMediaChange: (media: NewsMedia[]) => void;

  disabled?: boolean;
}
