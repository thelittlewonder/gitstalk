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
document.getElementById('usersearch').addEventListener('submit', function (e) {
    e.preventDefault();
    console.log("Form Submitted");
    let user = document.usersearch.username.value
    console.log("Search Request for " + user);
    let usrprofile = new XMLHttpRequest();
    usrprofile.open("GET", "https://api.github.com/users/" + user, false);
    usrprofile.send();
    if (usrprofile.status !== 404) {

        let profiledat = JSON.parse(usrprofile.response);
        //remove the search bar
        document.getElementById("usersearch").remove();

        //make call to get starred repos
        let stars = new XMLHttpRequest();
        stars.open("GET", "https://api.github.com/users/" + user + "/starred", false);
        stars.send();
        let starred = Object.keys(JSON.parse(stars.response)).length;

        //create the element for displaying name
        let name = document.createElement('h1');
        name.innerHTML = profiledat.name;

        //create the element for displaying bio
        if (profiledat.bio !== null) {
            var bio = document.createElement('h3');
            bio.innerHTML = profiledat.bio;
        }

        //create the element for displaying location
        if (profiledat.location !== null) {
            var loc = document.createElement('h4');
            loc.innerHTML = profiledat.location;
        }

        //create the element for displaying blog link
        if (profiledat.blog !== "") {
            var blog = document.createElement('h3');
            blog.innerHTML = profiledat.blog;
        }

        //create the element for displaying dp
        let dp = document.getElementById('display');
        dp.src = profiledat.avatar_url;

        //create the element for displaying starred repos
        let star = document.createElement('h3');
        star.innerHTML = "Starred Repos: " + starred;

        //create the element for displaying followers and following
        let follow = document.createElement('h3');
        let followers = profiledat.followers;
        let following = profiledat.following;
        follow.innerHTML = "Followers: " + followers + '<br>' + "Following: " + following;

        //create the element for displaying joining date
        let joindate = document.createElement('h4');
        joindate.innerHTML = "Github Member since " + (profiledat.created_at).substr(0, 10);


        //add the elements to the dom
        document.getElementById('about').appendChild(name);
        if (profiledat.location !== null) {
            document.getElementById('about').appendChild(loc);
        }
        if (profiledat.bio !== null) {
            document.getElementById('about').appendChild(bio);
        }
        if (profiledat.blog !== "") {
            document.getElementById('about').appendChild(blog);
        }
        document.getElementById('about').appendChild(joindate);
        document.getElementById('info').appendChild(star);
        document.getElementById('info').appendChild(follow);

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
        let tt = document.getElementById('stats');
        tt.innerHTML = "Forks: " + totalForks + " " + "Stars: " + totalStars + " " + "Watchers: " + totalWatchers;

        /*--------------------------------------------------------------------*/

        //analysis charts
        var ctx = document.getElementById('langac');
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
                    display: true,
                    text: 'Top Languages'
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        };
        if (starcount.length > 1) {
            var ctx2 = document.getElementById("repo");
            var myChart = new Chart(ctx2, {
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
                        display: true,
                        text: 'Top Repositories'
                    },
                }
            });
        } else {
            //var errmsg = document.createElement('p');
            //errmsg.innerHTML = 'No Popular Repositories';
            //document.body.appendChild(errmsg);
        }
        var mychart = new Chart(ctx, config);


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
            if (eventmaster[i].type === 'PushEvent') {
                events.push({
                    'reponame': eventmaster[i].repo.name,
                    'commitnumbers': eventmaster[i].payload.size,
                    'timespan': t,
                    'url': eventmaster[i].repo.url,
                    'type': 'push',
                    'now': n
                });
            } else if (eventmaster[i].type === 'CreateEvent') {
                events.push({
                    'reponame': eventmaster[i].repo.name,
                    'description': eventmaster[i].repo.url,
                    'timespan': t,
                    'type': 'create',
                    'now': n
                });
            } else if (eventmaster[i].type === 'ForkEvent') {
                events.push({
                    'reponame': eventmaster[i].repo.name,
                    'repourl': eventmaster[i].repo.url,
                    'timespan': t,
                    'forkurl': eventmaster[i].payload.forkee.url,
                    'type': 'fork',
                    'now': n,
                    'now': n
                });
            } else if (eventmaster[i].type === 'PullRequestEvent') {
                events.push({
                    'reponame': eventmaster[i].repo.name,
                    'repourl': eventmaster[i].repo.url,
                    'timespan': t,
                    'action': eventmaster[i].payload.action,
                    'url': eventmaster[i].payload.pull_request.issue_url,
                    'additions': eventmaster[i].payload.pull_request.additions,
                    'deletions': eventmaster[i].payload.pull_request.deletions,
                    'type': 'pr',
                    'now': n
                });
            } else if (eventmaster[i].type === 'WatchEvent') {
                events.push({
                    'reponame': eventmaster[i].repo.name,
                    'repourl': eventmaster[i].repo.url,
                    'timespan': t,
                    'type': 'watch',
                    'now': n
                });
            } else if (eventmaster[i].type === 'DeleteEvent') {
                events.push({
                    'reponame': eventmaster[i].repo.name,
                    'repourl': eventmaster[i].repo.url,
                    'timespan': t,
                    'ref': eventmaster[i].payload.ref,
                    'reftype': eventmaster[i].payload.ref_type,
                    'type': 'delete',
                    'now': n
                });
            } else if (eventmaster[i].type === 'PullRequestReviewCommentEvent') {
                events.push({
                    'reponame': eventmaster[i].repo.name,
                    'repourl': eventmaster[i].repo.url,
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
                    'repourl': eventmaster[i].repo.url,
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
    } else {
        alert("User not found,enter valid username");
        document.usersearch.username.value = "";
    }
});
