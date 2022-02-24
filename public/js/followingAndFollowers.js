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