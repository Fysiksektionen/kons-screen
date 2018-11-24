// Module containing functions which compile the Instagram data fetched.

var compileInstagram = posts => {
    return {
        instagram: posts.map(post => {
            const url = post.remotely_hosted ? post.url : "http://localhost:8888" + post.url
            return {
                src: url,
                text: post.caption,
                is_video: post.is_video,
                taken_at: post.created
            }
        })
    }
}

module.exports = {compileInstagram}