<template>
  <div>
    <div v-if="loading">
      Loading...
    </div>
    <div v-if="!showError&&!loading" class="main">
      <header>
        <div class="logo">
          <img src="../assets/gitstalk.svg">
        </div>
        <div class="search">
          <form @submit.prevent="search()">
            <label>www.github.com/</label>
            <input v-model="username">
            <button type="submit">Search</button>
          </form>
        </div>
      </header>
      <aside>
        <div class="about">
          <div class="dp">
            <img :src="profile.avatar_url">
          </div>
          <div class="name">
            <h1>{{profile.name}}</h1>
            <a :href="profile.blog">{{profile.blog}}</a>
          </div>
        </div>
        <div class="stats">
          <div class="item">
            <h3>Followers</h3>
            <p>{{profile.followers}}</p>
          </div>
          <div class="item">
            <h3>Following</h3>
            <p>{{profile.following}}</p>
          </div>
          <div class="item">
            <h3>Stars Received</h3>
            <p>{{getStars}}</p>
          </div>
          <div class="item">
            <h3>Forks by users</h3>
            <p>{{getForks}}</p>
          </div>
        </div>
        <div class="lang">
          {{getLanguages}}
          <span v-for="lang in languages" :key="lang">
            {{lang}}
          </span>
        </div>
        <div class="dates">
          <div class="joined">
            <h4>Joined</h4>
            <p>{{joinDate}}</p>
          </div>
          <div class="location">
            <h4>Location</h4>
            <p>{{profile.location}}</p>
          </div>
          <span>Last Updated on {{lastUpdateDate}}</span>
        </div>
      </aside>
      <section>
        <h2>Latest Activities</h2>
        <div v-for="activity in activities" :key="activity.id">
          <span v-html="defineActivity(activity)"></span>
          <br>
        </div>
      </section>
    </div>
    <div v-if="showError">Username does not exists</div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "Profile",
  data() {
    return {
      profile: [],
      activities: [],
      repos: [],
      loading: true,
      showError: false,
      activityCount: 15,
      username: "",
      languages: []
    };
  },
  mounted: function() {
    //get username from the route
    let user = this.$route.params.id;
    this.username = user;
    //make request to github API
    this.makeRequest(user);
  },
  computed: {
    //get total stars
    getStars: function() {
      let totalStars = 0;
      this.repos.forEach(repo => {
        totalStars += repo.stargazers_count;
      });
      return totalStars;
    },
    //get total forks
    getForks: function() {
      let totalForks = 0;
      this.repos.forEach(repo => {
        totalForks += repo.forks_count;
      });
      return totalForks;
    },
    //get all the languages
    getLanguages: function() {
      let languages = [];
      this.repos.forEach(repo => {
        languages.push(repo.language);
      });
      this.languages = languages //remove repeating values
        .filter(function(elem, index, self) {
          return index == self.indexOf(elem);
        }) //remove null values
        .filter(Boolean);
    },
    //get join date of user after beautifying it
    joinDate: function() {
      return this.beautifyDate(this.profile.created_at);
    },
    //get last date of profile update after beautifying it
    lastUpdateDate: function() {
      return this.beautifyDate(this.profile.updated_at);
    },
    //get last time of profile update after beautifying it
    lastUpdateTime: function() {
      return this.beautifyTime(this.profile.updated_at);
    }
  },
  methods: {
    makeRequest: function(name) {
      //make request to github API
      this.loading = true;
      axios
        .all([
          axios.get("https://api.github.com/users/" + name),
          axios.get(
            "https://api.github.com/users/" +
              name +
              "/events?per_page=" +
              this.activityCount
          ),
          axios.get(
            "https://api.github.com/users/" + name + "/repos?per_page=100"
          )
        ])
        .then(
          axios.spread((profile, activity, repo) => {
            //hide loader
            this.loading = false;

            //set data
            this.profile = profile.data;
            this.activities = activity.data;
            this.repos = repo.data;
          })
        )
        .catch(err => {
          this.loading = false;
          console.log(err);
          this.showError = true;
        });
    },
    search: function() {
      let user = this.username;
      if (user) {
        this.$router.push("/" + user);
        this.makeRequest(user);
      } else {
        this.showError = true;
      }
    },
    //convert a date string to DD MM, YYYY Format
    beautifyDate: function(s) {
      return new Date(s).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    },
    //convert a time string to HH:MM Format
    beautifyTime: function(t) {
      return new Date(t).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    },
    //changes url from api.github.com to standard form
    cleanURL: function(u) {
      return u.replace("api", "www").replace("/repos", "");
    },
    //convert time of activity to relative time
    convertToRelative: function(s) {
      //courtesy:https://stackoverflow.com/a/6109105
      let current = new Date();
      let previous = new Date(s);
      var msPerMinute = 60 * 1000;
      var msPerHour = msPerMinute * 60;
      var msPerDay = msPerHour * 24;
      var msPerMonth = msPerDay * 30;

      var elapsed = current - previous;

      if (elapsed < msPerMinute) {
        return Math.round(elapsed / 1000) + " seconds ago";
      } else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + " minutes ago";
      } else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + " hours ago";
      } else if (elapsed < msPerMonth && Math.round(elapsed / msPerDay) <= 2) {
        return Math.round(elapsed / msPerDay) + " days ago";
      } else {
        //dont convert if older than 2 days
        return previous.toLocaleDateString([], {
          month: "short",
          day: "numeric"
        });
      }
    },
    //defining events
    defineActivity: function(activity) {
      let stmnt, repoURL;
      //set repo url for referencing
      repoURL =
        '<a href="' +
        this.cleanURL(activity.repo.url) +
        '">' +
        activity.repo.name +
        "</a>";
      switch (activity.type) {
        case "PushEvent":
          //say pushed 1 commit in case of single commit, otherwise say commits
          let commit = "commit";
          if (activity.payload.size > 1) {
            commit += "s";
          }
          //if event is pushed
          stmnt =
            "Pushed " + activity.payload.size + " " + commit + " to " + repoURL;
          break;
        case "WatchEvent":
          stmnt = "Starred a repo " + repoURL;
          break;
        case "CreateEvent":
          stmnt = "Created a " + activity.payload.ref_type + " ";
          if (activity.payload.ref_type === "branch") {
            stmnt +=
              '<a href="' +
              this.cleanURL(activity.repo.url) +
              "/tree/" +
              activity.payload.ref +
              '">' +
              activity.payload.ref +
              "</a>" +
              " in " +
              repoURL;
          } else {
            stmnt += repoURL;
          }
          break;
        case "DeleteEvent":
          stmnt =
            "Deleted a " +
            activity.payload.ref_type +
            " " +
            activity.payload.ref +
            " from " +
            repoURL;
          break;
        case "ForkEvent":
          stmnt =
            "Forked a repo " +
            repoURL +
            " to " +
            '<a href="' +
            activity.payload.forkee.html_url +
            '">' +
            activity.payload.forkee.full_name +
            "</a>";
          break;
        case "PullRequestEvent":
          stmnt =
            activity.payload.action.charAt(0).toUpperCase() +
            activity.payload.action.slice(1) +
            " a " +
            '<a href="' +
            this.cleanURL(activity.payload.pull_request.url) +
            '">' +
            " pull request " +
            "</a>" +
            " in " +
            repoURL;
          break;
        case "PullRequestReviewCommentEvent":
          stmnt =
            activity.payload.action.charAt(0).toUpperCase() +
            activity.payload.action.slice(1) +
            " a " +
            '<a href="' +
            this.cleanURL(activity.payload.comment.html_url) +
            '">' +
            "comment" +
            "</a>" +
            " on their pull request in " +
            repoURL;
          break;
        case "IssuesEvent":
          stmnt =
            activity.payload.action.charAt(0).toUpperCase() +
            activity.payload.action.slice(1) +
            " a " +
            '<a href="' +
            activity.payload.issue.html_url +
            '">' +
            " issue " +
            "</a>" +
            " in " +
            repoURL;
          break;
        case "IssueCommentEvent":
          stmnt =
            activity.payload.action.charAt(0).toUpperCase() +
            activity.payload.action.slice(1) +
            " " +
            '<a href="' +
            this.cleanURL(activity.payload.issue.html_url) +
            '">' +
            "a comment" +
            "</a>" +
            " on an issue in " +
            repoURL;
          break;
        default:
          console.log(activity.type);
          break;
      }
      return stmnt;
    }
  }
};
</script>

<style scoped lang="scss">
$master: #5c75f6;
.main {
  header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .search {
      label {
        color: #333;
        font-size: 1em;
        margin-right: 0.5em;
      }
      input {
        background: #ffffff;
        border: 1px solid #f1f1f1;
        box-sizing: border-box;
        font-size: 1em;
        padding: 0.5em 0.75em;
      }
      button {
      }
    }
  }
}

@media screen and (max-width: 767px) {
  .main {
    header {
      flex-direction: column;
      .search {
        label {
          margin-right: 0;
        }
      }
    }
  }
}
</style>