var selectedUsers = []

$('#userSearchBox').keydown((e) => {
    var textbox = $(e.target)
    var value = textbox.val()

    if (value == '' && e.keyCode == 8) {
        selectedUsers.pop()
        userSelectedHtml()
        $('.resultsContainer').html('')

        if (selectedUsers.length == 0) {
            $('#createChatButton').prop('disabled', true)
        }
        return
    }

    setTimeout(() => {
        value = textbox.val().trim()
        if (value === '') {
            $('.resultsContainer').html('')
        } else {
            searchUsers(value)
        }
    }, 1000)
})

const searchUsers = (userTerm) => {
    $.get('/api/user', { search: userTerm }, (results) => {
        outputSelectableUsers(results, $('.resultsContainer'))
    })
}

const outputSelectableUsers = (results, container) => {
    container.html('')

    results.forEach((result) => {
        if (
            result._id == user._id ||
            selectedUsers.some((u) => u._id == result._id)
        ) {
            return
        }
        var html = createUserHtml(result, false)
        var element = $(html)
        element.click(() => userSelected(result))
        container.append(element)
    })

    if (results.length == 0) {
        container.append("<span class='noResults'>No results found</span>")
    }
}

const userSelected = (result) => {
    selectedUsers.push(result)
    userSelectedHtml()
    $('#userSearchBox').val('').focus()
    $('.resultsContainer').html('')
    $('#createChatButton').prop('disabled', false)
}

const userSelectedHtml = () => {
    var element = []

    selectedUsers.forEach((item) => {
        var name = `${item.firstName} ${item.lastName}`
        var html = $(`<span class='selectedUser'>${name}</span>`)
        element.push(html)
    })

    $('.selectedUser').remove()
    $('#selectedUsers').prepend(element)
}

$('#createChatButton').click((e) => {
    // ajax only allows send string data
    var data = JSON.stringify(selectedUsers)

    $.post(
        '/api/chat', { users: data },
        (chat) => (window.location.href = `/message/${chat._id}`)
    )
})