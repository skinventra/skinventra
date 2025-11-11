// Extend Express Request type with user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      id: string;
      steamId: string;
      username: string;
      avatar: string;
      profileUrl?: string;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}

export {};
