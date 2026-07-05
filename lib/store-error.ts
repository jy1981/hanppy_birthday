export type StoreErrorCode =
  | 'ALREADY_EXISTS'
  | 'NOT_FOUND'
  | 'INVALID_PASSWORD'
  | 'MISCONFIGURED'
  | 'UPLOAD_FAILED';

/** 愿望 / 相册存储层统一错误类型 */
export class WishStoreError extends Error {
  constructor(
    public code: StoreErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'WishStoreError';
  }
}
