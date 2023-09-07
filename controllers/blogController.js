var BlogPost = require('../models/blogPost');
var moment = require('moment');
var async = require('async');
var cloudinary = require('cloudinary').v2;
var path = require('path');
var Datauri = require('datauri');
var dUri = new Datauri();
var _ = require('lodash');
const { log } = require('console');
var todaysDate = moment().format('YYYY-MM-DD');

// get all blog posts
exports.list_blog_posts = function(req, res) {
    BlogPost.find(function(err, blogPosts) {
        if (err) {
            console.log(err);
            res.render('error', { message: 'An error occured displaying blog posts.' });
        } else {
            res.render('blog', {
                blogPosts, 
                isLoggedIn: req.session.isLoggedIn,
                isAdmin: req.session.isAdmin,
                username: req.session.username
            });
        }
    });
};

// show create blog post page
exports.get_create_blog_post = function(req, res) {
    if (!req.session.isLoggedIn) {
        res.render('error', { message: 'You must be logged in as admin to do that. '})
    }
    res.render('create-post', { 
        username: req.session.username, 
        isAdmin: req.session.isAdmin, 
        isLoggedIn: req.session.isLoggedIn
    });
};

// create blog post
exports.post_create_blog_post = async function(req, res) {
    var blogPost = req.body;
    // if image file is included, upload to cloudinary and include info in blog post object
    if (req.file) {
        console.log('req.file included')
        dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);
        await cloudinary.uploader.upload(dUri.content, { width: 400, height: 400, crop: 'limit' }, function (error, result) {
          if (error) {
            console.log(error);
            callback(error, null, null);
            res.render('error', {message: 'An error occured uploading your image.'});
          } else {
            console.log('uploaded to cloudinary:', result)
            blogPost.image = result.secure_url;
            blogPost.image_public_id = result.public_id;
          }
        });
    }

    BlogPost.create(blogPost, function(err, newBlogPost) {
        console.log('adding post to db');
        if(err) {
            console.log(err);
        } else {
            res.redirect('/blog');
        }
    })
};

// get blog post details
exports.get_blog_post_details = function(req, res) {
    BlogPost.findById(req.params.id, function(err, blogPost) {
        if(err) {
            console.log(err);
            res.render('error', { message: 'Error retrieving blog post details.'})
        } else {
            res.render('blog-post', { 
                blogPost,
                isLoggedIn: req.session.isLoggedIn,
                isAdmin: req.session.isAdmin,
                username: req.session.username
             });
        }
    });
};

// get edit blog post page
exports.get_edit_blog_post = function(req, res) {
    BlogPost.findById(req.params.id, function(err, blogPost) {
        if(err) {
            console.log(err);
            res.render('error', { message: 'Error retrieving blog post details.'})
        } else {
            res.render('edit-post', { 
                blogPost,
                isLoggedIn: req.session.isLoggedIn,
                isAdmin: req.session.isAdmin,
                username: req.session.username
             });
        }
    });
}

// edit blog post
exports.post_edit_blog_post = function(req, res) {
    BlogPost.findByIdAndUpdate(req.body.id, {
        title: req.body.title,
        content: req.body.content,
        date_updated: req.body.date_updated
    }, function(err, updatedBlogPost) {
        if (err) {
            console.log(err);
            res.render('error', { message: 'Error updating blog post.'});
        }
        console.log('updated post:', updatedBlogPost);
        res.redirect('blog');
    })
}

// delete blog post
exports.delete_blog_post = function(req, res) {
    BlogPost.findByIdAndDelete(req.body.id, function(err) {
      if (err) {
        res.render('error', {message: 'An error occured deleting that blog post.'});
      } else {
        if (req.session.isLoggedIn == true) {
          res.redirect('/blog');
        } else {
          res.redirect('/session-expired');
        }
      }
    })
  };
