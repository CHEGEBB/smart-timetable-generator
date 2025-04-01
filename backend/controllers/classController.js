const Class = require('../models/Class');

// Get all classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    
    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single class
exports.getClass = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id);

    if (!classObj) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    res.status(200).json({
      success: true,
      data: classObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create new class
exports.createClass = async (req, res) => {
  try {
    const classObj = await Class.create(req.body);

    res.status(201).json({
      success: true,
      data: classObj
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// Update class
exports.updateClass = async (req, res) => {
  try {
    let classObj = await Class.findById(req.params.id);

    if (!classObj) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    classObj = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: classObj
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// Delete class
exports.deleteClass = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id);

    if (!classObj) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    await classObj.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};