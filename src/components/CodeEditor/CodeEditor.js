import CodeEditor from '@uiw/react-textarea-code-editor';

export default function CodeEditor2({onChange, padding, value, style, placeholder, disabled}) {
  
    return (
        <>
        {!disabled && <CodeEditor
            value={value}
            language="js"
            placeholder={placeholder || "You can now write some JS code..."}
            onChange={onChange}
            padding={padding || 15}
            
            style={{
                fontSize: 14,
                backgroundColor: "#f5f5f5",
                color : "#333",
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                minHeight : "500px",
                border : "1px solid #dedede",
                ...style
            }}
        />}
        {disabled && <CodeEditor
            value={value}
            language="js"
            placeholder={placeholder || "You can now write some JS code..."}
            onChange={onChange}
            padding={padding || 15}
            disabled
            style={{
                fontSize: 14,
                backgroundColor: "#f5f5f5",
                color : "#333",
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                minHeight : "500px",
                border : "1px solid #dedede",
                ...style
            }}
        />}
        </>
    );
}