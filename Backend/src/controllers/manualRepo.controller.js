// Controller for manual repository creation
const FirestoreService = require('../services/firestore.service');
const response = require('../utils/response.util');

const addManualRepository = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return response.error(res, 'User ID not found in request', 401);
    }

    const { name, owner, url, language, description } = req.body;
    if (!name || !owner || !url) {
      return response.error(res, 'Repository name, owner, and URL are required', 400);
    }

    // Generate a unique ID for the repository
    const repoId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const repoData = {
      id: repoId,
      userId,
      name,
      owner,
      url,
      language: language || '',
      description: description || '',
      isActive: false,
      isConnected: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedRepo = await FirestoreService.saveRepository(repoId, repoData);

    return response.success(res, { id: savedRepo.id }, 'Repository added successfully');
  } catch (error) {
    console.error('addManualRepository error:', error);
    return response.error(res, error.message || 'Failed to add repository', 500);
  }
};

module.exports = { addManualRepository };
