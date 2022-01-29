$(document).ready(() => {
    $.get('/api/post', { followingOnly: true }, (results) => {
        outputPost(results, $('.postsContainer'))
    })
})