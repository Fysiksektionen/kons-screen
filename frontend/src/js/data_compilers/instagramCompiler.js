// Module containing functions which compile the Instagram data fetched.

var compileInstagram = posts => {
    return {
        slides: posts.map(post => {
            const url = post.remotely_hosted ? post.url : "http://localhost:8888" + post.url
            return {
                src: url,
                text: post.caption,
                is_video: post.is_video,
                fullscreen: post.fullscreen,
                taken_at: post.created
            }
        })
    }
}

module.exports = {compileInstagram}