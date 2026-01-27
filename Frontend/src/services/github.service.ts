import { api } from '@/services/api';

export async function unlinkGithubAccount() {
  // This should call your backend endpoint to unlink the GitHub account
  // Adjust the endpoint as per your backend implementation
  return api.post('/github/unlink');
}
