// Module containing functions which compile the Instagram data fetched.


var compileInstagram = posts => {
    return {
        instagram: posts.map(post => {
            return {
                src: post.display_url,
                text: post.caption,
                is_video: post.is_video,
                taken_at: post.taken_at_timestamp
            }
        })
    }
}

module.exports = {compileInstagram}