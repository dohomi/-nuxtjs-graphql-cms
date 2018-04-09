import Vue from 'vue'

const components = {
  LcVueRenderer: () => import(/* webpackChunkName: 'content-chunk' */ '~cms/components/core/LcVueRenderer.js'),
  LcHtmlRenderer: () => import(/* webpackChunkName: 'content-chunk' */ '~cms/components/core/LcHtmlRenderer.js'),
  LcExpansionPanelMenu: () => import(/* webpackChunkName: 'content-chunk' */ '~cms/components/core/navigation/LcExpansionPanelMenu.js').then(),
  LcExpansionPanelMenuItem: () => import(/* webpackChunkName: 'content-chunk' */ '~cms/components/core/navigation/LcExpansionPanelMenuItem')
}

  <% Object.keys(options).forEach((key) => {%>
    components['<%= key %>'] = () => import('<%= options[key] %>')
  <% }) %>

Object.keys(components).forEach(comp => {
  Vue.component(comp, components[comp])
})
