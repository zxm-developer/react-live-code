import React, { useContext, useState } from 'react'
// @ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { downloadFiles, icons } from './utils'

import styles from './index.module.less'

import { LiveCodeContext } from '@/LiveCode/LiveCodeContext'

export const Header: React.FC = () => {
  const { files, theme, changeTheme, filesHash } = useContext(LiveCodeContext)
  const [copyed, setCopyed] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const shareUrl =
    window.self !== window.top
      ? `${window.parent.location.host}${window.parent.location.pathname}#${filesHash}`
      : `${location.host}${location.pathname}#${filesHash}`

  const copyLink = () => {
    setCopyed(true)
    setTimeout(() => {
      setCopyed(false)
    }, 3000)
  }

  const downloadProject = () => {
    downloadFiles(files).then(() => {
      setDownloaded(true)
      setTimeout(() => {
        setDownloaded(false)
      }, 3000)
    })
  }

  return (
    <nav className={styles.header}>
      <div className={styles.logo}>
        <span>React LiveCode</span>
      </div>
      <div className={styles.links}>
        {theme === 'light' && (
          <button
            title='Toggle dark mode'
            className={styles.theme}
            dangerouslySetInnerHTML={{ __html: icons.SunSvg }}
            onClick={() => changeTheme('dark')}
          />
        )}
        {theme === 'dark' && (
          <button
            title='Toggle light mode'
            className={styles.theme}
            dangerouslySetInnerHTML={{ __html: icons.MoonSvg }}
            onClick={() => changeTheme('light')}
          />
        )}

        <CopyToClipboard text={shareUrl} onCopy={copyLink}>
          <button
            title='Copy sharable URL'
            dangerouslySetInnerHTML={{ __html: copyed ? icons.SuccessSvg : icons.ShareSvg }}
            onClick={copyLink}
          />
        </CopyToClipboard>

        <button
          title='Download project files'
          dangerouslySetInnerHTML={{ __html: downloaded ? icons.SuccessSvg : icons.DownloadSvg }}
          onClick={downloadProject}
        />

      </div>
    </nav>
  )
}
