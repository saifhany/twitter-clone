$(document).ready(() => {
    if (selectedTab == 'replies') {
        loadReplies()
    } else {
        loadPosts()
    }
})

function loadPosts() {
    $.get('/api/post', { postedBy: profileUserId, pinned: true }, (results) => {
        outputPinnedPost(results, $('.pinnedPostContainer'))
    })

    $.get(
        '/api/post', { postedBy: profileUserId, isReply: false, pinned: false },
        (results) => {
            outputPost(results, $('.postsContainer'))
        }
    )
}

function loadReplies() {
    $.get('/api/post', { postedBy: profileUserId, isReply: true }, (results) => {
        outputPost(results, $('.postsContainer'))
    })
}