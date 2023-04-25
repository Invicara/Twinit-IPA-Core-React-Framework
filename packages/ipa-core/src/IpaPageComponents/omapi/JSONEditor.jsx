import React from "react";
import {Controlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/comment-fold.js'
import 'codemirror/addon/comment/comment.js'
import './monokai-sublime.css'

export const JSONEditor = ({jsonValue, readonly, onChange}) => {

  return <CodeMirror
    value={jsonValue}
    options={{
      mode: {
        name: 'javascript',
        json: true
      },
      dragDrop: false,
      readOnly: readonly,
      theme: 'monokai-sublime',
      lineNumbers: true,
      // matchBrackets: true,
      autoCloseBrackets: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
    }}
    onBeforeChange={onChange}
  />
}