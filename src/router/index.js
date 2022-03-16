import Vue from 'vue'
import VueRouter from 'vue-router'

import Top from '../components/Top'
import Moderator from "../components/Moderator"
import Publisher from "../components/Publisher"
import Subscriber from "../components/Subscriber"

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: [
    {
      path: "/",
      name: "top",
      component: Top
    },
    {
      path: "/moderator", 
      name: "moderator",
      component: Moderator,
      props: true
    },
    {
      path: "/publisher", 
      name: "publisher",
      component: Publisher,
      props: true
    },
    {
      path: "/subscriber", 
      name: "subscriber",
      component: Subscriber,
      props: true
    },
  ]
})
