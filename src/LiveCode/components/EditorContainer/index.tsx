import React, { useContext, useState } from 'react'

import { Editor } from './Editor'
import { FileSelector } from './FileSelector'
import { Message } from '../Message'

import { LiveCodeContext } from '@/LiveCode/LiveCodeContext'
import type { IEditorContainer } from '@/LiveCode/types'
import { debounce } from '@/LiveCode/utils'

export const EditorContainer: React.FC<IEditorContainer> = (props) => {
  const { showFileSelector, fileSelectorReadOnly, options = {} } = props
  const { files, setFiles, selectedFileName, setSelectedFileName } = useContext(LiveCodeContext)
  const [error, setError] = useState('')
  const file = files[selectedFileName] || {}

  const handleEditorChange = debounce((value: string) => {
    files[file.name].value = value
    setFiles({ ...files })
  }, 250)

  const handleTabsChange = (fileName: string) => {
    setSelectedFileName(fileName)
  }

  const handleTabsError = (msg: string) => {
    setError(msg)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {showFileSelector ? (
        <FileSelector
          onChange={handleTabsChange}
          onError={handleTabsError}
          readOnly={fileSelectorReadOnly}
        />
      ) : null}

      <Editor onChange={handleEditorChange} file={file} options={options} />
      <Message type='error' context={error} />
    </div>
  )
}
