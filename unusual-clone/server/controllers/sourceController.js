const sanitizeHtml = require('sanitize-html');
const Source = require('../models/Source');

// Get all sources for current user
const getSources = async (req, res) => {
  try {
    const sources = await Source.find({ user_id: req.user.id }).sort({ priority: 1 });
    res.json(sources);
  } catch (error) {
    console.error('Get sources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single source
const getSourceById = async (req, res) => {
  try {
    const source = await Source.findOne({ 
      _id: req.params.id,
      user_id: req.user.id 
    });
    
    if (!source) {
      return res.status(404).json({ message: 'Source not found' });
    }
    
    res.json(source);
  } catch (error) {
    console.error('Get source error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new source
const createSource = async (req, res) => {
  try {
    const {
      name,
      rule_type,
      rule_value,
      param_name,
      param_value,
      replacements,
      priority,
      active
    } = req.body;

    // Sanitize HTML content in replacements
    const sanitizedReplacements = replacements.map(item => ({
      selector: item.selector,
      content: sanitizeHtml(item.content, {
        allowedTags: ['p', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'span', 'div', 'img', 'br'],
        allowedAttributes: {
          a: ['href', 'target', 'rel'],
          img: ['src', 'alt'],
          span: ['class'],
          div: ['class']
        }
      })
    }));

    // Create new source
    const source = new Source({
      user_id: req.user.id,
      name,
      rule_type,
      rule_value,
      param_name: param_name || '',
      param_value: param_value || '',
      replacements: sanitizedReplacements,
      priority: priority || 1,
      active: active !== undefined ? active : true
    });

    await source.save();
    res.status(201).json(source);
  } catch (error) {
    console.error('Create source error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a source
const updateSource = async (req, res) => {
  try {
    const {
      name,
      rule_type,
      rule_value,
      param_name,
      param_value,
      replacements,
      priority,
      active
    } = req.body;

    // Find source
    let source = await Source.findOne({ 
      _id: req.params.id,
      user_id: req.user.id 
    });
    
    if (!source) {
      return res.status(404).json({ message: 'Source not found' });
    }

    // Sanitize HTML content in replacements
    const sanitizedReplacements = replacements.map(item => ({
      selector: item.selector,
      content: sanitizeHtml(item.content, {
        allowedTags: ['p', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'span', 'div', 'img', 'br'],
        allowedAttributes: {
          a: ['href', 'target', 'rel'],
          img: ['src', 'alt'],
          span: ['class'],
          div: ['class']
        }
      })
    }));

    // Update fields
    source.name = name;
    source.rule_type = rule_type;
    source.rule_value = rule_value;
    source.param_name = param_name || '';
    source.param_value = param_value || '';
    source.replacements = sanitizedReplacements;
    source.priority = priority || 1;
    source.active = active !== undefined ? active : true;
    source.updatedAt = Date.now();

    await source.save();
    res.json(source);
  } catch (error) {
    console.error('Update source error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a source
const deleteSource = async (req, res) => {
  try {
    const source = await Source.findOneAndDelete({ 
      _id: req.params.id,
      user_id: req.user.id 
    });
    
    if (!source) {
      return res.status(404).json({ message: 'Source not found' });
    }
    
    res.json({ message: 'Source removed' });
  } catch (error) {
    console.error('Delete source error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSources,
  getSourceById,
  createSource,
  updateSource,
  deleteSource
}; 