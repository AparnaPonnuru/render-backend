// routes/uploadRouter.js
const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Upload router is working!' });
});

// Generate presigned URL for S3 upload
router.post('/get-presigned-url', async (req, res) => {
  try {
    console.log('📦 Request received for presigned URL:', req.body);
    
    const { fileName, fileType } = req.body;
    
    if (!fileName || !fileType) {
      return res.status(400).json({ 
        error: 'fileName and fileType are required',
        received: req.body 
      });
    }

    const params = {
      Bucket: 'thenaaviversebucket',
      Key: fileName,
      Expires: 300, // 5 minutes
      ContentType: fileType,
      ACL: 'public-read'
    };

    console.log('🔑 Generating presigned URL with params:', params);
    
    const presignedUrl = await s3.getSignedUrlPromise('putObject', params);
    
    console.log('✅ Presigned URL generated');
    
    res.json({ 
      success: true,
      presignedUrl,
      fileUrl: `https://thenaaviversebucket.s3.amazonaws.com/${fileName}`
    });
    
  } catch (error) {
    console.error('❌ Error generating presigned URL:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate upload URL',
      message: error.message 
    });
  }
});

module.exports = router;