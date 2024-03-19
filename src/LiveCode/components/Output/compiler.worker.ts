import { transform } from '@babel/standalone'

import { getModuleFile, cssLoader, jsonLoader, beforeTransformCodeHandler } from './utils'

import { ENTRY_FILE_NAME, MAIN_FILE_NAME } from '@/LiveCode/files'
import type { IFiles } from '@/LiveCode/types'

const babelTransform = (filename: string, code: string, files: IFiles) => {
  const _code = beforeTransformCodeHandler(filename, code)
  let result = ''
  try {
    result = transform(_code, {
      presets: ['react', 'typescript'],
      filename,
      plugins: [customResolver(files)],
    }).code!
  } catch (e) {
    self.postMessage({ type: 'ERROR', error: e })
  }
  return result
}

async function replaceHttpWithBlob(text: string) {
  const regex = /(http[^\s]+)/g
  const matchedUrls = text.match(regex)

  if (matchedUrls) {
    for (let url of matchedUrls) {
      url = url.substring(0, url.length - 1)
      if (url.endsWith('.css')) {
        const blobUrl = cssLoader({
          value: await fetchCss(url),
          name: url,
        })
        text = text.replace(url, blobUrl)
      }
    }
  }
  return text
}

function fetchCss(url: string) {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.text() // 将响应转换为文本
    })
    .then((cssText) => {
      return cssText
    })
}

const customResolver = (files: IFiles) => {
  return {
    visitor: {
      async ImportDeclaration(path: any) {
        const moduleName: string = path.node.source.value
        if (moduleName.startsWith('.')) {
          const module = getModuleFile(files, moduleName)
          if (!module) return
          if (module.name.endsWith('.css')) {
            path.node.source.value = cssLoader(module)
          } else if (module.name.endsWith('.json')) {
            path.node.source.value = jsonLoader(module)
          } else {
            path.node.source.value = URL.createObjectURL(
              new Blob([babelTransform(module.name, module.value, files)], {
                type: 'application/javascript',
              })
            )
          }
        }
      },
    },
  }
}

const compile = (files: IFiles) => {
  const main = files[ENTRY_FILE_NAME]
  const compileCode = babelTransform(ENTRY_FILE_NAME, main.value, files)
  return { compileCode }
}

self.addEventListener('message', async ({ data }) => {
  try {
    if (typeof data === 'string') {
      self.postMessage({
        type: 'UPDATE_FILE',
        data: transform(data, {
          presets: ['react', 'typescript'],
          retainLines: true,
          filename: 'tempFileName',
        }).code,
      })
      return
    }
    const _data = JSON.parse(JSON.stringify(data))
    _data[MAIN_FILE_NAME].value = await replaceHttpWithBlob(_data[MAIN_FILE_NAME].value)
    const value = compile(_data)
    self.postMessage({
      type: 'UPDATE_FILES',
      data: value,
    })
  } catch (e) {
    self.postMessage({ type: 'ERROR', error: e })
  }
})
