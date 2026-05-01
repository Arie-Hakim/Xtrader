export class ApiError extends Error {
  constructor(
    public hebrewMessage: string,
    public statusCode?: number,
    public originalError?: unknown,
  ) {
    super(hebrewMessage);
    this.name = "ApiError";
  }
}
