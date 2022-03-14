$(document).ready(() => {
    $.get('/api/notification', (data) => {
        outputNotification(data, $('.resultsContainer'))
    })
})

$(document).on('click', '.notification.active', (e) => {
    const container = $(e.target)
    const notificationId = container.data().id

    e.preventDefault()
    const href = container.attr('href')
    const callback = () => (window.location = href)

    markAsOpened(notificationId, callback)
})

$('#markAsRead').click(() => markAsOpened())

const outputNotification = (notifications, container) => {
    notifications.forEach((notification) => {
        const html = outputNotificationHtml(notification)
        container.append(html)
    })

    if (notifications.length == 0) {
        container.append("<span class='noResults'>No results found</span>")
    }
}

const outputNotificationHtml = (notification) => {
    const { userFrom, opened, _id } = notification
    const text = getNotificationText(notification)
    const url = getNotificationUrl(notification)
    const className = opened ? '' : 'active'

    return `<a href='${url}' class='resultListItem notification ${className}' data-id='${_id}'>
                <div class='resultImageContainer'>
                    <img src='${userFrom.profilePic}'>
                </div>
                <div class='resultsDetailContainer'>
                    <span>${text}</span>
                </div>
            </a>`
}

const getNotificationUrl = (notification) => {
    const { type, entityId } = notification
    let url = ''

    if (type == 'retweet' || type == 'like' || type == 'reply') {
        url = `/post/${entityId}`
    } else if (type == 'follow') {
        url = `/profile/${entityId}`
    }

    return url
}

const getNotificationText = (notification) => {
    const { userFrom, type } = notification
    const userName = `${userFrom.firstName} ${userFrom.lastName}`
    let text = ''

    if (type == 'retweet') {
        text = `${userName} retweeted one of your post`
    } else if (type == 'like') {
        text = `${userName} liked one of your post`
    } else if (type == 'reply') {
        text = `${userName} replied one of your post`
    } else if (type == 'follow') {
        text = `${userName} followed you`
    }

    return `<span>${text}</span>`
}

const markAsOpened = (notificationId = null, callback = null) => {
    if (callback == null) callback = () => location.reload()

    const url = notificationId ?
        `/api/notification/${notificationId}/markAsOpen` :
        `/api/notification/markAsOpen`

    $.ajax({
        url,
        type: 'PUT',
        success: callback,
    })
}