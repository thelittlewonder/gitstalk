<template>
<div class="profile">
    <header>
        <div class="logo">
            <router-link to="/">
                <img src="../assets/gitstalk.svg">
            </router-link>
        </div>
        <div class="search">
            <form @submit.prevent="search()">
                <label>www.github.com/</label>
                <input v-model="username">
                <button type="submit">Search</button>
            </form>
        </div>
    </header>
        <div class="spinner" v-if="loading"></div>
    <transition name="fade">
        <div v-if="!showError&&!loading" class="main">
            <aside>
                <div class="about">
                    <div class="dp">
                        <img :src="profile.avatar_url">
                    </div>
                    <div class="name">
                        <h1>{{profile.name}}</h1>
                        <a :href="profile.blog">{{getBlog(profile.blog)}}</a>
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
                <hr>
                <div class="activities">
                    <div v-for="activity in activities" :key="activity.id" class="act">
                        <div v-html="defineActivity(activity)" class="entry"></div>
                        <div class="time">{{convertToRelative(activity.created_at)}}</div>
                    </div>
                </div>
            </section>
        </div>
    </transition>
    <transition name="fade">
        <div v-if="showError&&!loading" class="error">
          <div class="octocat">
            <img src="../assets/errorCat.png">
          </div>
          <div class="message">
            <h2>Username not found.</h2>
            <h3>Even our strongest octocat failed to find it.</h3>
          </div>
        </div>
    </transition>
    <transition name="fade">
        <Foot v-if="!showError&&!loading"></Foot>
    </transition>
</div>
</template>

<script>
import axios from "axios";
import Foot from "./Foot.vue";
export default {
  name: "Profile",
  data() {
    return {
      profile: [],
      activities: [],
      repos: [],
      loading: true,
      showError: false,
      activityCount: 20,
      username: "",
      languages: []
    };
  },
  components: {
    Foot
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
    //clean up blog text
    getBlog: function(a) {
      let remove = ["https://wwww.", "http://www.", "http://", "https://"];
      remove.forEach(x => {
        a.includes(x) ? (a = a.replace(x, "")) : "";
      });
      return a;
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
$main: #5c75f6;
header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1em;
  .search {
    label {
      color: #333;
      font-size: 1em;
      margin-right: 0.3em;
    }
    input {
      background: #ffffff;
      border: 1px solid #f1f1f1;
      box-sizing: border-box;
      font-size: 1em;
      padding: 0.5em 0.75em;
      &:focus {
        outline: 1px solid $main;
      }
    }
    button {
      padding: 0.5em 1.25em;
      cursor: pointer;
      background-color: $main;
      font-size: 1em;
      border-radius: 2px;
      color: #fff;
      font-family: "Rubik";
      border: none;
      letter-spacing: 0.01em;
    }
  }
}
.error {
  border: 1px solid #f7f7f7;
  box-sizing: border-box;
  border-radius: 2px;
  display: flex;
  background-color: #fff;
  padding: 2em;
  align-items: center;
  .message {
    display: flex;
    flex-direction: column;
    h2 {
      font-size: 1.5em;
      letter-spacing: 0.01em;
      color: #000000;
    }
    h3 {
      line-height: 1.5em;
      font-size: 1em;
      color: #666666;
    }
  }
}
.main {
  aside {
    .about {
      background: #ffffff;
      border: 1px solid #f7f7f7;
      box-sizing: border-box;
      border-radius: 2px 2px 0px 0px;
      padding: 1em;
      display: flex;
      flex-direction: row;
      align-items: center;
      .dp {
        img {
          height: 44px;
          width: auto;
          border-radius: 100%;
        }
        margin-right: 0.75em;
      }
      .name {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        h1 {
          color: #333;
          font-size: 1em;
          margin-bottom: 0.375em;
        }
        a {
          color: $main;
          text-decoration: none;
          font-size: 0.875em;
        }
      }
    }
    .stats {
      background: #ffffff;
      border-right: 1px solid #f7f7f7;
      border-bottom: 1px solid #f7f7f7;
      border-left: 1px solid #f7f7f7;
      box-sizing: border-box;
      border-radius: 2px 2px 0px 0px;
      padding: 1em;
      display: flex;
      flex-direction: column;
      .item {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 1em;
        &:last-child {
          margin-bottom: 0;
        }
        h3 {
          font-size: 0.875em;
          letter-spacing: 0.01em;
          color: #888888;
        }
        p {
          font-size: 1em;
          letter-spacing: 0.01em;
          color: #555555;
        }
      }
    }
    .lang {
      background: #ffffff;
      border-right: 1px solid #f7f7f7;
      border-bottom: 1px solid #f7f7f7;
      border-left: 1px solid #f7f7f7;
      box-sizing: border-box;
      border-radius: 2px 2px 0px 0px;
      padding: 0.5em;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      span {
        margin: 0.5em;
        text-align: center;
        font-size: 0.75em;
        letter-spacing: 0.01em;
        color: $main;
        padding: 0.5em;
        background-color: rgba($main, 0.05);
        border-radius: 1px;
        margin-right: 0.5em;
      }
    }
    .dates {
      background: #ffffff;
      border-right: 1px solid #f7f7f7;
      border-bottom: 1px solid #f7f7f7;
      border-left: 1px solid #f7f7f7;
      box-sizing: border-box;
      border-radius: 2px 2px 0px 0px;
      padding: 1em;
      h4 {
        font-size: 0.75em;
        letter-spacing: 0.01em;
        color: #888888;
      }
      p {
        font-size: 0.875em;
        letter-spacing: 0.01em;
        color: #555555;
        margin-top: 0.5em;
      }
      .joined {
        margin-bottom: 1em;
      }
      .location {
        margin-bottom: 0.875em;
        p {
          color: $main;
        }
      }
      span {
        font-size: 0.875em;
        text-align: right;
        letter-spacing: 0.01em;
        color: #aaa;
      }
    }
  }
  section {
    background: #ffffff;
    border: 1px solid #f7f7f7;
    box-sizing: border-box;
    border-radius: 2px;
    h2 {
      font-size: 18px;
      letter-spacing: 0.01em;
      text-transform: uppercase;
      color: #333333;
      padding: 1.5em 1.5em 0 1.5em;
    }
    hr {
      margin: 0.75em 0;
      height: 0;
      border: 1px solid #f7f7f7;
    }
    .activities {
      padding: 0 1.5em 1.5em 1.5em;
      .act {
        display: flex;
        padding: 0.75em 0;
        border-bottom: 1px solid #f7f7f7;
        &:last-child {
          border-bottom: none;
        }
        .entry {
          font-size: 1em;
          letter-spacing: 0.01em;
          color: #666666;
          margin-right: 0.5em;
        }
        .time {
          font-size: 1em;
          letter-spacing: 0.01em;
          color: #cccccc;
          margin-left: 0.5em;
        }
      }
    }
  }
}

@media screen and (max-width: 767px) {
  .main {
    display: flex;
    flex-direction: column-reverse;
  }
  header {
    flex-direction: column;
    justify-content: center;
    margin-top: 1.5em;
    .search {
      label {
        margin-right: 0;
      }
      form {
        margin-top: 1em;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
        label {
          display: none;
        }
        button {
          margin-left: 0.5em;
        }
      }
    }
  }
  section {
    .act {
      flex-direction: column;
      .time {
        margin: 0.25em 0 0 0;
        margin-left: 0 !important;
      }
    }
  }

  .error {
    flex-direction: column;
    justify-content: center;
    h2 {
      margin-bottom: 0.5em;
    }
  }
}

@media screen and (min-width: 768px) {
  .profile {
    padding: 2em;
    max-width: 960px;
    margin: 0 auto;
    .main {
      display: flex;
      flex-direction: row;
      aside {
        margin-right: 2%;
        width: 26%;
        min-width: 240px;
      }
      section {
        width: 72%;
        .act {
          flex-direction: row;
          justify-content: space-between;
        }
      }
    }
  }
  .error {
    flex-direction: row;
    .octocat {
      margin-right: 1.5em;
    }
    h2 {
      margin-bottom: 0.825em;
    }
  }
}
</style>