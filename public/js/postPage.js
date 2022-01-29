$(document).ready(() => {
    $.get('/api/post/' + postId, (results) => {
        outputPostWithReplies(results, $('.postsContainer'))
    })
})