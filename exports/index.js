// @ts-check

/**
 * @typedef {object} Replacement
 * @property {string | RegExp} pattern
 * @property {string | Parameters<String["replace"]>[1]} replacement

 */

/**
 * @typedef {Object} Options
 * @property {Replacement[]} replacements
 */

/**
 * This isn't a real ASTNode from Remark, I'm just faking it.
 * @typedef {Object} ASTNode
 * @property {string} type
 * @property {string} url
 * @property {string} value
 * @property {ASTNode[]} children
 */

/**
 *
 * @template {Options} T
 * @param {T} options
 *
 * @example
 *   remarkPlugins: [
 *     RemarkPluginFindAndReplace({
 *       // List your find and replace values. Both values must be strings.
 *       // This is required.
 *       replacements: [
 *         {
 *           pattern: "%VERSION%",
 *           replacement: "2.6.2"
 *         },
 *         {
 *           // When using Regex, make sure to include the `//g` flag for global substitution.
 *           pattern: /Company/g,
 *           replacement: "Web Awesome"
 *         },
 *         {
 *           pattern: /SECRET: (\w*?)/ig,
 *           replacement: function (match, p1, offset, string) {
 *             return secrets.web[p1];
 *           }
 *         },
 *       ],
 *     })
 *   ]
 */
export function RemarkPluginFindAndReplace (options) {
  if (options == null) {
    console.error("[RemarkPluginFindAndReplace]: No replacements provided")
    return () => {}
  }

  if (options.replacements == null || options.replacements.length <= 0) {
    console.error("[RemarkPluginFindAndReplace]: No replacements provided")
    return () => {}
  }

  /**
   * @param {string | RegExp} strOrRegex
   */
  function toRegExp (strOrRegex) {
    let regExp = RegExp("")

    if (!(strOrRegex instanceof RegExp)) {
      // Assumed global flags
      regExp = RegExp(strOrRegex, "g")
    } else {
      regExp = strOrRegex
    }

    return regExp
  }

  // Turn strings to regex
  const replacements = options.replacements.map(({pattern, replacement}) => {
    return {pattern: toRegExp(pattern), replacement}
  })

  const processableNodes = ['text', 'html', 'code', 'inlineCode', 'link']

  /**
   * @param {ASTNode} node
   */
  function transformNode (node) {
    let processedText = ""
    if (node.type === 'link') {
      // For links, the text value is replaced by text node, so we change the
      // URL value.
      processedText = node.url
      // @ts-expect-error
      replacements.forEach(({ pattern, replacement }) => processedText = processedText.replace(pattern, replacement))
      node.url = processedText
    } else {
      // For all other nodes, replace the node value.
      processedText = node.value
      // @ts-expect-error
      replacements.forEach(({ pattern, replacement }) => processedText = processedText.replace(pattern, replacement))
      node.value = processedText
    }
  }

  return function () {
    /**
     * @param {ASTNode} tree
     * @param {any} _file
     */
    return function recurseTree(tree, _file) {
      if (!tree) return
      if (!tree.children) return

      // Go through all text, html, code, inline code, and links.
      tree.children.forEach((node) => {
        if (!processableNodes.includes(node.type)) return
        if (node.type === "link" && node.url) {
          transformNode(node)
        } else if (node.value) {
          transformNode(node)
        }
      })
    }
  }
}
