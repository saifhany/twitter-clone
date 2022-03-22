$(document).ready(() => {
    $.get('/api/post/' + postId, (results) => {
        outputPostWithReplies(results, $('.postsContainer'))
    })
})

function outputPostWithReplies(result, container) {
    container.html('')

    if (result.replyTo !== undefined && result.replyTo._id !== undefined) {
        var html = createPost(result.replyTo)
        container.append(html)
    }

    var mainHtml = createPost(result.postData)
    container.append(mainHtml)

    result.replies.forEach((result) => {
        var reply = createPost(result)
        container.append(reply)
    })
}