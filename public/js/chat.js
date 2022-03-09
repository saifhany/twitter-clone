$(document).ready(() => {
    $.get(`/api/chat/${chatId}`, (chat) => $('#chatName').text(getChatName(chat)))

    $.get(`/api/chat/${chatId}/message`, (data) => {
        const messages = []
        let lastSenderId = ''

        data.forEach((message, index) => {
            const html = createChatMessageHtml(message, data[index + 1], lastSenderId)
            lastSenderId = message.sender._id
            messages.push(html)
        })

        addMessageHtmlToPage(messages)
    })
})

$('#chatNameButton').click(() => {
    var name = $('#chatNameTextBox').val().trim()

    $.ajax({
        url: '/api/chat/' + chatId,
        type: 'PUT',
        data: { chatName: name },
        success: (data, status, xhr) => {
            if (xhr.status != 204) {
                alert('could not update')
            } else {
                location.reload()
            }
        },
    })
})

$('.inputTextBox').keydown((event) => {
    if (event.which === 13 && !event.shiftKey) {
        submited()
        return false
    }
})

$('.sendMessageButton').click(() => {
    submited()
})

function submited() {
    var content = $('.inputTextBox').val().trim()

    if (content != '') {
        sendMessage(content)
        $('.inputTextBox').val('')
    }
}

function sendMessage(content) {
    $.post(
        '/api/message', { content: content, chatId: chatId },
        (message, status, xhr) => {
            if (xhr.status != 201) {
                alert('Could not send message')
                $('.inputTextBox').val(content)
                return
            }
            addChatMessageHtml(message)
        }
    )
}

function addChatMessageHtml(message) {
    const messageHtml = createChatMessageHtml(message)
    addMessageHtmlToPage(messageHtml)
}

function addMessageHtmlToPage(html) {
    $('.chatMessages').append(html)
}

function createChatMessageHtml(message, nextMessage, lastSenderId) {
    const sender = message.sender

    const currentSenderId = sender._id
    const nextSenderId = nextMessage != null ? nextMessage.sender._id : ''

    const isFirst = lastSenderId != currentSenderId
    const isLast = nextSenderId != currentSenderId

    const isMine = sender._id === user._id
    let liClassName = isMine ? 'mine' : 'theirs'

    let nameElement = ''
    if (isFirst) {
        if (!isMine) {
            nameElement = `<span class='senderName'>${sender.firstName} ${sender.lastName}</span>`
        }
    }

    let imageElement = ''
    if (isLast) {
        liClassName += ' last'

        if (!isMine) {
            imageElement = `<div class='imageContainer'>
                                <img src=${sender.profilePic} />
                            </div>`
        }
    }

    return `<li class='message ${liClassName}'>
                ${imageElement}
                <div class='messageContainer'>
                    ${nameElement}
                    <span class='messageBody'>
                        ${message.content}
                </div>
            </li>`
}