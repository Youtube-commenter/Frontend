
const express = require('express');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { YouTubeAccountModel } = require('../models/youtube-account.model');
const { ProxyModel } = require('../models/proxy.model');
const { refreshTokenIfNeeded } = require('../services/youtube.service');

const router = express.Router();

/**
 * @route GET /api/accounts
 * @desc Get all YouTube accounts for the authenticated user
 * @access Private
 */
router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const accounts = await YouTubeAccountModel.find({ user: req.user.id })
      .populate('proxy', 'host port protocol status');
    
    res.json({ accounts });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/accounts/:id
 * @desc Get a specific YouTube account
 * @access Private
 */
router.get('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const account = await YouTubeAccountModel.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('proxy');
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json({ account });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/accounts/:id
 * @desc Update a YouTube account
 * @access Private
 */
router.put('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const { status, proxy } = req.body;
    
    const account = await YouTubeAccountModel.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    // Update status if provided
    if (status) {
      account.status = status;
    }
    
    // Update proxy if provided
    if (proxy) {
      const proxyObj = await ProxyModel.findOne({
        _id: proxy,
        user: req.user.id
      });
      
      if (!proxyObj) {
        return res.status(404).json({ message: 'Proxy not found' });
      }
      
      account.proxy = proxyObj._id;
    }
    
    await account.save();
    
    res.json({ 
      message: 'Account updated successfully',
      account 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/accounts/:id
 * @desc Delete a YouTube account
 * @access Private
 */
router.delete('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const result = await YouTubeAccountModel.deleteOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/accounts/:id/refresh-token
 * @desc Force refresh OAuth token for an account
 * @access Private
 */
router.post('/:id/refresh-token', authenticateJWT, async (req, res, next) => {
  try {
    const account = await YouTubeAccountModel.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    const refreshed = await refreshTokenIfNeeded(account, true);
    
    if (!refreshed.success) {
      return res.status(400).json({ 
        message: 'Failed to refresh token', 
        error: refreshed.error 
      });
    }
    
    res.json({ 
      message: 'Token refreshed successfully',
      expiresAt: account.google.tokenExpiry
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/accounts/:id/verify
 * @desc Verify account is working by making a test API call
 * @access Private
 */
router.post('/:id/verify', authenticateJWT, async (req, res, next) => {
  try {
    const account = await YouTubeAccountModel.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('proxy');
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    // Refresh token if needed
    const refreshed = await refreshTokenIfNeeded(account);
    if (!refreshed.success) {
      return res.status(400).json({ 
        message: 'Failed to refresh token', 
        error: refreshed.error 
      });
    }
    
    // Make a test API call
    const { google } = require('googleapis');
    const youtube = google.youtube('v3');
    
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: account.google.accessToken,
      refresh_token: account.google.refreshToken
    });
    
    // Get channel info
    const response = await youtube.channels.list({
      auth: oauth2Client,
      part: 'snippet,contentDetails,statistics',
      mine: true
    });
    
    if (!response.data.items || response.data.items.length === 0) {
      return res.status(400).json({ message: 'No channel found for this account' });
    }
    
    // Update account with channel details
    const channel = response.data.items[0];
    account.channelId = channel.id;
    account.channelTitle = channel.snippet.title;
    account.thumbnailUrl = channel.snippet.thumbnails.default.url;
    account.status = 'active';
    await account.save();
    
    res.json({ 
      message: 'Account verified successfully',
      channel: {
        id: channel.id,
        title: channel.snippet.title,
        subscribers: channel.statistics.subscriberCount,
        views: channel.statistics.viewCount,
        videos: channel.statistics.videoCount
      }
    });
  } catch (error) {
    console.error('Error verifying account:', error);
    
    // Update account status if authentication error
    if (error.code === 401 || error.code === 403) {
      try {
        const account = await YouTubeAccountModel.findById(req.params.id);
        if (account) {
          account.status = 'inactive';
          await account.save();
        }
      } catch (updateError) {
        console.error('Error updating account status:', updateError);
      }
    }
    
    next(error);
  }
});

module.exports = router;
