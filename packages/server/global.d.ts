export {};

interface App {
  config: {
    port: number;
    db: {
      provider: string;
      url: string;
      maxPageSize: number;
    };
  };
  prisma: import("@prisma/client").PrismaClient;
}

declare global {
  declare namespace NodeJS {
    interface Process {
      app: App;
    }
  }
}
