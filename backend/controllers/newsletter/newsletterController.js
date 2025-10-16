const Newsletter = require('../../models/newsletter/newsletter');

// Subscribe to newsletter
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email already exists
    let subscriber = await Newsletter.findOne({ email });

    if (subscriber) {
      // If already subscribed, return success
      if (subscriber.isSubscribed) {
        return res.status(200).json({
          success: true,
          message: 'Email is already subscribed to our newsletter'
        });
      }

      // If previously unsubscribed, update to subscribed
      subscriber.isSubscribed = true;
      subscriber.subscribedAt = Date.now();
      subscriber.unsubscribedAt = null;
      await subscriber.save();

      return res.status(200).json({
        success: true,
        message: 'Successfully re-subscribed to our newsletter'
      });
    }

    // Create new subscriber
    const newSubscriber = new Newsletter({
      email,
      isSubscribed: true,
      subscribedAt: Date.now()
    });

    await newSubscriber.save();

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to our newsletter'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to newsletter',
      error: error.message
    });
  }
};

// Unsubscribe from newsletter
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find subscriber by email
    const subscriber = await Newsletter.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our newsletter list'
      });
    }

    // If already unsubscribed
    if (!subscriber.isSubscribed) {
      return res.status(200).json({
        success: true,
        message: 'Email is already unsubscribed from our newsletter'
      });
    }

    // Update subscription status
    subscriber.isSubscribed = false;
    subscriber.unsubscribedAt = Date.now();
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from our newsletter'
    });
  } catch (error) {
    console.error('Newsletter unsubscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from newsletter',
      error: error.message
    });
  }
};

// Admin: Get all subscribers
exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers',
      error: error.message
    });
  }
};

// Admin: Get active subscribers
exports.getActiveSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ isSubscribed: true })
      .sort({ subscribedAt: -1 });

    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers
    });
  } catch (error) {
    console.error('Get active subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active subscribers',
      error: error.message
    });
  }
};

// Admin: Delete subscriber
exports.deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    const subscriber = await Newsletter.findByIdAndDelete(id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscriber deleted successfully'
    });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subscriber',
      error: error.message
    });
  }
};