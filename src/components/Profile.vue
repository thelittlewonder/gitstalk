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
                    <div v-for="activity in activities" :key="activity.id" class="act" v-if="defineActivity(activity)">
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
    //fix back button on mobile
    window.onpopstate = event => {
      this.$router.push("/");
    };
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
      this.showError = false;
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
      let remove = ["https://www.", "http://www.", "http://", "https://"];
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
      let stmnt,
        repoURL,
        starIcon,
        createIcon,
        commentIcon,
        deleteIcon,
        forkIcon;
      //set repo url for referencing
      repoURL =
        '<a href="' +
        this.cleanURL(activity.repo.url) +
        '">' +
        activity.repo.name +
        "</a>";
      createIcon =
        '<img class="icon" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTAgOEMwIDMuNTgwOTMgMy41ODA5MyAwIDggMEMxMi40MTkgMCAxNiAzLjU4MDkzIDE2IDhDMTYgMTIuNDE5MSAxMi40MTkxIDE2IDggMTZDMy41ODA5MyAxNiAwIDEyLjQxOTEgMCA4Wk04LjU3MTQxIDcuNDI4NTlIMTEuMjM4QzExLjU2MTggNy40Mjg1OSAxMS44MDk0IDcuNjc2MjEgMTEuODA5NCA4QzExLjgwOTQgOC4zMjM3OSAxMS41NjE5IDguNTcxNDEgMTEuMjM4IDguNTcxNDFIOC41NzE0MVYxMS4yMzhDOC41NzE0MSAxMS41NjE4IDguMzIzNzkgMTEuODA5NCA4IDExLjgwOTRDNy42NzYyMSAxMS44MDk0IDcuNDI4NTkgMTEuNTYxOSA3LjQyODU5IDExLjIzOFY4LjU3MTQxSDQuNzYxOUM0LjQzODExIDguNTcxNDEgNC4xOTA0OSA4LjMyMzc5IDQuMTkwNDkgOEM0LjE5MDQ5IDcuNjc2MjEgNC40MzgwNSA3LjQyODU5IDQuNzYxOSA3LjQyODU5SDcuNDI4NTlWNC43NjE5QzcuNDI4NTkgNC40MzgxMSA3LjY3NjE1IDQuMTkwNDkgOCA0LjE5MDQ5QzguMzIzNzkgNC4xOTA0OSA4LjU3MTQxIDQuNDM4MDUgOC41NzE0MSA0Ljc2MTlWNy40Mjg1OVoiIGZpbGw9IiM0OEMxNUYiLz48L3N2Zz4="/>';
      commentIcon =
        '<img class="icon" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNiAwSDEuNEMwLjYzIDAgMCAwLjYzIDAgMS40VjE0TDIuOCAxMS4ySDEyLjZDMTMuMzcgMTEuMiAxNCAxMC41NyAxNCA5LjhWMS40QzE0IDAuNjMgMTMuMzcgMCAxMi42IDBaIiBmaWxsPSIjOEM4QzhDIi8+PC9zdmc+"/>';
      deleteIcon =
        '<img class="icon" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTUuMTUyODkgMS4xMDgxOEg4LjQwMzVMOC40MDM2MyAxLjk3NjMySDUuMTUzMDJMNS4xNTI4OSAxLjEwODE4Wk0xMS42NzI4IDEuOTc2MzJIOS41MTE4NEw5LjUxMTcyIDAuOTIzNDYyQzkuNTExNzIgMC40MDYzNDIgOS4xMDUzNSAwIDguNTg4MjYgMEg0Ljk2ODJDNC40NTEwNSAwIDQuMDQ0NzQgMC40MDYzNDIgNC4wNDQ3NCAwLjkyMzQ2Mkw0LjA0NDggMS45NzYzMkgxLjg0Njk4SDAuNTU0MDc3QzAuMjQwMDUxIDEuOTc2MzIgMCAyLjIxNjQzIDAgMi41MzA0QzAgMi44NDQzNiAwLjI0MDExMiAzLjA4NDQ3IDAuNTU0MDc3IDMuMDg0NDdIMS4zNDgyN0wyLjI3MTczIDEzLjUwMTNDMi4yOTAyMiAxMy43Nzg0IDIuNTMwMzMgMTQgMi44MjU4MSAxNEgxMC43NDkzQzExLjA0NDggMTQgMTEuMjg0OSAxMy43Nzg0IDExLjMwMzMgMTMuNTAxM0wxMi4yMjY4IDMuMDg0NUgxMy4wMzk1QzEzLjM1MzUgMy4wODQ1IDEzLjU5MzYgMi44NDQzOSAxMy41OTM2IDIuNTMwNDNDMTMuNTkzNiAyLjIxNjQ2IDEzLjMxNjYgMS45NzYzMiAxMy4wMDI2IDEuOTc2MzJIMTEuNjkxMkgxMS42NzI4Wk00Ljg3NjIyIDExLjgyMDVDNS4yMDg2OCAxMS44MDIgNS40MzAzIDExLjU0MzUgNS40MzAzIDExLjI0NzlMNS4xOTAxOSA0LjY5MTI1QzUuMTcxNzUgNC4zNzcyNiA0LjkzMTY0IDQuMTM3MTggNC42MTc2OCA0LjE1NTY0QzQuMzAzNjUgNC4xNzQwNyA0LjA4MjAzIDQuNDMyNjggNC4wODIwMyA0LjcyODE4TDQuMzIyMiAxMS4yODQ5QzQuMzQwNjQgMTEuNTgwNCA0LjU4MDc1IDExLjgyMDUgNC44NzYyMiAxMS44MjA1Wk04LjM2NyA0LjY5MTI1QzguMzg1NSA0LjM3NzI2IDguNjI1NjEgNC4xMzcxOCA4LjkzOTU4IDQuMTU1NjRDOS4yNTM2IDQuMTc0MDcgOS40OTM3MSA0LjQzMjY4IDkuNDc1MTYgNC43MjgxOEw5LjIzNTA1IDExLjI4NDlDOS4yMTY2MSAxMS41ODA0IDguOTc2NSAxMS44MjA1IDguNjgwOTcgMTEuODIwNUg4LjY2MjU0QzguMzQ4NTEgMTEuODAyIDguMTA4NDYgMTEuNTYxOSA4LjEyNjg5IDExLjI0NzlMOC4zNjcgNC42OTEyNVpNNy4zMzI0NiA0LjcwOTU2VjExLjI2NjNDNy4zMzI0NiAxMS41ODAzIDcuMDkyMzUgMTEuODIwMyA2Ljc3ODM4IDExLjgyMDNDNi40NjQ0MiAxMS44MjAzIDYuMjI0MyAxMS41ODAyIDYuMjI0MyAxMS4yNjYyVjQuNzA5NTZDNi4yMjQzIDQuMzk1NiA2LjQ2NDQyIDQuMTU1NDkgNi43NzgzOCA0LjE1NTQ5QzcuMDkyMzUgNC4xNTU0OSA3LjMzMjQ2IDQuMzk1NTcgNy4zMzI0NiA0LjcwOTU2WiIgZmlsbD0iI0YzNUI1QiIvPjwvc3ZnPg=="/>';
      forkIcon =
        '<img class="icon" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOSIgaGVpZ2h0PSIxNCIgdmlld0JveD0iMCAwIDkgMTQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTguNTkwMzQgMy40OTAwMUM4LjU5MDM0IDIuNjE5MDcgNy44ODIxOCAxLjkxMDQ5IDcuMDEwODMgMS45MTA0OUM2LjEzOTQ3IDEuOTEwNDkgNS40MzE3MiAyLjYxOTA3IDUuNDMxNzIgMy40OTAwMUM1LjQzMTcyIDMuOTAyMTcgNS41OTQwOSA0LjI3NDc3IDUuODUzNDYgNC41NTYyQzUuNjU2MTIgNS4zOTA1MSA1LjE3MTExIDUuNTUyNDYgNC4xMTg2NSA1LjgxNzI0QzMuNTg2MTggNS45NTEyOSAyLjk3MjUyIDYuMTA4NjYgMi40MTIxNiA2LjQ0MjEzVjIuOTE1NDlDMi44NTg0NSAyLjYzNjE0IDMuMTU4NjIgMi4xNDM2MyAzLjE1ODYyIDEuNTc5NTJDMy4xNTg2MiAwLjcwODU3NiAyLjQ1MDA0IDAgMS41Nzk5MyAwQzAuNzA4NTc2IDAgMCAwLjcwODU3NiAwIDEuNTc5NTJDMCAyLjE0NDA1IDAuMzAwNTgzIDIuNjM2NTUgMC43NDcyOTQgMi45MTU5VjExLjA4NDFDMC4zMDA1ODMgMTEuMzYzNCAwIDExLjg1NiAwIDEyLjQyMDVDMCAxMy4yOTE0IDAuNzA4NTc2IDE0IDEuNTc5OTMgMTRDMi40NTA4NyAxNCAzLjE1OTAzIDEzLjI5MTQgMy4xNTkwMyAxMi40MjA1QzMuMTU5MDMgMTEuODU2NCAyLjg1ODQ1IDExLjM2MzQgMi40MTI1NyAxMS4wODQ1VjkuNDgzMzVDMi42MTkwNyA3LjkxNDY1IDMuMzc4ODUgNy43MjE0OCA0LjUyNTQgNy40MzI1NkM1LjU3NzQ0IDcuMTY3MzYgNy4wMDQ1OCA2LjgwMjY3IDcuNDU5NjIgNC45OTYyNUM4LjExMTU3IDQuODAyMjUgOC41OTAzNCA0LjIwNDQxIDguNTkwMzQgMy40OTAwMVpNMS41Nzk5MyAwLjgzMzQ3MkMxLjk5MTI2IDAuODMzNDcyIDIuMzI2MzkgMS4xNjg2MSAyLjMyNjM5IDEuNTgwMzVDMi4zMjYzOSAxLjk5MjA5IDEuOTkwODQgMi4zMjY4MSAxLjU3OTkzIDIuMzI2ODFDMS4xNjgxOSAyLjMyNjgxIDAuODMyNjM5IDEuOTkxNjcgMC44MzI2MzkgMS41ODAzNUMwLjgzMzA1NiAxLjE2ODE5IDEuMTY3NzggMC44MzM0NzIgMS41Nzk5MyAwLjgzMzQ3MlpNMS41Nzk5MyAxMy4xNjY5QzEuMTY4MTkgMTMuMTY2OSAwLjgzMjYzOSAxMi44MzEgMC44MzI2MzkgMTIuNDIwMUMwLjgzMjYzOSAxMi4wMDgzIDEuMTY4MTkgMTEuNjczNiAxLjU3OTkzIDExLjY3MzZDMS45OTEyNiAxMS42NzM2IDIuMzI2MzkgMTIuMDA5MiAyLjMyNjM5IDEyLjQyMDFDMi4zMjYzOSAxMi44MzI2IDEuOTkxMjYgMTMuMTY2OSAxLjU3OTkzIDEzLjE2NjlaTTcuMDEwODMgNC4yMzY4OUM2LjU5OTA4IDQuMjM2ODkgNi4yNjQzNiAzLjkwMTc1IDYuMjY0MzYgMy40OTA0MkM2LjI2NDM2IDMuMDc4NjggNi41OTk5MiAyLjc0MzU1IDcuMDEwODMgMi43NDM1NUM3LjQyMjE1IDIuNzQzNTUgNy43NTc3IDMuMDc4NjggNy43NTc3IDMuNDkwNDJDNy43NTc3IDMuOTAyMTYgNy40MjI5OCA0LjIzNjg5IDcuMDEwODMgNC4yMzY4OVoiIGZpbGw9IiM0OEMxNUYiLz48L3N2Zz4="/>';
      starIcon =
        '<img class="icon" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUuOTg1OSA1LjgwMjM1QzE1Ljk1MjEgNS42OTg2NyAxNS44NjI1IDUuNjIzMDcgMTUuNzU0NSA1LjYwNzMxTDEwLjU3MzYgNC44NTQzOEw4LjI1NjY5IDAuMTU5ODA4QzguMjA4NTcgMC4wNjE4NjEyIDguMTA4OTEgMCA4LjAwMDA4IDBDNy44OTEyNSAwIDcuNzkxMyAwLjA2MTg2MTIgNy43NDM0NyAwLjE1OTgwOEw1LjQyNjI1IDQuODU0NjdMMC4yNDUzNzcgNS42MDc2QzAuMTM3NDA3IDUuNjIzMzUgMC4wNDgwNTE3IDUuNjk4NjcgMC4wMTM5NzA3IDUuODAyNjRDLTAuMDE5NTM3NCA1LjkwNjAyIDAuMDA4MjQyODQgNi4wMjAwMSAwLjA4NjQyODUgNi4wOTU5TDMuODM1NjIgOS43NTAzTDIuOTUwMzcgMTQuOTEwNUMyLjkzMjA0IDE1LjAxNzkgMi45NzYxNSAxNS4xMjY1IDMuMDY0MDcgMTUuMTkwNkMzLjE1MjU3IDE1LjI1NTQgMy4yNjk3IDE1LjI2MzcgMy4zNjU2NCAxNS4yMTI0TDguMDAwMDggMTIuNzc2M0wxMi42MzM5IDE1LjIxMjRDMTIuNjc1OCAxNS4yMzQ1IDEyLjcyMTkgMTUuMjQ1MyAxMi43Njc0IDE1LjI0NTNDMTIuODI2NyAxNS4yNDUzIDEyLjg4NTcgMTUuMjI3IDEyLjkzNTggMTUuMTkwNkMxMy4wMjQgMTUuMTI2NSAxMy4wNjgxIDE1LjAxNzkgMTMuMDQ5NSAxNC45MTA1TDEyLjE2NDUgOS43NTA1OEwxNS45MTM3IDYuMDk1OUMxNS45OTE2IDYuMDE5NDQgMTYuMDE5NyA1LjkwNTc0IDE1Ljk4NTkgNS44MDIzNVoiIGZpbGw9IiNGRkE4MEQiLz48L3N2Zz4="/>';
      switch (activity.type) {
        case "PushEvent":
          //say pushed 1 commit in case of single commit, otherwise say commits
          let commit = "commit";
          if (activity.payload.size > 1) {
            commit += "s";
          }
          //if event is pushed
          stmnt =
            createIcon +
            "Pushed " +
            activity.payload.size +
            " " +
            commit +
            " to " +
            repoURL;
          break;
        case "WatchEvent":
          stmnt = starIcon + "Starred a repo " + repoURL;
          break;
        case "CreateEvent":
          if (activity.payload.ref_type === "branch") {
            stmnt = forkIcon;
          } else {
            stmnt = createIcon;
          }
          stmnt += "Created a " + activity.payload.ref_type + " ";
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
            deleteIcon +
            "Deleted a " +
            activity.payload.ref_type +
            " " +
            activity.payload.ref +
            " from " +
            repoURL;
          break;
        case "ForkEvent":
          stmnt =
            forkIcon +
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
          if (activity.payload.action === "closed") {
            stmnt = deleteIcon;
          } else {
            stmnt = createIcon;
          }
          stmnt +=
            activity.payload.action.charAt(0).toUpperCase() +
            activity.payload.action.slice(1) +
            " a " +
            '<a href="' +
            activity.payload.pull_request.html_url +
            '">' +
            " pull request " +
            "</a>" +
            " in " +
            repoURL;
          break;
        case "PullRequestReviewCommentEvent":
          stmnt =
            commentIcon +
            activity.payload.action.charAt(0).toUpperCase() +
            activity.payload.action.slice(1) +
            " a " +
            '<a href="' +
            activity.payload.comment.html_url +
            '">' +
            "comment" +
            "</a>" +
            " on their pull request in " +
            repoURL;
          break;
        case "IssuesEvent":
          if (activity.payload.action === "closed") {
            stmnt = deleteIcon;
          } else {
            stmnt = createIcon;
          }
          stmnt +=
            activity.payload.action.charAt(0).toUpperCase() +
            activity.payload.action.slice(1) +
            " an " +
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
            commentIcon +
            activity.payload.action.charAt(0).toUpperCase() +
            activity.payload.action.slice(1) +
            " " +
            '<a href="' +
            activity.payload.comment.html_url +
            '">' +
            "a comment" +
            "</a>" +
            " on an issue in " +
            repoURL;
          break;
        default:
          console.log(activity.type);
          return false;
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
          line-height: 1.5em;
          color: #666666;
          margin-right: 0.5em;
        }
        .time {
          font-size: 1em;
          letter-spacing: 0.01em;
          color: #cccccc;
          margin-left: 0.5em;
          line-height: 1.5em;
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
    max-width: 980px;
    margin: 0 auto;
    .main {
      display: flex;
      flex-direction: row;
      aside {
        margin-right: 2%;
        width: 28%;
        min-width: 240px;
      }
      section {
        width: 70%;
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