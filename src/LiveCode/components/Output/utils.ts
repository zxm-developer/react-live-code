import type { IFile, IFiles } from '@/LiveCode/types'

export const getModuleFile = (files: IFiles, moduleName: string) => {
  let _moduleName = moduleName.split('./').pop() || ''
  if (!_moduleName.includes('.')) {
    const realModuleName = Object.keys(files).find((key) => key.split('.').includes(_moduleName))
    if (realModuleName) _moduleName = realModuleName
  }
  return files[_moduleName]
}

export const jsonLoader = (file: IFile) => {
  const js = `export default ${file.value}`
  return URL.createObjectURL(new Blob([js], { type: 'application/javascript' }))
}

export const cssLoader = (file: IFile) => {
  const randomId = new Date().getTime()
  const js = `
                  (() => {
                      let  stylesheet = document.createElement('style')
                      stylesheet.setAttribute('id', 'style_${randomId}_${file.name}')
                      document.head.appendChild(stylesheet)
                      stylesheet.innerHTML = \`${file.value}\`
                  })()
                  `
  return URL.createObjectURL(new Blob([js], { type: 'application/javascript' }))
}

// 编辑前对代码处理
export const beforeTransformCodeHandler = (filename: string, code: string) => {
  let _code = code
  // 如果没有引入React，开头添加React引用
  const regexReact = /import\s+React/g
  if ((filename.endsWith('.jsx') || filename.endsWith('.tsx')) && !regexReact.test(code)) {
    _code = `import React from 'react';\n${code}`
  }
  return _code
}
