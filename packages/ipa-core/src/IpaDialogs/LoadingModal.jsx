import React from 'react'
import { LinearProgress } from '@mui/material'
import { Dialog } from '@dtplatform/ipa-ui'

import './LoadingModal.scss'

const LoadingModal = ({
  title = '',
  description = '',
  hideOverlay = false,
  ...dialogProps
}) => (
  <Dialog
    title=""
    open={true}
    disableCloseButton
    disableClickOutside
    disableEscapeKey
    hideOverlay={hideOverlay}
    styleOverrides={{
      content: 'loading-modal-dialog-content',
      header: 'dialog-header',
      title: 'dialog-title',
      body: 'dialog-body'
    }}
    {...dialogProps}
    children={
      <div className="ipa-loading-modal">
        {title ? <h2 className="loading-modal-title">{title}</h2> : null}
        {description ? (
          <p className="loading-modal-description">{description}</p>
        ) : null}
        <LinearProgress
          variant="indeterminate"
          className="loading-modal-progress"
          sx={{
            height: 4,
            backgroundColor: 'var(--neutral-2, #e0e0e0)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'var(--app-accent-color)',
            },
          }}
        />
      </div>
    }
  />
)

export default LoadingModal
