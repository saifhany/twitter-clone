var timer

$('#searchBox').keydown((e) => {
    var textbox = $(e.target)
    var value = textbox.val()
    var type = textbox.data().search

    setTimeout(() => {
        value = textbox.val().trim()
        if (value === '') {
            $('.resultsContainer').html('')
        } else {
            search(value, type)
        }
    }, 1000)
})

const search = (searchTerm, searchType) => {
    var url = searchType == 'users' ? '/api/user' : '/api/post'

    $.get(url, { search: searchTerm }, (results) => {
        if (searchType === 'users') {
            outputUsers(results, $('.resultsContainer'))
        } else {
            outputPost(results, $('.resultsContainer'))
        }
    })
}