const cheerio = require('cheerio');
const TurndownService = require('turndown');
const debug = require('debug')('rush:contentAnalyzer');

const cache = require('./cache');

// Create a new instance of Turndown service
const turndownService = new TurndownService();

/**
 * Extracts posts from the given HTML content of a phpBB forum thread.
 * 
 * @param {string} htmlContent - The HTML content of the forum thread.
 * @returns {Array<Object>} An array of objects, each representing a post.
 */
function getPosts(htmlContent) {

    // First, try to get the cached result
    const cachedResult = cache.get(htmlContent);
    if (cachedResult) {
        debug("Cache hit");
        return cachedResult;
    }

    const $ = cheerio.load(htmlContent);
    const posts = [];

    $('.post').each(function (i) {
        debug("Analyzing reply number ", i + 1);
        // Extract necessary elements. 
        const postAuthor = $(this).find('.author'); 
        // Inside of postAuthor, there is <time datetime="XXX"></time> and we need datetime
        const postDate = postAuthor.find('time').attr('datetime');
        const authorName = postAuthor.find('.username').text();

        const postHTML = $(this).find('.content').html(); 
        const postMd = turndownService.turndown(postHTML);
        debug("Post content MarkDown length: ", postMd.length);

        posts.push({
            post: postMd,
            postDate,
            authorName,
        });
    });

    cache.set(htmlContent, posts);
    return posts;
}

/**
 * Extracts posts from the given HTML content of a phpBB forum thread and removes base64 images.
 * 
 * @param {string} htmlContent - The HTML content of the forum thread.
 * @returns {Array<Object>} An array of objects, each representing a post.
 */
function getPostsWithoutPictures(htmlContent) {
    const posts = getPosts(htmlContent);

    posts.forEach(post => {
        post.post = post.post.replace(/(!\[.*?\]\(data:image\/.*?;base64,).*?\)/g, '$1BASE64-IMAGE-REMOVED)');
    });

    return posts;
}

module.exports = {
    getPosts,
    getPostsWithoutPictures,
};
