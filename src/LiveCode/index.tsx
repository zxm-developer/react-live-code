import React, { useContext, useEffect } from 'react'

import { EditorContainer } from './components/EditorContainer'
import { Header } from './components/Header'
import { Output } from './components/Output'
import { Sandbox } from './components/Sandbox'
import SplitView from './components/SplitView'
import { ENTRY_FILE_NAME, initFiles, MAIN_FILE_NAME } from './files'
import { LiveCodeContext, LiveCodeProvider } from './LiveCodeContext'
import { getCustomActiveFile, getMergedCustomFiles, getLiveCodeTheme } from './utils'

import type { ILiveCode } from './types'

import './index.less'

const defaultCodeSandboxOptions = {
  theme: 'dark',
  editorHeight: '100vh',
  showUrlHash: true,
}

const ReactLiveCode = (props: ILiveCode) => {
  const {
    width = '100vw',
    height = '100vh',
    theme,
    files: propsFiles,
    importMap,
    showCompileOutput = true,
    showHeader = true,
    showFileSelector = true,
    fileSelectorReadOnly = false,
    border = false,
    defaultSizes,
    onFilesChange,
    autorun = true,
  } = props
  const { filesHash, changeTheme, files, setFiles, setSelectedFileName } =
    useContext(LiveCodeContext)
  const options = Object.assign(defaultCodeSandboxOptions, props.options || {})

  useEffect(() => {
    if (propsFiles && !propsFiles?.[MAIN_FILE_NAME]) {
      throw new Error(
        `Missing required property : '${MAIN_FILE_NAME}' is a mandatory property for 'files'`
      )
    } else if (propsFiles) {
      const newFiles = getMergedCustomFiles(propsFiles, importMap)
      if (newFiles) setFiles(newFiles)
      const selectedFileName = getCustomActiveFile(propsFiles)
      if (selectedFileName) setSelectedFileName(selectedFileName)
    }
  }, [propsFiles])

  useEffect(() => {
    onFilesChange?.(filesHash)
  }, [filesHash])

  useEffect(() => {
    setTimeout(() => {
      if (!theme) {
        changeTheme(getLiveCodeTheme())
      } else {
        changeTheme(theme)
      }
    }, 15)
  }, [theme])

  useEffect(() => {
    if (!propsFiles) setFiles(initFiles)
  }, [])

  return files[ENTRY_FILE_NAME] ? (
    <div
      data-id='live-code'
      className={theme}
      style={{
        width,
        height,
        boxSizing: 'border-box',
        border: border ? '1px solid var(--border)' : '',
      }}
    >
      {showHeader && <Header />}
      <div style={{ height: `calc(100% - ${showHeader ? 50 : 0}px)` }}>
        <SplitView defaultSizes={defaultSizes}>
          <EditorContainer
            options={options}
            showFileSelector={showFileSelector}
            fileSelectorReadOnly={fileSelectorReadOnly}
          />
          {autorun ? <Output showCompileOutput={showCompileOutput} /> : null}
        </SplitView>
      </div>
    </div>
  ) : null
}

export const LiveCode: React.FC<ILiveCode> = (props) => {
  return (
    <LiveCodeProvider saveOnUrl={props.saveOnUrl}>
      <ReactLiveCode {...props} />
    </LiveCodeProvider>
  )
}

export const LiveCodeSandbox = Sandbox
