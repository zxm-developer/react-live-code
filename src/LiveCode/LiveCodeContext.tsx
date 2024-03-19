import React, { createContext, useEffect, useState } from 'react'

import { MAIN_FILE_NAME } from './files'
import { fileName2Language, setLiveCodeTheme, utoa } from './utils'

import type { IFiles, ILiveCodeContext, ITheme } from './types'

const initialContext: Partial<ILiveCodeContext> = {
  selectedFileName: MAIN_FILE_NAME,
}

export const LiveCodeContext = createContext<ILiveCodeContext>(
  initialContext as ILiveCodeContext
)

export const LiveCodeProvider = (props: {
  children: React.ReactElement
  saveOnUrl?: boolean
}) => {
  const { children, saveOnUrl = true } = props

  const [files, setFiles] = useState<IFiles>({})
  const [theme, setTheme] = useState(initialContext.theme!)
  const [selectedFileName, setSelectedFileName] = useState(initialContext.selectedFileName!)
  const [filesHash, setFilesHash] = useState('')

  const addFile = (name: string) => {
    files[name] = {
      name,
      language: fileName2Language(name),
      value: '',
    }
    setFiles({ ...files })
  }

  const removeFile = (name: string) => {
    delete files[name]
    setFiles({ ...files })
  }

  const updateFileName = (oldFieldName: string, newFieldName: string) => {
    if (!files[oldFieldName] || newFieldName === undefined || newFieldName === null) return
    const { [oldFieldName]: value, ...rest } = files
    const newFile = {
      [newFieldName]: {
        ...value,
        language: fileName2Language(newFieldName),
        name: newFieldName,
      },
    }
    setFiles({
      ...rest,
      ...newFile,
    })
  }

  const changeTheme = (theme: ITheme) => {
    setLiveCodeTheme(theme)
    setTheme(theme)
  }

  useEffect(() => {
    const hash = utoa(JSON.stringify(files))
    if (saveOnUrl) window.location.hash = hash
    setFilesHash(hash)
  }, [files])

  return (
    <LiveCodeContext.Provider
      value={{
        theme,
        filesHash,
        files,
        selectedFileName,
        setTheme,
        changeTheme,
        setSelectedFileName,
        setFiles,
        addFile,
        removeFile,
        updateFileName,
      }}
    >
      {children}
    </LiveCodeContext.Provider>
  )
}
