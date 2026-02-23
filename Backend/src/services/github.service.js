/**
 * GitHub Service
 * Helper functions for GitHub API interactions
 */

const axios = require('axios');
const GITHUB_CONFIG = require('../config/github');
const DatabaseService = require('./mongo.service');
const consistencyService = require('./consistency.service');
const ruleEngineService = require('./ruleEngine.service');
const aiService = require('./ai.service');

class GitHubService {
  /**
   * Exchange authorization code for access token
   */
  static async getAccessToken(code) {
    try {
      console.log('Exchanging code for access token...');
      console.log('Client ID:', GITHUB_CONFIG.clientID);
      console.log('Code:', code);

      const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: GITHUB_CONFIG.clientID,
          client_secret: GITHUB_CONFIG.clientSecret,
          code,
          redirect_uri: GITHUB_CONFIG.redirectURL,
        },
        {
          headers: { Accept: 'application/json' },
        }
      );

      console.log('GitHub token response:', response.data);

      const { access_token, error, error_description } = response.data;

      if (error) {
        throw new Error(`GitHub OAuth error: ${error_description || error}`);
      }

      if (!access_token) {
        throw new Error('No access token received from GitHub');
      }

      // Get user info
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      console.log('GitHub user fetched:', userResponse.data.login);

      return {
        access_token,
        user: userResponse.data,
      };
    } catch (error) {
      console.error('GitHub token exchange error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        throw new Error('Invalid GitHub client credentials or authorization code');
      }
      throw new Error('Failed to get access token: ' + (error.response?.data?.error_description || error.message));
    }
  }

  /**
   * Fetch user repositories
   */
  static async fetchUserRepositories(accessToken) {
    try {
      const response = await axios.get('https://api.github.com/user/repos', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { per_page: 100 },
      });

      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch repositories: ' + error.message);
    }
  }

  /**
   * Setup webhook for a repository
   */
  static async setupWebhook(repoId, webhookId) {
    try {
      // Implementation depends on your GitHub App setup
      console.log(`Setting up webhook for repo ${repoId}`);
      return { webhookId };
    } catch (error) {
      throw new Error('Failed to setup webhook: ' + error.message);
    }
  }

  /**
   * Get repository commits
   */
  static async getRepositoryCommits(owner, repo, accessToken) {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/commits`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { per_page: 100 },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch commits: ' + error.message);
    }
  }

  /**
   * Get repository branches
   */
  static async getRepositoryBranches(owner, repo, accessToken) {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/branches`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { per_page: 100 },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch branches:', error.message);
      return [];
    }
  }

  /**
   * Get repository pull requests
   */
  static async getRepositoryPullRequests(owner, repo, accessToken) {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/pulls`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { state: 'open', per_page: 100 },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch pull requests:', error.message);
      return [];
    }
  }

  /**
   * Fetch commits and run analysis
   */
  /**
   * Fetch commits and run analysis
   */
  static async fetchAndAnalyzeCommits(repo, accessToken) {
    try {
      console.log(`Fetching commits for ${repo.fullName}...`);

      // Parse owner and repo name from fullName (assuming repo has field fullName)
      // If repo is from Firestore, it might have owner/name separate
      const fullName = repo.fullName || `${repo.owner}/${repo.name}`;
      const [owner, repoName] = fullName.split('/');

      // Fetch commits from GitHub
      let commits = [];
      try {
        commits = await this.getRepositoryCommits(owner, repoName, accessToken);
      } catch (e) {
        console.error(`Failed to fetch commits for ${fullName}:`, e.message);
        // Continue if fails? or throw? throw for now.
        throw e;
      }

      console.log(`Fetched ${commits.length} commits`);

      // Fetch branches and PRs
      let branches = [];
      let pullRequests = [];
      try {
        branches = await this.getRepositoryBranches(owner, repoName, accessToken);
        pullRequests = await this.getRepositoryPullRequests(owner, repoName, accessToken);
      } catch (e) {
        console.warn('Failed to fetch auxiliary data:', e.message);
      }

      console.log(`Fetched ${branches.length} branches and ${pullRequests.length} open PRs`);

      // Get existing commits from Firestore to check for duplicates
      // Note: Firestore doesn't have "find all by repoId, select only SHA". getting all might be expensive.
      // Optimization: Fetch only latest X or rely on `getCommitBySha` loop?
      // Better: `getCommitsByRepo` (limit 100) and check against that. 
      // Or: just try to save. If it overwrites, fine. 
      // BUT we need to know if it's NEW to award coins.
      // Strategy: Check if commit exists before saving.

      // Since we iterate commits from GitHub (latest first), we can stop checking when we hit a known commit?
      // Or check one by one.

      let newCommitsCount = 0;
      let coinsAwarded = 0;
      const coinTransactions = [];

      for (const commit of commits) {
        const commitSha = commit.sha;

        // Check existence
        const existing = await DatabaseService.getCommitBySha(commitSha);

        if (!existing) {
          // It's new
          newCommitsCount++;

          const commitData = {
            repoId: repo.id || repo._id, // Handle potential ID mismatch
            userId: repo.userId,
            commitSha: commit.sha,
            message: commit.commit.message,
            author: commit.commit.author.name,
            authorEmail: commit.commit.author.email,
            commitDate: new Date(commit.commit.author.date).toISOString(), // Firestore prefers ISO strings or Timestamp objects
            url: commit.html_url,
            status: 'OK',
            inactivityGap: 0,
            filesChanged: 0, // Need detailed fetch for this, skipping for now
            additions: 0,
            deletions: 0
          };

          await DatabaseService.saveCommit(commitData);

          // === COIN REWARD LOGIC ===
          const lowerMsg = commit.commit.message.toLowerCase();
          if (!lowerMsg.includes('update readme') && !lowerMsg.includes('initial commit') && !lowerMsg.includes('merge pull request')) {
            const REWARD_AMOUNT = 5;
            coinsAwarded += REWARD_AMOUNT;
            coinTransactions.push({
              userId: repo.userId,
              amount: REWARD_AMOUNT,
              type: 'REWARD',
              source: 'COMMIT',
              referenceId: commit.sha,
              description: `Reward for commit: ${commit.commit.message.substring(0, 50)}...`,
              createdAt: new Date().toISOString()
            });
          }
          // =========================

        } else {
          // Existing commit found. Since GitHub returns latest first, assume subsequent are also existing?
          // Maybe continue to update metadata if needed?
          // Break optimization: if we found an existing commit, likely the rest are old.
          // But caution: force push or history rewrite could mess this assumption.
          // For safety, process all 100 fetched.
        }
      }

      console.log(`Processed ${commits.length} commits (${newCommitsCount} new)`);

      // Process Coins
      if (coinsAwarded > 0) {
        await DatabaseService.addCoins(repo.userId, coinsAwarded);
        for (const tx of coinTransactions) {
          await DatabaseService.addCoinTransaction(tx);
        }
        console.log(`Awarded ${coinsAwarded} coins`);
      }

      // Update Repository Metadata
      await DatabaseService.saveRepository(repo.id, {
        branchCount: branches.length,
        openPRCount: pullRequests.length,
        lastSync: new Date().toISOString()
      });

      // Run Full Analysis
      const analysisResults = consistencyService.runFullAnalysis(commits, pullRequests, branches);

      const analysisData = {
        repoId: repo.id,
        ...analysisResults,
        lastAnalyzed: new Date().toISOString()
      };

      await DatabaseService.saveRepoAnalysis(repo.id, analysisData);

      return { success: true, commitsCount: commits.length, newCommits: newCommitsCount, coinsAwarded };

    } catch (error) {
      console.error('Error in fetchAndAnalyzeCommits:', error);
      throw error;
    }
  }
}

module.exports = GitHubService;
