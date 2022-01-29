$(document).ready(() => {
    if (selectedTab == 'followers') {
        loadFollowers()
    } else {
        loadFollowing()
    }
})

function loadFollowing() {
    $.get(`/api/user/${profileUserId}/following`, (results) => {
        outputUsers(results, $('.resultsContainer'))
    })
}

function loadFollowers() {
    $.get(`/api/user/${profileUserId}/followers`, (results) => {
        outputUsers(results, $('.resultsContainer'))
    })
}

function outputUsers(results, container) {
    container.html('')

    results.forEach((result) => {
        var html = createUserHtml(result)
        container.append(html)
    })

    if (results.length == 0) {
        container.append("<span class='noResults'>No results found</span>")
    }
}

function createUserHtml(data) {
    var name = data.firstName + ' ' + data.lastName
    var isFollowing = user.following && user.following.includes(data._id)
    var text = isFollowing ? 'Following' : 'Follow'
    var buttonClass = isFollowing ? 'followButton following' : 'followButton'

    var button = ''
    if (user._id != data._id) {
        button = `<div class='followButtonContainer'>
                    <button class='${buttonClass}' data-user='${data._id}'>${text}</button>
                  </div>`
    }

    return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${data.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${data.username}'>${name}</a>
                        <span class='username'>@${data.username}</span>
                    </div>
                </div>
                ${button}
            </div>`
}