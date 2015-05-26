(function() {

    var queryString = '';

    $('.dropdown-menu li a').click(function() {
        $('.btn:first-child')
            .text($(this).text())
            .val($(this).text());
        queryString = $('.selection').text();
    });

    $('.search-btn').click(function() {

        $('.search-results').html('Loading. . .');

        $.ajax({
            type: "GET",
            url: "https://api.hackaday.io/v1/projects?api_key=tK1CvfYSIp1zqm3a",
            data: {
                sortby: queryString.toLowerCase(),
                per_page: 25
            },
            success: function(data) {
                $('.search-results').text('');

                for (var i = 0; i < data.projects.length; i++) {
                    var results  = data.projects[i].name;
                    var count    = data.projects[i][queryString.toLowerCase()];
                    var url      = data.projects[i].url;
                    $('.search-results')
                        .append('<div class="result-item">' + (i + 1) + '. ' + '<a href=' + url + '>' + results + '</a>' + ' - ' + count + ' ' + queryString + '</div>');
                }
            }
        })
    });

})();


