import {
  classNameHandler,
  layoutPanelHandler
} from './helpers/layoutHeaderHelper'
import layoutHeader from './partials/layoutHeader'
import imagePartial from './partials/imagePartial'
import imageLightboxItem from './partials/imageLightboxItem'
import imageGallery from './partials/imageGallery'
import {
  getImageSrc
} from '../../util/imageSrcHelper'
import unshiftBgContainer from './helpers/unshiftBgContainer'
import getImageSourceSet from '../../util/getImageSourceSet'
import contentElementMixin from '../../mixins/contentElementMixin'

const parallaxContainer = {
  Parallax: () => import(/* webpackChunkName: 'content-chunk' */'./partials/LcParallax'),
  Jumbotron: () => import(/* webpackChunkName: 'content-chunk' */'./partials/LcJumbotron'),
  FixedBackground: () => import(/* webpackChunkName: 'content-chunk' */'./partials/LcFixedBackgroundParallax')
}

/**
 *
 * @typedef {Object} TextImageProperties
 * @property {string} layoutPanel
 * @property {string} header
 * @property {string} headerLayout
 * @property {string} imageOrient
 * @property {string} imageColumnSize
 * @property {string} isLightbox
 * @property {string} styleAttributes
 */
/**
 *
 * @typedef {Object} TextImageStyles
 * @property {string} classNames
 * @property {string} classNamesBg
 */

export default {
  name: 'LcTextImage',
  mixins: [contentElementMixin],
  render (h) {
    const props = this.$props
    const {content, languageKey, arrayIndex} = props
    /**
     *
     * @type RootStyles
     */
    const styles = content.styles ? Object.assign({}, content.styles) : {}
    /**
     *
     * @type TextImageProperties
     */
    const properties = content.properties ? Object.assign({}, content.properties) : {}
    const {fileReferences, description} = content
    const {rootClassNames, backgroundClassNames} = styles
    // todo temporäry change const to let and make sure parallax is not in use due to vuetify bug
    let {layoutPanel, imageOrient, isLightbox} = properties
    // todo temporäry disable parallax due to vuetify bug
    if (layoutPanel === 'Parallax') {
      layoutPanel = 'FixedBackground'
    }

    const isBesideRightOrLeft = ['BesideTextRight', 'BesideTextLeft'].includes(imageOrient)
    const isInText = ['InTextLeft', 'InTextRight'].includes(imageOrient)
    const isParallaxOrJumbo = ['Parallax', 'Jumbotron', 'FixedBackground'].includes(layoutPanel)

    const fileRefLen = fileReferences && fileReferences.length
    const hasSingleFileRef = fileRefLen === 1

    const currentClass = {
      'content-text-image': true,
      // 'content-element': !(fileRefLen && imageOrient && description), // todo need to verify why we had this
      'content-element': true,
      'text-image': true,
      'image-floating': !!(!isBesideRightOrLeft && fileRefLen && description),
      'text-image__has-image': !!(hasSingleFileRef && description),
      'text-image__has-only-image': (hasSingleFileRef && !description),
      'image-floating-inside': !!(fileRefLen && imageOrient && description && isInText),
      'text-image__has-description': !!description,
      'zoom-enabled': !!properties.enableBackgroundZoom
    }
    currentClass[imageOrient] = fileRefLen && imageOrient && description && imageOrient

    const currentAttrs = {
      'data-id': props.id
    }
    // const childs = children ? [children, h(layoutHeader, {props: {content}})] : [h(layoutHeader, {props: {content}})]
    const childs = [h(layoutHeader, {
      props: {
        content
      }
    })]
    let elementDescription = null
    if (content.description) {
      elementDescription = isBesideRightOrLeft
        ? wrapFlex(h, [getElementDescription(h, content, props, 'pa-3')])
        : getElementDescription(h, content, props, '')
    }
    layoutPanelHandler(properties, currentClass)
    classNameHandler(currentClass, rootClassNames, !!(backgroundClassNames && backgroundClassNames.length))
    if (isParallaxOrJumbo) {
      const isFirstOfPage = arrayIndex === 0
      elementDescription && childs.push(elementDescription)
      // don't apply width options to the root element. this is handled in the child of jumbotron/parallax
      const ignoreClasses = ['content-boxed', 'content-fluid', 'max-width-900', 'max-width-700', 'max-width-auto']
      ignoreClasses.forEach(e => (currentClass[e] = false))
      let panelChilds = childs
      if (layoutPanel === 'FixedBackground') {
        unshiftBgContainer(h, panelChilds, backgroundClassNames)
        panelChilds = [h('v-container', {
          attrs: {
            'fill-height': true
          }
        }, [
          h('v-layout', {
            attrs: {
              column: true,
              'align-center': true,
              'justify-center': true
            },
            style: {
              position: 'relative'
            }
          }, childs)
        ])]
      }
      return h(parallaxContainer[layoutPanel], {
        props: {
          content,
          languageKey,
          isFirstOfPage,
          currentClass,
          isFixedBackground: layoutPanel === 'FixedBackground',
          currentAttrs,
          fileReference: content.fileReferences && content.fileReferences[0]
        }
      }, panelChilds)
    }

    const {lightboxDialog, carousel} = isLightbox ? getLightboxDialog(h, content, fileReferences) : {}
    const activateLightBox = isLightbox ? (itemNr) => {
      const hasItemNr = typeof itemNr === 'number'
      hasItemNr && (carousel.componentInstance.inputValue = itemNr)

      setTimeout(() => {
        lightboxDialog.componentInstance.isActive = true
      }, (hasItemNr && itemNr) > 0 ? 300 : 0) // prevent visible transition between first element and selected element

      const keydownHandler = (ev) => {
        ev.keyCode === 27 && (lightboxDialog.componentInstance.isActive = false)
        ev.key === 'ArrowRight' && carousel.componentInstance.next()
        ev.key === 'ArrowLeft' && carousel.componentInstance.prev()
      }

      document.addEventListener('keydown', keydownHandler)
      // first time open
      lightboxDialog.componentInstance.$once('input', (v1) => {
        // second time close - use once to prevent memory leak
        lightboxDialog.componentInstance.$once('input', (v2) => {
          v2 === false && document.removeEventListener('keydown', keydownHandler)
        })
      })
    } : null

    const figureProps = hasSingleFileRef ? Object.assign({}, content, {
      fileRef: fileReferences[0],
      activateLightBox,
      isLightbox,
      isLightboxThumb: isLightbox
    }) : Object.assign({}, content, {
      activateLightBox,
      isLightboxThumb: isLightbox
    })

    const figure = (fileRefLen) && getElementFigure(h, hasSingleFileRef ? imagePartial : imageGallery, figureProps)
    const elementFigure = figure && isBesideRightOrLeft ? wrapFlex(h, [figure]) : figure

    if (elementFigure && imageOrient === 'AboveHeader') {
      childs.unshift(elementFigure)
      elementDescription && childs.push(elementDescription)
    } else if (fileRefLen && description) {
      const renderFigureFirst = ['InTextLeft', 'BesideTextLeft', 'InTextRight', 'AboveCenter'].includes(imageOrient)
      const elementTextImg = renderFigureFirst ? [elementFigure, elementDescription] : [elementDescription, elementFigure]
      childs.push(isBesideRightOrLeft ? wrapLayoutRow(h, elementTextImg) : elementTextImg)
    } else {
      elementDescription && childs.push(elementDescription)
      elementFigure && childs.push(elementFigure)
    }
    unshiftBgContainer(h, childs, backgroundClassNames)

    isLightbox && childs.push(lightboxDialog)

    const opts = {
      class: currentClass,
      attrs: currentAttrs
    }
    if (properties.styleAttributes) {
      const styl = {}
      const splitted = properties.styleAttributes.split(';')
      splitted.forEach(i => {
        const tmp = i.split(':')
        styl[tmp[0]] = tmp[1]
      })
      opts.style = styl
    }
    return h('div', opts, childs)
  }
}

function wrapLayoutRow (h, element, staticClass) {
  return h('v-layout', {
    staticClass: staticClass || 'row wrap'
  }, element)
}

function wrapFlex (h, element, staticClass) {
  return h('v-flex', {
    staticClass: staticClass || 'xs12 sm6'
  }, element)
}

function getElementDescription (h, {styles, description, properties}, props, staticClass) {
  if (description) {
    const isParallaxOrJumbo = ['Parallax', 'Jumbotron'].includes(properties && properties.layoutPanel)
    const contentClassNames = styles.contentClassNames || []
    const classNames = isParallaxOrJumbo ? contentClassNames.concat(styles.rootClassNames) : contentClassNames

    return h('lc-html-renderer', {
      staticClass,
      props: {
        classNames: classNames && classNames.join(' '),
        content: description,
        languageKey: props.languageKey
      }
    })
  } else {
    return null
  }
}

function getElementFigure (h, component, content) {
  return h(component, {
    props: {
      content
    }
  })
}

function getLightboxDialog (h, content, fileReferences) {
  if (!fileReferences.length) return {}
  const hasSingleFileRef = fileReferences.length === 1
  let figure, carousel

  if (hasSingleFileRef) {
    figure = getElementFigure(h, imageLightboxItem, {
      fileRef: fileReferences[0],
      isLightbox: true
    })
  } else {
    const figures = []

    fileReferences.forEach((ref, i) => {
      const img = getImageSrc(ref.file)
      const {srcset, sizes} = getImageSourceSet(ref)
      const imageOpts = {
        staticClass: 'lazyload',
        attrs: {
          // 'src': img.src,
          'data-src': img.src,
          'data-srcset': srcset,
          'data-sizes': sizes
        }
      }
      if (ref.file.width && ref.file.height) {
        imageOpts.style = {
          'max-width': ref.file.width,
          'max-height': ref.file.height
        }
      }
      figures.push(h('v-carousel-item', {
        staticClass: 'text-xs-center',
        props: {
          transition: 'fade'
        },
        key: i
      }, [
        h('img', imageOpts)
      ]))
    })
    carousel = h('v-carousel', {
      attrs: {
        'hide-delimiters': true,
        cycle: false,
        dark: true
      }
    }, figures)
  }

  const dialogTitle = h('div', {
    staticClass: 'text-xs-right',
    on: {
      click () {
        lightboxDialog.componentInstance.isActive = false
      }
    }
  }, [
    h('v-spacer'),
    h('v-btn', {
      attrs: {
        flat: true,
        icon: true,
        dark: true,
        large: true,
        round: true
      }
    }, [
      h('v-icon', {}, 'close')
    ])
  ])
  const dialogChilds = [
    dialogTitle,
    h('v-card', {}, [
      h('v-card-text', {}, figure ? [figure] : [carousel])
    ])
  ]
  const lightboxDialog = h('v-dialog', {
    props: {},
    attrs: {
      'content-class': 'lightbox-dialog',
      'max-width': '100vw'
    }
  }, dialogChilds)

  return {
    lightboxDialog,
    carousel
  }
}
