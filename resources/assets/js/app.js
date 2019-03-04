import Vue from "vue";
import Vuetify from "vuetify";
import Layout from "./components/Layout.vue";
window.Vue = Vue;
Vue.use(Vuetify);

var app = new Vue({
  el: "#app",
  components: {
    "default-layout": Layout
  },
  data: {
    drawer: null,
    toolbarTitle: "Manage Voucher"
  }
});
