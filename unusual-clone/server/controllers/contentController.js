const mcache = require('memory-cache');
const Source = require('../models/Source');
const mongoose = require('mongoose');

// Utility function to check if source matches referrer and url
const doesSourceMatch = (source, referrer, url) => {
  // If source is not active, it doesn't match
  if (!source.active) {
    return false;
  }

  // Check rule type and match accordingly
  if (source.rule_type === 'referrer_contains') {
    return referrer && referrer.includes(source.rule_value);
  } else if (source.rule_type === 'url_param_equals') {
    try {
      // Parse URL to extract parameters
      const urlObj = new URL(url);
      const paramValue = urlObj.searchParams.get(source.param_name);
      return paramValue === source.param_value;
    } catch (error) {
      console.error('URL parsing error:', error);
      return false;
    }
  }

  // Default: no match
  return false;
};

// Get content for a specific user based on referrer and URL
const getContent = async (req, res) => {
  try {
    const { user_id, referrer, url } = req.body;

    // Validate user_id
    if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Check cache
    const cacheKey = `content_${user_id}_${referrer}_${url}`;
    const cachedData = mcache.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    // Find sources for this user, sorted by priority
    const sources = await Source.find({ user_id }).sort({ priority: 1 });

    // No sources found
    if (!sources || sources.length === 0) {
      const data = { replacements: [] };
      // Cache the empty result for 5 minutes
      mcache.put(cacheKey, data, 5 * 60 * 1000);
      return res.json(data);
    }

    // Find the first matching source
    for (const source of sources) {
      if (doesSourceMatch(source, referrer, url)) {
        const data = { replacements: source.replacements };
        // Cache the result for 5 minutes
        mcache.put(cacheKey, data, 5 * 60 * 1000);
        return res.json(data);
      }
    }

    // No matching source found
    const data = { replacements: [] };
    // Cache the empty result for 5 minutes
    mcache.put(cacheKey, data, 5 * 60 * 1000);
    res.json(data);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getContent
}; 