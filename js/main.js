var beautifyDate = function (a) {
    a = a.substr(0, 10);
    let b = a.split('-');
    let c = b.reverse();
    return c.join('-');
};

var timeSince = function (timeStamp) {
    var now = new Date(),
        secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;
    if (secondsPast < 60) {
        return parseInt(secondsPast) + ' seconds ago';
    }
    if (secondsPast < 3600) {
        return parseInt(secondsPast / 60) + ' minutes ago';
    }
    if (secondsPast <= 86400) {
        return parseInt(secondsPast / 3600) + ' hours ago';
    }
    if (secondsPast > 86400) {
        day = timeStamp.getDate();
        month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
        year = timeStamp.getFullYear() == now.getFullYear() ? "" : " " + timeStamp.getFullYear();
        return day + " " + month + year;
    }
}

var searchhome = function (e) {
    e.preventDefault();
    let user = document.usersearch.username.value;
    letsrock(e, user);
};

var searchresult = function (e) {
    e.preventDefault();

    let user = document.searcha.username1.value;
    //new search request

    document.getElementById('statsc').remove();
    let child1 = document.createElement('canvas');
    child1.id = 'statsc';
    document.getElementById('statsgraph').appendChild(child1);
    //removing already existing canvas and readding it

    if (document.getElementById('repoc') !== null) {
        document.getElementById('row2').style.display = 'block';
        document.getElementById('repoc').remove();
        let child2 = document.createElement('canvas');
        child2.id = 'repoc';
        document.getElementById('repograph').appendChild(child2);
    }

    document.getElementById('langc').remove();
    let child3 = document.createElement('canvas');
    child3.id = 'langc';
    document.getElementById('langgraph').appendChild(child3);

    var foo = document.getElementById('timeline');
    while (foo.firstChild) foo.removeChild(foo.firstChild);

    letsrock(e, user);
};

var letsrock = function (e, user) {
    console.log("Form Submitted");
    console.log("Search Request for " + user);
    let usrprofile = new XMLHttpRequest();
    usrprofile.open("GET", "https://api.github.com/users/" + user, false);
    usrprofile.send();
    if (usrprofile.status !== 404) {

        let profiledat = JSON.parse(usrprofile.response);
        //remove the search bar
        document.getElementById("usersearch").style.display = "none";
        document.getElementById('canvas').style.display = "block";
        //make call to get starred repos
        let stars = new XMLHttpRequest();
        stars.open("GET", "https://api.github.com/users/" + user + "/starred", false);
        stars.send();
        let starred = Object.keys(JSON.parse(stars.response)).length;

        //create the element for displaying name
        let name = document.getElementById('name');
        name.innerHTML = profiledat.name;

        //create the element for displaying bio
        if (profiledat.bio !== null) {
            var bio = document.getElementById('bio');
            bio.innerHTML = profiledat.bio;
            bio.style.display = "block";
        } else {
            console.log('i hid it');
            document.getElementById('bio').style.display = "none";
        }

        //create the element for displaying location
        if (profiledat.location !== null) {
            var loc = document.getElementById('place');
            loc.innerHTML = profiledat.location;
            document.getElementById('location').style.display = "block";
        } else {
            console.log('i hid it');
            document.getElementById('location').style.display = "none";
        }

        //create the element for displaying blog link
        if (profiledat.blog !== "") {
            var blog = document.getElementById('bloglink');
            blog.innerHTML = profiledat.blog;
            blog.href = profiledat.blog;
            document.getElementById('blog').style.display = "block";
        } else {
            console.log('i hid it');
            document.getElementById('blog').style.display = "none";
        }

        //create the element for displaying dp
        let dp = document.getElementById('image');
        dp.src = profiledat.avatar_url;

        //create the element for displaying followers and following
        var followers = profiledat.followers;
        var following = profiledat.following;

        //create the element for displaying joining date

        let joindate = document.getElementById('din');
        let year = ((profiledat.created_at).substr(0, 10)).substr(0, 4);
        let month = (((profiledat.created_at).substr(0, 10)).substr(5, 6)).substr(0, 2);
        let monthvalue;
        switch (month) {
            case '01':
                monthvalue = "January";
                break;
            case '02':
                monthvalue = "February";
                break;
            case '03':
                monthvalue = "March";
                break;
            case '04':
                monthvalue = "April";
                break;
            case '05':
                monthvalue = "May";
                break;
            case '06':
                monthvalue = "June";
                break;
            case '07':
                monthvalue = "July";
                break;
            case '08':
                monthvalue = "August";
                break;
            case '09':
                monthvalue = "September";
                break;
            case '10':
                monthvalue = "October";
                break;
            case '11':
                monthvalue = "November";
                break;
            case '12':
                monthvalue = "December";
                break;
        }
        joindate.innerHTML = "Joined " + monthvalue + ', ' + year;

        /*--------------------------------------------------------------------*/
        //calling to get the public repo of users
        let usrrepo = new XMLHttpRequest();
        usrrepo.open("GET", "https://api.github.com/users/" + user + "/repos", false);
        usrrepo.send();
        var repomaster = JSON.parse(usrrepo.response);
        let i;
        //count the forks,stars and watchers
        var totalForks, totalStars, totalWatchers;
        totalForks = 0;
        totalStars = 0;
        totalWatchers = 0;
        var lang = new Array(repomaster.length); //to store popular langauges
        var popular = []; //to store repo and stars
        // getting the languages from the repositories
        for (i = 0; i < repomaster.length; i++) {
            lang[i] = repomaster[i].language;
            //incrementing individual score
            totalForks += repomaster[i].forks_count;
            totalStars += repomaster[i].stargazers_count;
            totalWatchers += repomaster[i].watchers_count;
            //pushing repo name and stars
            if (repomaster[i].fork === false) {
                popular.push({
                    'name': repomaster[i].name,
                    'stars': repomaster[i].stargazers_count
                });
            }
        }
        popular = popular.sort(function (a, b) {
            return b.stars - a.stars;
        }) // sorting by most stars
        popular = popular.filter(function (obj) {
            return obj.stars !== 0;
        }); // removing repositories with zero stars
        lang = lang.filter(a => a !== null); //removing null entries 
        var langcount = {};
        lang.forEach(function (k) {
            langcount[k] = (langcount[k] || 0) + 1;
        }); // counting the number for each langugae
        var sortedlang = ((Object.entries(langcount)).sort((a, b) => b[1] - a[1])).slice(0, 5);
        var langlist = [];
        var listcount = [];
        for (i = 0; i < sortedlang.length; i++) {
            langlist[i] = sortedlang[i][0];
            listcount[i] = sortedlang[i][1];
        }
        var repolist = [];
        var starcount = [];
        for (i = 0; i < popular.length; i++) {
            repolist[i] = popular[i].name;
            starcount[i] = popular[i].stars;
        }
        repolist = repolist.slice(0, 5); //getting top 5 repo
        starcount = starcount.slice(0, 5); //getting top 5 repo

        /*--------------------------------------------------------------------*/

        //analysis charts
        var ctx0 = document.getElementById('statsc');
        var statsdata = {
            datasets: [{
                data: [
            followers,
            following,
            totalForks,
            totalStars,
            totalWatchers
        ],
                backgroundColor: [
            "#FF6384",
            "#4BC0C0",
            "#FFCE56",
            "#E7E9ED",
            "#36A2EB"
        ],
                label: 'My dataset' // for legend
    }],
            labels: [
        "Followers",
        "Following",
        "Total Forks",
        "Total Stars",
        "Total Watchers"
    ]
        };
        var mychart0 = new Chart(ctx0, {
            data: statsdata,
            type: 'doughnut',
            options: {
                responsive: true,
                elements: {
                    arc: {
                        borderColor: "#fff"
                    }
                },
                legend: {
                    position: 'bottom',
                },
                animation: {
                    animateRotate: false,
                    animateScale: true
                },
                maintainAspectRatio: false
            }
        });
        /*----------------*/
        var ctx = document.getElementById('langc');
        var config = {
            type: 'pie',
            data: {
                datasets: [{
                    data: listcount,
                    backgroundColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                    label: 'Top languages'
                    }],
                labels: langlist
            },
            options: {
                responsive: true,
                legend: {
                    position: 'left',
                },
                title: {
                    display: true
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                },
                maintainAspectRatio: false
            }
        };
        var mychart1 = new Chart(ctx, config);

        if (starcount.length > 1) {
            var ctx2 = document.getElementById("repoc");
            var myChart2 = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: repolist,
                    datasets: [{
                        label: 'Number of stars',
                        data: starcount,
                        backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                        borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                        borderWidth: 1
                }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                    }]
                    },
                    responsive: true,
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true
                    },
                    maintainAspectRatio: false
                }
            });
        } else {
            document.getElementById('row2').style.display = "none";
            console.log('Gareeb hai tu');
        }
        //calling to get the activity of user
        let usrevent = new XMLHttpRequest();
        usrevent.open("GET", "https://api.github.com/users/" + user + "/events", false);
        usrevent.send();
        var eventmaster = (JSON.parse(usrevent.response));

        //handling events and pushing to event array
        var events = [];
        for (i = 0; i < eventmaster.length; i++) {
            var t = new Date(eventmaster[i].created_at);
            var n = timeSince(t);
            var urlt = eventmaster[i].repo.url;
            urlt = urlt.replace('api', 'www');
            urlt = urlt.replace('/repos', '');
            if (eventmaster[i].type === 'PushEvent') {
                events.push({
                    'reponame': eventmaster[i].repo.name,
                    'commitnumbers': eventmaster[i].payload.size,
                    'timespan': t,
                    'repourl': urlt,
                    'type': 'push',
                    'now': n
                });
            } else if (eventmaster[i].type === 'CreateEvent') {
                events.push({
                    'reponame': eventmaster[i].repo.name,
                    'repourl': urlt,
                    'timespan': t,
                    'type': 'create',
                    'now': n
                });
            } else if (eventmaster[i].type === 'ForkEvent') {
                var lusr = user.length;
                var lrepo = (eventmaster[i].repo.name).length
                var fl = (eventmaster[i].repo.name).substr(lusr + 1, lrepo);
                var furlt = eventmaster[i].payload.forkee.url;
                furlt = furlt.replace('api', 'www');
                furlt = furlt.replace('/repos', '');
                events.push({
                    'reponame': eventmaster[i].repo.name,
                    'repourl': urlt,
                    'timespan': t,
                    'forkurl': furlt,
                    'forkrepo': user + '/' + fl,
                    'type': 'fork',
                    'now': n
                });
            } else if (eventmaster[i].type === 'PullRequestEvent') {
                var prurlt = eventmaster[i].payload.pull_request.issue_url;
                prurlt = prurlt.replace('api', 'www');
                prurlt = prurlt.replace('/repos', '');
                events.push({
                    'reponame': eventmaster[i].repo.name,
                    'repourl': urlt,
                    'timespan': t,
                    'action': eventmaster[i].payload.action,
                    'url': prurlt,
                    'additions': eventmaster[i].payload.pull_request.additions,
                    'deletions': eventmaster[i].payload.pull_request.deletions,
                    'type': 'pr',
                    'now': n
                });
            } else if (eventmaster[i].type === 'WatchEvent') {
                events.push({
                    'reponame': eventmaster[i].repo.name,
                    'repourl': urlt,
                    'timespan': t,
                    'type': 'watch',
                    'now': n
                });
            } else if (eventmaster[i].type === 'DeleteEvent') {
                events.push({
                    'reponame': eventmaster[i].repo.name,
                    'repourl': urlt,
                    'timespan': t,
                    'ref': eventmaster[i].payload.ref,
                    'reftype': eventmaster[i].payload.ref_type,
                    'type': 'delete',
                    'now': n
                });
            } else if (eventmaster[i].type === 'PullRequestReviewCommentEvent') {
                events.push({
                    'reponame': eventmaster[i].repo.name,
                    'repourl': urlt,
                    'timespan': t,
                    'issue': eventmaster[i].payload.pull_request.body,
                    'comment': eventmaster[i].payload.comment.body,
                    'issueurl': eventmaster[i].payload.pull_request.html_url,
                    'type': 'prcomment',
                    'now': n
                });
            } else if (eventmaster[i].type === 'IssueCommentEvent') {
                events.push({
                    'reponame': eventmaster[i].repo.name,
                    'repourl': urlt,
                    'timespan': t,
                    'issue': eventmaster[i].payload.issue.body,
                    'comment': eventmaster[i].payload.comment.body,
                    'issueurl': eventmaster[i].payload.issue.html_url,
                    'type': 'issuecomment',
                    'now': n
                });
            } else {
                //aur handle nhi karunga bas.
            }
        }
        console.log(events);
        for (i = 0; i < events.length; i++) {
            if (events[i].type === 'push') {
                let temp = document.createElement('p');
                let temp2 = document.createElement('span');
                temp.className = 'activity';
                temp2.className = 'moment';
                temp.innerHTML = '<i class="fa fa-check small"></i>' + 'Pushed ' + events[i].commitnumbers + ' commits in ' + '<a href="' + events[i].repourl + '">' + events[i].reponame + '</a>';
                temp2.innerHTML = events[i].now;
                document.getElementById('timeline').appendChild(temp);
                temp.appendChild(temp2);
            } else if (events[i].type === 'create') {
                let temp = document.createElement('p');
                let temp2 = document.createElement('span');
                temp.className = 'activity';
                temp2.className = 'moment';
                temp.innerHTML = '<i class="fa fa-plus small"></i>' + 'Created the repository ' + '<a href="' + events[i].repourl + '">' + events[i].reponame + '</a>';
                temp2.innerHTML = events[i].now;
                document.getElementById('timeline').appendChild(temp);
                temp.appendChild(temp2);
            } else if (events[i].type === 'fork') {
                let temp = document.createElement('p');
                let temp2 = document.createElement('span');
                temp.className = 'activity';
                temp2.className = 'moment';
                temp.innerHTML = '<i class="fa fa-code-fork small"></i>' + 'Forked ' + '<a href="' + events[i].repourl + '">' + events[i].reponame + '</a>' + ' to ' + '<a href="' + events[i].forkurl + '">' + events[i].forkrepo + '</a>';
                temp2.innerHTML = events[i].now;
                document.getElementById('timeline').appendChild(temp);
                temp.appendChild(temp2);
            } else if (events[i].type === 'pr') {
                let temp = document.createElement('p');
                let temp2 = document.createElement('span');
                temp.className = 'activity';
                temp2.className = 'moment';
                temp.innerHTML = '<i class="fa fa-exclamation-circle small"></i>' + events[i].action + '<a href="' + events[i].url + '">' + ' a Pull request ' + '</a>' + ' in ' + '<a href="' + events[i].repourl + '">' + events[i].reponame + '</a>' + ' with ' + events[i].additions + ' additions ' + 'and ' + events[i].deletions + ' deletions';
                temp2.innerHTML = events[i].now;
                document.getElementById('timeline').appendChild(temp);
                temp.appendChild(temp2);
            } else if (events[i].type === 'watch') {
                let temp = document.createElement('p');
                let temp2 = document.createElement('span');
                temp.className = 'activity';
                temp2.className = 'moment';
                temp.innerHTML = '<i class="fa fa-star small"></i>' + 'Starred the repo ' + '<a href="' + events[i].repourl + '">' + events[i].reponame + '</a>';
                temp2.innerHTML = events[i].now;
                document.getElementById('timeline').appendChild(temp);
                temp.appendChild(temp2);
            } else if (events[i].type === 'delete') {
                let temp = document.createElement('p');
                let temp2 = document.createElement('span');
                temp.className = 'activity';
                temp2.className = 'moment';
                temp.innerHTML = '<i class="fa fa-trash-o small"></i>' + 'Deleted a ' + events[i].reftype + ' ' + '<span class="highlight">' + events[i].ref + '</span>' + ' in ' + '<a href="' + events[i].repourl + '">' + events[i].reponame + '</a>';
                temp2.innerHTML = events[i].now;
                document.getElementById('timeline').appendChild(temp);
                temp.appendChild(temp2);
            } else if (events[i].type === 'prcomment') {
                let temp = document.createElement('p');
                let temp2 = document.createElement('span');
                temp.className = 'activity';
                temp2.className = 'moment';
                temp.innerHTML = '<i class="fa fa-comment small"></i>' + 'Made a comment on a ' + '<a href="' + events[i].issueurl + '">' + 'PR' + '</a>' + ' in ' + '<a href="' + events[i].repourl + '">' + events[i].reponame;
                temp2.innerHTML = events[i].now;
                document.getElementById('timeline').appendChild(temp);
                temp.appendChild(temp2);
            } else if (events[i].type === 'issuecomment') {
                let temp = document.createElement('p');
                let temp2 = document.createElement('span');
                temp.className = 'activity';
                temp2.className = 'moment';
                temp.innerHTML = '<i class="fa fa-comment small"></i>' + 'Made a comment on a ' + '<a href="' + events[i].issueurl + '">' + 'issue' + '</a>' + ' in ' + '<a href="' + events[i].repourl + '">' + events[i].reponame;
                temp2.innerHTML = events[i].now;
                document.getElementById('timeline').appendChild(temp);
                temp.appendChild(temp2);
            } else {
                //
            }
        }
    } else {
        alert("User not found,enter valid username");
        document.usersearch.username.value = "";
    }
};

document.getElementById('usersearch').addEventListener('submit', searchhome);

document.getElementById('searcha').addEventListener('submit', searchresult);
