document.getElementById('usersearch').addEventListener('submit', function (e) {
    e.preventDefault();
    console.log("Form Submitted");
    let user = document.usersearch.username.value
    console.log("Search Request for " + user);
    let usrprofile = new XMLHttpRequest();
    usrprofile.open("GET", "https://api.github.com/users/" + user, false);
    usrprofile.send();
    if (usrprofile.status !== 404) {

        /*       let profiledat = JSON.parse(usrprofile.response);
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
        let dp = document.createElement('img');
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
        document.getElementById('profile').appendChild(name);
        if (profiledat.location !== null) {
            document.getElementById('profile').appendChild(loc);
        }
        if (profiledat.bio !== null) {
            document.getElementById('profile').appendChild(bio);
        }
        if (profiledat.blog !== "") {
            document.getElementById('profile').appendChild(blog);
        }
        document.getElementById('profile').appendChild(joindate);
        document.getElementById('profile').appendChild(star);
        document.getElementById('profile').appendChild(follow);
        //document.getElementById('profile').appendChild(dp);
*/
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
        console.log("Forks: " + totalForks + " " + "Stars: " + totalStars + " " + "Watchers: " + totalWatchers);

        /*--------------------------------------------------------------------*/
        //calling to get the activity of user
        /*        let usrevent = new XMLHttpRequest();
                usrevent.open("GET","https://api.github.com/users/"+user+"/events",false);
                usrevent.send();
                console.log((JSON.parse(usrevent.response)));*/

        //creating top 5 languages chart
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
        var mychart = new Chart(ctx, config);

    } else {
        alert("User not found,enter valid username");
        document.usersearch.username.value = "";
    }
});
