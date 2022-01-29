$('#postTextarea, #replyTextarea').keyup((event) => {
    var textarea = $(event.target)
    var value = textarea.val().trim()

    var isModal = textarea.parents('.modal').length == 1

    var button = isModal ? $('#submitReply') : $('#submitFormButton')

    if (value == '') {
        button.prop('disabled', true)
        return
    }

    button.prop('disabled', false)
})

$('#submitFormButton, #submitReply').click((event) => {
    var button = $(event.target)
    var isModal = button.parents('.modal').length == 1
    var textarea = isModal ? $('#replyTextarea') : $('#postTextarea')

    var data = {
        content: textarea.val(),
    }

    if (isModal) {
        var id = button.data().id
        data.replyTo = id
    }

    $.post('/api/post', data, (postData) => {
        if (postData.replyTo) {
            location.reload()
        } else {
            var html = createPost(postData)
            $('.postsContainer').prepend(html)
            button.prop('disabled', true)
            textarea.val('')
        }
    })
})

$('#deletePostModal').on('click', (event) => {
    var postId = $(event.target).data('id')

    $.ajax({
        url: `/api/post/${postId}`,
        type: 'delete',
        success: (postata) => location.reload(),
    })
})

$('#deletePostModal').on('show.bs.modal', (event) => {
    var button = $(event.relatedTarget)
    var postId = getPostId(button)
    $('#deletePostButton').data('id', postId)
})

$('#replyModal').on('show.bs.modal', (event) => {
    var button = $(event.relatedTarget)
    var postId = getPostId(button)
    $('#submitReply').data('id', postId)

    $.get(`/api/post/${postId}`, (result) => {
        outputPost(result.postData, $('#originalPostContainer'))
    })
})

$('#replyModal').on('hidden.bs.modal', () =>
    $('#originalPostContainer').html('')
)

$(document).on('click', '.post', (event) => {
    var element = $(event.target)
    var postId = getPostId(element)

    if (postId && !element.is('button')) {
        window.location.href = `/post/${postId}`
    }
})

$(document).on('click', '.likeButton', (event) => {
    var button = $(event.target)
    var postId = getPostId(button)

    if (postId === undefined) return

    $.ajax({
        url: `/api/post/${postId}/like`,
        type: 'put',
        success: (postData) => {
            button.find('span').text(postData.likes.length || '')

            postData.likes.includes(user._id) ?
                button.addClass('active') :
                button.removeClass('active')
        },
    })
})

$(document).on('click', '.retweetButton', (event) => {
    var button = $(event.target)
    var postId = getPostId(button)

    if (postId === undefined) return

    $.ajax({
        url: `/api/post/${postId}/retweet`,
        type: 'post',
        success: (postData) => {
            button.find('span').text(postData.retweetUsers.length || '')
            postData.retweetUsers.includes(user._id) ?
                button.addClass('active') :
                button.removeClass('active')
        },
    })
})

$(document).on('click', '.followButton', (event) => {
    var btn = $(event.target)
    var userId = btn.data().user

    $.ajax({
        url: `/api/user/${userId}/follow`,
        type: 'put',
        success: (data, status, xhr) => {
            if (xhr.status === 404) {
                alert('User not found')
                return
            }

            var difference = 1
            if (data.following && data.following.includes(userId)) {
                btn.addClass('following')
                btn.text('Following')
            } else {
                btn.removeClass('following')
                btn.text('Follow')
                difference = -1
            }

            var followers = $('#followersValue')
            if (followers != 0) {
                var followerText = followers.text()
                followerText = parseInt(followerText)
                followers.text(followerText + difference)
            }
        },
    })
})

function outputPost(results, container) {
    container.html('')
    if (!Array.isArray(results)) {
        results = [results]
    }

    results.forEach((result) => {
        var html = createPost(result)
        container.append(html)
    })
}

function outputPostWithReplies(result, container) {
    container.html('')
    console.log(result)

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

function getPostId(element) {
    var root = element.hasClass('.post')
    var rootElement = root ? element : element.closest('.post')
    var postId = rootElement.data().id

    if (postId === undefined) return alert('Post ID undefined')

    return postId
}

function createPost(postData) {
    var isRetweet = postData.retweetData !== undefined
    var retweetedBy = isRetweet ? postData.postedBy.username : null
    postData = isRetweet ? postData.retweetData : postData

    var postedBy = postData.postedBy
    var displayName = postedBy.firstName + ' ' + postedBy.lastName
    var timestamp = timeDifference(new Date(), new Date(postData.createdAt))

    var likeButtonClass = postData.likes.includes(user._id) ? 'active' : ''
    var retweetButtonClass = postData.retweetUsers.includes(user._id) ?
        'active' :
        ''

    var retweetText = ''
    if (isRetweet) {
        retweetText = `<span>
                        <i class='fas fa-retweet'></i>
                        Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>    
                    </span>`
    }

    var replyFlag = ''
    if (postData.replyTo && postData.replyTo._id) {
        var replyToUsername = postData.replyTo.postedBy.username
        replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}<a>
                       </div>`
    }

    var buttonDelete = ''
    if (postData.postedBy._id == user._id) {
        buttonDelete = `<button data-id='${postData._id}' data-toggle='modal' data-target='#deletePostModal'>
                            <i class='fas fa-times'></i>
                        </button>`
    }

    return `<div class="post" data-id='${postData._id}'>
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class="mainContentContainer">
                    <div class="userImageContainer">
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class="postContentContainer">
                        <div class="header">
                            <a href='/profile/${
                              postedBy.username
                            }' class="displayName">${displayName}</a>
                            <span class="username">@${postedBy.username}</span>
                            <span class="date">${timestamp}</span>
                            ${buttonDelete}
                        </div>
                        ${replyFlag}
                        <div class="postBody">
                            <span>${postData.content}</span>
                        </div>
                        <div class="postFooter">
                            <div class='postButtonContainer'>
                                <button data-toggle='modal' data-target='#replyModal'>
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweetButton ${retweetButtonClass}'>
                                    <i class='fas fa-retweet'></i>
                                    <span>${
                                      postData.retweetUsers.length || ''
                                    }</span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonClass}'>
                                    <i class='far fa-heart'></i>
                                    <span>${postData.likes.length || ''}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
}

function timeDifference(current, previous) {
    var msPerMinute = 60 * 1000
    var msPerHour = msPerMinute * 60
    var msPerDay = msPerHour * 24
    var msPerMonth = msPerDay * 30
    var msPerYear = msPerDay * 365

    var elapsed = current - previous

    if (elapsed < msPerMinute) {
        if (elapsed / 1000 < 30) return 'Just now'
        return Math.round(elapsed / 1000) + ' seconds ago'
    } else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago'
    } else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago'
    } else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' days ago'
    } else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago'
    } else {
        return Math.round(elapsed / msPerYear) + ' years ago'
    }
}