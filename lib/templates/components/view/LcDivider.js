import contentElementMixin from '../../mixins/contentElementMixin'
import {classNameHandler} from './helpers/layoutHeaderHelper'
import unshiftBgContainer from './helpers/unshiftBgContainer'

/**
 *
 * @typedef {Object} DividerProperties
 * @property {string} icon
 * @property {string} iconSize
 */
/**
 *
 * @typedef {Object} RootStyles
 * @property {string} backgroundClassNames
 * @property {string} backgroundHeaderClassNames
 * @property {string} rootClassNames
 * @property {string} contentClassNames
 * @property {string} headerClassNames
 */

export default {
  name: 'LcDivider',
  mixins: [contentElementMixin],
  render (h) {
    const children = this.$slots.default
    const props = this.$props
    const content = props.content
    /**
     *
     * @type RootStyles
     */
    const styles = content.styles || {}
    /**
     *
     * @type DividerProperties
     */
    const properties = content.properties || {}
    const classNames = {
      'h-separator': true,
      'mt-4': !styles.rootClassNames,
      'mb-4': !styles.rootClassNames,
      'h-separator-icon': !!properties.icon,
      'divider': !properties.icon
    }
    const attrs = {
      'data-id': props.id
    }
    const childItems = []

    styles.rootClassNames && classNameHandler(classNames, styles.rootClassNames)

    if (properties.icon) {
      if (properties.iconSize) classNames[properties.iconSize] = true
      childItems.push(
        h('span', {}, [
          h('v-icon', {
            'class': {
              'v-icon--medium': properties.iconSize === 'Medium',
              'v-icon--large': properties.iconSize === 'Large',
              'v-icon--x-large': properties.iconSize === 'XLarge',
              'v-icon--x-x-large': properties.iconSize === 'XXLarge',
              'v-icon--x-x-x-large': properties.iconSize === 'XXXLarge'
            }
          }, properties.icon)
        ])
      )
      unshiftBgContainer(h, childItems, styles.backgroundClassNames)
    }

    return h('div', {
      'class': classNames, attrs
    }, [children, h('div', {}, [
      h(properties.icon ? 'div' : 'span', {}, childItems)
    ])])
  }
}
