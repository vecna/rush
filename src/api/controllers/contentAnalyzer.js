
// contentAnalyzer.js

const cheerio = require('cheerio');
const cache = require('../../utils/cache');

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
        return cachedResult;
    }

    const $ = cheerio.load(htmlContent);
    const posts = [];

    // Assuming each post/reply in the phpBB forum is contained in elements with a class `.post`
    // This selector might need to be adjusted based on the actual HTML structure of the forum.
    $('.post').each(function () {
        // Extract necessary elements. Here, we just simulate extracting the text of each post.
        // You may need to adjust selectors based on the actual HTML structure and required data.
        const postText = $(this).find('.content').text(); // Adjust '.content' to the correct selector for post text

        posts.push({
            text: postText.trim()
        });
    });

    cache.set(htmlContent, posts);
    return posts;
}

module.exports = {
    getPosts
};
