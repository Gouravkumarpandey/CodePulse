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
   * Fetch commits and run analysis
   */
  static async fetchAndAnalyzeCommits(repo, accessToken) {
    try {
      console.log(`Fetching commits for ${repo.fullName}...`);
      
      // Parse owner and repo name from fullName
      const [owner, repoName] = repo.fullName.split('/');
      
      // Fetch commits from GitHub
      const commits = await this.getRepositoryCommits(owner, repoName, accessToken);
      
      console.log(`Fetched ${commits.length} commits`);
      
      // Store commits in database
      const commitDocs = commits.map(commit => ({
        repoId: repo._id,
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        authorEmail: commit.commit.author.email,
        commitDate: new Date(commit.commit.author.date),
        url: commit.html_url,
      }));
      
      // Delete existing commits for this repo to avoid duplicates
      await Commit.deleteMany({ repoId: repo._id });
      
      // Insert new commits
      if (commitDocs.length > 0) {
        await Commit.insertMany(commitDocs);
      }
      
      console.log(`Stored ${commitDocs.length} commits in database`);
      
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
      
      return { success: true, commitsCount: commitDocs.length };
    } catch (error) {
      console.error('Error in fetchAndAnalyzeCommits:', error);
      throw error;
    }
  }
}

module.exports = GitHubService;
