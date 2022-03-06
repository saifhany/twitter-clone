$(document).ready(() => {
    $.get(`/api/chat/${chatId}`, (chat) => $('#chatName').text(getChatName(chat)))
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
        (data, status, xhr) => {
            console.log(data)
        }
    )
}