var selectedUsers = []

$(document).ready(() => {
    $.get('/api/chat', (chats) => outputChats(chats, $('.chatsContainer')))
})

const outputChats = (chats, container) => {
    chats.forEach((chat) => {
        var html = createChatHtml(chat)
        container.append(html)
    })

    if (chats.length == 0) {
        container.append('<span class="noResults">Nothing to show</span>')
    }
}

const createChatHtml = (chat) => {
    var name = getChatName(chat)
    var image = getChatImageElement(chat)
    var latestMessage = 'message'

    return `<a href='/message/${chat._id}' class='resultListItem'>
                ${image}
                <div class='resultsDetailContainer'>
                    <span class='heading'>${name}</span>
                    <span class='subText'>${latestMessage}</span>
                </div>
            </a>`
}

const getChatName = (chat) => {
    var chatName = chat.chatName

    if (!chatName) {
        var users = getChatUsers(chat.users)
        var namesArray = users.map((item) => item.firstName + ' ' + item.lastName)
        chatName = namesArray.join(', ')
    }

    return chatName
}

const getChatUsers = (users) => {
    if (users.length == 1) return users

    return users.filter((item) => item._id != user._id)
}

const getChatImageElement = (chat) => {
    var users = getChatUsers(chat.users)

    var classImage = ''
    var image = getUserChatImage(users[0])
    if (users.length > 1) {
        var classImage = 'groupChatImage'
        image += getUserChatImage(users[1])
    }

    return `<div class='resultImageContainer ${classImage}'>${image}</div>`
}

const getUserChatImage = (dataUser) => {
    return `<img src='${dataUser.profilePic}' alt="User's profile pic"></img>`
}

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