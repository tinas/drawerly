// @ts-check
import fs from 'node:fs/promises'
import path from 'node:path'
import { Application, PageEvent, TSConfigReader } from 'typedoc'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

/** @satisfies {Partial<import('typedoc').TypeDocOptions & import('typedoc-plugin-markdown').PluginOptions>} */
const DEFAULT_OPTIONS = {
  cleanOutputDir: true,
  excludeInternal: true,
  out: path.resolve(__dirname, './api'),
  entryFileName: 'index.md',
  preserveAnchorCasing: true,
}

/**
 * @param {Partial<import('typedoc').TypeDocOptions>} config
 */
export async function createTypeDocApp(config = {}) {
  const options = { ...DEFAULT_OPTIONS, ...config }

  const app = await Application.bootstrapWithPlugins(options)
  app.options.addReader(new TSConfigReader())

  app.renderer.on(
    PageEvent.END,
    /** @param {import('typedoc').PageEvent} page */
    (page) => {
      if (!page.contents)
        return
      page.contents = prependYAML(page.contents, { editLink: false })
    },
  )

  async function serve() {
    app.convertAndWatch(handleProject)
  }

  async function build() {
    if (
      (await exists(options.out))
      && (await fs.stat(options.out)).isDirectory()
    ) {
      await fs.rm(options.out, { recursive: true })
    }
    const project = await app.convert()
    return handleProject(project)
  }

  /** @param {import('typedoc').ProjectReflection | undefined} project */
  async function handleProject(project) {
    if (project) {
      try {
        await app.generateOutputs(project)
        app.logger.info(`generated at ${options.out}.`)
      }
      catch (error) {
        app.logger.error(error instanceof Error ? error.message : String(error))
      }
    }
    else {
      app.logger.error('No project')
    }
  }

  return { build, serve }
}

/** @param {string} p */
async function exists(p) {
  try {
    await fs.access(p)
    return true
  }
  catch {
    return false
  }
}

/** @typedef {Record<string, string | number | boolean>} FrontMatterVars */

/**
 * @param {string} contents
 * @param {FrontMatterVars} vars
 */
function prependYAML(contents, vars) {
  return contents
    .replace(/^/, `${toYAML(vars)}\n\n`)
    .replace(/[\r\n]{3,}/g, '\n\n')
}

/** @param {FrontMatterVars} vars */
function toYAML(vars) {
  const body = Object.entries(vars)
    .map(([key, value]) =>
      `${key}: ${typeof value === 'string' ? `"${escapeDoubleQuotes(value)}"` : value}`,
    )
    .join('\n')
  return `---\n${body}\n---`
}

/** @param {string} str */
function escapeDoubleQuotes(str) {
  return str.replace(/"/g, '\\"')
}
