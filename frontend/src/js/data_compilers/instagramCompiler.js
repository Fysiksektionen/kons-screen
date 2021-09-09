// Module containing functions which compile the Instagram data fetched.

var compileInstagram = posts => {
    return posts.map(post => {
        const url = post.remotely_hosted ? post.url : "https://f.kth.se" + post.url
        return {
            src: url,
            text: post.caption,
            is_video: post.is_video,
            fullscreen: post.fullscreen,
            taken_at: post.created
        }
    })
}

module.exports = {compileInstagram}