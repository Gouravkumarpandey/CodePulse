export interface Repository {
  _id: string;
  userId: string;
  githubRepoId: number;
  name: string;
  fullName: string;
  owner: string;
  url: string;
  description?: string;
  language?: string;
  isPrivate: boolean;
  isConnected: boolean;
  webhookId?: string;
  lastSync?: Date;
  createdAt: Date;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  language?: string;
  private: boolean;
  html_url: string;
  owner: {
    login: string;
  };
}
