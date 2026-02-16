import { AppConstants } from '../constants/app.constants';

export class MongoErrorUtil {
  static isDuplicateKeyError(error: unknown): boolean {
    return (
      (error as { code?: number })?.code ===
      AppConstants.MONGO.ERROR_CODES.DUPLICATE_KEY
    );
  }

  static async handleDuplicateKeyError<T>(
    error: unknown,
    findExisting: () => Promise<T | null>,
  ): Promise<T | null> {
    if (this.isDuplicateKeyError(error)) {
      return await findExisting();
    }
    throw error;
  }
}
