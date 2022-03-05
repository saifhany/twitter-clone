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