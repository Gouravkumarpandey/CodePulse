/**
 * GitHub Service
 * Helper functions for GitHub API interactions
 */

const axios = require('axios');
const GITHUB_CONFIG = require('../config/github');
const Commit = require('../models/Commit');
const RepoAnalysis = require('../models/RepoAnalysis');
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

      const User = require('../models/User');
      const CoinTransaction = require('../models/CoinTransaction');

      // Parse owner and repo name from fullName
      const [owner, repoName] = repo.fullName.split('/');

      // Fetch commits from GitHub
      const commits = await this.getRepositoryCommits(owner, repoName, accessToken);

      console.log(`Fetched ${commits.length} commits`);

      // Fetch branches and PRs
      const branches = await this.getRepositoryBranches(owner, repoName, accessToken);
      const pullRequests = await this.getRepositoryPullRequests(owner, repoName, accessToken);

      console.log(`Fetched ${branches.length} branches and ${pullRequests.length} open PRs`);

      // Fetch existing commits to identify new ones
      const existingCommits = await Commit.find({ repoId: repo._id }).select('commitSha');
      const existingShas = new Set(existingCommits.map(c => c.commitSha));

      const newCommits = [];
      const commitOps = [];

      for (const commit of commits) {
        const isNew = !existingShas.has(commit.sha);

        const commitDoc = {
          repoId: repo._id,
          userId: repo.userId,
          commitSha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author.name,
          authorEmail: commit.commit.author.email,
          commitDate: new Date(commit.commit.author.date),
          url: commit.html_url,
          status: 'OK',
          inactivityGap: 0,
        };

        // Prepare bulk operation
        commitOps.push({
          updateOne: {
            filter: { commitSha: commit.sha, repoId: repo._id },
            update: { $set: commitDoc },
            upsert: true,
          }
        });

        if (isNew) {
          newCommits.push(commitDoc);
        }
      }

      // Execute bulk write for commits
      if (commitOps.length > 0) {
        await Commit.bulkWrite(commitOps);
      }

      console.log(`Processed ${commits.length} commits (${newCommits.length} new)`);

      // === COIN REWARD SYSTEM ===
      let coinsAwarded = 0;
      const coinTransactions = [];

      for (const commit of newCommits) {
        // Spam Check: Ignore "Update README" or "Initial commit"
        const lowerMsg = commit.message.toLowerCase();
        if (lowerMsg.includes('update readme') || lowerMsg.includes('initial commit') || lowerMsg.includes('merge pull request')) {
          continue;
        }

        const REWARD_AMOUNT = 5;
        coinsAwarded += REWARD_AMOUNT;

        coinTransactions.push({
          userId: repo.userId,
          amount: REWARD_AMOUNT,
          type: 'REWARD',
          source: 'COMMIT',
          referenceId: commit.commitSha,
          description: `Reward for commit: ${commit.message.substring(0, 50)}...`,
          createdAt: new Date(),
        });
      }

      if (coinsAwarded > 0) {
        // Update User Balance
        await User.findByIdAndUpdate(repo.userId, { $inc: { coins: coinsAwarded } });

        // Save Transactions
        if (coinTransactions.length > 0) {
          await CoinTransaction.insertMany(coinTransactions);
        }
        console.log(`Awarded ${coinsAwarded} coins for ${coinTransactions.length} valid commits`);
      }
      // ==========================

      // Update repository with branch and PR counts (using Mongoose now, not Firestore)
      // Note: Assuming Repo model is used elsewhere or accessible. 
      // If "repo" passed here is a plain object, we might need to update using Mongoose model.
      // FirestoreService usage removed as per migration plan.

      const Repo = require('../models/Repo'); // Lazy load
      await Repo.findByIdAndUpdate(repo._id, {
        branchCount: branches.length,
        openPRCount: pullRequests.length,
        lastSync: new Date(),
      });

      // Run consistency analysis
      const analysis = await consistencyService.analyzeRepository(repo._id);

      // Run rule engine
      const ruleResults = await ruleEngineService.evaluateRules(repo._id);

      // Generate AI insights
      let aiInsights = '';
      try {
        aiInsights = await aiService.generateInsights({
          totalCommits: analysis.totalCommits,
          averageGap: analysis.averageGap,
          longestGap: analysis.longestGap,
          consistencyScore: analysis.consistencyScore,
          timeline: analysis.timeline,
        });
      } catch (error) {
        console.error('AI insights generation failed:', error.message);
        aiInsights = 'AI insights unavailable at this time.';
      }

      // Store analysis results
      await RepoAnalysis.findOneAndUpdate(
        { repoId: repo._id },
        {
          repoId: repo._id,
          totalCommits: analysis.totalCommits,
          consistencyScore: analysis.consistencyScore,
          consistencyGrade: analysis.consistencyGrade,
          longestGap: analysis.longestGap,
          averageGap: analysis.averageGap,
          warnings: ruleResults.warnings || [],
          violations: ruleResults.violations || [],
          aiInsights: aiInsights,
          timeline: analysis.timeline,
          lastAnalyzed: new Date(),
        },
        { upsert: true, new: true }
      );

      console.log(`Analysis completed for ${repo.fullName}`);

      return { success: true, commitsCount: commits.length, newCommits: newCommits.length, coinsAwarded };
    } catch (error) {
      console.error('Error in fetchAndAnalyzeCommits:', error);
      throw error;
    }
  }
}

module.exports = GitHubService;
